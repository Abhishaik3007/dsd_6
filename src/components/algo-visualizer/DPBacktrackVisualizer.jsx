import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, SkipBack, SkipForward, Boxes, 
  Crown, Sparkles, Volume2, VolumeX, Briefcase, 
  CheckCircle2, ArrowRight, Zap, ShieldAlert, GitBranch, X,
  Swords, AlertTriangle, Cpu, Trophy, Flag, Scissors, Layers, Eye
} from 'lucide-react';
import { soundEngine } from './soundEngine';

export const DPBacktrackVisualizer = ({ onStepChange, onAlgoSelect, defaultMode = 'fib', currentAlgoId, isDarkMode = false }) => {
  const getSubTabFromId = (id) => {
    if (id === 'nqueens') return 'nqueens';
    if (id === 'knapsack') return 'knapsack';
    return 'fib';
  };

  // 'fib' | 'knapsack' | 'nqueens'
  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromId(currentAlgoId || defaultMode));
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  useEffect(() => {
    if (currentAlgoId) {
      setActiveSubTab(getSubTabFromId(currentAlgoId));
    } else if (defaultMode) {
      setActiveSubTab(getSubTabFromId(defaultMode));
    }
  }, [currentAlgoId, defaultMode]);

  useEffect(() => {
    if (onAlgoSelect) {
      const algoId = activeSubTab === 'fib' ? 'fibonacci' : activeSubTab === 'knapsack' ? 'knapsack' : 'nqueens';
      onAlgoSelect(algoId);
    }
  }, [activeSubTab]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };


  // =========================================================
  // 1. DYNAMIC FIBONACCI TREE & DP MEMOIZATION ENGINE (DUEL)
  // =========================================================
  const [fibN, setFibN] = useState(5);
  const [fibViewMode, setFibViewMode] = useState('pruned'); // 'pruned' | 'naive' | 'table'
  const [fibStep, setFibStep] = useState(0);
  const [isFibPlaying, setIsFibPlaying] = useState(false);
  const [selectedK, setSelectedK] = useState(null);

  // Precomputed Fibonacci sequence for quick lookup up to 12
  const fibValues = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

  // Naive calls: C(n) = 2 * F(n+1) - 1
  const getNaiveCalls = (n) => {
    let a = 1, b = 1;
    for (let k = 2; k <= n; k++) {
      const c = a + b;
      a = b;
      b = c;
    }
    return 2 * b - 1;
  };

  const totalNaiveCalls = getNaiveCalls(fibN);
  const totalDpOps = fibN + 1;
  const callsSaved = totalNaiveCalls - totalDpOps;
  const percentSaved = Math.round((callsSaved / totalNaiveCalls) * 100);

  // Subproblem call count in naive recursion of fib(fibN)
  const getSubproblemCallCount = (k) => {
    if (k === 0) return fibN >= 2 ? fibValues[fibN - 1] : 1;
    const offset = fibN - k + 1;
    return offset >= 1 && offset < fibValues.length ? fibValues[offset] : 1;
  };

  // Build tree layout for a specific mode ('pruned' or 'naive')
  const buildTreeLayout = (mode) => {
    let idCounter = 0;
    const counts = {};
    const nodes = [];
    const edges = [];

    function build(k, depth = 0, parentId = null, isLeft = true) {
      const id = `${mode}-node-${idCounter++}`;
      counts[k] = (counts[k] || 0) + 1;
      const occurrence = counts[k];
      const isDuplicate = occurrence > 1;
      const isBaseCase = k <= 1;
      const isPruned = mode === 'pruned' && isDuplicate && !isBaseCase;

      const node = {
        id,
        k,
        val: fibValues[k] ?? 0,
        depth,
        parentId,
        isLeft,
        occurrence,
        isDuplicate,
        isBaseCase,
        isPruned,
        children: []
      };
      nodes.push(node);

      if (parentId !== null) {
        edges.push({ from: parentId, to: id, isPrunedEdge: isPruned });
      }

      if (!isBaseCase && !isPruned) {
        const left = build(k - 1, depth + 1, id, true);
        const right = build(k - 2, depth + 1, id, false);
        node.children = [left, right];
      }

      return node;
    }

    const root = build(fibN, 0, null, true);

    // In-order leaf placement ensures ZERO overlapping nodes
    let leafIdx = 0;
    const leafSpacing = mode === 'pruned'
      ? (fibN <= 4 ? 132 : (fibN === 5 ? 118 : 106))
      : (fibN === 3 ? 96 : fibN === 4 ? 64 : fibN === 5 ? 44 : 32);
    const levelHeight = mode === 'pruned' ? 84 : (fibN >= 6 ? 56 : 64);
    const topPadding = 48;
    const sidePadding = mode === 'pruned' ? 58 : 36;

    function position(node) {
      if (!node.children || node.children.length === 0) {
        node.x = sidePadding + leafIdx * leafSpacing;
        leafIdx++;
      } else {
        node.children.forEach(position);
        node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
      }
      node.y = topPadding + node.depth * levelHeight;
    }

    position(root);

    const maxDepth = Math.max(...nodes.map(n => n.depth));
    const calculatedWidth = Math.max(460, sidePadding * 2 + Math.max(1, leafIdx - 1) * leafSpacing);
    const calculatedHeight = topPadding + maxDepth * levelHeight + 62;

    return {
      root,
      nodes,
      edges,
      width: calculatedWidth,
      height: calculatedHeight,
      totalNodes: nodes.length,
      prunedCount: nodes.filter(n => n.isPruned).length,
      duplicateCount: nodes.filter(n => n.isDuplicate).length
    };
  };

  const naiveTree = useMemo(() => buildTreeLayout('naive'), [fibN]);
  const prunedTree = useMemo(() => buildTreeLayout('pruned'), [fibN]);

  // Generate synchronized step sequence for lockstep duel
  const fibTreeSteps = useMemo(() => {
    // 1. Naive Steps
    const naiveSteps = [];
    const naiveVisited = new Set();
    let naiveRedundant = 0;

    function dfsNaive(node) {
      if (!node) return;
      if (node.isDuplicate) naiveRedundant++;
      naiveSteps.push({
        activeNodeId: node.id,
        activeK: node.k,
        status: node.isDuplicate ? 'redundant' : 'visiting',
        visited: Array.from(naiveVisited),
        redundantOps: naiveRedundant,
        insight: node.isDuplicate 
          ? `⚠️ Naive Recursion: Recalculating fib(${node.k}) again (${node.occurrence}th time). Subtree repeating identical work!`
          : `🔍 Naive Recursion: Calling fib(${node.k})...`
      });

      if (node.isBaseCase) {
        naiveVisited.add(node.id);
        naiveSteps.push({
          activeNodeId: node.id,
          activeK: node.k,
          status: 'base',
          visited: Array.from(naiveVisited),
          redundantOps: naiveRedundant,
          insight: `🌱 Base Case: fib(${node.k}) = ${node.val}`
        });
        return;
      }

      if (node.children[0]) dfsNaive(node.children[0]);
      if (node.children[1]) dfsNaive(node.children[1]);

      naiveVisited.add(node.id);
      naiveSteps.push({
        activeNodeId: node.id,
        activeK: node.k,
        status: 'computed',
        visited: Array.from(naiveVisited),
        redundantOps: naiveRedundant,
        insight: `✅ Resolved fib(${node.k}) = ${node.val}`
      });
    }

    if (naiveTree.root) dfsNaive(naiveTree.root);

    // 2. DP Pruned Steps
    const prunedSteps = [];
    const dpTable = Array(fibN + 1).fill(null);
    const prunedVisited = new Set();
    const prunedHits = new Set();

    function dfsPruned(node) {
      if (!node) return;
      if (node.isDuplicate && dpTable[node.k] !== null) {
        prunedHits.add(node.id);
        prunedVisited.add(node.id);
        prunedSteps.push({
          activeNodeId: node.id,
          activeK: node.k,
          laserPrunedNode: { x: node.x, y: node.y, k: node.k, val: node.val },
          status: 'cache_hit',
          table: [...dpTable],
          visited: Array.from(prunedVisited),
          pruned: Array.from(prunedHits),
          insight: `fib(${node.k}) found in cache: dp[${node.k}] = ${dpTable[node.k]} (O(1) lookup). Subtree pruned.`
        });
        return;
      }

      prunedSteps.push({
        activeNodeId: node.id,
        activeK: node.k,
        laserPrunedNode: null,
        status: 'visiting',
        table: [...dpTable],
        visited: Array.from(prunedVisited),
        pruned: Array.from(prunedHits),
        insight: `🔍 DP: Evaluating fib(${node.k})...`
      });

      if (node.isBaseCase) {
        dpTable[node.k] = node.val;
        prunedVisited.add(node.id);
        prunedSteps.push({
          activeNodeId: node.id,
          activeK: node.k,
          laserPrunedNode: null,
          status: 'base',
          table: [...dpTable],
          visited: Array.from(prunedVisited),
          pruned: Array.from(prunedHits),
          insight: `🌱 DP Base Case: dp[${node.k}] = ${node.val}`
        });
        return;
      }

      if (node.children[0]) dfsPruned(node.children[0]);
      if (node.children[1]) dfsPruned(node.children[1]);

      dpTable[node.k] = node.val;
      prunedVisited.add(node.id);
      prunedSteps.push({
        activeNodeId: node.id,
        activeK: node.k,
        laserPrunedNode: null,
        status: 'computed',
        table: [...dpTable],
        visited: Array.from(prunedVisited),
        pruned: Array.from(prunedHits),
        insight: `✅ DP Stored: dp[${node.k}] = ${node.val}`
      });
    }

    if (prunedTree.root) dfsPruned(prunedTree.root);

    // 3. Lockstep Combination
    const maxSteps = Math.max(naiveSteps.length, prunedSteps.length);
    const combined = [];

    for (let s = 0; s < maxSteps; s++) {
      const nStep = naiveSteps[Math.min(s, naiveSteps.length - 1)];
      const pStep = prunedSteps[Math.min(s, prunedSteps.length - 1)];
      const dpDone = s >= prunedSteps.length - 1;

      combined.push({
        naive: nStep,
        pruned: pStep,
        dpDone,
        activeK: pStep?.activeK ?? nStep?.activeK,
        table: pStep?.table || Array(fibN + 1).fill(null),
        status: pStep?.status || 'visiting',
        laserPrunedNode: pStep?.laserPrunedNode || null,
        insight: dpDone 
          ? `🏆 DP solved in ${prunedSteps.length} steps! Naive recursion still executing call ${s + 1}/${naiveSteps.length} (${nStep?.redundantOps} redundant calls)...`
          : pStep?.insight || nStep?.insight || `Computing fib(${fibN})...`
      });
    }

    return combined.length > 0 ? combined : [{
      naive: null,
      pruned: null,
      dpDone: false,
      activeK: null,
      table: Array(fibN + 1).fill(null),
      status: 'init',
      laserPrunedNode: null,
      insight: `Ready to run.`
    }];
  }, [naiveTree, prunedTree, fibN]);

  useEffect(() => {
    setFibStep(0);
    setIsFibPlaying(false);
    setSelectedK(null);
  }, [fibN, fibViewMode]);

  // Fib animation ticker
  useEffect(() => {
    if (!isFibPlaying) return;
    const delay = Math.max(130, 520 / speedMultiplier);
    const timer = setTimeout(() => {
      if (fibStep < fibTreeSteps.length - 1) {
        const next = fibStep + 1;
        setFibStep(next);
        const curr = fibTreeSteps[next];
        if (curr?.status === 'cache_hit') {
          soundEngine.playSuccessChime();
        } else if (curr?.status === 'complete' || curr?.dpDone) {
          soundEngine.playSuccessChime();
        } else if (curr?.naive?.status === 'redundant') {
          soundEngine.playTone(22, 20, 80, 40);
        } else {
          soundEngine.playTone(34 + (next % 8) * 8, 15, 60, 25);
        }
      } else {
        setIsFibPlaying(false);
        soundEngine.playSuccessChime();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isFibPlaying, fibStep, fibTreeSteps.length, speedMultiplier]);

  // =========================================================
  // 2. 0/1 KNAPSACK 2D DP ENGINE
  // =========================================================
  const KNAPSACK_PRESETS = {
    classic: {
      name: 'Vault (W=7)',
      capacity: 7,
      items: [
        { name: 'Camera', wt: 1, val: 1, icon: '📷' },
        { name: 'Phone', wt: 2, val: 3, icon: '📱' },
        { name: 'Laptop', wt: 3, val: 4, icon: '💻' },
        { name: 'Gemstone', wt: 4, val: 5, icon: '💎' }
      ]
    },
    heist: {
      name: 'Jewelry (W=6)',
      capacity: 6,
      items: [
        { name: 'Watch', wt: 1, val: 2, icon: '⌚' },
        { name: 'Gold Bar', wt: 2, val: 5, icon: '🪙' },
        { name: 'Tiara', wt: 3, val: 6, icon: '👑' },
        { name: 'Artifact', wt: 4, val: 8, icon: '🏺' }
      ]
    }
  };

  const [ksPresetKey, setKsPresetKey] = useState('classic');
  const [ksCapacity, setKsCapacity] = useState(7);
  const [ksSteps, setKsSteps] = useState([]);
  const [ksStep, setKsStep] = useState(0);
  const [isKsPlaying, setIsKsPlaying] = useState(false);

  const activeKsPreset = KNAPSACK_PRESETS[ksPresetKey] || KNAPSACK_PRESETS.classic;
  const ksItems = activeKsPreset.items;

  useEffect(() => {
    const N = ksItems.length;
    const W = ksCapacity;
    const steps = [];

    const matrix = Array.from({ length: N + 1 }, () => Array(W + 1).fill(0));

    steps.push({
      itemIdx: 0,
      cap: 0,
      matrix: matrix.map(row => [...row]),
      decision: 'init',
      optimalItems: [],
      insight: `Initial 2D Matrix (0 items, capacity 0..${W}). Base cases dp[0][w] = 0 and dp[i][0] = 0.`
    });

    for (let i = 1; i <= N; i++) {
      const item = ksItems[i - 1];
      for (let w = 1; w <= W; w++) {
        const leaveVal = matrix[i - 1][w];
        let takeVal = -1;
        let chosen = 'leave';

        if (item.wt <= w) {
          takeVal = item.val + matrix[i - 1][w - item.wt];
          if (takeVal > leaveVal) {
            matrix[i][w] = takeVal;
            chosen = 'take';
          } else {
            matrix[i][w] = leaveVal;
          }
        } else {
          matrix[i][w] = leaveVal;
          chosen = 'too_heavy';
        }

        steps.push({
          itemIdx: i,
          cap: w,
          matrix: matrix.map(row => [...row]),
          decision: chosen,
          item,
          leaveVal,
          takeVal,
          parentLeave: { r: i - 1, c: w },
          parentTake: item.wt <= w ? { r: i - 1, c: w - item.wt } : null,
          optimalItems: [],
          insight: chosen === 'take'
            ? `Item [${item.name}] (wt: ${item.wt}, val: $${item.val}) TAKEN! val + dp[${i-1}][${w-item.wt}] ($${takeVal}) > leave ($${leaveVal}).`
            : chosen === 'too_heavy'
            ? `Item [${item.name}] wt (${item.wt}kg) exceeds capacity limit (${w}kg). Must leave item: dp[${i}][${w}] = $${leaveVal}.`
            : `Item [${item.name}] left behind: leave ($${leaveVal}) ≥ take ($${takeVal}). dp[${i}][${w}] = $${leaveVal}.`
        });
      }
    }

    // Backtrack optimal items
    const optimal = [];
    let curW = W;
    for (let i = N; i > 0; i--) {
      if (matrix[i][curW] !== matrix[i - 1][curW]) {
        optimal.push(i - 1);
        curW -= ksItems[i - 1].wt;
      }
    }

    steps.push({
      itemIdx: N,
      cap: W,
      matrix: matrix.map(row => [...row]),
      decision: 'complete',
      optimalItems: optimal,
      insight: `🏆 Optimal Solution Found! Maximum packed value is $${matrix[N][W]}. Selected items: ${optimal.map(idx => ksItems[idx].name).join(', ')}.`
    });

    setKsSteps(steps);
    setKsStep(0);
    setIsKsPlaying(false);
  }, [ksPresetKey, ksCapacity]);

  // Knapsack animation ticker
  useEffect(() => {
    if (!isKsPlaying) return;
    const delay = Math.max(100, 450 / speedMultiplier);
    const timer = setTimeout(() => {
      if (ksStep < ksSteps.length - 1) {
        setKsStep(p => p + 1);
        soundEngine.playTone(35 + ksStep * 3, 20, 100, 40);
      } else {
        setIsKsPlaying(false);
        soundEngine.playSuccessChime();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isKsPlaying, ksStep, ksSteps.length, speedMultiplier]);

  // =========================================================
  // 3. N-QUEENS BACKTRACKING WITH THREAT RAYS
  // =========================================================
  const [boardSize, setBoardSize] = useState(6); // default to 6 (6x6)
  const [queenSteps, setQueenSteps] = useState([]);
  const [qStepIdx, setQStepIdx] = useState(0);
  const [isQPlaying, setIsQPlaying] = useState(false);

  useEffect(() => {
    const steps = [];
    const board = Array(boardSize).fill(-1); // row -> col
    let solCounter = 0;

    const isSafe = (row, col) => {
      for (let r = 0; r < row; r++) {
        const c = board[r];
        if (c === col) return { safe: false, conflictRow: r, conflictCol: c, type: 'column' };
        if (Math.abs(c - col) === Math.abs(r - row)) return { safe: false, conflictRow: r, conflictCol: c, type: 'diagonal' };
      }
      return { safe: true };
    };

    const solve = (row) => {
      if (row === boardSize) {
        solCounter++;
        steps.push({
          board: [...board],
          currentRow: row,
          currentCol: -1,
          status: 'success',
          solIndex: solCounter,
          insight: `👑 Valid Solution #${solCounter} Found! All ${boardSize} queens placed peacefully with zero threats.`
        });
        return true;
      }

      for (let col = 0; col < boardSize; col++) {
        board[row] = col;
        const check = isSafe(row, col);

        if (check.safe) {
          steps.push({
            board: [...board],
            currentRow: row,
            currentCol: col,
            status: 'place',
            insight: `Row ${row}: Testing Queen at column ${col}. Position is safe! Advancing to row ${row + 1}.`
          });
          const found = solve(row + 1);
          if (found) return true;
        } else {
          steps.push({
            board: [...board],
            currentRow: row,
            currentCol: col,
            status: 'conflict',
            conflictInfo: check,
            insight: `⚡ Conflict! Candidate at (${row}, ${col}) is attacked by Queen at (${check.conflictRow}, ${check.conflictCol}) along same ${check.type}. Pruning branch!`
          });
        }
        board[row] = -1;
      }

      steps.push({
        board: [...board],
        currentRow: row,
        currentCol: -1,
        status: 'backtrack',
        insight: `⬅️ Backtracking! Row ${row} exhausted all columns. Rewinding to previous row to explore next branch.`
      });
      return false;
    };

    solve(0);
    setQueenSteps(steps);
    setQStepIdx(0);
    setIsQPlaying(false);
  }, [boardSize]);

  // N-Queens animation ticker
  useEffect(() => {
    if (!isQPlaying) return;
    const delay = Math.max(150, 600 / speedMultiplier);
    const timer = setTimeout(() => {
      if (qStepIdx < queenSteps.length - 1) {
        setQStepIdx(p => p + 1);
        const st = queenSteps[qStepIdx];
        if (st?.status === 'place') soundEngine.playTone(45, 20, 100, 40);
        else if (st?.status === 'conflict') soundEngine.playTone(18, 20, 100, 40);
      } else {
        setIsQPlaying(false);
        soundEngine.playSuccessChime();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isQPlaying, qStepIdx, queenSteps.length, speedMultiplier]);

  // Sync with parent code drawer
  useEffect(() => {
    if (!onStepChange) return;
    if (activeSubTab === 'fib' && fibTreeSteps[fibStep]) {
      const step = fibTreeSteps[fibStep];
      let line = 1;
      if (step.status === 'cache_hit') line = 2;
      else if (step.status === 'base') line = 4;
      else if (step.status === 'visiting' || step.status === 'redundant') line = 6;
      else if (step.status === 'computed' || step.status === 'complete') line = 8;
      onStepChange({
        ...step,
        title: fibViewMode === 'pruned' ? 'Fibonacci (DP Memoization Pruned)' : 'Fibonacci (Naive Recursion Tree)',
        line
      });
    } else if (activeSubTab === 'knapsack' && ksSteps[ksStep]) {
      onStepChange({
        ...ksSteps[ksStep],
        title: '0/1 Knapsack Problem',
        line: ksSteps[ksStep].decision === 'take' ? 9 : 11
      });
    } else if (activeSubTab === 'nqueens' && queenSteps[qStepIdx]) {
      onStepChange({
        ...queenSteps[qStepIdx],
        title: 'N-Queens Backtracking',
        line: queenSteps[qStepIdx].status === 'conflict' ? 6 : 8
      });
    }
  }, [activeSubTab, fibStep, ksStep, qStepIdx, fibTreeSteps, ksSteps, queenSteps, fibViewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (activeSubTab === 'fib') setIsFibPlaying(p => !p);
        else if (activeSubTab === 'knapsack') setIsKsPlaying(p => !p);
        else setIsQPlaying(p => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (activeSubTab === 'fib') {
          setIsFibPlaying(false);
          setFibStep(p => Math.min(fibTreeSteps.length - 1, p + 1));
        } else if (activeSubTab === 'knapsack') {
          setIsKsPlaying(false);
          setKsStep(p => Math.min(ksSteps.length - 1, p + 1));
        } else {
          setIsQPlaying(false);
          setQStepIdx(p => Math.min(queenSteps.length - 1, p + 1));
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (activeSubTab === 'fib') {
          setIsFibPlaying(false);
          setFibStep(p => Math.max(0, p - 1));
        } else if (activeSubTab === 'knapsack') {
          setIsKsPlaying(false);
          setKsStep(p => Math.max(0, p - 1));
        } else {
          setIsQPlaying(false);
          setQStepIdx(p => Math.max(0, p - 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, fibTreeSteps.length, ksSteps.length, queenSteps.length]);

  const currentFibStep = fibTreeSteps[fibStep] || { table: [], insight: '', status: 'init', activeK: null, visited: [], pruned: [] };
  const currentKsStep = ksSteps[ksStep] || { matrix: [], insight: '', decision: 'init', optimalItems: [] };
  const currentQStep = queenSteps[qStepIdx] || { board: [], status: 'init', insight: '' };

  // Helper to render responsive SVG tree with clean DP Memoization pruning
  const renderTreeCanvas = (tree, mode, activeNodeId, visitedIds = [], laserNode = null) => {
    return (
      <div className="w-full h-full flex items-center justify-center relative select-none">
        <svg
          viewBox={`0 0 ${tree.width} ${tree.height}`}
          className="w-full h-full max-h-[390px] block select-none"
          style={{ maxWidth: `${Math.min(tree.width + 60, 920)}px` }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* AMBIENT GLOW FILTERS */}
            <filter id="emerald-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="amber-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* SLEEK NODE GRADIENTS */}
            <linearGradient id="prunedPillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? '#064e3b' : '#ecfdf5'} />
              <stop offset="100%" stopColor={isDarkMode ? '#022c22' : '#d1fae5'} />
            </linearGradient>
            <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? '#78350f' : '#fef3c7'} />
              <stop offset="100%" stopColor={isDarkMode ? '#451a03' : '#fde68a'} />
            </linearGradient>
            <linearGradient id="visitedNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? '#134e4a' : '#f0fdfa'} />
              <stop offset="100%" stopColor={isDarkMode ? '#042f2e' : '#ccfbf1'} />
            </linearGradient>
            <linearGradient id="baseNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? '#1e1b4b' : '#eff6ff'} />
              <stop offset="100%" stopColor={isDarkMode ? '#0f172a' : '#dbeafe'} />
            </linearGradient>
          </defs>

          {/* BRANCH CONNECTORS */}
          <g className="edges">
            {tree.edges.map(edge => {
              const fromNode = tree.nodes.find(n => n.id === edge.from);
              const toNode = tree.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const isTraversed = visitedIds.includes(toNode.id);
              const isCurrentEdge = activeNodeId === toNode.id;
              const isPrunedEdge = edge.isPrunedEdge;

              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${(fromNode.y + toNode.y)/2}, ${toNode.x} ${(fromNode.y + toNode.y)/2}, ${toNode.x} ${toNode.y}`}
                  fill="none"
                  stroke={
                    isCurrentEdge 
                      ? '#f59e0b' 
                      : isPrunedEdge 
                      ? (isDarkMode ? '#10b981' : '#059669') 
                      : isTraversed 
                      ? (isDarkMode ? '#475569' : '#334155') 
                      : (isDarkMode ? '#1e293b' : '#cbd5e1')
                  }
                  strokeWidth={isCurrentEdge ? 3 : isPrunedEdge ? 2.5 : 2}
                  strokeDasharray={isPrunedEdge ? '5 3' : 'none'}
                  filter={isCurrentEdge ? 'url(#amber-glow)' : 'none'}
                  className="transition-all duration-200"
                />
              );
            })}
          </g>

          {/* TREE NODES */}
          <g className="nodes">
            {tree.nodes.map(node => {
              const isVisited = visitedIds.includes(node.id);
              const isActive = activeNodeId === node.id;
              const isSelected = selectedK === node.k;
              const nodeRadius = mode === 'pruned' ? 25 : (tree.totalNodes > 20 ? 16 : (tree.totalNodes > 10 ? 19 : 23));

              // Pruned DP Leaf Node
              if (node.isPruned) {
                const pillWidth = 118;
                const pillHeight = 36;

                return (
                  <g 
                    key={node.id}
                    onClick={() => setSelectedK(selectedK === node.k ? null : node.k)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    {isSelected && (
                      <rect
                        x={node.x - pillWidth / 2 - 5}
                        y={node.y - pillHeight / 2 - 5}
                        width={pillWidth + 10}
                        height={pillHeight + 10}
                        rx={23}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                    )}
                    {isActive && (
                      <rect
                        x={node.x - pillWidth / 2 - 4}
                        y={node.y - pillHeight / 2 - 4}
                        width={pillWidth + 8}
                        height={pillHeight + 8}
                        rx={22}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        filter="url(#emerald-glow)"
                        className="animate-pulse"
                      />
                    )}
                    <rect
                      x={node.x - pillWidth / 2}
                      y={node.y - pillHeight / 2}
                      width={pillWidth}
                      height={pillHeight}
                      rx={18}
                      fill="url(#prunedPillGrad)"
                      stroke={isDarkMode ? '#10b981' : '#059669'}
                      strokeWidth={isActive ? 3 : 2}
                      className="drop-shadow-sm"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4.5}
                      textAnchor="middle"
                      className="font-mono text-[11.5px] font-black pointer-events-none tracking-tight"
                      fill={isDarkMode ? '#a7f3d0' : '#065f46'}
                    >
                      dp[{node.k}] = {node.val}
                    </text>
                  </g>
                );
              }

              // Standard Tree Node
              const isRedundantNaive = node.isDuplicate && mode === 'naive';
              let fillBg = isDarkMode ? '#1e293b' : '#ffffff';
              let strokeColor = isDarkMode ? '#475569' : '#334155';
              let textColor = isDarkMode ? '#cbd5e1' : '#1e293b';

              if (isRedundantNaive) {
                fillBg = isDarkMode ? '#4c0519' : '#fff1f2';
                strokeColor = '#f43f5e';
                textColor = isDarkMode ? '#fecdd3' : '#be123c';
              } else if (isActive) {
                fillBg = 'url(#activeNodeGrad)';
                strokeColor = '#f59e0b';
                textColor = isDarkMode ? '#fef3c7' : '#92400e';
              } else if (isVisited) {
                fillBg = 'url(#visitedNodeGrad)';
                strokeColor = isDarkMode ? '#0d9488' : '#0f766e';
                textColor = isDarkMode ? '#99f6e4' : '#0f766e';
              } else if (node.isBaseCase) {
                fillBg = 'url(#baseNodeGrad)';
                strokeColor = isDarkMode ? '#818cf8' : '#3b82f6';
                textColor = isDarkMode ? '#c7d2fe' : '#1d4ed8';
              }

              return (
                <g 
                  key={node.id}
                  onClick={() => setSelectedK(selectedK === node.k ? null : node.k)}
                  className="cursor-pointer transition-transform hover:scale-108"
                >
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius + 6}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  )}
                  {isActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius + 5}
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="2.75"
                      filter="url(#amber-glow)"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={fillBg}
                    stroke={strokeColor}
                    strokeWidth={isActive ? 3 : 2.25}
                    className="drop-shadow-sm"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4.5}
                    textAnchor="middle"
                    className="font-mono text-[12px] font-black pointer-events-none"
                    fill={textColor}
                  >
                    F({node.k})
                  </text>
                  {isVisited && (
                    <g transform={`translate(${node.x}, ${node.y + nodeRadius + 10})`}>
                      <rect
                        x={-18}
                        y={-7}
                        width={36}
                        height={15}
                        rx={5}
                        fill={isDarkMode ? '#0f172a' : '#ffffff'}
                        stroke={isDarkMode ? '#334155' : '#475569'}
                        strokeWidth="1.5"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        className="font-mono text-[9.5px] font-black pointer-events-none"
                        fill={isDarkMode ? '#cbd5e1' : '#1e293b'}
                      >
                        ={node.val}
                      </text>
                    </g>
                  )}
                  {isRedundantNaive && (
                    <g transform={`translate(${node.x}, ${node.y - nodeRadius - 8})`}>
                      <rect
                        x={-20}
                        y={-6}
                        width={40}
                        height={12}
                        rx={3}
                        fill="#f43f5e"
                      />
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        className="font-mono text-[7px] font-black fill-white pointer-events-none"
                      >
                        DUP {node.occurrence}×
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  // Helper to render the synchronized 1D DP Array cache directly below the tree
  const renderDpArrayCache = () => {
    const computedCount = currentFibStep.table.filter(v => v !== null).length;

    return (
      <div className={`flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-2xl border w-full shrink-0 transition-all ${
        isDarkMode 
          ? 'bg-[#0f172a]/95 border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
          : 'bg-white border-slate-200/90 shadow-2xs'
      }`}>
        {/* Table Header with Quick Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs sm:text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-[#1e293b]'}`}>
              DP Memoization Cache (<code className={isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold'}>dp[0...{fibN}]</code>):
            </span>
            <span className={`text-[11px] font-semibold hidden sm:inline ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              • Click any cell to cross-inspect
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isDarkMode 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black'
            }`}>
              Cached: {computedCount} / {fibN + 1}
            </span>
            {selectedK !== null && (
              <button
                onClick={() => setSelectedK(null)}
                className={`text-[11px] font-mono underline cursor-pointer flex items-center gap-1 ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900 font-bold'
                }`}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Cache Slots Grid */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap justify-center py-1">
          {Array.from({ length: fibN + 1 }, (_, k) => {
            const isComputed = currentFibStep.table[k] !== null;
            const val = isComputed ? currentFibStep.table[k] : '—';
            const isSelected = selectedK === k;
            const isActiveSlot = currentFibStep.activeK === k;
            const isCacheHitTarget = currentFibStep.laserPrunedNode?.k === k;

            return (
              <div key={k} className="relative group">
                <button
                  onClick={() => setSelectedK(selectedK === k ? null : k)}
                  title={`dp[${k}] = ${val}. Click to inspect subproblem.`}
                  className={`w-16 h-18 sm:w-18 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-between p-2 font-mono cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                    isCacheHitTarget
                      ? isDarkMode
                        ? 'ring-4 ring-emerald-400/60 border-emerald-400 bg-emerald-500/20 scale-108 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
                        : 'ring-4 ring-emerald-500/70 border-emerald-600 bg-emerald-100 scale-108 shadow-md'
                      : isSelected
                      ? isDarkMode
                        ? 'ring-2 ring-amber-400 border-amber-500 bg-amber-500/15 scale-105 shadow-sm'
                        : 'ring-2 ring-amber-500 border-amber-600 bg-amber-100 scale-105 shadow-sm'
                      : isActiveSlot
                      ? isDarkMode
                        ? 'ring-2 ring-emerald-400 border-emerald-500 bg-emerald-500/15 shadow-sm'
                        : 'ring-2 ring-emerald-500 border-emerald-600 bg-emerald-50 shadow-sm'
                      : isComputed
                      ? isDarkMode
                        ? 'bg-gradient-to-b from-teal-950/50 to-slate-900/70 border-teal-700/80 text-teal-200 hover:border-teal-500 hover:shadow-sm'
                        : 'bg-gradient-to-b from-teal-50/90 to-emerald-50/80 border-teal-500 text-teal-950 hover:border-teal-600 hover:shadow-sm'
                      : isDarkMode
                      ? 'border-dashed border-slate-800 text-slate-500 bg-slate-900/40 hover:border-slate-700'
                      : 'border-dashed border-slate-300 text-slate-700 bg-slate-50/90 hover:border-slate-400 hover:bg-slate-100/80 shadow-2xs'
                  }`}
                >
                  <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md ${
                    isComputed
                      ? isDarkMode ? 'bg-teal-900/70 text-teal-300' : 'bg-teal-100 text-teal-900 font-black'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 font-bold' : 'bg-slate-200 text-slate-700 font-bold'
                  }`}>
                    dp[{k}]
                  </span>

                  <span className={`text-lg sm:text-2xl font-black tracking-tight ${
                    isComputed 
                      ? (isDarkMode ? 'text-teal-200' : 'text-teal-950 font-black') 
                      : (isDarkMode ? 'text-slate-600 font-semibold' : 'text-slate-400 font-bold')
                  }`}>
                    {val}
                  </span>

                  <span className={`text-[8.5px] uppercase tracking-wider font-extrabold ${
                    isComputed
                      ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-800 font-black')
                      : (isDarkMode ? 'text-slate-500' : 'text-slate-600 font-extrabold')
                  }`}>
                    {isComputed ? '✓ Cached' : 'Empty'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Inspector Card (when selected) */}
        {selectedK !== null && (
          <div className={`mt-1 p-3 rounded-xl border text-xs font-mono flex items-center justify-between animate-in fade-in duration-150 shadow-xs ${
            isDarkMode 
              ? 'bg-amber-500/10 border-amber-700/60 text-amber-200' 
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💡</span>
              <span className="text-xs sm:text-[13px] leading-relaxed">
                <strong>Subproblem fib({selectedK}) = {fibValues[selectedK]}:</strong> {selectedK <= 1 ? (
                  <span>Base case initialized once in dp[{selectedK}] = {fibValues[selectedK]}.</span>
                ) : (
                  <span>
                    In Naive recursion, recalculates <strong>{getSubproblemCallCount(selectedK)} separate times</strong>! In DP, calculated <strong>ONCE</strong> and fetched from <code className={`px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-200 text-amber-950'}`}>dp[{selectedK}]</code> in <strong>O(1)</strong> time.
                  </span>
                )}
              </span>
            </div>
            <span className={`text-[11px] px-3 py-1 rounded-full font-black shrink-0 border ${
              isDarkMode 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' 
                : 'bg-amber-200 border-amber-400 text-amber-950'
            }`}>
              {getSubproblemCallCount(selectedK) > 1 ? `${getSubproblemCallCount(selectedK)}× Naive calls saved!` : 'Base case'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-2">
      {/* ========================================================= */}
      {/* 1. MASTER UNIFIED MINIMAL TOP RIBBON                      */}
      {/* ========================================================= */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl border shrink-0 transition-colors ${
        isDarkMode ? 'bg-[#0f172a] border-slate-700/60' : 'bg-white border-[#203247]/10'
      }`}>
        
        {/* SUBMODE TABS */}
        <div className="flex items-center gap-1 shrink-0">
          {[
            { id: 'fib', label: 'Fibonacci DP', icon: Boxes },
            { id: 'knapsack', label: '0/1 Knapsack', icon: Briefcase },
            { id: 'nqueens', label: 'N-Queens', icon: Crown }
          ].map(item => {
            const Icon = item.icon;
            const isSelected = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-2xs'
                    : isDarkMode
                    ? 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
                    : 'bg-transparent text-[#526b88] border-transparent hover:bg-slate-100'
                }`}
              >
                <Icon size={12} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTEXTUAL PRESETS & CONFIG */}
        <div className="flex items-center gap-1.5 text-xs">
          {activeSubTab === 'fib' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className={`font-mono text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>N:</span>
                {[3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setFibN(n)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold cursor-pointer border transition-all ${
                      fibN === n 
                        ? 'bg-[#347f7a] text-white border-[#347f7a]' 
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-[#faf8f4] text-[#526b88] border-[#203247]/10 hover:bg-slate-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* VIEW MODE TOGGLE: PRUNED VS NAIVE VS TABLE */}
              <div className={`flex items-center p-0.5 rounded-lg border ${
                isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setFibViewMode('pruned')}
                  title="Dynamic Programming Memoization: duplicate branches are pruned into O(1) cache lookups"
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    fibViewMode === 'pruned'
                      ? isDarkMode ? 'bg-teal-700 text-white shadow-xs' : 'bg-[#203247] text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#526b88] hover:text-[#203247]'
                  }`}
                >
                  <Scissors size={11} />
                  <span>✂️ DP Tree</span>
                </button>
                <button
                  onClick={() => setFibViewMode('naive')}
                  title="Naive Recursion: shows the full exploding tree with duplicate calculations in red"
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    fibViewMode === 'naive'
                      ? isDarkMode ? 'bg-teal-700 text-white shadow-xs' : 'bg-[#203247] text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#526b88] hover:text-[#203247]'
                  }`}
                >
                  <GitBranch size={11} />
                  <span>🌳 Naive Tree</span>
                </button>
                <button
                  onClick={() => setFibViewMode('table')}
                  title="Focus solely on the 1D DP table and linear arithmetic"
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    fibViewMode === 'table'
                      ? isDarkMode ? 'bg-teal-700 text-white shadow-xs' : 'bg-[#203247] text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#526b88] hover:text-[#203247]'
                  }`}
                >
                  <Boxes size={11} />
                  <span>📊 Table Only</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'knapsack' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setKsPresetKey('classic'); setKsCapacity(7); }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all ${
                  ksPresetKey === 'classic' 
                    ? isDarkMode ? 'bg-teal-700 text-white border-teal-600' : 'bg-[#203247] text-white border-[#203247]' 
                    : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-[#faf8f4] text-[#526b88] border-[#203247]/10 hover:bg-slate-100'
                }`}
              >
                Vault (W=7)
              </button>
              <button
                onClick={() => { setKsPresetKey('heist'); setKsCapacity(6); }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all ${
                  ksPresetKey === 'heist' 
                    ? isDarkMode ? 'bg-teal-700 text-white border-teal-600' : 'bg-[#203247] text-white border-[#203247]' 
                    : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-[#faf8f4] text-[#526b88] border-[#203247]/10 hover:bg-slate-100'
                }`}
              >
                Jewelry (W=6)
              </button>
            </div>
          )}

          {activeSubTab === 'nqueens' && (
            <div className="flex items-center gap-1">
              <span className={`font-mono text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>Board:</span>
              {[4, 6, 8].map(sz => (
                <button
                  key={sz}
                  onClick={() => setBoardSize(sz)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold cursor-pointer border transition-all ${
                    boardSize === sz 
                      ? isDarkMode ? 'bg-teal-700 text-white border-teal-600' : 'bg-[#203247] text-white border-[#203247]' 
                      : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-[#faf8f4] text-[#526b88] border-[#203247]/10 hover:bg-slate-100'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COMPLEXITY CHIP */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {activeSubTab === 'fib' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-mono font-bold ${
              isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span>DP: O(N)</span>
              <span className="opacity-40">vs</span>
              <span className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Naive: O(2ⁿ)</span>
            </div>
          )}
          {activeSubTab === 'knapsack' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-mono font-bold ${
              isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span>O(N×W) Tabulation</span>
            </div>
          )}
          {activeSubTab === 'nqueens' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-mono font-bold ${
              isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span>Pruned State Space</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN STAGE CONTENT                                     */}
      {/* ========================================================= */}
      
      {/* --------------------------------------------------------- */}
      {/* A. FIBONACCI: CALL SAVINGS & DP TABULATION                */}
      {/* --------------------------------------------------------- */}
      {activeSubTab === 'fib' && (
        <div className={`flex-1 min-h-0 flex flex-col rounded-2xl border shadow-2xs overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0b1324] border-slate-800' : 'bg-[#faf8f4] border-[#203247]/10'
        }`}>
          
          {/* MASTER UNIFIED NARRATION & EFFICIENCY RIBBON */}
          <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b shrink-0 transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#0f172a]/90 text-slate-200' : 'border-[#203247]/10 bg-white/95 text-slate-800 shadow-2xs'
          }`}>
            {/* Live Narration with Dynamic Icon */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                currentFibStep.status === 'cache_hit' 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40' 
                  : currentFibStep.status === 'redundant'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40'
                  : isDarkMode ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40' : 'bg-[#347f7a]/15 text-[#203247] ring-1 ring-[#347f7a]/30'
              }`}>
                {currentFibStep.status === 'cache_hit' ? (
                  <Zap size={14} className="text-amber-500 fill-amber-400" />
                ) : currentFibStep.status === 'redundant' ? (
                  <AlertTriangle size={14} className="text-rose-500" />
                ) : (
                  <Boxes size={14} className={isDarkMode ? 'text-teal-300' : 'text-[#347f7a]'} />
                )}
              </span>

              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'}`}>
                  {currentFibStep.insight}
                </span>
                <span className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  {fibViewMode === 'pruned' ? '⚡ DP Memoization Tree (O(N) operations)' : '🌳 Naive Recursion Tree (O(2ⁿ) exponential calls)'}
                </span>
              </div>
            </div>

            {/* Live Performance Stats */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`hidden sm:flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-lg border font-bold ${
                isDarkMode 
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200' 
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                <span>DP: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{totalDpOps}</strong></span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>vs</span>
                <span>Naive: <strong className="text-rose-600 dark:text-rose-400 font-black">{totalNaiveCalls}</strong></span>
              </div>
            </div>
          </div>

          {/* VISUAL STAGE */}
          <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col items-center justify-between overflow-hidden gap-3">
            {fibViewMode !== 'table' ? (
              /* ======================================================== */
              /* STREAMLINED SINGLE-STAGE VISUALIZER: TREE + DP TABLE     */
              /* ======================================================== */
              <div className="flex flex-col items-center w-full h-full min-h-0 gap-3 animate-in fade-in duration-200">
                
                {/* SPACIOUS SINGLE TREE CANVAS WITH BLUEPRINT GRID */}
                <div 
                  className={`flex-1 min-h-0 w-full relative flex items-center justify-center rounded-2xl border transition-colors p-3 shadow-inner overflow-hidden ${
                    isDarkMode 
                      ? 'border-slate-800 bg-[#0b1324]/80' 
                      : 'border-slate-200 bg-white/90 shadow-2xs'
                  }`}
                  style={{
                    backgroundImage: `radial-gradient(${isDarkMode ? '#334155' : '#cbd5e1'} 1.25px, transparent 1.25px)`,
                    backgroundSize: '20px 20px'
                  }}
                >
                  {fibViewMode === 'pruned'
                    ? renderTreeCanvas(
                        prunedTree, 
                        'pruned', 
                        currentFibStep.pruned?.activeNodeId, 
                        currentFibStep.pruned?.visited || [], 
                        currentFibStep.laserPrunedNode
                      )
                    : renderTreeCanvas(
                        naiveTree, 
                        'naive', 
                        currentFibStep.naive?.activeNodeId, 
                        currentFibStep.naive?.visited || []
                      )
                  }
                </div>

                {/* SYNCHRONIZED 1D DP ARRAY CACHE DIRECTLY BELOW */}
                {renderDpArrayCache()}

              </div>
            ) : (
              /* ======================================================== */
              /* 3. PURE MINIMAL DP TABLE ONLY MODE                       */
              /* ======================================================== */
              <div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl my-auto animate-in fade-in duration-200">
                {/* Live Arithmetic Pill */}
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono shadow-2xs shrink-0 transition-colors ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-200' : 'bg-white border-[#203247]/10 text-slate-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Rule: dp[i] = dp[i-1] + dp[i-2] • Computing left to right</span>
                </div>

                {/* 1D Tabulation Array */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center shrink-0">
                  {currentFibStep.table.map((val, idx) => {
                    const isCurrent = idx === currentFibStep.activeK;
                    const isCalculated = val !== null;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-13 h-15 sm:w-14 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-150 ${
                            isCurrent
                              ? isDarkMode
                                ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-extrabold ring-2 ring-amber-400/50'
                                : 'border-amber-500 bg-amber-50/80 text-amber-950 font-extrabold ring-2 ring-amber-400'
                              : isCalculated
                              ? isDarkMode
                                ? 'bg-[#1e293b] border-slate-700 text-slate-200 font-bold shadow-xs'
                                : 'bg-white border-[#203247]/20 text-[#203247] font-bold shadow-xs'
                              : isDarkMode
                              ? 'border-dashed border-slate-700/60 text-slate-600 bg-[#0f172a]/40 shadow-2xs'
                              : 'border-dashed border-[#203247]/20 text-[#94a3b8] bg-white shadow-2xs'
                          }`}
                        >
                          <span className={`font-mono text-base sm:text-lg font-bold ${!isCalculated ? (isDarkMode ? 'text-slate-600' : 'text-[#94a3b8]') : ''}`}>
                            {isCalculated ? val : '?'}
                          </span>
                          <span className="font-mono text-[9px] opacity-60">dp[{idx}]</span>
                        </div>

                        <span className={`font-mono text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>
                          i={idx}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Efficiency Banner */}
                <div className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl border text-xs font-mono w-full ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300' : 'bg-white border-[#203247]/10 text-slate-700 shadow-2xs'
                }`}>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={14} />
                    Linear O(N): {totalDpOps} steps total
                  </span>
                  <span className="text-slate-400">
                    Saves {callsSaved} recursive calls vs Naive O(2ⁿ)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PLAYBACK BAR */}
          <div className="algo-playback-bar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { 
                  setIsFibPlaying(false); 
                  setFibStep(0); 
                }}
                disabled={fibStep === 0}
                className="algo-ctrl-btn"
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { 
                  setIsFibPlaying(false); 
                  setFibStep(p => Math.max(0, p - 1)); 
                }}
                disabled={fibStep === 0}
                className="algo-ctrl-btn"
                title="Step Backward (Left Arrow)"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsFibPlaying(!isFibPlaying)}
                className="algo-ctrl-btn primary px-4"
                title="Play/Pause (Space)"
              >
                {isFibPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isFibPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { 
                  setIsFibPlaying(false); 
                  setFibStep(p => Math.min(fibTreeSteps.length - 1, p + 1)); 
                }}
                disabled={fibStep >= fibTreeSteps.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward (Right Arrow)"
              >
                <SkipForward size={14} />
              </button>
            </div>

            <div className="flex-1 max-w-xs mx-3 hidden sm:flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, fibTreeSteps.length - 1)}
                value={fibStep}
                onChange={e => {
                  setIsFibPlaying(false);
                  setFibStep(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider w-full"
                title="Scrub timeline"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-[#203247]/15 text-[#347f7a] hover:bg-slate-50'
                }`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <span className="text-[11px] font-mono text-[#526b88] dark:text-slate-400 font-bold">
                {fibStep + 1}/{fibTreeSteps.length}
              </span>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-lg border border-[#203247]/10 dark:border-slate-700">
                {[1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold cursor-pointer border-none transition-all ${
                      speedMultiplier === s ? 'bg-[#347f7a] text-white' : 'text-[#526b88] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* B. 0/1 KNAPSACK PROBLEM: 2D MATRIX & ITEM BACKTRACKING    */}
      {/* --------------------------------------------------------- */}
      {activeSubTab === 'knapsack' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#faf8f4] rounded-2xl border border-[#203247]/10 shadow-2xs overflow-hidden">
          
          {/* TEACHER INSIGHT RIBBON */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[#203247]/10 bg-white/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1 rounded-md bg-[#347f7a]/10 text-[#347f7a] shrink-0">
                <Briefcase size={13} />
              </span>
              <span className="text-xs truncate text-[#203247] font-medium">
                {currentKsStep.insight}
              </span>
            </div>
          </div>

          {/* MAIN KNAPSACK STAGE */}
          <div className="flex-1 min-h-0 p-3 sm:p-5 flex flex-col items-center justify-center gap-3.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
            
            {/* ITEM VAULT CARDS */}
            <div className="flex items-center gap-2 flex-wrap justify-center shrink-0">
              {ksItems.map((item, idx) => {
                const isCurrentItem = currentKsStep.itemIdx === idx + 1;
                const isOptimal = currentKsStep.optimalItems?.includes(idx);

                return (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                      isOptimal
                        ? 'bg-emerald-100 border-emerald-500 shadow-sm text-emerald-950 font-bold ring-2 ring-emerald-400/40'
                        : isCurrentItem
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-300'
                        : 'bg-white border-[#203247]/10 text-[#203247]'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex flex-col text-[10.5px]">
                      <span className="font-bold leading-tight">{item.name}</span>
                      <span className="font-mono text-[#647895] opacity-80">
                        {item.wt}kg • ${item.val}
                      </span>
                    </div>
                    {isOptimal && <CheckCircle2 size={13} className="text-emerald-600 ml-1" />}
                  </div>
                );
              })}
            </div>

            {/* 2D DP TABLE MATRIX (NO ARTIFICIAL MAX-H TRUNCATION) */}
            <div className="w-full flex justify-center overflow-x-auto overflow-y-visible p-2 custom-scrollbar shrink-0">
              <table className="dp-table-matrix">
                <thead>
                  <tr>
                    <th className="p-1 text-[10px] font-mono font-bold text-[#647895]">Items \ W</th>
                    {Array.from({ length: ksCapacity + 1 }, (_, w) => (
                      <th
                        key={w}
                        className={`p-1 text-[10.5px] font-mono font-bold text-center ${
                          currentKsStep.cap === w ? 'text-amber-700 bg-amber-50 rounded' : 'text-[#647895]'
                        }`}
                      >
                        w={w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentKsStep.matrix.map((row, r) => {
                    const item = r > 0 ? ksItems[r - 1] : null;
                    const isCurrentRow = currentKsStep.itemIdx === r;

                    return (
                      <tr key={r}>
                        <td className={`p-1 text-[10.5px] font-mono font-bold whitespace-nowrap ${
                          isCurrentRow ? 'text-amber-700 font-extrabold' : 'text-[#526b88]'
                        }`}>
                          {r === 0 ? '0 (None)' : `${item.icon} ${item.name}`}
                        </td>
                        {row.map((cellVal, c) => {
                          const isEvaluating = currentKsStep.itemIdx === r && currentKsStep.cap === c;
                          const isLeaveParent = currentKsStep.parentLeave?.r === r && currentKsStep.parentLeave?.c === c;
                          const isTakeParent = currentKsStep.parentTake?.r === r && currentKsStep.parentTake?.c === c;

                          return (
                            <td key={c} className="p-0.5">
                              <div
                                className={`dp-matrix-cell ${
                                  isEvaluating
                                    ? 'calculating'
                                    : isTakeParent
                                    ? 'take-parent'
                                    : isLeaveParent
                                    ? 'leave-parent'
                                    : ''
                                }`}
                              >
                                {cellVal}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* LIVE FORMULA EVALUATION BADGE */}
            <div className="text-[11px] font-mono text-[#526b88] bg-white p-2 px-4 rounded-xl border border-[#203247]/10 shadow-2xs shrink-0 flex items-center gap-2">
              <span className="font-bold text-[#203247]">Decision:</span>
              <span className="text-blue-700">Leave (${currentKsStep.leaveVal !== undefined ? currentKsStep.leaveVal : '-'})</span>
              <span className="text-slate-400">vs</span>
              <span className="text-emerald-700">Take (${currentKsStep.takeVal !== undefined && currentKsStep.takeVal >= 0 ? currentKsStep.takeVal : 'N/A'})</span>
              <span className="text-slate-400">➔</span>
              <span className="font-extrabold text-amber-800">
                {currentKsStep.decision === 'take' ? 'TAKE ITEM' : currentKsStep.decision === 'too_heavy' ? 'TOO HEAVY' : 'LEAVE ITEM'}
              </span>
            </div>
          </div>

          {/* PLAYBACK BAR */}
          <div className="algo-playback-bar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { setIsKsPlaying(false); setKsStep(0); }}
                disabled={ksStep === 0}
                className="algo-ctrl-btn"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { setIsKsPlaying(false); setKsStep(p => Math.max(0, p - 1)); }}
                disabled={ksStep === 0}
                className="algo-ctrl-btn"
                title="Step Backward"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsKsPlaying(!isKsPlaying)}
                className="algo-ctrl-btn primary px-4"
              >
                {isKsPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isKsPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setIsKsPlaying(false); setKsStep(p => Math.min(ksSteps.length - 1, p + 1)); }}
                disabled={ksStep >= ksSteps.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward"
              >
                <SkipForward size={14} />
              </button>
            </div>

            <div className="flex-1 max-w-xs mx-3 hidden sm:flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, ksSteps.length - 1)}
                value={ksStep}
                onChange={e => {
                  setIsKsPlaying(false);
                  setKsStep(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider w-full"
                title="Scrub steps"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-[#203247]/15 text-[#347f7a] hover:bg-slate-50'
                }`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <span className="text-[11px] font-mono text-[#526b88]">
                {ksStep + 1}/{ksSteps.length}
              </span>

              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-[#203247]/10">
                {[1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold cursor-pointer border-none transition-all ${
                      speedMultiplier === s ? 'bg-[#347f7a] text-white' : 'text-[#526b88] hover:bg-slate-100'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* C. N-QUEENS: BACKTRACKING & THREAT RAYS                   */}
      {/* --------------------------------------------------------- */}
      {activeSubTab === 'nqueens' && (
        <div className={`flex-1 min-h-0 flex flex-col rounded-2xl border shadow-2xs overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0b1324] border-slate-800' : 'bg-[#faf8f4] border-[#203247]/10'
        }`}>
          
          {/* TEACHER INSIGHT RIBBON */}
          <div className={`flex items-center justify-between gap-2 px-4 py-2 border-b shrink-0 transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#0f172a]/90 text-slate-200' : 'border-[#203247]/10 bg-white/90 text-slate-800'
          }`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`p-1 rounded-md shrink-0 ${
                currentQStep.status === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : currentQStep.status === 'conflict'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-[#347f7a]/10 text-[#347f7a]'
              }`}>
                {currentQStep.status === 'success' ? (
                  <Sparkles size={13} />
                ) : currentQStep.status === 'conflict' ? (
                  <ShieldAlert size={13} />
                ) : (
                  <Crown size={13} />
                )}
              </span>
              <span className={`text-xs truncate ${
                currentQStep.status === 'success'
                  ? 'text-emerald-800 font-bold'
                  : currentQStep.status === 'conflict'
                  ? 'text-rose-700 font-semibold'
                  : 'text-[#203247] font-medium'
              }`}>
                {currentQStep.insight}
              </span>
            </div>

            <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded ${
              currentQStep.status === 'conflict' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'
            }`}>
              {currentQStep.status.toUpperCase()}
            </span>
          </div>

          {/* CHESSBOARD STAGE */}
          <div className="flex-1 min-h-0 p-6 flex flex-col items-center justify-center gap-3 overflow-auto">
            
            {/* BOARD WITH FILES (A-D) & RANKS (1-4) */}
            <div className="relative p-2 bg-[#203247] rounded-2xl shadow-md">
              <div
                className="grid rounded-xl overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${boardSize}, 48px)`,
                  gridTemplateRows: `repeat(${boardSize}, 48px)`
                }}
              >
                {Array.from({ length: boardSize }, (_, r) =>
                  Array.from({ length: boardSize }, (_, c) => {
                    const isDarkSquare = (r + c) % 2 === 1;
                    const hasQueen = currentQStep.board[r] === c;
                    const isCurrentProbe = currentQStep.currentRow === r && currentQStep.currentCol === c;
                    const isConflict = isCurrentProbe && currentQStep.status === 'conflict';

                    // Threatened check
                    let isThreatened = false;
                    for (let prevR = 0; prevR < (isCurrentProbe ? r : boardSize); prevR++) {
                      const prevC = currentQStep.board[prevR];
                      if (prevC !== -1 && prevC !== undefined) {
                        if (prevC === c || Math.abs(prevC - c) === Math.abs(prevR - r)) {
                          isThreatened = true;
                          break;
                        }
                      }
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`chess-cell w-12 h-12 flex items-center justify-center relative ${
                          isConflict
                            ? 'bg-rose-500 text-white'
                            : hasQueen
                            ? 'bg-[#347f7a] text-white'
                            : isThreatened && r === currentQStep.currentRow
                            ? 'threatened'
                            : isDarkSquare
                            ? 'bg-[#d5cfbe]'
                            : 'bg-[#faf8f4]'
                        }`}
                      >
                        {hasQueen && (
                          <Crown
                            size={26}
                            className="drop-shadow-sm text-amber-300 fill-amber-300"
                          />
                        )}
                        {!hasQueen && (
                          <span className="font-mono text-[9px] opacity-20 text-[#203247]">
                            {String.fromCharCode(97 + c)}{boardSize - r}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* BOARD LEGEND */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-[#647895]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a]" /> Placed Queen
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Attacked Square
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Testing
              </span>
            </div>
          </div>

          {/* PLAYBACK BAR */}
          <div className="algo-playback-bar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { setIsQPlaying(false); setQStepIdx(0); }}
                disabled={qStepIdx === 0}
                className="algo-ctrl-btn"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { setIsQPlaying(false); setQStepIdx(p => Math.max(0, p - 1)); }}
                disabled={qStepIdx === 0}
                className="algo-ctrl-btn"
                title="Step Backward"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsQPlaying(!isQPlaying)}
                className="algo-ctrl-btn primary px-4"
              >
                {isQPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isQPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setIsQPlaying(false); setQStepIdx(p => Math.min(queenSteps.length - 1, p + 1)); }}
                disabled={qStepIdx >= queenSteps.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward"
              >
                <SkipForward size={14} />
              </button>
            </div>

            <div className="flex-1 max-w-xs mx-3 hidden sm:flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, queenSteps.length - 1)}
                value={qStepIdx}
                onChange={e => {
                  setIsQPlaying(false);
                  setQStepIdx(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider w-full"
                title="Scrub steps"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-[#203247]/15 text-[#347f7a] hover:bg-slate-50'
                }`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <span className="text-[11px] font-mono text-[#526b88]">
                {qStepIdx + 1}/{queenSteps.length}
              </span>

              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-[#203247]/10">
                {[1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold cursor-pointer border-none transition-all ${
                      speedMultiplier === s ? 'bg-[#347f7a] text-white' : 'text-[#526b88] hover:bg-slate-100'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
