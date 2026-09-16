import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Users, Layers, Sparkles, ShieldCheck } from 'lucide-react';

export const CONTRACT_TIERS = [
  {
    id: 'Department Lab Pack',
    name: 'Department Lab Pack',
    defaultSeats: 100,
    icon: Users
  },
  {
    id: 'Campus Enterprise Pack',
    name: 'Campus Enterprise Pack',
    defaultSeats: 300,
    icon: Layers
  },
  {
    id: 'University Network Pack',
    name: 'University Network Pack',
    defaultSeats: 1000,
    icon: Sparkles
  }
];

export const ContractTierSelect = ({
  value,
  onChange,
  label = 'Contract Tier',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  // Find current selected tier object or fallback
  const selectedTier = CONTRACT_TIERS.find(t => t.id === value || t.name === value) || CONTRACT_TIERS[1];
  const IconComponent = selectedTier.icon || ShieldCheck;

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 170px available below and space above is greater, pop upwards
      setOpenUpwards(spaceBelow < 170 && spaceAbove > spaceBelow);
    }
    setIsOpen(prev => !prev);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
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

  const handleSelect = (tier) => {
    onChange(tier.id, tier);
    setIsOpen(false);
  };

  return (
    <div className={`relative font-space-grotesk ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
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
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <div className="w-6 h-6 rounded-lg bg-[#d9e8df] text-[#347f7a] flex items-center justify-center shrink-0">
            <IconComponent size={13} />
          </div>
          <span className="font-semibold text-xs text-[#203247] truncate">
            {selectedTier.name}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-[#647895] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#347f7a]' : ''
          }`}
        />
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 w-full min-w-[220px] bg-[#fbf9f4] border border-[#203247]/15 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <div className="space-y-1">
            {CONTRACT_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const TierIcon = tier.icon;

              return (
                <button
                  key={tier.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(tier)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-white border-[#347f7a]/40 shadow-xs ring-1 ring-[#347f7a]/15'
                      : 'border-transparent hover:bg-white/80 hover:border-[#203247]/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#347f7a] text-white shadow-2xs'
                          : 'bg-[#e7e3d8] text-[#203247]'
                      }`}
                    >
                      <TierIcon size={13} />
                    </div>

                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isSelected ? 'text-[#347f7a]' : 'text-[#203247]'
                      }`}
                    >
                      {tier.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="p-0.5 text-[#347f7a] shrink-0">
                      <Check size={14} strokeWidth={2.5} />
                    </div>
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
