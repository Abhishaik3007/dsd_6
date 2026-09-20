import { getAdminAuth } from './firebase-admin.js';

function generateResetEmailHtml({ email, resetLink }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SignalSchool Password</title>
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
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #fcf4e8; border: 1px solid rgba(247, 189, 101, 0.35); color: #b47a1f; font-family: monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                      Security Pass
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: #203247; line-height: 1.2;">
                Reset Your Password
              </h1>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #526b88;">
                We received a request to reset the password for your SignalSchool account associated with <strong>${email}</strong>.
              </p>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 16px 40px 32px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 9999px; background-color: #203247;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 14px; font-weight: 700; color: #f6f3eb; text-decoration: none; border-radius: 9999px; letter-spacing: 0.02em; background-color: #203247; border: 1px solid #203247;">
                      Choose New Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- Security Footnote -->
          <tr>
            <td style="padding: 0 40px 36px 40px;">
              <p style="margin: 0; font-size: 13px; color: #647895; line-height: 1.5;">
                If you did not request a password reset, you can safely ignore this message. Your password will remain unchanged and your account is secure.
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
                Automated security transmission &bull; Do not reply directly to this email
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
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const auth = getAdminAuth();
    if (!auth) {
      console.warn('[Password Reset] Firebase Admin not configured. Cannot generate reset link.');
      return res.status(500).json({
        error: 'Firebase Admin SDK credentials are not configured on the server. Please check .env.local.'
      });
    }

    // Determine current app origin (e.g. http://localhost:5173 or production domain)
    const origin = req.headers.origin ||
      (req.headers.host ? `http://${req.headers.host}` : 'https://signalschool.io');

    const actionCodeSettings = {
      url: `${origin}/?mode=resetPassword`,
      handleCodeInApp: true
    };

    // 1. Check if user is registered with our site in Firebase Auth
    try {
      await auth.getUserByEmail(cleanEmail);
    } catch (userErr) {
      if (userErr.code === 'auth/user-not-found') {
        console.warn(`[Password Reset] Unregistered email entered: ${cleanEmail}`);
        return res.status(404).json({
          code: 'auth/user-not-found',
          error: `No registered account found with email ${cleanEmail}. Please check the spelling or sign up first.`
        });
      }
      console.error('[Password Reset] Firebase getUserByEmail error:', userErr.message);
      return res.status(400).json({
        code: userErr.code || 'auth/error',
        error: userErr.message || 'Error checking account status.'
      });
    }

    // 2. Generate Firebase Password Reset Link via Admin SDK (NO email sent by Google!)
    let rawFirebaseLink = '';
    try {
      rawFirebaseLink = await auth.generatePasswordResetLink(cleanEmail, actionCodeSettings);
    } catch (firebaseErr) {
      console.error('[Password Reset] Firebase generate link error:', firebaseErr.message);
      if (
        firebaseErr.code === 'auth/user-not-found' ||
        firebaseErr.message?.includes('INTERNAL ASSERT FAILED') ||
        firebaseErr.message?.toLowerCase().includes('user-not-found')
      ) {
        return res.status(404).json({
          code: 'auth/user-not-found',
          error: `No registered account found with email ${cleanEmail}. Please check the spelling or sign up first.`
        });
      }
      return res.status(400).json({
        code: firebaseErr.code || 'auth/error',
        error: firebaseErr.message || 'Unable to generate password reset link.'
      });
    }

    // 2. Extract oobCode and construct direct SignalSchool in-app link
    let inAppResetLink = rawFirebaseLink;
    try {
      const urlObj = new URL(rawFirebaseLink);
      const oobCode = urlObj.searchParams.get('oobCode');
      if (oobCode) {
        // Direct link to SignalSchool app with custom UI
        inAppResetLink = `${origin}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}&email=${encodeURIComponent(cleanEmail)}`;
      }
    } catch (_) {}

    // 3. Dispatch Branded HTML Email via Resend
    const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || process.env.VITE_RESEND_FROM || 'SignalSchool <onboarding@resend.dev>';

    const html = generateResetEmailHtml({
      email: cleanEmail,
      resetLink: inAppResetLink
    });

    let dispatched = false;
    let dispatchError = null;

    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [cleanEmail],
            subject: 'Reset Your SignalSchool Password',
            html,
            text: `We received a request to reset your SignalSchool password.\n\nClick the link below to choose a new password:\n${inAppResetLink}\n\nIf you did not request this, please ignore this email.`
          })
        });

        const resData = await emailRes.json();
        if (emailRes.ok && resData?.id) {
          dispatched = true;
          console.log(`[SignalSchool Backend] Password reset email delivered via Resend to ${cleanEmail} (ID: ${resData.id})`);
        } else {
          dispatchError = resData?.message || JSON.stringify(resData);
          console.warn('[SignalSchool Backend] Resend password reset warning:', dispatchError);
        }
      } catch (err) {
        dispatchError = err.message;
        console.warn('[SignalSchool Backend] Error dispatching password reset via Resend:', err.message);
      }
    } else {
      console.warn('[SignalSchool Backend] RESEND_API_KEY not set.');
    }

    console.log(`\n======================================================`);
    console.log(`[BRANDED PASSWORD RESET LINK GENERATED]`);
    console.log(`Target: ${cleanEmail}`);
    console.log(`In-App Link: ${inAppResetLink}`);
    console.log(`Resend Status: ${dispatched ? 'DELIVERED' : 'PENDING' + (dispatchError ? ` (${dispatchError})` : '')}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      success: true,
      email: cleanEmail,
      dispatched,
      dispatchError: dispatched ? null : dispatchError
    });
  } catch (err) {
    console.error('[SignalSchool Backend] Error in request-password-reset:', err);
    return res.status(500).json({ error: 'Internal server error processing password reset.' });
  }
}
