import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration loaded from Vite environment variables (.env.local)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase credentials have been configured in .env.local
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_')
);

// Initialize Firebase app singleton
export const app = !getApps().length
  ? initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: "dummy-api-key-for-local-fallback",
            authDomain: "signalschool-demo.firebaseapp.com",
            projectId: "signalschool-demo",
            storageBucket: "signalschool-demo.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:abcdef123456"
          }
    )
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Provision a user account directly in Firebase Authentication
 * without signing out the currently logged-in administrator.
 * Uses an isolated secondary Firebase App instance and terminates it immediately.
 */
export const createFirebaseUserAccount = async ({ email, password, displayName }) => {
  if (!isFirebaseConfigured) {
    return null;
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || 'campus123').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    const err = new Error('Please provide a valid email address.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  if (cleanPassword.length < 6) {
    const err = new Error('Password must be at least 6 characters long for Firebase Authentication.');
    err.code = 'auth/weak-password';
    throw err;
  }

  const secondaryAppName = `SecondaryAuth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let secondaryApp = null;

  try {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      cleanEmail,
      cleanPassword
    );

    const createdUser = userCredential.user;

    if (displayName && displayName.trim()) {
      try {
        await updateProfile(createdUser, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Notice: Could not set displayName in Firebase Auth:', profileErr);
      }
    }

    // Automatically send verification email via Firebase Auth
    try {
      await sendEmailVerification(createdUser);
      console.info(`Dispatched Firebase verification email to ${cleanEmail}`);
    } catch (mailErr) {
      console.warn('Could not send native Firebase email verification:', mailErr);
    }

    // Explicitly sign out from secondary auth instance
    try {
      await signOut(secondaryAuth);
    } catch (_) {}

    return {
      uid: createdUser.uid,
      email: cleanEmail,
      displayName: displayName || createdUser.displayName || '',
      isNew: true
    };
  } catch (error) {
    throw error;
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch (_) {}
    }
  }
};
