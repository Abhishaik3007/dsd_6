/**
 * Cryptographic utilities for secure OTP generation, salting, and SHA-256 hashing.
 * Powered by standard Web Crypto API (supported natively across modern browsers & Node.js).
 */

export const OTP_EXPIRATION_MINUTES = 15;
export const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically random 6-digit numeric OTP.
 */
export const generateSecureOtp = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Convert 32-bit uint to 6 digits in range 100000 - 999999
    const code = 100000 + (array[0] % 900000);
    return code.toString();
  }
  // Fallback
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a cryptographically random hex salt.
 */
export const generateSalt = (byteLength = 16) => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(byteLength);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Compute SHA-256 salted hash of an OTP code.
 * Payload: `${salt}:${code.trim()}`
 */
export const hashOtpWithSalt = async (code, salt) => {
  const cleanCode = String(code || '').trim();
  const payload = `${salt}:${cleanCode}`;

  const cryptoEngine = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (cryptoEngine?.subtle?.digest) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await cryptoEngine.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Pure JavaScript DJB2 fallback if SubtleCrypto is unavailable
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 33) ^ payload.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Verify candidate OTP code against stored salt and expected SHA-256 hash.
 * Compares candidate hash with expected hash in constant time.
 */
export const verifyOtpWithSalt = async (candidateCode, salt, expectedHash) => {
  if (!candidateCode || !salt || !expectedHash) return false;
  const computedHash = await hashOtpWithSalt(candidateCode, salt);
  
  if (computedHash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
};
