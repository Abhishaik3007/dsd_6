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
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext();

const STORAGE_KEY_AUTH_USER = 'signalschool_auth_user';
const STORAGE_KEY_IS_AUTH = 'signalschool_is_authenticated';

/**
 * Dynamically resolves a user's role, permissions, institute association,
 * and landing portal strictly from their email address and registered institutes.
 */
export const resolveUserIdentity = (email, institutes = []) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return null;
  }

  const [username, domain] = cleanEmail.split('@');

  // 1. Super Admin Check
  const isSuperAdmin =
    cleanEmail.includes('super') ||
    cleanEmail.includes('overseer') ||
    domain === 'signalschool.org' ||
    cleanEmail === 'admin@signalschool.org';

  if (isSuperAdmin) {
    return {
      id: 'user_super_admin',
      name: 'System Overseer',
      email: cleanEmail,
      role: 'super-admin',
      roleLabel: 'Super Admin',
      instituteId: null,
      instituteName: 'Central Platform Operations',
      redirectTab: 'super-admin',
      avatarLetter: 'S',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }

  // 2. Search Institute by Registered Domain or Slug
  const matchedInst = institutes.find(
    inst => (inst.domain && inst.domain.toLowerCase() === domain) || 
            (inst.slug && domain.includes(inst.slug.toLowerCase()))
  );

  // 3. Institute Admin Check
  const isInstituteAdmin =
    username === 'admin' ||
    username.startsWith('admin.') ||
    cleanEmail.includes('principal') ||
    cleanEmail.includes('dean');

  if (matchedInst && isInstituteAdmin) {
    return {
      id: 'user_admin_' + matchedInst.id,
      name: `${matchedInst.name} Admin`,
      email: cleanEmail,
      role: 'institute-admin',
      roleLabel: 'Institute Admin',
      instituteId: matchedInst.id,
      instituteName: matchedInst.name,
      redirectTab: 'admin',
      avatarLetter: matchedInst.name.charAt(0),
      badgeColor: 'bg-[#203247] text-[#f6f3eb] border-[#203247]'
    };
  }

  // 4. Check if member already exists in matched institute's roster
  if (matchedInst && matchedInst.members) {
    const member = matchedInst.members.find(m => m.email && m.email.toLowerCase() === cleanEmail);
    if (member) {
      const isFaculty = member.role && (
        member.role.toLowerCase().includes('faculty') ||
        member.role.toLowerCase().includes('prof') ||
        member.role.toLowerCase().includes('dr')
      );
      return {
        id: member.id || 'user_' + Date.now().toString(36),
        name: member.name,
        email: cleanEmail,
        role: isFaculty ? 'faculty' : 'student',
        roleLabel: member.role || (isFaculty ? 'Faculty Lead' : 'Student'),
        instituteId: matchedInst.id,
        instituteName: matchedInst.name,
        redirectTab: 'hub',
        avatarLetter: member.name.charAt(0),
        badgeColor: isFaculty ? 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30' : 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30'
      };
    }
  }

  // 5. Automatic Member Provisioning for recognized university domain
  if (matchedInst) {
    const formattedName = username
      .split(/[._]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Campus Learner';

    const isFaculty = cleanEmail.includes('prof') || cleanEmail.includes('dr.') || cleanEmail.includes('faculty');

    return {
      id: 'user_' + Date.now().toString(36),
      name: formattedName,
      email: cleanEmail,
      role: isFaculty ? 'faculty' : 'student',
      roleLabel: isFaculty ? 'Faculty' : 'Student',
      instituteId: matchedInst.id,
      instituteName: matchedInst.name,
      redirectTab: 'hub',
      avatarLetter: formattedName.charAt(0),
      badgeColor: isFaculty ? 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30' : 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30'
    };
  }

  // 6. Generic Personal / External Learner Account (e.g. gmail, outlook)
  const formattedName = username
    .split(/[._]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Learner';

  return {
    id: 'user_' + Date.now().toString(36),
    name: formattedName,
    email: cleanEmail,
    role: 'student',
    roleLabel: 'Independent Learner',
    instituteId: null,
    instituteName: 'Personal Lab Workspace',
    redirectTab: 'hub',
    avatarLetter: formattedName.charAt(0),
    badgeColor: 'bg-[#e2e8f0] text-[#475569] border-[#cbd5e1]'
  };
};

export const AuthProvider = ({ children }) => {
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
      if (storedUser) return JSON.parse(storedUser);
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
            const resolved = resolveUserIdentity(firebaseUser.email);
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
   * Primary Firebase Login method:
   * 1. Attempts signInWithEmailAndPassword.
   * 2. If user doesn't exist, automatically signs up via createUserWithEmailAndPassword.
   * 3. Syncs profile to Firestore /users/{uid}.
   */
  const loginWithFirebase = async (email, password, institutes = []) => {
    const cleanEmail = email.trim().toLowerCase();
    const resolved = resolveUserIdentity(cleanEmail, institutes);

    if (!isFirebaseConfigured) {
      // Fallback to local session
      return loginWithResolved(resolved);
    }

    let userCredential;
    try {
      // Try signing in
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (signInError) {
      // If user not found, auto-provision in Firebase Auth
      if (
        signInError.code === 'auth/user-not-found' ||
        signInError.code === 'auth/invalid-credential'
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (createError) {
          // If creation fails with email-already-in-use, user entered wrong password
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
      userProfile = userSnap.data();
    } else {
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
        loginWithResolved,
        loginWithFirebase,
        updateUserProfile,
        logout,
        resolveUserIdentity
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
