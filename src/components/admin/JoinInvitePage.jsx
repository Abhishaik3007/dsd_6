import React, { useState, useEffect } from 'react';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import { VerifyEmailView } from '../auth/VerifyEmailView';
import { initiateEmailVerification } from '../../services/emailVerificationService';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Zap,
  ArrowUpRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export const JoinInvitePage = () => {
  const { institutes, joinViaToken } = useInstitute();
  const { setActiveTab } = useHub();
  const { loginWithFirebase } = useAuth();

  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [targetInst, setTargetInst] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationPending, setVerificationPending] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const rawParam = urlParams.get('token') || window.location.pathname.replace(/^\/join\/?/, '');
      const paramToken = rawParam ? rawParam.trim() : '';

      if (paramToken) {
        setToken(paramToken);
        setTokenInput(paramToken);
        const found = institutes.find(i => i.inviteToken === paramToken);
        if (found) {
          setTargetInst(found);
          setErrorMsg('');
        } else {
          setErrorMsg('Invalid or expired institutional invite token.');
        }
      }
    }
  }, [institutes]);

  const handleVerifyManualToken = (e) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) return;
    setToken(cleanToken);
    const found = institutes.find(i => i.inviteToken === cleanToken);
    if (found) {
      setTargetInst(found);
      setErrorMsg('');
    } else {
      setErrorMsg('No active institution found matching this invite code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName || !studentEmail) {
      setErrorMsg('Please enter your full name and institutional email.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Please create an account password (at least 6 characters for Firebase Authentication).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinViaToken(token, studentName, studentEmail, password);
      if (result.success) {
        // Dispatch branded custom verification email
        try {
          await initiateEmailVerification({
            name: studentName,
            email: studentEmail,
            userId: result.member?.id,
            instituteId: targetInst?.id,
            instituteName: targetInst?.name,
            role: 'student'
          });
        } catch (mailErr) {
          console.warn('Could not dispatch verification email:', mailErr);
        }

        // Show dedicated VerifyEmailView screen directly — NO redirect to login
        setVerificationPending({
          email: studentEmail,
          name: studentName,
          instituteName: targetInst?.name,
          password: password
        });
      } else {
        setErrorMsg(result.error || 'Failed to claim seat license.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to claim seat license.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationPending) {
    return (
      <VerifyEmailView
        email={verificationPending.email}
        name={verificationPending.name}
        instituteName={verificationPending.instituteName}
        onVerified={async () => {
          if (loginWithFirebase && verificationPending.password) {
            try {
              await loginWithFirebase(verificationPending.email, verificationPending.password, institutes);
            } catch (_) {}
          }
          setActiveTab('hub');
        }}
      />
    );
  }

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb] font-space-grotesk flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
            className="flex items-center text-decoration-none group cursor-pointer"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>
          <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895]">
            student onboarding
          </span>
        </div>
      </nav>

      {/* Center Container with Grid Background */}
      <div className="relative flex-1 flex items-center justify-center p-6 bg-grid-paper">
        <div className="w-full max-w-lg">
          <div className="bg-white/95 border border-[#203247]/10 rounded-3xl p-8 shadow-sm backdrop-blur-md">
            {isSuccess ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#d9e8df] text-[#347f7a] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display text-3xl font-normal text-[#203247] mb-2">
                  Seat License Claimed!
                </h3>
                <p className="text-sm text-[#526b88] mb-6">
                  You are now registered in <strong className="text-[#203247]">{targetInst?.name}</strong>. Entering your laboratory workspace...
                </p>
                <div className="w-6 h-6 border-2 border-[#347f7a] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : targetInst ? (
              <div>
                {/* Header Tag */}
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold mb-3">
                  <span className="h-2 w-2 rounded-full bg-[#f09a7d]" />
                  institutional access pass
                </p>

                <h1 className="font-display text-3xl sm:text-4xl leading-[1.05] tracking-tight text-[#203247] mb-3">
                  Join <em className="italic font-normal text-[#347f7a]">{targetInst.name}</em>
                </h1>

                <p className="text-sm text-[#526b88] leading-relaxed mb-6">
                  Enter your details below to activate your seat and unlock immediate access to interactive digital logic labs, DSA visualizers, and algorithm studios.
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                      Institutional Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={`e.g. learner@${targetInst.domain}`}
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                    <p className="font-mono-signal text-[10px] text-[#647895] mt-1.5">
                      Preferably use your campus email: @{targetInst.domain}
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                      Create Account Password (Min 6 chars) *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        id="student-registration-password"
                        name="student-registration-password"
                        autoComplete="new-password"
                        placeholder="Create password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647895] hover:text-[#203247] transition-colors cursor-pointer border-none bg-transparent p-1.5 flex items-center justify-center rounded-lg z-10"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] disabled:opacity-60 disabled:cursor-not-allowed rounded-full py-3.5 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Provisioning Account in Firebase...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate License & Enter Workspace</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#f5f3ed] text-[#347f7a] border border-[#203247]/10 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-display text-2xl font-normal text-[#203247] mb-2">
                  Institutional Pass Required
                </h3>
                <p className="text-xs text-[#647895] mb-5 leading-relaxed">
                  Enter the invite code or lab pass token provided by your professor or campus department administrator.
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2 text-left">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyManualToken} className="space-y-3 text-left">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                      Invite Token / Lab Pass Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. campus-pass-2026"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm font-mono-signal text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full py-3 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center justify-center gap-2"
                  >
                    <span>Verify Code & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#203247]/10">
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs text-[#647895] hover:text-[#203247] transition-colors cursor-pointer bg-transparent border-none"
                  >
                    ← Return to Public Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="border-t border-[#203247]/10 py-4 px-6 text-center">
        <span className="font-mono-signal text-[10px] text-[#647895] tracking-[0.15em] uppercase">
          signal school • enterprise student gateway
        </span>
      </footer>
    </div>
  );
};
