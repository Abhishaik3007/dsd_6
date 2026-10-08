import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PanelLeft, Layers } from 'lucide-react';
import { DEFAULT_ARDUINO_CODE } from './engine/arduinoRuntime';

export const COMPONENT_CATALOG = [
  {
    type: 'resistor',
    name: 'Resistor',
    category: 'basic',
    defaultProps: { resistance: 220, rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-res-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAF5E8" />
            <stop offset="40%" stopColor="#DFCCA3" />
            <stop offset="100%" stopColor="#8C7043" />
          </linearGradient>
        </defs>
        {/* 3D Metallic Leads Matching LED */}
        <line x1="3" y1="22" x2="11" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <line x1="33" y1="22" x2="41" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <line x1="3" y1="22" x2="11" y2="22" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="33" y1="22" x2="41" y2="22" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="3" y1="22" x2="11" y2="22" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="33" y1="22" x2="41" y2="22" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="22" x2="11" y2="22" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <line x1="33" y1="22" x2="41" y2="22" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        {/* Terminal Rings (r=1.8) */}
        <circle cx="3" cy="22" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="3" cy="22" r="0.7" fill="#64748B" />
        <circle cx="41" cy="22" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="41" cy="22" r="0.7" fill="#64748B" />
        {/* Ceramic Body with Straight Central Cylinder */}
        <path
          d="M 12 17 C 14 17, 15 18, 17 18 L 27 18 C 29 18, 30 17, 32 17 C 34 17, 34 19, 34 22 C 34 25, 34 27, 32 27 C 30 27, 29 26, 27 26 L 17 26 C 15 26, 14 27, 12 27 C 10 27, 10 25, 10 22 C 10 19, 10 17, 12 17 Z"
          fill="url(#ic-res-body)"
          stroke="#78623A"
          strokeWidth="0.8"
        />
        {/* 4 Crisp Parallel Enameled Bands - Uniform 8px height */}
        <rect x="15" y="18" width="2.2" height="8" rx="0.4" fill="#DC2626" />
        <rect x="19" y="18" width="2.2" height="8" rx="0.4" fill="#DC2626" />
        <rect x="23" y="18" width="2.2" height="8" rx="0.4" fill="#854D0E" />
        <rect x="28" y="18" width="2.2" height="8" rx="0.4" fill="#D4AF37" />
      </svg>
    )
  },
  {
    type: 'led',
    name: 'LED',
    category: 'basic',
    defaultProps: { color: 'red', rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <radialGradient id="ic-led-bulb" cx="36%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="25%" stopColor="#EF4444" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="88%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
        </defs>
        {/* 3D Metallic Leads with Drop Shadow and Center Specular Line (Centered at 18 and 26 around center 22) */}
        <line x1="18" y1="27" x2="18" y2="40" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 26 27 L 26 31 C 26 32.5, 28 33, 28 34.5 C 28 36, 26 36.5, 26 38 L 26 40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        <line x1="18" y1="27" x2="18" y2="40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 26 27 L 26 31 C 26 32.5, 28 33, 28 34.5 C 28 36, 26 36.5, 26 38 L 26 40" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        <line x1="18" y1="27" x2="18" y2="40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 26 27 L 26 31 C 26 32.5, 28 33, 28 34.5 C 28 36, 26 36.5, 26 38 L 26 40" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <line x1="18" y1="27" x2="18" y2="40" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <path d="M 26 27 L 26 31 C 26 32.5, 28 33, 28 34.5 C 28 36, 26 36.5, 26 38 L 26 40" fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />

        {/* Lead Terminal Tips Symmetrically Centered */}
        <circle cx="18" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="26" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />

        {/* Bulb Drop Shadow */}
        <ellipse cx="22" cy="28" rx="8" ry="2.2" fill="rgba(0,0,0,0.18)" />

        {/* 3D Glossy Epoxy Bulb Body (Tinkercad T-1 3/4) */}
        <path
          d="M 14.5 28 L 14.5 25 L 16 25 L 16 16 C 16 9, 28 9, 28 16 L 28 25 L 29.5 25 L 29.5 28 Z"
          fill="url(#ic-led-bulb)"
          stroke="#7F1D1D"
          strokeWidth="0.8"
        />
        {/* Flange Collar Bevel Line */}
        <line x1="16" y1="25" x2="28" y2="25" stroke="rgba(0,0,0,0.2)" strokeWidth="0.7" />
        <line x1="16" y1="25.5" x2="28" y2="25.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
        {/* Curved Specular Highlight */}
        <path d="M 18 16 C 18 11.5, 20.5 10, 22 10" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
        <line x1="14.5" y1="25" x2="14.5" y2="28" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  },
  {
    type: 'led_rgb',
    name: 'LED RGB',
    category: 'basic',
    defaultProps: { common: 'cathode', rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <radialGradient id="ic-rgb-dome" cx="36%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F8FAFC" />
            <stop offset="75%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </radialGradient>
        </defs>

        {/* 4 3D Metallic Leads Matching LED with smooth symmetrical fan-out */}
        <path d="M 18 25 L 18 28 C 18 31, 13 31, 13 34 L 13 40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 20.5 25 L 20.5 28 C 20.5 31, 19 31, 19 34 L 19 40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 23.5 25 L 23.5 28 C 23.5 31, 25 31, 25 34 L 25 40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 26 25 L 26 28 C 26 31, 31 31, 31 34 L 31 40" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M 18 25 L 18 28 C 18 31, 13 31, 13 34 L 13 40" fill="none" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 20.5 25 L 20.5 28 C 20.5 31, 19 31, 19 34 L 19 40" fill="none" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 23.5 25 L 23.5 28 C 23.5 31, 25 31, 25 34 L 25 40" fill="none" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 26 25 L 26 28 C 26 31, 31 31, 31 34 L 31 40" fill="none" stroke="#475569" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M 18 25 L 18 28 C 18 31, 13 31, 13 34 L 13 40" fill="none" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 20.5 25 L 20.5 28 C 20.5 31, 19 31, 19 34 L 19 40" fill="none" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 23.5 25 L 23.5 28 C 23.5 31, 25 31, 25 34 L 25 40" fill="none" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 26 25 L 26 28 C 26 31, 31 31, 31 34 L 31 40" fill="none" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M 18 25 L 18 28 C 18 31, 13 31, 13 34 L 13 40" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <path d="M 20.5 25 L 20.5 28 C 20.5 31, 19 31, 19 34 L 19 40" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" opacity="0.85" />
        <path d="M 23.5 25 L 23.5 28 C 23.5 31, 25 31, 25 34 L 25 40" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" opacity="0.85" />
        <path d="M 26 25 L 26 28 C 26 31, 31 31, 31 34 L 31 40" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

        {/* 4 Terminal Solder Eyelet Tips */}
        <circle cx="13" cy="40" r="1.6" fill="#E2E8F0" stroke="#475569" strokeWidth="0.7" />
        <circle cx="19" cy="40" r="1.6" fill="#E2E8F0" stroke="#475569" strokeWidth="0.7" />
        <circle cx="25" cy="40" r="1.6" fill="#E2E8F0" stroke="#475569" strokeWidth="0.7" />
        <circle cx="31" cy="40" r="1.6" fill="#E2E8F0" stroke="#475569" strokeWidth="0.7" />

        {/* Bulb Drop Shadow */}
        <ellipse cx="22" cy="28" rx="8" ry="2.2" fill="rgba(0,0,0,0.18)" />

        {/* 3D Milky Frosted Epoxy Bulb Body */}
        <path
          d="M 14.5 28 L 14.5 25 L 16 25 L 16 16 C 16 9, 28 9, 28 16 L 28 25 L 29.5 25 L 29.5 28 Z"
          fill="url(#ic-rgb-dome)"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />

        {/* Internal Tri-Color Emitter Glow Spots */}
        <circle cx="19" cy="20" r="1.8" fill="#EF4444" opacity="0.85" />
        <circle cx="22" cy="16" r="1.8" fill="#3B82F6" opacity="0.85" />
        <circle cx="25" cy="20" r="1.8" fill="#22C55E" opacity="0.85" />

        {/* Flange Collar Bevel Line */}
        <line x1="16" y1="25" x2="28" y2="25" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7" />
        <line x1="16" y1="25.5" x2="28" y2="25.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

        {/* Curved Specular Highlight */}
        <path d="M 18 16 C 18 11.5, 20.5 10, 22 10" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    )
  },
  {
    type: 'diode',
    name: 'Diode',
    category: 'basic',
    defaultProps: { model: '1N4007', rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-diode-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="25%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="ic-diode-stripe" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>
        {/* 3D Metallic Leads Matching LED */}
        <line x1="3" y1="22" x2="12" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="22" x2="41" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <line x1="3" y1="22" x2="12" y2="22" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="22" x2="41" y2="22" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="3" y1="22" x2="12" y2="22" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="22" x2="41" y2="22" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="22" x2="12" y2="22" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <line x1="32" y1="22" x2="41" y2="22" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        {/* Terminal Rings (r=1.8) */}
        <circle cx="3" cy="22" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="3" cy="22" r="0.7" fill="#64748B" />
        <circle cx="41" cy="22" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="41" cy="22" r="0.7" fill="#64748B" />
        {/* DO-41 Black Epoxy Cylinder Body */}
        <rect x="12" y="16.5" width="20" height="11" rx="2" fill="url(#ic-diode-body)" stroke="#090D16" strokeWidth="0.8" />
        {/* Cathode Silver Polarity Stripe */}
        <rect x="26.5" y="16.8" width="3.8" height="10.4" rx="0.5" fill="url(#ic-diode-stripe)" stroke="#64748B" strokeWidth="0.4" />
      </svg>
    )
  },
  {
    type: 'photoresistor',
    name: 'Photoresistor',
    category: 'basic',
    defaultProps: { light: 50, rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <radialGradient id="ic-ldr-ceramic" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FAF5E8" />
            <stop offset="35%" stopColor="#F2E6CE" />
            <stop offset="75%" stopColor="#DFCCA3" />
            <stop offset="100%" stopColor="#B89F70" />
          </radialGradient>
          <linearGradient id="ic-ldr-cds" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>

        {/* 3D Metallic Leads Matching LED */}
        <path d="M 18 22 L 18 40" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 26 22 L 26 40" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />

        <path d="M 18 22 L 18 40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 26 22 L 26 40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

        <path d="M 18 22 L 18 40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 26 22 L 26 40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

        <path d="M 18 22 L 18 40" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <path d="M 26 22 L 26 40" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />

        {/* Terminal Rings (r=1.8) */}
        <circle cx="18" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="18" cy="40" r="0.7" fill="#64748B" />
        <circle cx="26" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="26" cy="40" r="0.7" fill="#64748B" />

        {/* Ceramic Disc Substrate */}
        <circle cx="22" cy="17" r="11" fill="url(#ic-ldr-ceramic)" stroke="#8C7348" strokeWidth="0.8" />
        <circle cx="22" cy="17" r="9.8" fill="none" stroke="#D1BE99" strokeWidth="0.5" />

        {/* CdS Photoconductive Layer */}
        <circle cx="22" cy="17" r="8.5" fill="url(#ic-ldr-cds)" stroke="#7C2D12" strokeWidth="0.5" />

        {/* Serpentine CdS Electrode Track */}
        <path
          d="M 17 12.5 L 27 12.5 M 17 15 L 27 15 M 17 17.5 L 27 17.5 M 17 20 L 27 20"
          fill="none"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 17 12.5 L 27 12.5 M 17 15 L 27 15 M 17 17.5 L 27 17.5 M 17 20 L 27 20"
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        <path
          d="M 27 12.5 C 28.5 12.5, 28.5 15, 27 15 M 17 15 C 15.5 15, 15.5 17.5, 17 17.5 M 27 17.5 C 28.5 17.5, 28.5 20, 27 20"
          fill="none"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 27 12.5 C 28.5 12.5, 28.5 15, 27 15 M 17 15 C 15.5 15, 15.5 17.5, 17 17.5 M 27 17.5 C 28.5 17.5, 28.5 20, 27 20"
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="0.7"
          strokeLinecap="round"
        />

        {/* Glass Dome Glint Highlight */}
        <ellipse cx="19" cy="14" rx="5" ry="2.6" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 19 14)" />
      </svg>
    )
  },
  {
    type: 'pushbutton',
    name: 'Pushbutton',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-btn-plate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E0" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <radialGradient id="ic-btn-cap" cx="38%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="85%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
        </defs>
        {/* 4 Gull-wing Terminal Pins */}
        <circle cx="8" cy="8" r="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="36" cy="8" r="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="8" cy="36" r="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="36" cy="36" r="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        {/* Black Plastic Base Frame */}
        <rect x="9" y="9" width="26" height="26" rx="4" fill="#0A0E17" />
        {/* Stamped Metal Top Plate */}
        <rect x="10.5" y="10.5" width="23" height="23" rx="3" fill="url(#ic-btn-plate)" stroke="#475569" strokeWidth="1" />
        {/* Corner Rivets */}
        <circle cx="13" cy="13" r="1.2" fill="#475569" />
        <circle cx="31" cy="13" r="1.2" fill="#475569" />
        <circle cx="13" cy="31" r="1.2" fill="#475569" />
        <circle cx="31" cy="31" r="1.2" fill="#475569" />
        {/* Metal Aperture Collar */}
        <circle cx="22" cy="22" r="9.5" fill="#94A3B8" stroke="#334155" strokeWidth="0.6" />
        <circle cx="22" cy="22" r="8.8" fill="#1E293B" />
        {/* Minimal Concentric Tactile Plunger Button */}
        <circle cx="22" cy="22" r="7.8" fill="url(#ic-btn-cap)" stroke="#334155" strokeWidth="0.8" />
        <circle cx="22" cy="22" r="4.8" fill="none" stroke="#64748B" strokeWidth="0.7" opacity="0.6" />
        <circle cx="22" cy="22" r="1.8" fill="#1E293B" />
        <circle cx="19.8" cy="19.8" r="1.4" fill="#FFFFFF" opacity="0.35" />
      </svg>
    )
  },
  {
    type: 'potentiometer',
    name: 'Potentiometer',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-pot-brass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>
          <linearGradient id="ic-pot-board" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
          <linearGradient id="ic-pot-silver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="40%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>
        {/* Golden Cradle Base */}
        <path d="M 9 22 Q 13 32 22 32 Q 31 32 35 22 L 35 20 Q 30 29 22 29 Q 14 29 9 20 Z" fill="url(#ic-pot-brass)" stroke="#A16207" strokeWidth="0.6" />
        <rect x="8" y="22" width="2.5" height="5" rx="0.6" fill="url(#ic-pot-brass)" />
        <rect x="33.5" y="22" width="2.5" height="5" rx="0.6" fill="url(#ic-pot-brass)" />
        {/* Brown Phenolic Board */}
        <rect x="9.5" y="22" width="25" height="9" rx="1.5" fill="url(#ic-pot-board)" stroke="#451A03" strokeWidth="0.6" />
        {/* 3 Eyelets */}
        <circle cx="13" cy="26" r="2.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" />
        <circle cx="13" cy="26" r="1.1" fill="#475569" />
        <circle cx="22" cy="26" r="2.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" />
        <circle cx="22" cy="26" r="1.1" fill="#475569" />
        <circle cx="31" cy="26" r="2.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.5" />
        <circle cx="31" cy="26" r="1.1" fill="#475569" />
        {/* 3 T-Pins */}
        <path d="M 10.5 30.5 L 15.5 30.5 L 15.5 32 L 14.2 32 L 14.2 40 L 11.8 40 L 11.8 32 L 10.5 32 Z" fill="url(#ic-pot-silver)" stroke="#64748B" strokeWidth="0.5" />
        <path d="M 19.5 30.5 L 24.5 30.5 L 24.5 32 L 23.2 32 L 23.2 40 L 20.8 40 L 20.8 32 L 19.5 32 Z" fill="url(#ic-pot-silver)" stroke="#64748B" strokeWidth="0.5" />
        <path d="M 28.5 30.5 L 33.5 30.5 L 33.5 32 L 32.2 32 L 32.2 40 L 29.8 40 L 29.8 32 L 28.5 32 Z" fill="url(#ic-pot-silver)" stroke="#64748B" strokeWidth="0.5" />
        {/* Silver Dome Casing */}
        <circle cx="22" cy="15" r="13.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
        <circle cx="22" cy="15" r="10.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.6" />
        {/* Hex Nut under knob */}
        <polygon points="22,8 28,11.5 28,18.5 22,22 16,18.5 16,11.5" fill="url(#ic-pot-silver)" stroke="#64748B" strokeWidth="0.6" />
        {/* Fluted Knob Cover */}
        <circle cx="22" cy="15" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="0.6" />
        <circle cx="22" cy="15" r="8" fill="none" stroke="#475569" strokeWidth="1.2" strokeDasharray="1.1 1.1" />
        <circle cx="22" cy="15" r="5.8" fill="#CBD5E1" stroke="#475569" strokeWidth="0.5" />
        <circle cx="22" cy="15" r="2.2" fill="#1E293B" />
        {/* Indicator Pointer Arrow */}
        <line x1="22" y1="13" x2="22" y2="7" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
        <polygon points="22,6.2 20.4,8.5 23.6,8.5" fill="#EF4444" />
      </svg>
    )
  },
  {
    type: 'capacitor',
    name: 'Capacitor',
    category: 'basic',
    defaultProps: { capacitance: '100µF', voltage: '25V', rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-cap-can" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#373D47" />
            <stop offset="35%" stopColor="#2A303A" />
            <stop offset="100%" stopColor="#14181F" />
          </linearGradient>
          <linearGradient id="ic-cap-stripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        {/* 2 Leads */}
        <line x1="19" y1="28" x2="19" y2="40" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="19" y1="28" x2="19" y2="40" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="25" y1="28" x2="25" y2="40" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="25" y1="28" x2="25" y2="40" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
        {/* Bottom Seal */}
        <rect x="14" y="29.5" width="16" height="3" rx="0.8" fill="#14181F" />
        {/* Canister Body */}
        <rect x="13" y="6" width="18" height="25" rx="1.8" fill="url(#ic-cap-can)" stroke="#11141A" strokeWidth="0.8" />
        {/* Top Rim Streak */}
        <line x1="14.5" y1="6.5" x2="29.5" y2="6.5" stroke="#CBD5E1" strokeWidth="0.8" opacity="0.8" />
        {/* Negative Stripe */}
        <path d="M 13 7.8 Q 13 6 15 6 L 17.5 6 L 17.5 31 L 15 31 Q 13 31 13 29.2 Z" fill="url(#ic-cap-stripe)" />
        {/* Minus Sign */}
        <rect x="14" y="14" width="2.5" height="1" rx="0.3" fill="#1E293B" />
        <rect x="14" y="22" width="2.5" height="1" rx="0.3" fill="#1E293B" />
        {/* Crimp Line */}
        <line x1="13" y1="27.5" x2="31" y2="27.5" stroke="#0A0D12" strokeWidth="0.8" opacity="0.6" />
        {/* Silkscreen Text */}
        <text x="19" y="16.5" fill="#94A3B8" fontSize="3" fontWeight="700" fontFamily="sans-serif">25V</text>
        <text x="19" y="22.5" fill="#CBD5E1" fontSize="3.6" fontWeight="800" fontFamily="ui-monospace, monospace">100µF</text>
      </svg>
    )
  },
  {
    type: 'vibration_motor',
    name: 'Vibration Motor',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-erm-can" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="35%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="ic-erm-brass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* Flying Leads (Red & Blue) */}
        <path d="M 20 31 C 20 36, 17 37, 17 41" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 24 31 C 24 36, 27 37, 27 41" fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" />

        {/* Standard Silver Terminal Pins matching Resistor & Diode */}
        <circle cx="17" cy="41" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="17" cy="41" r="0.7" fill="#64748B" />
        <circle cx="27" cy="41" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="27" cy="41" r="0.7" fill="#64748B" />

        {/* Rear Rubber Endcap */}
        <rect x="18" y="29.5" width="8" height="2.5" rx="0.6" fill="#0F172A" />

        {/* Motor Steel Cylinder */}
        <rect x="17" y="13" width="10" height="17" rx="1.5" fill="url(#ic-erm-can)" stroke="#475569" strokeWidth="0.8" />

        {/* Bushing Collar */}
        <rect x="19" y="11.5" width="6" height="1.8" rx="0.4" fill="#94A3B8" stroke="#475569" strokeWidth="0.5" />

        {/* Shaft */}
        <rect x="21" y="5" width="2" height="7" rx="0.4" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />

        {/* D-Shaped Brass Counterweight */}
        <path d="M 21.5 5 L 28 5 C 29 5, 29.5 5.8, 29.5 7 L 29.5 10 C 29.5 11.2, 29 12, 28 12 L 21.5 12 Z" fill="url(#ic-erm-brass)" stroke="#78350F" strokeWidth="0.7" />
      </svg>
    )
  },
  {
    type: 'dc_motor',
    name: 'DC Motor',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-dc-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4D4D8" />
            <stop offset="35%" stopColor="#B4B4B8" />
            <stop offset="70%" stopColor="#9C9C9E" />
            <stop offset="100%" stopColor="#7E7E84" />
          </linearGradient>
          <linearGradient id="ic-dc-can" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E4E4E8" />
            <stop offset="30%" stopColor="#EEEEF2" />
            <stop offset="70%" stopColor="#D8D8DC" />
            <stop offset="100%" stopColor="#B8B8BE" />
          </linearGradient>
          <radialGradient id="ic-dc-gear" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#FACC15" />
            <stop offset="80%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>
        </defs>

        {/* Ambient Drop Shadow */}
        <path
          d="M 14 8.5 L 30 8.5 C 36 8.5, 41.5 13.5, 41.5 20 C 41.5 26.5, 36 32, 30 32 L 14 32 C 8 32, 2.5 26.5, 2.5 20 C 2.5 13.5, 8 8.5, 14 8.5 Z"
          fill="rgba(0,0,0,0.18)"
        />

        {/* 3D Metallic Leads Matching LED & Resistor */}
        <line x1="17" y1="31" x2="17" y2="40" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />
        <line x1="27" y1="31" x2="27" y2="40" stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeLinecap="round" />

        <line x1="17" y1="31" x2="17" y2="40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="27" y1="31" x2="27" y2="40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

        <line x1="17" y1="31" x2="17" y2="40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="27" y1="31" x2="27" y2="40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

        <line x1="17" y1="31" x2="17" y2="40" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <line x1="27" y1="31" x2="27" y2="40" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />

        {/* Terminal Rings */}
        <circle cx="17" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="17" cy="40" r="0.7" fill="#64748B" />
        <circle cx="27" cy="40" r="1.8" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="27" cy="40" r="0.7" fill="#64748B" />

        {/* Molded End-Bell Base Frame */}
        <rect x="13" y="29.5" width="18" height="3" rx="0.8" fill="#1E2228" stroke="#0F141C" strokeWidth="0.5" />

        {/* Black Terminal Boot (Left, Negative) & Red Terminal Boot (Right, Positive) */}
        <rect x="14.5" y="28" width="5" height="4.5" rx="1" fill="#18181B" stroke="#09090B" strokeWidth="0.5" />
        <rect x="24.5" y="28" width="5" height="4.5" rx="1" fill="#DC2626" stroke="#991B1B" strokeWidth="0.5" />

        {/* Outer Stamped Metal Bevel Shell */}
        <path
          d="M 14 7 L 30 7 C 36 7, 41.5 12.5, 41.5 19 C 41.5 25.5, 36 31, 30 31 L 14 31 C 8 31, 2.5 25.5, 2.5 19 C 2.5 12.5, 8 7, 14 7 Z"
          fill="url(#ic-dc-rim)"
          stroke="#68686E"
          strokeWidth="0.5"
        />

        {/* Inner Recessed Faceplate */}
        <path
          d="M 15 8.8 L 29 8.8 C 34.5 8.8, 39.5 13.5, 39.5 19 C 39.5 24.5, 34.5 29.2, 29 29.2 L 15 29.2 C 9.5 29.2, 4.5 24.5, 4.5 19 C 4.5 13.5, 9.5 8.8, 15 8.8 Z"
          fill="url(#ic-dc-can)"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          opacity="0.95"
        />

        {/* 3 Dark Countersunk Stamped Faceplate Holes */}
        <circle cx="22" cy="12.5" r="2.5" fill="#28282B" stroke="#48484D" strokeWidth="0.5" />
        <path d="M 20 13.3 A 2.3 2.3 0 0 0 24 13.3" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />

        <circle cx="9.5" cy="19" r="2.5" fill="#28282B" stroke="#48484D" strokeWidth="0.5" />
        <path d="M 7.5 19.8 A 2.3 2.3 0 0 0 11.5 19.8" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />

        <circle cx="34.5" cy="19" r="2.5" fill="#28282B" stroke="#48484D" strokeWidth="0.5" />
        <path d="M 32.5 19.8 A 2.3 2.3 0 0 0 36.5 19.8" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />

        {/* Raised Bearing Boss */}
        <circle cx="22" cy="19" r="4.8" fill="#D4D4D8" stroke="#64748B" strokeWidth="0.5" />
        <circle cx="22" cy="19" r="3.4" fill="#D4AF37" stroke="#92400E" strokeWidth="0.4" />

        {/* Center Yellow Pinion Cog Wheel */}
        <path
          d="M 21.5 14.6 L 21.6 12.6 L 22.4 12.6 L 22.5 14.6 L 23.7 15.0 L 24.8 13.3 L 25.5 13.7 L 24.6 15.5 L 25.5 16.4 L 27.3 15.5 L 27.7 16.2 L 26.0 17.3 L 26.4 18.5 L 28.4 18.6 L 28.4 19.4 L 26.4 19.5 L 26.0 20.7 L 27.7 21.8 L 27.3 22.5 L 25.5 21.6 L 24.6 22.5 L 25.5 24.3 L 24.8 24.7 L 23.7 23.0 L 22.5 23.4 L 22.4 25.4 L 21.6 25.4 L 21.5 23.4 L 20.3 23.0 L 19.2 24.7 L 18.5 24.3 L 19.4 22.5 L 18.5 21.6 L 16.7 22.5 L 16.3 21.8 L 18.0 20.7 L 17.6 19.5 L 15.6 19.4 L 15.6 18.6 L 17.6 18.5 L 18.0 17.3 L 16.3 16.2 L 16.7 15.5 L 18.5 16.4 L 19.4 15.5 L 18.5 13.7 L 19.2 13.3 L 20.3 15.0 Z"
          fill="url(#ic-dc-gear)"
          stroke="#D97706"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Center Shaft Core */}
        <circle cx="22" cy="19" r="1.6" fill="#475569" stroke="#1E293B" strokeWidth="0.4" />
        <circle cx="21.5" cy="18.5" r="0.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    )
  },
  {
    type: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'basic',
    defaultProps: { rotation: 0, code: DEFAULT_ARDUINO_CODE },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          {/* Authentic Arduino Teal PCB Gradient */}
          <linearGradient id="ic-uno-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E989E" />
            <stop offset="45%" stopColor="#008187" />
            <stop offset="100%" stopColor="#005B60" />
          </linearGradient>
          {/* Silver USB metal gradient */}
          <linearGradient id="ic-uno-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          {/* Gold mounting hole gradient */}
          <radialGradient id="ic-uno-gold" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </radialGradient>
        </defs>

        {/* 1. PCB Authentic Stepped Shape with Rounded Corners */}
        <path
          d="M 8.5 9.5
             L 37.5 9.5
             Q 38.5 9.5 39 10.5
             L 39.5 11.5
             Q 40 12 40 12.8
             L 40 16.5
             Q 40 17 40.5 17.5
             L 41.5 18.5
             Q 42 19 42 19.5
             L 42 30.5
             Q 42 31.2 41.5 31.8
             L 40.5 32.5
             Q 40 33 40 33.5
             L 40 34
             Q 40 34.5 39 34.5
             L 8.5 34.5
             A 2 2 0 0 1 6.5 32.5
             L 6.5 11.5
             A 2 2 0 0 1 8.5 9.5
             Z"
          fill="url(#ic-uno-pcb)"
          stroke="#004347"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Decorative White Silkscreen Traces */}
        <path
          d="M 10 17 L 14 17 L 17 20 M 12 28 L 16 28 M 22 15 L 26 15"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          opacity="0.18"
          fill="none"
          strokeLinecap="round"
        />

        {/* 2. Silver USB Type-B Port (Facing LEFT towards incoming cable) */}
        <rect x="2" y="11.5" width="6.5" height="6.5" rx="0.8" fill="url(#ic-uno-metal)" stroke="#475569" strokeWidth="0.5" />
        <rect x="1.5" y="12" width="1" height="5.5" rx="0.4" fill="#94A3B8" stroke="#475569" strokeWidth="0.4" />
        <line x1="1.8" y1="12.5" x2="1.8" y2="17" stroke="#1E293B" strokeWidth="0.7" />

        {/* 3. DC Power Barrel Jack (Facing LEFT towards power plug) */}
        <rect x="2.5" y="24" width="6" height="8" rx="0.8" fill="#181A1E" stroke="#090A0D" strokeWidth="0.5" />
        <rect x="1.8" y="25" width="1.2" height="6" rx="0.4" fill="#64748B" stroke="#334155" strokeWidth="0.4" />
        <circle cx="2.4" cy="28" r="0.8" fill="#D4AF37" />

        {/* 4. Gold M3 Annular Mounting Holes (4 corners) */}
        {[
          [8.5, 12.5],
          [39.5, 14.5],
          [12, 32],
          [39.5, 30]
        ].map(([hx, hy], i) => (
          <g key={`ic-mh-${i}`}>
            <circle cx={hx} cy={hy} r="1.3" fill="url(#ic-uno-gold)" stroke="#713F12" strokeWidth="0.2" />
            <circle cx={hx} cy={hy} r="0.6" fill="#0F172A" />
          </g>
        ))}

        {/* 5. Tactile Reset Button (Upper-left near USB, Red cap) */}
        <rect x="8.5" y="10.5" width="2.6" height="2.6" rx="0.4" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.3" />
        <circle cx="9.8" cy="11.8" r="0.8" fill="#EF4444" />

        {/* 6. 16 MHz Crystal Oscillator (Silver oval) */}
        <rect x="11.5" y="15" width="3.5" height="1.8" rx="0.9" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.3" />

        {/* 7. Top Female Pin Header Strip (Digital Header) */}
        <rect x="13.5" y="10" width="24" height="2.2" rx="0.4" fill="#111317" stroke="#1E293B" strokeWidth="0.3" />
        {[15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35].map(px => (
          <circle key={`pth-${px}`} cx={px} cy="11.1" r="0.45" fill="#E2E8F0" />
        ))}

        {/* 8. Bottom Female Pin Header Strip (Power & Analog) */}
        <rect x="13.5" y="31.8" width="24" height="2.2" rx="0.4" fill="#111317" stroke="#1E293B" strokeWidth="0.3" />
        {[15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35].map(px => (
          <circle key={`pbh-${px}`} cx={px} cy="32.9" r="0.45" fill="#E2E8F0" />
        ))}

        {/* 9. ATmega328P DIP-28 IC (Horizontal Black Package with Notch) */}
        <rect x="19" y="21" width="16" height="6.5" rx="0.8" fill="#1E222A" stroke="#0E1013" strokeWidth="0.4" />
        <circle cx="19" cy="24.25" r="0.8" fill="#0E1013" />
        <text x="27" y="25.2" textAnchor="middle" fill="#94A3B8" fontSize="2" fontWeight="bold" fontFamily="monospace">
          ATMEGA328P
        </text>

        {/* 10. Status LEDs (L & ON) */}
        <circle cx="17.5" cy="14" r="0.7" fill="#FACC15" />
        <circle cx="17.5" cy="16" r="0.7" fill="#22C55E" />

        {/* 11. White Silkscreen Branding */}
        <text x="32" y="16.5" textAnchor="middle" fill="#FFFFFF" fontSize="3" fontWeight="900" fontFamily="sans-serif">
          UNO
        </text>
        <text x="32" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="1.5" fontWeight="bold" opacity="0.8" fontFamily="monospace">
          ARDUINO
        </text>
      </svg>
    )
  },
  {
    type: 'transistor_npn',
    name: 'Transistor (NPN)',
    category: 'basic',
    defaultProps: { rotation: 0, model: 'NPN' },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-to92-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#373B46" />
            <stop offset="30%" stopColor="#22252D" />
            <stop offset="75%" stopColor="#14161C" />
            <stop offset="100%" stopColor="#0B0C0E" />
          </linearGradient>
          <linearGradient id="ic-to92-face" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15171D" />
            <stop offset="25%" stopColor="#282D38" />
            <stop offset="75%" stopColor="#1B1E26" />
            <stop offset="100%" stopColor="#111318" />
          </linearGradient>
          <linearGradient id="ic-to92-lead" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* 3 Metallic Stamped Leads */}
        {/* Collector (Pin 1 - Left) */}
        <path d="M 16 22 L 16 26 C 16 29, 13 29, 13 32 L 13 37" fill="none" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 16 22 L 16 26 C 16 29, 13 29, 13 32 L 13 37" fill="none" stroke="url(#ic-to92-lead)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 16 22 L 16 26 C 16 29, 13 29, 13 32 L 13 37" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

        {/* Base (Pin 2 - Center) */}
        <line x1="22" y1="22" x2="22" y2="37" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="22" y1="22" x2="22" y2="37" stroke="url(#ic-to92-lead)" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="22" y1="22" x2="22" y2="37" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" opacity="0.9" />

        {/* Emitter (Pin 3 - Right) */}
        <path d="M 28 22 L 28 26 C 28 29, 31 29, 31 32 L 31 37" fill="none" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 28 22 L 28 26 C 28 29, 31 29, 31 32 L 31 37" fill="none" stroke="url(#ic-to92-lead)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 28 22 L 28 26 C 28 29, 31 29, 31 32 L 31 37" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

        {/* 3 Silver Through-Hole Solder Pin Terminals */}
        <circle cx="13" cy="37" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="13" cy="37" r="1.0" fill="#64748B" />
        <circle cx="22" cy="37" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="22" cy="37" r="1.0" fill="#64748B" />
        <circle cx="31" cy="37" r="2.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
        <circle cx="31" cy="37" r="1.0" fill="#64748B" />

        {/* TO-92 Molded Epoxy D-Section Body (Slightly Bigger) */}
        {/* Body Drop Shadow */}
        <path d="M 9 22 L 9 12 C 9 3, 35 3, 35 12 L 35 22 C 35 23.2, 9 23.2, 9 22 Z" fill="rgba(0,0,0,0.25)" transform="translate(1, 1.5)" />
        {/* Main Body */}
        <path
          d="M 9 22 L 9 12 C 9 3, 35 3, 35 12 L 35 22 C 35 23.2, 9 23.2, 9 22 Z"
          fill="url(#ic-to92-body)"
          stroke="#0D0E12"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Flat Front Face Plate */}
        <rect x="10.5" y="9" width="23" height="12.5" rx="1.5" fill="url(#ic-to92-face)" stroke="#111317" strokeWidth="0.7" />
        <line x1="11" y1="9" x2="33" y2="9" stroke="#374151" strokeWidth="0.5" opacity="0.8" />
        <line x1="11" y1="21.5" x2="33" y2="21.5" stroke="#08090C" strokeWidth="0.7" />

        {/* Text on Black Body Face: NPN at top, C B E below */}
        <text x="22" y="14.5" textAnchor="middle" fill="#F8FAFC" fontSize="4.2" fontWeight="900" fontFamily="monospace" letterSpacing="0.4">
          NPN
        </text>
        <text x="15.5" y="19.5" textAnchor="middle" fill="#F43F5E" fontSize="3.1" fontWeight="900" fontFamily="monospace">C</text>
        <text x="22" y="19.5" textAnchor="middle" fill="#38BDF8" fontSize="3.1" fontWeight="900" fontFamily="monospace">B</text>
        <text x="28.5" y="19.5" textAnchor="middle" fill="#10B981" fontSize="3.1" fontWeight="900" fontFamily="monospace">E</text>
      </svg>
    )
  },
  {
    type: 'slideswitch',
    name: 'Slideswitch',
    category: 'basic',
    defaultProps: { position: 'left', rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-sw-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
        {/* 3 Terminals */}
        <line x1="14" y1="28" x2="14" y2="38" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="28" x2="22" y2="38" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="28" x2="30" y2="38" stroke="#CBD5E0" strokeWidth="2.5" strokeLinecap="round" />
        {/* Metal Chassis Housing */}
        <rect x="6" y="16" width="32" height="13" rx="2.5" fill="url(#ic-sw-metal)" stroke="#334155" strokeWidth="1" />
        <circle cx="9" cy="22.5" r="1.2" fill="#334155" />
        <circle cx="35" cy="22.5" r="1.2" fill="#334155" />
        {/* Channel & Slider Knob */}
        <rect x="12" y="19" width="20" height="7" rx="1.5" fill="#0F172A" />
        <rect x="13" y="13" width="9" height="10" rx="1.5" fill="#CBD5E0" stroke="#334155" strokeWidth="1" />
        <line x1="16" y1="15" x2="16" y2="21" stroke="#475569" strokeWidth="0.8" />
        <line x1="19" y1="15" x2="19" y2="21" stroke="#475569" strokeWidth="0.8" />
      </svg>
    )
  },
  {
    type: 'battery_9v',
    name: '9V Battery',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <clipPath id="ic-bat9v-clip">
            <rect x="11" y="9" width="22" height="31" rx="2" />
          </clipPath>
          <linearGradient id="ic-bat9v-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0E0F12" />
            <stop offset="30%" stopColor="#1C1D24" />
            <stop offset="70%" stopColor="#2E303C" />
            <stop offset="100%" stopColor="#0C0D10" />
          </linearGradient>
          <linearGradient id="ic-bat9v-copper" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C2D12" />
            <stop offset="25%" stopColor="#9A3412" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="ic-bat9v-crimp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* Top Header Plate */}
        <rect x="12" y="7" width="20" height="2.5" rx="0.8" fill="#1C1C22" stroke="#27272A" strokeWidth="0.4" />

        {/* Positive Snap Stud (Left) */}
        <ellipse cx="16" cy="6.8" rx="2.0" ry="1.0" fill="url(#ic-bat9v-crimp)" />
        <circle cx="16" cy="6" r="1.5" fill="#CBD5E1" stroke="#475569" strokeWidth="0.4" />
        <circle cx="16" cy="6" r="0.4" fill="#475569" />

        {/* Negative Octagonal Crown Socket (Right) */}
        <ellipse cx="28" cy="6.8" rx="2.4" ry="1.0" fill="url(#ic-bat9v-crimp)" />
        <polygon points="26.5,5.2 27.5,4.7 28.5,4.7 29.5,5.2 29.8,6.0 29.5,6.8 28.5,7.3 27.5,7.3 26.5,6.8 26.2,6.0" fill="#CBD5E1" stroke="#475569" strokeWidth="0.4" />
        <circle cx="28" cy="6" r="1.1" fill="#09090C" />
        <circle cx="28" cy="6" r="0.4" fill="#FBBF24" />

        {/* Main Canister Body */}
        <rect x="11" y="9" width="22" height="31" rx="2" fill="url(#ic-bat9v-body)" stroke="#0E0F12" strokeWidth="0.8" />

        {/* Clipped Overlays */}
        <g clipPath="url(#ic-bat9v-clip)">
          {/* Top Metal Lip */}
          <rect x="11" y="9" width="22" height="1.5" fill="url(#ic-bat9v-crimp)" />
          {/* Brushed Copper Collar */}
          <rect x="11" y="10.5" width="22" height="7.5" fill="url(#ic-bat9v-copper)" />
          <line x1="11" y1="18" x2="33" y2="18" stroke="#09090B" strokeWidth="0.6" />
          <line x1="11" y1="18.3" x2="33" y2="18.3" stroke="#FEF08A" strokeWidth="0.3" opacity="0.8" />
          {/* Bottom Crimp */}
          <rect x="11" y="38.5" width="22" height="1.5" fill="url(#ic-bat9v-crimp)" />
        </g>

        {/* Typography */}
        <text x="22" y="27.5" fill="#FFFFFF" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">9V</text>
        <line x1="17" y1="30" x2="27" y2="30" stroke="#F59E0B" strokeWidth="0.5" />
        <text x="22" y="34" fill="#CBD5E1" fontSize="1.8" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">ALKALINE</text>
      </svg>
    )
  },
  {
    type: 'battery_coin',
    name: 'Coin Cell 3V',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <linearGradient id="ic-holder-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#242427" />
            <stop offset="50%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>
          <radialGradient id="ic-holder-coin" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </radialGradient>
          <linearGradient id="ic-holder-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* Left Negative Pin (5, 31.5) - In-line with Bottom-Left (-) Badge */}
        <line x1="9" y1="31.5" x2="5" y2="31.5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="31.5" r="1.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="0.7" />
        <circle cx="5" cy="31.5" r="0.7" fill="#64748B" />

        {/* Right Positive Pin (39, 12.5) - In-line with Top-Right (+) Badge */}
        <line x1="35" y1="12.5" x2="39" y2="12.5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="39" cy="12.5" r="1.8" fill="#E2E8F0" stroke="#4A5568" strokeWidth="0.7" />
        <circle cx="39" cy="12.5" r="0.7" fill="#64748B" />

        {/* Molded Socket Housing Body */}
        <rect x="8" y="9" width="28" height="26" rx="3.5" fill="url(#ic-holder-body)" stroke="#3F3F46" strokeWidth="0.6" />

        {/* Recessed Cavity */}
        <circle cx="22" cy="22" r="10.5" fill="#09090B" stroke="#27272A" strokeWidth="0.5" />
        <path d="M 19 32 C 19 33.5, 25 33.5, 25 32 Z" fill="#09090B" />

        {/* Coin Cell */}
        <circle cx="22" cy="22" r="9.5" fill="url(#ic-holder-coin)" stroke="#64748B" strokeWidth="0.4" />
        <circle cx="22" cy="22" r="7.5" fill="none" stroke="#FFFFFF" strokeWidth="0.3" opacity="0.5" />

        {/* Laser Text */}
        <text x="22" y="20.5" fill="#1E293B" fontSize="2.7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CR2032</text>
        <text x="22" y="23.8" fill="#475569" fontSize="1.9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">3V</text>

        {/* Gold Leaf Spring Contact Clip */}
        <path d="M 17 14 L 22 12 L 27 14 L 26 16.5 L 22 15 L 18 16.5 Z" fill="url(#ic-holder-gold)" stroke="#78350F" strokeWidth="0.3" />
        <circle cx="22" cy="15" r="0.4" fill="#FEF08A" />

        {/* Top-Left Corner Rivet */}
        <circle cx="12.5" cy="12.5" r="0.8" fill="#27272A" />

        {/* Top-Right (+) Corner Polarity Badge */}
        <circle cx="31.5" cy="12.5" r="1.8" fill="#18181B" stroke="#EF4444" strokeWidth="0.5" />
        <text x="31.5" y="14" fill="#EF4444" fontSize="2.5" fontWeight="900" textAnchor="middle">+</text>

        {/* Bottom-Left (-) Corner Polarity Badge */}
        <circle cx="12.5" cy="31.5" r="1.8" fill="#18181B" stroke="#3B82F6" strokeWidth="0.5" />
        <text x="12.5" y="32.8" fill="#3B82F6" fontSize="2.5" fontWeight="900" textAnchor="middle">-</text>

        {/* Bottom-Right Corner Rivet */}
        <circle cx="31.5" cy="31.5" r="0.8" fill="#27272A" />
      </svg>
    )
  },
  {
    type: 'battery_aa',
    name: '1.5V Battery',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        <defs>
          <clipPath id="ic-aa-clip">
            <rect x="13" y="7" width="18" height="32" rx="2.5" />
          </clipPath>
          <linearGradient id="ic-aa-white" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="35%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="ic-aa-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="45%" stopColor="#22C55E" />
            <stop offset="60%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="ic-aa-crimp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Positive Terminal Nub */}
        <rect x="17" y="5.5" width="10" height="1.8" rx="0.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.4" />
        <rect x="19" y="3.5" width="6" height="3" rx="0.8" fill="url(#ic-aa-crimp)" stroke="#334155" strokeWidth="0.4" />
        <line x1="19.5" y1="4" x2="24.5" y2="4" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.8" />

        {/* Main Canister Body (Satin White) */}
        <rect x="13" y="7" width="18" height="32" rx="2.5" fill="url(#ic-aa-white)" stroke="#94A3B8" strokeWidth="0.8" />

        {/* Clipped Overlays */}
        <g clipPath="url(#ic-aa-clip)">
          {/* Top Green Collar */}
          <rect x="13" y="7" width="18" height="11" fill="url(#ic-aa-green)" />
          <line x1="13" y1="18" x2="31" y2="18" stroke="#0F3F22" strokeWidth="0.5" opacity="0.6" />
          <line x1="13" y1="18.3" x2="31" y2="18.3" stroke="#FFFFFF" strokeWidth="0.3" opacity="0.8" />
          {/* Bottom Crimp Rim */}
          <rect x="13" y="37.5" width="18" height="1.5" fill="url(#ic-aa-crimp)" />
        </g>

        {/* Typography */}
        <text x="22" y="27" fill="#0F172A" fontSize="6.0" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">1.5 V</text>
        <text x="22" y="34.5" fill="#16A34A" fontSize="5.0" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">AA</text>
      </svg>
    )
  },
  {
    type: 'breadboard_small',
    name: 'Breadboard Small',
    category: 'basic',
    defaultProps: { rotation: 0 },
    icon: (
      <svg viewBox="0 0 44 44" className="w-11 h-11">
        {/* White Breadboard Plastic Housing */}
        <rect x="4" y="9" width="36" height="26" rx="4" fill="#FAFAF8" stroke="#D5D5CE" strokeWidth="1.2" />
        {/* Bevel */}
        <rect x="5.5" y="10.5" width="33" height="23" rx="3" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
        {/* Power Rail Lines */}
        <line x1="8" y1="13" x2="36" y2="13" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="31" x2="36" y2="31" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
        {/* Central DIP Trough */}
        <rect x="6" y="20.5" width="32" height="3" fill="#E8E8E2" />
        {/* Pin Hole Matrix Rows */}
        <circle cx="12" cy="17" r="0.9" fill="#475569" />
        <circle cx="17" cy="17" r="0.9" fill="#475569" />
        <circle cx="22" cy="17" r="0.9" fill="#475569" />
        <circle cx="27" cy="17" r="0.9" fill="#475569" />
        <circle cx="32" cy="17" r="0.9" fill="#475569" />
        <circle cx="12" cy="27" r="0.9" fill="#475569" />
        <circle cx="17" cy="27" r="0.9" fill="#475569" />
        <circle cx="22" cy="27" r="0.9" fill="#475569" />
        <circle cx="27" cy="27" r="0.9" fill="#475569" />
        <circle cx="32" cy="27" r="0.9" fill="#475569" />
      </svg>
    )
  }
];

export const TinkerDrawer = ({
  isOpen = true,
  onToggleOpen,
  isDarkMode = false
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('basic');

  const filteredComponents = COMPONENT_CATALOG.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      {/* Floating Reveal Trigger when Drawer is Closed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          title="Open Components Catalog (Ctrl+B)"
          className={`fixed top-[116px] left-3 z-30 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl backdrop-blur-xl border transition-all duration-200 cursor-pointer group hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-left-4 ${isDarkMode
            ? 'bg-slate-900/90 border-slate-700/80 text-teal-300 hover:border-teal-400 shadow-black/40'
            : 'bg-white/90 border-[#203247]/15 text-[#203247] hover:border-[#347F7A] shadow-slate-900/10'
            }`}
        >
          <PanelLeft size={15} className="text-[#347F7A] dark:text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold font-space-grotesk tracking-wide">Components</span>
          <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Main Collapsible Drawer with GPU-Accelerated Fluid Slide */}
      <aside
        className={`fixed top-[112px] left-3 bottom-12 z-30 w-80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border ${isDarkMode
          ? 'bg-[#0f172a]/95 border-slate-700/80 text-slate-100 shadow-black/50'
          : 'bg-[#FAF8F4]/95 border-[#203247]/15 text-[#203247] shadow-slate-900/10'
          } ${isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Drawer Header with Title, Collapse Button, and Category Tabs */}
          <div className={`p-3 border-b flex flex-col gap-2.5 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-[#203247]/10 bg-white/50'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className={isDarkMode ? 'text-teal-400' : 'text-[#347F7A]'} />
                <span className={`text-[11px] font-mono font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-[#347F7A]'
                  }`}>
                  Components Catalog
                </span>
              </div>

              {/* Minimalist Close/Collapse Button */}
              <button
                onClick={onToggleOpen}
                title="Hide sidebar (Ctrl+B)"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isDarkMode
                  ? 'border-slate-700/80 bg-slate-800/80 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-700'
                  : 'border-[#203247]/15 bg-white text-slate-500 hover:text-[#203247] hover:border-[#203247]/30 hover:bg-slate-50'
                  }`}
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            {/* Category Segmented Tabs */}
            <div className={`flex items-center p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100 border-[#203247]/10'
              }`}>
              <button
                onClick={() => setSelectedCategory('basic')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedCategory === 'basic'
                  ? isDarkMode
                    ? 'bg-teal-500/20 text-teal-300 shadow-2xs font-extrabold border border-teal-500/30'
                    : 'bg-white text-[#203247] shadow-xs font-extrabold'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Basic Parts
              </button>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedCategory === 'all'
                  ? isDarkMode
                    ? 'bg-teal-500/20 text-teal-300 shadow-2xs font-extrabold border border-teal-500/30'
                    : 'bg-white text-[#203247] shadow-xs font-extrabold'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All Components
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className={`p-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-[#203247]/10'}`}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search components..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border transition-all outline-none ${isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 focus:border-teal-400'
                  : 'bg-white/80 border-[#203247]/12 text-[#203247] placeholder-slate-400 focus:border-[#347F7A]'
                  }`}
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Component Tiles Grid - Native Drag & Drop onto Canvas */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2.5 content-start">
            {filteredComponents.map(comp => (
              <div
                key={comp.type}
                draggable={true}
                onDragStart={e => {
                  e.dataTransfer.setData('application/json', JSON.stringify(comp));
                  e.dataTransfer.effectAllowed = 'copy';

                  // Use just the actual component SVG icon as the drag image (not the card container!)
                  const iconEl = e.currentTarget.querySelector('.tinker-comp-icon');
                  if (iconEl && e.dataTransfer.setDragImage) {
                    const rect = iconEl.getBoundingClientRect();
                    e.dataTransfer.setDragImage(iconEl, rect.width / 2, rect.height / 2);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all group text-center cursor-grab active:cursor-grabbing active:scale-95 select-none ${isDarkMode
                  ? 'bg-slate-800/80 border-slate-700/80 hover:border-teal-400 hover:bg-slate-800 text-slate-200 hover:text-white shadow-2xs'
                  : 'bg-white/95 border-[#203247]/12 hover:border-[#347F7A] hover:bg-white text-[#203247] hover:text-[#347F7A] shadow-2xs hover:shadow-md'
                  }`}
                title={`Drag & drop ${comp.name} onto canvas`}
              >
                <div className="tinker-comp-icon w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform pointer-events-none">
                  {comp.icon}
                </div>
                <span className={`text-[10px] font-bold font-space-grotesk leading-tight pointer-events-none transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-teal-300' : 'text-[#203247] group-hover:text-[#347F7A]'
                  }`}>
                  {comp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
