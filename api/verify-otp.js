import crypto from 'crypto';

const DEFAULT_SECRET = 'signalschool_secret_hmac_key_2026_dev';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code, token, signature, expiresAt } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = String(code || '').trim();

    if (!cleanEmail || !cleanCode || !token || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: email, code, token, and signature are required.'
      });
    }

    // 1. Expiration check (15 minutes)
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'This verification code has expired (15 minutes limit). Please request a new code.'
      });
    }

    // 2. Server Secret & HMAC recomputation
    const serverSecret = process.env.EMAIL_SERVER_SECRET || DEFAULT_SECRET;
    const expectedSig = crypto
      .createHmac('sha256', serverSecret)
      .update(`${cleanEmail}:${token}:${cleanCode}:${expiresAt}`)
      .digest('hex');

    // 3. Constant-time comparison to protect against timing attacks
    let isValid = false;
    try {
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSig, 'hex');
      if (sigBuffer.length === expectedBuffer.length) {
        isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
      }
    } catch (_) {
      isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check your email and try again.'
      });
    }

    console.log(`[SignalSchool Backend] Successfully verified OTP for ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      email: cleanEmail,
      verified: true
    });
  } catch (err) {
    console.error('[SignalSchool Backend] Error in verify-otp:', err);
    return res.status(500).json({ error: 'Internal server error verifying OTP.' });
  }
}
