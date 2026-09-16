import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Search,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Layers,
  Key,
  Calendar,
  X
} from 'lucide-react';
import { SignalDatePicker } from '../common/SignalDatePicker';
import { ContractTierSelect } from '../common/ContractTierSelect';
import { UserProfileMenu } from '../common/UserProfileMenu';

export const SuperAdminPortal = () => {
  const {
    institutes,
    createInstitute,
    updateInstitute,
    deleteInstitute,
    setActiveInstituteId,
    setCurrentRole
  } = useInstitute();
  const { setActiveTab } = useHub();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState(null);

  // Lock body scrolling when any modal is open
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Form State for Creating New Institute
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    planName: 'Campus Enterprise Pack',
    domain: '',
    contractEnd: '2027-12-31',
    adminEmail: '',
    adminPassword: ''
  });

  // Calculate totals
  const totalInstitutes = institutes.length;
  const totalMembersEnrolled = institutes.reduce((acc, curr) => acc + (curr.members?.length || 0), 0);
  const activeCampuses = institutes.filter(inst => inst.status === 'active').length;

  const filteredInstitutes = institutes.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inst.adminEmail && inst.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const name = formData.name.trim();
    const slug = (formData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '') || 'campus';
    const domain = formData.domain ? formData.domain.trim().toLowerCase() : `${slug}.edu`;
    const adminEmail = (formData.adminEmail || `admin@${domain}`).trim().toLowerCase();
    const adminPassword = (formData.adminPassword || 'admin123').trim();

    createInstitute({
      name,
      slug,
      planName: formData.planName,
      domain,
      contractEnd: formData.contractEnd,
      adminName: `${name} Admin`,
      adminEmail,
      adminPassword
    });

    setFormData({
      name: '',
      slug: '',
      planName: 'Campus Enterprise Pack',
      domain: '',
      contractEnd: '2027-12-31',
      adminEmail: '',
      adminPassword: ''
    });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingInst) return;

    updateInstitute(editingInst.id, {
      name: editingInst.name,
      planName: editingInst.planName,
      domain: editingInst.domain,
      contractEnd: editingInst.contractEnd,
      adminEmail: editingInst.adminEmail,
      adminPassword: editingInst.adminPassword
    });
    setIsEditModalOpen(false);
    setEditingInst(null);
  };

  const jumpToInstituteAdmin = (instId) => {
    setActiveInstituteId(instId);
    setCurrentRole('institute-admin');
    setActiveTab('admin');
  };

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb] font-space-grotesk pb-24">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
            className="flex items-center text-decoration-none group cursor-pointer"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>

          {/* Action Button & User Profile on Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Plus size={14} />
              <span>Onboard Institute</span>
            </button>

            <div className="pl-2 border-l border-[#203247]/10">
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
              <span className="h-2 w-2 rounded-full bg-[#f09a7d]" />
              institutional contracts & license governance
            </p>

            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-6xl lg:text-[4.5rem] leading-[0.95] tracking-[-0.05em] text-[#203247]">
              Master Partner <br />
              <em className="italic font-normal text-[#347f7a]">Organization Cockpit.</em>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#526b88]">
              Manage partner universities, colleges, and schools from a single master hub. Provision dedicated tenant quotas, monitor platform-wide seat claims, and govern access keys.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 sm:px-8 pt-8">
        {/* KPI METRIC CARDS (Aligned with Base App Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1 */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Partner Institutes
              </span>
              <span className="p-2 rounded-xl bg-[#d9e8df] text-[#347f7a]">
                <Building2 size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {totalInstitutes}
            </div>
            <div className="mt-2 text-xs text-[#347f7a] font-medium flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>100% active standing</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Enrolled Members
              </span>
              <span className="p-2 rounded-xl bg-[#cbe8e7] text-[#2f7f85]">
                <Users size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {totalMembersEnrolled.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-[#347f7a] font-medium">
              Students & Faculty in university spaces
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Active Campuses
              </span>
              <span className="p-2 rounded-xl bg-[#f5dec5] text-[#d97d54]">
                <CreditCard size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {activeCampuses.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-[#647895]">
              Institutional enterprise licenses
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Platform Status
              </span>
              <span className="p-2 rounded-xl bg-[#d9e8df] text-[#347f7a]">
                <Layers size={16} />
              </span>
            </div>
            <div className="font-display text-2xl font-normal text-[#203247] tracking-tight flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
              Operational
            </div>
            <div className="mt-2 text-xs text-[#647895]">
              Simulation engines & sandboxes active
            </div>
          </div>
        </div>

        {/* SEARCH & ACTION TOOLBAR */}
        <div className="bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895]" />
            <input
              type="text"
              placeholder="Search partner institutes by name, domain, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#203247]/15 bg-white/90 py-2.5 pl-11 pr-4 text-xs outline-none transition-all focus:border-[#347f7a] focus:bg-white text-[#203247]"
            />
          </div>

          <div className="font-mono-signal text-[11px] text-[#647895] tracking-[0.1em] uppercase">
            Showing <strong className="text-[#203247]">{filteredInstitutes.length}</strong> Partner Organizations
          </div>
        </div>

        {/* INSTITUTES DIRECTORY TABLE (Parchment & Ink Style) */}
        <div className="rounded-3xl border border-[#203247]/10 bg-white/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#203247]/10 bg-[#f5f3ed]/60 text-[11px] font-mono-signal text-[#647895] uppercase tracking-[0.15em]">
                  <th className="py-4 px-6 w-[36%]">Institute Details</th>
                  <th className="py-4 px-6 w-[24%]">Contract Tier</th>
                  <th className="py-4 px-6 w-[18%]">Renewal Date</th>
                  <th className="py-4 px-6 w-[11%]">Status</th>
                  <th className="py-4 px-6 w-[11%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203247]/5 text-xs">
                {filteredInstitutes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#647895]">
                        <div className="w-12 h-12 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center text-[#203247] mb-3">
                          <Building2 size={22} className="text-[#347f7a]" />
                        </div>
                        <p className="font-semibold text-sm text-[#203247] mb-1">
                          {searchQuery ? 'No matching institutions found' : 'No partner institutions registered'}
                        </p>
                        <p className="text-xs text-[#647895] mb-4">
                          {searchQuery
                            ? 'Try adjusting your search criteria.'
                            : 'Get started by onboarding your first academic campus or department.'}
                        </p>
                        {!searchQuery && (
                          <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#203247] text-[#f6f3eb] rounded-full text-xs font-semibold hover:bg-[#347f7a] transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>Onboard First Campus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInstitutes.map((inst) => {
                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-[#fbf9f4] transition-colors group"
                      >
                        <td className="py-4 pl-6 sm:pl-7 pr-4 align-middle">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center font-bold text-[#347f7a] text-sm shrink-0">
                              {inst.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors truncate">
                                {inst.name}
                              </div>
                              <div className="text-[11px] text-[#647895] font-mono-signal flex items-center gap-2 mt-0.5 truncate">
                                <span>@{inst.domain}</span>
                                <span>•</span>
                                <span className="truncate">Admin: <strong className="text-[#203247] font-semibold">{inst.adminEmail || `admin@${inst.domain}`}</strong></span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#f5f3ed] text-[#203247] border border-[#203247]/10 rounded-full truncate max-w-full">
                            <Layers size={12} className="text-[#347f7a] shrink-0" />
                            <span className="truncate">{inst.planName}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-[#526b88] font-mono-signal text-[11px] align-middle">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#647895]/70 shrink-0" />
                            <span>{inst.contractEnd}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                            Active
                          </span>
                        </td>

                        <td className="py-4 pl-4 pr-6 sm:pr-7 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingInst({ ...inst });
                                setIsEditModalOpen(true);
                              }}
                              title="Edit Quota & Details"
                              className="p-2 rounded-full border border-[#203247]/15 hover:bg-[#f5f3ed] text-[#203247] transition-colors cursor-pointer"
                            >
                              <Sliders size={13} />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${inst.name}? This will revoke all student seats.`)) {
                                  deleteInstitute(inst.id);
                                }
                              }}
                              title="Delete Institute"
                              className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ONBOARD NEW INSTITUTE */}
      {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-scale-up overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Onboard New Campus</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Provision high-throughput virtual lab tenants & allocate academic quotas</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Institute / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University or MIT"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || slug,
                      domain: prev.domain || (slug ? `${slug}.edu` : ''),
                      adminEmail: prev.adminEmail || (slug ? `admin@${slug}.edu` : '')
                    }));
                  }}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Tenant Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. stanford-lab"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Official Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. stanford.edu"
                    value={formData.domain}
                    onChange={(e) => {
                      const domain = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        domain,
                        adminEmail: prev.adminEmail ? prev.adminEmail : (domain ? `admin@${domain}` : '')
                      }));
                    }}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <ContractTierSelect
                  value={formData.planName}
                  onChange={(planName) => {
                    setFormData(prev => ({
                      ...prev,
                      planName
                    }));
                  }}
                  label="Contract Tier"
                />
                <SignalDatePicker
                  value={formData.contractEnd}
                  onChange={(newDate) => setFormData({ ...formData, contractEnd: newDate })}
                  label="Subscription Expiry Date"
                />
              </div>

              {/* DESIGNATED CAMPUS ADMINISTRATOR ACCOUNT */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Designated Campus Administrator Account</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">This administrator will manage faculty and student seat licenses at /admin</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Admin Email (Login ID) *
                    </label>
                    <input
                      type="email"
                      placeholder={formData.domain ? `admin@${formData.domain}` : 'admin@university.edu'}
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Initial Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford@2026 (default: admin123)"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: EDIT CONTRACT */}
      {isEditModalOpen && editingInst && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-fade-in overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0 rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Modify Institute Contract</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Update licensing, quotas, and renewal terms</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Institute Name
                </label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <ContractTierSelect
                  value={editingInst.planName}
                  onChange={(planName) => setEditingInst(prev => ({ ...prev, planName }))}
                  label="Contract Tier"
                />
                <SignalDatePicker
                  value={editingInst.contractEnd}
                  onChange={(newDate) => setEditingInst({ ...editingInst, contractEnd: newDate })}
                  label="Renewal Expiry Date"
                />
              </div>

              {/* CAMPUS ADMINISTRATOR ACCOUNT DETAILS */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Campus Administrator Account</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">Update admin credentials for this institution</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Admin Email (Login ID)
                    </label>
                    <input
                      type="email"
                      value={editingInst.adminEmail || ''}
                      onChange={(e) => setEditingInst({ ...editingInst, adminEmail: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Reset Password
                    </label>
                    <input
                      type="text"
                      placeholder="Enter new password"
                      value={editingInst.adminPassword || ''}
                      onChange={(e) => setEditingInst({ ...editingInst, adminPassword: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
