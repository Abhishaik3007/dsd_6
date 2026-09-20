import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { DATA_STRUCTURES_DATA } from './dsaData';
import { DSADiagramPreview } from './DSADiagramPreview';
import { SignalSchoolLogo } from '../common/SignalSchoolLogo';
import {
  ArrowLeft, Play, BookOpen, Cpu, Check, Copy, Sparkles, Layers, ArrowRight, Code, ShieldCheck, Zap
} from 'lucide-react';

export const DSADocumentationPage = () => {
  const { selectedDsId, launchDsLab, setActiveTab } = useHub();
  const [activeTab, setActiveTabState] = useState('concept'); // 'concept' | 'complexity' | 'code'
  const [codeLang, setCodeLang] = useState('javascript'); // 'javascript' | 'python' | 'cpp'
  const [copied, setCopied] = useState(false);

  const dsItem = DATA_STRUCTURES_DATA.find(d => d.id === selectedDsId) || DATA_STRUCTURES_DATA[0];
  const IconComp = dsItem.icon;

  const handleCopyCode = () => {
    const code = dsItem.codeSnippets[codeLang];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('dsa-catalog')}
              className="inline-flex items-center gap-2 rounded-full border border-[#203247]/15 bg-white/60 px-4 py-2 text-xs font-semibold text-[#203247] hover:bg-white cursor-pointer transition-all"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>

            <span className="hidden sm:inline font-mono-signal text-[11px] text-[#647895]">
              Signal School / Data Structures / <strong>{dsItem.title}</strong>
            </span>
          </div>

          {dsItem.id !== 'set' && (
            <button
              onClick={() => launchDsLab(dsItem.id)}
              className="bg-[#347f7a] text-[#f6f3eb] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#203247] transition-colors cursor-pointer shadow-sm border-none flex items-center gap-2"
            >
              <Play size={14} fill="#f6f3eb" /> <span>Launch DS Lab</span>
            </button>
          )}
        </div>
      </nav>

      {/* HEADER HERO SECTION */}
      <section className="relative border-b border-[#203247]/10 bg-[#f5f3ed] bg-grid-paper">
        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#203247]/15 bg-white shadow-sm">
              <IconComp size={24} strokeWidth={1.8} className="text-[#203247]" />
            </div>
            <div>
              <span className="rounded-full border border-[#203247]/15 px-3 py-1 font-mono-signal text-[9px] uppercase tracking-wider text-[#347f7a] font-bold bg-white/60">
                {dsItem.categoryTag}
              </span>
            </div>
          </div>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#203247]">
            {dsItem.title}
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-[#526b88]">
            {dsItem.overview}
          </p>

          {/* LAUNCH LAB BANNER CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-[#347f7a]/30 bg-[#347f7a]/10 p-6">
            <div className="flex items-start gap-4">
              <Sparkles size={22} className="text-[#347f7a] shrink-0 mt-1" />
              <div>
                <h4 className="font-display text-xl font-bold text-[#203247]">
                  Interactive Visual Simulation Engine
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-[#526b88]">
                  Watch nodes link, traverse pointers step-by-step, and inspect memory allocation inside the Logicraft studio workspace.
                </p>
              </div>
            </div>

            {dsItem.id !== 'set' && (
              <button
                onClick={() => launchDsLab(dsItem.id)}
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#203247] px-6 py-3 text-xs font-bold text-[#f6f3eb] hover:bg-[#347f7a] transition-all cursor-pointer border-none shadow-md"
              >
                <Play size={13} fill="#f6f3eb" /> <span>Open Visualizer Lab</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DOCUMENTATION MAIN CONTENT */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        {/* DOCUMENTATION TABS */}
        <div className="flex items-center gap-3 border-b border-[#203247]/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTabState('concept')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'concept'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <BookOpen size={15} /> <span>Concept & Theory</span>
          </button>

          <button
            onClick={() => setActiveTabState('complexity')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'complexity'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <Cpu size={15} /> <span>Complexity Matrix</span>
          </button>

          <button
            onClick={() => setActiveTabState('code')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTab === 'code'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <Code size={15} /> <span>Code Implementation</span>
          </button>
        </div>

        {/* TAB 1: CONCEPT & THEORY */}
        {activeTab === 'concept' && (
          <div className="grid gap-8 md:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              {/* FIRST PRINCIPLES THEORY BOX */}
              <div className="rounded-2xl border border-[#203247]/10 bg-white p-8 shadow-sm">
                <h3 className="font-display text-2xl font-bold text-[#203247]">
                  Structural Mechanics & Memory Model
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#526b88]">
                  {dsItem.detailedTheory?.mechanics || dsItem.overview}
                </p>

                <div className="mt-6 rounded-xl bg-[#f5f3ed] p-5 border border-[#203247]/10">
                  <h4 className="font-mono-signal text-xs font-bold text-[#347f7a] uppercase tracking-wider mb-2">
                    MEMORY & POINTER ARCHITECTURE
                  </h4>
                  <p className="text-xs leading-relaxed text-[#203247]">
                    {dsItem.detailedTheory?.memoryModel}
                  </p>
                </div>

                {/* CORE OPERATIONS BREAKDOWN */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Core Operations Breakdown
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {dsItem.detailedTheory?.operations?.map((op, idx) => (
                    <div key={idx} className="rounded-xl border border-[#203247]/10 bg-[#fbf9f4] p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#203247]">{op.name}</span>
                        <span className="rounded-full bg-[#347f7a]/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#347f7a]">{op.time}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#526b88] leading-relaxed">{op.desc}</p>
                    </div>
                  ))}
                </div>

                {/* TRADE-OFFS & COMPARISON */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Architectural Trade-Offs & Comparison
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4">
                    <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2">ADVANTAGES</h5>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      {dsItem.detailedTheory?.tradeoffs?.filter(t => t.pro).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span> {t.pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/20 bg-rose-50/50 p-4">
                    <h5 className="font-bold text-xs text-rose-800 uppercase tracking-wider mb-2">LIMITATIONS</h5>
                    <ul className="space-y-2 text-xs text-rose-950">
                      {dsItem.detailedTheory?.tradeoffs?.filter(t => t.con).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">✕</span> {t.con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* REAL-WORLD USE CASES */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Real-World Production Engineering Applications
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-[#526b88]">
                  {dsItem.realWorldUseCases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#347f7a]/15 text-[#347f7a] text-xs font-bold shrink-0 mt-0.5">✓</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CONCEPT DIAGRAM PREVIEW CARD (PLACED BELOW THEORY) */}
              <DSADiagramPreview diagramType={dsItem.diagramType} title={dsItem.title} />
            </div>

            {/* SIDEBAR CHEAT SHEET */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/70 bg-white/40 backdrop-blur-md p-6 sticky top-20 shadow-[0_8px_32px_rgba(32,50,71,0.08)]">
                <h4 className="font-mono-signal text-[11px] uppercase tracking-wider text-[#347f7a] font-bold mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#347f7a]" /> QUICK REFERENCE
                </h4>
                <div className="space-y-4 text-xs text-[#203247]">
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Category</span>
                    <strong className="font-bold">{dsItem.category}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Memory Layout</span>
                    <strong className="font-bold">{dsItem.categoryTag}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Access Time</span>
                    <strong className="font-bold text-[#347f7a]">{dsItem.complexity.access.time}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Search Time</span>
                    <strong className="font-bold text-[#347f7a]">{dsItem.complexity.search.time}</strong>
                  </div>
                </div>

                {dsItem.id !== 'set' && dsItem.id !== 'avl-tree' && (
                  <button
                    onClick={() => launchDsLab(dsItem.id)}
                    className="mt-6 w-full rounded-xl bg-[#203247] py-3 text-xs font-bold text-[#f6f3eb] hover:bg-[#347f7a] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    <Play size={14} fill="#f6f3eb" /> <span>Open Visualizer Lab</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLEXITY MATRIX */}
        {activeTab === 'complexity' && (
          <div className="rounded-2xl border border-[#203247]/10 bg-white p-8 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-[#203247] mb-6">
              Time & Space Complexity Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#203247]/15 bg-[#f5f3ed]">
                    <th className="p-4 font-bold text-[#203247]">Operation</th>
                    <th className="p-4 font-bold text-[#203247]">Time Complexity</th>
                    <th className="p-4 font-bold text-[#203247]">Space Complexity</th>
                    <th className="p-4 font-bold text-[#203247]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#203247]/10 text-[#526b88]">
                  <tr>
                    <td className="p-4 font-semibold text-[#203247]">Access by Index</td>
                    <td className="p-4 font-mono font-bold text-[#347f7a]">{dsItem.complexity.access.time}</td>
                    <td className="p-4 font-mono">{dsItem.complexity.access.space}</td>
                    <td className="p-4 text-xs">Sequential traversal from head node.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#203247]">Search Value</td>
                    <td className="p-4 font-mono font-bold text-[#347f7a]">{dsItem.complexity.search.time}</td>
                    <td className="p-4 font-mono">{dsItem.complexity.search.space}</td>
                    <td className="p-4 text-xs">Linear search scanning pointers.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#203247]">Insert at Head</td>
                    <td className="p-4 font-mono font-bold text-[#347f7a]">{dsItem.complexity.insertHead.time}</td>
                    <td className="p-4 font-mono">{dsItem.complexity.insertHead.space}</td>
                    <td className="p-4 text-xs">Constant time pointer updates.</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#203247]">Delete at Position</td>
                    <td className="p-4 font-mono font-bold text-[#347f7a]">{dsItem.complexity.deletePos.time}</td>
                    <td className="p-4 font-mono">{dsItem.complexity.deletePos.space}</td>
                    <td className="p-4 text-xs">Requires finding target node pointer.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CODE IMPLEMENTATION (SIGNAL EDITOR VIBE) */}
        {activeTab === 'code' && (
          <div className="overflow-hidden rounded-2xl border border-[#203247]/15 bg-[#192635] shadow-xl text-[#e2e8f0]">
            {/* WINDOW TOP HEADER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#121c27] px-5 py-3.5">
              <div className="flex items-center gap-3">
                {/* WINDOW MAC-STYLE DOTS */}
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ef4444]/80"></div>
                  <div className="h-3 w-3 rounded-full bg-[#f59e0b]/80"></div>
                  <div className="h-3 w-3 rounded-full bg-[#10b981]/80"></div>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

                {/* LANGUAGE TABS */}
                <div className="flex items-center gap-1.5 bg-[#0f1722] p-1 rounded-xl border border-white/8">
                  <button
                    onClick={() => setCodeLang('javascript')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'javascript' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="font-mono text-[10px] text-[#f7bd65] font-extrabold">JS</span>
                    <span>JavaScript</span>
                  </button>
                  <button
                    onClick={() => setCodeLang('python')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'python' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="font-mono text-[10px] text-[#60a5fa] font-extrabold">PY</span>
                    <span>Python</span>
                  </button>
                  <button
                    onClick={() => setCodeLang('cpp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'cpp' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="font-mono text-[10px] text-[#f472b6] font-extrabold">C++</span>
                    <span>C++</span>
                  </button>
                </div>
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${copied ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#34d399]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                {copied ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* EDITOR CODE AREA WITH LINE NUMBERS */}
            <div className="overflow-x-auto p-5 font-mono text-xs leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {(dsItem.codeSnippets[codeLang] || '// Snippet coming soon')
                    .split('\n')
                    .map((line, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        {/* LINE NUMBER GUTTER */}
                        <td className="w-10 select-none pr-4 text-right text-[11px] text-[#475569] font-semibold align-top border-r border-white/5">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        {/* CODE LINE */}
                        <td className="pl-4 whitespace-pre font-mono text-xs text-[#e2e8f0]">
                          {line.trim().startsWith('//') || line.trim().startsWith('#') ? (
                            <span className="text-[#647895] italic font-semibold">{line}</span>
                          ) : (
                            line
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER BAR */}
            <div className="flex items-center gap-2 border-t border-white/5 bg-[#121c27] px-5 py-2.5 text-[11px] text-[#647895] font-mono-signal">
              <SignalSchoolLogo size={14} idPrefix="dsa-engine-logo" />
              <span>Signal School Interactive Code View</span>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f6f3eb] border-t border-[#203247]/10 py-8 px-5 sm:px-8 text-[#526b88] text-xs mt-16">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-1.5 font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              <SignalSchoolLogo size={22} idPrefix="dsa-doc-footer-logo" />
              <span>signal<span className="text-[#347f7a] font-normal">school</span></span>
            </div>
            <p className="mt-2 text-xs text-[#526b88] max-w-xs">
              Interactive computer science directory & learning environment.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('dsa-catalog')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Catalog</button>
            <button onClick={() => launchDsLab(dsItem.id)} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Launch Lab</button>
            <button onClick={() => setActiveTab('hub')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
