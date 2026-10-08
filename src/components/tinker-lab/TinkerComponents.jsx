import React, { memo } from 'react';
import { getResistorColorBands } from './engine/tinkerSolver';

/**
 * Premium 2.5D High-Fidelity Electronic Components for TinkerLab
 * Styled to rival Autodesk Tinkercad & professional CAD design suites.
 */

// 1. Ultra-Realistic Axial Resistor Component
export const TinkerResistor = memo(({
  x = 0,
  y = 0,
  resistance = 220,
  rotation = 0,
  isSelected = false,
  onPinClick,
  onMouseDown
}) => {
  const bands = getResistorColorBands(resistance);

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : undefined }}
    >
      <defs>
        {/* Ceramic Body Curved Lighting Gradient */}
        <linearGradient id={`res-body-${resistance}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF5E8" />
          <stop offset="20%" stopColor="#F2E3C6" />
          <stop offset="60%" stopColor="#DFCCA3" />
          <stop offset="85%" stopColor="#BAA276" />
          <stop offset="100%" stopColor="#8C7043" />
        </linearGradient>

        {/* Crisp Band Cylindrical Highlight Overlay */}
        <linearGradient id={`res-band-gloss-${resistance}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* 3D Realistic Metallic Leads (Identical to LED: Drop Shadow + Dark Chrome Edge + Silver Core + Specular Highlight) */}
      {/* Lead Ambient Drop Shadows */}
      <path d="M -30 0 L -15 0" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M 15 0 L 30 0" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />

      {/* Outer Metallic Lead Wire Edge (Dark Chrome / Shadow) */}
      <path d="M -30 0 L -15 0" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 15 0 L 30 0" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

      {/* Polished Silver Wire Body */}
      <path d="M -30 0 L -15 0" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <path d="M 15 0 L 30 0" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />

      {/* Longitudinal Specular Centerline Highlight (Crisp Metallic Sheen) */}
      <path d="M -30 0 L -15 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
      <path d="M 15 0 L 30 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

      {/* Interactive Solder Terminals - Standard Silver Leg Pins */}
      {/* Pin 1 Terminal (Left, pin_1: -30, 0) */}
      <circle
        cx="-30"
        cy="0"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_1', -30, 0); }}
      />
      <circle cx="-30" cy="0" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-30.8" cy="-0.8" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 2 Terminal (Right, pin_2: 30, 0) */}
      <circle
        cx="30"
        cy="0"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_2', 30, 0); }}
      />
      <circle cx="30" cy="0" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="29.2" cy="-0.8" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Resistor Contoured Ceramic Body with Straight Cylindrical Barrel */}
      <path
        d="M -15 -7.5 C -12 -7.5, -11 -6.5, -9 -6.5 L 9 -6.5 C 11 -6.5, 12 -7.5, 15 -7.5 C 18 -7.5, 18 -3, 18 0 C 18 3, 18 7.5, 15 7.5 C 12 7.5, 11 6.5, 9 6.5 L -9 6.5 C -11 6.5, -12 7.5, -15 7.5 C -18 7.5, -18 3, -18 0 C -18 -3, -18 -7.5, -15 -7.5 Z"
        fill={`url(#res-body-${resistance})`}
        stroke="#8C7348"
        strokeWidth="0.8"
      />

      {/* 4 Crisp Enameled Color Bands - Uniform 13px height, perfectly aligned across barrel */}
      {/* Band 1 (Digit 1) */}
      <g>
        <rect x="-9.5" y="-6.5" width="3.2" height="13" rx="0.5" fill={bands[0]} stroke="rgba(0,0,0,0.12)" strokeWidth="0.4" />
        <rect x="-9.5" y="-6.5" width="3.2" height="13" rx="0.5" fill={`url(#res-band-gloss-${resistance})`} />
      </g>
      {/* Band 2 (Digit 2) */}
      <g>
        <rect x="-4.8" y="-6.5" width="3.2" height="13" rx="0.5" fill={bands[1]} stroke="rgba(0,0,0,0.12)" strokeWidth="0.4" />
        <rect x="-4.8" y="-6.5" width="3.2" height="13" rx="0.5" fill={`url(#res-band-gloss-${resistance})`} />
      </g>
      {/* Band 3 (Multiplier) */}
      <g>
        <rect x="-0.1" y="-6.5" width="3.2" height="13" rx="0.5" fill={bands[2]} stroke="rgba(0,0,0,0.12)" strokeWidth="0.4" />
        <rect x="-0.1" y="-6.5" width="3.2" height="13" rx="0.5" fill={`url(#res-band-gloss-${resistance})`} />
      </g>
      {/* Band 4 (Tolerance - Gold 5%) */}
      <g>
        <rect x="6.8" y="-6.5" width="3.2" height="13" rx="0.5" fill="#D4AF37" stroke="rgba(0,0,0,0.15)" strokeWidth="0.4" />
        <rect x="6.8" y="-6.5" width="3.2" height="13" rx="0.5" fill={`url(#res-band-gloss-${resistance})`} />
      </g>
    </g>
  );
});

// 2. Tinkercad-Grade 3D Glossy LED Component (Authentic T-1 3/4 Silhouette, Clean 3D Shading & Radiant Glow)
export const TinkerLED = memo(({
  x = 0,
  y = 0,
  color = 'red',
  isLit = false,
  isBurnedOut = false,
  rotation = 0,
  isSelected = false,
  onPinClick,
  onMouseDown
}) => {
  const LED_PALETTES = {
    red: {
      unlit: { c1: '#F87171', c2: '#EF4444', c3: '#DC2626', c4: '#991B1B', c5: '#7F1D1D' },
      lit: { c1: '#FFFFFF', c2: '#FECACA', c3: '#EF4444', c4: '#DC2626', c5: '#B91C1C' },
      glow: '#EF4444',
      stroke: '#7F1D1D'
    },
    green: {
      unlit: { c1: '#86EFAC', c2: '#4ADE80', c3: '#16A34A', c4: '#15803D', c5: '#14532D' },
      lit: { c1: '#FFFFFF', c2: '#BBF7D0', c3: '#22C55E', c4: '#16A34A', c5: '#15803D' },
      glow: '#22C55E',
      stroke: '#14532D'
    },
    blue: {
      unlit: { c1: '#93C5FD', c2: '#60A5FA', c3: '#2563EB', c4: '#1D4ED8', c5: '#1E3A8A' },
      lit: { c1: '#FFFFFF', c2: '#BFDBFE', c3: '#3B82F6', c4: '#2563EB', c5: '#1D4ED8' },
      glow: '#3B82F6',
      stroke: '#1E3A8A'
    },
    yellow: {
      unlit: { c1: '#FEF08A', c2: '#FACC15', c3: '#EAB308', c4: '#CA8A04', c5: '#78350F' },
      lit: { c1: '#FFFFFF', c2: '#FEF9C3', c3: '#FACC15', c4: '#EAB308', c5: '#CA8A04' },
      glow: '#EAB308',
      stroke: '#78350F'
    },
    orange: {
      unlit: { c1: '#FDBA74', c2: '#FB923C', c3: '#EA580C', c4: '#C2410C', c5: '#7C2D12' },
      lit: { c1: '#FFFFFF', c2: '#FFEDD5', c3: '#F97316', c4: '#EA580C', c5: '#C2410C' },
      glow: '#F97316',
      stroke: '#7C2D12'
    },
    white: {
      unlit: { c1: '#FFFFFF', c2: '#F1F5F9', c3: '#CBD5E1', c4: '#94A3B8', c5: '#475569' },
      lit: { c1: '#FFFFFF', c2: '#FFFFFF', c3: '#F8FAFC', c4: '#E2E8F0', c5: '#CBD5E1' },
      glow: '#F8FAFC',
      stroke: '#475569'
    }
  };

  const pal = LED_PALETTES[color] || LED_PALETTES.red;
  const shades = isLit ? pal.lit : pal.unlit;
  const compId = `tinker-led-${color}-${isLit ? 'on' : 'off'}`;

  // Authentic 5mm T-1 3/4 Tinkercad silhouette (Centered at x = 0, cylinder from -9 to +9)
  // Left: Flat index notch at x = -11
  // Right: Rounded flange collar at x = 11
  const bulbPath = "M -11 8 L -11 4 L -9 4 L -9 -8 C -9 -16, -4 -22, 0 -22 C 4 -22, 9 -16, 9 -8 L 9 4 L 11 4 L 11 8 Z";

  // Cathode Lead Path: 100% STRAIGHT vertical drop exiting base at x = -6 down to pin_cathode (-6, 28)
  const cathodeLeadPath = "M -6 7 L -6 28";

  // Anode Lead Path: Exits base symmetrically at x = 6, classic Tinkercad bent knee (jog to x = 8.5), centered down to pin_anode (6, 28)
  const anodeLeadPath = "M 6 7 L 6 12 C 6 14, 8.5 14.5, 8.5 16.5 C 8.5 18.5, 6 19, 6 21 L 6 28";

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))' }}
    >
      <defs>
        {/* Tinkercad 3D Glossy Epoxy Bulb Gradient (Smooth Top-Left Directional Lighting) */}
        <radialGradient id={`led-bulb-${compId}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor={isBurnedOut ? '#4B5563' : shades.c1} />
          <stop offset="25%" stopColor={isBurnedOut ? '#374151' : shades.c2} />
          <stop offset="60%" stopColor={isBurnedOut ? '#1F2937' : shades.c3} />
          <stop offset="88%" stopColor={isBurnedOut ? '#111827' : shades.c4} />
          <stop offset="100%" stopColor={isBurnedOut ? '#030712' : shades.c5} />
        </radialGradient>

        {/* Radial Ambient Glow Aura (When Lit) */}
        <radialGradient id={`led-halo-${compId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={pal.glow} stopOpacity="0.65" />
          <stop offset="40%" stopColor={pal.glow} stopOpacity="0.35" />
          <stop offset="75%" stopColor={pal.glow} stopOpacity="0.1" />
          <stop offset="100%" stopColor={pal.glow} stopOpacity="0" />
        </radialGradient>

        {/* Forward Projected Light Cone */}
        <linearGradient id={`led-beam-${compId}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={shades.c2} stopOpacity="0.3" />
          <stop offset="100%" stopColor={shades.c2} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Terminal Lead Wires (Symmetrically Centered under Bulb at Ã‚Â±6, Cathode Straight, Anode Bent Knee) */}
      {/* Lead Ambient Drop Shadows */}
      <path d={cathodeLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={anodeLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Outer Metallic Lead Wire Edge (Dark Chrome / Shadow) */}
      <path d={cathodeLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={anodeLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Polished Silver Wire Body */}
      <path d={cathodeLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
      <path d={anodeLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />

      {/* Longitudinal Specular Centerline Highlight (Crisp Metallic Sheen) */}
      <path d={cathodeLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={anodeLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

      {/* Interactive Solder Terminals Symmetrically Centered at exact pin offsets (-6, 28) and (6, 28) */}
      {/* Cathode Terminal (pin_cathode: -6, 28) */}
      <circle
        cx="-6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_cathode', -6, 28); }}
      />
      <circle cx="-6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-6.8" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Anode Terminal (pin_anode: 6, 28) */}
      <circle
        cx="6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_anode', 6, 28); }}
      />
      <circle cx="6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="5.2" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* 2. Soft Ambient Radiance Glow (When Illuminated) */}
      {isLit && !isBurnedOut && (
        <g pointerEvents="none">
          <circle cx="0" cy="-8" r="32" fill={`url(#led-halo-${compId})`} />
          <polygon points="-4,-21 -12,-40 12,-40 4,-21" fill={`url(#led-beam-${compId})`} />
        </g>
      )}

      {/* 3. Base Bulb Drop Shadow */}
      <ellipse cx="0" cy="7.5" rx="12" ry="3.5" fill="rgba(0,0,0,0.22)" pointerEvents="none" />

      {/* 4. Glossy 3D Solid Epoxy Bulb Body */}
      <path
        d={bulbPath}
        fill={`url(#led-bulb-${compId})`}
        stroke={isBurnedOut ? '#111827' : pal.stroke}
        strokeWidth="0.8"
      />

      {/* 5. Flange Collar 3D Bevel Crease */}
      <path
        d="M -9 4 C -9 5.5, 9 5.5, 9 4"
        fill="none"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="0.8"
        pointerEvents="none"
      />
      <path
        d="M -8.5 4.5 C -8.5 5.8, 8.5 5.8, 8.5 4.5"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.6"
        pointerEvents="none"
      />

      {/* 6. Signature Tinkercad 3D Specular Gloss Highlights */}
      {/* Primary Curved Reflection Arc on Upper-Left Dome Shoulder */}
      <path
        d="M -5 -4 C -5 -12, -2 -18, 0 -18"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={isLit ? 0.9 : 0.65}
        pointerEvents="none"
      />

      {/* Secondary Soft Rim Bounce Reflection on Right Edge */}
      <path
        d="M 7 -4 C 7 -10, 5 -15, 3 -17"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.22"
        pointerEvents="none"
      />

      {/* Flat Cathode Facet Specular Glint */}
      <line
        x1="-11"
        y1="4.5"
        x2="-11"
        y2="7.5"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.5"
        pointerEvents="none"
      />

      {/* 7. Tinkercad-Style Overcurrent Burned Out Burst Indicator */}
      {isBurnedOut && (
        <g pointerEvents="none" transform="translate(0, -8)">
          {/* Cartoon Explosion Starburst Badge */}
          <polygon
            points="0,-12 3.5,-7 9.5,-9 7,-3.5 12,0 7,3.5 9.5,9 3.5,7 0,12 -3.5,7 -9.5,9 -7,3.5 -12,0 -7,-3.5 -9.5,-9 -3.5,-7"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="0" r="7" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="0" y="3.2" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">!</text>
        </g>
      )}
    </g>
  );
});

// Web Audio API Synthesizer for Authentic Tactile Micro-Switch Click Feedback
const playTactileSwitchClick = (isPressing) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    if (isPressing) {
      // Crisp mechanical tactile snap down (click)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.022);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } else {
      // Soft mechanical tactile release pop (clack)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.016);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.018);
    }
  } catch {
    // AudioContext blocked or unavailable, ignore gracefully
  }
};

// 3. Tactile Micro Pushbutton (Original Clean Minimal Metal Frame & Concentric Plunger)
export const TinkerPushbutton = memo(({
  x = 0,
  y = 0,
  isPressed = false,
  rotation = 0,
  isSelected = false,
  onPressToggle,
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.28))' }}
    >
      <defs>
        {/* Brushed Stainless Steel Frame Gradient */}
        <linearGradient id="tactile-frame-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E0" />
          <stop offset="30%" stopColor="#F8FAFC" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Unpressed Raised Plunger Gradient */}
        <radialGradient id="tactile-plunger-raised" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="45%" stopColor="#334155" />
          <stop offset="85%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>

        {/* Pressed Deep Sunken Plunger Gradient */}
        <radialGradient id="tactile-plunger-pressed" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="70%" stopColor="#0B0F19" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>

      {/* 4 Through-Hole Solder Pin Terminals (Exact offsets: Ã‚Â±16, Ã‚Â±14) */}
      {/* 1a (Top-Left) */}
      <circle cx="-16" cy="-14" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_1a', -16, -14); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="-16" cy="-14" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* 1b (Top-Right) */}
      <circle cx="16" cy="-14" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_1b', 16, -14); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="16" cy="-14" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* 2a (Bottom-Left) */}
      <circle cx="-16" cy="14" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_2a', -16, 14); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="-16" cy="14" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* 2b (Bottom-Right) */}
      <circle cx="16" cy="14" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_2b', 16, 14); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="16" cy="14" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* Dark Phenolic Substrate Base */}
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3.5" fill="#0F172A" />

      {/* Stamped Stainless Steel Frame Bracket */}
      <rect
        x="-13"
        y="-13"
        width="26"
        height="26"
        rx="3"
        fill="url(#tactile-frame-metal)"
        stroke="#475569"
        strokeWidth="1"
      />

      {/* 4 Corner Swage Dimples / Rivets */}
      <circle cx="-10.5" cy="-10.5" r="1.3" fill="#475569" />
      <circle cx="10.5" cy="-10.5" r="1.3" fill="#475569" />
      <circle cx="-10.5" cy="10.5" r="1.3" fill="#475569" />
      <circle cx="10.5" cy="10.5" r="1.3" fill="#475569" />

      {/* Beveled Retaining Collar Ring */}
      <circle cx="0" cy="0" r="10" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="9.2" fill={isPressed ? '#000000' : '#1E293B'} />

      {/* When Pressed: Deep Recessed Cavity Perimeter Shadow */}
      {isPressed && (
        <circle cx="0" cy="0" r="8.8" fill="none" stroke="#000000" strokeWidth="2.2" opacity="0.9" />
      )}

      {/* Interactive Plunger Button with Concentric Tactile Ridges & Clear Physical Press Depth */}
      <g
        className="cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          playTactileSwitchClick(!isPressed);
          onPressToggle && onPressToggle();
        }}
      >
        {isPressed ? (
          /* PRESSED STATE: Sunk deep into socket, dark depressed well with crisp contact indicator */
          <g transform="scale(0.82)" style={{ transformOrigin: '0 0', transition: 'transform 0.08s ease' }}>
            {/* Sunken Plunger Body */}
            <circle cx="0" cy="0" r="8.2" fill="url(#tactile-plunger-pressed)" stroke="#000000" strokeWidth="1.2" />
            {/* Inner Depressed Ring */}
            <circle cx="0" cy="0" r="5" fill="none" stroke="#334155" strokeWidth="0.8" opacity="0.8" pointerEvents="none" />
            {/* Center Polished Silver Mechanical Dome Contact Pip (Clearly confirms closed circuit) */}
            <circle cx="0" cy="0" r="2.2" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.6" pointerEvents="none" />
            <circle cx="-0.6" cy="-0.6" r="0.6" fill="#FFFFFF" opacity="0.9" pointerEvents="none" />
          </g>
        ) : (
          /* UNPRESSED STATE: Proud, raised tactile button casting soft shadow */
          <g style={{ transformOrigin: '0 0', transition: 'transform 0.08s ease' }}>
            {/* Soft Ambient Plunger Drop Shadow */}
            <ellipse cx="0" cy="1" rx="8.2" ry="8" fill="rgba(0,0,0,0.35)" />
            {/* Raised Plunger Body */}
            <circle cx="0" cy="0" r="8.2" fill="url(#tactile-plunger-raised)" stroke="#334155" strokeWidth="1" />
            {/* Concentric Tactile Grip Ring */}
            <circle cx="0" cy="0" r="5" fill="none" stroke="#64748B" strokeWidth="0.8" opacity="0.65" pointerEvents="none" />
            {/* Center Dimple */}
            <circle cx="0" cy="0" r="1.8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" pointerEvents="none" />
            {/* Crisp Specular Light Glint */}
            <circle cx="-2" cy="-2.5" r="1.5" fill="#FFFFFF" opacity="0.35" pointerEvents="none" />
          </g>
        )}
      </g>
    </g>
  );
});

// 4. Heavy-Duty SPDT Slide Switch (Serrated Metallic Knob & Steel Enclosure)
export const TinkerSlideSwitch = memo(({
  x = 0,
  y = 0,
  position = 'left',
  rotation = 0,
  isSelected = false,
  onToggle,
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))' }}
    >
      <defs>
        <linearGradient id="switch-body-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="switch-knob-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* 3 Bottom Terminals (3D Metallic Lead Style Matching LED) */}
      {/* Lead Ambient Drop Shadows */}
      <line x1="-16" y1="8" x2="-16" y2="18" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="0" y1="8" x2="0" y2="18" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />

      {/* Outer Metallic Lead Wire Edge */}
      <line x1="-16" y1="8" x2="-16" y2="18" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="0" y1="8" x2="0" y2="18" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

      {/* Polished Silver Core */}
      <line x1="-16" y1="8" x2="-16" y2="18" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <line x1="0" y1="8" x2="0" y2="18" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />

      {/* Specular Glint Centerline */}
      <line x1="-16" y1="8" x2="-16" y2="18" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
      <line x1="0" y1="8" x2="0" y2="18" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

      {/* Pin 1 (Left) */}
      <circle cx="-16" cy="18" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_1', -16, 18); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="-16" cy="18" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* Pin 2 (Common Middle) */}
      <circle cx="0" cy="18" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_2', 0, 18); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="0" cy="18" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* Pin 3 (Right) */}
      <circle cx="16" cy="18" r="3.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="1.2"
        onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_3', 16, 18); }}
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors" />
      <circle cx="16" cy="18" r="1.5" fill="#64748B" pointerEvents="none" />

      {/* Phenolic Bottom Plate */}
      <rect x="-26" y="-8.5" width="52" height="17" rx="3.5" fill="#1E293B" />

      {/* Stamped Metal Switch Shield */}
      <rect x="-25" y="-8" width="50" height="16" rx="3" fill="url(#switch-body-metal)" stroke="#334155" strokeWidth="1" />
      {/* Mounting ear holes */}
      <circle cx="-21" cy="0" r="1.5" fill="#334155" />
      <circle cx="21" cy="0" r="1.5" fill="#334155" />

      {/* Black Sliding Trough Channel */}
      <rect x="-17" y="-5" width="34" height="10" rx="2" fill="#0F172A" />

      {/* Tactile Ribbed Actuator Knob (Smooth Slide Transition) */}
      <g
        transform={`translate(${position === 'left' ? -15 : 3}, -12)`}
        className="cursor-pointer transition-transform duration-200"
        onClick={e => {
          e.stopPropagation();
          onToggle && onToggle();
        }}
      >
        <rect x="0" y="0" width="12" height="12" rx="2" fill="url(#switch-knob-metal)" stroke="#1E293B" strokeWidth="1" />
        {/* Grip Serrations */}
        <line x1="3" y1="2" x2="3" y2="10" stroke="#334155" strokeWidth="1" />
        <line x1="6" y1="2" x2="6" y2="10" stroke="#334155" strokeWidth="1" />
        <line x1="9" y1="2" x2="9" y2="10" stroke="#334155" strokeWidth="1" />
      </g>
    </g>
  );
});

// 5. Industrial 9V Battery (Minimal Modern Aesthetic)
export const Tinker9VBattery = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : undefined }}
    >
      <defs>
        {/* Obsidian Canister Body (Matte Cylindrical Shader) */}
        <linearGradient id="bat9v-obsidian" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0E0F12" />
          <stop offset="8%" stopColor="#181920" />
          <stop offset="28%" stopColor="#262833" />
          <stop offset="50%" stopColor="#363948" />
          <stop offset="72%" stopColor="#262833" />
          <stop offset="92%" stopColor="#181920" />
          <stop offset="100%" stopColor="#0C0D10" />
        </linearGradient>

        {/* Brushed Copper / Amber Gold Collar */}
        <linearGradient id="bat9v-copper" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C2D12" />
          <stop offset="15%" stopColor="#9A3412" />
          <stop offset="35%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="65%" stopColor="#D97706" />
          <stop offset="85%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>

        {/* Machined Nickel Metal */}
        <linearGradient id="bat9v-nickel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="25%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Radial Nickel Cap */}
        <radialGradient id="bat9v-nickel-rad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F1F5F9" />
          <stop offset="65%" stopColor="#CBD5E1" />
          <stop offset="90%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>

        {/* Rolled Metal Crimp */}
        <linearGradient id="bat9v-crimp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="25%" stopColor="#64748B" />
          <stop offset="48%" stopColor="#E2E8F0" />
          <stop offset="52%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Recessed Top Phenolic Plate */}
        <linearGradient id="bat9v-phenolic" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D2D35" />
          <stop offset="50%" stopColor="#1C1C22" />
          <stop offset="100%" stopColor="#121216" />
        </linearGradient>

        {/* Canister Clip */}
        <clipPath id="bat9v-canister-clip">
          <rect x="-35" y="-52" width="70" height="106" rx="6" />
        </clipPath>
      </defs>

      {/* 1. MAIN CANISTER HOUSING */}
      <rect x="-35" y="-52" width="70" height="106" rx="6" fill="url(#bat9v-obsidian)" stroke="#0E0F12" strokeWidth="1.2" />

      {/* 2. CLIPPED OVERLAYS */}
      <g clipPath="url(#bat9v-canister-clip)" pointerEvents="none">
        {/* Top Metal Crimp Lip */}
        <rect x="-35" y="-52" width="70" height="4.5" fill="url(#bat9v-crimp)" stroke="#1E293B" strokeWidth="0.5" />
        <line x1="-35" y1="-47.5" x2="35" y2="-47.5" stroke="#0F172A" strokeWidth="0.8" />

        {/* Brushed Copper Collar */}
        <rect x="-35" y="-47.5" width="70" height="25.5" fill="url(#bat9v-copper)" />

        {/* Gold Hairline Divider */}
        <line x1="-35" y1="-22" x2="35" y2="-22" stroke="#09090B" strokeWidth="1.4" />
        <line x1="-35" y1="-21.2" x2="35" y2="-21.2" stroke="#FEF08A" strokeWidth="0.6" opacity="0.9" />

        {/* Bottom Rolled Metal Crimp */}
        <rect x="-35" y="48" width="70" height="6" fill="url(#bat9v-crimp)" stroke="#1E293B" strokeWidth="0.5" />
        <line x1="-35" y1="48" x2="35" y2="48" stroke="#0F172A" strokeWidth="0.8" />
        <line x1="-35" y1="48.8" x2="35" y2="48.8" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Inner Edge Bevel */}
      <rect x="-34" y="-51" width="68" height="104" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.12" pointerEvents="none" />

      {/* 3. RECESSED PHENOLIC TOP PLATE HEADER */}
      <rect x="-31" y="-56" width="62" height="7" rx="2" fill="url(#bat9v-phenolic)" stroke="#1E293B" strokeWidth="0.6" />
      <circle cx="-27" cy="-52.5" r="0.8" fill="#09090B" stroke="#3F3F46" strokeWidth="0.3" />
      <circle cx="27" cy="-52.5" r="0.8" fill="#09090B" stroke="#3F3F46" strokeWidth="0.3" />

      {/* 4. CLEAN MINIMALIST BODY GRAPHICS */}
      <text
        x="0"
        y="6"
        fill="#FFFFFF"
        fontSize="28"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="-0.5"
        pointerEvents="none"
      >9V</text>

      <rect x="-14" y="14" width="28" height="1.4" rx="0.7" fill="#F59E0B" opacity="0.9" pointerEvents="none" />

      <text
        x="0"
        y="26"
        fill="#CBD5E1"
        fontSize="4.2"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, 'SF Pro Text', sans-serif"
        textAnchor="middle"
        letterSpacing="2.2"
        pointerEvents="none"
      >ALKALINE</text>

      <text
        x="0"
        y="36"
        fill="#64748B"
        fontSize="3.4"
        fontWeight="700"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        textAnchor="middle"
        letterSpacing="1.2"
        pointerEvents="none"
      >6LR61 Ã¢â‚¬Â¢ 9V DC</text>

      {/* 6. POSITIVE (+) SOLID NICKEL MALE SNAP STUD TERMINAL (Left: -16, -59.5) */}
      <g>
        <ellipse cx="-16" cy="-54.5" rx="5.8" ry="2.0" fill="url(#bat9v-crimp)" stroke="#334155" strokeWidth="0.5" pointerEvents="none" />
        <path
          d="M -19.8 -54.5
             L -19.8 -59
             C -19.8 -60.4, -18.1 -61.5, -16 -61.5
             C -13.9 -61.5, -12.2 -60.4, -12.2 -59
             L -12.2 -54.5
             C -12.2 -53.1, -13.9 -52.0, -16 -52.0
             C -18.1 -52.0, -19.8 -53.1, -19.8 -54.5 Z"
          fill="url(#bat9v-nickel)"
          stroke="#334155"
          strokeWidth="0.6"
          pointerEvents="none"
        />
        <ellipse cx="-16" cy="-58" rx="4.5" ry="1.5" fill="#64748B" stroke="#475569" strokeWidth="0.4" pointerEvents="none" />
        <ellipse cx="-16" cy="-59.5" rx="4.0" ry="1.4" fill="url(#bat9v-nickel-rad)" stroke="#64748B" strokeWidth="0.5" pointerEvents="none" />
        <ellipse cx="-16" cy="-59.5" rx="3.0" ry="1.0" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
        <ellipse cx="-16" cy="-59.5" rx="0.9" ry="0.3" fill="#475569" pointerEvents="none" />

        {/* Interactive Solder Eyelet & Wire Contact Area */}
        <circle
          cx="-16"
          cy="-59.5"
          r="6.5"
          fill="transparent"
          stroke="#347F7A"
          strokeWidth="1.5"
          className="cursor-crosshair opacity-0 hover:opacity-100 hover:fill-teal-500/20 transition-all"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_pos', -16, -59.5); }}
        />
      </g>

      {/* 7. NEGATIVE (-) OCTAGONAL FEMALE CROWN SPRING SOCKET TERMINAL (Right: 16, -59.5) */}
      <g>
        <ellipse cx="16" cy="-54.5" rx="9.5" ry="2.8" fill="url(#bat9v-crimp)" stroke="#334155" strokeWidth="0.5" pointerEvents="none" />
        <path
          d="M 8.5 -54.5
             L 8.5 -59
             C 8.5 -60.8, 11.8 -62.0, 16 -62.0
             C 20.2 -62.0, 23.5 -60.8, 23.5 -59
             L 23.5 -54.5
             C 23.5 -52.7, 20.2 -51.5, 16 -51.5
             C 11.8 -51.5, 8.5 -52.7, 8.5 -54.5 Z"
          fill="url(#bat9v-nickel)"
          stroke="#334155"
          strokeWidth="0.6"
          pointerEvents="none"
        />
        <polygon
          points="
            11.8,-61.2
            14.0,-62.2
            18.0,-62.2
            20.2,-61.2
            21.2,-59.5
            20.2,-57.8
            18.0,-56.8
            14.0,-56.8
            11.8,-57.8
            10.8,-59.5
          "
          fill="url(#bat9v-nickel-rad)"
          stroke="#475569"
          strokeWidth="0.5"
          pointerEvents="none"
        />
        <polygon
          points="
            12.8,-60.5
            14.4,-61.3
            17.6,-61.3
            19.2,-60.5
            20.0,-59.5
            19.2,-58.5
            17.6,-57.7
            14.4,-57.7
            12.8,-58.5
            12.0,-59.5
          "
          fill="#09090C"
          stroke="#1E293B"
          strokeWidth="0.4"
          pointerEvents="none"
        />
        <g stroke="#CBD5E1" strokeWidth="0.8" fill="none" strokeLinecap="round" pointerEvents="none">
          <path d="M 14.5 -61.0 L 16.0 -60.0 L 17.5 -61.0" />
          <path d="M 14.5 -58.0 L 16.0 -59.0 L 17.5 -58.0" />
          <line x1="13.0" y1="-60.0" x2="14.5" y2="-59.5" />
          <line x1="19.0" y1="-59.0" x2="17.5" y2="-59.5" />
          <line x1="13.0" y1="-59.0" x2="14.5" y2="-59.5" />
          <line x1="19.0" y1="-60.0" x2="17.5" y2="-59.5" />
        </g>
        <circle cx="16" cy="-59.5" r="0.8" fill="#FBBF24" opacity="0.9" pointerEvents="none" />

        {/* Interactive Solder Eyelet & Wire Contact Area */}
        <circle
          cx="16"
          cy="-59.5"
          r="6.5"
          fill="transparent"
          stroke="#347F7A"
          strokeWidth="1.5"
          className="cursor-crosshair opacity-0 hover:opacity-100 hover:fill-teal-500/20 transition-all"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_neg', 16, -59.5); }}
        />
      </g>
    </g>
  );
});

// 6. Professional CR2032 Coin Cell Battery in Molded PCB Socket Holder
export const TinkerCoinCell = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : undefined }}
    >
      <defs>
        {/* Molded Matte Nylon Plastic Housing Gradient */}
        <linearGradient id="holder-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#242427" />
          <stop offset="50%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>

        {/* Plastic Outer Bevel / Chamfer Gradient */}
        <linearGradient id="holder-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="40%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>

        {/* Coin Cell Anisotropic Radial Metal Finish */}
        <radialGradient id="holder-coin-metal" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#F1F5F9" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="92%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </radialGradient>

        {/* 24K Gold Leaf Spring Retention Contact Clip */}
        <linearGradient id="holder-gold-clip" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="20%" stopColor="#D97706" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#FEF08A" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Internal Negative Contact Spring Plate (Visible through notch) */}
        <radialGradient id="holder-internal-contact" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </radialGradient>

        {/* Horizontal Solder Lead Pin Gradient */}
        <linearGradient id="holder-lead-metal-h" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="25%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* 1. LEFT NEGATIVE (-) TERMINAL PIN (-34, 18.5) - In-line with Bottom-Left (-) Symbol */}
      <g>
        <rect x="-34" y="16.3" width="10" height="4.4" rx="1.2" fill="url(#holder-lead-metal-h)" stroke="#475569" strokeWidth="0.5" />
        <line x1="-34" y1="17.5" x2="-25" y2="17.5" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.9" />

        {/* Interactive Negative Solder Eyelet (pin_neg: -34, 18.5) */}
        <circle cx="-34" cy="18.5" r="4.6" fill="rgba(0,0,0,0.2)" pointerEvents="none" />
        <circle
          cx="-34"
          cy="18.5"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_neg', -34, 18.5); }}
        />
        <circle cx="-34" cy="18.5" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="-34.8" cy="17.7" r="0.6" fill="#FFFFFF" opacity="0.8" pointerEvents="none" />
      </g>

      {/* 2. RIGHT POSITIVE (+) TERMINAL PIN (34, -18.5) - In-line with Top-Right (+) Symbol */}
      <g>
        <rect x="24" y="-20.7" width="10" height="4.4" rx="1.2" fill="url(#holder-lead-metal-h)" stroke="#475569" strokeWidth="0.5" />
        <line x1="25" y1="-19.5" x2="34" y2="-19.5" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.9" />

        {/* Interactive Positive Solder Eyelet (pin_pos: 34, -18.5) */}
        <circle cx="34" cy="-18.5" r="4.6" fill="rgba(0,0,0,0.2)" pointerEvents="none" />
        <circle
          cx="34"
          cy="-18.5"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_pos', 34, -18.5); }}
        />
        <circle cx="34" cy="-18.5" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="33.2" cy="-19.3" r="0.6" fill="#FFFFFF" opacity="0.8" pointerEvents="none" />
      </g>

      {/* 3. MOLDED NYLON SOCKET HOUSING BODY */}
      {/* Outer Beveled Chassis with molded Exit Bosses aligned with pins */}
      <path
        d="M -24 -26
           L 24 -26
           C 27 -26, 28 -24, 28 -22.5
           L 29.5 -21
           L 29.5 -16
           L 28 -14.5
           L 28 21
           C 28 24, 27 26, 24 26
           L -24 26
           C -27 26, -28 24, -28 22.5
           L -29.5 21
           L -29.5 16
           L -28 14.5
           L -28 -21
           C -28 -24, -27 -26, -24 -26 Z"
        fill="url(#holder-bevel)"
        stroke="#111113"
        strokeWidth="0.9"
      />

      {/* Recessed Matte Body Face */}
      <rect x="-26.5" y="-24.5" width="53" height="49" rx="5" fill="url(#holder-body)" stroke="#27272A" strokeWidth="0.6" />

      {/* Top Edge Specular Rim Highlight */}
      <line x1="-23" y1="-23.5" x2="23" y2="-23.5" stroke="#52525B" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />

      {/* CORNER POLARITY SYMBOLS & RIVETS */}
      {/* Top-Left Corner Rivet (-20, -18.5) */}
      <circle cx="-20" cy="-18.5" r="1.5" fill="#18181B" stroke="#3F3F46" strokeWidth="0.5" opacity="0.6" />

      {/* Right Positive (+) Symbol in Top-Right Corner (20, -18.5) */}
      <g transform="translate(20, -18.5)">
        <circle cx="0" cy="0" r="3.8" fill="#18181B" stroke="#EF4444" strokeWidth="0.9" />
        <line x1="-1.8" y1="0" x2="1.8" y2="0" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="-1.8" x2="0" y2="1.8" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Left Negative (-) Symbol in Bottom-Left Corner (-20, 18.5) */}
      <g transform="translate(-20, 18.5)">
        <circle cx="0" cy="0" r="3.8" fill="#18181B" stroke="#3B82F6" strokeWidth="0.9" />
        <line x1="-1.8" y1="0" x2="1.8" y2="0" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Bottom-Right Corner Rivet (20, 18.5) */}
      <circle cx="20" cy="18.5" r="1.5" fill="#18181B" stroke="#3F3F46" strokeWidth="0.5" opacity="0.6" />

      {/* Molded Grip Texture on Top & Bottom */}
      <g opacity="0.25" stroke="#71717A" strokeWidth="0.6">
        <line x1="-8" y1="-24.5" x2="8" y2="-24.5" />
        <line x1="-8" y1="24.5" x2="8" y2="24.5" />
      </g>

      {/* 4. RECESSED CIRCULAR BATTERY WELL */}
      <circle cx="0" cy="0" r="20.5" fill="#09090B" stroke="#27272A" strokeWidth="0.8" />
      {/* Finger Ejection Notch at Bottom Center */}
      <path d="M -7 19.5 C -7 24.5, 7 24.5, 7 19.5 Z" fill="#09090B" stroke="#27272A" strokeWidth="0.5" />
      {/* Internal Gold Contact Spring Peeking Through Notch */}
      <ellipse cx="0" cy="21.5" rx="3.8" ry="1.8" fill="url(#holder-internal-contact)" stroke="#78350F" strokeWidth="0.3" />
      {/* Inner Recessed Cavity Wall */}
      <circle cx="0" cy="0" r="20.2" fill="#18181B" />

      {/* 5. CR2032 COIN CELL BATTERY (SEATED INSIDE WELL) */}
      <circle cx="0" cy="0" r="19.2" fill="#991B1B" opacity="0.35" />
      <circle cx="0" cy="0" r="19.0" fill="#475569" stroke="#334155" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="18.5" fill="url(#holder-coin-metal)" stroke="#64748B" strokeWidth="0.5" />

      {/* Lathe Machined Concentric Luster Rings on Coin Face */}
      <circle cx="0" cy="0" r="16.5" fill="none" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />
      <circle cx="0" cy="0" r="14.8" fill="none" stroke="#94A3B8" strokeWidth="0.3" opacity="0.35" />
      <circle cx="0" cy="0" r="12.0" fill="none" stroke="#FFFFFF" strokeWidth="0.25" opacity="0.4" />
      <circle cx="0" cy="0" r="9.0" fill="none" stroke="#CBD5E1" strokeWidth="0.2" opacity="0.3" />

      {/* Anisotropic Specular Light Reflex Sheen Wedges */}
      <path d="M 0 0 L -14 -12 A 18.5 18.5 0 0 1 -7 -17 Z" fill="#FFFFFF" opacity="0.2" />
      <path d="M 0 0 L 14 12 A 18.5 18.5 0 0 1 7 17 Z" fill="#FFFFFF" opacity="0.2" />
      <path d="M -13 -10 C -7 -15, 7 -15, 13 -10 C 7 -13.5, -7 -13.5, -13 -10 Z" fill="#FFFFFF" opacity="0.4" />

      {/* Laser Etchings on Battery Face */}
      <text
        x="0"
        y="-8.5"
        fill="#0F172A"
        fontSize="4.2"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
      >+</text>
      <text
        x="0"
        y="-3.5"
        fill="#1E293B"
        fontSize="5.4"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="0.8"
      >CR2032</text>
      <text
        x="0"
        y="-3.2"
        fill="#FFFFFF"
        fontSize="5.4"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="0.8"
        opacity="0.35"
      >CR2032</text>
      <text
        x="0"
        y="2.2"
        fill="#334155"
        fontSize="3.2"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="0.7"
      >3V LITHIUM</text>
      <text
        x="0"
        y="6.0"
        fill="#64748B"
        fontSize="2.0"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="0.5"
      >CELL</text>

      {/* 6. TOP & BOTTOM RETENTION SNAP CLIPS */}
      <path d="M -4 -20.2 C -4 -18.5, 4 -18.5, 4 -20.2 Z" fill="#27272A" stroke="#3F3F46" strokeWidth="0.4" />
      <path d="M -4 20.2 C -4 18.5, 4 18.5, 4 20.2 Z" fill="#27272A" stroke="#3F3F46" strokeWidth="0.4" />

      {/* 7. 24K GOLD LEAF SPRING RETENTION CONTACT CLIP (Top Spring) */}
      <path
        d="M -10 -18 L 0 -22 L 10 -18 L 8.5 -13 L 0 -16 L -8.5 -13 Z"
        fill="url(#holder-gold-clip)"
        stroke="#78350F"
        strokeWidth="0.5"
      />
      <line x1="-7.5" y1="-14" x2="0" y2="-17" stroke="#FEF08A" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="0" y1="-17" x2="7.5" y2="-14" stroke="#FEF08A" strokeWidth="0.6" strokeLinecap="round" />
      <circle cx="0" cy="-16" r="1.0" fill="#451A03" />
      <circle cx="0" cy="-16" r="0.4" fill="#FEF08A" />
    </g>
  );
});

// 7. Modern Rechargeable 1.5V AA Battery (Eco Green & White Aesthetic)
export const TinkerAABattery = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : 'drop-shadow(0 8px 18px rgba(0,0,0,0.22))' }}
    >
      <defs>
        {/* Vibrant Emerald / Lime Green Cylindrical Collar */}
        <linearGradient id="aa-green" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14532D" />
          <stop offset="12%" stopColor="#15803D" />
          <stop offset="35%" stopColor="#16A34A" />
          <stop offset="48%" stopColor="#4ADE80" />
          <stop offset="65%" stopColor="#16A34A" />
          <stop offset="85%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#0F3F22" />
        </linearGradient>

        {/* Satin Pure White Cylindrical Body */}
        <linearGradient id="aa-white-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="14%" stopColor="#E2E8F0" />
          <stop offset="35%" stopColor="#F8FAFC" />
          <stop offset="48%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F8FAFC" />
          <stop offset="85%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Machined Nickel Steel Nub & Base */}
        <linearGradient id="aa-nickel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="25%" stopColor="#94A3B8" />
          <stop offset="48%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Radial Nickel Cap Gleam */}
        <radialGradient id="aa-nickel-rad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#F1F5F9" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>

        {/* Rolled Metal Crimp Rim */}
        <linearGradient id="aa-crimp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="25%" stopColor="#94A3B8" />
          <stop offset="48%" stopColor="#FFFFFF" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Canister Clip */}
        <clipPath id="aa-canister-clip">
          <rect x="-19" y="-48" width="38" height="96" rx="6" />
        </clipPath>
      </defs>

      {/* 1. MAIN CYLINDRICAL CANISTER BODY (Pure White Satin) */}
      <rect x="-19" y="-48" width="38" height="96" rx="6" fill="url(#aa-white-body)" stroke="#94A3B8" strokeWidth="1" />

      {/* 2. CLIPPED OVERLAYS */}
      <g clipPath="url(#aa-canister-clip)" pointerEvents="none">
        {/* Top Vibrant Green Collar (Top ~35%) */}
        <rect x="-19" y="-48" width="38" height="34" fill="url(#aa-green)" />

        {/* Clean Seam Divider Line */}
        <line x1="-19" y1="-14" x2="19" y2="-14" stroke="#0F3F22" strokeWidth="0.8" opacity="0.6" />
        <line x1="-19" y1="-13.4" x2="19" y2="-13.4" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />

        {/* Bottom Rolled Metal Crimp Rim */}
        <rect x="-19" y="44" width="38" height="4" fill="url(#aa-crimp)" stroke="#64748B" strokeWidth="0.5" />
        <line x1="-19" y1="44" x2="19" y2="44" stroke="#475569" strokeWidth="0.6" />
        <line x1="-19" y1="44.6" x2="19" y2="44.6" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />
      </g>

      {/* Subtle Inner Highlight Bevel */}
      <rect x="-18" y="-47" width="36" height="94" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" pointerEvents="none" />

      {/* 3. PURE MINIMALIST TYPOGRAPHY */}
      <text
        x="0"
        y="10"
        fill="#0F172A"
        fontSize="14.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="-0.3"
        pointerEvents="none"
      >1.5 V</text>

      <text
        x="0"
        y="27"
        fill="#16A34A"
        fontSize="11.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        textAnchor="middle"
        letterSpacing="1.5"
        pointerEvents="none"
      >AA</text>

      {/* 4. POSITIVE (+) CLEAN MACHINED STEEL BUTTON NUB & WHITE INSULATOR (Top: 0, -56) */}
      <g>
        {/* Crisp White Insulator Plate Collar (from reference photo) */}
        <rect x="-11" y="-50.5" width="22" height="3" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.6" pointerEvents="none" />
        
        {/* Polished Machined Steel Button Nub */}
        <rect x="-6" y="-55.5" width="12" height="5.5" rx="1.5" fill="url(#aa-nickel)" stroke="#475569" strokeWidth="0.6" pointerEvents="none" />
        <line x1="-5" y1="-54.5" x2="5" y2="-54.5" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" pointerEvents="none" />
        <circle cx="-2" cy="-52.5" r="1.2" fill="#FFFFFF" opacity="0.6" pointerEvents="none" />

        {/* Interactive Solder Eyelet & Wire Contact Area */}
        <circle
          cx="0"
          cy="-56"
          r="7.5"
          fill="transparent"
          stroke="#347F7A"
          strokeWidth="1.5"
          className="cursor-crosshair opacity-0 hover:opacity-100 hover:fill-teal-500/20 transition-all"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_pos', 0, -56); }}
        />
      </g>

      {/* 5. NEGATIVE (-) CLEAN RECESSED FLAT STEEL BASE (Bottom: 0, 50) */}
      <g>
        {/* Recessed Machined Nickel Base Plate */}
        <rect x="-13" y="45.5" width="26" height="4.5" rx="1.5" fill="url(#aa-nickel)" stroke="#475569" strokeWidth="0.6" pointerEvents="none" />
        <line x1="-11" y1="47" x2="11" y2="47" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6" pointerEvents="none" />

        {/* Interactive Solder Eyelet & Wire Contact Area */}
        <circle
          cx="0"
          cy="50"
          r="7.5"
          fill="transparent"
          stroke="#347F7A"
          strokeWidth="1.5"
          className="cursor-crosshair opacity-0 hover:opacity-100 hover:fill-teal-500/20 transition-all"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_neg', 0, 50); }}
        />
      </g>
    </g>
  );
});

// 8. Classic Rotary Potentiometer (WikiHow / Alpha RV09 Illustrated Style)
export const TinkerPotentiometer = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  value = 50,
  onChange,
  onPinClick,
  onMouseDown
}) => {
  const angle = -135 + (Math.max(0, Math.min(100, value ?? 50)) / 100) * 270;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : 'drop-shadow(0 8px 18px rgba(0,0,0,0.25))' }}
    >
      <defs>
        {/* Silver Metal Pin / Lead */}
        <linearGradient id="pot-pin-silver" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Golden Brass Cradle Shading */}
        <linearGradient id="pot-brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="30%" stopColor="#EAB308" />
          <stop offset="75%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>

        {/* Brown Phenolic / Bakelite Board */}
        <linearGradient id="pot-board-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="25%" stopColor="#9A3412" />
          <stop offset="70%" stopColor="#7C2D12" />
          <stop offset="100%" stopColor="#5B21B6" stopOpacity="0.1" />
        </linearGradient>

        {/* Silver Dome Casing */}
        <radialGradient id="pot-dome-silver" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F1F5F9" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>

        {/* Threaded Collar & Hex Nut */}
        <linearGradient id="pot-nut-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F1F5F9" />
          <stop offset="65%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Split Shaft Metallic Core */}
        <radialGradient id="pot-shaft-metal" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E2E8F0" />
          <stop offset="80%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </radialGradient>
        {/* Knob Cover Body Gradient */}
        <radialGradient id="knob-cover-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#1E293B" />
          <stop offset="85%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* Knob Cover Top Inlay */}
        <radialGradient id="knob-cover-top" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
      </defs>

      {/* 1. GOLDEN METAL CRADLE / RETAINING CUP (Bottom & Clamping tabs) */}
      {/* Lower cradle belly */}
      <path
        d="M -21 2 Q -16 20 0 21 Q 16 20 21 2 L 21 0 Q 15 16 0 17 Q -15 16 -21 0 Z"
        fill="url(#pot-brass-grad)"
        stroke="#A16207"
        strokeWidth="0.8"
      />
      {/* Golden clamp claw - Left */}
      <path
        d="M -21 4 L -21 13 Q -20 16 -18 16 L -16.5 16 Q -18 13 -18 7 Z"
        fill="url(#pot-brass-grad)"
        stroke="#A16207"
        strokeWidth="0.7"
      />
      {/* Golden clamp claw - Right */}
      <path
        d="M 21 4 L 21 13 Q 20 16 18 16 L 16.5 16 Q 18 13 18 7 Z"
        fill="url(#pot-brass-grad)"
        stroke="#A16207"
        strokeWidth="0.7"
      />

      {/* 2. BROWN PHENOLIC / BAKELITE TERMINAL BOARD */}
      <rect
        x="-19.5"
        y="5"
        width="39"
        height="13.5"
        rx="2"
        fill="url(#pot-board-grad)"
        stroke="#451A03"
        strokeWidth="0.9"
      />
      {/* Top highlight line on brown board */}
      <line x1="-18.5" y1="5.8" x2="18.5" y2="5.8" stroke="#FDBA74" strokeWidth="0.6" opacity="0.6" />

      {/* 3. THREE METAL EYELETS / RIVETS ON BOARD (at x = -16, 0, 16 and y = 11.5) */}
      {[-16, 0, 16].map(px => (
        <g key={`eyelet-${px}`}>
          {/* Outer rivet washer */}
          <circle cx={px} cy="11.5" r="3.4" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.7" />
          <circle cx={px} cy="11.5" r="2.4" fill="#E2E8F0" />
          {/* Center hollow rivet hole */}
          <circle cx={px} cy="11.5" r="1.5" fill="#475569" stroke="#1E293B" strokeWidth="0.5" />
          <circle cx={px - 0.5} cy="10.8" r="0.6" fill="#F8FAFC" opacity="0.8" />
        </g>
      ))}

      {/* 4. THREE FLAT SOLDER LUG PINS WITH T-SHOULDERS (-16, 0, 16 at y=30) */}
      {/* Pin 1 (Left / CCW) */}
      <g>
        {/* T-Shoulder crossbar */}
        <path d="M -19.5 18 L -12.5 18 L -12.5 20.2 L -14.6 20.2 L -14.6 30 L -17.4 30 L -17.4 20.2 L -19.5 20.2 Z"
          fill="url(#pot-pin-silver)" stroke="#64748B" strokeWidth="0.6" strokeLinejoin="round" />
        {/* Breadboard contact terminal pad */}
        <circle
          cx="-16"
          cy="30"
          r="3.8"
          fill="#F1F5F9"
          stroke="#64748B"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_1', -16, 30); }}
        />
        <circle cx="-16" cy="30" r="1.3" fill="#64748B" pointerEvents="none" />
      </g>

      {/* Pin Wiper (Center) */}
      <g>
        {/* T-Shoulder crossbar */}
        <path d="M -3.5 18 L 3.5 18 L 3.5 20.2 L 1.4 20.2 L 1.4 30 L -1.4 30 L -1.4 20.2 L -3.5 20.2 Z"
          fill="url(#pot-pin-silver)" stroke="#64748B" strokeWidth="0.6" strokeLinejoin="round" />
        {/* Breadboard contact terminal pad */}
        <circle
          cx="0"
          cy="30"
          r="3.8"
          fill="#F1F5F9"
          stroke="#64748B"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_wiper', 0, 30); }}
        />
        <circle cx="0" cy="30" r="1.3" fill="#64748B" pointerEvents="none" />
      </g>

      {/* Pin 3 (Right / CW) */}
      <g>
        {/* T-Shoulder crossbar */}
        <path d="M 12.5 18 L 19.5 18 L 19.5 20.2 L 17.4 20.2 L 17.4 30 L 14.6 30 L 14.6 20.2 L 12.5 20.2 Z"
          fill="url(#pot-pin-silver)" stroke="#64748B" strokeWidth="0.6" strokeLinejoin="round" />
        {/* Breadboard contact terminal pad */}
        <circle
          cx="16"
          cy="30"
          r="3.8"
          fill="#F1F5F9"
          stroke="#64748B"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => { e.stopPropagation(); onPinClick && onPinClick('pin_3', 16, 30); }}
        />
        <circle cx="16" cy="30" r="1.3" fill="#64748B" pointerEvents="none" />
      </g>

      {/* 5. SILVER DOME CASING & STEPPED COLLAR (Centered at 0, -6) */}
      <circle cx="0" cy="-6" r="21" fill="url(#pot-dome-silver)" stroke="#64748B" strokeWidth="1" />
      <circle cx="0" cy="-6" r="17" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
      <circle cx="0" cy="-6" r="14.5" fill="url(#pot-dome-silver)" stroke="#94A3B8" strokeWidth="0.6" />


      {/* 6. METALLIC HEX NUT (Centered at 0, -6) */}
      <polygon
        points="11.5,-6 5.75,3.96 -5.75,3.96 -11.5,-6 -5.75,-15.96 5.75,-15.96"
        fill="url(#pot-nut-silver)"
        stroke="#64748B"
        strokeWidth="0.9"
        pointerEvents="none"
      />
      {/* Hex nut inner thread bevel */}
      <circle cx="0" cy="-6" r="8.2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.7" pointerEvents="none" />
      <circle cx="0" cy="-6" r="7.4" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" pointerEvents="none" />

      {/* 7. ROTATING FLUTED CONTROL KNOB COVER (Rotates with angle) */}
      <g
        transform={`rotate(${angle}, 0, -6)`}
        className="cursor-pointer transition-transform duration-100 ease-out"
        onClick={e => {
          e.stopPropagation();
          const nextVal = ((Math.round((value ?? 50) / 10) * 10) + 10) % 110;
          onChange && onChange(nextVal);
        }}
        title={`Potentiometer: ${Math.round(value ?? 50)}% (Click to turn)`}
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' }}
      >
        {/* Outer Fluted Knob Skirt */}
        <circle cx="0" cy="-6" r="13.2" fill="url(#knob-cover-body)" stroke="#0F172A" strokeWidth="0.8" />

        {/* Fluted Grip Ribs / Teeth around circumference */}
        <circle
          cx="0"
          cy="-6"
          r="12.2"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="1.4 1.4"
          pointerEvents="none"
        />

        {/* Inner Knob Bevel */}
        <circle cx="0" cy="-6" r="10.5" fill="#1E293B" stroke="#0F172A" strokeWidth="0.6" />

        {/* Brushed Silver / Metal Top Inlay Disc */}
        <circle cx="0" cy="-6" r="8.2" fill="url(#knob-cover-top)" stroke="#475569" strokeWidth="0.6" />
        
        {/* Center Metal Hub / Dimple */}
        <circle cx="0" cy="-6" r="3.2" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
        <circle cx="0" cy="-6" r="1.4" fill="#334155" />

        {/* Red Indicator Pointer Line */}
        <line x1="0" y1="-9.2" x2="0" y2="-17.6" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
        {/* Red Pointer Arrow Notch */}
        <polygon points="0,-18.8 -2.4,-15 2.4,-15" fill="#EF4444" stroke="#991B1B" strokeWidth="0.4" />
      </g>
    </g>
  );
});

// 9. Polarized Electrolytic Capacitor (Cylindrical Canister Breadboard Style)
export const TinkerCapacitor = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  capacitance = '100Ã‚ÂµF',
  voltage = '25V',
  onPinClick,
  onMouseDown
}) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : 'drop-shadow(0 8px 18px rgba(0,0,0,0.28))' }}
    >
      <defs>
        {/* Charcoal Matte Can Body */}
        <linearGradient id="cap-can-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#373D47" />
          <stop offset="25%" stopColor="#2A303A" />
          <stop offset="70%" stopColor="#1E232B" />
          <stop offset="100%" stopColor="#14181F" />
        </linearGradient>

        {/* Negative Polarity Stripe (Silver/Grey) */}
        <linearGradient id="cap-stripe-silver" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="75%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

      </defs>

      {/* 1. TWO PROMINENT SILVER TERMINAL LEADS (Cathode at -10, 28 | Anode at 10, 28) */}
      {/* 100% Reliable Multi-Layered Metallic Wire (Immune to zero-width SVG gradient bug) */}
      
      {/* Cathode Lead Wire (Left: Negative -) */}
      <g>
        {/* Layer 0: Ambient Drop Shadow */}
        <line x1="-6" y1="-4" x2="-6" y2="28" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
        {/* Layer 1: Outer Dark Chrome Edge */}
        <line x1="-6" y1="-4" x2="-6" y2="28" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
        {/* Layer 2: Polished Silver Metal Core */}
        <line x1="-6" y1="-4" x2="-6" y2="28" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
        {/* Layer 3: Specular Glint Centerline */}
        <line x1="-6" y1="-4" x2="-6" y2="28" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

        {/* Cathode Terminal Solder Pad */}
        <circle
          cx="-6"
          cy="28"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => {
            e.stopPropagation();
            onPinClick && onPinClick('pin_cathode', -6, 28);
          }}
        />
        <circle cx="-6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="-6.8" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
      </g>

      {/* Anode Lead Wire (Right: Positive +) */}
      <g>
        {/* Layer 0: Ambient Drop Shadow */}
        <line x1="6" y1="-4" x2="6" y2="28" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
        {/* Layer 1: Outer Dark Chrome Edge */}
        <line x1="6" y1="-4" x2="6" y2="28" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
        {/* Layer 2: Polished Silver Metal Core */}
        <line x1="6" y1="-4" x2="6" y2="28" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
        {/* Layer 3: Specular Glint Centerline */}
        <line x1="6" y1="-4" x2="6" y2="28" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

        {/* Anode Terminal Solder Pad */}
        <circle
          cx="6"
          cy="28"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => {
            e.stopPropagation();
            onPinClick && onPinClick('pin_anode', 6, 28);
          }}
        />
        <circle cx="6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="5.2" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
      </g>

      {/* 2. BOTTOM RUBBER END-SEAL PLUG */}
      <rect x="-11.5" y="-6" width="23" height="4" rx="1.2" fill="#14181F" stroke="#0A0D12" strokeWidth="0.8" />
      {/* Lead wire rubber seal collars */}
      <circle cx="-6" cy="-4" r="1.8" fill="#2A303A" />
      <circle cx="6" cy="-4" r="1.8" fill="#2A303A" />

      {/* 3. MAIN CYLINDRICAL CANISTER (Dark Sleeve from y=-48 to y=-6) */}
      <rect
        x="-13"
        y="-48"
        width="26"
        height="42"
        rx="2.5"
        fill="url(#cap-can-body)"
        stroke="#11141A"
        strokeWidth="1"
      />

      {/* Silver Aluminum Top Bevel Streak */}
      <line x1="-11" y1="-47.2" x2="11" y2="-47.2" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

      {/* 4. NEGATIVE POLARITY STRIPE (Left side, light silver/grey) */}
      <path
        d="M -13 -45.5 Q -13 -48 -10.5 -48 L -6.5 -48 L -6.5 -6 L -10.5 -6 Q -13 -6 -13 -8.5 Z"
        fill="url(#cap-stripe-silver)"
      />
      {/* Negative Minus Signs on Stripe */}
      <g fill="#1E293B" opacity="0.9" pointerEvents="none">
        <rect x="-11" y="-38" width="4.5" height="1.4" rx="0.5" />
        <rect x="-11" y="-26" width="4.5" height="1.4" rx="0.5" />
        <rect x="-11" y="-14" width="4.5" height="1.4" rx="0.5" />
      </g>

      {/* 5. CIRCUMFERENTIAL CRIMP GROOVE (Embossed waist near bottom) */}
      <g pointerEvents="none">
        <rect x="-13" y="-12" width="26" height="2.5" fill="#0A0D12" opacity="0.55" />
        <line x1="-13" y1="-12" x2="13" y2="-12" stroke="#05070A" strokeWidth="0.8" />
        <line x1="-13" y1="-9.5" x2="13" y2="-9.5" stroke="#64748B" strokeWidth="0.5" opacity="0.5" />
      </g>

      {/* 6. SILKSCREEN RATING TEXT (Right side of canister) */}
      <g fill="#94A3B8" fontFamily="ui-monospace, monospace" textAnchor="start" pointerEvents="none">
        <text
          x="-5.4"
          y="-28"
          fontSize="3.8"
          fontWeight="700"
          letterSpacing="0.2"
          opacity="0.85"
        >
          {voltage || '25V'}
        </text>
        <text
          x="-5.4"
          y="-18"
          fontSize={String(capacitance || '').length >= 6 ? '3.8' : (String(capacitance || '').length >= 5 ? '4.2' : '4.6')}
          fontWeight="800"
          letterSpacing={String(capacitance || '').length >= 6 ? '0.1' : '0.2'}
        >
          {capacitance || '100Ã‚ÂµF'}
        </text>
      </g>
    </g>
  );
});

// 10. Precision Cylindrical ERM Micro Vibration Motor (Eccentric Rotating Mass)
export const TinkerVibrationMotor = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  isVibrating = false,
  isBurnedOut = false,
  rpm = 0,
  onPinClick,
  onMouseDown
}) => {
  // Dynamic duration scaling with motor RPM / voltage
  const animDuration = rpm && rpm > 0
    ? `${Math.max(0.045, Math.min(0.095, 650 / (rpm || 8000))).toFixed(3)}s`
    : '0.065s';
  const bodyShakeDur = rpm && rpm > 0
    ? `${Math.max(0.04, Math.min(0.08, 550 / (rpm || 8000))).toFixed(3)}s`
    : '0.055s';

  const posWireD = isVibrating
    ? "M -3 16 C -3 24, -9 24, -10 32; M -2.4 16.2 C -2.2 24.3, -9.4 23.8, -10 32; M -3.6 15.8 C -3.8 23.7, -8.6 24.2, -10 32; M -3 16 C -3 24, -9 24, -10 32"
    : undefined;
  const negWireD = isVibrating
    ? "M 3 16 C 3 24, 9 24, 10 32; M 3.6 16.2 C 3.8 24.3, 8.6 23.8, 10 32; M 2.4 15.8 C 2.2 23.7, 9.4 24.2, 10 32; M 3 16 C 3 24, 9 24, 10 32"
    : undefined;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{
        filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : undefined
      }}
    >
      <defs>
        {/* Stainless Steel Cylindrical Motor Shell */}
        <linearGradient id="erm-can-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="25%" stopColor="#F8FAFC" />
          <stop offset="60%" stopColor="#94A3B8" />
          <stop offset="85%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Polished Brass Eccentric Counterweight */}
        <linearGradient id="erm-brass-weight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Stainless Output Shaft Pin */}
        <linearGradient id="erm-shaft-pin" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Persistence-of-Vision Swept Disc Radial Gradient */}
        <radialGradient id="erm-sweep-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#D97706" stopOpacity="0.22" />
          <stop offset="85%" stopColor="#B45309" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
        </radialGradient>

        {/* Directional Kinetic Motion Blur Filter for High-RPM Vibration */}
        <filter id="erm-kinetic-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6 0.15" result="motionBlur" />
          <feMerge>
            <feMergeNode in="motionBlur" opacity="0.65" />
            <feMergeNode in="SourceGraphic" opacity="0.85" />
          </feMerge>
        </filter>

        {/* Soft Ghosting Blur for Persistence Trails */}
        <filter id="erm-ghost-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5 0.8" />
        </filter>
      </defs>

      {/* Burnout Smoke / Sparks Indicator */}
      {isBurnedOut && (
        <g pointerEvents="none">
          <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.25)" />
          <circle cx="0" cy="-6" r="3" fill="#EF4444" opacity="0.8" />
        </g>
      )}

      {/* 2. FLEXIBLE FLYING WIRE LEADS (Rear Endcap to Terminal Pins) */}
      {/* Positive Lead (Red Wire: (-3, 16) -> (-10, 32)) */}
      <g>
        {/* Wire Insulation Body */}
        <path d="M -3 16 C -3 24, -9 24, -10 32" fill="none" stroke="#991B1B" strokeWidth="3.2" strokeLinecap="round">
          {isVibrating && <animate attributeName="d" values={posWireD} dur={animDuration} repeatCount="indefinite" />}
        </path>
        <path d="M -3 16 C -3 24, -9 24, -10 32" fill="none" stroke="#EF4444" strokeWidth="2.0" strokeLinecap="round">
          {isVibrating && <animate attributeName="d" values={posWireD} dur={animDuration} repeatCount="indefinite" />}
        </path>

        {/* Positive Terminal Solder Eyelet - Standard Silver Leg Pin matching Resistor/Diode */}
        <circle
          cx="-10"
          cy="32"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => {
            e.stopPropagation();
            onPinClick && onPinClick('pin_pos', -10, 32);
          }}
        />
        <circle cx="-10" cy="32" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="-10.8" cy="31.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
      </g>

      {/* Negative Lead (Blue Wire: (3, 16) -> (10, 32)) */}
      <g>
        {/* Wire Insulation Body */}
        <path d="M 3 16 C 3 24, 9 24, 10 32" fill="none" stroke="#1E3A8A" strokeWidth="3.2" strokeLinecap="round">
          {isVibrating && <animate attributeName="d" values={negWireD} dur={animDuration} repeatCount="indefinite" />}
        </path>
        <path d="M 3 16 C 3 24, 9 24, 10 32" fill="none" stroke="#3B82F6" strokeWidth="2.0" strokeLinecap="round">
          {isVibrating && <animate attributeName="d" values={negWireD} dur={animDuration} repeatCount="indefinite" />}
        </path>

        {/* Negative Terminal Solder Eyelet - Standard Silver Leg Pin matching Resistor/Diode */}
        <circle
          cx="10"
          cy="32"
          r="3.8"
          fill="#E2E8F0"
          stroke="#4A5568"
          strokeWidth="1.2"
          className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
          onClick={e => {
            e.stopPropagation();
            onPinClick && onPinClick('pin_neg', 10, 32);
          }}
        />
        <circle cx="10" cy="32" r="1.5" fill="#64748B" pointerEvents="none" />
        <circle cx="9.2" cy="31.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
      </g>

      {/* VIBRATION SHAKE/JITTER CONTAINER FOR MOTOR BODY (Noticeable Tactile Buzz) */}
      <g>
        {isVibrating && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0.65 -0.25; -0.6 0.3; 0.7 0.15; -0.65 -0.28; 0.45 -0.12; -0.5 0.2; 0 0"
            dur={bodyShakeDur}
            repeatCount="indefinite"
          />
        )}

        {/* 3. REAR RUBBER ENDCAP (Molded Plastic Plug) */}
        <rect x="-8" y="14" width="16" height="3.5" rx="1" fill="#0F172A" stroke="#020617" strokeWidth="0.8" />
        {/* Wire feedthrough strain-relief grommets */}
        <circle cx="-3" cy="15" r="1.4" fill="#334155" />
        <circle cx="3" cy="15" r="1.4" fill="#334155" />

        {/* 4. MAIN CYLINDRICAL STEEL CANISTER (y = -18 to +14) */}
        <rect
          x="-9"
          y="-18"
          width="18"
          height="32"
          rx="2"
          fill="url(#erm-can-metal)"
          stroke="#475569"
          strokeWidth="0.9"
        />

        {/* Silkscreen Laser Engraving */}
        <g fill="#475569" fontFamily="ui-monospace, monospace" textAnchor="middle" pointerEvents="none">
          <text x="0" y="-3" fontSize="3.5" fontWeight="800" letterSpacing="0.4" opacity="0.9">ERM 3V</text>
          <text x="0" y="3" fontSize="2.8" fontWeight="700" letterSpacing="0.2" opacity="0.75">MOTOR</text>
        </g>

        {/* 5. FRONT MOTOR BEARING BOSS & BUSHING COLLAR (y = -22 to -18) */}
        <rect x="-4.5" y="-21" width="9" height="3" rx="0.8" fill="#94A3B8" stroke="#475569" strokeWidth="0.6" />
        <ellipse cx="0" cy="-21" rx="4" ry="1.2" fill="#E2E8F0" />

        {/* 6. STEEL ROTOR SHAFT PIN (y = -33 to -21) */}
        <rect x="-1" y="-33" width="2" height="12" rx="0.5" fill="url(#erm-shaft-pin)" stroke="#475569" strokeWidth="0.5" />

        {/* 7. BRASS ECCENTRIC ROTATING MASS WITH HIGH-RPM PERSISTENCE-OF-VISION ENVELOPE */}
        <g transform="translate(0, -26)">
          {/* Active Rotational Persistence-of-Vision Effects */}
          {isVibrating && (
            <g pointerEvents="none">
              {/* 360Ã‚Â° Rotational Swept Blur Disc */}
              <ellipse
                cx="0"
                cy="0"
                rx="9.6"
                ry="7.2"
                fill="url(#erm-sweep-halo)"
                filter="url(#erm-ghost-blur)"
              />

              {/* Opposing Persistence Ghost (Left Lobe Strobe of the 180Ã‚Â° sweep) */}
              <g filter="url(#erm-kinetic-blur)">
                <animate
                  attributeName="opacity"
                  values="0.18; 0.52; 0.15; 0.48; 0.18"
                  dur={animDuration}
                  repeatCount="indefinite"
                />
                <path
                  d="M 1.2 -7 L -8 -7 C -9 -7, -9.5 -6, -9.5 -4.5 L -9.5 4.5 C -9.5 6, -9 7, -8 7 L 1.2 7 Z"
                  fill="url(#erm-brass-weight)"
                  stroke="#78350F"
                  strokeWidth="0.75"
                />
              </g>
            </g>
          )}

          {/* Primary Brass Counterweight (Right Lobe) */}
          <g filter={isVibrating ? 'url(#erm-kinetic-blur)' : undefined}>
            {/* Primary Horizontal Centrifugal Vibration Stroke */}
            {isVibrating && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 2.4 0.25; -1.6 -0.25; 2.0 0.18; -1.5 -0.18; 0.8 0.1; -0.9 -0.1; 0 0"
                dur={animDuration}
                repeatCount="indefinite"
              />
            )}

            {/* Cantilever Micro-Tilt Wobble around Shaft Center */}
            {isVibrating && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0; 1.8 0 0; -1.6 0 0; 1.2 0 0; -1.5 0 0; 0 0 0"
                dur={animDuration}
                repeatCount="indefinite"
                additive="sum"
              />
            )}

            {/* Harmonic Strobe Intensity (Phase-aligned with opposite lobe) */}
            {isVibrating && (
              <animate
                attributeName="opacity"
                values="0.95; 0.62; 0.95; 0.68; 0.95"
                dur={animDuration}
                repeatCount="indefinite"
              />
            )}

            {/* Crisp Undistorted D-Shaped Brass Counterweight Body */}
            <path
              d="M -1.2 -7 L 8 -7 C 9 -7, 9.5 -6, 9.5 -4.5 L 9.5 4.5 C 9.5 6, 9 7, 8 7 L -1.2 7 Z"
              fill="url(#erm-brass-weight)"
              stroke="#78350F"
              strokeWidth="0.8"
            />

            {/* Shaft Collar Clamp Ring on Counterweight */}
            <circle cx="0" cy="0" r="2.5" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="1.3" fill="#FEF08A" />
            {/* Center Shaft Rotor Pin */}
            <circle cx="0" cy="0" r="0.7" fill="#475569" />
          </g>
        </g>
      </g>
    </g>
  );
});

// 11. Ultra-Realistic DO-41 Axial Silicon Rectifier Diode (1N4007 / 1N4148 / 1N5819)
export const TinkerDiode = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  model = '1N4007',
  isConducting = false,
  isBlocking = false,
  isBurnedOut = false,
  currentMa = 0,
  onPinClick,
  onMouseDown
}) => {
  const compId = `tinker-diode-${model}`;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{
        filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : undefined
      }}
    >
      <defs>
        {/* DO-41 Molded Black Epoxy Cylindrical Body Gradient */}
        <linearGradient id={`diode-body-${compId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="18%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="85%" stopColor="#090D16" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Gloss Specular Longitudinal Highlight Streak */}
        <linearGradient id={`diode-specular-${compId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>

        {/* Cathode Polarity Band Silver/Platinum Plated Gradient */}
        <linearGradient id={`diode-stripe-${compId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E2E8F0" />
          <stop offset="60%" stopColor="#CBD5E1" />
          <stop offset="85%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Forward Conduction Aura Halo */}
        <radialGradient id={`diode-glow-${compId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Active Forward Conduction Glow Aura */}
      {isConducting && !isBurnedOut && (
        <rect
          x="-16"
          y="-9"
          width="32"
          height="18"
          rx="5"
          fill={`url(#diode-glow-${compId})`}
          pointerEvents="none"
          className="animate-pulse"
        />
      )}

      {/* 3D Realistic Metallic Leads (Identical to LED: Drop Shadow + Dark Chrome Edge + Silver Core + Specular Highlight) */}
      {/* Lead Ambient Drop Shadows */}
      <path d="M -30 0 L -13 0" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M 13 0 L 30 0" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />

      {/* Outer Metallic Lead Wire Edge (Dark Chrome / Shadow) */}
      <path d="M -30 0 L -13 0" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 13 0 L 30 0" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

      {/* Polished Silver Wire Body */}
      <path d="M -30 0 L -13 0" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <path d="M 13 0 L 30 0" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />

      {/* Longitudinal Specular Centerline Highlight (Crisp Metallic Sheen) */}
      <path d="M -30 0 L -13 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
      <path d="M 13 0 L 30 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

      {/* Interactive Solder Terminals at (-30, 0) [Anode] and (30, 0) [Cathode] */}
      {/* Anode Terminal (Left, pin_anode / pin_1) */}
      <circle
        cx="-30"
        cy="0"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_anode', -30, 0);
        }}
      />
      <circle cx="-30" cy="0" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-30.8" cy="-0.8" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Cathode Terminal (Right, pin_cathode / pin_2) */}
      <circle
        cx="30"
        cy="0"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_cathode', 30, 0);
        }}
      />
      <circle cx="30" cy="0" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="29.2" cy="-0.8" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* DO-41 Cylindrical Epoxy Body (-13 to +13, height 12) */}
      <rect
        x="-13"
        y="-6"
        width="26"
        height="12"
        rx="2.2"
        fill={isBurnedOut ? '#1C1917' : `url(#diode-body-${compId})`}
        stroke={isBurnedOut ? '#7F1D1D' : '#0B0F19'}
        strokeWidth="0.8"
      />

      {/* Cylindrical Gloss Overlay */}
      <rect
        x="-13"
        y="-6"
        width="26"
        height="12"
        rx="2.2"
        fill={`url(#diode-specular-${compId})`}
        pointerEvents="none"
      />

      {/* Cathode Polarity Band (Silver stripe near cathode pin, x=6.5 to 11.2) */}
      <rect
        x="6.5"
        y="-5.8"
        width="4.7"
        height="11.6"
        rx="0.6"
        fill={isBurnedOut ? '#44403C' : `url(#diode-stripe-${compId})`}
        stroke={isBurnedOut ? '#292524' : '#64748B'}
        strokeWidth="0.4"
        pointerEvents="none"
      />

      {/* Dynamic Animated Forward Conduction Particles (Current flows Anode -> Cathode) */}
      {isConducting && !isBurnedOut && (
        <g pointerEvents="none">
          <circle cx="-6" cy="0" r="1" fill="#4ADE80" opacity="0.9">
            <animate
              attributeName="cx"
              values="-10; 8"
              dur="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2; 1; 0.2"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="0" cy="0" r="1" fill="#86EFAC" opacity="0.9">
            <animate
              attributeName="cx"
              values="-6; 12"
              dur="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3; 1; 0.3"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Dynamic Reverse Blocking Subtle Cathode Band Aura */}
      {isBlocking && !isBurnedOut && (
        <rect
          x="6"
          y="-6.5"
          width="5.7"
          height="13"
          rx="1"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.2"
          opacity="0.8"
          pointerEvents="none"
          className="animate-pulse"
        />
      )}

      {/* Burnout / Overcurrent Smoke & Charred Rupture Effect */}
      {isBurnedOut && (
        <g pointerEvents="none">
          {/* Jagged Rupture Crack in Epoxy */}
          <path
            d="M -3 -6 L -1 -2 L 2 -4 L 0 1 L 3 3 L 1 6"
            fill="none"
            stroke="#EF4444"
            strokeWidth="0.9"
          />
          <path
            d="M -2 -1 L 1 0 L -0.5 3"
            fill="none"
            stroke="#FCA5A5"
            strokeWidth="0.5"
          />

          {/* Smoke Puff Particles */}
          <circle cx="0" cy="-6" r="3.5" fill="#6B7280" opacity="0.6">
            <animate attributeName="cy" values="-6; -18" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="r" values="3; 8" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7; 0" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="2" cy="-7" r="2.5" fill="#9CA3AF" opacity="0.5">
            <animate attributeName="cy" values="-7; -22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="2.5; 9" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6; 0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </g>
  );
});

// 12. Tinkercad-Grade 5mm CdS Photoresistor (Light Dependent Resistor / LDR)
export const TinkerPhotoresistor = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  light = 50, // 0 (Dark / ~500kÃŽÂ©) to 100 (Bright / ~400ÃŽÂ©)
  onPinClick,
  onMouseDown
}) => {
  const compId = 'tinker-photoresistor';
  const clampedLight = Math.max(0, Math.min(100, Number(light) ?? 50));
  // Live GL5528 response curve
  const resistance = Math.round(400 * Math.pow(500000 / 400, (100 - clampedLight) / 100));
  const resLabel = resistance >= 1000000
    ? `${(resistance / 1000000).toFixed(1)} MÃŽÂ©`
    : (resistance >= 1000 ? `${(resistance / 1000).toFixed(1)} kÃŽÂ©` : `${resistance} ÃŽÂ©`);

  // Symmetrical Lead paths extending from ceramic base down to pins at (-6, 28) & (6, 28)
  // Starting deep inside ceramic base at y = 2 so they seamlessly emerge from under the disc
  const leftLeadPath = "M -6 2 L -6 28";
  const rightLeadPath = "M 6 2 L 6 28";

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{
        filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : undefined
      }}
    >
      <defs>
        {/* Ceramic Disc Substrate Gradient */}
        <radialGradient id={`ldr-ceramic-${compId}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FAF5E8" />
          <stop offset="30%" stopColor="#F2E6CE" />
          <stop offset="70%" stopColor="#DFCCA3" />
          <stop offset="100%" stopColor="#B89F70" />
        </radialGradient>

        {/* CdS Photoconductive Layer Gradient */}
        <linearGradient id={`ldr-cds-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Ambient Sunlight Glow Halo (Scales with light level) */}
        <radialGradient id={`ldr-ambient-${compId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity={(clampedLight / 100) * 0.4} />
          <stop offset="60%" stopColor="#FBBF24" stopOpacity={(clampedLight / 100) * 0.15} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Sunlight Illumination Aura */}
      {clampedLight > 10 && (
        <circle
          cx="0"
          cy="-2"
          r={16 + (clampedLight / 100) * 6}
          fill={`url(#ldr-ambient-${compId})`}
          pointerEvents="none"
        />
      )}

      {/* 1. 3D Realistic Metallic Leads (Identical to LED 4-layer system) */}
      {/* Lead Ambient Drop Shadows */}
      <path d={leftLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <path d={rightLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />

      {/* Outer Metallic Lead Wire Edge (Dark Chrome / Shadow) */}
      <path d={leftLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d={rightLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

      {/* Polished Silver Wire Body */}
      <path d={leftLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <path d={rightLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />

      {/* Longitudinal Specular Centerline Highlight (Crisp Metallic Sheen) */}
      <path d={leftLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
      <path d={rightLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

      {/* Interactive Solder Terminals at (-6, 28) and (6, 28) */}
      {/* Pin 1 (Left Terminal) */}
      <circle
        cx="-6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_1', -6, 28);
        }}
      />
      <circle cx="-6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-6.8" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 2 (Right Terminal) */}
      <circle
        cx="6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_2', 6, 28);
        }}
      />
      <circle cx="6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="5.2" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* 2. Round Ceramic Substrate Disc (Beige / Off-white 5mm disc) */}
      <circle
        cx="0"
        cy="-2"
        r="14.5"
        fill={`url(#ldr-ceramic-${compId})`}
        stroke="#8C7348"
        strokeWidth="0.8"
      />
      {/* Internal rim lip bevel */}
      <circle cx="0" cy="-2" r="13.2" fill="none" stroke="#D1BE99" strokeWidth="0.6" />

      {/* 3. Cadmium Sulfide (CdS) Photosensitive Bed */}
      <circle
        cx="0"
        cy="-2"
        r="11.8"
        fill={`url(#ldr-cds-${compId})`}
        stroke="#7C2D12"
        strokeWidth="0.5"
      />

      {/* 4. Authentic Interdigitated Serpentine CdS Electrode Track */}
      {/* Silver electrode trace running in classic serpentine wavy pattern */}
      <path
        d="M -7 -9.5 L 7 -9.5 M -7 -6.5 L 7 -6.5 M -7 -3.5 L 7 -3.5 M -7 -0.5 L 7 -0.5 M -7 2.5 L 7 2.5 M -7 5.5 L 7 5.5"
        fill="none"
        stroke="#475569"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M -7 -9.5 L 7 -9.5 M -7 -6.5 L 7 -6.5 M -7 -3.5 L 7 -3.5 M -7 -0.5 L 7 -0.5 M -7 2.5 L 7 2.5 M -7 5.5 L 7 5.5"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Serpentine looping bridge links */}
      <path
        d="M 7 -9.5 C 9.5 -9.5, 9.5 -6.5, 7 -6.5 M -7 -6.5 C -9.5 -6.5, -9.5 -3.5, -7 -3.5 M 7 -3.5 C 9.5 -3.5, 9.5 -0.5, 7 -0.5 M -7 -0.5 C -9.5 -0.5, -9.5 2.5, -7 2.5 M 7 2.5 C 9.5 2.5, 9.5 5.5, 7 5.5"
        fill="none"
        stroke="#475569"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 7 -9.5 C 9.5 -9.5, 9.5 -6.5, 7 -6.5 M -7 -6.5 C -9.5 -6.5, -9.5 -3.5, -7 -3.5 M 7 -3.5 C 9.5 -3.5, 9.5 -0.5, 7 -0.5 M -7 -0.5 C -9.5 -0.5, -9.5 2.5, -7 2.5 M 7 2.5 C 9.5 2.5, 9.5 5.5, 7 5.5"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* 5. Clear Protective Epoxy Resin Dome Gloss */}
      <ellipse
        cx="-3.5"
        cy="-5.5"
        rx="8.5"
        ry="4.5"
        fill="#FFFFFF"
        opacity="0.32"
        transform="rotate(-20 -3.5 -5.5)"
        pointerEvents="none"
      />

      {/* Darkness Shadowing Overlay (Darkens when light is low) */}
      {clampedLight < 50 && (
        <circle
          cx="0"
          cy="-2"
          r="12"
          fill="#000000"
          opacity={((50 - clampedLight) / 50) * 0.45}
          pointerEvents="none"
        />
      )}
    </g>
  );
});

// 13. Tinkercad-Grade 5mm RGB LED (4-Pin Tri-Color Common Cathode / Anode)
export const TinkerRGBLED = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  common = 'cathode', // 'cathode' or 'anode'
  rLit = false,
  gLit = false,
  bLit = false,
  isBurnedOut = false,
  onPinClick,
  onMouseDown
}) => {
  const compId = `tinker-rgb-led-${common}-${rLit ? '1' : '0'}${gLit ? '1' : '0'}${bLit ? '1' : '0'}-${isBurnedOut ? 'burned' : 'ok'}`;
  const anyLit = (rLit || gLit || bLit) && !isBurnedOut;

  // Authentic 5mm T-1 3/4 Tinkercad silhouette (Centered at x = 0, cylinder from -9 to +9)
  // Left: Flat index notch at x = -11 (Red side)
  // Right: Rounded flange collar at x = 11 (Green side)
  const bulbPath = "M -11 8 L -11 4 L -9 4 L -9 -8 C -9 -16, -4 -22, 0 -22 C 4 -22, 9 -16, 9 -8 L 9 4 L 11 4 L 11 8 Z";

  // 4 Harmonious Symmetrical Leads with Smooth Stamped BÃƒÂ©zier Fan-out:
  // Starts deep inside the epoxy base at y = 4 (spaced evenly at x = -6, -2, 2, 6)
  // Lead 1: Red (Pin 1) - emerges at -6, smooth S-curve fan-out to -18
  const rLeadPath = "M -6 4 L -6 9 C -6 13, -18 13, -18 17 L -18 28";
  // Lead 2: Common (Pin 2) - emerges at -2, smooth S-curve fan-out to -6
  const comLeadPath = "M -2 4 L -2 9 C -2 13, -6 13, -6 17 L -6 28";
  // Lead 3: Blue (Pin 3) - emerges at 2, smooth S-curve fan-out to 6
  const bLeadPath = "M 2 4 L 2 9 C 2 13, 6 13, 6 17 L 6 28";
  // Lead 4: Green (Pin 4) - emerges at 6, smooth S-curve fan-out to 18
  const gLeadPath = "M 6 4 L 6 9 C 6 13, 18 13, 18 17 L 18 28";

  // Dynamic Mixed Lighting Colors
  let shades = {
    c1: '#FFFFFF',
    c2: '#F8FAFC',
    c3: '#E2E8F0',
    c4: '#CBD5E1',
    c5: '#94A3B8',
    glow: '#FFFFFF',
    stroke: '#64748B'
  };

  if (isBurnedOut) {
    shades = {
      c1: '#4B5563', c2: '#374151', c3: '#1F2937', c4: '#111827', c5: '#030712',
      glow: '#000000', stroke: '#1F2937'
    };
  } else if (rLit && gLit && bLit) {
    // Brilliant White
    shades = {
      c1: '#FFFFFF', c2: '#FFFFFF', c3: '#F8FAFC', c4: '#E2E8F0', c5: '#CBD5E1',
      glow: '#FFFFFF', stroke: '#94A3B8'
    };
  } else if (rLit && gLit) {
    // Yellow
    shades = {
      c1: '#FFFFFF', c2: '#FEF08A', c3: '#FACC15', c4: '#EAB308', c5: '#CA8A04',
      glow: '#EAB308', stroke: '#A16207'
    };
  } else if (rLit && bLit) {
    // Magenta / Purple
    shades = {
      c1: '#FFFFFF', c2: '#F5D0FE', c3: '#E879F9', c4: '#C026D3', c5: '#86198F',
      glow: '#D946EF', stroke: '#701A75'
    };
  } else if (gLit && bLit) {
    // Cyan / Aqua
    shades = {
      c1: '#FFFFFF', c2: '#CFFAFE', c3: '#22D3EE', c4: '#06B6D4', c5: '#0E7490',
      glow: '#06B6D4', stroke: '#155E75'
    };
  } else if (rLit) {
    // Vibrant Red
    shades = {
      c1: '#FFFFFF', c2: '#FCA5A5', c3: '#EF4444', c4: '#DC2626', c5: '#991B1B',
      glow: '#EF4444', stroke: '#7F1D1D'
    };
  } else if (gLit) {
    // Vibrant Green
    shades = {
      c1: '#FFFFFF', c2: '#86EFAC', c3: '#22C55E', c4: '#16A34A', c5: '#166534',
      glow: '#22C55E', stroke: '#14532D'
    };
  } else if (bLit) {
    // Vibrant Blue
    shades = {
      c1: '#FFFFFF', c2: '#93C5FD', c3: '#3B82F6', c4: '#2563EB', c5: '#1D4ED8',
      glow: '#3B82F6', stroke: '#1E3A8A'
    };
  }

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 10px #347F7A)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))' }}
    >
      <defs>
        {/* Epoxy Bulb Gradient */}
        <radialGradient id={`rgb-bulb-${compId}`} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor={shades.c1} />
          <stop offset="25%" stopColor={shades.c2} />
          <stop offset="60%" stopColor={shades.c3} />
          <stop offset="88%" stopColor={shades.c4} />
          <stop offset="100%" stopColor={shades.c5} />
        </radialGradient>

        {/* Dynamic Illumination Glow Halo */}
        {anyLit && (
          <radialGradient id={`rgb-halo-${compId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={shades.glow} stopOpacity="0.75" />
            <stop offset="45%" stopColor={shades.glow} stopOpacity="0.4" />
            <stop offset="80%" stopColor={shades.glow} stopOpacity="0.12" />
            <stop offset="100%" stopColor={shades.glow} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Dynamic Ambient Glow Aura */}
      {anyLit && (
        <circle
          cx="0"
          cy="-8"
          r="36"
          fill={`url(#rgb-halo-${compId})`}
          pointerEvents="none"
        />
      )}

      {/* 1. 4-Layer 3D Realistic Metallic Leads (Identical to LED) */}
      {/* Lead Ambient Drop Shadows */}
      <path d={rLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={comLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={bLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gLeadPath} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Outer Dark Chrome Edge */}
      <path d={rLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={comLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={bLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gLeadPath} fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Polished Silver Body */}
      <path d={rLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
      <path d={comLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
      <path d={bLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gLeadPath} fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" />

      {/* Specular Longitudinal Centerline Highlight */}
      <path d={rLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={comLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={bLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={gLeadPath} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

      {/* 2. Interactive Solder Terminals */}
      {/* Pin 1: Red (x = -18, y = 28) */}
      <circle
        cx="-18"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_r', -18, 28);
        }}
      >
        <title>Pin 1: Red (Anode)</title>
      </circle>
      <circle cx="-18" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-18.8" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 2: Common Cathode / Anode (x = -6, y = 28) */}
      <circle
        cx="-6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_common', -6, 28);
        }}
      >
        <title>{common === 'cathode' ? 'Pin 2: Cathode (Common Ground)' : 'Pin 2: Anode (Common Power)'}</title>
      </circle>
      <circle cx="-6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-6.8" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 3: Blue (x = 6, y = 28) */}
      <circle
        cx="6"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_b', 6, 28);
        }}
      >
        <title>Pin 3: Blue (Anode)</title>
      </circle>
      <circle cx="6" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="5.2" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 4: Green (x = 18, y = 28) */}
      <circle
        cx="18"
        cy="28"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_g', 18, 28);
        }}
      >
        <title>Pin 4: Green (Anode)</title>
      </circle>
      <circle cx="18" cy="28" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="17.2" cy="27.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* 3. Base Shadow under Epoxy Bulb */}
      <ellipse cx="0" cy="8" rx="10.5" ry="3.5" fill="rgba(0,0,0,0.22)" />

      {/* 4. 3D Glossy Epoxy Bulb Body (5mm T-1 3/4) */}
      <path
        d={bulbPath}
        fill={`url(#rgb-bulb-${compId})`}
        stroke={shades.stroke}
        strokeWidth="0.9"
      />

      {/* Base Flange Bevel Line */}
      <line x1="-9" y1="4" x2="9" y2="4" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
      <line x1="-9" y1="4.8" x2="9" y2="4.8" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />

      {/* 5. Internal Tri-Color Micro-Chips (Visible inside the translucent dome) */}
      <g opacity={anyLit ? 0.9 : 0.45} pointerEvents="none">
        {/* Anvil / Support Posts */}
        <line x1="-4" y1="4" x2="-4" y2="-4" stroke="#64748B" strokeWidth="0.8" />
        <line x1="0" y1="4" x2="0" y2="-8" stroke="#64748B" strokeWidth="0.8" />
        <line x1="4" y1="4" x2="4" y2="-4" stroke="#64748B" strokeWidth="0.8" />

        {/* Micro-Die 1: Red */}
        <rect x="-5" y="-5.5" width="2" height="2" rx="0.3" fill={rLit ? '#EF4444' : '#991B1B'} stroke="#7F1D1D" strokeWidth="0.3" />
        {/* Micro-Die 2: Blue */}
        <rect x="-1" y="-9.5" width="2" height="2" rx="0.3" fill={bLit ? '#3B82F6' : '#1D4ED8'} stroke="#1E3A8A" strokeWidth="0.3" />
        {/* Micro-Die 3: Green */}
        <rect x="3" y="-5.5" width="2" height="2" rx="0.3" fill={gLit ? '#22C55E' : '#166534'} stroke="#14532D" strokeWidth="0.3" />
      </g>

      {/* 6. Realistic Curved Specular Highlight Streak */}
      <path
        d="M -6 -8 C -6 -16, -2 -19, 0 -19"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
        pointerEvents="none"
      />
      <line
        x1="-11"
        y1="4"
        x2="-11"
        y2="8"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        opacity="0.6"
        pointerEvents="none"
      />

      {/* 7. Burnout Smoke / Carbon Residue Overlay */}
      {isBurnedOut && (
        <path
          d={bulbPath}
          fill="rgba(24, 24, 27, 0.75)"
          pointerEvents="none"
        />
      )}
    </g>
  );
});

// Precomputed 12-tooth smooth involute spur pinion gear path (Tinkercad rounded cog teeth)
const DC_MOTOR_GEAR_PATH = (() => {
  const teeth = 12;
  const rInner = 8.0;
  const rOuter = 12.8;
  const points = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const angle = i * step - Math.PI / 2;
    const a0 = angle - step * 0.28;
    const a1 = angle - step * 0.16;
    const a2 = angle;
    const a3 = angle + step * 0.16;
    const a4 = angle + step * 0.28;

    const p0 = [Math.cos(a0) * rInner, Math.sin(a0) * rInner];
    const p1 = [Math.cos(a1) * (rOuter * 0.94), Math.sin(a1) * (rOuter * 0.94)];
    const p2 = [Math.cos(a2) * rOuter, Math.sin(a2) * rOuter];
    const p3 = [Math.cos(a3) * (rOuter * 0.94), Math.sin(a3) * (rOuter * 0.94)];
    const p4 = [Math.cos(a4) * rInner, Math.sin(a4) * rInner];

    if (i === 0) {
      points.push('M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2));
    } else {
      points.push('L ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2));
    }
    points.push('L ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2));
    points.push('Q ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) + ' ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2));
    points.push('L ' + p4[0].toFixed(2) + ' ' + p4[1].toFixed(2));
  }
  return points.join(' ') + ' Z';
})();

// 14. High-Precision 130 Hobby DC Motor (Autodesk Tinkercad Style with Center Yellow Cog & 3 Faceplate Holes)
export const TinkerDCMotor = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  isSpinning = false,
  isBurnedOut = false,
  isOverdriven = false,
  direction = 'cw',
  rpm = 0,
  voltage = 0,
  onPinClick,
  onMouseDown
}) => {
  // Slower, smooth and visible rotation pace (teeth clearly distinguishable without strobe)
  const animDuration = rpm && rpm > 0
    ? `${Math.max(1.15, Math.min(2.8, 16000 / (rpm || 6000))).toFixed(2)}s`
    : '1.8s';

  const compId = `dc-motor-${Math.round(x)}-${Math.round(y)}`;

  // Outer Stamped Metal Bevel Path (Authentic 130 Hobby Motor Barrel Canister Profile)
  const canOuterPath = "M -16 -24 L 16 -24 C 26 -24, 35 -14, 35 0 C 35 14, 26 24, 16 24 L -16 24 C -26 24, -35 14, -35 0 C -35 -14, -26 -24, -16 -24 Z";

  // Inner Recessed Faceplate Path (Uniform 3.2px chamfered rim bevel)
  const canInnerPath = "M -14.5 -20.8 L 14.5 -20.8 C 23.5 -20.8, 31.8 -12, 31.8 0 C 31.8 12, 23.5 20.8, 14.5 20.8 L -14.5 20.8 C -23.5 20.8, -31.8 12, -31.8 0 C -31.8 -12, -23.5 -20.8, -14.5 -20.8 Z";

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{
        filter: isSelected ? 'drop-shadow(0 0 12px #347F7A)' : undefined
      }}
    >
      <defs>
        {/* Outer Bevel Frame Metal Gradient (Machined Steel Chamfer) */}
        <linearGradient id={`dc-can-rim-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4D4D8" />
          <stop offset="35%" stopColor="#B4B4B8" />
          <stop offset="70%" stopColor="#9C9C9E" />
          <stop offset="100%" stopColor="#7E7E84" />
        </linearGradient>

        {/* Brushed Silver Faceplate Gradient (Authentic Galvanized Sheen) */}
        <linearGradient id={`dc-can-face-${compId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E4E4E8" />
          <stop offset="18%" stopColor="#EEEEF2" />
          <stop offset="55%" stopColor="#DADAE0" />
          <stop offset="85%" stopColor="#C7C7CC" />
          <stop offset="100%" stopColor="#B8B8BE" />
        </linearGradient>

        {/* Raised Bearing Bushing Boss Gradient */}
        <linearGradient id={`dc-boss-silver-${compId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Golden-Yellow Cog Gear Radial Gradient */}
        <radialGradient id={`dc-gear-gold-${compId}`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>

        {/* Sintered Bronze / Brass Bushing Core */}
        <radialGradient id={`dc-hub-brass-${compId}`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>

      {/* 1. Ambient Drop Shadow underneath the entire motor */}
      <path d={canOuterPath} fill="rgba(0,0,0,0.22)" transform="translate(0, 3)" />

      {/* 2. 4-LAYER 3D METALLIC LEADS (Identical to LED, Resistor, Diode) */}
      {/* Lead Layer 1: Ambient Drop Shadows */}
      <path d="M -10 27 L -10 32" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M 10 27 L 10 32" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3.4" strokeLinecap="round" />

      {/* Lead Layer 2: Dark Metallic Outer Edge */}
      <path d="M -10 27 L -10 32" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 10 27 L 10 32" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

      {/* Lead Layer 3: Polished Silver Core */}
      <path d="M -10 27 L -10 32" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />
      <path d="M 10 27 L 10 32" fill="none" stroke="#CBD5E1" strokeWidth="2.0" strokeLinecap="round" />

      {/* Lead Layer 4: Specular Glint Highlight */}
      <path d="M -10 27 L -10 32" fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
      <path d="M 10 27 L 10 32" fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />

      {/* 3. TERMINAL CONTACT PINS AT (-10, 32) AND (10, 32) */}
      {/* Pin 1: Terminal 1 (Negative / Black Boot, Ground) */}
      <circle
        cx="-10"
        cy="32"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_1', -10, 32);
        }}
      >
        <title>Terminal 1</title>
      </circle>
      <circle cx="-10" cy="32" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="-10.8" cy="31.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* Pin 2: Terminal 2 (Positive / Red Boot, Power) */}
      <circle
        cx="10"
        cy="32"
        r="3.8"
        fill="#E2E8F0"
        stroke="#4A5568"
        strokeWidth="1.2"
        className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
        onClick={e => {
          e.stopPropagation();
          onPinClick && onPinClick('pin_2', 10, 32);
        }}
      >
        <title>Terminal 2</title>
      </circle>
      <circle cx="10" cy="32" r="1.5" fill="#64748B" pointerEvents="none" />
      <circle cx="9.2" cy="31.2" r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />

      {/* 4. MOTOR BODY & HOUSING (Subtle vibration shake when running) */}
      <g>
        {isSpinning && !isBurnedOut && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0.15,-0.1; -0.15,0.12; 0.1,0.08; 0,0"
            dur="0.055s"
            repeatCount="indefinite"
          />
        )}

        {/* Plastic End-Bell Base Frame (Bottom Molded Cavity) */}
        <rect x="-17" y="21.5" width="34" height="4.5" rx="1.5" fill="#1E2228" stroke="#0F141C" strokeWidth="0.6" />

        {/* Left Terminal Insulator Boot (Black, Negative - Molded 2-Tier) */}
        <rect x="-14" y="22" width="8" height="5.5" rx="1.4" fill="#18181B" stroke="#09090B" strokeWidth="0.6" />
        <rect x="-14.5" y="24" width="9" height="1.8" rx="0.5" fill="#27272A" />

        {/* Right Terminal Insulator Boot (Red, Positive - Molded 2-Tier) */}
        <rect x="6" y="22" width="8" height="5.5" rx="1.4" fill="#DC2626" stroke="#991B1B" strokeWidth="0.6" />
        <rect x="5.5" y="24" width="9" height="1.8" rx="0.5" fill="#EF4444" />

        {/* Outer Stamped Metal Bevel Shell (Machined Chamfer Rim) */}
        <path
          d={canOuterPath}
          fill={`url(#dc-can-rim-${compId})`}
          stroke="#68686E"
          strokeWidth="0.6"
        />

        {/* Inner Recessed Faceplate (Brushed Metal Surface with 3D Depth) */}
        <path
          d={canInnerPath}
          fill={`url(#dc-can-face-${compId})`}
          stroke="#FFFFFF"
          strokeWidth="0.6"
          opacity="0.95"
        />

        {/* Cylindrical Sheen Reflections across Canister Face */}
        <ellipse cx="-23" cy="0" rx="4" ry="18" fill="#FFFFFF" opacity="0.12" pointerEvents="none" />
        <ellipse cx="23" cy="0" rx="4" ry="18" fill="#000000" opacity="0.06" pointerEvents="none" />

        {/* Side Crimp Notches (Signature Stamped Magnet Restraints on 130 Motors) */}
        <rect x="-34.2" y="-3.5" width="2.4" height="7" rx="0.8" fill="#88888D" stroke="#606065" strokeWidth="0.5" />
        <line x1="-33" y1="-2.5" x2="-33" y2="2.5" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />
        <rect x="31.8" y="-3.5" width="2.4" height="7" rx="0.8" fill="#88888D" stroke="#606065" strokeWidth="0.5" />
        <line x1="33" y1="-2.5" x2="33" y2="2.5" stroke="#48484D" strokeWidth="0.5" opacity="0.6" />

        {/* 3 Dark Circular Mounting / Vent Holes (Top, Left, Right - Countersunk Stamped) */}
        {/* Top Hole */}
        <circle cx="0" cy="-14.8" r="5" fill="#28282B" stroke="#48484D" strokeWidth="0.6" />
        <circle cx="0" cy="-15.3" r="4.3" fill="#18181A" opacity="0.75" />
        <path d="M -4.2 -13.6 A 4.8 4.8 0 0 0 4.2 -13.6" fill="none" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.45" />

        {/* Left Hole */}
        <circle cx="-21.5" cy="0" r="5" fill="#28282B" stroke="#48484D" strokeWidth="0.6" />
        <circle cx="-21.5" cy="-0.5" r="4.3" fill="#18181A" opacity="0.75" />
        <path d="M -25.7 1.2 A 4.8 4.8 0 0 0 -17.3 1.2" fill="none" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.45" />

        {/* Right Hole */}
        <circle cx="21.5" cy="0" r="5" fill="#28282B" stroke="#48484D" strokeWidth="0.6" />
        <circle cx="21.5" cy="-0.5" r="4.3" fill="#18181A" opacity="0.75" />
        <path d="M 17.3 1.2 A 4.8 4.8 0 0 0 25.7 1.2" fill="none" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.45" />

        {/* Raised Bearing Bushing Boss Extruded from Faceplate */}
        <circle cx="0" cy="0" r="9" fill={`url(#dc-boss-silver-${compId})`} stroke="#64748B" strokeWidth="0.7" />
        <circle cx="0" cy="0" r="7.2" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />
        <circle cx="0" cy="0" r="6" fill={`url(#dc-hub-brass-${compId})`} stroke="#92400E" strokeWidth="0.6" />

        {/* 5. CENTER YELLOW COG / PINION GEAR WHEEL (Spins when active at relaxed slow pace) */}
        <g id={`gear-${compId}`}>
          {isSpinning && !isBurnedOut && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={direction === 'ccw' ? '360 0 0' : '0 0 0'}
              to={direction === 'ccw' ? '0 0 0' : '360 0 0'}
              dur={animDuration}
              repeatCount="indefinite"
            />
          )}

          {/* Gear Drop Shadow onto Faceplate & Hub Boss */}
          <path
            d={DC_MOTOR_GEAR_PATH}
            fill="rgba(0,0,0,0.18)"
            transform="translate(0, 1.4)"
          />

          {/* 12-Tooth Smooth Involute Yellow Cog Wheel */}
          <path
            d={DC_MOTOR_GEAR_PATH}
            fill={`url(#dc-gear-gold-${compId})`}
            stroke="#D97706"
            strokeWidth="0.75"
            strokeLinejoin="round"
          />

          {/* Center Brass Bushing Core & Steel Motor Shaft */}
          <circle cx="0" cy="0" r="4.2" fill={`url(#dc-hub-brass-${compId})`} stroke="#78350F" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="1.8" fill="#475569" stroke="#1E293B" strokeWidth="0.4" />
          <circle cx="-0.6" cy="-0.6" r="0.6" fill="#FFFFFF" opacity="0.9" />
        </g>

        {/* Overdriven Voltage Warning Sparks */}
        {isOverdriven && !isBurnedOut && (
          <g pointerEvents="none">
            <line x1="-10" y1="20" x2="-14" y2="24" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="20" x2="14" y2="24" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {/* Overvoltage Burnout Char & Residue Overlay */}
        {isBurnedOut && (
          <g pointerEvents="none">
            <path d={canOuterPath} fill="rgba(24, 24, 27, 0.82)" />
            <circle cx="0" cy="0" r="13" fill="rgba(24, 24, 27, 0.88)" />
            <text x="0" y="2.5" textAnchor="middle" fill="#EF4444" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">
              BURNT
            </text>
          </g>
        )}
      </g>
    </g>
  );
});





// 15. Arduino Uno R3 – Authentic Arduino Contour Shape
export const TinkerArduinoUno = memo(({
  x = 0, y = 0, rotation = 0,
  isSelected = false, isOn = false, lLedState = false,
  txLedState = false, rxLedState = false,
  onPinClick, onMouseDown
}) => {
  const id = `uno-${Math.round(x)}-${Math.round(y)}`;

  // ── Dimensions & Layout Grid ─────────────────────────────────────────
  // Board: 290 × 184 px (W=145, H=92), centered at (0, 0)
  const W = 145, H = 92;
  const P = 13;      // pitch between pin centers
  const TY = -78;    // top header pin center (inside board, 14px from top edge -92)
  const BY = 78;     // bottom header pin center (inside board, 14px from bottom edge +92)
  const TLBY = -62;  // top silkscreen label y (horizontal text, below top header)
  const BLBY = 62;   // bottom silkscreen label y (horizontal text, above bottom header)

  // ── Authentic Stepped Arduino Uno PCB Contour with Smooth Rounded Corners ──
  const pcbPath = `
    M -138 -92
    L 125 -92
    Q 128 -92 130 -89.5
    L 132.5 -87
    Q 134 -85 134 -82.5
    L 134 -48.5
    Q 134 -46.5 136 -45
    L 143 -39
    Q 145 -37.5 145 -35
    L 145 71
    Q 145 73.5 143 75
    L 136 81
    Q 134 82.5 134 84.5
    L 134 87.5
    Q 134 92 129 92
    L -138 92
    A 7 7 0 0 1 -145 85
    L -145 -85
    A 7 7 0 0 1 -138 -92
    Z
  `.replace(/\s+/g, ' ').trim();

  // ── Top Digital Header Left (10 pins, start x = -113) ───────────────
  const DL0 = -113;
  const digLeft = [
    { key: 'pin_scl',   lb: 'SCL',  tip: 'SCL – I²C Clock' },
    { key: 'pin_sda',   lb: 'SDA',  tip: 'SDA – I²C Data' },
    { key: 'pin_aref',  lb: 'AREF', tip: 'AREF – Analog Reference' },
    { key: 'pin_gnd_3', lb: 'GND',  tip: 'GND – Ground' },
    { key: 'pin_13',    lb: '13',   tip: 'D13 – SCK / Built-in LED L' },
    { key: 'pin_12',    lb: '12',   tip: 'D12 – MISO' },
    { key: 'pin_11',    lb: '~11',  tip: 'D11 – PWM / MOSI' },
    { key: 'pin_10',    lb: '~10',  tip: 'D10 – PWM / SS' },
    { key: 'pin_9',     lb: '~9',   tip: 'D9 – PWM' },
    { key: 'pin_8',     lb: '8',    tip: 'D8 – Digital Pin 8' }
  ].map((p, i) => ({ ...p, cx: DL0 + i * P }));

  // ── Top Digital Header Right (8 pins, start x = 24) ─────────────────
  const DR0 = 24;
  const digRight = [
    { key: 'pin_7',  lb: '7',   tip: 'D7 – Digital Pin 7' },
    { key: 'pin_6',  lb: '~6',  tip: 'D6 – PWM' },
    { key: 'pin_5',  lb: '~5',  tip: 'D5 – PWM' },
    { key: 'pin_4',  lb: '4',   tip: 'D4 – Digital Pin 4' },
    { key: 'pin_3',  lb: '~3',  tip: 'D3 – PWM / External Interrupt 1' },
    { key: 'pin_2',  lb: '2',   tip: 'D2 – External Interrupt 0' },
    { key: 'pin_1',  lb: 'TX▶1', tip: 'D1 – UART TX' },
    { key: 'pin_0',  lb: 'RX◀0', tip: 'D0 – UART RX' }
  ].map((p, i) => ({ ...p, cx: DR0 + i * P }));

  // ── Bottom Power Header (8 pins, start x = -67) ─────────────────────
  const PW0 = -67;
  const powPins = [
    { key: 'pin_nc',    lb: 'NC',    tip: 'NC – Not Connected' },
    { key: 'pin_ioref', lb: 'IOREF', tip: 'IOREF – I/O Voltage Reference' },
    { key: 'pin_reset', lb: 'RESET', tip: 'RESET – Active Low Reset' },
    { key: 'pin_3v3',   lb: '3.3V',  tip: '3.3V Power Output (50mA max)' },
    { key: 'pin_5v',    lb: '5V',    tip: '5V Power Output (Regulated)' },
    { key: 'pin_gnd_1', lb: 'GND',   tip: 'GND – Ground' },
    { key: 'pin_gnd_2', lb: 'GND',   tip: 'GND – Ground' },
    { key: 'pin_vin',   lb: 'VIN',   tip: 'VIN – Unregulated 7–12V Input' }
  ].map((p, i) => ({ ...p, cx: PW0 + i * P }));

  // ── Bottom Analog Header (6 pins, start x = 50) ─────────────────────
  const AN0 = 50;
  const anaPins = [
    { key: 'pin_a0', lb: 'A0', tip: 'A0 – Analog Input 0' },
    { key: 'pin_a1', lb: 'A1', tip: 'A1 – Analog Input 1' },
    { key: 'pin_a2', lb: 'A2', tip: 'A2 – Analog Input 2' },
    { key: 'pin_a3', lb: 'A3', tip: 'A3 – Analog Input 3' },
    { key: 'pin_a4', lb: 'A4', tip: 'A4 – Analog Input 4 (SDA)' },
    { key: 'pin_a5', lb: 'A5', tip: 'A5 – Analog Input 5 (SCL)' }
  ].map((p, i) => ({ ...p, cx: AN0 + i * P }));

  // ── Interactive Pin Socket Renderer ─────────────────────────────────
  const renderSocket = (p, cy, isTop) => {
    const isLongText = p.lb.length > 3;
    const labelY = isTop ? TLBY : BLBY;
    return (
      <g key={p.key} className="group">
        {/* Socket square aperture */}
        <rect
          x={p.cx - 5.2}
          y={cy - 5.2}
          width="10.4"
          height="10.4"
          rx="1.6"
          fill="#0D0F14"
          stroke="#272A36"
          strokeWidth="0.8"
        />
        {/* Inner cavity hole */}
        <circle cx={p.cx} cy={cy} r="3.4" fill="#060709" />
        {/* Metallic contact ring */}
        <circle cx={p.cx} cy={cy} r="2.3" fill="#94A3B8" stroke="#475569" strokeWidth="0.7" />
        {/* Specular highlight */}
        <circle cx={p.cx - 0.7} cy={cy - 0.7} r="0.6" fill="#FFFFFF" opacity="0.5" pointerEvents="none" />

        {/* Clickable hit area with hover glow */}
        <circle
          cx={p.cx}
          cy={cy}
          r="5.5"
          fill="transparent"
          stroke="transparent"
          strokeWidth="2"
          className="cursor-crosshair transition-all duration-150 hover:stroke-cyan-400 hover:fill-cyan-400/25"
          onClick={e => {
            e.stopPropagation();
            onPinClick?.(p.key);
          }}
        >
          <title>{p.tip}</title>
        </circle>

        {/* Horizontal silkscreen label */}
        <text
          x={p.cx}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          fontSize={isLongText ? "3.9" : "4.7"}
          fontWeight="700"
          fontFamily="'JetBrains Mono', Consolas, ui-monospace, monospace"
          opacity="0.95"
          letterSpacing="-0.2"
        >
          {p.lb}
        </text>
      </g>
    );
  };

  return (
    <g
      transform={`translate(${x},${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{ filter: isSelected ? 'drop-shadow(0 0 16px rgba(6,182,212,0.85))' : undefined }}
    >
      <defs>
        {/* PCB authentic Arduino teal gradient */}
        <linearGradient id={`uno-pcb-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E989E" />
          <stop offset="45%" stopColor="#008187" />
          <stop offset="100%" stopColor="#005B60" />
        </linearGradient>

        {/* Silver metallic metal for USB housing, crystal, leads */}
        <linearGradient id={`uno-metal-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Gold annular ring gradient for M3 holes & ICSP */}
        <radialGradient id={`uno-gold-${id}`} cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </radialGradient>

        {/* IC package body gradient */}
        <linearGradient id={`uno-ic-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D323E" />
          <stop offset="100%" stopColor="#151821" />
        </linearGradient>

        {/* Header plastic housing gradient */}
        <linearGradient id={`uno-header-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#252A36" />
          <stop offset="15%" stopColor="#171A22" />
          <stop offset="85%" stopColor="#101218" />
          <stop offset="100%" stopColor="#090A0D" />
        </linearGradient>

        {/* Gloss highlight overlay */}
        <linearGradient id={`uno-gloss-${id}`} x1="0%" y1="0%" x2="0%" y2="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* ── Drop Shadow ── */}
      <path
        d={pcbPath}
        fill="rgba(0,0,0,0.35)"
        transform="translate(4, 6)"
      />

      {/* ── PCB Body (Authentic Stepped Shape with Rounded Corners) ── */}
      <path
        d={pcbPath}
        fill={`url(#uno-pcb-${id})`}
        stroke="#004347"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Gloss overlay */}
      <path d={pcbPath} fill={`url(#uno-gloss-${id})`} />

      {/* ── Copper Ground Plane & Traces (decorative silkscreen) ── */}
      <g opacity="0.12" stroke="#FFFFFF" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <path d="M -120 -40 L -90 -40 L -75 -24" />
        <path d="M -70 8 L -40 8 L -24 24" />
        <path d="M 30 -50 L 65 -50 L 80 -35" />
        <path d="M 35 -15 L 75 -15 L 90 0" />
        <path d="M -105 28 L -75 28 L -60 42" />
        <path d="M 20 38 L 55 38 L 70 24" />
      </g>

      {/* ── 4 × M3 Gold Annular Mounting Holes ── */}
      {[[-128, -60], [130, -18], [-88, 58], [130, 68]].map(([mx, my], i) => (
        <g key={`mh-${i}`}>
          <circle cx={mx} cy={my} r="5.8" fill={`url(#uno-gold-${id})`} stroke="#713F12" strokeWidth="0.6" />
          <circle cx={mx} cy={my} r="3.7" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
          <circle cx={mx} cy={my} r="2.5" fill="#0F172A" />
        </g>
      ))}

      {/* ── USB Type-B Connector (Top-Down View, Cable Plugs in from Left) ── */}
      <g>
        {/* Ground mounting solder tabs under shield */}
        <circle cx={-W + 6} cy={-45} r="4.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" />
        <circle cx={-W + 6} cy={-45} r="2.0" fill="#334155" />
        <circle cx={-W + 6} cy={-11} r="4.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" />
        <circle cx={-W + 6} cy={-11} r="2.0" fill="#334155" />

        {/* Drop shadow */}
        <rect x={-W - 16} y={-43} width="36" height="34" rx="2" fill="rgba(0,0,0,0.25)" />

        {/* Main metallic silver casing (viewed from above) */}
        <rect
          x={-W - 16}
          y={-45}
          width="36"
          height="34"
          rx="2"
          fill="#E2E8F0"
          stroke="#64748B"
          strokeWidth="0.8"
        />
        {/* Bottom edge shadow (subtle 3D depth) */}
        <rect x={-W - 16} y={-14} width="36" height="3" fill="#94A3B8" rx="0.5" />

        {/* Left mouth rim (facing left towards the incoming USB cable) */}
        <rect x={-W - 18} y={-44} width="3.5" height="32" rx="1" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" />
        <line x1={-W - 17} y1={-42} x2={-W - 17} y2={-14} stroke="#334155" strokeWidth="1.2" />

        {/* Subtle top surface weld/seam line on right side */}
        <line x1={-W + 15} y1={-37} x2={-W + 15} y2={-21} stroke="#94A3B8" strokeWidth="0.9" />
      </g>

      {/* ── DC Power Barrel Jack (Top-Down View, Plug Enters from Left) ── */}
      <g>
        {/* Rear solder pin terminal on PCB */}
        <rect x={-W + 22} y={43} width="4" height="4" rx="0.8" fill="#CBD5E1" stroke="#475569" strokeWidth="0.5" />

        {/* Drop shadow */}
        <rect x={-W - 16} y={30} width="42" height="30" rx="2" fill="rgba(0,0,0,0.3)" />

        {/* Front collar (protruding outside board to the left where barrel plug inserts) */}
        <rect
          x={-W - 16}
          y={28}
          width="9"
          height="34"
          rx="2"
          fill="#181B22"
          stroke="#0F1116"
          strokeWidth="0.8"
        />
        {/* Leftmost socket aperture slit (facing left) */}
        <rect x={-W - 17} y={32} width="2" height="26" rx="0.8" fill="#090A0D" />

        {/* Main barrel jack body (sitting on PCB) */}
        <rect
          x={-W - 7}
          y={31}
          width="32"
          height="28"
          rx="2.5"
          fill="#252830"
          stroke="#111317"
          strokeWidth="0.8"
        />
        {/* Cylindrical surface highlight across the top */}
        <rect x={-W - 6} y={34} width="29" height="5" rx="1" fill="rgba(255,255,255,0.06)" />
        {/* Cylindrical bottom shadow */}
        <rect x={-W - 6} y={54} width="29" height="4" rx="1" fill="rgba(0,0,0,0.2)" />
      </g>

      {/* ── Reset Button (top-left tactile switch) ── */}
      <g>
        <rect
          x={-135}
          y={-85}
          width="13"
          height="13"
          rx="2"
          fill={`url(#uno-metal-${id})`}
          stroke="#475569"
          strokeWidth="0.7"
        />
        <circle cx={-128.5} cy={-78.5} r="4.2" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
        <circle cx={-129.5} cy={-79.5} r="1.4" fill="#FCA5A5" opacity="0.75" />
        <text
          x={-128.5}
          y={-69}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="3.2"
          fontWeight="bold"
          fontFamily="sans-serif"
          opacity="0.8"
        >
          RESET
        </text>
      </g>

      {/* ── ATmega16U2 (USB controller IC, QFP-32) ── */}
      <g>
        <rect
          x={-102}
          y={-47}
          width="16"
          height="16"
          rx="1.5"
          fill={`url(#uno-ic-${id})`}
          stroke="#0F1117"
          strokeWidth="0.6"
        />
        <circle cx={-100} cy={-45} r="1.0" fill="#64748B" />
        {/* Leads on 4 sides */}
        {[-3.5, 0, 3.5].map(d => (
          <g key={d}>
            <rect x={-94 + d - 1} y={-50} width="2" height="3" fill="#94A3B8" />
            <rect x={-94 + d - 1} y={-31} width="2" height="3" fill="#94A3B8" />
          </g>
        ))}
        <text
          x={-94}
          y={-38}
          textAnchor="middle"
          fill="#64748B"
          fontSize="2.8"
          fontFamily="monospace"
        >
          16U2
        </text>
      </g>

      {/* ── 16.000 MHz Crystal Oscillator ── */}
      <g>
        <rect
          x={-72}
          y={-39}
          width="24"
          height="11"
          rx="5.5"
          fill={`url(#uno-metal-${id})`}
          stroke="#64748B"
          strokeWidth="0.7"
        />
        <rect x={-69} y={-36.5} width="18" height="6" rx="3" fill="#E2E8F0" />
        <text
          x={-60}
          y={-32}
          textAnchor="middle"
          fill="#334155"
          fontSize="3.2"
          fontWeight="bold"
          fontFamily="monospace"
        >
          16.000
        </text>
      </g>

      {/* ── AMS1117 Voltage Regulator (SOT-223) ── */}
      <g>
        <rect
          x={-104}
          y={14}
          width="16"
          height="13"
          rx="1.5"
          fill={`url(#uno-ic-${id})`}
          stroke="#0B0D12"
          strokeWidth="0.5"
        />
        <rect x={-102} y={11} width="12" height="3.5" rx="0.8" fill="#94A3B8" />
        {[0, 5, 10].map(d => (
          <rect key={d} x={-103 + d} y={26} width="2.4" height="4.5" rx="0.4" fill="#94A3B8" />
        ))}
      </g>

      {/* ── Main MCU: ATmega328P-PU (DIP-28) ── */}
      <g>
        {/* IC Socket body */}
        <rect
          x={-10}
          y={-2}
          width="88"
          height="34"
          rx="2.5"
          fill="#0C0E14"
          stroke="#050608"
          strokeWidth="0.9"
        />
        {/* 14 Pins on top & bottom */}
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <rect x={-6 + i * 5.85} y={-4.5} width="2.6" height="3.5" rx="0.3" fill="#94A3B8" />
            <rect x={-6 + i * 5.85} y={31} width="2.6" height="3.5" rx="0.3" fill="#94A3B8" />
          </g>
        ))}
        {/* IC Plastic DIP package */}
        <rect
          x={-7}
          y={1.5}
          width="82"
          height="27"
          rx="2"
          fill={`url(#uno-ic-${id})`}
          stroke="#090B10"
          strokeWidth="0.6"
        />
        {/* Notch on left */}
        <path d="M -7 11 A 4 4 0 0 1 -7 19" fill="#0C0E14" stroke="#050608" strokeWidth="0.5" />
        <circle cx="-3" cy="5.5" r="1.1" fill="#475569" />
        {/* Silkscreen text */}
        <text
          x="34"
          y="13"
          textAnchor="middle"
          fill="#CBD5E1"
          fontSize="5.2"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.4"
        >
          ATMEGA328P-PU
        </text>
        <text
          x="34"
          y="22"
          textAnchor="middle"
          fill="#64748B"
          fontSize="3.8"
          fontFamily="monospace"
        >
          ATMEL 1542
        </text>
      </g>

      {/* ── Status Indicator LEDs (L, ON, TX, RX) ── */}
      {/* L LED – D13 status indicator */}
      <g>
        <rect x={-22} y={-41} width="7.5" height="5.5" rx="1" fill="#181B22" stroke="#0F1117" strokeWidth="0.4" />
        <circle
          cx={-18.2}
          cy={-38.2}
          r="2.2"
          fill={lLedState ? '#FACC15' : '#713F12'}
          style={{ filter: lLedState ? 'drop-shadow(0 0 6px #FACC15)' : undefined }}
        />
        <text x={-18.2} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize="3.5" fontWeight="bold" fontFamily="sans-serif">
          L
        </text>
      </g>

      {/* TX LED */}
      <g>
        <rect x={-2} y={-41} width="7.5" height="5.5" rx="1" fill="#181B22" stroke="#0F1117" strokeWidth="0.4" />
        <circle
          cx={1.8}
          cy={-38.2}
          r="2.0"
          fill={txLedState ? '#EA580C' : '#431407'}
          style={{ filter: txLedState ? 'drop-shadow(0 0 5px #EA580C)' : undefined }}
        />
        <text x={1.8} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize="3.2" fontWeight="bold" fontFamily="sans-serif">
          TX
        </text>
      </g>

      {/* RX LED */}
      <g>
        <rect x={10} y={-41} width="7.5" height="5.5" rx="1" fill="#181B22" stroke="#0F1117" strokeWidth="0.4" />
        <circle
          cx={13.8}
          cy={-38.2}
          r="2.0"
          fill={rxLedState ? '#EA580C' : '#431407'}
          style={{ filter: rxLedState ? 'drop-shadow(0 0 5px #EA580C)' : undefined }}
        />
        <text x={13.8} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize="3.2" fontWeight="bold" fontFamily="sans-serif">
          RX
        </text>
      </g>

      {/* ON LED – Power indicator */}
      <g>
        <rect x={22} y={-41} width="7.5" height="5.5" rx="1" fill="#181B22" stroke="#0F1117" strokeWidth="0.4" />
        <circle
          cx={25.8}
          cy={-38.2}
          r="2.2"
          fill={isOn ? '#22C55E' : '#14532D'}
          style={{ filter: isOn ? 'drop-shadow(0 0 6px #22C55E)' : undefined }}
        />
        <text x={25.8} y={-31} textAnchor="middle" fill="#FFFFFF" fontSize="3.5" fontWeight="bold" fontFamily="sans-serif">
          ON
        </text>
      </g>

      {/* ── ICSP 2×3 Header ── */}
      <g transform="translate(120, 6)">
        <rect x={-7} y={-11} width="14" height="22" rx="1.8" fill="#101217" stroke="#08090C" strokeWidth="0.6" />
        {[-3.5, 3.5].map((px, ri) =>
          [-7, 0, 7].map((py, ci) => (
            <circle
              key={`${ri}-${ci}`}
              cx={px}
              cy={py}
              r="2.0"
              fill={`url(#uno-gold-${id})`}
              stroke="#713F12"
              strokeWidth="0.4"
            />
          ))
        )}
      </g>

      {/* ── Arduino Branding & ∞ Logo ── */}
      <g transform="translate(75, -36)">
        {/* Infinity logo */}
        <g stroke="#FFFFFF" strokeWidth="1.6" fill="none">
          <circle cx={-5.5} cy={-8} r="5.2" />
          <circle cx={5.5} cy={-8} r="5.2" />
          <line x1={-8} y1={-8} x2={-3} y2={-8} strokeWidth="1.1" />
          <line x1={3} y1={-8} x2={8} y2={-8} strokeWidth="1.1" />
          <line x1={5.5} y1={-10.5} x2={5.5} y2={-5.5} strokeWidth="1.1" />
        </g>
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.8"
        >
          ARDUINO
        </text>
        <text
          x="-5"
          y="16"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="12.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.4"
        >
          UNO
        </text>
        <text
          x="12"
          y="16"
          textAnchor="start"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          R3
        </text>
        <text
          x="0"
          y="23"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="3.4"
          fontWeight="600"
          fontFamily="sans-serif"
          opacity="0.75"
          letterSpacing="0.5"
        >
          MADE IN ITALY
        </text>
      </g>

      {/* ── Silkscreen Section Labels ── */}
      {/* Top Header Section Title */}
      <text
        x="6"
        y="-52"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="3.8"
        fontWeight="700"
        fontFamily="sans-serif"
        opacity="0.65"
        letterSpacing="0.5"
      >
        ━━━ DIGITAL (PWM ~) ━━━
      </text>

      {/* Bottom Power Title */}
      <text
        x="-21"
        y="52"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="3.8"
        fontWeight="700"
        fontFamily="sans-serif"
        opacity="0.65"
        letterSpacing="0.5"
      >
        ━━ POWER ━━
      </text>

      {/* Bottom Analog Title */}
      <text
        x="82"
        y="52"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="3.8"
        fontWeight="700"
        fontFamily="sans-serif"
        opacity="0.65"
        letterSpacing="0.5"
      >
        ━━ ANALOG IN ━━
      </text>

      {/* ── Female Header Plastic Housings ── */}
      {/* Top Digital Left Header Strip (10 pins) */}
      <rect
        x={DL0 - 6.5}
        y={TY - 8}
        width={9 * P + 13}
        height="16"
        rx="2"
        fill={`url(#uno-header-${id})`}
        stroke="#1E232E"
        strokeWidth="0.8"
      />

      {/* Top Digital Right Header Strip (8 pins) */}
      <rect
        x={DR0 - 6.5}
        y={TY - 8}
        width={7 * P + 13}
        height="16"
        rx="2"
        fill={`url(#uno-header-${id})`}
        stroke="#1E232E"
        strokeWidth="0.8"
      />

      {/* Bottom Power Header Strip (8 pins) */}
      <rect
        x={PW0 - 6.5}
        y={BY - 8}
        width={7 * P + 13}
        height="16"
        rx="2"
        fill={`url(#uno-header-${id})`}
        stroke="#1E232E"
        strokeWidth="0.8"
      />

      {/* Bottom Analog Header Strip (6 pins) */}
      <rect
        x={AN0 - 6.5}
        y={BY - 8}
        width={5 * P + 13}
        height="16"
        rx="2"
        fill={`url(#uno-header-${id})`}
        stroke="#1E232E"
        strokeWidth="0.8"
      />

      {/* ── All 32 Interactive Pins & Horizontal Labels ── */}
      {digLeft.map(p => renderSocket(p, TY, true))}
      {digRight.map(p => renderSocket(p, TY, true))}
      {powPins.map(p => renderSocket(p, BY, false))}
      {anaPins.map(p => renderSocket(p, BY, false))}
    </g>
  );
});

// 18. NPN Bipolar Junction Transistor (BJT NPN in Authentic TO-92 Package)
export const TinkerTransistorNpn = memo(({
  x = 0,
  y = 0,
  rotation = 0,
  isSelected = false,
  model = 'NPN',
  isConducting = false,
  isSaturated = false,
  currentMa = 0,
  baseCurrentMa = 0,
  onPinClick,
  onMouseDown
}) => {
  const compId = `transistor-npn-${Math.round(x)}-${Math.round(y)}`;

  // Authentic TO-92 3-Pin Breadboard Spacing:
  // Pin 1 (Left): Collector (C) at (-14, 28)
  // Pin 2 (Center): Base (B) at (0, 28)
  // Pin 3 (Right): Emitter (E) at (14, 28)
  const pins = [
    {
      key: 'pin_c',
      x: -14,
      y: 28,
      name: 'Collector (C)',
      title: 'Collector (C) – Connects to positive load/circuit'
    },
    {
      key: 'pin_b',
      x: 0,
      y: 28,
      name: 'Base (B)',
      title: 'Base (B) – Control input (turns ON at ~0.7V)'
    },
    {
      key: 'pin_e',
      x: 14,
      y: 28,
      name: 'Emitter (E)',
      title: 'Emitter (E) – Connects to Ground/negative rail'
    }
  ];

  // Metallic Stamped Leads:
  // Collector cranks smoothly from (-7, 8) out to (-14, 28)
  const leadCPath = "M -7 8 L -7 13 C -7 17, -14 16, -14 20 L -14 28";
  // Base drops straight from (0, 8) to (0, 28)
  const leadBPath = "M 0 8 L 0 28";
  // Emitter cranks smoothly from (7, 8) out to (14, 28)
  const leadEPath = "M 7 8 L 7 13 C 7 17, 14 16, 14 20 L 14 28";

  return (
    <g
      transform={`translate(${x},${y}) rotate(${rotation})`}
      onMouseDown={onMouseDown}
      className="cursor-move select-none"
      style={{
        filter: isSelected
          ? 'drop-shadow(0 0 10px #347F7A)'
          : 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))'
      }}
    >
      <defs>
        {/* TO-92 Molded Black Epoxy Cylindrical Body Gradient */}
        <linearGradient id={`to92-body-${compId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#373B46" />
          <stop offset="25%" stopColor="#252830" />
          <stop offset="70%" stopColor="#15171C" />
          <stop offset="100%" stopColor="#0B0C0E" />
        </linearGradient>

        {/* Flat Face Front Facet Gradient */}
        <linearGradient id={`to92-face-${compId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15171D" />
          <stop offset="20%" stopColor="#2A2F3B" />
          <stop offset="75%" stopColor="#1E222A" />
          <stop offset="100%" stopColor="#121419" />
        </linearGradient>

        {/* Polished Silver Lead Core Gradient */}
        <linearGradient id={`to92-lead-${compId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="45%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Active Conducting Semiconductor Aura Glow */}
        <radialGradient id={`to92-glow-${compId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.45)" />
          <stop offset="60%" stopColor="rgba(16,185,129,0.18)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </radialGradient>
      </defs>

      {/* ── Active Semiconductor Glow (when forward-biased & conducting) ── */}
      {isConducting && (
        <circle cx="0" cy="-6" r="28" fill={`url(#to92-glow-${compId})`} pointerEvents="none" />
      )}

      {/* ── 3 Metallic Stamped Lead Wires (Tinkercad 4-Pass Shading) ── */}
      {/* Pass 1: Drop Shadow */}
      <g opacity="0.4" transform="translate(1.2, 1.8)">
        <path d={leadCPath} fill="none" stroke="#000000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={leadBPath} fill="none" stroke="#000000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={leadEPath} fill="none" stroke="#000000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Pass 2: Dark Chrome Outer Rim */}
      <path d={leadCPath} fill="none" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={leadBPath} fill="none" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={leadEPath} fill="none" stroke="#475569" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pass 3: Polished Silver Metal Core */}
      <path d={leadCPath} fill="none" stroke={`url(#to92-lead-${compId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={leadBPath} fill="none" stroke={`url(#to92-lead-${compId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={leadEPath} fill="none" stroke={`url(#to92-lead-${compId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pass 4: Longitudinal Specular Centerline Highlight */}
      <path d={leadCPath} fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={leadBPath} fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={leadEPath} fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

      {/* ── TO-92 Epoxy Casing (Slightly Bigger Solid Body) ── */}
      {/* Body Ambient Drop Shadow */}
      <path
        d="M -16.5 8 L -16.5 -6 C -16.5 -20, 16.5 -20, 16.5 -6 L 16.5 8 C 16.5 9.4, -16.5 9.4, -16.5 8 Z"
        fill="rgba(0,0,0,0.32)"
        transform="translate(1.5, 2.5)"
      />

      {/* Main Molded D-Section Cylinder Body */}
      <path
        d="M -16.5 8 L -16.5 -6 C -16.5 -20, 16.5 -20, 16.5 -6 L 16.5 8 C 16.5 9.4, -16.5 9.4, -16.5 8 Z"
        fill={`url(#to92-body-${compId})`}
        stroke="#0D0E12"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Flat Front Face Plate (Characteristic TO-92 Facet) */}
      <rect
        x="-15"
        y="-8.5"
        width="30"
        height="16.5"
        rx="1.8"
        fill={`url(#to92-face-${compId})`}
        stroke="#111317"
        strokeWidth="0.8"
      />

      {/* Upper Chamfer & Bottom Lip */}
      <line x1="-14.5" y1="-8.5" x2="14.5" y2="-8.5" stroke="#374151" strokeWidth="0.6" opacity="0.75" />
      <line x1="-14.5" y1="8" x2="14.5" y2="8" stroke="#07080B" strokeWidth="0.9" />

      {/* Molded Lead Emergence Sockets at Bottom */}
      <rect x="-8.2" y="7.3" width="2.4" height="1.4" rx="0.3" fill="#050608" />
      <rect x="-1.2" y="7.3" width="2.4" height="1.4" rx="0.3" fill="#050608" />
      <rect x="5.8" y="7.3" width="2.4" height="1.4" rx="0.3" fill="#050608" />

      {/* ── Text on Black Body: "NPN" at top, "C B E" below ── */}
      {/* 1. Component Title: "NPN" */}
      <text
        x="0"
        y="-1.8"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="5.6"
        fontWeight="900"
        fontFamily="'JetBrains Mono', Consolas, monospace"
        letterSpacing="1"
      >
        NPN
      </text>

      {/* 2. Pin Tags on Black Body directly below NPN and above each lead: C  B  E */}
      <text
        x="-7"
        y="5.2"
        textAnchor="middle"
        fill="#F43F5E"
        fontSize="4.2"
        fontWeight="900"
        fontFamily="'JetBrains Mono', Consolas, monospace"
      >
        C
      </text>
      <text
        x="0"
        y="5.2"
        textAnchor="middle"
        fill="#38BDF8"
        fontSize="4.2"
        fontWeight="900"
        fontFamily="'JetBrains Mono', Consolas, monospace"
      >
        B
      </text>
      <text
        x="7"
        y="5.2"
        textAnchor="middle"
        fill="#10B981"
        fontSize="4.2"
        fontWeight="900"
        fontFamily="'JetBrains Mono', Consolas, monospace"
      >
        E
      </text>

      {/* Integrated Live State Indicator on Body */}
      {isConducting && (
        <g>
          {/* Subtle Jewel Status Pip on Face */}
          <circle cx="11.5" cy="-5" r="1.6" fill="#10B981" />
          <circle cx="11.5" cy="-5" r="3.2" fill="#34D399" opacity="0.45" className="animate-pulse" />
          <circle cx="11.1" cy="-5.4" r="0.5" fill="#FFFFFF" opacity="0.85" />

          {/* Compact Active Pill Badge floating cleanly above body */}
          <g transform="translate(0, -25)" pointerEvents="none">
            <rect x="-14" y="-5" width="28" height="10" rx="5" fill="#064E3B" stroke="#10B981" strokeWidth="0.9" />
            <circle cx="-8" cy="0" r="1.7" fill="#34D399" className="animate-pulse" />
            <text
              x="3.2"
              y="2.4"
              textAnchor="middle"
              fill="#ECFDF5"
              fontSize="3.8"
              fontWeight="800"
              fontFamily="'JetBrains Mono', Consolas, monospace"
            >
              {isSaturated ? 'ON (SAT)' : 'ACTIVE'}
            </text>
          </g>
        </g>
      )}

      {/* ── 3 Clean Solder Pin Terminals (Matches Tinkercad Standards) ── */}
      {pins.map((pin) => (
        <g key={pin.key}>
          {/* Standard Tinkercad Solder Pin Pad (matches TinkerLED / TinkerRGBLED) */}
          <circle
            cx={pin.x}
            cy={pin.y}
            r="3.8"
            fill="#E2E8F0"
            stroke="#4A5568"
            strokeWidth="1.2"
            className="cursor-crosshair hover:stroke-[#347F7A] hover:fill-teal-100 transition-colors"
            onClick={e => {
              e.stopPropagation();
              onPinClick?.(pin.key, pin.x, pin.y);
            }}
          >
            <title>{pin.title}</title>
          </circle>

          {/* Pin Core Cavity */}
          <circle cx={pin.x} cy={pin.y} r="1.5" fill="#64748B" pointerEvents="none" />

          {/* Specular Highlight Glint */}
          <circle cx={pin.x - 0.8} cy={pin.y - 0.8} r="0.6" fill="#FFFFFF" opacity="0.65" pointerEvents="none" />
        </g>
      ))}
    </g>
  );
});


