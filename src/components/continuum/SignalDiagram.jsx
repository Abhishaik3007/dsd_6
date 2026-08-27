import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lightbulb, Zap, CheckCircle2, RefreshCw, Trophy } from 'lucide-react';

// Pool of levels for 3D minigame
const LEVELS = [
  {
    id: 1,
    name: 'SIGNAL LOCK #1',
    hint: 'Turn ON both Input A AND Input B',
    eval: (a, b) => a && b,
  },
  {
    id: 2,
    name: 'PARITY FILTER #2',
    hint: 'Turn ON Input A or Input B, but NOT both',
    eval: (a, b) => a !== b,
  },
  {
    id: 3,
    name: 'INVERTED CODE #3',
    hint: 'Turn ON Input B, but keep Input A OFF',
    eval: (a, b) => !a && b,
  },
  {
    id: 4,
    name: 'RESONANCE #4',
    hint: 'Turn ON both inputs to complete the chain',
    eval: (a, b) => a && b,
  },
];

function Tactile3DBitButton({ label, value, onChange }) {
  return (
    <button
      onClick={onChange}
      className="group flex w-full items-center gap-3 text-left cursor-pointer border-none bg-transparent p-0 select-none transform transition-transform duration-150 active:scale-95"
      aria-pressed={value}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono-signal text-sm font-bold transition-all duration-300 shadow-md ${value
            ? 'bg-[#A3C7BB] text-[#14232C] border-2 border-[#D6E5DB] shadow-[0_4px_0_#6D958A] translate-y-[-2px]'
            : 'bg-[#1D323E] border border-[#3A5562] text-[#82A39A] group-hover:border-[#A3C7BB] group-hover:text-[#F4F0E6] shadow-[0_3px_0_#12222B]'
          }`}
      >
        {value ? '1' : '0'}
      </span>
      <span className="font-mono-signal text-[11px] uppercase tracking-[0.16em] text-[#82A39A] group-hover:text-[#D6E5DB] transition-colors font-medium">
        {label}
      </span>
    </button>
  );
}

export function SignalDiagram() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [score, setScore] = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const currentLevel = LEVELS[levelIndex];
  const isUnlocked = currentLevel.eval(a, b);

  useEffect(() => {
    if (isUnlocked && !showVictory) {
      setShowVictory(true);
      setScore((prev) => prev + 100);
    }
  }, [isUnlocked, showVictory]);

  const handleNextLevel = () => {
    const nextIdx = (levelIndex + 1) % LEVELS.length;
    setLevelIndex(nextIdx);
    setA(false);
    setB(false);
    setShowVictory(false);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: (-y / rect.height) * 8,
      y: (x / rect.width) * 8,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center select-none w-full perspective-1000">
      {/* 3D Tilted Glassmorphic Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: rotate.x === 0 && rotate.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/15 bg-gradient-to-br from-[#1C2C35] via-[#15252F] to-[#0D181F] p-5 sm:p-7 md:p-8 text-[#F4F0E6] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        {/* Subtle Background Mesh Glow (Soft & Refined) */}
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isUnlocked ? 'bg-[#F5BE67]/12 scale-105' : 'bg-[#347F7A]/10'
            }`}
        />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-[#EE7C5D]/10 blur-3xl pointer-events-none" />

        {/* Subtle Inner Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#a3c7bb 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Card Header (Pops out in 3D) */}
        <div
          className="relative flex items-start justify-between z-20"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-signal text-[10px] uppercase tracking-[0.22em] text-[#82A39A] font-semibold flex items-center gap-1.5">
                <Zap size={12} className={isUnlocked ? 'text-[#F5BE67]' : 'text-[#82A39A]'} />
                {currentLevel.name}
              </span>
              {score > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-[#F5BE67]/15 border border-[#F5BE67]/25 px-2.5 py-0.5 font-mono-signal text-[9px] text-[#F5BE67] font-semibold">
                  <Trophy size={10} /> {score} PTS
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#F4F0E6] font-bold">
              Unlock the signal.
            </h2>
          </div>

          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border transition-all duration-500 ${isUnlocked
                ? 'border-[#F5BE67]/50 bg-[#F5BE67]/15 text-[#F5BE67] shadow-md shadow-[#F5BE67]/15'
                : 'border-white/10 bg-white/5 text-[#54737B]'
              }`}
          >
            <Lightbulb
              size={22}
              strokeWidth={1.5}
              className={isUnlocked ? 'drop-shadow-[0_0_6px_rgba(245,190,103,0.4)]' : ''}
              aria-label={isUnlocked ? 'Signal Unlocked' : 'Signal Locked'}
            />
          </div>
        </div>

        {/* Perfectly Balanced 3D Circuit Grid */}
        <div
          className="relative mt-7 sm:mt-9 grid grid-cols-[1.35fr_1fr_0.75fr] items-center gap-3 sm:gap-5 md:gap-7 z-20"
          style={{ transform: 'translateZ(35px)' }}
        >
          {/* Left Column: 2 Symmetrical Tactile 3D Bit Buttons */}
          <div className="space-y-6 z-20">
            <Tactile3DBitButton label="IN A" value={a} onChange={() => setA(!a)} />
            <Tactile3DBitButton label="IN B" value={b} onChange={() => setB(!b)} />
          </div>

          {/* Center 3D Processor Core Chip (Micro-adjusted position) */}
          <div className="flex flex-col items-center justify-center gap-1.5 z-20 my-auto -mt-2 translate-x-2">
            <span className="font-mono-signal text-[9px] uppercase tracking-widest text-[#82A39A] font-semibold">
              PROCESSOR CORE
            </span>
            <div
              className={`relative flex h-20 w-24 flex-col items-center justify-center rounded-2xl border transition-all duration-500 select-none shadow-xl overflow-hidden ${isUnlocked
                  ? 'border-[#F5BE67] bg-gradient-to-b from-[#223D4A] via-[#192E39] to-[#12242D] shadow-lg shadow-[#F5BE67]/15'
                  : 'border-[#A3C7BB]/35 bg-gradient-to-b from-[#1E3643] via-[#162933] to-[#0E1C23] shadow-[0_12px_30px_rgba(0,0,0,0.4)]'
                }`}
            >
              {/* Glass Top Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              <span className="font-mono-signal text-[10px] text-[#A3C7BB] uppercase font-bold tracking-wider">
                CORE v2
              </span>
              <span
                className={`font-display text-2xl font-bold transition-colors ${isUnlocked ? 'text-[#F5BE67]' : 'text-[#F4F0E6]'
                  }`}
              >
                {isUnlocked ? '⚡' : '⟁'}
              </span>

              {/* Symmetrical Status LEDs */}
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full transition-colors ${a ? 'bg-[#A3C7BB]' : 'bg-[#2A434E]'}`} />
                <span className={`h-1.5 w-1.5 rounded-full transition-colors ${b ? 'bg-[#A3C7BB]' : 'bg-[#2A434E]'}`} />
              </div>
            </div>
          </div>

          {/* Right Column: Symmetrical 3D Output Display */}
          <div className="flex flex-col items-center justify-center gap-2 z-20 my-auto">
            <span
              className={`h-4.5 w-4.5 rounded-full transition-all duration-500 ${isUnlocked
                  ? 'bg-[#F5BE67] shadow-[0_0_10px_rgba(245,190,103,0.4)]'
                  : 'bg-[#3A5562]'
                }`}
            />
            <span className="font-mono-signal text-[10px] uppercase tracking-widest text-[#82A39A] font-semibold">
              OUTPUT
            </span>
            <strong
              className={`font-display text-5xl leading-none transition-all duration-300 ${isUnlocked ? 'text-[#F5BE67]' : 'text-[#F4F0E6]'
                }`}
            >
              {isUnlocked ? '1' : '0'}
            </strong>
          </div>

          {/* Perfectly Aligned Connecting SVG Lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full z-10"
            viewBox="0 0 400 130"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Input A Line into Processor Top Left */}
            <path
              d="M 65 34 H 175 Q 195 34 205 54 H 225"
              fill="none"
              stroke={a ? '#A3C7BB' : '#3A5562'}
              strokeWidth={a ? '1.8' : '1.2'}
              strokeDasharray={a ? 'none' : '3 4'}
            />
            {/* Input B Line into Processor Bottom Left */}
            <path
              d="M 65 96 H 175 Q 195 96 205 61 H 225"
              fill="none"
              stroke={b ? '#A3C7BB' : '#3A5562'}
              strokeWidth={b ? '1.8' : '1.2'}
              strokeDasharray={b ? 'none' : '3 4'}
            />
            {/* Output Line from Processor Center Right */}
            <path
              d="M 292 58 H 345"
              fill="none"
              stroke={isUnlocked ? '#F5BE67' : '#3A5562'}
              strokeWidth={isUnlocked ? '2' : '1.2'}
              strokeDasharray={isUnlocked ? 'none' : '3 4'}
            />
          </svg>
        </div>

        {/* Footer Hint & Victory Action */}
        <div
          className="relative mt-9 flex items-center justify-between border-t border-white/10 pt-4 text-xs z-20"
          style={{ transform: 'translateZ(20px)' }}
        >
          <span className="font-mono-signal text-[11px] text-[#82A39A]">
            {currentLevel.hint}
          </span>

          {isUnlocked ? (
            <button
              onClick={handleNextLevel}
              className="flex items-center gap-2 rounded-full bg-[#F5BE67] px-4 py-2 font-mono-signal text-[11px] font-bold text-[#14232C] shadow-sm transition-all hover:bg-[#E2AF5B] hover:scale-105 cursor-pointer border-none"
            >
              <CheckCircle2 size={14} />
              <span>NEXT LEVEL</span>
              <RefreshCw size={12} className="ml-0.5" />
            </button>
          ) : (
            <span className="flex items-center gap-1.5 font-mono-signal text-[11px] text-[#F4F0E6] font-medium group">
              toggle inputs <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>

      {/* Caption below card */}
      <p className="mt-4 font-mono-signal text-[11px] text-[#1C2C35]/65 text-center tracking-wide font-medium">
        A circuit is just a conversation between yes and no.
      </p>
    </div>
  );
}
