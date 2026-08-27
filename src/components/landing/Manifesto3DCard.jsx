import React, { useState, useRef } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export function Manifesto3DCard() {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Percentage for spotlight
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    setCursorPos({ x: px, y: py });

    // Tilt angle
    const centerX = x - rect.width / 2;
    const centerY = y - rect.height / 2;
    setRotate({
      x: (-centerY / rect.height) * 10,
      y: (centerX / rect.width) * 10,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setCursorPos({ x: 50, y: 50 });
  };

  return (
    <div className="perspective-1000 w-full select-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: rotate.x === 0 && rotate.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="group relative min-h-[350px] flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#1A2936] p-8 sm:p-10 text-[#f6f3eb] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] transition-all"
      >
        {/* Dynamic Holographic Cursor Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at ${cursorPos.x}% ${cursorPos.y}%, rgba(245,190,103,0.15), transparent 65%)`,
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* Soft Minimal Mesh Glow */}
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isHovered ? 'bg-[#f5be67]/15 scale-110' : 'bg-[#347f7a]/10'
          }`}
        />

        {/* Minimal Grid Dots Background */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#a3c7bb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Top Tag (Spatial 3D) */}
        <div
          className="relative z-10 flex items-center justify-between"
          style={{ transform: 'translateZ(18px)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a3c7bb] font-medium flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f09a7d]" />
            signal / noise
          </span>
          <span className="font-mono-signal text-[9px] uppercase tracking-widest text-[#f6f3eb]/40 font-medium">
            MANIFESTO
          </span>
        </div>

        {/* Main Clean Quote (Spatial 3D) */}
        <div
          className="relative z-10 my-auto pt-6 pb-4"
          style={{ transform: 'translateZ(30px)' }}
        >
          <p className="max-w-md font-display text-3xl sm:text-4xl font-bold leading-[1.18] tracking-[-0.035em] text-[#f6f3eb]">
            The best answers are <em className="italic font-normal text-[#f5be67]">built</em>, not memorized.
          </p>
        </div>

        {/* Minimal Footer (Spatial 3D) */}
        <div
          className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex items-center gap-2 text-[#a3c7bb]">
            <Sparkles size={16} strokeWidth={1.5} className="text-[#f5be67]" />
            <span className="font-mono-signal text-[10px] uppercase tracking-wider font-medium text-[#f6f3eb]/75">
              First principles learning
            </span>
          </div>

          <span className="font-mono-signal text-[10px] text-[#f6f3eb]/40 group-hover:text-[#f5be67] transition-colors flex items-center gap-1">
            01 <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
