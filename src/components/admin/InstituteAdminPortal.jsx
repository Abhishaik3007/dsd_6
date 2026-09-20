import React, { useState, useEffect } from 'react';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import { UserProfileMenu } from '../common/UserProfileMenu';
import { isDateExpired } from '../../utils/subscriptionUtils';
import { CampusQrPassModal } from './CampusQrPassModal';
import { TablePagination } from '../common/TablePagination';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  QrCode,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { SignalButtonLoader } from '../common/SignalButtonLoader';

export const InstituteAdminPortal = () => {
  const {
    currentInstitute,
    addMember,
    revokeMember,
    restoreMember,
    removeMember,
    regenerateInviteToken
  } = useInstitute();
  const { setActiveTab } = useHub();

  const [copied, setCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');
  const [addMemberSuccess, setAddMemberSuccess] = useState('');

  // Single Add Member State
  const [singleMember, setSingleMember] = useState({
    name: '',
    email: '',
    role: 'Student',
    password: ''
  });

  // Lock body scrolling when modal is open
  useEffect(() => {
    if (isAddModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      setAddMemberError('');
      setAddMemberSuccess('');
    }
  }, [isAddModalOpen]);

  // Reset pagination on search or role filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  if (!currentInstitute) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] text-[#203247] flex items-center justify-center p-6 font-space-grotesk">
        <div className="text-center bg-white border border-[#203247]/10 p-8 rounded-3xl shadow-xs max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center text-[#203247] mx-auto mb-4">
            <GraduationCap size={24} className="text-[#347f7a]" />
          </div>
          <h2 className="font-display text-2xl font-normal text-[#203247] mb-2">No Institute Registered</h2>
          <p className="text-xs text-[#647895] mb-6">
            There are currently no partner institutions active in the system. Onboard an institution in the Super Admin console first.
          </p>
          <button
            onClick={() => setActiveTab('super-admin')}
            className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-5 py-2.5 text-xs font-semibold cursor-pointer transition-colors"
          >
            Go to /schule (Super Admin Console)
          </button>
        </div>
      </div>
    );
  }

  const allMembers = currentInstitute.members || [];
  const activeMembers = allMembers.filter(m => m.status !== 'Revoked');
  const revokedMembers = allMembers.filter(m => m.status === 'Revoked');
  const totalMembers = activeMembers.length;
  const facultyCount = activeMembers.filter(m => m.role === 'Faculty').length;
  const studentCount = activeMembers.filter(m => m.role === 'Student').length;
  const isExpired = isDateExpired(currentInstitute.contractEnd) || currentInstitute.status === 'expired';
  const maxSeats = Number(currentInstitute.maxSeats) || 100;
  const remainingSeats = Math.max(0, maxSeats - totalMembers);
  const seatsClaimedPct = Math.min(100, Math.round((totalMembers / maxSeats) * 100));

  // Construct invite link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://signalschool.io';
  const inviteUrl = `${origin}/join?token=${currentInstitute.inviteToken || ''}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSingleAdd = async (e) => {
    e.preventDefault();
    setAddMemberError('');
    setAddMemberSuccess('');

    if (remainingSeats <= 0) {
      setAddMemberError(`Seat license quota of ${maxSeats} seats reached. Upgrade contract tier or revoke an unused seat.`);
      return;
    }

    if (!singleMember.name || !singleMember.email) {
      setAddMemberError('Please enter both name and email.');
      return;
    }

    const passwordToUse = (singleMember.password || 'campus123').trim();
    if (passwordToUse.length < 6) {
      setAddMemberError('Password must be at least 6 characters long for Firebase Authentication.');
      return;
    }

    setIsSubmittingMember(true);
    try {
      const newMember = await addMember(currentInstitute.id, {
        ...singleMember,
        password: passwordToUse
      });
      if (newMember) {
        setAddMemberSuccess(`Account provisioned in Firebase and seat allocated for ${newMember.name}!`);
        setSingleMember({ name: '', email: '', role: 'Student', password: '' });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddMemberSuccess('');
        }, 1200);
      }
    } catch (err) {
      console.error('Error adding member:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAddMemberError('An account with this email already exists in Firebase Authentication.');
      } else if (err.code === 'auth/invalid-email') {
        setAddMemberError('Please enter a valid institutional email address.');
      } else if (err.code === 'auth/weak-password') {
        setAddMemberError('Password must be at least 6 characters long.');
      } else {
        setAddMemberError(err.message || 'Failed to create user account.');
      }
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const filteredMembers = (currentInstitute.members || []).filter(m => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (roleFilter === 'Revoked') {
      return matchesSearch && m.status === 'Revoked';
    }
    const matchesRole = roleFilter === 'ALL' ? true : (m.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb] font-space-grotesk pb-24">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          {/* Brand on Left */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
            className="flex items-center text-decoration-none group cursor-pointer"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>

          {/* User Profile Menu on Right */}
          <div className="flex items-center">
            <UserProfileMenu />
          </div>
        </div>
      </nav>

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-[#f5f3ed] border-b border-[#203247]/10">
        <div className="relative bg-grid-paper">
          <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#347f7a]" />
              institutional seat allocation & roster controls
            </p>

            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-6xl lg:text-[4.5rem] leading-[0.95] tracking-[-0.05em] text-[#203247]">
              Campus & <br />
              <em className="italic font-normal text-[#347f7a]">Roster Administration.</em>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#526b88]">
              Manage student cohorts, distribute invite links, allocate seat licenses, and ensure uninterrupted access to the interactive virtual laboratories.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 sm:px-8 pt-8">
        {/* SUBSCRIPTION EXPIRED WARNING BANNER FOR CAMPUS ADMIN */}
        {isExpired && (
          <div className="mb-8 p-5 bg-amber-50/90 border border-amber-300/80 rounded-3xl flex items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-amber-950">Campus Subscription Expired</h3>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  Your institutional license expired on <strong className="font-mono text-amber-950">{currentInstitute.contractEnd}</strong>. Student and faculty logins to the interactive labs are temporarily locked until the contract is renewed. As an administrator, you retain full access to manage your roster and view institutional records.
                </p>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-mono-signal font-semibold bg-amber-200/80 text-amber-900 border border-amber-400/50 hidden md:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              Contract Lapsed
            </span>
          </div>
        )}

        {/* TOP METRIC & INVITE CARDS (40 : 60 ratio) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Campus Members Metric Card (40% width) */}
          <div className="lg:col-span-2 bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold text-[#647895]">
                Enrolled Campus Members
              </span>
              {isExpired ? (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono-signal font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  Contract Expired
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono-signal font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                  {currentInstitute.planName || 'Active Tier'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-normal text-[#203247] tracking-tight">
                    {totalMembers}
                  </span>
                  <span className="text-[#647895] font-mono-signal text-xs sm:text-sm">
                    / {maxSeats} seats claimed
                  </span>
                </div>
                <span className="text-[11px] font-mono-signal text-[#347f7a] font-semibold">
                  {seatsClaimedPct}%
                </span>
              </div>

              {/* Quota Progress Indicator Bar */}
              <div className="w-full bg-[#203247]/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    seatsClaimedPct >= 90 ? 'bg-amber-500' : 'bg-[#347f7a]'
                  }`}
                  style={{ width: `${seatsClaimedPct}%` }}
                />
              </div>

              {/* Divider & Breakdown tightly positioned below progress bar */}
              <div className="flex items-center gap-3 text-xs text-[#647895] pt-3 mt-3 border-t border-[#203247]/10">
                <div>
                  <span className="font-semibold text-[#203247]">{studentCount}</span> Students
                </div>
                <span className="text-[#203247]/20">•</span>
                <div>
                  <span className="font-semibold text-[#203247]">{facultyCount}</span> Faculty
                </div>
                {revokedMembers.length > 0 && (
                  <>
                    <span className="text-[#203247]/20">•</span>
                    <span className="text-amber-800 font-medium">
                      <span className="font-semibold">{revokedMembers.length}</span> Revoked
                    </span>
                  </>
                )}
                <span className="font-mono-signal text-[11px] ml-auto">
                  <strong className="text-[#347f7a] font-semibold">{remainingSeats}</strong> left
                </span>
              </div>
            </div>
          </div>

          {/* Instant Shareable Invite Link Card (60% width) */}
          <div className="lg:col-span-3 bg-[#203247] text-[#f6f3eb] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-[#347f7a]/30 text-[#d9e8df]">
                  <Sparkles size={14} />
                </span>
                <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#d9e8df]">
                  Instant Student Onboarding
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Regenerate invite token? The previous invite link will become inactive.')) {
                    regenerateInviteToken(currentInstitute.id);
                  }
                }}
                className="font-mono-signal text-[11px] text-[#f6f3eb]/70 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={12} />
                <span>New Token</span>
              </button>
            </div>

            <h2 className="font-display text-2xl font-normal text-[#f6f3eb] mb-1">
              Share Direct Join Link
            </h2>
            <p className="text-xs text-[#f6f3eb]/80 mb-5 max-w-2xl leading-relaxed">
              Distribute this link directly to student batches via WhatsApp, Canvas, or email. Students click to activate their seat license with no separate manual registration required.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1 bg-[#162230] border border-[#f6f3eb]/15 rounded-2xl px-4 py-2.5 text-xs font-mono-signal text-[#d9e8df] truncate">
                {inviteUrl}
              </div>

              <button
                onClick={copyInviteLink}
                className="bg-[#347f7a] hover:bg-[#28635f] text-[#f6f3eb] font-semibold text-xs rounded-full px-5 py-2.5 shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Invite Link'}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                title="Open Student QR Code Pass & Provisioning Scanner"
                className="p-2.5 bg-[#162230] hover:bg-[#347f7a] border border-[#f6f3eb]/20 text-[#f6f3eb] rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105"
              >
                <QrCode size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* TOOLBAR & SEARCH FOR ROSTER */}
        <div className="bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895]" />
              <input
                type="text"
                placeholder="Search roster by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#203247]/15 bg-white/90 py-2 pl-10 pr-4 text-xs outline-none transition-all focus:border-[#347f7a] focus:bg-white text-[#203247]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-white/80 border border-[#203247]/10 p-1 rounded-full text-xs font-medium text-[#647895]">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${roleFilter === 'ALL' ? 'bg-[#203247] text-[#f6f3eb] font-semibold' : 'hover:text-[#203247]'
                  }`}
              >
                All ({allMembers.length})
              </button>
              <button
                onClick={() => setRoleFilter('Student')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${roleFilter === 'Student' ? 'bg-[#203247] text-[#f6f3eb] font-semibold' : 'hover:text-[#203247]'
                  }`}
              >
                Students ({studentCount})
              </button>
              <button
                onClick={() => setRoleFilter('Faculty')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${roleFilter === 'Faculty' ? 'bg-[#203247] text-[#f6f3eb] font-semibold' : 'hover:text-[#203247]'
                  }`}
              >
                Faculty ({facultyCount})
              </button>
              {revokedMembers.length > 0 && (
                <button
                  onClick={() => setRoleFilter('Revoked')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${roleFilter === 'Revoked' ? 'bg-amber-800 text-white font-semibold' : 'text-amber-800 hover:bg-amber-50'
                    }`}
                >
                  <span>Revoked</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-signal ${roleFilter === 'Revoked' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                    {revokedMembers.length}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-mono-signal text-[#647895]">
              <strong className="text-[#203247] font-semibold">{remainingSeats}</strong> of {maxSeats} seats available
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={totalMembers >= maxSeats || isExpired}
              className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* ROSTER TABLE (Warm Parchment & Ink Style) */}
        <div className="rounded-3xl border border-[#203247]/10 bg-white/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#203247]/10 bg-[#f5f3ed]/60 text-[11px] font-mono-signal text-[#647895] uppercase tracking-[0.15em]">
                  <th className="py-4 px-6 w-[36%]">Name & Institutional Identifier</th>
                  <th className="py-4 px-6 w-[18%]">Role</th>
                  <th className="py-4 px-6 w-[18%]">Enrollment Date</th>
                  <th className="py-4 px-6 w-[14%]">Status</th>
                  <th className="py-4 px-6 w-[14%] text-right">Seat Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203247]/5 text-xs">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#647895]">
                      No roster members found.
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#fbf9f4] transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 text-[#203247] font-semibold flex items-center justify-center text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[#203247] truncate">{member.name}</div>
                            <div className="text-[#647895] font-mono-signal text-[11px] truncate">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold ${member.role === 'Faculty'
                            ? 'bg-[#f5dec5] text-[#d97d54] border border-[#d97d54]/20'
                            : 'bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20'
                          }`}>
                          {member.role === 'Faculty' ? <GraduationCap size={11} /> : <Users size={11} />}
                          {member.role}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[#526b88] font-mono-signal text-[11px] align-middle">
                        {member.joinedAt}
                      </td>

                      <td className="py-4 px-6 align-middle">
                        {member.status === 'Revoked' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#347f7a] bg-[#d9e8df]/50 border border-[#347f7a]/20 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap align-middle">
                        {member.status === 'Revoked' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await restoreMember(currentInstitute.id, member.id || member.uid);
                                if (res && !res.success) {
                                  alert(res.error || 'Failed to restore seat.');
                                } else {
                                  setToastMessage(`Seat license restored for ${member.name}. Access reactivated.`);
                                  setTimeout(() => setToastMessage(''), 3500);
                                }
                              }}
                              disabled={remainingSeats <= 0}
                              className="px-3 py-1 rounded-full text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                              title={remainingSeats <= 0 ? 'No seats available' : 'Reactivate seat license for this user'}
                            >
                              <RotateCcw size={12} />
                              <span>Restore Seat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Permanently remove ${member.name} (${member.email}) from campus roster?`)) {
                                  removeMember(currentInstitute.id, member.id || member.uid);
                                  setToastMessage(`${member.name} removed from campus roster.`);
                                  setTimeout(() => setToastMessage(''), 3500);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#647895] hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                              title="Permanently delete from roster"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Revoke seat license for ${member.name} (${member.email})? This frees up 1 seat back to ${currentInstitute.name}. You can restore their seat at any time.`)) {
                                await revokeMember(currentInstitute.id, member.id || member.uid);
                                setToastMessage(`Seat license revoked for ${member.name}. Seat freed back to quota.`);
                                setTimeout(() => setToastMessage(''), 3500);
                              }
                            }}
                            className="px-3 py-1 rounded-full text-[#647895] hover:text-amber-800 hover:bg-amber-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Revoke Seat
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Pagination Outside Table Card */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredMembers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="enrolled members"
        />
      </div>

      {/* MODAL: SINGLE ADD MEMBER */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#203247]/40 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-2xl sm:max-w-3xl overflow-hidden shadow-2xl my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Enroll Student or Faculty</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">
                    Allocate an academic seat license • <strong className="text-[#347f7a] font-semibold">{remainingSeats}</strong> of {maxSeats} seats available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSingleAdd} className="p-8 sm:p-10 space-y-6 rounded-b-[2rem]">
              {addMemberError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{addMemberError}</span>
                </div>
              )}

              {addMemberSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700">
                  <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                  <span>{addMemberSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={singleMember.name}
                  onChange={(e) => setSingleMember({ ...singleMember, name: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] placeholder:text-[#647895]/50 outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] font-semibold mb-2">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder={`e.g. maya@${currentInstitute.domain}`}
                  value={singleMember.email}
                  onChange={(e) => setSingleMember({ ...singleMember, email: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] placeholder:text-[#647895]/50 outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="block font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895] font-semibold mb-1.5">
                  Role Assignment *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Student Option */}
                  <button
                    type="button"
                    onClick={() => setSingleMember({ ...singleMember, role: 'Student' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${singleMember.role === 'Student'
                        ? 'bg-white border-[#347f7a] shadow-xs ring-2 ring-[#347f7a]/20'
                        : 'bg-white/70 border-[#203247]/10 hover:border-[#203247]/20 hover:bg-white text-[#647895]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${singleMember.role === 'Student' ? 'bg-[#d9e8df] text-[#347f7a]' : 'bg-[#f5f3ed] text-[#647895]'
                        }`}>
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#203247]">Student</div>
                        <div className="font-mono-signal text-[9px] text-[#647895]">Lab Access & Saves</div>
                      </div>
                    </div>
                    {singleMember.role === 'Student' && (
                      <span className="w-4 h-4 rounded-full bg-[#347f7a] text-[#f6f3eb] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>

                  {/* Faculty Option */}
                  <button
                    type="button"
                    onClick={() => setSingleMember({ ...singleMember, role: 'Faculty' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${singleMember.role === 'Faculty'
                        ? 'bg-white border-[#d97d54] shadow-xs ring-2 ring-[#d97d54]/20'
                        : 'bg-white/70 border-[#203247]/10 hover:border-[#203247]/20 hover:bg-white text-[#647895]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${singleMember.role === 'Faculty' ? 'bg-[#f5dec5] text-[#d97d54]' : 'bg-[#f5f3ed] text-[#647895]'
                        }`}>
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#203247]">Faculty</div>
                        <div className="font-mono-signal text-[9px] text-[#647895]">Instructor Workbench</div>
                      </div>
                    </div>
                    {singleMember.role === 'Faculty' && (
                      <span className="w-4 h-4 rounded-full bg-[#d97d54] text-[#f6f3eb] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] font-semibold">
                    Initial Account Password
                  </label>
                  <span className="text-[10px] text-[#647895] font-mono-signal">Min 6 chars • Default: campus123</span>
                </div>
                <input
                  type="text"
                  minLength={6}
                  placeholder="e.g. campus123 (or set custom password)"
                  value={singleMember.password || ''}
                  onChange={(e) => setSingleMember({ ...singleMember, password: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] placeholder:text-[#647895]/50 outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
                <p className="text-[10px] text-[#647895] font-mono-signal mt-1.5">
                  The user will be created in Firebase Authentication with this password and can immediately sign in.
                </p>
              </div>

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmittingMember}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#203247]/15 text-xs font-semibold text-[#647895] hover:text-[#203247] hover:bg-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] disabled:opacity-80 disabled:cursor-not-allowed rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-2 relative overflow-hidden"
                >
                  {isSubmittingMember ? (
                    <SignalButtonLoader label="Provisioning in Firebase..." variant="bars" />
                  ) : (
                    <span>Allocate Seat</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student QR Code Pass & Provisioning Scanner Dialog */}
      <CampusQrPassModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        institute={currentInstitute}
        inviteUrl={inviteUrl}
      />

      {/* FLOATING SUCCESS TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-[#203247] text-[#f6f3eb] px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-in fade-in text-xs font-medium">
          <div className="w-6 h-6 rounded-full bg-[#347f7a] flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 text-white/60 hover:text-white border-none bg-transparent cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
