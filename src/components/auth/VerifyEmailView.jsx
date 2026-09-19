import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Lock
} from 'lucide-react';
import {
  verifyAccountCredentials,
  initiateEmailVerification,
  checkAccountIsVerified
} from '../../services/emailVerificationService';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';

export const VerifyEmailView = ({
  email: initialEmail = '',
  name = '',
  instituteName = '',
  onVerified = null
}) => {
  const { setActiveTab } = useHub();
  const { currentUser, loginWithFirebase } = useAuth();

  // Extract query params for magic link verification
  const [urlToken, setUrlToken] = useState(null);
  const [targetEmail, setTargetEmail] = useState(() => {
    if (initialEmail) return initialEmail;
    if (currentUser?.email) return currentUser.email;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) return emailParam;
      try {
        const stored = localStorage.getItem('signalschool_pending_verification');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) return parsed.email;
        }
      } catch (_) { }
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('verify_token');
      const emailParam = params.get('email');
      if (token) setUrlToken(token);
      if (emailParam) setTargetEmail(emailParam);
    }
  }, [currentUser]);

  // 6-digit OTP input states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  const handleProceedAfterVerified = async () => {
    // 1. If onVerified callback was passed, execute it
    if (onVerified) {
      await onVerified({ success: true, email: targetEmail });
      return;
    }

    // 2. Check if password was cached during sign-in attempt
    let savedPassword = null;
    try {
      savedPassword = sessionStorage.getItem('signalschool_verify_password');
    } catch (_) {}

    if (savedPassword && loginWithFirebase) {
      try {
        const userProfile = await loginWithFirebase(targetEmail, savedPassword);
        try {
          sessionStorage.removeItem('signalschool_verify_password');
        } catch (_) {}

        if (userProfile?.role === 'super-admin') {
          setActiveTab('super-admin', true);
          return;
        } else if (userProfile?.role === 'institute-admin') {
          setActiveTab('admin', true);
          return;
        } else {
          setActiveTab('hub', true);
          return;
        }
      } catch (loginErr) {
        console.warn('Auto login after verification notice:', loginErr);
      }
    }

    // 3. Fallback: navigate to sign in page so the user can enter credentials
    setActiveTab('login', true);
  };

  // Live auto-check if account has already been verified in Firestore (e.g. verified via link in another tab)
  useEffect(() => {
    if (!targetEmail) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const verified = await checkAccountIsVerified({
          email: targetEmail,
          userId: currentUser?.uid || currentUser?.id
        });
        if (verified && isMounted) {
          setIsVerified(true);
          setTimeout(() => {
            handleProceedAfterVerified();
          }, 1600);
        }
      } catch (err) {
        console.warn('Auto verification check notice:', err);
      }
    };

    // Check once when switching back to tab
    window.addEventListener('focus', checkStatus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', checkStatus);
    };
  }, [targetEmail, currentUser]);

  // Auto-verify if URL token is present
  useEffect(() => {
    if (urlToken) {
      handleVerify({ token: urlToken });
    }
  }, [urlToken]);

  // Cooldown timer for Resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    // Handle pasting a 6-digit code
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6);
      if (cleanDigits.length > 0) {
        setHasError(false);
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = cleanDigits[i] || '';
        }
        setOtp(newOtp);
        const focusIdx = Math.min(cleanDigits.length, 5);
        inputRefs.current[focusIdx]?.focus();

        if (cleanDigits.length === 6) {
          handleVerify({ code: cleanDigits, email: targetEmail });
        }
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMessage('');
    setHasError(false);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, trigger verification automatically
    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      handleVerify({ code: newOtp.join(''), email: targetEmail });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async ({ token = null, code = null, email = targetEmail }) => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await verifyAccountCredentials({
        token: token || urlToken,
        code: code || otp.join(''),
        email
      });

      if (result.success) {
        setIsVerified(true);
        setHasError(false);
        setTimeout(() => {
          handleProceedAfterVerified();
        }, 1600);
      } else {
        // Verification failed: turn inputs to refined subtle coral/slate-red, subtle shake
        setHasError(true);
        setIsWiggling(true);
        setTimeout(() => {
          setIsWiggling(false);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    } catch (err) {
      setHasError(true);
      setIsWiggling(true);
      setTimeout(() => {
        setIsWiggling(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 500);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !targetEmail) return;
    setResendCooldown(60);
    setResendSuccess('');
    setErrorMessage('');

    try {
      await initiateEmailVerification({
        email: targetEmail,
        name: name || currentUser?.name || 'Learner',
        userId: currentUser?.uid || currentUser?.id,
        instituteName
      });
      setResendSuccess('A fresh verification link and code have been sent to your email.');
      setTimeout(() => setResendSuccess(''), 6000);
    } catch (e) {
      setErrorMessage('Could not resend email. Please try again in a moment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#203247] font-space-grotesk flex flex-col justify-between selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* Top Navbar */}
      <nav className="border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className="flex items-center text-decoration-none group cursor-pointer border-none bg-transparent p-0"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </button>
          <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895] flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={14} className="text-[#347f7a]" />
            Account Verification
          </span>
        </div>
      </nav>

      {/* Center Card */}
      <main className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/95 border border-[#203247]/10 rounded-3xl p-8 sm:p-10 shadow-xl backdrop-blur-md text-center">

            {isVerified ? (
              /* Success State */
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#d9e8df] text-[#347f7a] flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <CheckCircle2 size={36} strokeWidth={2.2} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold mb-2">
                  account activated
                </p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-[#203247] mb-3">
                  Email Verified!
                </h1>
                <p className="text-sm text-[#526b88] leading-relaxed mb-6">
                  Your SignalSchool laboratory pass is confirmed. Redirecting you to your digital workspace...
                </p>
                <button
                  type="button"
                  onClick={handleProceedAfterVerified}
                  className="w-full py-3 rounded-full bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
                >
                  <span>Enter SignalSchool Workspace</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              /* Verification Pending State */
              <div>
                {/* Animated Mail Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#eaf3ee] border border-[#347f7a]/20 text-[#347f7a] flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <Mail size={32} strokeWidth={1.8} className="animate-pulse" />
                </div>

                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold mb-2">
                  verify your email
                </p>

                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#203247] mb-2">
                  Check your inbox
                </h1>

                <p className="text-xs sm:text-sm text-[#526b88] leading-relaxed mb-5">
                  We sent a verification link and a 6-digit code to:
                  <br />
                  <span className="font-mono font-semibold text-[#203247] bg-[#f6f4ee] px-2.5 py-1 rounded-md inline-block mt-1.5 border border-[#203247]/10">
                    {targetEmail || 'your email address'}
                  </span>
                </p>

                {/* 6-Digit OTP Boxes */}
                <div className="mb-6">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#647895] font-semibold mb-3">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className={`flex items-center justify-center gap-2 sm:gap-2.5 transition-transform ${isWiggling ? 'animate-wiggle-squiggle' : ''}`}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => inputRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onFocus={() => {
                          if (hasError) setHasError(false);
                        }}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        className={`w-10 sm:w-12 h-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border focus:outline-none transition-all duration-200 ${hasError
                            ? 'border-[#d06b64] bg-[#fcfbf8] text-[#c85a53] focus:border-[#c85a53] focus:ring-2 focus:ring-[#c85a53]/20'
                            : 'border-[#203247]/15 bg-[#fcfbf8] text-[#203247] focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/20'
                          }`}
                        placeholder="•"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  disabled={isVerifying || otp.some(d => !d)}
                  onClick={() => handleVerify({ code: otp.join('') })}
                  className="w-full py-3 rounded-full bg-[#203247] hover:bg-[#347f7a] disabled:opacity-40 disabled:cursor-not-allowed text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm mb-4"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Activate Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Error message */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                    <AlertCircle size={15} className="shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Resend success notice */}
                {resendSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-[#d9e8df] border border-[#347f7a]/30 text-[#347f7a] text-xs flex items-center gap-2 text-left font-medium">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{resendSuccess}</span>
                  </div>
                )}

                {/* Resend Section */}
                <div className="pt-4 border-t border-[#203247]/10 flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-[#647895]">
                    <span>Didn't receive the email?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResend}
                      className="font-semibold text-[#347f7a] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer border-none bg-transparent p-0"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                    </button>
                  </div>
                </div>

                {/* Back to Login */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-medium text-[#647895] hover:text-[#203247] transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#203247]/10 py-4 text-center text-xs text-[#647895]">
        SignalSchool &bull; Scaled for Universities &amp; Curious Minds
      </footer>
    </div>
  );
};
