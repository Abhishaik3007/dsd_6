import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { ALGORITHM_ITEMS } from './algoCatalogData';
import { SignalSchoolLogo } from '../common/SignalSchoolLogo';
import {
  ArrowLeft, Play, BookOpen, Check, Copy, Sparkles, Layers, ArrowRight,
  Code, ShieldCheck, Zap, BarChart2, Compass, Boxes, GitBranch, CheckCircle2, XCircle
} from 'lucide-react';

export const AlgoDocumentationPage = () => {
  const { selectedAlgoId, launchAlgoLab, setActiveTab } = useHub();
  const [activeTab, setActiveTabState] = useState('concept'); // 'concept' | 'complexity' | 'code' | 'applications'
  const [codeLang, setCodeLang] = useState('javascript'); // 'javascript' | 'python' | 'cpp' | 'java'
  const [copied, setCopied] = useState(false);

  const algoItem = ALGORITHM_ITEMS.find(a => a.id === selectedAlgoId) || ALGORITHM_ITEMS[0];

  const handleCopyCode = () => {
    const code = algoItem.codeSnippets?.[codeLang];
    if (code && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Sorting': return BarChart2;
      case 'Searching': return BookOpen;
      case 'Pathfinding': return Compass;
      case 'Dynamic Programming': return Boxes;
      case 'Backtracking': return GitBranch;
      default: return Layers;
    }
  };

  const IconComp = getCategoryIcon(algoItem.category);

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('algo-catalog')}
              className="inline-flex items-center gap-2 rounded-full border border-[#203247]/15 bg-white/60 px-4 py-2 text-xs font-semibold text-[#203247] hover:bg-white cursor-pointer transition-all"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>

            <span className="hidden sm:inline font-mono-signal text-[11px] text-[#647895]">
              Signal School / Algorithms / <strong>{algoItem.title}</strong>
            </span>
          </div>

          <button
            onClick={() => launchAlgoLab(algoItem.id)}
            className="bg-[#347f7a] text-[#f6f3eb] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#203247] transition-colors cursor-pointer shadow-sm border-none flex items-center gap-2"
          >
            <Play size={14} fill="#f6f3eb" /> <span>Launch Visualizer Lab</span>
          </button>
        </div>
      </nav>

      {/* HEADER HERO SECTION */}
      <section className="relative border-b border-[#203247]/10 bg-[#f5f3ed] bg-grid-paper">
        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#203247]/15 bg-white shadow-sm">
              <IconComp size={24} strokeWidth={1.8} className="text-[#347f7a]" />
            </div>
            <div>
              <span className="rounded-full border border-[#347f7a]/20 px-3 py-1 font-mono-signal text-[9px] uppercase tracking-wider text-[#347f7a] font-bold bg-white/80">
                {algoItem.categoryTag}
              </span>
            </div>
          </div>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#203247]">
            {algoItem.title}
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-[#526b88]">
            {algoItem.overview}
          </p>

          {/* LAUNCH LAB BANNER CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-[#347f7a]/30 bg-[#347f7a]/10 p-6">
            <div className="flex items-start gap-4">
              <Sparkles size={22} className="text-[#347f7a] shrink-0 mt-1" />
              <div>
                <h4 className="font-display text-xl font-bold text-[#203247]">
                  Interactive Visual Simulation & Race Engine
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-[#526b88]">
                  Watch this algorithm execute step-by-step, scrub through past operations, or race it head-to-head in the Duel arena.
                </p>
              </div>
            </div>

            <button
              onClick={() => launchAlgoLab(algoItem.id)}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#203247] px-6 py-3 text-xs font-bold text-[#f6f3eb] hover:bg-[#347f7a] transition-all cursor-pointer border-none shadow-md"
            >
              <Play size={13} fill="#f6f3eb" /> <span>Open Visualizer Lab</span>
            </button>
          </div>
        </div>
      </section>

      {/* DOCUMENTATION CONTENT BODY */}
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
        {/* DOCUMENTATION NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-[#203247]/15 pb-4 mb-8 flex-wrap">
          {[
            { id: 'concept', label: 'Concept & Breakdown', icon: BookOpen },
            { id: 'complexity', label: 'Complexity & Invariants', icon: ShieldCheck },
            { id: 'code', label: 'Code Implementations', icon: Code },
            { id: 'applications', label: 'Real-World Applications', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabState(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${isActive
                    ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
                    : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CONCEPT & HOW IT WORKS */}
        {activeTab === 'concept' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* HOW IT WORKS */}
            <div className="rounded-2xl border border-[#203247]/10 bg-white p-7 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-[#203247] mb-4">
                How {algoItem.title} Works
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-[#526b88] leading-relaxed">
                {algoItem.howItWorks.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <strong className="text-[#203247]">Step {idx + 1}:</strong> {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* INVARIANTS */}
            <div className="rounded-2xl border border-[#347f7a]/20 bg-[#faf8f4] p-7 shadow-sm">
              <h3 className="font-display text-xl font-bold text-[#203247] mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#347f7a]" />
                <span>Algorithmic Invariants & Guarantees</span>
              </h3>
              <ul className="space-y-2.5 text-sm text-[#526b88]">
                {algoItem.invariants.map((inv, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a] mt-2 shrink-0" />
                    <span>{inv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PROS & CONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-6 shadow-sm">
                <h4 className="font-bold text-base text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Strengths & Advantages</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-emerald-800">
                  {algoItem.pros.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-50/40 p-6 shadow-sm">
                <h4 className="font-bold text-base text-rose-900 mb-3 flex items-center gap-2">
                  <XCircle size={18} className="text-rose-600" />
                  <span>Tradeoffs & Limitations</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-rose-800">
                  {algoItem.cons.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLEXITY MATRIX */}
        {activeTab === 'complexity' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[#203247]/10 bg-white p-7 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-[#203247] mb-2">
                Asymptotic Time & Space Complexity
              </h3>
              <p className="text-xs sm:text-sm text-[#526b88] mb-6">
                Formal Big-O analysis across best, average, and worst-case input configurations.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#203247]/10 bg-[#faf8f4] text-[#647895]">
                      <th className="py-3 px-4 font-sans font-bold">METRIC</th>
                      <th className="py-3 px-4 font-bold">BOUND</th>
                      <th className="py-3 px-4 font-sans font-bold">TRIGGER CONDITION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#203247]">Best Case Time</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{algoItem.timeBest}</td>
                      <td className="py-3.5 px-4 font-sans text-[#526b88]">Optimal input configuration (e.g. already sorted or target at first probe).</td>
                    </tr>
                    <tr className="bg-[#faf8f4]/50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#203247]">Average Case Time</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">{algoItem.timeAvg}</td>
                      <td className="py-3.5 px-4 font-sans text-[#526b88]">Uniformly distributed random input permutations.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#203247]">Worst Case Time</td>
                      <td className="py-3.5 px-4 font-bold text-rose-700">{algoItem.timeWorst}</td>
                      <td className="py-3.5 px-4 font-sans text-[#526b88]">Adversarial inputs (e.g. reverse sorted, unbalanced pivot selections).</td>
                    </tr>
                    <tr className="bg-[#faf8f4]/50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#203247]">Auxiliary Space</td>
                      <td className="py-3.5 px-4 font-bold text-[#347f7a]">{algoItem.space}</td>
                      <td className="py-3.5 px-4 font-sans text-[#526b88]">Extra memory required beyond the input array storage.</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-sans font-semibold text-[#203247]">Stable Sort?</td>
                      <td className="py-3.5 px-4 font-bold text-[#203247]">{algoItem.stable ? 'Yes' : 'No'}</td>
                      <td className="py-3.5 px-4 font-sans text-[#526b88]">Whether equal keys retain their relative initial order.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODE IMPLEMENTATIONS */}
        {activeTab === 'code' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[#203247]/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#203247]/10">
                {/* Language buttons */}
                <div className="flex items-center gap-2">
                  {['javascript', 'python', 'cpp', 'java'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase font-bold cursor-pointer border-none transition-all ${codeLang === lang ? 'bg-[#203247] text-white shadow-sm' : 'bg-slate-100 text-[#526b88] hover:bg-slate-200'
                        }`}
                    >
                      {lang === 'javascript' ? 'JavaScript' : lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-xl border border-[#203247]/15 bg-white text-xs font-semibold text-[#203247] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code Box */}
              <div className="mt-4 bg-[#1e293b] text-[#f8fafc] p-5 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-700">
                <pre>
                  <code>{algoItem.codeSnippets?.[codeLang] || '// Implementation available'}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REAL-WORLD APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="rounded-2xl border border-[#203247]/10 bg-white p-7 shadow-sm animate-in fade-in duration-200">
            <h3 className="font-display text-2xl font-bold text-[#203247] mb-3">
              Production & Real-World Use
            </h3>
            <p className="text-sm text-[#526b88] leading-relaxed">
              {algoItem.realWorldUse}
            </p>
          </div>
        )}

        {/* BOTTOM FINAL CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-white border border-[#203247]/10 shadow-sm flex flex-col items-center">
          <h4 className="font-display text-2xl font-bold text-[#203247]">
            Ready to see {algoItem.title} in action?
          </h4>
          <p className="mt-2 text-xs sm:text-sm text-[#526b88] max-w-md">
            Launch the visualizer lab to watch memory swaps, pointer steps, or race against other algorithms.
          </p>
          <button
            onClick={() => launchAlgoLab(algoItem.id)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#347f7a] px-7 py-3 text-sm font-bold text-white hover:bg-[#203247] transition-all cursor-pointer border-none shadow-md"
          >
            <Play size={14} fill="white" /> <span>Open in Visualizer Studio</span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#f6f3eb] border-t border-[#203247]/10 py-8 px-5 sm:px-8 text-[#526b88] text-xs mt-16">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-1.5 font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              <SignalSchoolLogo size={22} idPrefix="algo-doc-footer-logo" />
              <span>signal<span className="text-[#347f7a] font-normal">school</span></span>
            </div>
            <p className="mt-2 text-xs text-[#526b88] max-w-xs">
              Interactive computer science directory & learning environment.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('algo-catalog')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Catalog</button>
            <button onClick={() => launchAlgoLab(algoItem.id)} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Launch Lab</button>
            <button onClick={() => setActiveTab('hub')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
