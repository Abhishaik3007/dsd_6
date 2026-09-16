import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  ChevronDown, 
  Check, 
  Sun, 
  Moon, 
  HelpCircle 
} from 'lucide-react';
import './LabTopBar.css';

/**
 * LabTopBar - Shared Unified Top Navigation Bar
 * Used across both Data Structure Lab (CSVisualizerLab) and Algorithm Lab (AlgoVisualizerLab)
 */
export const LabTopBar = ({
  labTitle = 'Visualizer Lab',
  currentItemTitle = 'Select Item',
  currentId = '',
  categories = [],
  onSelect,
  onBack,
  backLabel = 'Docs',
  floating = false,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenHelp,
  rightActions,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`lab-top-header ${floating ? 'floating' : ''} ${isOpen ? 'is-open' : ''} ${isDarkMode ? 'dark-mode' : ''} ${className}`}
    >
      {/* TOP MAIN ROW */}
      <div className="flex items-center justify-between w-full h-[36px] shrink-0">
        <div className="flex items-center gap-3">
          {/* BACK BUTTON */}
          {onBack && (
            <button
              onClick={onBack}
              title={`Back to ${backLabel}`}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-[#347f7a] hover:text-white'
                  : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a] hover:bg-[#faf8f4]'
              }`}
            >
              <ArrowLeft size={13} />
              <span>{backLabel}</span>
            </button>
          )}

          {/* LAB TITLE */}
          <div className="hidden sm:flex items-center gap-1.5 font-sans">
            <span className={`font-extrabold text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-[#347f7a]'}`}>
              {labTitle}
            </span>
          </div>

          {/* DROPDOWN TRIGGER BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs ${
              isOpen
                ? 'bg-[#347f7a] text-white border-[#347f7a]'
                : isDarkMode
                ? 'bg-[#1e293b] border-slate-700 text-emerald-400 hover:border-[#347f7a]'
                : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a] hover:bg-[#faf8f4]'
            }`}
          >
            <Layers size={14} className={isOpen ? 'text-white' : isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'} />
            <span className="uppercase font-extrabold">{currentItemTitle}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-[#647895]'}`}
            />
          </button>
        </div>

        {/* HEADER RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {rightActions}

          {/* THEME TOGGLE (IF PROVIDED) */}
          {onToggleDarkMode && (
            <button
              className={`w-9 h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 shadow-xs'
                  : 'bg-white border-[#203247]/12 text-[#647895] hover:text-[#203247] hover:border-[#347f7a] shadow-2xs'
              }`}
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Warm Studio' : 'Switch to Dark Signal Mode'}
            >
              {isDarkMode ? (
                <Moon size={17} className="text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Sun size={17} className="text-amber-500 animate-in spin-in-90 duration-300" />
              )}
            </button>
          )}

          {/* HELP MODAL BUTTON (IF PROVIDED) */}
          {onOpenHelp && (
            <button
              className={`w-9 h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? 'bg-[#347f7a]/20 border-[#347f7a]/40 text-emerald-400 hover:bg-[#347f7a]/35 shadow-xs'
                  : 'bg-white border-[#203247]/12 text-[#347f7a] hover:bg-[#347f7a]/10 hover:border-[#347f7a] shadow-2xs'
              }`}
              onClick={onOpenHelp}
              title="Visualizer Guide & Help"
            >
              <HelpCircle size={17} />
            </button>
          )}
        </div>
      </div>

      {/* SMOOTH ANIMATED EXPANDING CATEGORIES DRAWER */}
      <div className={`lab-menu-expand-container ${isOpen ? 'open' : ''}`}>
        <div className="lab-menu-expand-inner">
          <div className="w-full pt-3 mt-3 border-t border-[#203247]/10 dark:border-slate-800">
            <div
              className={`grid gap-3.5 pb-1 ${
                categories.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : categories.length === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {categories.map((cat, catIdx) => (
                <div key={cat.name || catIdx} className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-[#647895] tracking-wider px-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cat.color || 'bg-teal-500'}`} />
                    <span>{cat.name}</span>
                  </div>

                  <div className={`grid ${cat.gridCols || 'grid-cols-1'} gap-1.5`}>
                    {cat.items?.map((item) => {
                      const isSelected = currentId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex items-center justify-between ${
                            isSelected
                              ? isDarkMode
                                ? 'bg-[#347f7a]/25 border-[#347f7a] text-emerald-400'
                                : 'bg-[#347f7a] border-[#347f7a] text-white shadow-xs'
                              : isDarkMode
                              ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                              : 'bg-white/80 border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {isSelected && (
                            <Check
                              size={14}
                              className={isSelected && !isDarkMode ? 'text-white' : 'text-[#347f7a]'}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
