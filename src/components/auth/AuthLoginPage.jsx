import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHub } from '../../context/HubContext';
import { useInstitute } from '../../context/InstituteContext';
import {
  ShieldCheck,
  Key,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Sparkles,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle,
  UserPlus,
  Loader2,
  X
} from 'lucide-react';
import { parseAuthError } from '../../utils/authErrorUtils';
import { SignalButtonLoader } from '../common/SignalButtonLoader';
import { VerifyEmailView } from './VerifyEmailView';
import { initiateEmailVerification } from '../../services/emailVerificationService';

export const AuthLoginPage = () => {
  const {
    isAuthenticated,
    currentUser,
    loginWithFirebase,
    resolveUserIdentity,
    superAdmin,
    hasSuperAdmin,
    registerSuperAdmin,
    sendPasswordReset
  } = useAuth();
  const { setActiveTab } = useHub();
  const { institutes, setActiveInstituteId, setCurrentRole, joinViaToken } = useInstitute();

  // If already authenticated, redirect out of login screen immediately
  useEffect(() => {
    if (isAuthenticated) {
      const destination = currentUser?.role === 'super-admin'
        ? 'super-admin'
        : currentUser?.role === 'institute-admin'
        ? 'admin'
        : 'hub';
      setActiveTab(destination, true);
    }
  }, [isAuthenticated, currentUser?.role, setActiveTab]);

  // If no Super Admin exists yet, guide the user to initialize one
  const [activeTab, setActiveAuthTab] = useState(hasSuperAdmin ? 'signin' : 'setup-admin'); // 'signin' | 'join' | 'setup-admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationPending, setVerificationPending] = useState(null);
  const [authError, setAuthError] = useState(null);
  const setErrorMsg = (err) => {
    if (!err) {
      setAuthError(null);
      return;
    }
    setAuthError(parseAuthError(err));
  };
  const errorMsg = authError?.message || '';
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot / Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Join Tab Fields
  const [inviteToken, setInviteToken] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  // Create Super Admin Tab Fields
  const [superName, setSuperName] = useState('');
  const [superEmail, setSuperEmail] = useState('');
  const [superPassword, setSuperPassword] = useState('');
  const [superConfirmPassword, setSuperConfirmPassword] = useState('');
  const [showSuperPassword, setShowSuperPassword] = useState(false);
  const [showSuperConfirmPassword, setShowSuperConfirmPassword] = useState(false);

  // Dynamically resolve identity in real-time as user types in signin
  const resolvedIdentity = resolveUserIdentity(email, institutes);

  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    setResetErrorMsg('');
    setResetSuccessMsg('');

    if (!resetEmail || !resetEmail.includes('@')) {
      setResetErrorMsg('Please enter a valid institutional email address.');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSuccessMsg(`Password reset instructions sent to ${resetEmail}. Check your inbox and spam folder.`);
    } catch (err) {
      console.error('Password reset error:', err);
      const parsed = parseAuthError(err);
      setResetErrorMsg(parsed?.message || 'Unable to send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await loginWithFirebase(email, password, institutes);
      if (!userProfile) {
        setErrorMsg('Unable to verify credentials.');
        setIsSubmitting(false);
        return;
      }

      if (userProfile.instituteId) {
        setActiveInstituteId(userProfile.instituteId);
      }

      if (userProfile.role === 'super-admin') {
        setCurrentRole('super-admin');
        setActiveTab('super-admin', true);
      } else if (userProfile.role === 'institute-admin') {
        setCurrentRole('institute-admin');
        setActiveTab('admin', true);
      } else {
        setCurrentRole('member');
        setActiveTab('hub', true);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      if (
        err?.code === 'auth/email-not-verified' ||
        err?.message?.toLowerCase().includes('not been verified') ||
        err?.message?.toLowerCase().includes('email not verified')
      ) {
        const targetEmail = (err.email || email).trim().toLowerCase();
        const targetName = err.userProfile?.name || '';

        // Dispatch branded verification email so the user receives the link & OTP
        initiateEmailVerification({
          email: targetEmail,
          name: targetName,
          userId: err.userProfile?.id || err.userProfile?.uid
        }).catch(console.warn);

        // Store password in session for auto-login after verification
        try {
          sessionStorage.setItem('signalschool_verify_password', password);
        } catch (_) {}

        // Directly navigate to verification page — zero error messages on existing form
        const targetRole = err.userProfile?.role || (targetEmail === superAdmin?.email?.toLowerCase() ? 'super-admin' : 'member');
        setVerificationPending({
          email: targetEmail,
          name: targetName,
          password,
          role: targetRole
        });
        setActiveTab('verify-email');
        return;
      }
      setErrorMsg(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTokenSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!inviteToken.trim()) {
      setErrorMsg('Please enter your institutional invite token.');
      return;
    }
    if (!joinName.trim() || !joinEmail.trim()) {
      setErrorMsg('Please enter your full name and campus email.');
      return;
    }
    if (!joinPassword || joinPassword.length < 6) {
      setErrorMsg('Please create an account password (at least 6 characters for Firebase Authentication).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinViaToken(inviteToken, joinName, joinEmail, joinPassword);
      if (!result.success) {
        setErrorMsg(result.error || 'Failed to claim seat with this token.');
        setIsSubmitting(false);
        return;
      }

      // Dispatch branded custom verification email
      try {
        await initiateEmailVerification({
          name: joinName,
          email: joinEmail,
          userId: result.member?.id,
          instituteId: result.institute?.id,
          instituteName: result.institute?.name,
          role: 'student'
        });
      } catch (mailErr) {
        console.warn('Could not dispatch verification email:', mailErr);
      }

      // Show VerifyEmailView directly — NO redirect to login
      setVerificationPending({
        email: joinEmail,
        name: joinName,
        instituteName: result.institute?.name,
        password: joinPassword
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error activating invite token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!superName.trim()) {
      setErrorMsg('Please enter a name for the Super Administrator.');
      return;
    }
    if (!superEmail.trim() || !superEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!superPassword || superPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long for Firebase Authentication.');
      return;
    }
    if (superPassword !== superConfirmPassword) {
      setErrorMsg('Passwords do not match. Please check and retype.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdAdmin = await registerSuperAdmin({
        name: superName,
        email: superEmail,
        password: superPassword
      });

      // Dispatch custom verification email record & OTP
      try {
        await initiateEmailVerification({
          name: superName,
          email: superEmail,
          userId: createdAdmin?.id || createdAdmin?.uid,
          role: 'super-admin'
        });
      } catch (mailErr) {
        console.warn('Could not dispatch custom verification email:', mailErr);
      }

      // Store password for automatic session creation once verified
      try {
        sessionStorage.setItem('signalschool_verify_password', superPassword);
      } catch (_) {}

      // Transition Super Admin directly to VerifyEmailView
      setVerificationPending({
        email: superEmail,
        name: superName,
        password: superPassword,
        role: 'super-admin'
      });
      setActiveTab('verify-email');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register Super Administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupAdmin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (setupPassword !== setupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and retype.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerSuperAdmin({
        name: setupName,
        email: setupEmail,
        password: setupPassword
      });

      setSuccessMsg('Central Administrator account initialized! Verification pass dispatched.');
      setVerificationPending({
        email: setupEmail.trim().toLowerCase(),
        name: setupName.trim(),
        password: setupPassword,
        role: 'super-admin'
      });
      setActiveTab('verify-email');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize administrator.');
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
          let loggedInProfile = null;
          if (verificationPending.password) {
            try {
              loggedInProfile = await loginWithFirebase(verificationPending.email, verificationPending.password, institutes);
            } catch (loginErr) {
              console.warn('Auto login after verification notice:', loginErr);
            }
          }
          const finalRole = loggedInProfile?.role || verificationPending.role;
          if (finalRole === 'super-admin') {
            setCurrentRole('super-admin');
            setActiveTab('super-admin', true);
          } else if (finalRole === 'institute-admin') {
            setCurrentRole('institute-admin');
            setActiveTab('admin', true);
          } else {
            setCurrentRole('member');
            setActiveTab('hub', true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#203247] font-space-grotesk flex flex-col justify-between p-4 sm:p-6 md:p-8 relative selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* Background Decorative Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#d9e8df]/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#f0ece1] blur-3xl" />
      </div>

      {/* Top Header / Back Nav */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <button
          onClick={() => setActiveTab('hub')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#647895] hover:text-[#203247] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
          className="text-decoration-none"
        >
          <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
            signal<span className="text-[#347f7a] font-normal">school</span>
          </span>
        </a>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 my-auto py-8 max-w-xl mx-auto w-full">
        <div className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Card Top Title Banner */}
          <div className="px-7 py-6 border-b border-[#203247]/10 bg-white/90">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-signal uppercase tracking-wider font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                <ShieldCheck size={12} />
                <span>Academic Gateway Authorization</span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-normal text-[#203247]">
              Enter SignalSchool
            </h2>
            <p className="text-xs text-[#647895] mt-1 font-mono-signal">
              Access digital labs, interactive CS visualizers, and academic spaces.
            </p>

            {/* Mode Switcher Tabs */}
            <div className={`mt-5 grid ${!hasSuperAdmin ? 'grid-cols-3' : 'grid-cols-2'} p-1 bg-[#f5f3ed] rounded-2xl border border-[#203247]/10 text-xs font-semibold`}>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-[#203247] shadow-xs'
                    : 'text-[#647895] hover:text-[#203247]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveAuthTab('join'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-white text-[#203247] shadow-xs'
                    : 'text-[#647895] hover:text-[#203247]'
                }`}
              >
                Join with Token
              </button>
              {!hasSuperAdmin && (
                <button
                  type="button"
                  onClick={() => { setActiveAuthTab('setup-admin'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'setup-admin'
                      ? 'bg-white text-[#203247] shadow-xs'
                      : 'text-[#647895] hover:text-[#203247]'
                  }`}
                >
                  <span>Create Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                </button>
              )}
            </div>
          </div>

          <div className="p-7 space-y-5">
            {authError && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-200 ${
                  authError.type === 'expired'
                    ? 'bg-amber-50/90 border-amber-300 text-[#203247] shadow-xs'
                    : authError.type === 'revoked'
                    ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                    : authError.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-xs'
                    : 'bg-red-50/90 border-red-200 text-red-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      authError.type === 'expired'
                        ? 'bg-amber-100 text-amber-800'
                        : authError.type === 'revoked'
                        ? 'bg-rose-100 text-rose-700'
                        : authError.type === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-xs text-[#203247]">
                        {authError.title}
                      </h4>
                      {authError.badge ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-signal font-semibold ${
                          authError.type === 'revoked'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-200/80 text-amber-900'
                        }`}>
                          {authError.badge}
                        </span>
                      ) : authError.type === 'expired' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-signal bg-amber-200/80 text-amber-900 font-semibold">
                          Renewal Required
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] leading-relaxed text-[#526b88] mt-1">
                      {authError.message}
                    </p>

                    {/* Action Button: Email Campus Administrator */}
                    {authError.adminEmail && (
                      <div className="mt-3 flex items-center gap-2">
                        <a
                          href={`mailto:${authError.adminEmail}?subject=SignalSchool%20Campus%20Subscription%20Renewal%20Request&body=Hello,%0D%0A%0D%0AOur%20institutional%20access%20to%20SignalSchool%20has%20concluded.%20Please%20assist%20with%20renewing%20our%20campus%20license.`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#203247] text-white hover:bg-[#347f7a] rounded-xl text-[11px] font-semibold transition-all no-underline shadow-2xs cursor-pointer"
                        >
                          <Mail size={12} />
                          <span>Contact Campus Admin ({authError.adminEmail})</span>
                        </a>
                      </div>
                    )}

                    {/* Action Button: Verify Email Screen */}
                    {authError.isUnverified && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setVerificationPending({ email: authError.email || email })}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#347f7a] text-white hover:bg-[#203247] rounded-xl text-[11px] font-semibold transition-all cursor-pointer border-none shadow-2xs"
                        >
                          <ShieldCheck size={13} />
                          <span>Enter Verification Code &rarr;</span>
                        </button>
                      </div>
                    )}

                    {/* Action Button: Switch to Join with Invite Token */}
                    {(authError.action === 'join' || authError.message?.toLowerCase().includes('invite token')) && activeTab === 'signin' && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => { setActiveAuthTab('join'); setErrorMsg(''); }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#347f7a] hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          <span>Claim a seat with an Invite Token instead</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}

                    {!hasSuperAdmin && activeTab === 'signin' && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => { setActiveAuthTab('setup-admin'); setErrorMsg(''); }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          <span>Initialize platform Super Admin account first</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
                <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Registered Account Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. your.email@domain.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                    />
                    <Mail size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                  </div>

                  {/* Real-Time Dynamic Identity Detection Pill */}
                  {resolvedIdentity ? (
                    <div className="mt-2.5 flex items-center gap-2 p-2 px-3 rounded-xl bg-white border border-[#203247]/10 shadow-2xs animate-fade-in">
                      <span className={`px-2 py-0.5 rounded font-mono-signal text-[9px] font-semibold border ${resolvedIdentity.badgeColor}`}>
                        {resolvedIdentity.roleLabel}
                      </span>
                      <span className="text-xs font-semibold text-[#203247] truncate">
                        {resolvedIdentity.name}
                      </span>
                      <span className="text-[10px] text-[#647895] truncate font-mono-signal">
                        • {resolvedIdentity.instituteName}
                      </span>
                    </div>
                  ) : email && email.includes('@') ? (
                    <div className="mt-2 text-[10px] text-[#8696ab] font-mono-signal flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span>Account must be provisioned or enrolled on a campus roster</span>
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email || '');
                        setResetErrorMsg('');
                        setResetSuccessMsg('');
                        setIsResetModalOpen(true);
                      }}
                      className="text-[11px] text-[#347f7a] hover:underline font-mono-signal cursor-pointer bg-transparent border-none p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-11 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                    />
                    <Lock size={15} className="absolute left-3.5 text-[#647895] pointer-events-none" />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
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
                  className="w-full h-11 bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none mt-2 relative overflow-hidden disabled:opacity-85"
                >
                  {isSubmitting ? (
                    <SignalButtonLoader label="Verifying Credentials..." variant="bars" />
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: JOIN WITH INVITE TOKEN */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinTokenSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#d9e8df]/30 border border-[#347f7a]/20 flex items-start gap-3">
                  <Key size={18} className="text-[#347f7a] shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-[#203247]">
                    <span className="font-semibold">Institutional Pass Enrollment</span>
                    <p className="text-[11px] text-[#647895] mt-0.5">
                      Provided by your campus administrator to claim a seat under your institution's license.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Invite Pass Token *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. stanford-lab-7x8k"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs font-mono-signal text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                      Campus Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maya@stanford.edu"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Create Account Password (Min 6 chars) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showJoinPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      name="join-student-password"
                      autoComplete="new-password"
                      placeholder="Create password (min 6 chars)"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className="w-full h-11 pl-4 pr-11 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowJoinPassword(!showJoinPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647895] hover:text-[#203247] transition-colors cursor-pointer border-none bg-transparent p-1.5 flex items-center justify-center rounded-lg z-10"
                      title={showJoinPassword ? 'Hide password' : 'Show password'}
                      aria-label={showJoinPassword ? 'Hide password' : 'Show password'}
                    >
                      {showJoinPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#347f7a] hover:bg-[#28635f] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none mt-2 relative overflow-hidden disabled:opacity-85"
                >
                  {isSubmitting ? (
                    <SignalButtonLoader label="Verifying & Claiming Seat..." variant="bars" />
                  ) : (
                    <>
                      <span>Claim Seat & Enter Workspace</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: CREATE / SETUP SUPER ADMIN */}
            {activeTab === 'setup-admin' && !hasSuperAdmin && (
              <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Super Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Administrator or Your Name"
                    value={superName}
                    onChange={(e) => setSuperName(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a]"
                  />
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Super Admin Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. master.admin@domain.edu"
                      value={superEmail}
                      onChange={(e) => setSuperEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                    <Mail size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showSuperPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Master password (min 6 chars)"
                        value={superPassword}
                        onChange={(e) => setSuperPassword(e.target.value)}
                        className="w-full h-11 pl-4 pr-11 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowSuperPassword(!showSuperPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647895] hover:text-[#203247] transition-colors cursor-pointer border-none bg-transparent p-1.5 flex items-center justify-center rounded-lg z-10"
                        title={showSuperPassword ? 'Hide password' : 'Show password'}
                        aria-label={showSuperPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSuperPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                      Confirm Password *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showSuperConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Confirm master password"
                        value={superConfirmPassword}
                        onChange={(e) => setSuperConfirmPassword(e.target.value)}
                        className="w-full h-11 pl-4 pr-11 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowSuperConfirmPassword(!showSuperConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647895] hover:text-[#203247] transition-colors cursor-pointer border-none bg-transparent p-1.5 flex items-center justify-center rounded-lg z-10"
                        title={showSuperConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-label={showSuperConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSuperConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none mt-2 relative overflow-hidden disabled:opacity-85"
                >
                  {isSubmitting ? (
                    <SignalButtonLoader label="Creating Super Admin..." variant="bars" />
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Create Super Administrator</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-[11px] font-mono-signal text-[#647895]">
        SignalSchool Unified Academic Core • Dynamic Identity Architecture
      </footer>

      {/* MODAL: RESET PASSWORD */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203247]/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#203247]/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center shadow-2xs">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-normal text-[#203247]">Reset Account Password</h3>
                  <p className="text-[11px] text-[#647895] font-mono-signal mt-0.5">Firebase recovery instructions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-1.5 rounded-full hover:bg-[#f5f3ed] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {resetErrorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{resetErrorMsg}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendResetPassword} className="space-y-4">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Registered Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. your.email@domain.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                  />
                  <Mail size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                </div>
                <p className="text-[10px] text-[#647895] font-mono-signal mt-1.5 leading-relaxed">
                  We will send a secure password reset link directly to your inbox. You can click the link to choose a new password.
                </p>
              </div>

              <div className="pt-3 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] disabled:opacity-80 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-2 relative overflow-hidden"
                >
                  {isSendingReset ? (
                    <SignalButtonLoader label="Sending Reset Link..." variant="dots" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
