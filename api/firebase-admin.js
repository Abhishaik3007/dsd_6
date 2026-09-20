import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Ensure .env.local is loaded in local dev environments even if dev server was started earlier
if (!process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      import('node:fs').then(fs => {
        if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
        else if (fs.existsSync('.env')) process.loadEnvFile('.env');
      }).catch(() => {});
    }
  } catch (_) {}
}

let appInstance = null;

export function getFirebaseAdminApp() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Check if .env.local needs synchronous loading if still missing
  if (!process.env.FIREBASE_PRIVATE_KEY && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile('.env.local');
    } catch (_) {
      try { process.loadEnvFile('.env'); } catch (_) {}
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    console.warn('[Firebase Admin] Notice: FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY not configured.');
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  try {
    appInstance = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    console.log('[Firebase Admin] Initialized successfully for project:', projectId);
    return appInstance;
  } catch (err) {
    console.error('[Firebase Admin] Initialization error:', err);
    return null;
  }
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}
