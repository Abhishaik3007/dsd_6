import { collection, doc, getDocs, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

/**
 * Strips password fields from client-side localStorage caches
 */
export const scrubLocalStoragePasswords = () => {
  try {
    // 1. Institutes
    const instRaw = localStorage.getItem('signalschool_institutes_data');
    if (instRaw) {
      const institutes = JSON.parse(instRaw);
      if (Array.isArray(institutes)) {
        let modified = false;
        const cleaned = institutes.map(inst => {
          if (!inst) return inst;
          let instCopy = { ...inst };
          if ('adminPassword' in instCopy) {
            delete instCopy.adminPassword;
            modified = true;
          }
          if (Array.isArray(instCopy.members)) {
            instCopy.members = instCopy.members.map(m => {
              if (m && 'password' in m) {
                modified = true;
                const { password, ...mRest } = m;
                return mRest;
              }
              return m;
            });
          }
          return instCopy;
        });
        if (modified) {
          localStorage.setItem('signalschool_institutes_data', JSON.stringify(cleaned));
        }
      }
    }

    // 2. Super Admin
    const superAdminRaw = localStorage.getItem('signalschool_super_admin');
    if (superAdminRaw) {
      const sa = JSON.parse(superAdminRaw);
      if (sa && 'password' in sa) {
        delete sa.password;
        localStorage.setItem('signalschool_super_admin', JSON.stringify(sa));
      }
    }

    // 3. Current Auth User
    const authUserRaw = localStorage.getItem('signalschool_auth_user');
    if (authUserRaw) {
      const au = JSON.parse(authUserRaw);
      if (au && 'password' in au) {
        delete au.password;
        localStorage.setItem('signalschool_auth_user', JSON.stringify(au));
      }
    }

    // 4. Individual Users
    const indivRaw = localStorage.getItem('signalschool_individual_users');
    if (indivRaw) {
      const indivs = JSON.parse(indivRaw);
      if (Array.isArray(indivs)) {
        let modified = false;
        const cleaned = indivs.map(u => {
          if (u && 'password' in u) {
            modified = true;
            const { password, ...uRest } = u;
            return uRest;
          }
          return u;
        });
        if (modified) {
          localStorage.setItem('signalschool_individual_users', JSON.stringify(cleaned));
        }
      }
    }
  } catch (err) {
    console.warn('Notice: localStorage password scrub warning:', err);
  }
};

const SCRUB_STORAGE_KEY = 'signalschool_firestore_scrubbed_v2';
let hasRunScrub = false;

/**
 * Scans Firestore collections (institutes, users, system) and removes
 * any plaintext password fields using deleteField().
 * Executed non-blockingly with a delay so it never competes with initial load or login.
 */
export const purgePlaintextPasswordsFromFirestore = () => {
  if (!isFirebaseConfigured || hasRunScrub) return;
  hasRunScrub = true;

  // Clean local caches immediately (synchronous, 0ms)
  scrubLocalStoragePasswords();

  // If already scrubbed in this browser session, skip heavy Firestore collection scans
  try {
    if (localStorage.getItem(SCRUB_STORAGE_KEY)) {
      return;
    }
  } catch (_) {}

  // Defer collection scans by 4 seconds so the login flow and UI render with max speed
  setTimeout(async () => {
    try {
      // 1. Scrub institutes collection
      const institutesSnap = await getDocs(collection(db, 'institutes'));
      institutesSnap.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (!data) return;

        const hasAdminPassword = 'adminPassword' in data;
        const hasMemberPassword = Array.isArray(data.members) && data.members.some(m => m && 'password' in m);

        if (hasAdminPassword || hasMemberPassword) {
          const sanitizedMembers = Array.isArray(data.members)
            ? data.members.map(m => {
                if (!m) return m;
                const { password, ...safeMember } = m;
                return safeMember;
              })
            : [];

          try {
            await updateDoc(doc(db, 'institutes', docSnap.id), {
              adminPassword: deleteField(),
              members: sanitizedMembers,
              serverUpdatedAt: serverTimestamp()
            });
          } catch (err) {
            console.warn(`Notice: Failed to purge passwords from institute ${docSnap.id}:`, err);
          }
        }
      });

      // 2. Scrub system/super_admin
      const systemSuperAdminSnap = await getDocs(collection(db, 'system'));
      systemSuperAdminSnap.forEach(async (docSnap) => {
        if (docSnap.id === 'super_admin') {
          const data = docSnap.data();
          if (data && 'password' in data) {
            try {
              await updateDoc(doc(db, 'system', 'super_admin'), {
                password: deleteField(),
                serverUpdatedAt: serverTimestamp()
              });
            } catch (err) {
              console.warn('Notice: Failed to purge password from system/super_admin:', err);
            }
          }
        }
      });

      // 3. Scrub users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data && 'password' in data) {
          try {
            await updateDoc(doc(db, 'users', docSnap.id), {
              password: deleteField(),
              serverUpdatedAt: serverTimestamp()
            });
          } catch (err) {
            console.warn(`Notice: Failed to purge password from user ${docSnap.id}:`, err);
          }
        }
      });

      try {
        localStorage.setItem(SCRUB_STORAGE_KEY, 'true');
      } catch (_) {}
    } catch (err) {
      console.warn('Notice: Plaintext password purge error:', err);
    }
  }, 4000);
};
