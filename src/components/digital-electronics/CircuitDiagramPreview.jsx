import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw } from 'lucide-react';

export const CircuitDiagramPreview = ({ diagramType = 'basic-gates', title = 'Basic Gates' }) => {
  // Interactive input states for interactive schematic exploration
  const [inA, setInA] = useState(1);
  const [inB, setInB] = useState(0);
  const [inCin, setInCin] = useState(0);
  const [inSel, setInSel] = useState(0);
  const [inD, setInD] = useState(1);
  const [inClk, setInClk] = useState(1);
  const [latchQ, setLatchQ] = useState(0);

  // Helper toggle buttons
  const renderSwitch = (label, value, onToggle) => (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer border ${value
          ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-xs'
          : 'bg-white text-[#526b88] border-[#203247]/20 hover:border-[#203247]/40'
        }`}
    >
      <span>{label}</span>
      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${value ? 'bg-white/20 text-white' : 'bg-[#f5f2ea] text-[#647895]'}`}>
        {value ? '1' : '0'}
      </span>
    </button>
  );

  // Wire signal color styling
  const wireColor = (val) => (val ? '#0d9488' : '#94a3b8');
  const wireWidth = (val) => (val ? '2.5' : '1.75');

  return (
    <div className="rounded-2xl border border-[#203247]/10 bg-[#faf8f4] p-6 sm:p-7 text-[#203247]">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-[#203247]/8 pb-3">
        <div>
          <span className="font-mono-signal text-[11px] font-bold text-[#526b88] uppercase tracking-[0.18em]">
            SCHEMATIC • {title.toUpperCase()}
          </span>
          <p className="text-[11px] text-[#647895] mt-0.5">
            Interactive circuit model — Click input switches below to test logic flow
          </p>
        </div>

        {/* INPUT INTERACTIVE CONTROLS BAR */}
        <div className="flex items-center gap-2 flex-wrap">
          {(diagramType === 'basic-gates' || diagramType === 'boolean-algebra' || diagramType === 'universal-gates') && (
            <>
              {renderSwitch('A', inA, () => setInA(v => v ? 0 : 1))}
              {renderSwitch('B', inB, () => setInB(v => v ? 0 : 1))}
            </>
          )}

          {diagramType === 'half-adder' && (
            <>
              {renderSwitch('A', inA, () => setInA(v => v ? 0 : 1))}
              {renderSwitch('B', inB, () => setInB(v => v ? 0 : 1))}
            </>
          )}

          {diagramType === 'full-adder' && (
            <>
              {renderSwitch('A', inA, () => setInA(v => v ? 0 : 1))}
              {renderSwitch('B', inB, () => setInB(v => v ? 0 : 1))}
              {renderSwitch('Cin', inCin, () => setInCin(v => v ? 0 : 1))}
            </>
          )}

          {diagramType === 'multiplexer' && (
            <>
              {renderSwitch('I₀', inA, () => setInA(v => v ? 0 : 1))}
              {renderSwitch('I₁', inB, () => setInB(v => v ? 0 : 1))}
              {renderSwitch('Sel', inSel, () => setInSel(v => v ? 0 : 1))}
            </>
          )}

          {diagramType === 'sr-latch' && (
            <>
              {renderSwitch('Set (S)', inA, () => {
                const nextS = inA ? 0 : 1;
                setInA(nextS);
                if (nextS && !inB) setLatchQ(1);
              })}
              {renderSwitch('Reset (R)', inB, () => {
                const nextR = inB ? 0 : 1;
                setInB(nextR);
                if (nextR && !inA) setLatchQ(0);
              })}
            </>
          )}

          {(diagramType === 'd-flip-flop' || diagramType === 'jk-flip-flop') && (
            <>
              {renderSwitch('Data (D)', inD, () => setInD(v => v ? 0 : 1))}
              {renderSwitch('Clock (CLK)', inClk, () => setInClk(v => v ? 0 : 1))}
            </>
          )}
        </div>
      </div>

      {/* SCHEMATIC CANVAS */}
      <div className="rounded-xl border border-[#203247]/8 bg-[#f5f2ea] p-6 sm:p-8 overflow-x-auto flex items-center justify-center min-h-[220px]">
        {/* ═══ 1. BASIC GATES SCHEMATIC ═══ */}
        {(diagramType === 'basic-gates' || diagramType === 'boolean-algebra') && (() => {
          const andOut = (inA && inB) ? 1 : 0;
          const orOut = (inA || inB) ? 1 : 0;
          const xorOut = (inA ^ inB) ? 1 : 0;
          return (
            <div className="grid gap-6 sm:grid-cols-3 w-full max-w-[760px] py-2">
              {/* AND Gate Card */}
              <div className="rounded-xl bg-white p-4 border border-[#203247]/10 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#647895] mb-3">
                  <span>AND GATE</span>
                  <span className="text-[10px] text-[#347f7a]">Y = A · B</span>
                </div>
                <svg viewBox="0 0 200 80" className="w-full h-16">
                  {/* Inputs */}
                  <line x1="10" y1="25" x2="60" y2="25" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                  <line x1="10" y1="55" x2="60" y2="55" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />
                  <text x="14" y="20" fill="#647895" fontSize="10" fontFamily="monospace">A:{inA}</text>
                  <text x="14" y="70" fill="#647895" fontSize="10" fontFamily="monospace">B:{inB}</text>

                  {/* AND Gate Body */}
                  <path d="M 60,15 L 90,15 A 25,25 0 0,1 90,65 L 60,65 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />

                  {/* Output */}
                  <line x1="115" y1="40" x2="160" y2="40" stroke={wireColor(andOut)} strokeWidth={wireWidth(andOut)} />
                  <circle cx="170" cy="40" r="8" fill={andOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                  <text x="184" y="44" fill={andOut ? '#0d9488' : '#647895'} fontSize="12" fontWeight="bold" fontFamily="monospace">{andOut}</text>
                </svg>
                <div className="text-center mt-2 text-[11px] font-mono text-[#526b88]">
                  Output: <strong className={andOut ? 'text-[#0d9488]' : 'text-[#647895]'}>{andOut ? 'HIGH (1)' : 'LOW (0)'}</strong>
                </div>
              </div>

              {/* OR Gate Card */}
              <div className="rounded-xl bg-white p-4 border border-[#203247]/10 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#647895] mb-3">
                  <span>OR GATE</span>
                  <span className="text-[10px] text-[#347f7a]">Y = A + B</span>
                </div>
                <svg viewBox="0 0 200 80" className="w-full h-16">
                  {/* Inputs */}
                  <line x1="10" y1="25" x2="65" y2="25" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                  <line x1="10" y1="55" x2="65" y2="55" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />
                  <text x="14" y="20" fill="#647895" fontSize="10" fontFamily="monospace">A:{inA}</text>
                  <text x="14" y="70" fill="#647895" fontSize="10" fontFamily="monospace">B:{inB}</text>

                  {/* OR Gate Body */}
                  <path d="M 55,15 Q 75,40 55,65 Q 85,65 115,40 Q 85,15 55,15 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />

                  {/* Output */}
                  <line x1="115" y1="40" x2="160" y2="40" stroke={wireColor(orOut)} strokeWidth={wireWidth(orOut)} />
                  <circle cx="170" cy="40" r="8" fill={orOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                  <text x="184" y="44" fill={orOut ? '#0d9488' : '#647895'} fontSize="12" fontWeight="bold" fontFamily="monospace">{orOut}</text>
                </svg>
                <div className="text-center mt-2 text-[11px] font-mono text-[#526b88]">
                  Output: <strong className={orOut ? 'text-[#0d9488]' : 'text-[#647895]'}>{orOut ? 'HIGH (1)' : 'LOW (0)'}</strong>
                </div>
              </div>

              {/* XOR Gate Card */}
              <div className="rounded-xl bg-white p-4 border border-[#203247]/10 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#647895] mb-3">
                  <span>XOR GATE</span>
                  <span className="text-[10px] text-[#347f7a]">Y = A ⊕ B</span>
                </div>
                <svg viewBox="0 0 200 80" className="w-full h-16">
                  {/* Inputs */}
                  <line x1="10" y1="25" x2="62" y2="25" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                  <line x1="10" y1="55" x2="62" y2="55" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />
                  <text x="14" y="20" fill="#647895" fontSize="10" fontFamily="monospace">A:{inA}</text>
                  <text x="14" y="70" fill="#647895" fontSize="10" fontFamily="monospace">B:{inB}</text>

                  {/* Extra XOR input arc */}
                  <path d="M 48,15 Q 68,40 48,65" fill="none" stroke="#203247" strokeWidth="2" />
                  {/* XOR Gate Body */}
                  <path d="M 56,15 Q 76,40 56,65 Q 86,65 116,40 Q 86,15 56,15 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />

                  {/* Output */}
                  <line x1="116" y1="40" x2="160" y2="40" stroke={wireColor(xorOut)} strokeWidth={wireWidth(xorOut)} />
                  <circle cx="170" cy="40" r="8" fill={xorOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                  <text x="184" y="44" fill={xorOut ? '#0d9488' : '#647895'} fontSize="12" fontWeight="bold" fontFamily="monospace">{xorOut}</text>
                </svg>
                <div className="text-center mt-2 text-[11px] font-mono text-[#526b88]">
                  Output: <strong className={xorOut ? 'text-[#0d9488]' : 'text-[#647895]'}>{xorOut ? 'HIGH (1)' : 'LOW (0)'}</strong>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ 2. UNIVERSAL GATES SCHEMATIC ═══ */}
        {diagramType === 'universal-gates' && (() => {
          const nandOut = !(inA && inB) ? 1 : 0;
          const norOut = !(inA || inB) ? 1 : 0;
          return (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-[680px]">
              {/* NAND */}
              <div className="rounded-xl bg-white p-5 border border-[#203247]/10 shadow-xs flex-1">
                <span className="font-mono text-xs font-bold text-[#347f7a]">NAND GATE (A·B)'</span>
                <svg viewBox="0 0 200 80" className="w-full h-16 mt-2">
                  <line x1="10" y1="25" x2="60" y2="25" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                  <line x1="10" y1="55" x2="60" y2="55" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />
                  <path d="M 60,15 L 90,15 A 25,25 0 0,1 90,65 L 60,65 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                  <circle cx="119" cy="40" r="4" fill="white" stroke="#203247" strokeWidth="2" />
                  <line x1="123" y1="40" x2="165" y2="40" stroke={wireColor(nandOut)} strokeWidth={wireWidth(nandOut)} />
                  <circle cx="175" cy="40" r="8" fill={nandOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                  <text x="188" y="44" fill={nandOut ? '#0d9488' : '#647895'} fontSize="12" fontWeight="bold" fontFamily="monospace">{nandOut}</text>
                </svg>
                <p className="text-[11px] text-[#647895] mt-1 font-mono">Inverted AND. Complete single-gate logic set.</p>
              </div>

              {/* NOR */}
              <div className="rounded-xl bg-white p-5 border border-[#203247]/10 shadow-xs flex-1">
                <span className="font-mono text-xs font-bold text-[#347f7a]">NOR GATE (A+B)'</span>
                <svg viewBox="0 0 200 80" className="w-full h-16 mt-2">
                  <line x1="10" y1="25" x2="65" y2="25" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                  <line x1="10" y1="55" x2="65" y2="55" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />
                  <path d="M 55,15 Q 75,40 55,65 Q 85,65 115,40 Q 85,15 55,15 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                  <circle cx="119" cy="40" r="4" fill="white" stroke="#203247" strokeWidth="2" />
                  <line x1="123" y1="40" x2="165" y2="40" stroke={wireColor(norOut)} strokeWidth={wireWidth(norOut)} />
                  <circle cx="175" cy="40" r="8" fill={norOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                  <text x="188" y="44" fill={norOut ? '#0d9488' : '#647895'} fontSize="12" fontWeight="bold" fontFamily="monospace">{norOut}</text>
                </svg>
                <p className="text-[11px] text-[#647895] mt-1 font-mono">Inverted OR. Powered the Apollo Guidance Computer.</p>
              </div>
            </div>
          );
        })()}

        {/* ═══ 3. HALF ADDER SCHEMATIC ═══ */}
        {diagramType === 'half-adder' && (() => {
          const sum = (inA ^ inB) ? 1 : 0;
          const carry = (inA && inB) ? 1 : 0;
          return (
            <div className="w-full max-w-[620px] bg-white rounded-xl p-5 border border-[#203247]/10 shadow-xs">
              <svg viewBox="0 0 460 160" className="w-full h-44">
                {/* Input bus lines */}
                <line x1="20" y1="35" x2="160" y2="35" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                <line x1="20" y1="125" x2="160" y2="125" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />

                {/* Split to XOR */}
                <line x1="70" y1="35" x2="70" y2="50" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                <line x1="70" y1="50" x2="160" y2="50" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />

                {/* Split to AND */}
                <line x1="110" y1="35" x2="110" y2="105" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                <line x1="110" y1="105" x2="160" y2="105" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />

                {/* Input labels */}
                <text x="25" y="28" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">A = {inA}</text>
                <text x="25" y="145" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">B = {inB}</text>

                {/* XOR GATE (SUM) */}
                <path d="M 152,25 Q 172,45 152,65" fill="none" stroke="#203247" strokeWidth="2" />
                <path d="M 160,25 Q 180,45 160,65 Q 190,65 220,45 Q 190,25 160,25 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                <text x="180" y="49" fill="#647895" fontSize="10" fontFamily="monospace">XOR</text>

                {/* AND GATE (CARRY) */}
                <path d="M 160,95 L 190,95 A 20,20 0 0,1 190,135 L 160,135 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                <text x="175" y="119" fill="#647895" fontSize="10" fontFamily="monospace">AND</text>

                {/* Outputs */}
                <line x1="220" y1="45" x2="330" y2="45" stroke={wireColor(sum)} strokeWidth={wireWidth(sum)} />
                <circle cx="345" cy="45" r="9" fill={sum ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                <text x="365" y="49" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Sum (S) = {sum}</text>

                <line x1="210" y1="115" x2="330" y2="115" stroke={wireColor(carry)} strokeWidth={wireWidth(carry)} />
                <circle cx="345" cy="115" r="9" fill={carry ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                <text x="365" y="119" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Carry (C) = {carry}</text>
              </svg>
            </div>
          );
        })()}

        {/* ═══ 4. FULL ADDER SCHEMATIC ═══ */}
        {diagramType === 'full-adder' && (() => {
          const sum = (inA ^ inB ^ inCin) ? 1 : 0;
          const cout = ((inA && inB) || (inCin && (inA ^ inB))) ? 1 : 0;
          return (
            <div className="w-full max-w-[700px] bg-white rounded-xl p-5 border border-[#203247]/10 shadow-xs">
              <svg viewBox="0 0 540 180" className="w-full h-48">
                {/* Inputs */}
                <text x="20" y="30" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">A = {inA}</text>
                <text x="20" y="60" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">B = {inB}</text>
                <text x="20" y="150" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">Cin = {inCin}</text>

                {/* Stage 1 Half Adder Box */}
                <rect x="110" y="15" width="110" height="70" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="125" y="45" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="monospace">Half Adder 1</text>
                <text x="135" y="65" fill="#647895" fontSize="9" fontFamily="monospace">(A ⊕ B)</text>

                {/* Stage 2 Half Adder Box */}
                <rect x="270" y="35" width="110" height="70" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="285" y="65" fill="#334155" fontSize="11" fontWeight="bold" fontFamily="monospace">Half Adder 2</text>
                <text x="295" y="85" fill="#647895" fontSize="9" fontFamily="monospace">(S₁ ⊕ Cin)</text>

                {/* OR Gate for Carry */}
                <path d="M 370,120 Q 390,140 370,160 Q 400,160 430,140 Q 400,120 370,120 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                <text x="390" y="144" fill="#647895" fontSize="10" fontFamily="monospace">OR</text>

                {/* Wires */}
                <line x1="75" y1="28" x2="110" y2="28" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                <line x1="75" y1="58" x2="110" y2="58" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />

                {/* Interconnect S1 to HA2 */}
                <line x1="220" y1="45" x2="270" y2="45" stroke={wireColor(inA ^ inB)} strokeWidth={wireWidth(inA ^ inB)} />
                {/* Cin to HA2 */}
                <line x1="75" y1="145" x2="250" y2="145" stroke={wireColor(inCin)} strokeWidth={wireWidth(inCin)} />
                <line x1="250" y1="145" x2="250" y2="80" stroke={wireColor(inCin)} strokeWidth={wireWidth(inCin)} />
                <line x1="250" y1="80" x2="270" y2="80" stroke={wireColor(inCin)} strokeWidth={wireWidth(inCin)} />

                {/* Sum Output from HA2 */}
                <line x1="380" y1="55" x2="450" y2="55" stroke={wireColor(sum)} strokeWidth={wireWidth(sum)} />
                <circle cx="465" cy="55" r="9" fill={sum ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                <text x="485" y="59" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">SUM = {sum}</text>

                {/* Carry Out from OR Gate */}
                <line x1="430" y1="140" x2="450" y2="140" stroke={wireColor(cout)} strokeWidth={wireWidth(cout)} />
                <circle cx="465" cy="140" r="9" fill={cout ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                <text x="485" y="144" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Cout = {cout}</text>
              </svg>
            </div>
          );
        })()}

        {/* ═══ 5. MULTIPLEXER SCHEMATIC ═══ */}
        {diagramType === 'multiplexer' && (() => {
          const muxOut = inSel === 0 ? inA : inB;
          return (
            <div className="w-full max-w-[560px] bg-white rounded-xl p-5 border border-[#203247]/10 shadow-xs">
              <svg viewBox="0 0 420 160" className="w-full h-44">
                <text x="25" y="45" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">I₀ = {inA}</text>
                <text x="25" y="115" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">I₁ = {inB}</text>

                {/* Multiplexer Trapezoid Body */}
                <polygon points="140,20 220,40 220,120 140,140" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
                <text x="160" y="85" fill="#334155" fontSize="14" fontWeight="bold" fontFamily="monospace">2:1 MUX</text>

                {/* Select line at bottom */}
                <line x1="180" y1="160" x2="180" y2="130" stroke={wireColor(inSel)} strokeWidth={wireWidth(inSel)} />
                <text x="145" y="155" fill="#203247" fontSize="11" fontWeight="bold" fontFamily="monospace">Sel:{inSel}</text>

                {/* Input Wires */}
                <line x1="75" y1="40" x2="140" y2="40" stroke={wireColor(inA)} strokeWidth={wireWidth(inA)} />
                <line x1="75" y1="120" x2="140" y2="120" stroke={wireColor(inB)} strokeWidth={wireWidth(inB)} />

                {/* Output Wire */}
                <line x1="220" y1="80" x2="310" y2="80" stroke={wireColor(muxOut)} strokeWidth={wireWidth(muxOut)} />
                <circle cx="325" cy="80" r="9" fill={muxOut ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
                <text x="345" y="84" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Y = {muxOut}</text>
              </svg>
            </div>
          );
        })()}

        {/* ═══ 6. SR LATCH SCHEMATIC ═══ */}
        {diagramType === 'sr-latch' && (
          <div className="w-full max-w-[580px] bg-white rounded-xl p-5 border border-[#203247]/10 shadow-xs">
            <svg viewBox="0 0 460 160" className="w-full h-44">
              <text x="20" y="40" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">Reset (R) = {inB}</text>
              <text x="20" y="125" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">Set (S) = {inA}</text>

              {/* NOR Gate 1 (Top) */}
              <path d="M 150,20 Q 170,45 150,70 Q 180,70 210,45 Q 180,20 150,20 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
              <circle cx="214" cy="45" r="4" fill="white" stroke="#203247" strokeWidth="2" />
              <text x="170" y="49" fill="#647895" fontSize="10" fontFamily="monospace">NOR</text>

              {/* NOR Gate 2 (Bottom) */}
              <path d="M 150,95 Q 170,120 150,145 Q 180,145 210,120 Q 180,95 150,95 Z" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
              <circle cx="214" cy="120" r="4" fill="white" stroke="#203247" strokeWidth="2" />
              <text x="170" y="124" fill="#647895" fontSize="10" fontFamily="monospace">NOR</text>

              {/* Cross-coupled Feedback */}
              <path d="M 230,45 L 260,45 L 260,85 L 130,85 L 130,105 L 150,105" fill="none" stroke={wireColor(latchQ)} strokeWidth="1.5" />
              <path d="M 230,120 L 260,120 L 260,80 L 140,80 L 140,60 L 150,60" fill="none" stroke={wireColor(latchQ ? 0 : 1)} strokeWidth="1.5" />

              {/* Outputs */}
              <line x1="218" y1="45" x2="350" y2="45" stroke={wireColor(latchQ)} strokeWidth={wireWidth(latchQ)} />
              <circle cx="365" cy="45" r="9" fill={latchQ ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
              <text x="385" y="49" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Q = {latchQ}</text>

              <line x1="218" y1="120" x2="350" y2="120" stroke={wireColor(latchQ ? 0 : 1)} strokeWidth={wireWidth(latchQ ? 0 : 1)} />
              <circle cx="365" cy="120" r="9" fill={latchQ ? '#e2e8f0' : '#0d9488'} stroke="#203247" strokeWidth="1.5" />
              <text x="385" y="124" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Q̅ = {latchQ ? 0 : 1}</text>
            </svg>
          </div>
        )}

        {/* ═══ 7. D FLIP-FLOP & JK FLIP-FLOP SCHEMATIC ═══ */}
        {(diagramType === 'd-flip-flop' || diagramType === 'jk-flip-flop') && (
          <div className="w-full max-w-[560px] bg-white rounded-xl p-5 border border-[#203247]/10 shadow-xs">
            <svg viewBox="0 0 420 160" className="w-full h-44">
              <text x="25" y="50" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">D = {inD}</text>
              <text x="25" y="115" fill="#203247" fontSize="12" fontWeight="bold" fontFamily="monospace">CLK = {inClk}</text>

              {/* Flip Flop Box */}
              <rect x="130" y="20" width="130" height="120" rx="8" fill="#f8fafc" stroke="#203247" strokeWidth="2" />
              <text x="160" y="70" fill="#203247" fontSize="14" fontWeight="bold" fontFamily="monospace">D-FF</text>
              <text x="145" y="90" fill="#647895" fontSize="10" fontFamily="monospace">Positive Edge</text>

              {/* Clock triangle arrow input */}
              <polyline points="130,105 142,110 130,115" fill="none" stroke="#203247" strokeWidth="2" />

              {/* Input Wires */}
              <line x1="75" y1="45" x2="130" y2="45" stroke={wireColor(inD)} strokeWidth={wireWidth(inD)} />
              <line x1="75" y1="110" x2="130" y2="110" stroke={wireColor(inClk)} strokeWidth={wireWidth(inClk)} />

              {/* Output Wires */}
              <line x1="260" y1="50" x2="330" y2="50" stroke={wireColor(inD)} strokeWidth={wireWidth(inD)} />
              <circle cx="345" cy="50" r="9" fill={inD ? '#0d9488' : '#e2e8f0'} stroke="#203247" strokeWidth="1.5" />
              <text x="365" y="54" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Q = {inD}</text>

              <line x1="260" y1="110" x2="330" y2="110" stroke={wireColor(inD ? 0 : 1)} strokeWidth={wireWidth(inD ? 0 : 1)} />
              <circle cx="345" cy="110" r="9" fill={inD ? '#e2e8f0' : '#0d9488'} stroke="#203247" strokeWidth="1.5" />
              <text x="365" y="114" fill="#203247" fontSize="13" fontWeight="bold" fontFamily="monospace">Q̅ = {inD ? 0 : 1}</text>
            </svg>
          </div>
        )}
      </div>

      {/* Dynamic Live Explanation for Beginners */}
      <div className="mt-4 rounded-xl bg-white p-3.5 border border-[#203247]/10 flex items-center justify-between gap-3 text-xs text-[#526b88]">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#347f7a]/15 text-[#347f7a] font-bold text-xs shrink-0">
            ⚡
          </span>
          <span>
            {(diagramType === 'basic-gates' || diagramType === 'boolean-algebra') && (
              <>Current state: <strong>A={inA}, B={inB}</strong> → AND output is <strong>{inA && inB ? '1 (ON)' : '0 (OFF)'}</strong>, OR is <strong>{inA || inB ? '1 (ON)' : '0 (OFF)'}</strong>, XOR is <strong>{(inA ^ inB) ? '1 (ON)' : '0 (OFF)'}</strong>.</>
            )}
            {diagramType === 'half-adder' && (
              <>Adding <strong>{inA} + {inB}</strong>: Result is <strong>{inA + inB} in decimal</strong> (Binary: <strong>{inA && inB ? '10' : (inA ^ inB) ? '01' : '00'}</strong>). Sum = <strong>{inA ^ inB}</strong>, Carry = <strong>{inA && inB ? 1 : 0}</strong>.</>
            )}
            {diagramType === 'full-adder' && (
              <>Adding <strong>A({inA}) + B({inB}) + Cin({inCin})</strong>: Result is <strong>{inA + inB + inCin} in decimal</strong>. Sum bit is <strong>{inA ^ inB ^ inCin}</strong>, Carry-out to next column is <strong>{((inA && inB) || (inCin && (inA ^ inB))) ? 1 : 0}</strong>.</>
            )}
            {diagramType === 'multiplexer' && (
              <>Select line is <strong>{inSel}</strong> → Channel <strong>I{inSel}</strong> (holding value <strong>{inSel === 0 ? inA : inB}</strong>) is routed straight to Output Y.</>
            )}
            {diagramType === 'sr-latch' && (
              <>Set={inA}, Reset={inB} → Latch state is <strong>{latchQ ? 'SET (1)' : 'RESET (0)'}</strong>. The cross-coupled feedback loop maintains this bit!</>
            )}
            {(diagramType === 'd-flip-flop' || diagramType === 'jk-flip-flop') && (
              <>Clock is <strong>{inClk ? 'HIGH (1)' : 'LOW (0)'}</strong>, Data is <strong>{inD}</strong>. Output Q captures and stores <strong>{inD}</strong> on the rising clock edge.</>
            )}
            {diagramType === 'universal-gates' && (
              <>Inputs A={inA}, B={inB} → NAND produces <strong>{!(inA && inB) ? '1' : '0'}</strong>, NOR produces <strong>{!(inA || inB) ? '1' : '0'}</strong>. Inverting inputs gives you any other gate!</>
            )}
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-[#347f7a] font-bold uppercase tracking-wider shrink-0 bg-[#347f7a]/10 px-2.5 py-1 rounded-full">
          Live Logic Flow
        </span>
      </div>
    </div>
  );
};
