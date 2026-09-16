import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, ArrowLeft } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const SignalDatePicker = ({
  value,
  onChange,
  label = 'Contract Expiry Date',
  direction,
  minDate = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  // 'days' | 'months' | 'years'
  const [viewMode, setViewMode] = useState('days');
  const containerRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (direction === 'top') {
        setOpenUpwards(true);
      } else if (direction === 'bottom') {
        setOpenUpwards(false);
      } else {
        setOpenUpwards(spaceBelow < 340 && spaceAbove > spaceBelow);
      }
    }
    setIsOpen(!isOpen);
    setViewMode('days');
  };

  // Parse initial date or default to today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  // Close calendar on click outside & reset to days view
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Days in month calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSelectDay = (day) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectMonth = (monthIndex) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode('days');
  };

  const handleSelectYear = (year) => {
    setViewDate(new Date(year, currentMonth, 1));
    setViewMode('days');
  };

  // Quick Preset Helper
  const setQuickPreset = (monthsToAdd) => {
    const now = new Date();
    const future = new Date(now.getFullYear(), now.getMonth() + monthsToAdd, now.getDate());
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setViewDate(future);
    setIsOpen(false);
    setViewMode('days');
  };

  // Generate Year Range (from current year - 1 to current year + 9)
  const baseYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 11 }, (_, i) => baseYear - 1 + i);

  // Display text formatted: e.g. "Dec 31, 2027"
  const formattedDisplay = (() => {
    if (!value) return 'Select date';
    try {
      const [y, m, d] = value.split('-');
      const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return value;
    }
  })();

  return (
    <div className="relative font-space-grotesk" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895] font-semibold">
            {label}
          </label>
          <div className="flex items-center gap-1.5 text-[10px] font-mono-signal text-[#347f7a]">
            <button
              type="button"
              onClick={() => setQuickPreset(6)}
              className="hover:underline cursor-pointer bg-[#d9e8df]/60 px-1.5 py-0.5 rounded text-[#347f7a]"
            >
              +6 Mo
            </button>
            <button
              type="button"
              onClick={() => setQuickPreset(12)}
              className="hover:underline cursor-pointer bg-[#d9e8df]/60 px-1.5 py-0.5 rounded text-[#347f7a]"
            >
              +1 Yr
            </button>
            <button
              type="button"
              onClick={() => setQuickPreset(24)}
              className="hover:underline cursor-pointer bg-[#d9e8df]/60 px-1.5 py-0.5 rounded text-[#347f7a]"
            >
              +2 Yrs
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full h-12 px-4 bg-white border border-[#203247]/15 hover:border-[#347f7a]/60 rounded-2xl text-sm text-[#203247] flex items-center justify-between transition-all cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#d9e8df] text-[#347f7a]">
            <Calendar size={14} />
          </div>
          <span className="font-semibold text-xs text-[#203247]">
            {formattedDisplay}
          </span>
          {value && (
            <span className="font-mono-signal text-[10px] text-[#647895] bg-[#f5f3ed] px-2 py-0.5 rounded-md">
              {value}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[#647895] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#347f7a]' : ''}`}
        />
      </button>

      {/* Elevated Popover Calendar */}
      {isOpen && (
        <div className={`absolute right-0 w-[300px] sm:w-[320px] p-4 bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl shadow-2xl z-50 animate-fade-in backdrop-blur-md ${
          openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          {/* HEADER SECTION */}
          {viewMode === 'days' ? (
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#203247]/10">
              <button
                type="button"
                onClick={prevMonth}
                title="Previous Month"
                className="p-1.5 rounded-full hover:bg-white text-[#647895] hover:text-[#203247] cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Month Jump Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('months')}
                  className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#203247]/10 hover:border-[#347f7a] text-xs font-semibold text-[#203247] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>{MONTH_NAMES[currentMonth]}</span>
                  <ChevronDown size={11} className="text-[#647895]" />
                </button>

                {/* Year Jump Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('years')}
                  className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#203247]/10 hover:border-[#347f7a] text-xs font-bold text-[#347f7a] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs font-mono-signal"
                >
                  <span>{currentYear}</span>
                  <ChevronDown size={11} className="text-[#347f7a]" />
                </button>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                title="Next Month"
                className="p-1.5 rounded-full hover:bg-white text-[#647895] hover:text-[#203247] cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#203247]/10">
              <div className="font-display text-sm font-semibold text-[#203247]">
                {viewMode === 'months' ? 'Select Month' : 'Select Year'}
              </div>
              <button
                type="button"
                onClick={() => setViewMode('days')}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#203247]/10 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={12} />
                <span>Days</span>
              </button>
            </div>
          )}

          {/* VIEW 1: DAYS VIEW */}
          {viewMode === 'days' && (
            <div>
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {DAYS.map((d, i) => (
                  <div key={i} className="font-mono-signal text-[10px] text-[#647895] uppercase font-semibold">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-8" />
                ))}

                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const mm = String(currentMonth + 1).padStart(2, '0');
                  const dd = String(day).padStart(2, '0');
                  const dateString = `${currentYear}-${mm}-${dd}`;
                  const isSelected = value === dateString;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center font-medium text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#347f7a] text-[#f6f3eb] font-bold shadow-xs'
                          : 'text-[#203247] hover:bg-[#d9e8df]/70 hover:text-[#203247]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Presets Footer */}
              <div className="mt-3 pt-3 border-t border-[#203247]/10 flex items-center justify-between text-[11px]">
                <span className="font-mono-signal text-[10px] text-[#647895]">Academic Presets:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickPreset(12)}
                    className="px-2 py-1 rounded-lg bg-white border border-[#203247]/10 hover:border-[#347f7a] text-[#203247] font-semibold text-[10px] cursor-pointer shadow-2xs"
                  >
                    1 Year
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickPreset(24)}
                    className="px-2 py-1 rounded-lg bg-white border border-[#203247]/10 hover:border-[#347f7a] text-[#203247] font-semibold text-[10px] cursor-pointer shadow-2xs"
                  >
                    2 Years
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: MONTH SELECTION GRID */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-2 animate-fade-in">
              {MONTH_SHORT.map((mName, idx) => {
                const isSelected = currentMonth === idx;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleSelectMonth(idx)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#347f7a] border-[#347f7a] text-[#f6f3eb] shadow-xs'
                        : 'bg-white border-[#203247]/10 hover:border-[#347f7a] text-[#203247] hover:bg-[#d9e8df]/40'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: YEAR SELECTION GRID */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-2 max-h-56 overflow-y-auto no-scrollbar animate-fade-in">
              {yearsList.map((y) => {
                const isSelected = currentYear === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-mono-signal font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#347f7a] border-[#347f7a] text-[#f6f3eb] shadow-xs'
                        : 'bg-white border-[#203247]/10 hover:border-[#347f7a] text-[#203247] hover:bg-[#d9e8df]/40'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
