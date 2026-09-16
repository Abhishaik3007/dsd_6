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
    contractEnd: '2027-12-31'
  });

  // Calculate totals
  const totalInstitutes = institutes.length;
  const totalMembersEnrolled = institutes.reduce((acc, curr) => acc + (curr.members?.length || 0), 0);
  const activeCampuses = institutes.filter(inst => inst.status === 'active').length;

  const filteredInstitutes = institutes.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    createInstitute(formData);
    setFormData({
      name: '',
      slug: '',
      planName: 'Campus Enterprise Pack',
      domain: '',
      contractEnd: '2027-12-31'
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
      contractEnd: editingInst.contractEnd
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
                {filteredInstitutes.map((inst) => {
                  return (
                    <tr
                      key={inst.id}
                      className="hover:bg-[#fbf9f4] transition-colors group"
                    >
                      <td className="py-4 px-6 align-middle">
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
                              <span>slug: {inst.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono-signal uppercase tracking-wider bg-[#f5f3ed] text-[#203247] border border-[#203247]/10 rounded-full font-medium">
                          <Layers size={11} className="text-[#347f7a]" />
                          {inst.planName}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[#526b88] font-mono-signal text-[11px] align-middle">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#647895]/70 shrink-0" />
                          <span>{inst.contractEnd}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                          Active
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right align-middle">
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ONBOARD NEW INSTITUTE */}
      {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#203247]/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="font-display text-xl font-normal text-[#203247]">Onboard New Institute</h3>
                <p className="font-mono-signal text-[10px] uppercase tracking-[0.15em] text-[#647895] mt-0.5">
                  Allocate dedicated tenant & license quota
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-1.5 rounded-full hover:bg-[#f5f3ed] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                  Institute / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University or Apex Institute"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                    Tenant Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. apex-tech"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                    Official Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. apextech.edu"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#203247]/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-display text-lg font-normal text-[#203247]">Modify Institute Contract</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-1.5 rounded-full hover:bg-[#f5f3ed] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5">
                  Institute Name
                </label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none"
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
