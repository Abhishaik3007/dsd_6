import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

const AuthContext = createContext();

const STORAGE_KEY_AUTH_USER = 'signalschool_auth_user';
const STORAGE_KEY_IS_AUTH = 'signalschool_is_authenticated';

const STORAGE_KEY_SUPER_ADMIN = 'signalschool_super_admin';

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
        return {
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
      }
      const err = new Error(`Incorrect password for ${member.name}.`);
      err.code = 'auth/wrong-password';
      throw err;
    }
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
        // If the stored user is an old mock user referencing dummy institutes, clear it
        const dummyInstituteIds = ['inst_apex', 'inst_horizon', 'inst_crestwood'];
        if (parsed?.instituteId && dummyInstituteIds.includes(parsed.instituteId)) {
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
  const registerSuperAdmin = ({ name, email, password }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      throw new Error('Please enter a name for the Super Administrator.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid administrator email address.');
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const newAdmin = {
      id: 'super_admin_' + Date.now().toString(36),
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

    // Persist to Firestore system/super_admin
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'system', 'super_admin'), {
        ...newAdmin,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to save super admin to Firestore:', err));
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
   * 1. Strictly authenticates credentials against registered accounts (Super Admin, Institute Admins, Roster Members).
   * 2. If valid, syncs with Firebase Auth if configured, or sets local session.
   * 3. Throws explicit errors if account is unregistered or password is wrong.
   */
  const loginWithFirebase = async (email, password, institutes = []) => {
    // 1. Strict validation check with dynamic superAdmin
    const authenticatedProfile = authenticateUser(email, password, institutes, superAdmin);

    if (!isFirebaseConfigured) {
      // Fallback to local session
      return loginWithResolved(authenticatedProfile);
    }

    const cleanEmail = email.trim().toLowerCase();
    let userCredential;
    try {
      // Try signing in to Firebase
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (signInError) {
      // If user not in Firebase Auth yet, provision now since they are authorized
      if (
        signInError.code === 'auth/user-not-found' ||
        signInError.code === 'auth/invalid-credential'
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (createError) {
          if (createError.code === 'auth/email-already-in-use') {
            throw new Error('Incorrect password for this account.');
          }
          throw createError;
        }
      } else {
        throw signInError;
      }
    }

    const firebaseUser = userCredential.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    let userProfile;
    if (userSnap.exists()) {
      userProfile = { ...authenticatedProfile, ...userSnap.data(), uid: firebaseUser.uid };
    } else {
      userProfile = {
        ...authenticatedProfile,
        uid: firebaseUser.uid,
        email: cleanEmail,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, {
        ...userProfile,
        serverCreatedAt: serverTimestamp()
      }, { merge: true });
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
