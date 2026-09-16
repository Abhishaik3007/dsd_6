import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { DIGITAL_ELECTRONICS_DATA } from './digitalData';
import { CircuitDiagramPreview } from './CircuitDiagramPreview';
import {
  ArrowLeft, Play, BookOpen, Cpu, Check, Copy, Sparkles, Layers, ArrowRight, Code, ShieldCheck, Zap, Table, Lightbulb, HelpCircle, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';

export const DigitalDocumentationPage = () => {
  const { selectedCircuitId, launchCircuitLab, setActiveTab } = useHub();
  const [activeTabState, setActiveTabState] = useState('concept'); // 'concept' | 'truth-table' | 'code'
  const [codeLang, setCodeLang] = useState('verilog'); // 'verilog' | 'vhdl' | 'javascript'
  const [copied, setCopied] = useState(false);

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Find active circuit or fallback to basic-gates
  const circuitItem = DIGITAL_ELECTRONICS_DATA.find(d => d.id === selectedCircuitId) || DIGITAL_ELECTRONICS_DATA[0];
  const IconComp = circuitItem.icon;

  const handleCopyCode = () => {
    const code = circuitItem.codeSnippets[codeLang];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunchLab = () => {
    launchCircuitLab(circuitItem.id, circuitItem.presetId);
  };

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('digital-catalog')}
              className="inline-flex items-center gap-2 rounded-full border border-[#203247]/15 bg-white/60 px-4 py-2 text-xs font-semibold text-[#203247] hover:bg-white cursor-pointer transition-all"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchLab}
              className="bg-[#347f7a] text-[#f6f3eb] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#203247] transition-colors cursor-pointer shadow-sm border-none flex items-center gap-2"
            >
              <Play size={14} fill="#f6f3eb" /> <span>Launch Circuit Lab</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HEADER HERO SECTION */}
      <section className="relative border-b border-[#203247]/10 bg-[#f5f3ed] bg-grid-paper">
        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#203247]/15 bg-white shadow-sm">
              <IconComp size={24} strokeWidth={1.8} className="text-[#203247]" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full border border-[#203247]/15 px-3 py-1 font-mono-signal text-[9px] uppercase tracking-wider text-[#347f7a] font-bold bg-white/60">
                {circuitItem.categoryTag}
              </span>
              <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono-signal text-[9px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50/70">
                Beginner Friendly • First Principles
              </span>
            </div>
          </div>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#203247]">
            {circuitItem.title}
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-[#526b88]">
            {circuitItem.overview}
          </p>

          {/* LAUNCH LAB BANNER CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-[#347f7a]/30 bg-[#347f7a]/10 p-6">
            <div className="flex items-start gap-4">
              <Sparkles size={22} className="text-[#347f7a] shrink-0 mt-1" />
              <div>
                <h4 className="font-display text-xl font-bold text-[#203247]">
                  Interactive Logic Simulation Engine
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-[#526b88]">
                  Wire circuits in real-time, toggle binary switches, observe LED states, and inspect truth tables inside LogiCraft Studio.
                </p>
              </div>
            </div>

            <button
              onClick={handleLaunchLab}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#203247] px-6 py-3 text-xs font-bold text-[#f6f3eb] hover:bg-[#347f7a] transition-all cursor-pointer border-none shadow-md"
            >
              <Play size={13} fill="#f6f3eb" /> <span>Open in Circuit Simulator</span>
            </button>
          </div>
        </div>
      </section>

      {/* DOCUMENTATION MAIN CONTENT */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        {/* DOCUMENTATION TABS */}
        <div className="flex items-center gap-3 border-b border-[#203247]/10 pb-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTabState('concept')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTabState === 'concept'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <BookOpen size={15} /> <span>Intuition & Theory</span>
          </button>

          <button
            onClick={() => setActiveTabState('truth-table')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTabState === 'truth-table'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <Table size={15} /> <span>Truth Table & Math</span>
          </button>

          <button
            onClick={() => setActiveTabState('code')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border-none ${activeTabState === 'code'
              ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
              : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
              }`}
          >
            <Code size={15} /> <span>Hardware Description (HDL)</span>
          </button>
        </div>

        {/* TAB 1: CONCEPT & CIRCUIT THEORY */}
        {activeTabState === 'concept' && (
          <div className="grid gap-8 md:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              {/* 💡 BEGINNER FRIENDLY MENTAL MODEL CARD */}
              {circuitItem.mentalModel && (
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm uppercase tracking-wider mb-2">
                    <Lightbulb size={18} className="text-amber-600" />
                    <span>Everyday Mental Model: {circuitItem.mentalModel.analogy}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#526b88] leading-relaxed mb-4">
                    {circuitItem.mentalModel.metaphor}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {circuitItem.mentalModel.points.map((pt, idx) => (
                      <div key={idx} className="rounded-xl bg-white/90 p-3.5 border border-amber-500/15 shadow-xs">
                        <div className="flex items-center gap-2 font-bold text-xs text-[#203247] mb-1">
                          <span className="text-base">{pt.icon}</span>
                          <span>{pt.label}</span>
                        </div>
                        <p className="text-xs text-[#526b88] leading-relaxed">
                          {pt.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🚀 HOW IT WORKS IN 3 STEPS */}
              {circuitItem.plainEnglish && (
                <div className="rounded-2xl border border-[#203247]/10 bg-white p-7 shadow-sm">
                  <h3 className="font-display text-xl font-bold text-[#203247] mb-1">
                    How It Works in Plain English
                  </h3>
                  <p className="text-xs text-[#647895] mb-5">
                    No complex semiconductor math needed — here is the core intuition:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {circuitItem.plainEnglish.map((step, idx) => (
                      <div key={idx} className="rounded-xl bg-[#fbf9f4] p-4 border border-[#203247]/10 flex flex-col justify-between">
                        <div>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#347f7a] text-white font-mono text-xs font-bold mb-3">
                            {step.step}
                          </div>
                          <h4 className="font-bold text-sm text-[#203247] mb-1.5">{step.title}</h4>
                          <p className="text-xs text-[#526b88] leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AHA MOMENT CALLOUT */}
                  {circuitItem.ahaMoment && (
                    <div className="mt-6 rounded-xl bg-[#f5f3ed] p-4 border-l-4 border-[#347f7a] flex items-start gap-3">
                      <Sparkles size={18} className="text-[#347f7a] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#203247] font-medium leading-relaxed italic">
                        <strong>The "Aha!" Moment:</strong> {circuitItem.ahaMoment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* INTERACTIVE CIRCUIT DIAGRAM PREVIEW */}
              <CircuitDiagramPreview diagramType={circuitItem.diagramType} title={circuitItem.title} />

              {/* FIRST PRINCIPLES THEORY BOX */}
              <div className="rounded-2xl border border-[#203247]/10 bg-white p-8 shadow-sm">
                <h3 className="font-display text-2xl font-bold text-[#203247]">
                  Silicon Mechanics & Transistor Architecture
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#526b88]">
                  {circuitItem.detailedTheory?.mechanics || circuitItem.overview}
                </p>

                <div className="mt-6 rounded-xl bg-[#f5f3ed] p-5 border border-[#203247]/10">
                  <h4 className="font-mono-signal text-xs font-bold text-[#347f7a] uppercase tracking-wider mb-2">
                    SILICON & INTEGRATED CIRCUIT ARCHITECTURE
                  </h4>
                  <p className="text-xs leading-relaxed text-[#203247]">
                    {circuitItem.detailedTheory?.siliconArchitecture}
                  </p>
                </div>

                {/* CORE OPERATIONS BREAKDOWN */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Logic Transfer Characteristics & Rules
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {circuitItem.detailedTheory?.operations?.map((op, idx) => (
                    <div key={idx} className="rounded-xl border border-[#203247]/10 bg-[#fbf9f4] p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#203247]">{op.name}</span>
                        <span className="rounded-full bg-[#347f7a]/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#347f7a]">{op.rule}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#526b88] leading-relaxed">{op.desc}</p>
                    </div>
                  ))}
                </div>

                {/* ⚠️ COMMON BEGINNER MISTAKES BOX */}
                {circuitItem.beginnerMistakes && (
                  <div className="mt-8 rounded-xl border border-rose-500/20 bg-rose-50/40 p-5">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-3">
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span>Common Beginner Traps to Avoid</span>
                    </div>
                    <div className="space-y-3">
                      {circuitItem.beginnerMistakes.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-white/80 p-3 border border-rose-200/50 text-xs">
                          <p className="font-semibold text-rose-950 mb-1">
                            ❌ Mistake: {item.mistake}
                          </p>
                          <p className="text-[#526b88] leading-relaxed">
                            💡 <strong>The Fix:</strong> {item.fix}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TRADE-OFFS & TIMING COMPARISON */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Circuit Trade-Offs & Silicon Constraints
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4">
                    <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2">ADVANTAGES</h5>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      {circuitItem.detailedTheory?.tradeoffs?.filter(t => t.pro).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span> {t.pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-500/20 bg-rose-50/50 p-4">
                    <h5 className="font-bold text-xs text-rose-800 uppercase tracking-wider mb-2">LIMITATIONS & DELAYS</h5>
                    <ul className="space-y-2 text-xs text-rose-950">
                      {circuitItem.detailedTheory?.tradeoffs?.filter(t => t.con).map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">✕</span> {t.con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* REAL-WORLD USE CASES */}
                <h4 className="mt-8 text-xl font-bold text-[#203247]">
                  Production Electronics & Hardware Engineering Applications
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-[#526b88]">
                  {circuitItem.realWorldUseCases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#347f7a]/15 text-[#347f7a] text-xs font-bold shrink-0 mt-0.5">✓</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 🧠 INTERACTIVE QUICK QUIZ WIDGET */}
              {circuitItem.quiz && (
                <div className="rounded-2xl border border-[#203247]/10 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-2 text-[#347f7a] font-bold text-xs uppercase tracking-wider mb-2">
                    <HelpCircle size={16} />
                    <span>Quick Self-Check Challenge</span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-[#203247] mb-4">
                    {circuitItem.quiz.question}
                  </h4>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {circuitItem.quiz.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === circuitItem.quiz.correctIndex;
                      let btnStyle = 'bg-[#fbf9f4] border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-[#347f7a]/15 border-[#347f7a] text-[#203247] font-bold';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedAnswer(idx);
                            setQuizSubmitted(true);
                          }}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-4 rounded-xl bg-[#f5f3ed] p-4 border border-[#203247]/10 animate-fade-in text-xs leading-relaxed text-[#203247]">
                      <strong>{selectedAnswer === circuitItem.quiz.correctIndex ? '🎉 Spot on!' : '💡 Good try!'}</strong> {circuitItem.quiz.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR CHEAT SHEET */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/70 bg-white/40 backdrop-blur-md p-6 sticky top-20 shadow-[0_8px_32px_rgba(32,50,71,0.08)]">
                <h4 className="font-mono-signal text-[11px] uppercase tracking-wider text-[#347f7a] font-bold mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#347f7a]" /> QUICK SPECIFICATION
                </h4>
                <div className="space-y-4 text-xs text-[#203247]">
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Category</span>
                    <strong className="font-bold">{circuitItem.category}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Standard IC</span>
                    <strong className="font-bold font-mono text-[#347f7a]">{circuitItem.icChip}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Propagation Delay</span>
                    <strong className="font-bold font-mono">{circuitItem.propagationDelay}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#203247]/10 pb-2">
                    <span className="text-[#526b88]">Silicon Transistors</span>
                    <strong className="font-bold">{circuitItem.transistorCount}</strong>
                  </div>
                  <div className="flex flex-col border-b border-[#203247]/10 pb-2 gap-1">
                    <span className="text-[#526b88]">Boolean Equation</span>
                    <strong className="font-mono text-[11px] text-[#203247] break-all">{circuitItem.booleanEquation}</strong>
                  </div>
                </div>

                <button
                  onClick={handleLaunchLab}
                  className="mt-6 w-full rounded-xl bg-[#203247] py-3 text-xs font-bold text-[#f6f3eb] hover:bg-[#347f7a] transition-all cursor-pointer border-none flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play size={14} fill="#f6f3eb" /> <span>Open in Circuit Simulator</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRUTH TABLE & BOOLEAN LAWS */}
        {activeTabState === 'truth-table' && (
          <div className="rounded-2xl border border-[#203247]/10 bg-white p-8 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-[#203247] mb-2">
              Truth Table & State Matrix
            </h3>
            <p className="text-sm text-[#526b88] mb-6">
              Exhaustive input-output evaluation across all binary permutations.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#203247]/15 bg-[#f5f3ed]">
                    {circuitItem.truthTable.headers.map((hdr, idx) => (
                      <th key={idx} className="p-4 font-bold text-[#203247] font-mono text-xs">
                        {hdr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#203247]/10 text-[#526b88]">
                  {circuitItem.truthTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#fbf9f4] transition-colors">
                      {row.inputs.map((inVal, iIdx) => (
                        <td key={`in-${iIdx}`} className="p-4 font-mono font-bold text-[#203247]">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                            {inVal}
                          </span>
                        </td>
                      ))}
                      {row.outputs.map((outVal, oIdx) => (
                        <td key={`out-${oIdx}`} className="p-4 font-mono font-bold text-[#347f7a]">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xs ${outVal === 1 || outVal === '1'
                            ? 'bg-teal-50 border border-teal-200 text-teal-700'
                            : 'bg-slate-50 border border-slate-200 text-slate-700'
                            }`}>
                            {outVal}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Boolean Algebra Laws Callout */}
            <div className="mt-8 rounded-xl bg-[#f5f3ed] p-6 border border-[#203247]/10">
              <h4 className="font-mono-signal text-xs font-bold text-[#347f7a] uppercase tracking-wider mb-2">
                BOOLEAN MINIMIZATION NOTE
              </h4>
              <p className="text-xs leading-relaxed text-[#203247]">
                Canonical Sum of Products (SOP) and Product of Sums (POS) equations can be simplified using Karnaugh Maps (K-maps) to minimize gate fan-in and eliminate hazard race conditions.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HARDWARE CODE (HDL) */}
        {activeTabState === 'code' && (
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
                    onClick={() => setCodeLang('verilog')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'verilog' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="font-mono text-[10px] text-[#60a5fa] font-extrabold">HDL</span>
                    <span>Verilog</span>
                  </button>
                  <button
                    onClick={() => setCodeLang('vhdl')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'vhdl' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="font-mono text-[10px] text-[#f472b6] font-extrabold">VHDL</span>
                    <span>VHDL</span>
                  </button>
                  <button
                    onClick={() => setCodeLang('javascript')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1.5 ${codeLang === 'javascript' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="font-mono text-[10px] text-[#f7bd65] font-extrabold">JS</span>
                    <span>JavaScript Simulator</span>
                  </button>
                </div>
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${copied ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#34d399]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {copied ? <Check size={14} className="text-[#34d399]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* EDITOR CODE AREA WITH LINE NUMBERS */}
            <div className="overflow-x-auto p-5 font-mono text-xs leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {(circuitItem.codeSnippets[codeLang] || '// Snippet coming soon')
                    .split('\n')
                    .map((line, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        {/* LINE NUMBER GUTTER */}
                        <td className="w-10 select-none pr-4 text-right text-[11px] text-[#475569] font-semibold align-top border-r border-white/5">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        {/* CODE LINE */}
                        <td className="pl-4 whitespace-pre font-mono text-xs text-[#e2e8f0]">
                          {line.trim().startsWith('//') || line.trim().startsWith('--') ? (
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
            <div className="flex items-center justify-between border-t border-white/5 bg-[#121c27] px-5 py-2.5 text-[11px] text-[#647895] font-mono-signal">
              <span>Signal School Digital Electronics HDL Engine</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
