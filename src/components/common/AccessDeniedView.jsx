import React from 'react';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

export const AccessDeniedView = ({
  requiredRole = 'Administrative Clearance',
  title = 'Restricted Portal Clearance',
  description = 'You do not have the required administrative permissions to access this console.'
}) => {
  const { setActiveTab } = useHub();
  const { currentUser, logout } = useAuth();

  const isAccessLocked =
    requiredRole === 'Active Subscription' ||
    requiredRole === 'Active Seat License' ||
    currentUser?.isSubscriptionExpired;

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#203247] font-space-grotesk flex flex-col justify-between p-6 md:p-12 relative selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* Background Decorative Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-red-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#f0ece1] blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        {!isAccessLocked ? (
          <button
            onClick={() => setActiveTab('hub')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#647895] hover:text-[#203247] transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Back to Hub</span>
          </button>
        ) : (
          <div />
        )}

        <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
          signal<span className="text-[#347f7a] font-normal">school</span>
        </span>
      </header>

      {/* Main 403 Card */}
      <main className="relative z-10 my-auto py-10 max-w-lg mx-auto w-full">
        <div className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl shadow-xl overflow-hidden p-8 text-center backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-signal uppercase tracking-wider font-semibold bg-red-50 text-red-700 border border-red-200 mb-3">
            <Lock size={11} />
            <span>403 Forbidden Access</span>
          </div>

          <h2 className="font-display text-2xl font-normal text-[#203247] mb-2">
            {title}
          </h2>

          <p className="text-xs text-[#647895] leading-relaxed max-w-sm mx-auto mb-6">
            {description}
          </p>

          {/* Current User Identity Context */}
          {currentUser && (
            <div className="p-3.5 bg-white rounded-2xl border border-[#203247]/10 mb-6 text-left flex items-center justify-between">
              <div>
                <span className="block font-mono-signal text-[10px] uppercase text-[#647895] tracking-wider">
                  Current Session
                </span>
                <span className="text-xs font-semibold text-[#203247]">
                  {currentUser.email}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono-signal font-semibold bg-[#f5f3ed] text-[#203247] border border-[#203247]/10">
                {currentUser.roleLabel || currentUser.role || 'Member'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => {
                logout();
                setActiveTab('login');
              }}
              className="w-full h-11 bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm border-none"
            >
              <LogOut size={14} />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center py-2">
        <span className="font-mono-signal text-[10px] text-[#647895]">
          SignalSchool Role-Based Authorization Guard • Enforced Policy
        </span>
      </footer>
    </div>
  );
};
