import React, { useState, useEffect } from 'react';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export const JoinInvitePage = () => {
  const { institutes, joinViaToken } = useInstitute();
  const { setActiveTab } = useHub();

  const [token, setToken] = useState('');
  const [targetInst, setTargetInst] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramToken = urlParams.get('token') || window.location.pathname.replace(/^\/join\/?/, '');
      const activeToken = paramToken || 'apex-fall-2026';
      setToken(activeToken);

      const found = institutes.find(i => i.inviteToken === activeToken);
      if (found) {
        setTargetInst(found);
      } else {
        setErrorMsg('Invalid or expired institutional invite token.');
      }
    }
  }, [institutes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName || !studentEmail) {
      setErrorMsg('Please enter your full name and institutional email.');
      return;
    }

    const result = joinViaToken(token, studentName, studentEmail);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setActiveTab('hub');
      }, 1600);
    } else {
      setErrorMsg(result.error || 'Failed to claim seat license.');
    }
  };

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

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder={`e.g. maya@${targetInst.domain}`}
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                    />
                    <p className="font-mono-signal text-[10px] text-[#647895] mt-1.5">
                      Preferably use your campus email: @{targetInst.domain}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full py-3.5 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>Activate License & Enter Workspace</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-display text-2xl font-normal text-[#203247] mb-2">
                  Expired or Invalid Token
                </h3>
                <p className="text-xs text-[#647895] mb-6">
                  The link you followed seems to be invalid or has expired. Please check with your professor or lab administrator.
                </p>
                <button
                  onClick={() => setActiveTab('hub')}
                  className="bg-[#203247] text-[#f6f3eb] rounded-full px-5 py-2.5 text-xs font-semibold hover:bg-[#347f7a] transition-colors"
                >
                  Return to Public Hub
                </button>
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
