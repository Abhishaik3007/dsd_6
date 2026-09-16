import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';

export const AuthLoginPage = () => {
  const { loginWithFirebase, resolveUserIdentity, isFirebaseConfigured } = useAuth();
  const { setActiveTab } = useHub();
  const { institutes, setActiveInstituteId, setCurrentRole } = useInstitute();

  const [activeTab, setActiveAuthTab] = useState('signin'); // 'signin' | 'join'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically resolve identity in real-time as user types
  const resolvedIdentity = resolveUserIdentity(email, institutes);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

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
        setActiveTab('super-admin');
      } else if (userProfile.role === 'institute-admin') {
        setCurrentRole('institute-admin');
        setActiveTab('admin');
      } else {
        setCurrentRole('member');
        setActiveTab('hub');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTokenSubmit = (e) => {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setErrorMsg('Please enter your institutional invite token.');
      return;
    }
    setActiveTab('join');
  };

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-signal uppercase tracking-wider font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20 mb-2.5">
              <ShieldCheck size={12} />
              <span>Academic Gateway Authorization</span>
            </div>
            <h2 className="font-display text-2xl font-normal text-[#203247]">
              Enter SignalSchool
            </h2>
            <p className="text-xs text-[#647895] mt-1 font-mono-signal">
              Access digital labs, interactive CS visualizers, and academic spaces.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-5 grid grid-cols-2 p-1 bg-[#f5f3ed] rounded-2xl border border-[#203247]/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveAuthTab('signin'); setErrorMsg(''); }}
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
                onClick={() => { setActiveAuthTab('join'); setErrorMsg(''); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-white text-[#203247] shadow-xs'
                    : 'text-[#647895] hover:text-[#203247]'
                }`}
              >
                Join with Invite Token
              </button>
            </div>
          </div>

          <div className="p-7 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                    />
                    <Mail size={15} className="absolute left-3.5 top-3 text-[#647895]" />
                  </div>

                  {/* Real-Time Dynamic Identity Detection Pill */}
                  {resolvedIdentity && (
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
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] font-medium">
                      Password
                    </label>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-[#347f7a] hover:underline font-mono-signal">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                    />
                    <Lock size={15} className="absolute left-3.5 text-[#647895] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#647895] hover:text-[#203247] transition-colors cursor-pointer border-none bg-transparent p-1 flex items-center justify-center rounded-lg"
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
                  className="w-full h-11 bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none mt-2"
                >
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
                  <ArrowRight size={14} />
                </button>

                <div className="pt-2 text-center">
                  <p className="font-mono-signal text-[11px] text-[#647895]">
                    Enter your registered email to automatically connect to your institution workspace.
                  </p>
                </div>
              </form>
            )}

            {/* TAB 2: JOIN WITH INVITE TOKEN */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinTokenSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#d9e8df]/30 border border-[#347f7a]/20 flex items-start gap-3">
                  <Key size={18} className="text-[#347f7a] shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-[#203247]">
                    <span className="font-semibold">Have an institutional license code?</span>
                    <p className="text-[11px] text-[#647895] mt-0.5">
                      Provided by your department administrator to claim a registered seat under your university license.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                    Invite Token / Lab Pass
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-fall-2026"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs font-mono-signal text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#347f7a] hover:bg-[#28635f] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none"
                >
                  <span>Verify Token & Claim Seat</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-[11px] font-mono-signal text-[#647895]">
        SignalSchool Unified Academic Core • End-to-End Encrypted Identity
      </footer>
    </div>
  );
};
