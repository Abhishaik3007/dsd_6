import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Compass, Search, Boxes, GitBranch, Code2, 
  Copy, Check, Sparkles, ChevronDown, ArrowLeft,
  Layers, ShieldCheck, Zap, HelpCircle, X
} from 'lucide-react';
import { useHub } from '../../context/HubContext';
import { SORTING_ALGOS } from './algoData';
import { SortingAlgoVisualizer } from './SortingAlgoVisualizer';
import { PathfindingVisualizer } from './PathfindingVisualizer';
import { SearchPointerVisualizer } from './SearchPointerVisualizer';
import { DPBacktrackVisualizer } from './DPBacktrackVisualizer';
import { ALGORITHM_ITEMS } from './algoCatalogData';
import { LabTopBar } from '../common/LabTopBar';
import './algo-visualizer-styles.css';

export const AlgoVisualizerLab = () => {
  const { setActiveTab, selectedAlgoId } = useHub();

  // Active Category: 'sorting' | 'pathfinding' | 'search' | 'dp' | 'backtrack'
  const [activeCategory, setActiveCategory] = useState('sorting');
  const [currentAlgoId, setCurrentAlgoId] = useState(selectedAlgoId || 'bubble');
  const [activeStepData, setActiveStepData] = useState(null);

  // Theme & Help Modal state (matching Data Structures Lab)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Drawer / Side Panel State: DEFAULT TO 'invariants' (Complexities & Big-O)
  const [activeSideTab, setActiveSideTab] = useState('invariants'); // 'invariants' | 'code'
  const [codeLang, setCodeLang] = useState('js'); // 'js' | 'python' | 'cpp' | 'java'
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync selected algorithm from Hub Context if provided
  useEffect(() => {
    if (selectedAlgoId) {
      setCurrentAlgoId(selectedAlgoId);
      const found = ALGORITHM_ITEMS.find(a => a.id === selectedAlgoId);
      if (found?.labCategory) {
        setActiveCategory(found.labCategory);
      }
    }
  }, [selectedAlgoId]);

  // Current algorithm item from master catalog
  const currentAlgoItem = ALGORITHM_ITEMS.find(a => a.id === currentAlgoId) || ALGORITHM_ITEMS[0];

  // Grouped algorithms for the dropdown menu
  const sortingAlgos = ALGORITHM_ITEMS.filter(a => a.labCategory === 'sorting');
  const searchAlgos = ALGORITHM_ITEMS.filter(a => a.labCategory === 'search');
  const pathfindingAlgos = ALGORITHM_ITEMS.filter(a => a.labCategory === 'pathfinding');
  const dpBacktrackAlgos = ALGORITHM_ITEMS.filter(a => a.labCategory === 'dp' || a.labCategory === 'backtrack');

  const handleAlgoSelect = (algoId, category) => {
    setCurrentAlgoId(algoId);
    setActiveCategory(category);
  };

  const handleCopyCode = () => {
    const langKey = codeLang === 'js' ? 'javascript' : codeLang;
    const snippet = currentAlgoItem?.codeSnippets?.[langKey] || '';
    if (snippet && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getCodeSnippet = () => {
    const langKey = codeLang === 'js' ? 'javascript' : codeLang;
    return (
      currentAlgoItem?.codeSnippets?.[langKey] ||
      SORTING_ALGOS[currentAlgoId]?.code?.[codeLang] ||
      '// Implementation available in study documentation'
    );
  };

  const algoCategories = [
    {
      name: 'SORTING ENGINES',
      color: 'bg-teal-500',
      gridCols: 'grid-cols-1',
      items: sortingAlgos.map(item => ({ id: item.id, label: item.title, category: item.labCategory }))
    },
    {
      name: 'SEARCH & POINTERS',
      color: 'bg-amber-500',
      gridCols: 'grid-cols-1',
      items: searchAlgos.map(item => ({ id: item.id, label: item.title, category: item.labCategory }))
    },
    {
      name: 'GRAPH & PATHFINDING',
      color: 'bg-emerald-500',
      gridCols: 'grid-cols-1',
      items: pathfindingAlgos.map(item => ({ id: item.id, label: item.title, category: item.labCategory }))
    },
    {
      name: 'DP & BACKTRACKING',
      color: 'bg-indigo-500',
      gridCols: 'grid-cols-1',
      items: dpBacktrackAlgos.map(item => ({ id: item.id, label: item.title, category: item.labCategory }))
    }
  ];

  return (
    <div className={`algo-desk-workspace ${isDarkMode ? 'dark-mode-lab' : ''}`}>
      {/* 1. TOP SYSTEM NAVIGATION HEADER (SHARED COMPONENT - FLOATING MATCHING DSA LAB) */}
      <LabTopBar
        labTitle="Algorithm Visualizer"
        currentItemTitle={currentAlgoItem.title}
        currentId={currentAlgoId}
        categories={algoCategories}
        onSelect={(item) => handleAlgoSelect(item.id, item.category)}
        onBack={() => setActiveTab('algo-catalog')}
        backLabel="Docs"
        floating={true}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* HELP & LAB GUIDE MODAL (MATCHING DATA STRUCTURES LAB) */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className={`rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border flex flex-col gap-5 relative animate-in zoom-in-95 duration-150 font-sans ${isDarkMode ? 'bg-[#0f172a] text-white border-slate-700' : 'bg-white text-[#203247] border-[#203247]/15'}`}>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#347f7a]/10 text-[#347f7a]'}`}>
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Algorithm Visualizer Laboratory Guide</h3>
                  <p className="text-xs opacity-75">Interactive Step Execution, Complexity Analysis & Code Trace</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-[#647895] hover:text-[#203247]'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* SECTION 1: HOW TO OPERATE */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#347f7a] flex items-center gap-1.5">
                  <span>⚡</span> How to Explore Algorithms
                </h4>
                <ul className="list-disc list-inside space-y-1.5 opacity-90 leading-relaxed">
                  <li>Click the top navigation bar to choose from <strong>Sorting</strong>, <strong>Search</strong>, <strong>Graph</strong>, or <strong>DP</strong> engines.</li>
                  <li>Use the control toolbar to <strong>Play</strong>, <strong>Pause</strong>, <strong>Step Forward</strong>, or <strong>Reset</strong> state.</li>
                  <li>Adjust the <strong>Speed Slider</strong> or test on custom input sizes.</li>
                  <li>In Graph & Pathfinding, click cells on the grid to draw obstacle walls or move start/target.</li>
                </ul>
              </div>

              {/* SECTION 2: SYNCHRONIZED CODE & METRICS */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#347f7a] flex items-center gap-1.5">
                  <span>📊</span> Live Metrics & Code Trace
                </h4>
                <ul className="list-disc list-inside space-y-1.5 opacity-90 leading-relaxed">
                  <li>The right panel displays live <strong>Comparisons</strong>, <strong>Swaps/Visits</strong>, and exact <strong>Big-O Complexities</strong>.</li>
                  <li>Switch to the <strong>Code Trace</strong> tab to see synchronized line-by-line highlight as execution proceeds.</li>
                  <li>Copy starter implementations in JavaScript, Python, C++, or Java.</li>
                </ul>
              </div>

              {/* SECTION 3: TOPOLOGY & SUITES */}
              <div className={`md:col-span-2 p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#347f7a] flex items-center gap-1.5">
                  <span>🧭</span> Visualizer Categories
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1 font-mono text-[11px]">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold text-[#347f7a]">📊 Sorting</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Array bars, dual race comparisons & swaps</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold text-amber-500">🔍 Search</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Binary search bounds & 2-pointer scan</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold text-emerald-500">🗺️ Graph</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Dijkstra, BFS, DFS & A* wavefronts</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold text-indigo-500">🧩 DP & Backtrack</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Call tree memoization & table fill</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-md"
              >
                Got it, let's explore!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC WORKSPACE STAGE (FITS FULL SCREEN WITHOUT WINDOW SCROLL) */}
      <main className="algo-stage-layout">
        {/* LEFT COLUMN: INTERACTIVE VISUALIZER ENGINE CANVAS */}
        <section className="h-full flex flex-col min-h-0 overflow-hidden">
          {activeCategory === 'sorting' && (
            <SortingAlgoVisualizer
              currentAlgoId={currentAlgoId}
              isDarkMode={isDarkMode}
              onAlgoSelect={id => setCurrentAlgoId(id)}
              onStepChange={step => setActiveStepData(step)}
            />
          )}

          {activeCategory === 'pathfinding' && (
            <PathfindingVisualizer
              currentAlgoId={currentAlgoId}
              isDarkMode={isDarkMode}
              onAlgoSelect={id => setCurrentAlgoId(id)}
              onStepChange={step => setActiveStepData(step)}
            />
          )}

          {activeCategory === 'search' && (
            <SearchPointerVisualizer
              currentAlgoId={currentAlgoId}
              isDarkMode={isDarkMode}
              onAlgoSelect={id => setCurrentAlgoId(id)}
              onStepChange={step => setActiveStepData(step)}
            />
          )}

          {activeCategory === 'dp' && (
            <DPBacktrackVisualizer
              currentAlgoId={currentAlgoId}
              defaultMode={currentAlgoId === 'knapsack' ? 'knapsack' : 'fib'}
              isDarkMode={isDarkMode}
              onAlgoSelect={id => setCurrentAlgoId(id)}
              onStepChange={step => setActiveStepData(step)}
            />
          )}

          {activeCategory === 'backtrack' && (
            <DPBacktrackVisualizer
              currentAlgoId={currentAlgoId}
              defaultMode="nqueens"
              isDarkMode={isDarkMode}
              onAlgoSelect={id => setCurrentAlgoId(id)}
              onStepChange={step => setActiveStepData(step)}
            />
          )}
        </section>

        {/* RIGHT COLUMN: COMPLEXITIES (DEFAULT) & CODE TRACE DRAWER */}
        <aside className="h-full flex flex-col min-h-0 overflow-hidden">
          {/* TAB SWITCHER PILLS */}
          <div className="bg-white rounded-2xl border border-[#203247]/12 p-1 flex items-center gap-1 shadow-2xs shrink-0 mb-2.5">
            <button
              onClick={() => setActiveSideTab('invariants')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                activeSideTab === 'invariants'
                  ? 'bg-[#347f7a] text-white shadow-xs'
                  : 'text-[#526b88] hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={14} /> Complexity & Big-O
            </button>
            <button
              onClick={() => setActiveSideTab('code')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                activeSideTab === 'code'
                  ? 'bg-[#203247] text-white shadow-xs'
                  : 'text-[#526b88] hover:bg-slate-50'
              }`}
            >
              <Code2 size={14} /> Code Trace
            </button>
          </div>

          {/* TAB 1: COMPLEXITY MATRIX & INVARIANTS (ACTIVE BY DEFAULT) */}
          {activeSideTab === 'invariants' && (
            <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-[#203247]/12 p-4 shadow-sm custom-scrollbar flex flex-col gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-extrabold text-sm text-[#203247]">
                    {currentAlgoItem.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-[#347f7a]/10 text-[#347f7a] font-mono text-[10px] font-bold">
                    {currentAlgoItem.paradigm || currentAlgoItem.category}
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {currentAlgoItem.shortDesc || currentAlgoItem.overview}
                </p>
              </div>

              {/* Big-O Table */}
              <div className="border border-[#203247]/10 rounded-xl overflow-hidden font-mono text-[11px]">
                <div className="grid grid-cols-2 bg-[#faf8f4] border-b border-[#203247]/10 p-2 font-bold text-[#647895]">
                  <span>Metric</span>
                  <span>Complexity</span>
                </div>
                <div className="grid grid-cols-2 p-2 border-b border-slate-100">
                  <span className="text-slate-600 font-sans">Best Time</span>
                  <span className="font-bold text-emerald-700">{currentAlgoItem.timeBest || 'O(N)'}</span>
                </div>
                <div className="grid grid-cols-2 p-2 border-b border-slate-100 bg-[#faf8f4]/50">
                  <span className="text-slate-600 font-sans">Average Time</span>
                  <span className="font-bold text-amber-700">{currentAlgoItem.timeAvg || 'O(N log N)'}</span>
                </div>
                <div className="grid grid-cols-2 p-2 border-b border-slate-100">
                  <span className="text-slate-600 font-sans">Worst Time</span>
                  <span className="font-bold text-rose-700">{currentAlgoItem.timeWorst || 'O(N²)'}</span>
                </div>
                <div className="grid grid-cols-2 p-2 border-b border-slate-100 bg-[#faf8f4]/50">
                  <span className="text-slate-600 font-sans">Auxiliary Space</span>
                  <span className="font-bold text-[#347f7a]">{currentAlgoItem.space || 'O(1)'}</span>
                </div>
                <div className="grid grid-cols-2 p-2">
                  <span className="text-slate-600 font-sans">
                    {currentAlgoItem.stable !== undefined ? 'Stable Sort?' : 'Guarantees Optimal?'}
                  </span>
                  <span className="font-bold text-[#203247]">
                    {currentAlgoItem.stable !== undefined
                      ? (currentAlgoItem.stable ? 'Yes (Stable)' : 'No (Unstable)')
                      : 'Yes (Deterministic)'}
                  </span>
                </div>
              </div>

              {/* Key Pedagogical Invariants */}
              {currentAlgoItem.invariants && currentAlgoItem.invariants.length > 0 && (
                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#203247]/10 flex flex-col gap-1.5">
                  <strong className="text-[#203247] font-sans text-xs flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#347f7a]" /> Key Loop Invariants:
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans leading-relaxed">
                    {currentAlgoItem.invariants.map((inv, idx) => (
                      <li key={idx}>{inv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Real World Use */}
              {currentAlgoItem.realWorldUse && (
                <div className="p-3 rounded-xl bg-[#d9e8df]/40 border border-[#347f7a]/25 text-[#203247] leading-relaxed">
                  <span className="font-bold block mb-0.5 text-xs text-[#1e5a55]">Real-World Engineering Application:</span>
                  <span className="text-slate-700">{currentAlgoItem.realWorldUse}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYNCHRONIZED CODE TRACE */}
          {activeSideTab === 'code' && (
            <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-[#203247]/12 p-4 shadow-sm custom-scrollbar flex flex-col gap-3">
              {/* Language Switcher & Copy */}
              <div className="flex items-center justify-between border-b border-[#203247]/10 pb-3 shrink-0">
                <div className="flex items-center gap-1">
                  {['js', 'python', 'cpp', 'java'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-bold cursor-pointer border-none transition-all ${
                        codeLang === lang ? 'bg-[#203247] text-white' : 'text-[#526b88] hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'js' ? 'JS' : lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg border border-[#203247]/10 text-[#526b88] hover:text-[#203247] hover:bg-slate-50 cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Copy code snippet"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Trace Window */}
              <div className="code-trace-panel flex-1 min-h-[220px]">
                {getCodeSnippet()
                  .split('\n')
                  .map((line, idx) => {
                    const lineNum = idx + 1;
                    const isActive = activeStepData?.line === lineNum;
                    return (
                      <div
                        key={lineNum}
                        className={`code-trace-line ${isActive ? 'active' : ''}`}
                      >
                        <span className="code-line-num">{lineNum}</span>
                        <span className="flex-1 whitespace-pre">{line}</span>
                      </div>
                    );
                  })}
              </div>

              <p className="text-[11px] text-[#647895] leading-relaxed shrink-0">
                Active execution line highlights synchronously as you scrub or step through the algorithm timeline.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};
