import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Layers, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import { useInstitute } from '../../context/InstituteContext';
import { sortByPriceLowToHigh } from '../../utils/tierConfig';

const ICON_MAP = {
  Users,
  GraduationCap,
  Sparkles,
  Layers,
  ShieldCheck
};

export const INDIVIDUAL_PLANS = [
  {
    id: 'Community Pass',
    name: 'Community Pass',
    price: 'Open',
    description: 'Essential sandbox & open practice',
    badge: 'Community',
    icon: Users,
    iconBg: 'bg-[#e2e8f0] text-[#647895]'
  },
  {
    id: 'Individual Starter',
    name: 'Individual Starter',
    price: '₹999 / mo',
    description: 'Foundational visualizers & core problems',
    badge: 'Starter',
    icon: GraduationCap,
    iconBg: 'bg-[#cbe8e7] text-[#2f7f85]'
  },
  {
    id: 'Individual Pro Plan',
    name: 'Individual Pro Plan',
    price: '₹2,400 / mo',
    description: 'Full interactive lab access & DSP sandbox',
    badge: 'Pro Tier',
    icon: Sparkles,
    iconBg: 'bg-[#d9e8df] text-[#347f7a]'
  },
  {
    id: 'Researcher Pro Pass',
    name: 'Researcher Pro Pass',
    price: '₹4,100 / mo',
    description: 'Advanced simulations & export analytics',
    badge: 'Research',
    icon: Layers,
    iconBg: 'bg-[#f5dec5] text-[#d97d54]'
  }
];

export const IndividualPlanSelect = ({
  value,
  onChange,
  label = 'Plan Tier',
  className = '',
  plans: propPlans
}) => {
  let ctxIndividualPlans = null;
  try {
    const instCtx = useInstitute();
    ctxIndividualPlans = instCtx?.individualPlans;
  } catch (_) {}

  const [availablePlans, setAvailablePlans] = useState(() => {
    if (propPlans && propPlans.length > 0) return propPlans;
    if (ctxIndividualPlans && ctxIndividualPlans.length > 0) return ctxIndividualPlans;
    try {
      const raw = localStorage.getItem('signalschool_individual_plans');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INDIVIDUAL_PLANS;
  });

  useEffect(() => {
    if (propPlans && propPlans.length > 0) {
      setAvailablePlans(propPlans);
      return;
    }
    if (ctxIndividualPlans && ctxIndividualPlans.length > 0) {
      setAvailablePlans(ctxIndividualPlans);
      return;
    }
    const handleUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setAvailablePlans(e.detail);
      }
    };
    window.addEventListener('signalschool_individual_plans_updated', handleUpdate);
    return () => window.removeEventListener('signalschool_individual_plans_updated', handleUpdate);
  }, [propPlans, ctxIndividualPlans]);

  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  const getPlanIcon = (plan) => {
    if (typeof plan?.icon === 'function') return plan.icon;
    if (plan?.iconName && ICON_MAP[plan.iconName]) return ICON_MAP[plan.iconName];
    const lower = (plan?.name || plan?.id || '').toLowerCase();
    if (lower.includes('community')) return Users;
    if (lower.includes('starter')) return GraduationCap;
    if (lower.includes('research')) return Layers;
    return Sparkles;
  };

  const getPlanStyles = (plan) => {
    if (plan?.iconBg) return plan.iconBg;
    const lower = (plan?.name || plan?.id || '').toLowerCase();
    if (lower.includes('community')) return 'bg-[#e2e8f0] text-[#647895]';
    if (lower.includes('starter')) return 'bg-[#cbe8e7] text-[#2f7f85]';
    if (lower.includes('research')) return 'bg-[#f5dec5] text-[#d97d54]';
    return 'bg-[#d9e8df] text-[#347f7a]';
  };

  const getPlanBadge = (plan) => {
    if (plan?.badge) return plan.badge;
    if (plan?.price) return plan.price;
    const lower = (plan?.name || plan?.id || '').toLowerCase();
    if (lower.includes('community')) return 'Community';
    if (lower.includes('starter')) return 'Starter';
    if (lower.includes('research')) return 'Research';
    return 'Pro Tier';
  };

  const rawList = availablePlans.length > 0 ? availablePlans : INDIVIDUAL_PLANS;
  const plansList = sortByPriceLowToHigh(rawList);
  const selectedPlan = plansList.find(p => p.id === value || p.name === value) || plansList[0] || INDIVIDUAL_PLANS[0];
  const IconComponent = getPlanIcon(selectedPlan);
  const selectedIconBg = getPlanStyles(selectedPlan);
  const selectedBadge = getPlanBadge(selectedPlan);

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If space below is constrained, open upwards
      setOpenUpwards(spaceBelow < 240 && spaceAbove > spaceBelow);
    }
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleSelect = (plan) => {
    onChange(plan.name || plan.id, plan);
    setIsOpen(false);
  };

  return (
    <div className={`relative font-space-grotesk ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-12 px-4 bg-white border rounded-2xl text-sm text-[#203247] flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#347f7a] ring-2 ring-[#347f7a]/15 shadow-sm'
            : 'border-[#203247]/15 hover:border-[#347f7a]/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1">
          <div className={`w-7 h-7 rounded-xl ${selectedIconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
            <IconComponent size={14} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs text-[#203247] truncate">
              {selectedPlan.name || selectedPlan.id}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono-signal rounded-full bg-[#203247]/5 text-[#647895] truncate">
              {selectedBadge}
            </span>
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`text-[#647895] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#347f7a]' : ''
          }`}
        />
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 w-full min-w-[290px] bg-[#fbf9f4] border border-[#203247]/15 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="space-y-1">
            {plansList.map((plan) => {
              const isSelected = selectedPlan.id === plan.id || selectedPlan.name === plan.name;
              const PlanIcon = getPlanIcon(plan);
              const planBg = getPlanStyles(plan);
              const badge = getPlanBadge(plan);
              const priceDisplay = plan.price && plan.price !== badge ? plan.price : null;

              return (
                <button
                  key={plan.id || plan.name}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(plan)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-white border-[#347f7a]/40 shadow-xs ring-1 ring-[#347f7a]/15'
                      : 'border-transparent hover:bg-white/80 hover:border-[#203247]/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl ${planBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <PlanIcon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#347f7a]' : 'text-[#203247]'}`}>
                          {plan.name || plan.id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono-signal bg-[#203247]/5 text-[#647895]">
                          {badge}
                        </span>
                        {priceDisplay && (
                          <span className="text-[10px] font-mono-signal font-semibold text-[#347f7a]">
                            {priceDisplay}
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-[11px] text-[#647895] truncate font-normal mt-0.5 max-w-[260px] sm:max-w-[340px]">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#347f7a] text-white flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
