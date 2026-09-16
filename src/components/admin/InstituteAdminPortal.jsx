import React, { useState, useEffect } from 'react';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import { UserProfileMenu } from '../common/UserProfileMenu';
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
  X
} from 'lucide-react';

export const InstituteAdminPortal = () => {
  const {
    currentInstitute,
    addMember,
    removeMember,
    regenerateInviteToken
  } = useInstitute();
  const { setActiveTab } = useHub();

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    }
  }, [isAddModalOpen]);

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

  const totalMembers = currentInstitute.members ? currentInstitute.members.length : 0;
  const facultyCount = currentInstitute.members ? currentInstitute.members.filter(m => m.role === 'Faculty').length : 0;
  const studentCount = currentInstitute.members ? currentInstitute.members.filter(m => m.role === 'Student').length : 0;

  // Construct invite link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://continuum.edu';
  const inviteUrl = `${origin}/join?token=${currentInstitute.inviteToken || ''}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSingleAdd = (e) => {
    e.preventDefault();
    if (!singleMember.name || !singleMember.email) return;

    const success = addMember(currentInstitute.id, {
      ...singleMember,
      password: singleMember.password || 'campus123'
    });
    if (success) {
      setSingleMember({ name: '', email: '', role: 'Student', password: '' });
      setIsAddModalOpen(false);
    }
  };

  const filteredMembers = (currentInstitute.members || []).filter(m => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' ? true : (m.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

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

          {/* Institute Name & User Profile Menu on Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-[#203247]/10 py-1.5 px-3.5 rounded-full shadow-2xs">
              <span className="font-semibold text-xs text-[#203247] max-w-[220px] truncate">
                {currentInstitute.name}
              </span>
            </div>

            <div className="pl-1">
              <UserProfileMenu />
            </div>
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
        {/* TOP METRIC & INVITE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Campus Members Metric Card */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold text-[#647895]">
                Enrolled Campus Members
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono-signal font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                {currentInstitute.planName || 'Active Tier'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-5xl font-normal text-[#203247] tracking-tight">
                {totalMembers}
              </span>
              <span className="text-[#647895] font-mono-signal text-sm">
                active participants
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#647895] pt-2 border-t border-[#203247]/10">
              <div>
                <span className="font-semibold text-[#203247]">{studentCount}</span> Students
              </div>
              <span className="text-[#203247]/20">•</span>
              <div>
                <span className="font-semibold text-[#203247]">{facultyCount}</span> Faculty
              </div>
              <span className="text-[#203247]/20">•</span>
              <span className="font-mono-signal text-[11px] ml-auto">Valid: {currentInstitute.contractEnd}</span>
            </div>
          </div>

          {/* Instant Shareable Invite Link Card */}
          <div className="lg:col-span-2 bg-[#203247] text-[#f6f3eb] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
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
            <p className="text-xs text-[#f6f3eb]/80 mb-5 max-w-xl leading-relaxed">
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
                onClick={() => window.open(inviteUrl, '_blank')}
                title="Open Join Page"
                className="p-2.5 bg-[#162230] hover:bg-[#203247] border border-[#f6f3eb]/20 text-[#f6f3eb] rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              >
                <ExternalLink size={14} />
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
                All ({currentInstitute.members.length})
              </button>
              <button
                onClick={() => setRoleFilter('Student')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${roleFilter === 'Student' ? 'bg-[#203247] text-[#f6f3eb] font-semibold' : 'hover:text-[#203247]'
                  }`}
              >
                Students ({currentInstitute.members.filter(m => m.role === 'Student').length})
              </button>
              <button
                onClick={() => setRoleFilter('Faculty')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${roleFilter === 'Faculty' ? 'bg-[#203247] text-[#f6f3eb] font-semibold' : 'hover:text-[#203247]'
                  }`}
              >
                Faculty ({currentInstitute.members.filter(m => m.role === 'Faculty').length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* ROSTER TABLE (Warm Parchment & Ink Style) */}
        <div className="rounded-3xl border border-[#203247]/10 bg-white/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#203247]/10 bg-[#f5f3ed]/60 text-[11px] font-mono-signal text-[#647895] uppercase tracking-[0.15em]">
                  <th className="py-4 px-6">Name & Institutional Identifier</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Enrollment Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Seat Control</th>
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
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-[#fbf9f4] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 text-[#203247] font-semibold flex items-center justify-center text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#203247]">{member.name}</div>
                            <div className="text-[#647895] font-mono-signal text-[11px]">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold ${member.role === 'Faculty'
                            ? 'bg-[#f5dec5] text-[#d97d54] border border-[#d97d54]/20'
                            : 'bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20'
                          }`}>
                          {member.role === 'Faculty' ? <GraduationCap size={11} /> : <Users size={11} />}
                          {member.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-[#526b88] font-mono-signal text-[11px]">
                        {member.joinedAt}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#347f7a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                          Active
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Revoke seat license for ${member.name} (${member.email})? This frees up 1 seat back to ${currentInstitute.name}.`)) {
                              removeMember(currentInstitute.id, member.id);
                            }
                          }}
                          className="px-3 py-1 rounded-full text-[#647895] hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke Seat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Allocate an academic seat license to a campus member</p>
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
                  <span className="text-[10px] text-[#647895] font-mono-signal">Default: campus123</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. campus123 (or set custom password)"
                  value={singleMember.password || ''}
                  onChange={(e) => setSingleMember({ ...singleMember, password: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] placeholder:text-[#647895]/50 outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
                <p className="text-[10px] text-[#647895] font-mono-signal mt-1.5">
                  The member will use this password alongside their institutional email to sign in.
                </p>
              </div>

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#203247]/15 text-xs font-semibold text-[#647895] hover:text-[#203247] hover:bg-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none"
                >
                  Allocate Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
