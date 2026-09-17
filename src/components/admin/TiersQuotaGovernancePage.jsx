import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import {
  ShieldCheck,
  Edit2,
  Trash2,
  Layers,
  X,
  Check,
  ArrowLeft
} from 'lucide-react';
import { UserProfileMenu } from '../common/UserProfileMenu';
import { DEFAULT_CONTRACT_TIERS, sortByPriceLowToHigh } from '../../utils/tierConfig';

const STORAGE_KEY_INDIVIDUALS = 'signalschool_individual_users';
const DUMMY_INDIVIDUAL_IDS = ['indiv_elena_rostova', 'indiv_marcus_vance', 'indiv_sophia_chen'];

export const TiersQuotaGovernancePage = () => {
  const {
    institutes,
    contractTiers: ctxContractTiers,
    updateContractTier,
    deleteContractTier,
    individualPlans,
    updateIndividualPlan
  } = useInstitute();
  const contractTiers = ctxContractTiers || DEFAULT_CONTRACT_TIERS;
  const { setActiveTab } = useHub();

  // Sort tiers & plans by price Low to High
  const sortedContractTiers = sortByPriceLowToHigh(contractTiers);
  const sortedIndividualPlans = sortByPriceLowToHigh(individualPlans || []);

  const [toastMessage, setToastMessage] = useState('');

  // Tier Catalog Edit Modal State
  const [isEditTierModalOpen, setIsEditTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  // Individual Plan Edit Modal State
  const [isEditIndivPlanOpen, setIsEditIndivPlanOpen] = useState(false);
  const [editingIndivPlan, setEditingIndivPlan] = useState(null);

  // Individual accounts for analytics
  const [individualUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INDIVIDUALS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            u => !DUMMY_INDIVIDUAL_IDS.includes(u?.id) && !DUMMY_INDIVIDUAL_IDS.includes(u?.uid)
          );
        }
      }
    } catch (_) {}
    return [];
  });

  // Lock body scroll when edit modal opens
  useEffect(() => {
    if (isEditTierModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isEditTierModalOpen]);

  // Lock scroll when individual plan modal opens
  useEffect(() => {
    if (isEditIndivPlanOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [isEditIndivPlanOpen]);

  const handleEditTierSubmit = (e) => {
    e.preventDefault();
    if (!editingTier) return;
    updateContractTier(editingTier.id, {
      name: editingTier.name,
      badge: editingTier.badge,
      defaultSeats: Number(editingTier.defaultSeats) || 100,
      priceEstimate: editingTier.priceEstimate,
      billingCycle: editingTier.billingCycle,
      description: editingTier.description,
      features: editingTier.features
    });
    setToastMessage(`Contract tier "${editingTier.name}" specifications updated.`);
    setTimeout(() => setToastMessage(''), 3500);
    setIsEditTierModalOpen(false);
    setEditingTier(null);
  };

  const handleEditIndivPlanSubmit = (e) => {
    e.preventDefault();
    if (!editingIndivPlan) return;
    updateIndividualPlan(editingIndivPlan.id, {
      name: editingIndivPlan.name,
      price: editingIndivPlan.price,
      description: editingIndivPlan.description,
      features: editingIndivPlan.features
    });
    setToastMessage(`Individual plan "${editingIndivPlan.name}" updated.`);
    setTimeout(() => setToastMessage(''), 3500);
    setIsEditIndivPlanOpen(false);
    setEditingIndivPlan(null);
  };

  const handleDeleteTier = (tierId, tierName) => {
    const enrolled = institutes.filter(inst => inst.planName === tierId || inst.planName === tierName);
    if (enrolled.length > 0) {
      alert(`Cannot delete tier "${tierName}" because ${enrolled.length} partner institution(s) are currently assigned to it.`);
      return;
    }
    if (window.confirm(`Are you sure you want to permanently remove tier "${tierName}" from the platform catalog?`)) {
      deleteContractTier(tierId);
      setToastMessage(`Tier "${tierName}" removed from catalog.`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] font-space-grotesk text-[#203247] pb-24 selection:bg-[#347f7a] selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#fbf9f4]/90 backdrop-blur-md border-b border-[#203247]/10 px-6 sm:px-8 py-4">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('super-admin')}
              className="p-2 rounded-xl bg-white border border-[#203247]/12 hover:border-[#347f7a] hover:bg-[#d9e8df]/30 text-[#203247] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Super Admin Directory"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Super Admin Console</span>
            </button>

            <span className="text-[#647895] hidden sm:inline">/</span>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                <Layers size={16} />
              </span>
              <div>
                <h1 className="text-sm font-bold text-[#203247] leading-none">Tiers & Quota Governance</h1>
                <span className="text-[10px] text-[#647895] font-mono-signal">Platform Licensing Control</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserProfileMenu />
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-[#f5f3ed] border-b border-[#203247]/10 bg-grid-paper px-6 sm:px-8 py-8 sm:py-10">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono-signal uppercase tracking-wider font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20 mb-3">
                <ShieldCheck size={13} />
                <span>Central Quota Controller</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#203247] tracking-tight">
                Academic Tiers & Capacity Governance
              </h2>
              <p className="text-xs sm:text-sm text-[#647895] max-w-2xl mt-1.5 leading-relaxed">
                Configure platform contract tiers, define default seats, and manage real-time university capacity and headroom across all registered institutional nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-6 sm:px-8 pt-8 space-y-10">



        {/* SECTION 2: INSTITUTIONAL CONTRACT TIER CATALOG */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-normal text-[#203247]">Institutional Contract Tiers</h3>
              <p className="text-xs text-[#647895] font-mono-signal mt-0.5">
                Global tier definitions, default seat quotas, and academic entitlements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedContractTiers.map((tier) => {
              const enrolledCount = institutes.filter(inst => inst.planName === tier.id || inst.planName === tier.name).length;
              const isDefault = !tier.isCustom;

              return (
                <div
                  key={tier.id}
                  className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono-signal uppercase tracking-wider font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                        {tier.badge || 'Academic Tier'}
                      </span>
                      <span className="text-[11px] font-mono-signal text-[#647895]">
                        {enrolledCount} {enrolledCount === 1 ? 'Campus' : 'Campuses'} Enrolled
                      </span>
                    </div>

                    <h4 className="font-display text-2xl font-normal text-[#203247] mb-2">
                      {tier.name}
                    </h4>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-display text-4xl font-normal text-[#347f7a]">
                        {Number(tier.defaultSeats).toLocaleString()}
                      </span>
                      <span className="text-xs font-mono-signal uppercase tracking-wider text-[#647895] font-semibold">
                        Default Max Seats
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-[#203247]/10 text-xs font-semibold text-[#203247] mb-4">
                      <span>{tier.priceEstimate || 'Custom License'}</span>
                      <span className="text-[#647895]">&bull;</span>
                      <span className="text-[11px] text-[#647895] font-normal">{tier.billingCycle || 'Annual'}</span>
                    </div>

                    <p className="text-xs text-[#526b88] leading-relaxed mb-6">
                      {tier.description || 'Targeted educational deployment for academic faculties.'}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-[#203247]/10 mb-6">
                      {(tier.features || []).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[#203247]">
                          <Check size={14} className="text-[#347f7a] shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTier({
                          ...tier,
                          features: Array.isArray(tier.features) ? tier.features.join('\n') : (tier.features || '')
                        });
                        setIsEditTierModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-[#203247]/15 hover:border-[#347f7a] text-[#203247] hover:text-[#347f7a] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Edit2 size={13} />
                      <span>Edit Tier Defaults</span>
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(tier.id, tier.name)}
                        title="Delete Custom Tier"
                        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: INDIVIDUAL ACCOUNT PLAN SPECS OVERVIEW */}
        <div className="rounded-3xl border border-[#203247]/10 bg-white/70 p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display text-xl font-normal text-[#203247]">Individual Account Tiers</h4>
              <p className="text-xs text-[#647895] font-mono-signal mt-0.5">
                Independent learner licenses, researcher passes, and community seats
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono-signal bg-[#203247]/5 text-[#647895]">
              1 Seat Per Account Standard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedIndividualPlans.map((plan) => {
              const subscribers = individualUsers.filter(u => u.planName === plan.name || u.planName === plan.id).length;
              return (
                <div key={plan.id} className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#203247]/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-[#203247] truncate">{plan.name}</span>
                      <span className="text-[10px] font-mono-signal text-[#347f7a] font-bold">{plan.price}</span>
                    </div>
                    <p className="text-[11px] text-[#647895] mb-3 leading-snug">{plan.description}</p>
                    <div className="space-y-1 mb-3">
                      {(plan.features || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#203247]">
                          <Check size={11} className="text-[#347f7a] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#203247]/10 flex items-center justify-between">
                    <div className="text-[10px] font-mono-signal text-[#647895]">
                      <span>1 Seat</span>
                      <span className="mx-1">·</span>
                      <strong className="text-[#203247]">{subscribers} Active</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIndivPlan({
                          ...plan,
                          features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || '')
                        });
                        setIsEditIndivPlanOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-white border border-[#203247]/15 hover:border-[#347f7a] text-[#203247] hover:text-[#347f7a] text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Edit2 size={11} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      {/* MODAL 3: EDIT CONTRACT TIER DEFAULTS */}
      {isEditTierModalOpen && editingTier && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsEditTierModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-xl sm:max-w-2xl shadow-2xl animate-scale-up overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-normal text-[#203247]">Edit Tier Specifications</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">{editingTier.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTierModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditTierSubmit} className="p-8 space-y-5 rounded-b-[2rem]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Tier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTier.name}
                    onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
                    placeholder="e.g. Department Lab Pack"
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={editingTier.badge || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, badge: e.target.value })}
                    placeholder="e.g. Departmental Lab"
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium whitespace-nowrap">
                    Default Seats *
                  </label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={editingTier.defaultSeats}
                    onChange={(e) => setEditingTier({ ...editingTier, defaultSeats: Number(e.target.value) })}
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs font-semibold text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium whitespace-nowrap">
                    Price Estimate
                  </label>
                  <input
                    type="text"
                    value={editingTier.priceEstimate || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, priceEstimate: e.target.value })}
                    placeholder="e.g. ₹4,10,000 / yr"
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium whitespace-nowrap">
                    Billing Cycle
                  </label>
                  <input
                    type="text"
                    value={editingTier.billingCycle || ''}
                    onChange={(e) => setEditingTier({ ...editingTier, billingCycle: e.target.value })}
                    placeholder="e.g. Annual License"
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingTier.description || ''}
                  onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                  placeholder="Targeted educational deployment for academic faculties..."
                  className="w-full p-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Features List (One per line)
                </label>
                <textarea
                  rows={5}
                  value={editingTier.features || ''}
                  onChange={(e) => setEditingTier({ ...editingTier, features: e.target.value })}
                  className="w-full p-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all font-mono-signal leading-relaxed resize-y"
                />
              </div>

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditTierModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-2xl px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-md border-none flex items-center gap-1.5 active:scale-[0.99]"
                >
                  <Check size={14} />
                  <span>Save Tier Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: EDIT INDIVIDUAL PLAN */}
      {isEditIndivPlanOpen && editingIndivPlan && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsEditIndivPlanOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-xl sm:max-w-2xl shadow-2xl animate-scale-up overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-normal text-[#203247]">Edit Individual Plan</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">{editingIndivPlan.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditIndivPlanOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditIndivPlanSubmit} className="p-8 space-y-5 rounded-b-[2rem]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingIndivPlan.name}
                    onChange={(e) => setEditingIndivPlan({ ...editingIndivPlan, name: e.target.value })}
                    placeholder="e.g. Individual Pro Plan"
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,400 / mo"
                    value={editingIndivPlan.price || ''}
                    onChange={(e) => setEditingIndivPlan({ ...editingIndivPlan, price: e.target.value })}
                    className="w-full h-11 px-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingIndivPlan.description || ''}
                  onChange={(e) => setEditingIndivPlan({ ...editingIndivPlan, description: e.target.value })}
                  placeholder="Summary of plan entitlements and features..."
                  className="w-full p-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Features (one per line)
                </label>
                <textarea
                  rows={5}
                  value={editingIndivPlan.features || ''}
                  onChange={(e) => setEditingIndivPlan({ ...editingIndivPlan, features: e.target.value })}
                  className="w-full p-4 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all font-mono-signal leading-relaxed resize-y"
                />
              </div>

              <div className="pt-4 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditIndivPlanOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-2xl px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-md border-none flex items-center gap-1.5 active:scale-[0.99]"
                >
                  <Check size={14} />
                  <span>Save Plan Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING SUCCESS TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-[#203247] text-[#f6f3eb] px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-medium">
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
