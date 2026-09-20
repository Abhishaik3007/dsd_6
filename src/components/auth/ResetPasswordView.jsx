import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { useHub } from '../../context/HubContext';
import { SignalButtonLoader } from '../common/SignalButtonLoader';

export const ResetPasswordView = () => {
  const { setActiveTab } = useHub();

  const [oobCode, setOobCode] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRequestingNewLink, setIsRequestingNewLink] = useState(false);
  const [newLinkSent, setNewLinkSent] = useState(false);

  // Extract query parameters from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    const emailParam = params.get('email');

    if (emailParam) {
      setTargetEmail(emailParam);
    }

    if (!code) {
      setIsValidatingCode(false);
      setIsCodeValid(false);
      setValidationError('No password reset code found in URL. Please request a new link.');
      return;
    }

    setOobCode(code);
    console.log('[ResetPasswordView] Verifying action code:', code);

    // Verify the action code with Firebase Auth
    if (isFirebaseConfigured && auth) {
      verifyPasswordResetCode(auth, code)
        .then((verifiedEmail) => {
          console.log('[ResetPasswordView] Code verified successfully for email:', verifiedEmail);
          setIsCodeValid(true);
          setIsValidatingCode(false);
          if (verifiedEmail) setTargetEmail(verifiedEmail);
        })
        .catch((err) => {
          console.warn('[ResetPasswordView] Action code error:', err.code, err.message);
          setIsValidatingCode(false);
          setIsCodeValid(false);
          if (err.code === 'auth/expired-action-code') {
            setValidationError('This password reset link has expired. Please request a fresh reset link.');
          } else if (err.code === 'auth/invalid-action-code') {
            setValidationError('This password reset link is invalid or has already been superseded by a newer link.');
          } else {
            setValidationError('Unable to verify reset link. Please request a new one.');
          }
        });
    } else {
      setIsCodeValid(true);
      setIsValidatingCode(false);
    }
  }, []);

  const handleRequestNewLink = async () => {
    if (!targetEmail) {
      setActiveTab('login');
      return;
    }
    setIsRequestingNewLink(true);
    try {
      const resp = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.success) {
        setNewLinkSent(true);
      } else if (resp.status === 404 || data?.code === 'auth/user-not-found') {
        setValidationError(data?.error || `No registered account found with email ${targetEmail}.`);
      } else {
        setValidationError(data?.error || 'Unable to generate password reset link.');
      }
    } catch (err) {
      console.warn('Error requesting fresh reset link:', err);
    } finally {
      setIsRequestingNewLink(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-amber-400' };
    if (score <= 4) return { score: 2, label: 'Good', color: 'bg-[#347f7a]' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmitReset = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFirebaseConfigured && auth && oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
      }

      setIsSuccess(true);

      // Clean up URL without triggering full reload
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (err) {
      console.error('confirmPasswordReset error:', err);
      if (err.code === 'auth/expired-action-code') {
        setSubmitError('This link has expired. Please request a new password reset email.');
      } else if (err.code === 'auth/invalid-action-code') {
        setSubmitError('This link has already been used. Please request a new link.');
      } else {
        setSubmitError(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
            Security &bull; Password Recovery
          </span>
        </div>
      </nav>

      {/* Main Center Form */}
      <main className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/95 border border-[#203247]/10 rounded-3xl p-8 sm:p-10 shadow-xl backdrop-blur-md">
            
            {/* 1. Loading State */}
            {isValidatingCode && (
              <div className="py-12 text-center">
                <RefreshCw size={28} className="animate-spin text-[#347f7a] mx-auto mb-4" />
                <p className="text-xs font-mono uppercase tracking-widest text-[#647895] font-semibold">
                  Validating security pass...
                </p>
              </div>
            )}

            {/* 2. Invalid or Expired Token State */}
            {!isValidatingCode && !isCodeValid && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200 shadow-xs">
                  <AlertCircle size={32} />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#203247] mb-2">
                  Link Invalid or Superseded
                </h2>
                <p className="text-xs sm:text-sm text-[#526b88] leading-relaxed mb-6">
                  {validationError || 'This password reset link is invalid or has already been superseded by a newer request.'}
                </p>

                {newLinkSent ? (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-1">
                    <p className="font-semibold text-emerald-900">Brand-new link dispatched!</p>
                    <p className="text-emerald-700 text-[11px]">
                      A fresh reset link has been sent to {targetEmail || 'your email'}. Please check your inbox and click the newest email.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {targetEmail && (
                      <button
                        type="button"
                        disabled={isRequestingNewLink}
                        onClick={handleRequestNewLink}
                        className="w-full py-3 rounded-full bg-[#347f7a] hover:bg-[#203247] text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm disabled:opacity-50"
                      >
                        {isRequestingNewLink ? (
                          <SignalButtonLoader label="Sending fresh link..." />
                        ) : (
                          <>
                            <span>Send Fresh Reset Link to {targetEmail}</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full py-3 rounded-full bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* 3. Password Successfully Changed State */}
            {!isValidatingCode && isCodeValid && isSuccess && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#d9e8df] text-[#347f7a] flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <CheckCircle2 size={36} strokeWidth={2.2} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold mb-2">
                  password updated
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#203247] mb-3">
                  All Set!
                </h1>
                <p className="text-xs sm:text-sm text-[#526b88] leading-relaxed mb-6">
                  Your SignalSchool account password has been successfully reset. You can now sign in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full py-3 rounded-full bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
                >
                  <span>Sign In Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* 4. Active Reset Password Form */}
            {!isValidatingCode && isCodeValid && !isSuccess && (
              <div>
                {/* Header Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#eaf3ee] border border-[#347f7a]/20 text-[#347f7a] flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <KeyRound size={30} strokeWidth={2} />
                </div>

                <div className="text-center mb-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold mb-1.5">
                    account security
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#203247] mb-2">
                    Create New Password
                  </h1>
                  {targetEmail && (
                    <p className="text-xs text-[#526b88]">
                      for <span className="font-mono font-medium text-[#203247]">{targetEmail}</span>
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                    <AlertCircle size={15} className="shrink-0 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReset} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#647895] font-semibold mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 bg-[#fcfbf8] border border-[#203247]/15 rounded-xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/20 transition-all font-mono"
                      />
                      <Lock size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#647895] hover:text-[#203247] transition-colors border-none bg-transparent cursor-pointer p-0"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#647895] mb-1">
                          <span>Strength:</span>
                          <span className="font-semibold text-[#203247]">{strength.label}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`}></div>
                          <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`}></div>
                          <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#647895] font-semibold mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full h-11 pl-10 pr-10 bg-[#fcfbf8] border rounded-xl text-xs text-[#203247] outline-none transition-all font-mono ${
                          confirmPassword && !passwordsMatch
                            ? 'border-[#d06b64] focus:border-[#c85a53] focus:ring-2 focus:ring-[#c85a53]/20'
                            : 'border-[#203247]/15 focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/20'
                        }`}
                      />
                      <Lock size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-[#647895] hover:text-[#203247] transition-colors border-none bg-transparent cursor-pointer p-0"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-[10px] text-[#c85a53] font-mono mt-1">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !passwordsMatch || newPassword.length < 6}
                    className="w-full py-3 rounded-full bg-[#203247] hover:bg-[#347f7a] disabled:opacity-40 disabled:cursor-not-allowed text-[#f6f3eb] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm mt-5"
                  >
                    {isSubmitting ? (
                      <SignalButtonLoader label="Updating Security Credentials..." />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center pt-4 border-t border-[#203247]/10">
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
        SignalSchool Platform &bull; Scaled for Universities &amp; Curious Minds
      </footer>
    </div>
  );
};
