import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  GraduationCap,
  Building,
  X,
  Key,
  Mail,
  Lock
} from 'lucide-react';

export const CampusQrPassModal = ({
  isOpen,
  onClose,
  institute,
  inviteUrl
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const currentToken = institute?.inviteToken || '';
  const effectiveInviteUrl =
    inviteUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${currentToken}`
      : `/join?token=${currentToken}`);
  const seatsRemaining = Math.max(0, (institute?.maxSeats || 0) - (institute?.seatsUsed || 0));

  // Generate QR code
  useEffect(() => {
    if (effectiveInviteUrl) {
      QRCode.toDataURL(effectiveInviteUrl, {
        width: 360,
        margin: 1.5,
        color: {
          dark: '#203247',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR Code:', err));
    }
  }, [effectiveInviteUrl]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(currentToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyTemplate = () => {
    const template =
      `Join ${institute?.name || 'our Campus'} on SignalSchool Labs:\n\n` +
      `1. Open: ${effectiveInviteUrl} (or scan the classroom QR pass)\n` +
      `2. Use your institutional email: @${institute?.domain || 'campus.edu'}\n` +
      `3. Choose your password (min 6 chars)\n` +
      `Invite Token: ${currentToken}\n`;

    navigator.clipboard.writeText(template);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#162230]/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fbf9f4] border border-[#203247]/20 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden font-space-grotesk text-[#203247]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[#203247]/10 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center shrink-0 shadow-2xs">
              <QrCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-bold">
                  Campus Onboarding Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#347f7a]/10 text-[#347f7a] font-mono-signal text-[9px] font-semibold">
                  Active Pass
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-normal text-[#203247]">
                Student Onboarding QR Pass
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f3ed] hover:bg-[#ebe6da] text-[#647895] hover:text-[#203247] flex items-center justify-center transition-colors cursor-pointer border border-[#203247]/10"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* SUB-BAR: CAMPUS BADGE & REMAINING SEATS */}
        <div className="px-6 sm:px-8 py-3 bg-[#fbf9f4] border-b border-[#203247]/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#203247]">
            <Building size={14} className="text-[#347f7a]" />
            <span>{institute?.name}</span>
          </div>

          <div className="font-mono-signal text-[11px] text-[#647895] flex items-center gap-2">
            <span className="text-[#347f7a] font-semibold">{seatsRemaining} seats available</span>
            <span>•</span>
            <span className="bg-[#d9e8df]/60 text-[#347f7a] px-2 py-0.5 rounded-full border border-[#347f7a]/20">
              @{institute?.domain || 'campus.edu'}
            </span>
          </div>
        </div>

        {/* MODAL BODY (CLEAN 2-COLUMN LAYOUT) */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT COLUMN: QR Code Card */}
            <div className="lg:col-span-5 bg-white border border-[#203247]/10 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between text-center shadow-xs">
              <div className="relative p-3.5 bg-white rounded-2xl border-2 border-dashed border-[#203247]/15 shadow-inner flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Student Onboarding QR Code"
                    className="w-52 h-52 sm:w-56 sm:h-56 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs font-mono-signal text-[#647895]">
                    Generating QR code...
                  </div>
                )}

                {/* Centered Insignia */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-white/95 border border-[#203247]/15 shadow-md flex items-center justify-center">
                    <GraduationCap size={19} className="text-[#347f7a]" />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d9e8df] text-[#347f7a] text-[11px] font-mono-signal font-semibold mt-3">
                <span className="w-2 h-2 rounded-full bg-[#347f7a] animate-pulse" />
                <span>Scan with Smartphone Camera</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Streamlined Student Setup Info */}
            <div className="lg:col-span-7 bg-[#f5f3ed] border border-[#203247]/10 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-bold">
                    Account Provisioning Credentials
                  </span>
                  <h3 className="font-display text-xl font-normal text-[#203247] mt-0.5">
                    Required Student Information
                  </h3>
                </div>

                {/* Clean Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#203247]/10">
                    <div className="flex items-center gap-1.5 mb-1 text-[#647895]">
                      <Mail size={12} className="text-[#347f7a]" />
                      <span className="font-mono-signal text-[10px] uppercase tracking-wider">
                        Campus Email Domain
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#347f7a] font-mono-signal truncate block">
                      @{institute?.domain || 'campus.edu'}
                    </span>
                    <span className="text-[10px] text-[#647895] font-mono-signal mt-0.5 block">
                      Required email suffix
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-[#203247]/10">
                    <div className="flex items-center justify-between mb-1 text-[#647895]">
                      <div className="flex items-center gap-1.5">
                        <Key size={12} className="text-[#347f7a]" />
                        <span className="font-mono-signal text-[10px] uppercase tracking-wider">
                          Pass Token
                        </span>
                      </div>
                      <button
                        onClick={handleCopyToken}
                        className="text-[10px] text-[#347f7a] hover:underline cursor-pointer border-none bg-transparent p-0 flex items-center gap-0.5 font-semibold"
                      >
                        {copiedToken ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#203247] font-mono-signal truncate block">
                      {currentToken}
                    </span>
                    <span className="text-[10px] text-[#647895] font-mono-signal mt-0.5 block">
                      Campus authentication key
                    </span>
                  </div>

                  <div className="sm:col-span-2 bg-white p-3.5 rounded-2xl border border-[#203247]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={13} className="text-[#347f7a]" />
                      <div>
                        <span className="font-mono-signal text-[10px] uppercase tracking-wider text-[#647895] block">
                          Password Standard
                        </span>
                        <span className="text-xs font-semibold text-[#203247]">
                          Minimum 6 characters (Firebase Authentication)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-signal bg-[#d9e8df] text-[#347f7a] px-2 py-0.5 rounded-full font-semibold">
                      Secured
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <button
                    onClick={handleCopyTemplate}
                    className="w-full py-2.5 px-4 bg-[#347f7a] hover:bg-[#28635f] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
                  >
                    {copiedTemplate ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedTemplate ? 'Instructions Copied!' : 'Copy Student Invitation Template'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 sm:px-8 bg-[#f5f3ed] border-t border-[#203247]/10 flex items-center justify-between">
          <span className="font-mono-signal text-[10px] text-[#647895] uppercase tracking-wider">
            SignalSchool • Academic Token Provisioning Gateway
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-full bg-white hover:bg-[#ede8dc] text-[#203247] border border-[#203247]/15 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
