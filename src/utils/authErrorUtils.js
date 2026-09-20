/**
 * Normalizes and formats Firebase, institutional, and client authentication errors
 * into structured, human-readable feedback.
 */

export const parseAuthError = (err) => {
  if (!err) return null;

  // Extract raw error code and message
  const rawCode = (err?.code || '').toLowerCase().trim();
  const rawMessage = (err?.message || (typeof err === 'string' ? err : '')).trim();

  // 0a. Email Not Verified
  if (
    rawCode === 'auth/email-not-verified' ||
    rawMessage.toLowerCase().includes('email has not been verified') ||
    rawMessage.toLowerCase().includes('email not verified')
  ) {
    return {
      title: 'Email Verification Required',
      badge: 'Unverified Email',
      message: 'Your email address has not been verified yet. Please check your inbox for the verification link or enter your 6-digit code to activate your account.',
      type: 'warning',
      isUnverified: true,
      email: err?.email
    };
  }

  // 0. Seat License Revoked
  if (
    rawCode === 'auth/seat-revoked' ||
    err?.type === 'revoked' ||
    err?.isRevoked ||
    rawMessage.toLowerCase().includes('revoked')
  ) {
    const emailMatch = rawMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const adminEmail = err?.adminEmail || (emailMatch ? emailMatch[1] : null);
    let instName = err?.instituteName || null;
    if (!instName) {
      const matchInst = rawMessage.match(/license for ([^has]+) has been revoked/i);
      if (matchInst && matchInst[1]) instName = matchInst[1].trim();
    }

    return {
      title: 'Seat License Revoked',
      badge: 'Seat Revoked',
      message: instName
        ? `Your seat license for ${instName} has been revoked by campus administration. You cannot access the laboratories until your seat is restored.`
        : 'Your seat license has been revoked by campus administration. Please contact your campus administrator to restore your access.',
      type: 'expired',
      adminEmail,
      instituteName: instName
    };
  }

  // 1. Subscription Expired (Campus or Individual)
  if (
    rawCode === 'auth/subscription-expired' ||
    rawMessage.toLowerCase().includes('subscription expired') ||
    rawMessage.toLowerCase().includes('institutional subscription')
  ) {
    const isCampus =
      rawMessage.toLowerCase().includes('institutional') ||
      rawMessage.toLowerCase().includes('campus') ||
      err?.type === 'institute';

    // Extract email if in message (e.g. admin_medford@yopmail.com)
    const emailMatch = rawMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const adminEmail = err?.adminEmail || (emailMatch ? emailMatch[1] : null);

    // Extract institute name if available
    let instName = err?.instituteName || null;
    if (!instName) {
      const matchInst = rawMessage.match(/Access for ([^expired]+) expired/i);
      if (matchInst && matchInst[1]) instName = matchInst[1].trim();
    }

    // Extract date if in message (e.g. 2026-09-09)
    const dateMatch = rawMessage.match(/\d{4}-\d{2}-\d{2}/);
    const expiryDate = err?.expiresAt || (dateMatch ? dateMatch[0] : null);

    if (isCampus) {
      return {
        title: 'Campus Subscription Expired',
        message: instName
          ? `Access for ${instName} concluded${expiryDate ? ` on ${expiryDate}` : ''}. Please contact your campus administrator to renew institutional licensing.`
          : `Your university's platform contract has concluded. Please reach out to your department administrator to renew access.`,
        type: 'expired',
        adminEmail,
        instituteName: instName,
        expiryDate
      };
    }

    return {
      title: 'Individual Subscription Expired',
      message: `Your individual subscription plan concluded${expiryDate ? ` on ${expiryDate}` : ''}. Please renew your plan to restore full simulation and lab access.`,
      type: 'expired',
      expiryDate
    };
  }

  // 2. Firebase Invalid Credential or Wrong Password
  if (
    rawCode === 'auth/invalid-credential' ||
    rawCode === 'auth/wrong-password' ||
    rawMessage.includes('auth/invalid-credential') ||
    rawMessage.includes('auth/wrong-password') ||
    rawMessage.toLowerCase().includes('incorrect password')
  ) {
    return {
      title: 'Incorrect Email or Password',
      message: 'The email address or password you entered does not match our records. Please double-check your credentials and try again.',
      type: 'error'
    };
  }

  // 3. User Not Found
  if (
    rawCode === 'auth/user-not-found' ||
    rawMessage.includes('auth/user-not-found') ||
    rawMessage.toLowerCase().includes('no registered account')
  ) {
    return {
      title: 'Account Not Registered',
      message: rawMessage && !rawMessage.includes('auth/')
        ? rawMessage
        : 'This email is not registered with our site. Please check the spelling or create an account first.',
      type: 'warning',
      action: 'join'
    };
  }

  // 4. Invalid Email Format
  if (
    rawCode === 'auth/invalid-email' ||
    rawMessage.includes('auth/invalid-email') ||
    rawMessage.toLowerCase().includes('valid institutional email')
  ) {
    return {
      title: 'Invalid Email Address',
      message: 'Please enter a valid email address (e.g. student@campus.edu).',
      type: 'error'
    };
  }

  // 5. Account Disabled
  if (rawCode === 'auth/user-disabled' || rawMessage.includes('auth/user-disabled')) {
    return {
      title: 'Account Deactivated',
      message: 'This account has been disabled by an administrator. Please reach out to your university department lead for assistance.',
      type: 'error'
    };
  }

  // 6. Too Many Requests (Rate limit/lockout)
  if (rawCode === 'auth/too-many-requests' || rawMessage.includes('auth/too-many-requests')) {
    return {
      title: 'Temporarily Locked Out',
      message: 'Access to this account has been temporarily disabled due to multiple failed login attempts. Please wait a few moments before trying again.',
      type: 'warning'
    };
  }

  // 7. Network / Connection issue
  if (rawCode === 'auth/network-request-failed' || rawMessage.includes('auth/network-request-failed')) {
    return {
      title: 'Network Connection Issue',
      message: 'Unable to reach the authentication service. Please verify your internet connection and try again.',
      type: 'error'
    };
  }

  // 8. Email Already In Use
  if (rawCode === 'auth/email-already-in-use' || rawMessage.includes('auth/email-already-in-use')) {
    return {
      title: 'Email Already In Use',
      message: 'An account is already registered with this email address. Please sign in with your password or use a different email.',
      type: 'warning'
    };
  }

  // 9. Weak Password
  if (rawCode === 'auth/weak-password' || rawMessage.includes('auth/weak-password')) {
    return {
      title: 'Password Too Short',
      message: 'Your password must be at least 6 characters long for security clearance.',
      type: 'error'
    };
  }

  // 10. Seat Quota Reached (Invite Token)
  if (rawMessage.toLowerCase().includes('quota') || rawMessage.toLowerCase().includes('seats allocated')) {
    return {
      title: 'Campus Seat Quota Reached',
      message: 'All available student licenses for your institution are currently claimed. Please contact your campus lead to expand quota capacity.',
      type: 'warning'
    };
  }

  // 11. Invalid Token (Invite Token)
  if (
    rawMessage.toLowerCase().includes('invalid or expired invite token') ||
    rawMessage.toLowerCase().includes('failed to claim seat with this token')
  ) {
    return {
      title: 'Invalid Invite Token',
      message: 'This invite code does not match any active campus enrollment pass. Please check the spelling or ask your instructor for a new code.',
      type: 'error'
    };
  }

  // 12. Fallback: Clean any raw Firebase prefixes
  let cleanMsg = rawMessage
    .replace(/^Firebase:\s*/i, '')
    .replace(/^Error\s*\([a-z0-9/-]+\):\s*/i, '')
    .replace(/\(auth\/[a-z0-9/-]+\)\.?/i, '')
    .trim();

  if (!cleanMsg || cleanMsg.toLowerCase() === 'error') {
    cleanMsg = 'Authentication could not be completed. Please check your credentials and try again.';
  }

  return {
    title: 'Authentication Notice',
    message: cleanMsg,
    type: 'error'
  };
};
