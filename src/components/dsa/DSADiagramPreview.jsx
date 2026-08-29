import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

/* Reusable SVG arrow pointing right */
const Arrow = () => (
  <div className="flex items-center px-1 shrink-0">
    <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
      <line x1="0" y1="6" x2="22" y2="6" stroke="#647895" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="22,2 28,6 22,10" fill="#647895"/>
    </svg>
  </div>
);

/* Reusable SVG bidirectional arrow */
const BiArrow = () => (
  <div className="flex items-center px-0.5 shrink-0">
    <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
      <polygon points="0,6 6,2 6,10" fill="#647895"/>
      <line x1="6" y1="6" x2="26" y2="6" stroke="#647895" strokeWidth="1.5"/>
      <polygon points="26,2 32,6 26,10" fill="#647895"/>
    </svg>
  </div>
);

export const DSADiagramPreview = ({ diagramType = 'linked-list', title = '' }) => {
  return (
    <div className="rounded-2xl border border-[#203247]/10 bg-[#faf8f4] p-6 sm:p-7 text-[#203247]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 border-b border-[#203247]/8 pb-3">
        <span className="font-mono-signal text-[11px] font-semibold text-[#526b88] uppercase tracking-[0.18em]">
          STRUCTURE • {title.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-[#647895]">
          Architectural Diagram
        </span>
      </div>

      {/* CANVAS */}
      <div className="rounded-xl border border-[#203247]/8 bg-[#f5f2ea] p-6 sm:p-8 overflow-x-auto flex items-center justify-center min-h-[180px]">

        {/* ═══ SINGLY LINKED LIST ═══ */}
        {diagramType === 'linked-list' && (
          <div className="flex items-center gap-3 min-w-[500px] py-2">
            <div className="flex flex-col items-center mr-2">
              <span className="font-mono text-[11px] font-bold text-[#347f7a] tracking-wider mb-1">HEAD</span>
              <div className="h-4 w-0.5 bg-[#347f7a]/40"></div>
              <ArrowRight size={13} className="text-[#347f7a]" />
            </div>
            {[10, 20, 30].map((val, i) => (
              <React.Fragment key={val}>
                <div className={`flex items-center bg-white border ${i === 2 ? 'border-[#347f7a]/40' : 'border-[#203247]/15'} rounded-xl px-4 py-2.5 shadow-xs gap-3`}>
                  <span className={`font-mono text-base font-bold ${i === 2 ? 'text-[#347f7a]' : 'text-[#203247]'}`}>{val}</span>
                  <div className="h-4 w-[1px] bg-[#203247]/10"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#647895]">next</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#347f7a]"></div>
                  </div>
                </div>
                {i < 2 && <Arrow />}
              </React.Fragment>
            ))}
            <Arrow />
            <div className="rounded-xl border border-[#203247]/10 bg-[#e8e4da] px-3.5 py-2 text-xs font-mono font-semibold text-[#647895]">NULL</div>
          </div>
        )}

        {/* ═══ DOUBLY LINKED LIST ═══ */}
        {diagramType === 'doubly-linked-list' && (
          <div className="flex items-center gap-2 min-w-[540px] py-2">
            <div className="flex flex-col items-center mr-1">
              <span className="font-mono text-[10px] font-bold text-[#647895]">NULL</span>
              <ArrowLeft size={11} className="text-[#647895]" />
            </div>
            {[10, 20, 30].map((val, i) => (
              <React.Fragment key={val}>
                <div className="flex items-center bg-white border border-[#203247]/15 rounded-xl px-3 py-2 shadow-xs gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#f09a7d]"></div>
                    <span className="font-mono text-[9px] text-[#647895]">prev</span>
                  </div>
                  <div className="h-4 w-[1px] bg-[#203247]/10"></div>
                  <span className="font-mono text-base font-bold text-[#203247]">{val}</span>
                  <div className="h-4 w-[1px] bg-[#203247]/10"></div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] text-[#647895]">next</span>
                    <div className="w-2 h-2 rounded-full bg-[#347f7a]"></div>
                  </div>
                </div>
                {i < 2 && <BiArrow />}
              </React.Fragment>
            ))}
            <div className="flex flex-col items-center ml-1">
              <span className="font-mono text-[10px] font-bold text-[#647895]">NULL</span>
              <ArrowRight size={11} className="text-[#647895]" />
            </div>
          </div>
        )}

        {/* ═══ ARRAY ═══ */}
        {diagramType === 'array' && (
          <div className="flex items-center gap-3 min-w-[480px] py-2">
            {[15, 42, 8, 93, 27].map((val, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#647895] mb-1">0x{1000 + i * 4}</span>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-base border ${i === 1 ? 'bg-[#203247] border-[#203247] text-white shadow-xs' : 'bg-white border-[#203247]/15 text-[#203247]'}`}>
                  {val}
                </div>
                <span className="font-mono text-xs text-[#347f7a] mt-1.5 font-semibold">[{i}]</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ STACK (LIFO) ═══ */}
        {diagramType === 'stack' && (
          <div className="flex items-center justify-around gap-8 min-w-[420px] py-2">
            <div className="flex flex-col gap-2 w-44 border-x border-b border-[#203247]/20 rounded-b-xl p-2.5 bg-white/60">
              <div className="bg-[#347f7a] rounded-lg p-2 text-center font-mono font-bold text-xs text-white shadow-xs">
                Top: Frame(30)
              </div>
              <div className="bg-white border border-[#203247]/10 rounded-lg p-2 text-center font-mono text-xs text-[#203247]">
                Frame(20)
              </div>
              <div className="bg-white border border-[#203247]/10 rounded-lg p-2 text-center font-mono text-xs text-[#203247]">
                Frame(10)
              </div>
            </div>
            <div className="flex flex-col gap-3 font-mono text-xs text-[#526b88]">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#203247]/10">
                <span className="text-[#347f7a] font-bold">➔ PUSH:</span> Enters top
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#203247]/10">
                <span className="text-[#f09a7d] font-bold">⬅ POP:</span> Exits top
              </div>
            </div>
          </div>
        )}

        {/* ═══ QUEUE (FIFO) ═══ */}
        {diagramType === 'queue' && (
          <div className="flex flex-col items-center gap-4 min-w-[480px] py-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center mr-2">
                <span className="font-mono text-[10px] font-bold text-[#347f7a]">ENQUEUE</span>
                <ArrowRight size={13} className="text-[#347f7a]" />
              </div>
              <div className="flex items-center border border-[#203247]/15 rounded-xl bg-white/60 overflow-hidden">
                {['A', 'B', 'C', 'D'].map((val, i) => (
                  <div key={val} className={`w-14 h-12 flex items-center justify-center font-mono font-bold text-sm border-r border-[#203247]/10 last:border-r-0 ${i === 3 ? 'bg-[#347f7a] text-white' : 'bg-white text-[#203247]'}`}>
                    {val}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center ml-2">
                <span className="font-mono text-[10px] font-bold text-[#f09a7d]">DEQUEUE</span>
                <ArrowRight size={13} className="text-[#f09a7d]" />
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px] text-[#526b88]">
              <span>← REAR (new items enter)</span>
              <span>FRONT (served first) →</span>
            </div>
          </div>
        )}

        {/* ═══ DEQUE (DOUBLE-ENDED QUEUE) ═══ */}
        {diagramType === 'deque' && (
          <div className="flex flex-col items-center gap-4 min-w-[500px] py-2">
            <div className="flex items-center gap-2">
              {/* Left end operations */}
              <div className="flex flex-col items-center gap-0.5 mr-2">
                <span className="font-mono text-[9px] font-bold text-[#347f7a]">push_front</span>
                <ArrowRight size={11} className="text-[#347f7a]" />
                <ArrowLeft size={11} className="text-[#f09a7d]" />
                <span className="font-mono text-[9px] font-bold text-[#f09a7d]">pop_front</span>
              </div>

              <div className="flex items-center border-2 border-[#203247]/20 rounded-xl bg-white/60 overflow-hidden">
                {['X', 'A', 'B', 'C', 'Y'].map((val, i) => (
                  <div key={i} className={`w-12 h-12 flex items-center justify-center font-mono font-bold text-sm border-r border-[#203247]/10 last:border-r-0 ${(i === 0 || i === 4) ? 'bg-[#347f7a]/15 text-[#347f7a]' : 'bg-white text-[#203247]'}`}>
                    {val}
                  </div>
                ))}
              </div>

              {/* Right end operations */}
              <div className="flex flex-col items-center gap-0.5 ml-2">
                <span className="font-mono text-[9px] font-bold text-[#347f7a]">push_back</span>
                <ArrowLeft size={11} className="text-[#347f7a]" />
                <ArrowRight size={11} className="text-[#f09a7d]" />
                <span className="font-mono text-[9px] font-bold text-[#f09a7d]">pop_back</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#526b88]">
              ← Both ends support insert & remove in O(1) →
            </div>
          </div>
        )}

        {/* ═══ BINARY SEARCH TREE — 3 levels, left < parent < right ═══ */}
        {diagramType === 'tree' && (
          <div className="flex flex-col items-center py-2 min-w-[380px]">
            <svg width="340" height="200" viewBox="0 0 340 200" fill="none">
              {/* Edges — Level 0→1 */}
              <line x1="170" y1="22" x2="90" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="170" y1="22" x2="250" y2="82" stroke="#647895" strokeWidth="1.5"/>
              {/* Edges — Level 1→2 */}
              <line x1="90" y1="82" x2="45" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="135" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="82" x2="205" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="82" x2="295" y2="148" stroke="#647895" strokeWidth="1.5"/>

              {/* Edge Pill Badges */}
              <g transform="translate(130, 52)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt; 50</text>
              </g>
              <g transform="translate(210, 52)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&gt; 50</text>
              </g>
              <g transform="translate(67.5, 115)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt; 30</text>
              </g>
              <g transform="translate(112.5, 115)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&gt; 30</text>
              </g>
              <g transform="translate(227.5, 115)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt; 70</text>
              </g>
              <g transform="translate(272.5, 115)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&gt; 70</text>
              </g>

              {/* Root Node */}
              <circle cx="170" cy="22" r="16" fill="#203247"/>
              <text x="170" y="27" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">50</text>

              {/* Level 1 Nodes */}
              <circle cx="90" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="90" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">30</text>
              <circle cx="250" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="250" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">70</text>

              {/* Level 2 Nodes */}
              <circle cx="45" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="45" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">20</text>
              <circle cx="135" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="135" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">40</text>
              <circle cx="205" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="205" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">60</text>
              <circle cx="295" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="295" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">80</text>

              {/* Inorder Summary */}
              <text x="170" y="192" textAnchor="middle" fill="#647895" fontSize="10" fontFamily="monospace">inorder: 20 → 30 → 40 → 50 → 60 → 70 → 80</text>
            </svg>
          </div>
        )}

        {/* ═══ AVL TREE (SELF-BALANCING BST) ═══ */}
        {diagramType === 'avl-tree' && (
          <div className="flex flex-col items-center py-2 min-w-[380px]">
            <svg width="340" height="205" viewBox="0 0 340 205" fill="none">
              {/* Edges */}
              <line x1="170" y1="22" x2="90" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="170" y1="22" x2="250" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="45" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="135" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="82" x2="295" y2="148" stroke="#647895" strokeWidth="1.5"/>

              {/* Edge Badges */}
              <g transform="translate(130, 52)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&lt; 40</text>
              </g>
              <g transform="translate(210, 52)">
                <rect x="-18" y="-9" width="36" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">&gt; 40</text>
              </g>

              {/* Root Node (BF: +1) */}
              <circle cx="170" cy="22" r="16" fill="#203247"/>
              <text x="170" y="27" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">40</text>
              <text x="198" y="18" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">BF: +1</text>

              {/* Level 1 Nodes */}
              <circle cx="90" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="90" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">20</text>
              <text x="118" y="78" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">BF: 0</text>

              <circle cx="250" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="250" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">60</text>
              <text x="278" y="78" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">BF: -1</text>

              {/* Level 2 Nodes */}
              <circle cx="45" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="45" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">10</text>
              <text x="63" y="144" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">BF:0</text>

              <circle cx="135" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="135" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">30</text>
              <text x="153" y="144" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">BF:0</text>

              <circle cx="295" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="295" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">70</text>
              <text x="313" y="144" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">BF:0</text>

              {/* Balance Factor Invariant Note */}
              <text x="170" y="194" textAnchor="middle" fill="#647895" fontSize="10" fontFamily="monospace">Balance Factor = H(Left) - H(Right) ∈ &#123;-1, 0, +1&#125;</text>
            </svg>
          </div>
        )}

        {/* ═══ RED-BLACK TREE ═══ */}
        {diagramType === 'red-black-tree' && (
          <div className="flex flex-col items-center py-2 min-w-[380px]">
            <svg width="340" height="205" viewBox="0 0 340 205" fill="none">
              {/* Edges */}
              <line x1="170" y1="22" x2="90" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="170" y1="22" x2="250" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="45" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="135" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="82" x2="295" y2="148" stroke="#647895" strokeWidth="1.5"/>

              {/* Root Node — Always BLACK */}
              <circle cx="170" cy="22" r="16" fill="#203247" stroke="#000000" strokeWidth="2"/>
              <text x="170" y="27" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">30</text>
              <text x="198" y="18" fill="#647895" fontSize="8" fontFamily="monospace" fontWeight="bold">BLACK</text>

              {/* Level 1 Nodes — RED & BLACK */}
              <circle cx="90" cy="82" r="16" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5"/>
              <text x="90" y="87" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">15</text>
              <text x="118" y="78" fill="#dc2626" fontSize="8" fontFamily="monospace" fontWeight="bold">RED</text>

              <circle cx="250" cy="82" r="16" fill="#203247" stroke="#000000" strokeWidth="1.5"/>
              <text x="250" y="87" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">70</text>
              <text x="278" y="78" fill="#647895" fontSize="8" fontFamily="monospace" fontWeight="bold">BLACK</text>

              {/* Level 2 Nodes — BLACK under RED */}
              <circle cx="45" cy="148" r="14" fill="#203247" stroke="#000000" strokeWidth="1.2"/>
              <text x="45" y="153" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">10</text>
              <text x="63" y="144" fill="#647895" fontSize="8" fontFamily="monospace">BLK</text>

              <circle cx="135" cy="148" r="14" fill="#203247" stroke="#000000" strokeWidth="1.2"/>
              <text x="135" y="153" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">20</text>
              <text x="153" y="144" fill="#647895" fontSize="8" fontFamily="monospace">BLK</text>

              <circle cx="295" cy="148" r="14" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2"/>
              <text x="295" y="153" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace">85</text>
              <text x="313" y="144" fill="#dc2626" fontSize="8" fontFamily="monospace" fontWeight="bold">RED</text>

              {/* Red-Black Invariant Note */}
              <text x="170" y="194" textAnchor="middle" fill="#647895" fontSize="9.5" fontFamily="monospace">Rules: Root is Black • No Red-Red • Equal Black-Height (2)</text>
            </svg>
          </div>
        )}

        {/* ═══ BINARY HEAP (MIN-HEAP) — parent ≤ children, complete tree ═══ */}
        {diagramType === 'heap' && (
          <div className="flex flex-col items-center py-2 min-w-[380px]">
            <svg width="340" height="200" viewBox="0 0 340 200" fill="none">
              {/* Edges — Level 0→1 */}
              <line x1="170" y1="22" x2="90" y2="82" stroke="#647895" strokeWidth="1.5"/>
              <line x1="170" y1="22" x2="250" y2="82" stroke="#647895" strokeWidth="1.5"/>
              {/* Edges — Level 1→2 */}
              <line x1="90" y1="82" x2="45" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="82" x2="135" y2="148" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="82" x2="205" y2="148" stroke="#647895" strokeWidth="1.5"/>

              {/* Edge Badges */}
              <g transform="translate(130, 52)">
                <rect x="-24" y="-9" width="48" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">3 ≤ 10 ✓</text>
              </g>
              <g transform="translate(210, 52)">
                <rect x="-24" y="-9" width="48" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">3 ≤ 15 ✓</text>
              </g>
              <g transform="translate(67.5, 115)">
                <rect x="-26" y="-9" width="52" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">10 ≤ 25 ✓</text>
              </g>
              <g transform="translate(112.5, 115)">
                <rect x="-26" y="-9" width="52" height="18" rx="5" fill="#f5f2ea" stroke="#203247" strokeOpacity="0.15" strokeWidth="1"/>
                <text x="0" y="3.5" textAnchor="middle" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">10 ≤ 18 ✓</text>
              </g>

              {/* Root — MIN */}
              <circle cx="170" cy="22" r="16" fill="#347f7a"/>
              <text x="170" y="27" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">3</text>
              <text x="196" y="18" fill="#347f7a" fontSize="9" fontFamily="monospace" fontWeight="bold">MIN</text>

              {/* Level 1 */}
              <circle cx="90" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="90" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">10</text>
              <circle cx="250" cy="82" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="250" y="87" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">15</text>

              {/* Level 2 */}
              <circle cx="45" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="45" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">25</text>
              <circle cx="135" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="135" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">18</text>
              <circle cx="205" cy="148" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="205" y="153" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">30</text>

              {/* Array Representation */}
              <text x="170" y="192" textAnchor="middle" fill="#647895" fontSize="10" fontFamily="monospace">array: [ 3, 10, 15, 25, 18, 30 ]</text>
            </svg>
          </div>
        )}

        {/* ═══ GRAPH ═══ */}
        {diagramType === 'graph' && (
          <div className="flex items-center justify-center py-2 min-w-[300px]">
            <svg width="280" height="170" viewBox="0 0 280 170" fill="none">
              <line x1="65" y1="38" x2="140" y2="28" stroke="#647895" strokeWidth="1.5"/>
              <line x1="65" y1="38" x2="55" y2="120" stroke="#647895" strokeWidth="1.5"/>
              <line x1="140" y1="28" x2="215" y2="45" stroke="#647895" strokeWidth="1.5"/>
              <line x1="140" y1="28" x2="130" y2="110" stroke="#647895" strokeWidth="1.5"/>
              <line x1="55" y1="120" x2="130" y2="110" stroke="#647895" strokeWidth="1.5"/>
              <line x1="215" y1="45" x2="220" y2="130" stroke="#647895" strokeWidth="1.5"/>
              <line x1="130" y1="110" x2="220" y2="130" stroke="#647895" strokeWidth="1.5"/>
              <circle cx="65" cy="38" r="16" fill="#203247" stroke="#347f7a" strokeWidth="2"/>
              <text x="65" y="43" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">A</text>
              <circle cx="140" cy="28" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="140" y="33" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">B</text>
              <circle cx="215" cy="45" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="215" y="50" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">C</text>
              <circle cx="55" cy="120" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="55" y="125" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">D</text>
              <circle cx="130" cy="110" r="16" fill="#347f7a" stroke="#203247" strokeWidth="1.5"/>
              <text x="130" y="115" textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace" fontWeight="bold">E</text>
              <circle cx="220" cy="130" r="16" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="220" y="135" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">F</text>
            </svg>
          </div>
        )}

        {/* ═══ HASH TABLE ═══ */}
        {diagramType === 'hash-table' && (
          <div className="flex items-center gap-6 min-w-[460px] py-2">
            <div className="flex flex-col gap-2">
              {['alice', 'bob', 'carol'].map((key) => (
                <div key={key} className="bg-white border border-[#203247]/15 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-[#203247]">
                  "{key}"
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[10px] text-[#347f7a] font-bold">hash(key)</span>
              <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                <line x1="0" y1="6" x2="32" y2="6" stroke="#347f7a" strokeWidth="1.5" strokeLinecap="round"/>
                <polygon points="32,2 40,6 32,10" fill="#347f7a"/>
              </svg>
              <span className="font-mono text-[9px] text-[#647895]">% size</span>
            </div>
            <div className="flex flex-col gap-1">
              {[
                { idx: 0, val: null },
                { idx: 1, val: 'alice → 25' },
                { idx: 2, val: null },
                { idx: 3, val: 'bob → 30' },
                { idx: 4, val: 'carol → 22' },
              ].map((b) => (
                <div key={b.idx} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#647895] w-4 text-right">{b.idx}</span>
                  <div className={`h-7 rounded-lg flex items-center px-3 font-mono text-[11px] min-w-[120px] border ${b.val ? 'bg-white border-[#203247]/15 text-[#203247] font-bold' : 'bg-[#e8e4da]/60 border-[#203247]/8 text-[#647895] italic'}`}>
                    {b.val || 'empty'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TRIE (PREFIX TREE) — character-branching with edge badges ═══ */}
        {diagramType === 'trie' && (
          <div className="flex flex-col items-center py-2 min-w-[380px]">
            <svg width="340" height="200" viewBox="0 0 340 200" fill="none">
              {/* Edges — Root to Level 1 */}
              <line x1="170" y1="22" x2="90" y2="80" stroke="#647895" strokeWidth="1.5"/>
              <line x1="170" y1="22" x2="250" y2="80" stroke="#647895" strokeWidth="1.5"/>
              {/* Edges — Level 1 to Level 2 */}
              <line x1="90" y1="88" x2="50" y2="132" stroke="#647895" strokeWidth="1.5"/>
              <line x1="90" y1="88" x2="130" y2="132" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="88" x2="250" y2="132" stroke="#647895" strokeWidth="1.5"/>
              {/* Edges — Level 2 to Level 3 */}
              <line x1="50" y1="148" x2="50" y2="172" stroke="#647895" strokeWidth="1.5"/>
              <line x1="130" y1="148" x2="130" y2="172" stroke="#647895" strokeWidth="1.5"/>
              <line x1="250" y1="148" x2="250" y2="172" stroke="#647895" strokeWidth="1.5"/>

              {/* Edge labels (characters) */}
              <text x="120" y="48" fill="#347f7a" fontSize="11" fontFamily="monospace" fontWeight="bold">c</text>
              <text x="218" y="48" fill="#347f7a" fontSize="11" fontFamily="monospace" fontWeight="bold">d</text>
              <text x="58" y="112" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">a</text>
              <text x="118" y="112" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">u</text>
              <text x="258" y="112" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">o</text>
              <text x="40" y="165" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">t</text>
              <text x="120" y="165" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">p</text>
              <text x="240" y="165" fill="#347f7a" fontSize="10" fontFamily="monospace" fontWeight="bold">g</text>

              {/* Root node */}
              <circle cx="170" cy="22" r="16" fill="#203247"/>
              <text x="170" y="27" textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold">root</text>

              {/* Level 1 nodes */}
              <circle cx="90" cy="80" r="14" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="90" y="85" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace" fontWeight="bold">c</text>
              <circle cx="250" cy="80" r="14" fill="white" stroke="#203247" strokeWidth="1.5"/>
              <text x="250" y="85" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace" fontWeight="bold">d</text>

              {/* Level 2 nodes */}
              <circle cx="50" cy="140" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="50" y="145" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">a</text>
              <circle cx="130" cy="140" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="130" y="145" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">u</text>
              <circle cx="250" cy="140" r="14" fill="white" stroke="#203247" strokeWidth="1.2"/>
              <text x="250" y="145" textAnchor="middle" fill="#203247" fontSize="12" fontFamily="monospace">o</text>

              {/* Level 3 — end-of-word leaf nodes (teal filled) */}
              <circle cx="50" cy="178" r="11" fill="#347f7a"/>
              <text x="50" y="182" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">t</text>
              <circle cx="130" cy="178" r="11" fill="#347f7a"/>
              <text x="130" y="182" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">p</text>
              <circle cx="250" cy="178" r="11" fill="#347f7a"/>
              <text x="250" y="182" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">g</text>

              {/* Word labels */}
              <text x="72" y="186" fill="#647895" fontSize="9" fontFamily="monospace">"cat" ✓</text>
              <text x="152" y="186" fill="#647895" fontSize="9" fontFamily="monospace">"cup" ✓</text>
              <text x="272" y="186" fill="#647895" fontSize="9" fontFamily="monospace">"dog" ✓</text>
            </svg>
          </div>
        )}

        {/* ═══ SET (UNIQUE COLLECTION) ═══ */}
        {diagramType === 'set' && (
          <div className="flex flex-col items-center gap-4 min-w-[400px] py-2">
            <div className="flex items-center gap-3">
              {/* Set container */}
              <div className="border-2 border-dashed border-[#203247]/25 rounded-2xl px-5 py-4 bg-white/50 flex items-center gap-3">
                {['🍎', '🍋', '🫐', '🍊'].map((item, i) => (
                  <div key={i} className="w-11 h-11 rounded-full bg-white border border-[#203247]/15 flex items-center justify-center text-base shadow-xs">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#526b88]">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#203247]/10">
                <span className="text-[#347f7a] font-bold">add(🍎)</span>
                <span className="text-[#f09a7d]">→ ignored (exists)</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#203247]/10">
                <span className="text-[#347f7a] font-bold">has(🍋)</span>
                <span>→ true in O(1)</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ B-TREE (MULTI-KEY DISK INDEX) ═══ */}
        {diagramType === 'b-tree' && (
          <div className="flex flex-col items-center py-2 min-w-[440px]">
            <svg width="420" height="195" viewBox="0 0 420 195" fill="none">
              {/* Root node: [20 | 50] */}
              <g transform="translate(140, 15)">
                <rect x="0" y="0" width="140" height="36" rx="10" fill="white" stroke="#203247" strokeWidth="1.8" />
                <line x1="70" y1="0" x2="70" y2="36" stroke="#203247" strokeWidth="1.2" strokeDasharray="3 3" />
                <text x="35" y="22" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">20</text>
                <text x="105" y="22" textAnchor="middle" fill="#203247" fontSize="13" fontFamily="monospace" fontWeight="bold">50</text>
              </g>

              {/* Connecting Lines to Child Nodes */}
              <line x1="160" y1="51" x2="65" y2="105" stroke="#647895" strokeWidth="1.5" />
              <line x1="210" y1="51" x2="210" y2="105" stroke="#647895" strokeWidth="1.5" />
              <line x1="260" y1="51" x2="355" y2="105" stroke="#647895" strokeWidth="1.5" />

              {/* Child 1: [5 | 10 | 15] */}
              <g transform="translate(10, 105)">
                <rect x="0" y="0" width="110" height="34" rx="8" fill="white" stroke="#347f7a" strokeWidth="1.5" />
                <line x1="36" y1="0" x2="36" y2="34" stroke="#347f7a" strokeWidth="1" opacity="0.3" />
                <line x1="73" y1="0" x2="73" y2="34" stroke="#347f7a" strokeWidth="1" opacity="0.3" />
                <text x="18" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">5</text>
                <text x="54" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">10</text>
                <text x="91" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">15</text>
              </g>

              {/* Child 2: [30 | 40] */}
              <g transform="translate(160, 105)">
                <rect x="0" y="0" width="100" height="34" rx="8" fill="white" stroke="#347f7a" strokeWidth="1.5" />
                <line x1="50" y1="0" x2="50" y2="34" stroke="#347f7a" strokeWidth="1" opacity="0.3" />
                <text x="25" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">30</text>
                <text x="75" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">40</text>
              </g>

              {/* Child 3: [60 | 70 | 80] */}
              <g transform="translate(300, 105)">
                <rect x="0" y="0" width="110" height="34" rx="8" fill="white" stroke="#347f7a" strokeWidth="1.5" />
                <line x1="36" y1="0" x2="36" y2="34" stroke="#347f7a" strokeWidth="1" opacity="0.3" />
                <line x1="73" y1="0" x2="73" y2="34" stroke="#347f7a" strokeWidth="1" opacity="0.3" />
                <text x="18" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">60</text>
                <text x="54" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">70</text>
                <text x="91" y="21" textAnchor="middle" fill="#203247" fontSize="11" fontFamily="monospace" fontWeight="bold">80</text>
              </g>

              {/* Footer text */}
              <text x="210" y="175" textAnchor="middle" fill="#647895" fontSize="10" fontFamily="monospace">B-Tree (Order m=4) • Multiple Keys per Node for Disk Page Alignment</text>
            </svg>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="mt-3 text-[11px] text-[#647895] font-mono-signal flex items-center justify-between">
        <span>• Data Payloads in White Node Cards</span>
        <span>• Teal Dots = Memory Pointers</span>
      </div>
    </div>
  );
};
