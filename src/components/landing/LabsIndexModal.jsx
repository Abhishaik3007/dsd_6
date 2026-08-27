import React, { useState, useEffect } from 'react';
import { useHub } from '../../context/HubContext';
import { 
  X, 
  GitBranch, 
  Layers, 
  Orbit, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

export const LabsIndexModal = ({ isOpen, onClose }) => {
  const { setActiveTab } = useHub();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectLab = (tabName) => {
    onClose();
    setActiveTab(tabName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-[#F4F0E6] text-[#1C2C35] selection:bg-[#347f7a] selection:text-[#F4F0E6]">
      {/* Top Floating Close Button Header */}
      <div className="sticky top-0 z-50 flex justify-center py-4 bg-[#F4F0E6]/80 backdrop-blur-md border-b border-[#1C2C35]/5">
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#203247] text-[#F4F0E6] transition-transform hover:scale-105 cursor-pointer border-none shadow-md"
          aria-label="Close index"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Container */}
      <div className="min-h-[calc(100vh-60px)]">
        {/* HERO SECTION (WITH GRID LINES) */}
        <section className="bg-grid-paper mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 sm:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <p className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-medium">
            THE SIGNAL SCHOOL INDEX
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-[-0.04em] font-bold text-[#203247]">
            Choose your <span className="text-[#347f7a] italic font-normal">rabbit hole.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-[#526b88]">
            A growing set of interactive experiments for the curious, the stuck, and anyone who has ever wondered what is happening under the hood.
          </p>
        </section>

        {/* 03 DESTINATIONS GRID (NO GRID LINES) */}
        <section className="border-t border-[#1C2C35]/10 pt-12 pb-16">
          <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 sm:px-8">
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#526b88] font-medium">
                03 DESTINATIONS
              </span>
              <span className="flex items-center gap-1.5 font-mono-signal text-[10px] text-[#e06c53] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e06c53] animate-pulse" />
                updated as we learn
              </span>
            </div>

            {/* 3 Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1: Logic Gates */}
              <div
                onClick={() => handleSelectLab('logic-gates')}
                className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-[#1C2C35]/10 bg-[#D8E6DD] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#203247]/10 bg-white/40">
                    <GitBranch size={22} strokeWidth={1.4} className="text-[#203247]" />
                  </div>
                  <span className="font-mono-signal text-[9px] uppercase tracking-widest text-[#203247]/60 font-medium">
                    READY
                  </span>
                </div>

                <div>
                  <p className="font-mono-signal text-[9px] uppercase tracking-[0.18em] text-[#347f7a] font-medium mb-1">
                    CIRCUITS
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#203247]">
                    Logic gates
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#203247]/75">
                    Build with the tiny decisions that power every computer.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#203247]">
                    Enter <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Card 2: Data Structures */}
              <div
                onClick={() => triggerToast('Data structures lab coming soon — building in public ✨')}
                className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-[#1C2C35]/10 bg-[#F4DFC9] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#203247]/10 bg-white/40">
                    <Layers size={22} strokeWidth={1.4} className="text-[#203247]" />
                  </div>
                  <span className="font-mono-signal text-[9px] uppercase tracking-widest text-[#203247]/60 font-medium">
                    PREVIEW
                  </span>
                </div>

                <div>
                  <p className="font-mono-signal text-[9px] uppercase tracking-[0.18em] text-[#b3673c] font-medium mb-1">
                    PATTERNS
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#203247]">
                    Data structures
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#203247]/75">
                    Move, sort, and rearrange information until the shape makes sense.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#203247]">
                    Available soon <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Card 3: Algorithms */}
              <div
                onClick={() => triggerToast('Algorithms lab coming soon — building in public ✨')}
                className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-[#1C2C35]/10 bg-[#E2DEEE] p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#203247]/10 bg-white/40">
                    <Orbit size={22} strokeWidth={1.4} className="text-[#203247]" />
                  </div>
                  <span className="font-mono-signal text-[9px] uppercase tracking-widest text-[#203247]/60 font-medium">
                    SOON
                  </span>
                </div>

                <div>
                  <p className="font-mono-signal text-[9px] uppercase tracking-[0.18em] text-[#6b5b95] font-medium mb-1">
                    PROBLEM SOLVING
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#203247]">
                    Algorithms
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#203247]/75">
                    Turn a big question into a sequence of small, solvable moves.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#203247]">
                    Available soon <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>

            {/* RECOMMENDATION BANNER: "Not sure where to start?" */}
            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-[#203247]/10 bg-[#efeadf] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Sparkles size={22} className="text-[#e06c53] shrink-0 mt-1" />
                <div>
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-[#203247]">
                    Not sure where to start?
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-[#526b88]">
                    Try logic gates. Every other computer science idea has a little bit of them inside.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectLab('logic-gates')}
                className="group shrink-0 inline-flex items-center gap-2.5 rounded-full bg-[#203247] px-6 py-3 text-xs font-bold text-[#F4F0E6] transition-transform hover:-translate-y-0.5 cursor-pointer border-none shadow-md"
              >
                <span>Try logic gates</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#203247]/10 py-7 sm:py-9 px-5 sm:px-8 text-[#526b88] text-xs">
          <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div>
              <div className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
                signal<span className="text-[#347f7a] font-normal">school</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#526b88] max-w-xs">
                A small, curious corner of the internet for understanding how computers think.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-8 text-xs text-[#526b88]">
              <span className="cursor-pointer hover:text-[#203247] transition-colors" onClick={() => handleSelectLab('logic-gates')}>
                Labs
              </span>
              <span className="cursor-pointer hover:text-[#203247] transition-colors">
                Say hello
              </span>
              <span className="font-mono-signal text-[10px] uppercase tracking-widest text-[#526b88]/70 font-medium">
                MADE FOR CURIOUS MINDS
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-[#203247] px-6 py-3.5 font-mono-signal text-xs font-semibold text-[#f6f3eb] shadow-2xl border border-white/15 animate-bounce">
          <Sparkles size={15} className="text-[#f7bd65]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
