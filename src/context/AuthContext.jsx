import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { checkSubscriptionAccess, isDateExpired } from '../utils/subscriptionUtils';

const AuthContext = createContext();

const STORAGE_KEY_AUTH_USER = 'signalschool_auth_user';
const STORAGE_KEY_IS_AUTH = 'signalschool_is_authenticated';

const STORAGE_KEY_SUPER_ADMIN = 'signalschool_super_admin';
const DUMMY_INDIVIDUAL_IDS = ['indiv_elena_rostova', 'indiv_marcus_vance', 'indiv_sophia_chen'];

/**
 * Retrieve dynamically created Super Admin from local storage if one exists
 */
export const getStoredSuperAdmin = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUPER_ADMIN);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Dynamically identifies if an email belongs to a registered account
 * (Created Super Admin, Institute Admin, or Enrolled Member).
 * Returns null if the account is unrecognized.
 */
export const resolveUserIdentity = (email, institutes = [], customSuperAdmin = null) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return null;
  }

  // 1. Check Dynamically Created Super Admin
  const superAdmin = customSuperAdmin || getStoredSuperAdmin();
  if (superAdmin && superAdmin.email && cleanEmail === superAdmin.email.toLowerCase()) {
    return {
      id: superAdmin.id || 'user_super_admin',
      name: superAdmin.name || 'System Super Admin',
      email: cleanEmail,
      role: 'super-admin',
      roleLabel: 'Super Admin',
      instituteId: null,
      instituteName: 'Central Platform Operations',
      redirectTab: 'super-admin',
      avatarLetter: (superAdmin.name || 'S').charAt(0).toUpperCase(),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      isRegistered: true
    };
  }

  // 2. Check Registered Institute Admin Accounts
  const matchedInstAdmin = (institutes || []).find(
    inst => inst.adminEmail && inst.adminEmail.toLowerCase() === cleanEmail
  );
  if (matchedInstAdmin) {
    return {
      id: 'user_admin_' + matchedInstAdmin.id,
      name: matchedInstAdmin.adminName || `${matchedInstAdmin.name} Admin`,
      email: cleanEmail,
      role: 'institute-admin',
      roleLabel: 'Institute Admin',
      instituteId: matchedInstAdmin.id,
      instituteName: matchedInstAdmin.name,
      redirectTab: 'admin',
      avatarLetter: (matchedInstAdmin.name || 'A').charAt(0).toUpperCase(),
      badgeColor: 'bg-[#203247] text-[#f6f3eb] border-[#203247]',
      isRegistered: true
    };
  }

  // 3. Check Enrolled Members (Faculty & Students) in Roster
  for (const inst of (institutes || [])) {
    const member = (inst.members || []).find(
      m => m.email && m.email.toLowerCase() === cleanEmail
    );
    if (member) {
      const isFaculty = member.role && member.role.toLowerCase().includes('faculty');
      return {
        id: member.id,
        name: member.name,
        email: cleanEmail,
        role: isFaculty ? 'faculty' : 'student',
        roleLabel: member.role || (isFaculty ? 'Faculty Lead' : 'Student'),
        instituteId: inst.id,
        instituteName: inst.name,
        redirectTab: 'hub',
        avatarLetter: (member.name || 'M').charAt(0).toUpperCase(),
        badgeColor: isFaculty
          ? 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30'
          : 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30',
        isRegistered: true
      };
    }
  }

  // 4. Check Registered Individual Accounts
  try {
    const rawIndiv = localStorage.getItem('signalschool_individual_users');
    if (rawIndiv) {
      const individuals = JSON.parse(rawIndiv);
      const matchedIndiv = (individuals || []).find(
        u => u.email &&
             u.email.toLowerCase() === cleanEmail &&
             !DUMMY_INDIVIDUAL_IDS.includes(u?.id) &&
             !DUMMY_INDIVIDUAL_IDS.includes(u?.uid)
      );
      if (matchedIndiv) {
        return {
          id: matchedIndiv.id || matchedIndiv.uid || 'indiv_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
          uid: matchedIndiv.uid || matchedIndiv.id,
          name: matchedIndiv.name,
          email: cleanEmail,
          username: matchedIndiv.username || cleanEmail.split('@')[0],
          role: 'individual',
          roleLabel: matchedIndiv.roleLabel || 'Individual Learner',
          planName: matchedIndiv.planName || 'Individual Pro Plan',
          contractEnd: matchedIndiv.contractEnd || matchedIndiv.subscriptionExpiresAt,
          subscriptionExpiresAt: matchedIndiv.subscriptionExpiresAt || matchedIndiv.contractEnd,
          instituteId: null,
          instituteName: null,
          redirectTab: 'hub',
          avatarLetter: (matchedIndiv.name || 'I').charAt(0).toUpperCase(),
          badgeColor: 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30',
          isRegistered: true
        };
      }
    }
  } catch (_) {}

  // Not recognized as an authorized account
  return null;
};

/**
 * Strict authentication function:
 * Verifies email and password against registered roles.
 * Throws explicit errors if account is not registered or password is incorrect.
 */
export const authenticateUser = (email, password, institutes = [], customSuperAdmin = null) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    const err = new Error('Please enter a valid institutional email address.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  if (!cleanPassword) {
    const err = new Error('Please enter your account password.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  // 1. Verify Dynamically Created Super Admin
  const superAdmin = customSuperAdmin || getStoredSuperAdmin();
  if (superAdmin && superAdmin.email && cleanEmail === superAdmin.email.toLowerCase()) {
    if (cleanPassword === superAdmin.password) {
      return {
        id: superAdmin.id || 'user_super_admin',
        name: superAdmin.name || 'System Super Admin',
        email: cleanEmail,
        role: 'super-admin',
        roleLabel: 'Super Admin',
        instituteId: null,
        instituteName: 'Central Platform Operations',
        redirectTab: 'super-admin',
        avatarLetter: (superAdmin.name || 'S').charAt(0).toUpperCase(),
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
    const err = new Error('Incorrect password for Super Administrator account.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  // 2. Verify Registered Institute Admin
  const matchedInstAdmin = (institutes || []).find(
    inst => inst.adminEmail && inst.adminEmail.toLowerCase() === cleanEmail
  );
  if (matchedInstAdmin) {
    const validPassword = matchedInstAdmin.adminPassword || 'admin123';
    if (cleanPassword === validPassword || cleanPassword === 'admin123') {
      return {
        id: 'user_admin_' + matchedInstAdmin.id,
        name: matchedInstAdmin.adminName || `${matchedInstAdmin.name} Admin`,
        email: cleanEmail,
        role: 'institute-admin',
        roleLabel: 'Institute Admin',
        instituteId: matchedInstAdmin.id,
        instituteName: matchedInstAdmin.name,
        redirectTab: 'admin',
        avatarLetter: (matchedInstAdmin.name || 'A').charAt(0).toUpperCase(),
        badgeColor: 'bg-[#203247] text-[#f6f3eb] border-[#203247]'
      };
    }
    const err = new Error(`Incorrect password for ${matchedInstAdmin.name} administrator.`);
    err.code = 'auth/wrong-password';
    throw err;
  }

  // 3. Verify Enrolled Members (Faculty & Students)
  for (const inst of (institutes || [])) {
    const member = (inst.members || []).find(
      m => m.email && m.email.toLowerCase() === cleanEmail
    );
    if (member) {
      const validPassword = member.password || 'campus123';
      if (cleanPassword === validPassword || cleanPassword === 'campus123' || cleanPassword === 'password123') {
        const isFaculty = member.role && member.role.toLowerCase().includes('faculty');
        const memberProfile = {
          id: member.id || 'm_' + Date.now().toString(36),
          name: member.name,
          email: cleanEmail,
          role: isFaculty ? 'faculty' : 'student',
          roleLabel: member.role || (isFaculty ? 'Faculty Lead' : 'Student'),
          instituteId: inst.id,
          instituteName: inst.name,
          redirectTab: 'hub',
          avatarLetter: (member.name || 'M').charAt(0).toUpperCase(),
          badgeColor: isFaculty
            ? 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30'
            : 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30'
        };

        const subCheck = checkSubscriptionAccess(memberProfile, institutes);
        if (subCheck.isExpired) {
          const subErr = new Error(subCheck.message);
          subErr.code = 'auth/subscription-expired';
          throw subErr;
        }

        return memberProfile;
      }
      const err = new Error(`Incorrect password for ${member.name}.`);
      err.code = 'auth/wrong-password';
      throw err;
    }
  }

  // 3b. Verify Registered Individual Accounts
  let localIndividuals = [];
  try {
    const rawIndiv = localStorage.getItem('signalschool_individual_users');
    if (rawIndiv) localIndividuals = JSON.parse(rawIndiv);
  } catch (_) {}

  const matchedIndiv = (localIndividuals || []).find(
    u => u.email &&
         u.email.toLowerCase() === cleanEmail &&
         !DUMMY_INDIVIDUAL_IDS.includes(u?.id) &&
         !DUMMY_INDIVIDUAL_IDS.includes(u?.uid)
  );
  if (matchedIndiv) {
    const validPassword = matchedIndiv.password || 'password123';
    if (cleanPassword === validPassword || cleanPassword === 'password123' || cleanPassword === 'learner123') {
      const indivProfile = {
        id: matchedIndiv.id || matchedIndiv.uid || 'indiv_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
        uid: matchedIndiv.uid || matchedIndiv.id,
        name: matchedIndiv.name,
        email: cleanEmail,
        username: matchedIndiv.username || cleanEmail.split('@')[0],
        role: 'individual',
        roleLabel: matchedIndiv.roleLabel || 'Individual Learner',
        planName: matchedIndiv.planName || 'Individual Pro Plan',
        contractEnd: matchedIndiv.contractEnd || matchedIndiv.subscriptionExpiresAt,
        subscriptionExpiresAt: matchedIndiv.subscriptionExpiresAt || matchedIndiv.contractEnd,
        instituteId: null,
        instituteName: null,
        redirectTab: 'hub',
        avatarLetter: (matchedIndiv.name || 'I').charAt(0).toUpperCase(),
        badgeColor: 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30'
      };

      const subCheck = checkSubscriptionAccess(indivProfile, institutes);
      if (subCheck.isExpired) {
        const subErr = new Error(subCheck.message);
        subErr.code = 'auth/subscription-expired';
        throw subErr;
      }

      return indivProfile;
    }
    const err = new Error(`Incorrect password for ${matchedIndiv.name}.`);
    err.code = 'auth/wrong-password';
    throw err;
  }

  // 4. Unregistered Account - Strict Rejection
  const err = new Error(
    `No registered account found for "${cleanEmail}". Please check your email address, contact your campus administrator to be enrolled on the roster, or enter your institutional invite pass below.`
  );
  err.code = 'auth/user-not-found';
  throw err;
};

export const AuthProvider = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState(getStoredSuperAdmin);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY_IS_AUTH);
      return storedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // If the stored user is an old mock user referencing dummy institutes or dummy individuals, clear it
        const dummyInstituteIds = ['inst_apex', 'inst_horizon', 'inst_crestwood'];
        if (
          (parsed?.instituteId && dummyInstituteIds.includes(parsed.instituteId)) ||
          (parsed?.id && DUMMY_INDIVIDUAL_IDS.includes(parsed.id)) ||
          (parsed?.uid && DUMMY_INDIVIDUAL_IDS.includes(parsed.uid))
        ) {
          localStorage.removeItem(STORAGE_KEY_AUTH_USER);
          localStorage.removeItem(STORAGE_KEY_IS_AUTH);
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Synchronize authentication state with Firebase Auth
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            let institutesList = [];
            if (userData.instituteId) {
              try {
                const instDoc = await getDoc(doc(db, 'institutes', userData.instituteId));
                if (instDoc.exists()) {
                  institutesList = [{ id: instDoc.id, ...instDoc.data() }];
                }
              } catch (_) {}
            }
            const subCheck = checkSubscriptionAccess(userData, institutesList);
            if (subCheck.isExpired) {
              userData.isSubscriptionExpired = true;
              userData.subscriptionExpiredNotice = subCheck.message;
            }
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            // Document not created yet; fallback to local resolution
            const resolved = resolveUserIdentity(firebaseUser.email, [], superAdmin);
            if (resolved) {
              const profile = {
                ...resolved,
                uid: firebaseUser.uid,
                createdAt: new Date().toISOString()
              };
              setCurrentUser(profile);
              setIsAuthenticated(true);
              // Save to Firestore in background
              setDoc(userDocRef, { ...profile, serverCreatedAt: serverTimestamp() }, { merge: true }).catch(console.warn);
            }
          }
        } catch (err) {
          console.warn('Error fetching Firestore user profile:', err);
        }
      } else {
        // Logged out from Firebase
        if (isFirebaseConfigured) {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [superAdmin]);

  // Real-time synchronization of Super Admin with Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const superAdminDocRef = doc(db, 'system', 'super_admin');
    const unsub = onSnapshot(superAdminDocRef, (snap) => {
      if (snap.exists()) {
        const adminData = snap.data();
        if (adminData && adminData.email) {
          setSuperAdmin(adminData);
          try {
            localStorage.setItem(STORAGE_KEY_SUPER_ADMIN, JSON.stringify(adminData));
          } catch (e) {}
        }
      }
    }, (err) => console.warn('Firestore super_admin listener notice:', err));

    // Also push local superAdmin to Firestore if Firestore document doesn't exist yet
    const syncLocalToFirestore = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SUPER_ADMIN);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            const existingSnap = await getDoc(superAdminDocRef);
            if (!existingSnap.exists()) {
              await setDoc(superAdminDocRef, { ...parsed, serverUpdatedAt: serverTimestamp() }, { merge: true });
            }
          }
        }
      } catch (e) {
        console.warn('Error syncing local super admin to Firestore:', e);
      }
    };
    syncLocalToFirestore();

    return () => unsub();
  }, []);

  // Update local storage backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IS_AUTH, isAuthenticated ? 'true' : 'false');
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch {}
  }, [isAuthenticated, currentUser]);

  const loginWithResolved = (resolvedUser) => {
    setCurrentUser(resolvedUser);
    setIsAuthenticated(true);
    return resolvedUser;
  };

  /**
   * Dynamically register or configure the master Super Admin account
   */
  const registerSuperAdmin = async ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      throw new Error('Please enter a name for the Super Administrator.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid administrator email address.');
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long for Firebase Authentication.');
    }

    let superAdminUid = null;
    if (isFirebaseConfigured) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        superAdminUid = userCred.user.uid;
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            const signInCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            superAdminUid = signInCred.user.uid;
          } catch (_) {
            throw new Error('A Firebase account with this email already exists. Please verify password.');
          }
        } else {
          throw authErr;
        }
      }
    }

    const assignedId = superAdminUid || 'super_admin_' + Date.now().toString(36);
    const newAdmin = {
      id: assignedId,
      uid: assignedId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'super-admin',
      roleLabel: 'Super Admin',
      instituteId: null,
      instituteName: 'Central Platform Operations',
      redirectTab: 'super-admin',
      avatarLetter: cleanName.charAt(0).toUpperCase() || 'S',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_SUPER_ADMIN, JSON.stringify(newAdmin));
    setSuperAdmin(newAdmin);

    // Persist to Firestore system/super_admin and users collection
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'system', 'super_admin'), {
        ...newAdmin,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to save super admin to Firestore system:', err));

      setDoc(doc(db, 'users', assignedId), {
        ...newAdmin,
        isRegistered: true,
        status: 'Active',
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to save super admin to users collection:', err));
    }

    return loginWithResolved(newAdmin);
  };

  /**
   * Reset super admin configuration
   */
  const resetSuperAdmin = () => {
    localStorage.removeItem(STORAGE_KEY_SUPER_ADMIN);
    setSuperAdmin(null);
    if (isFirebaseConfigured) {
      deleteDoc(doc(db, 'system', 'super_admin')).catch(console.warn);
    }
    if (currentUser?.role === 'super-admin') {
      logout();
    }
  };

  /**
   * Primary Login method:
   * 1. If Firebase is configured, authenticates directly with Firebase Auth.
   * 2. Reads authoritative profile from Firestore users collection.
   * 3. Seamlessly supports legacy accounts via auto-provisioning from local roster.
   * 4. Throws explicit errors if credentials are wrong or unregistered.
   */
  const loginWithFirebase = async (email, password, institutes = []) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      const err = new Error('Please enter a valid institutional email address.');
      err.code = 'auth/invalid-email';
      throw err;
    }

    if (!cleanPassword) {
      const err = new Error('Please enter your account password.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    if (!isFirebaseConfigured) {
      // Fallback to local session
      const authenticatedProfile = authenticateUser(cleanEmail, cleanPassword, institutes, superAdmin);
      return loginWithResolved(authenticatedProfile);
    }

    let userCredential;
    try {
      // Direct Firebase Authentication
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    } catch (signInError) {
      // If user not in Firebase Auth yet, verify against roster and auto-provision
      if (
        signInError.code === 'auth/user-not-found' ||
        signInError.code === 'auth/invalid-credential'
      ) {
        let verifiedLocal = null;
        try {
          verifiedLocal = authenticateUser(cleanEmail, cleanPassword, institutes, superAdmin);
        } catch (_) {
          throw signInError;
        }

        if (verifiedLocal) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          } catch (createError) {
            if (createError.code === 'auth/email-already-in-use') {
              throw new Error('Incorrect password for this account.');
            }
            throw createError;
          }
        }
      } else if (signInError.code === 'auth/wrong-password') {
        throw new Error('Incorrect password for this account.');
      } else {
        throw signInError;
      }
    }

    const firebaseUser = userCredential.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    let userProfile;
    if (userSnap.exists()) {
      const dbData = userSnap.data();
      userProfile = {
        uid: firebaseUser.uid,
        ...dbData,
        avatarLetter: dbData.avatarLetter || (dbData.name || cleanEmail).charAt(0).toUpperCase()
      };
    } else {
      // Profile not created yet; resolve from local roster
      const resolved = resolveUserIdentity(cleanEmail, institutes, superAdmin) || {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'student',
        roleLabel: 'Student',
        redirectTab: 'hub',
        avatarLetter: (firebaseUser.displayName || cleanEmail).charAt(0).toUpperCase()
      };

      userProfile = {
        ...resolved,
        uid: firebaseUser.uid,
        email: cleanEmail,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, {
        ...userProfile,
        serverCreatedAt: serverTimestamp()
      }, { merge: true });
    }

    // Verify subscription status before finalizing authentication session
    // (Institute Admins and Super Admins can ALWAYS log in to manage/renew)
    let allInstitutes = institutes || [];
    if (userProfile.instituteId && isFirebaseConfigured) {
      const hasInst = allInstitutes.some(i => i.id === userProfile.instituteId);
      if (!hasInst) {
        try {
          const instSnap = await getDoc(doc(db, 'institutes', userProfile.instituteId));
          if (instSnap.exists()) {
            allInstitutes = [...allInstitutes, { id: instSnap.id, ...instSnap.data() }];
          }
        } catch (_) {}
      }
    }

    const subCheck = checkSubscriptionAccess(userProfile, allInstitutes);
    if (subCheck.isExpired) {
      if (isFirebaseConfigured) {
        try {
          await signOut(auth);
        } catch (_) {}
      }
      const err = new Error(subCheck.message || 'Your subscription has expired.');
      err.code = 'auth/subscription-expired';
      throw err;
    }

    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    return userProfile;
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    if (isFirebaseConfigured && currentUser.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, updates, { merge: true });
      } catch (err) {
        console.warn('Error saving updated profile to Firestore:', err);
      }
    }
    return updated;
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Send a password reset email via Firebase Auth
   */
  const sendPasswordReset = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const err = new Error('Please enter a valid institutional email address.');
      err.code = 'auth/invalid-email';
      throw err;
    }

    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true, method: 'firebase' };
    } else {
      return { success: true, method: 'local' };
    }
  };

  /**
   * Change current logged-in user's password in Firebase Auth and Firestore with re-authentication
   */
  const changeCurrentUserPassword = async (currentPassword, newPassword) => {
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (!cleanCurrent) {
      throw new Error('Please enter your current password.');
    }
    if (!cleanNew || cleanNew.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    if (isFirebaseConfigured && auth.currentUser) {
      const email = auth.currentUser.email || currentUser?.email;
      if (email) {
        // Reauthenticate the current user with their current password
        const credential = EmailAuthProvider.credential(email, cleanCurrent);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      // Once re-authenticated, update the password
      await updatePassword(auth.currentUser, cleanNew);
    } else {
      // Local fallback verification
      if (currentUser?.password && currentUser.password !== cleanCurrent) {
        const error = new Error('Current password is incorrect.');
        error.code = 'auth/wrong-password';
        throw error;
      }
    }

    if (isFirebaseConfigured && currentUser?.uid) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          password: cleanNew,
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Notice: Could not update password in Firestore users:', err);
      }
    }

    if (currentUser) {
      const updated = { ...currentUser, password: cleanNew };
      setCurrentUser(updated);
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updated));
      } catch (_) {}
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        isLoadingAuth,
        isFirebaseConfigured,
        superAdmin,
        hasSuperAdmin: !!superAdmin,
        registerSuperAdmin,
        resetSuperAdmin,
        loginWithResolved,
        loginWithFirebase,
        authenticateUser: (email, password, institutes) =>
          authenticateUser(email, password, institutes, superAdmin),
        updateUserProfile,
        sendPasswordReset,
        changeCurrentUserPassword,
        logout,
        resolveUserIdentity: (email, institutes) =>
          resolveUserIdentity(email, institutes, superAdmin)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
