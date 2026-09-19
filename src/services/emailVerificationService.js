import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from '../lib/firebase.js';
import { sendEmailVerification } from 'firebase/auth';
import {
  generateSecureOtp,
  generateSalt,
  hashOtpWithSalt,
  verifyOtpWithSalt,
  OTP_EXPIRATION_MINUTES,
  MAX_OTP_ATTEMPTS
} from './cryptoUtils.js';
import { getEmailProvider } from './email/index.js';

const STORAGE_KEY_PENDING_VERIFICATION = 'signalschool_pending_verification';

/**
 * Generate a cryptographically strong verification token and 6-digit code
 */
export const generateVerificationCredentials = () => {
  const token = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
  const code = generateSecureOtp();
  return { token, code };
};

/**
 * Generate a colorful, responsive HTML email template for SignalSchool
 */
export const generateVerificationEmailHtml = ({
  name,
  email,
  verificationLink,
  verificationCode,
  instituteName
}) => {
  const cleanName = name || 'Learner';
  const cleanInst = instituteName ? ` at <strong>${instituteName}</strong>` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your SignalSchool Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f3eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #203247;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f3eb; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(32, 50, 71, 0.08); box-shadow: 0 10px 30px rgba(32, 50, 71, 0.05); overflow: hidden;">
          
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #347f7a 0%, #f7bd65 50%, #f09a7d 100%);"></td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 36px 40px 24px 40px; text-align: left;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #203247;">
                      signal<span style="color: #347f7a; font-weight: 400;">school</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #eaf3ee; border: 1px solid rgba(52, 127, 122, 0.25); color: #347f7a; font-family: monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                      Verification Pass
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: #203247; line-height: 1.2;">
                Welcome aboard, ${cleanName}!
              </h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #526b88;">
                Your account${cleanInst} has been created. To activate your digital laboratory pass and access real-time simulations, please verify your email address.
              </p>
            </td>
          </tr>

          <!-- Primary Action Button -->
          <tr>
            <td style="padding: 12px 40px 32px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 9999px; background-color: #203247;">
                    <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 14px; font-weight: 700; color: #f6f3eb; text-decoration: none; border-radius: 9999px; letter-spacing: 0.02em; background-color: #203247; border: 1px solid #203247;">
                      Verify My Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6-Digit Code Alternative Box -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="background-color: #fcfbf8; border: 1px dashed rgba(32, 50, 71, 0.18); border-radius: 16px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #647895; font-weight: 600;">
                  Or enter this 6-digit code on screen:
                </p>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #347f7a; padding: 6px 0;">
                  ${verificationCode}
                </div>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #647895;">
                  This code expires in 24 hours.
                </p>
              </div>
            </td>
          </tr>

          <!-- Direct Link Fallback -->
          <tr>
            <td style="padding: 0 40px 36px 40px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #647895;">
                Button not working? Copy and paste this URL directly into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; color: #347f7a; word-break: break-all; font-family: monospace; background-color: #f6f4ee; padding: 10px; border-radius: 8px;">
                ${verificationLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fbf9f4; border-top: 1px solid rgba(32, 50, 71, 0.08); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #647895; font-weight: 500;">
                SignalSchool Platform &bull; Scaled for Universities &amp; Curious Minds
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                If you did not request this account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Initiate email verification:
 * 1. Generates token & 6-digit OTP
 * 2. Persists verification record in Firestore (and localStorage)
 * 3. Sends custom HTML email via EmailJS / Resend / native Firebase fallback
 */
export const initiateEmailVerification = async ({
  name,
  email,
  userId = null,
  instituteId = null,
  instituteName = '',
  role = 'student',
  firebaseUser = null
}) => {
  const cleanEmail = (email || '').trim().toLowerCase();

  let token = null;
  let code = null;
  let codeHash = null;
  let salt = null;
  let signature = null;
  let expiresAt = null;
  let dispatched = false;
  let dispatchError = null;

  // 1. Call Secure Serverless API (/api/send-otp)
  try {
    const resp = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: cleanEmail,
        userId,
        instituteId,
        instituteName,
        role
      })
    });

    if (resp.ok) {
      const serverData = await resp.json();
      token = serverData.token;
      salt = serverData.salt;
      codeHash = serverData.codeHash;
      signature = serverData.signature;
      expiresAt = serverData.expiresAt;
      dispatched = serverData.dispatched;
      dispatchError = serverData.dispatchError;
      console.info('[SignalSchool Auth] Dispatched verification via secure serverless API:', { dispatched, dispatchError });
    } else {
      throw new Error(`Server returned HTTP ${resp.status}`);
    }
  } catch (apiErr) {
    console.warn('[SignalSchool Auth] /api/send-otp unavailable, using client fallback:', apiErr.message);
    const fallbackCreds = generateVerificationCredentials();
    token = fallbackCreds.token;
    code = fallbackCreds.code;
    salt = generateSalt();
    codeHash = await hashOtpWithSalt(code, salt);
    expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000).toISOString();
  }

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://signalschool.io';
  const verificationLink = `${baseUrl}?verify_token=${token}&email=${encodeURIComponent(cleanEmail)}`;

  // Record stored in Firestore contains ONLY salted hash and signature, NEVER plaintext OTP!
  const verificationRecord = {
    token,
    codeHash,
    salt,
    signature,
    email: cleanEmail,
    name: name || 'Learner',
    userId,
    instituteId,
    instituteName,
    role,
    verified: false,
    attempts: 0,
    maxAttempts: MAX_OTP_ATTEMPTS,
    createdAt: new Date().toISOString(),
    expiresAt
  };

  // Save to local storage for session state
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_VERIFICATION, JSON.stringify({ ...verificationRecord, ...(code ? { code } : {}) }));
  } catch (_) {}

  // 2. Persist to Firestore email_verifications collection
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'email_verifications', token), {
        ...verificationRecord,
        serverCreatedAt: serverTimestamp()
      });

      // Also set verification metadata on users doc if userId exists
      if (userId) {
        await setDoc(doc(db, 'users', userId), {
          email_verified: false,
          verificationToken: token,
          verificationCodeHash: codeHash,
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Notice: Could not write email_verifications in Firestore:', err);
    }
  }

  // 3. Fallback client email dispatch if server did not send and client fallback generated a code
  if (!dispatched && code) {
    const htmlContent = generateVerificationEmailHtml({
      name,
      email: cleanEmail,
      verificationLink,
      verificationCode: code,
      instituteName
    });

    const emailProvider = getEmailProvider();
    try {
      const dispatchResult = await emailProvider.sendEmail({
        to: cleanEmail,
        subject: 'Verify your SignalSchool Account',
        html: htmlContent,
        text: `Welcome to SignalSchool, ${name || 'Learner'}!\n\nYour 6-digit verification code is: ${code}\nOr verify via link: ${verificationLink}\n\nThis code will expire in ${OTP_EXPIRATION_MINUTES} minutes.`
      });

      if (dispatchResult?.success) {
        dispatched = true;
      }
    } catch (providerErr) {
      console.warn('Notice: Client fallback email dispatch failed:', providerErr);
    }
  }

  // Fallback to Native Firebase Auth Email Verification if active session exists
  const activeFbUser = firebaseUser || (auth?.currentUser?.email === cleanEmail ? auth.currentUser : null);
  if (!dispatched && activeFbUser) {
    try {
      await sendEmailVerification(activeFbUser);
      dispatched = true;
      console.info(`Native Firebase verification email sent as fallback to ${cleanEmail}`);
    } catch (fbErr) {
      console.warn('Firebase Auth sendEmailVerification notice:', fbErr);
    }
  }

  return {
    success: true,
    token,
    verificationLink,
    email: cleanEmail,
    expiresAt,
    codeHash,
    dispatched,
    dispatchError
  };
};

/**
 * Check if an account is already marked as verified in Firestore or localStorage.
 * Inspects:
 * 1. `users` collection (by userId or by email)
 * 2. `institutes` collection (adminEmailVerified or members array)
 * 3. `email_verifications` collection (verified: true)
 */
export const checkAccountIsVerified = async ({ email = null, userId = null }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail && !userId) return false;

  // 1. Check Firestore
  if (isFirebaseConfigured && db) {
    try {
      // A. Check system/super_admin if email matches
      if (cleanEmail) {
        try {
          const saSnap = await getDoc(doc(db, 'system', 'super_admin'));
          if (saSnap.exists()) {
            const saData = saSnap.data();
            if (saData.email?.toLowerCase().trim() === cleanEmail) {
              return saData.email_verified === true || saData.email_verified === 'true';
            }
          }
        } catch (_) {}
      }

      // B. Check user doc by userId
      if (userId) {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
          const uData = userSnap.data();
          return uData.email_verified === true || uData.email_verified === 'true';
        }
      }

      // C. Query users collection by email
      if (cleanEmail) {
        const usersQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const usersSnap = await getDocs(usersQ);
        if (!usersSnap.empty) {
          const uData = usersSnap.docs[0].data();
          return uData.email_verified === true || uData.email_verified === 'true';
        }

        // D. Check institutes collection
        const instSnap = await getDocs(collection(db, 'institutes'));
        for (const instDoc of instSnap.docs) {
          const instData = instDoc.data();
          if (
            instData.adminEmail &&
            instData.adminEmail.toLowerCase().trim() === cleanEmail &&
            (instData.adminEmailVerified === true || instData.adminEmailVerified === 'true')
          ) {
            return true;
          }
          if (Array.isArray(instData.members)) {
            const member = instData.members.find(m => m.email && m.email.toLowerCase().trim() === cleanEmail);
            if (member && (member.email_verified === true || member.email_verified === 'true' || member.verified === true)) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error checking Firestore verification status:', e);
    }
  }

  return false;
};

/**
 * Verify account using Token OR 6-Digit Code
 */
export const verifyAccountCredentials = async ({ token = null, code = null, email = null }) => {
  const cleanEmail = (email || '').trim().toLowerCase();

  // If already verified in Firestore (e.g. admin toggled status in console), succeed immediately!
  const alreadyVerified = await checkAccountIsVerified({ email: cleanEmail });
  if (alreadyVerified) {
    return {
      success: true,
      alreadyVerified: true,
      email: cleanEmail
    };
  }

  let matchedRecord = null;
  let matchedDocId = null;

  // 1. Check Firestore
  if (isFirebaseConfigured && db) {
    try {
      if (token) {
        const tokenDoc = await getDoc(doc(db, 'email_verifications', token));
        if (tokenDoc.exists()) {
          matchedRecord = tokenDoc.data();
          matchedDocId = tokenDoc.id;
        }
      } else if (cleanEmail) {
        // Query active unverified records for this email
        const q = query(
          collection(db, 'email_verifications'),
          where('email', '==', cleanEmail),
          where('verified', '==', false)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          // Sort by creation date descending to pick the freshest record
          const sorted = querySnap.docs.sort((a, b) => {
            const timeA = new Date(a.data().createdAt || 0).getTime();
            const timeB = new Date(b.data().createdAt || 0).getTime();
            return timeB - timeA;
          });
          matchedRecord = sorted[0].data();
          matchedDocId = sorted[0].id;
        }
      }
    } catch (e) {
      console.warn('Firestore verification lookup notice:', e);
    }
  }

  // 2. Fallback to LocalStorage
  if (!matchedRecord) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PENDING_VERIFICATION);
      if (stored) {
        const parsed = JSON.parse(stored);
        const matchToken = token && parsed.token === token;
        const matchEmail = cleanEmail && parsed.email === cleanEmail;
        if (matchToken || matchEmail) {
          matchedRecord = parsed;
        }
      }
    } catch (_) {}
  }

  if (!matchedRecord) {
    return {
      success: false,
      error: 'Invalid verification token or 6-digit code. Please check your email or request a new code.'
    };
  }

  // Check rate-limiting / anti brute-force attempts
  const currentAttempts = matchedRecord.attempts || 0;
  if (currentAttempts >= MAX_OTP_ATTEMPTS) {
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new verification email.'
    };
  }

  // Check expiration (15 minutes standard)
  if (matchedRecord.expiresAt && new Date(matchedRecord.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      error: `This verification code has expired (${OTP_EXPIRATION_MINUTES} minutes limit). Please request a new code.`
    };
  }

  // 3. Verify Token or Salted SHA-256 Hash / Serverless Verification
  let isMatch = false;
  if (token && matchedRecord.token === token) {
    isMatch = true;
  } else if (code) {
    const cleanCode = String(code).trim();

    // A. First try secure serverless endpoint if HMAC signature is present
    if (matchedRecord.signature) {
      try {
        const verifyResp = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            code: cleanCode,
            token: matchedRecord.token,
            signature: matchedRecord.signature,
            expiresAt: matchedRecord.expiresAt
          })
        });
        const verifyData = await verifyResp.json();
        if (verifyData.success) {
          isMatch = true;
        }
      } catch (err) {
        console.warn('[SignalSchool Auth] Serverless verification network notice:', err);
      }
    }

    // B. Client salted hash fallback (for offline development)
    if (!isMatch && matchedRecord.codeHash && matchedRecord.salt) {
      isMatch = await verifyOtpWithSalt(cleanCode, matchedRecord.salt, matchedRecord.codeHash);
    } else if (!isMatch && matchedRecord.code) {
      // Backwards-compatibility for older development records
      isMatch = matchedRecord.code === cleanCode;
    }
  }

  if (!isMatch) {
    // Increment failed attempts in Firestore
    if (isFirebaseConfigured && db && matchedDocId) {
      try {
        await updateDoc(doc(db, 'email_verifications', matchedDocId), {
          attempts: increment(1)
        });
      } catch (_) {}
    }
    const remaining = MAX_OTP_ATTEMPTS - (currentAttempts + 1);
    return {
      success: false,
      error: remaining > 0
        ? `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Maximum attempts exceeded. Please request a new code.'
    };
  }

  // 3. Mark as verified in Firestore
  const verifiedEmail = matchedRecord.email;
  const userId = matchedRecord.userId;
  const instituteId = matchedRecord.instituteId;

  if (isFirebaseConfigured && db) {
    try {
      if (matchedDocId) {
        await updateDoc(doc(db, 'email_verifications', matchedDocId), {
          verified: true,
          verifiedAt: serverTimestamp()
        });
      }

      // Update user doc in users collection by userId
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          email_verified: true,
          verifiedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp()
        });
      }

      // Also query and update all users docs matching this email (in case userId was not tracked)
      if (verifiedEmail) {
        try {
          const usersQ = query(collection(db, 'users'), where('email', '==', verifiedEmail.toLowerCase().trim()));
          const usersSnap = await getDocs(usersQ);
          for (const uDoc of usersSnap.docs) {
            await updateDoc(doc(db, 'users', uDoc.id), {
              email_verified: true,
              verifiedAt: serverTimestamp(),
              serverUpdatedAt: serverTimestamp()
            });
          }
        } catch (_) {}

        // Also check and update system/super_admin if email matches
        try {
          const saRef = doc(db, 'system', 'super_admin');
          const saSnap = await getDoc(saRef);
          if (saSnap.exists()) {
            const saData = saSnap.data();
            if (saData.email?.toLowerCase().trim() === verifiedEmail.toLowerCase().trim()) {
              await updateDoc(saRef, {
                email_verified: true,
                serverUpdatedAt: serverTimestamp()
              });
            }
          }
        } catch (_) {}
      }

      // If user joined an institute, mark member email_verified: true
      if (instituteId) {
        const instRef = doc(db, 'institutes', instituteId);
        const instSnap = await getDoc(instRef);
        if (instSnap.exists()) {
          const instData = instSnap.data();
          const updatedMembers = (instData.members || []).map(m => {
            if (m.email?.toLowerCase() === verifiedEmail.toLowerCase() || m.id === userId) {
              return { ...m, email_verified: true };
            }
            return m;
          });
          await updateDoc(instRef, {
            members: updatedMembers,
            serverUpdatedAt: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.warn('Error syncing verified state to Firestore:', err);
    }
  }

  // 4. Update Local Storage records
  try {
    // Institutes
    const instRaw = localStorage.getItem('signalschool_institutes_data');
    if (instRaw) {
      const parsedInsts = JSON.parse(instRaw);
      const updatedInsts = parsedInsts.map(inst => ({
        ...inst,
        members: (inst.members || []).map(m => {
          if (m.email?.toLowerCase() === verifiedEmail.toLowerCase()) {
            return { ...m, email_verified: true };
          }
          return m;
        })
      }));
      localStorage.setItem('signalschool_institutes_data', JSON.stringify(updatedInsts));
    }

    // Individuals
    const indivRaw = localStorage.getItem('signalschool_individual_users');
    if (indivRaw) {
      const parsedIndiv = JSON.parse(indivRaw);
      const updatedIndiv = parsedIndiv.map(u => {
        if (u.email?.toLowerCase() === verifiedEmail.toLowerCase()) {
          return { ...u, email_verified: true };
        }
        return u;
      });
      localStorage.setItem('signalschool_individual_users', JSON.stringify(updatedIndiv));
    }

    // Auth user session if currently logged in
    const authUserRaw = localStorage.getItem('signalschool_auth_user');
    if (authUserRaw) {
      const parsedAuth = JSON.parse(authUserRaw);
      if (parsedAuth.email?.toLowerCase() === verifiedEmail.toLowerCase()) {
        parsedAuth.email_verified = true;
        localStorage.setItem('signalschool_auth_user', JSON.stringify(parsedAuth));
      }
    }
  } catch (_) {}

  return {
    success: true,
    email: verifiedEmail,
    record: matchedRecord
  };
};
