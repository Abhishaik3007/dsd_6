import crypto from 'crypto';

const OTP_EXPIRATION_MINUTES = 15;
const DEFAULT_SECRET = 'signalschool_secret_hmac_key_2026_dev';

function generateEmailHtml({ name, email, verificationCode, instituteName }) {
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

          <!-- 6-Digit Code Box -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="background-color: #fcfbf8; border: 1px dashed rgba(32, 50, 71, 0.18); border-radius: 16px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #647895; font-weight: 600;">
                  Your 6-digit verification code:
                </p>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #347f7a; padding: 10px 0;">
                  ${verificationCode}
                </div>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #647895;">
                  This code expires in <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <p style="margin: 0; font-size: 13px; color: #647895; line-height: 1.5;">
                Enter this code on the verification screen to activate your account. If you did not create a SignalSchool account, you can safely disregard this message.
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
    const { name, email, instituteName, role, userId } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // 1. Generate 6-digit cryptographically secure OTP
    const code = String(crypto.randomInt(100000, 1000000));
    const token = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : crypto.randomBytes(16).toString('hex');
    const salt = crypto.randomBytes(16).toString('hex');

    // 2. Server Secret & HMAC Signature
    const serverSecret = process.env.EMAIL_SERVER_SECRET || DEFAULT_SECRET;
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000).toISOString();

    // Create tamper-proof HMAC signature
    const signature = crypto
      .createHmac('sha256', serverSecret)
      .update(`${cleanEmail}:${token}:${code}:${expiresAt}`)
      .digest('hex');

    // Also compute salted SHA-256 hash for database reference
    const codeHash = crypto
      .createHash('sha256')
      .update(code + salt)
      .digest('hex');

    // 3. Email Dispatch via Resend
    const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || process.env.VITE_RESEND_FROM || 'SignalSchool <onboarding@resend.dev>';
    
    const html = generateEmailHtml({
      name: name || 'Learner',
      email: cleanEmail,
      verificationCode: code,
      instituteName
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
            subject: 'Verify your SignalSchool Account',
            html: html,
            text: `Welcome to SignalSchool, ${name || 'Learner'}!\n\nYour 6-digit verification code is: ${code}\n\nThis code expires in ${OTP_EXPIRATION_MINUTES} minutes.`
          })
        });

        const resData = await emailRes.json();
        if (emailRes.ok && resData?.id) {
          dispatched = true;
          console.log(`[SignalSchool Backend] Verification email delivered via Resend to ${cleanEmail} (ID: ${resData.id})`);
        } else {
          dispatchError = resData?.message || JSON.stringify(resData);
          console.warn('[SignalSchool Backend] Resend dispatch notice:', dispatchError);
        }
      } catch (err) {
        dispatchError = err.message;
        console.warn('[SignalSchool Backend] Error calling Resend API:', err.message);
      }
    } else {
      console.warn('[SignalSchool Backend] RESEND_API_KEY not set. Set it in .env.local to send live emails.');
    }

    // Always log to server console for convenient developer testing
    console.log(`\n======================================================`);
    console.log(`[SECURE SERVERLESS OTP GENERATION]`);
    console.log(`Target Email: ${cleanEmail}`);
    console.log(`6-Digit Code: ${code} (Expires in ${OTP_EXPIRATION_MINUTES}m)`);
    console.log(`Resend Status: ${dispatched ? 'DELIVERED' : 'PENDING' + (dispatchError ? ` (${dispatchError})` : '')}`);
    console.log(`======================================================\n`);

    // The server NEVER returns the plaintext `code` to the client!
    return res.status(200).json({
      success: true,
      token,
      salt,
      codeHash,
      signature,
      expiresAt,
      email: cleanEmail,
      dispatched,
      dispatchError: dispatched ? null : dispatchError
    });
  } catch (err) {
    console.error('[SignalSchool Backend] Error in send-otp:', err);
    return res.status(500).json({ error: 'Internal server error generating OTP.' });
  }
}
