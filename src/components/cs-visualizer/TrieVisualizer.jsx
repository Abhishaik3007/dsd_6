import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Sparkles, GitBranch, ZoomIn, ZoomOut, Maximize2, Check, BookOpen, Layers, Info, Cpu, CheckCircle2 } from 'lucide-react';

class TrieNode {
  constructor(char = '') {
    this.char = char;
    this.children = {}; // { 'c': TrieNode, 'a': TrieNode }
    this.isEndOfWord = false;
    this.id = Math.random().toString(36).substring(2, 9);
  }
}

export const TrieVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  const [trieRoot, setTrieRoot] = useState(() => {
    const root = new TrieNode('(ROOT)');
    const insertWordHelper = (r, word) => {
      let curr = r;
      for (const ch of word.toLowerCase()) {
        if (!curr.children[ch]) {
          curr.children[ch] = new TrieNode(ch);
        }
        curr = curr.children[ch];
      }
      curr.isEndOfWord = true;
    };
    insertWordHelper(root, 'cat');
    insertWordHelper(root, 'car');
    insertWordHelper(root, 'dog');
    return root;
  });

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [activePathChars, setActivePathChars] = useState([]);
  const [animStatus, setAnimStatus] = useState(null);
  const [isShake, setIsShake] = useState(false);

  // Zoom & Pan state
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Step playback state
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animIntervalRef = useRef(null);

  // Collect stored words for Dictionary Chip Bar
  const getStoredWords = (node, prefix = '') => {
    if (!node) return [];
    let words = [];
    if (node.isEndOfWord && prefix) words.push(prefix.toUpperCase());
    for (const ch in node.children) {
      words = words.concat(getStoredWords(node.children[ch], prefix + ch));
    }
    return words;
  };

  // Count total nodes in Trie
  const getTotalNodesCount = (node) => {
    if (!node) return 0;
    let count = 1;
    for (const ch in node.children) {
      count += getTotalNodesCount(node.children[ch]);
    }
    return count;
  };

  const storedWords = getStoredWords(trieRoot);
  const totalNodesCount = getTotalNodesCount(trieRoot);

  // Calculate subtree width (leaf count) for non-overlapping layout
  const getSubtreeLeaves = (node) => {
    if (!node) return 0;
    const keys = Object.keys(node.children);
    if (keys.length === 0) return 1;
    let sum = 0;
    for (const k of keys) {
      sum += getSubtreeLeaves(node.children[k]);
    }
    return sum;
  };

  // Calculate Trie max depth
  const getTrieDepth = (node) => {
    if (!node) return 0;
    const keys = Object.keys(node.children);
    if (keys.length === 0) return 1;
    let maxD = 0;
    for (const k of keys) {
      maxD = Math.max(maxD, getTrieDepth(node.children[k]));
    }
    return maxD + 1;
  };

  const totalLeaves = Math.max(1, getSubtreeLeaves(trieRoot));
  const maxDepth = Math.max(1, getTrieDepth(trieRoot));

  // Dynamic SVG stage dimensions
  const svgWidth = Math.max(680, totalLeaves * 80);
  const svgHeight = Math.max(320, maxDepth * 75 + 60);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, []);

  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.trieRoot) setTrieRoot(step.trieRoot);
    if (step.activeNodeId !== undefined) setActiveNodeId(step.activeNodeId);
    if (step.visitedNodeIds) setVisitedNodeIds(step.visitedNodeIds);
    if (step.pathChars) setActivePathChars(step.pathChars);
    if (step.status) setAnimStatus(step.status);

    if (typeof onStepUpdate === 'function') {
      onStepUpdate({
        currentStep: idx,
        totalSteps: stepsHistoryRef.current.length,
        isPlaying: isPlayingRef.current
      });
    }
  };

  useEffect(() => {
    if (!stepCommand) return;
    const { action } = stepCommand;

    if (action === 'first') {
      isPlayingRef.current = false;
      applyStepSnapshot(0);
    } else if (action === 'prev') {
      isPlayingRef.current = false;
      applyStepSnapshot(currentStepRef.current - 1);
    } else if (action === 'next') {
      isPlayingRef.current = false;
      applyStepSnapshot(currentStepRef.current + 1);
    } else if (action === 'last') {
      isPlayingRef.current = false;
      applyStepSnapshot(stepsHistoryRef.current.length - 1);
    } else if (action === 'toggle-play') {
      isPlayingRef.current = !isPlayingRef.current;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: isPlayingRef.current });
      }
    }
  }, [stepCommand]);

  // Sync external operations from CSVisualizerLab panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val } = externalOp;
    const wordStr = String(val !== undefined && val !== null && val !== '' ? val : 'CODE').trim().toLowerCase();

    if (type === 'trie-insert' || type === 'insert-node' || type === 'insert-pos' || type === 'push') {
      executeInsertWord(wordStr);
    } else if (type === 'trie-search' || type === 'search') {
      executeSearchWord(wordStr, false);
    } else if (type === 'trie-delete' || type === 'delete-node' || type === 'delete-pos') {
      executeDeleteWord(wordStr);
    } else if (type === 'trie-prefix') {
      executeSearchWord(wordStr, true);
    } else if (type === 'clear') {
      handleClearTrie();
    }
  }, [externalOp]);

  // Deep clone helper for Trie nodes
  const cloneTrie = (node) => {
    if (!node) return null;
    const newNode = new TrieNode(node.char);
    newNode.id = node.id;
    newNode.isEndOfWord = node.isEndOfWord;
    for (const ch in node.children) {
      newNode.children[ch] = cloneTrie(node.children[ch]);
    }
    return newNode;
  };

  // Execute Insert Word into Trie
  const executeInsertWord = (word) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    if (!word || word.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ Cannot insert empty word into Trie!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const steps = [];
    const rootCopy = cloneTrie(trieRoot);
    let curr = rootCopy;
    const visited = [curr.id];
    const path = [];

    steps.push({
      trieRoot: cloneTrie(rootCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      pathChars: [],
      status: `Step 1: Initializing prefix traversal at ROOT node for word "${word.toUpperCase()}".`
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const isNewBranch = !curr.children[ch];
      if (isNewBranch) {
        curr.children[ch] = new TrieNode(ch);
      }
      curr = curr.children[ch];
      visited.push(curr.id);
      path.push(ch.toUpperCase());

      steps.push({
        trieRoot: cloneTrie(rootCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        pathChars: [...path],
        status: isNewBranch
          ? `Step ${i + 2}: Allocated new Trie character node ['${ch.toUpperCase()}'] at depth [${i + 1}].`
          : `Step ${i + 2}: Reused shared prefix character node ['${ch.toUpperCase()}'] at depth [${i + 1}].`
      });
    }

    curr.isEndOfWord = true;

    steps.push({
      trieRoot: cloneTrie(rootCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      pathChars: [...path],
      status: `🎉 Successfully inserted word "${word.toUpperCase()}". Marked leaf node ['${curr.char.toUpperCase()}'] as isEndOfWord = true!`
    });

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    animIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animIntervalRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animIntervalRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 650 / playbackSpeed);
  };

  // Execute Search Word or Check Prefix in Trie
  const executeSearchWord = (word, isPrefixSearch = false) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const steps = [];
    let curr = trieRoot;
    const visited = [curr.id];
    const path = [];
    let found = true;

    steps.push({
      trieRoot: cloneTrie(trieRoot),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      pathChars: [],
      status: `Step 1: Starting ${isPrefixSearch ? 'prefix' : 'word'} search trace for "${word.toUpperCase()}"...`
    });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!curr.children[ch]) {
        found = false;
        steps.push({
          trieRoot: cloneTrie(trieRoot),
          activeNodeId: curr.id,
          visitedNodeIds: [...visited],
          pathChars: [...path],
          status: `❌ Branch missing character ['${ch.toUpperCase()}']. "${word.toUpperCase()}" not found in Trie.`
        });
        break;
      }
      curr = curr.children[ch];
      visited.push(curr.id);
      path.push(ch.toUpperCase());

      steps.push({
        trieRoot: cloneTrie(trieRoot),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        pathChars: [...path],
        status: `Step ${i + 2}: Matched character ['${ch.toUpperCase()}'] at depth level [${i + 1}].`
      });
    }

    if (found) {
      if (isPrefixSearch) {
        steps.push({
          trieRoot: cloneTrie(trieRoot),
          activeNodeId: curr.id,
          visitedNodeIds: [...visited],
          pathChars: [...path],
          status: `🎯 SUCCESS: Found valid prefix "${word.toUpperCase()}" in Prefix Trie!`
        });
      } else if (curr.isEndOfWord) {
        steps.push({
          trieRoot: cloneTrie(trieRoot),
          activeNodeId: curr.id,
          visitedNodeIds: [...visited],
          pathChars: [...path],
          status: `🎯 SUCCESS: Found complete word "${word.toUpperCase()}" (isEndOfWord = true)!`
        });
      } else {
        steps.push({
          trieRoot: cloneTrie(trieRoot),
          activeNodeId: curr.id,
          visitedNodeIds: [...visited],
          pathChars: [...path],
          status: `⚠️ Found prefix path "${word.toUpperCase()}", but isEndOfWord = false (not a full word).`
        });
      }
    }

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    animIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animIntervalRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animIntervalRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 650 / playbackSpeed);
  };

  // Execute Delete Word from Trie with Step-by-Step Animation & Pruning
  const executeDeleteWord = (word) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    if (!word || word.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ Cannot delete empty word from Trie!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const steps = [];
    const rootCopy = cloneTrie(trieRoot);
    let curr = rootCopy;
    const visited = [curr.id];
    const path = [];

    steps.push({
      trieRoot: cloneTrie(rootCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [...visited],
      pathChars: [],
      status: `Step 1: Starting deletion trace for word "${word.toUpperCase()}".`
    });

    let found = true;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!curr.children[ch]) {
        found = false;
        steps.push({
          trieRoot: cloneTrie(rootCopy),
          activeNodeId: curr.id,
          visitedNodeIds: [...visited],
          pathChars: [...path],
          status: `❌ Cannot delete: Word "${word.toUpperCase()}" not found in Trie!`
        });
        break;
      }
      curr = curr.children[ch];
      visited.push(curr.id);
      path.push(ch.toUpperCase());

      steps.push({
        trieRoot: cloneTrie(rootCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        pathChars: [...path],
        status: `Step ${i + 2}: Tracing character node ['${ch.toUpperCase()}'] at depth [${i + 1}].`
      });
    }

    if (found && !curr.isEndOfWord) {
      steps.push({
        trieRoot: cloneTrie(rootCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        pathChars: [...path],
        status: `⚠️ Word "${word.toUpperCase()}" is only a prefix (isEndOfWord = false). Nothing to delete.`
      });
      found = false;
    }

    if (found) {
      // Step 1: Unmark isEndOfWord
      curr.isEndOfWord = false;
      steps.push({
        trieRoot: cloneTrie(rootCopy),
        activeNodeId: curr.id,
        visitedNodeIds: [...visited],
        pathChars: [...path],
        status: `Unmarked leaf node ['${curr.char.toUpperCase()}'] (isEndOfWord = false).`
      });

      // Step 2: Prune unneeded dead leaf nodes from bottom up
      const deleteHelper = (node, targetWord, depth) => {
        if (!node) return false;
        if (depth === targetWord.length) {
          if (Object.keys(node.children).length === 0) {
            return true;
          }
          return false;
        }
        const ch = targetWord[depth];
        const childNode = node.children[ch];
        const shouldDeleteChild = deleteHelper(childNode, targetWord, depth + 1);

        if (shouldDeleteChild) {
          delete node.children[ch];
          return !node.isEndOfWord && Object.keys(node.children).length === 0;
        }
        return false;
      };

      deleteHelper(rootCopy, word.toLowerCase(), 0);

      steps.push({
        trieRoot: cloneTrie(rootCopy),
        activeNodeId: rootCopy.id,
        visitedNodeIds: [rootCopy.id],
        pathChars: [],
        status: `🎉 Successfully deleted word "${word.toUpperCase()}" and pruned unneeded character nodes!`
      });
    }

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    animIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animIntervalRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animIntervalRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 650 / playbackSpeed);
  };

  const handleClearTrie = () => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    setTrieRoot(new TrieNode('(ROOT)'));
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setActivePathChars([]);
    setAnimStatus('Prefix Trie cleared. All character nodes deallocated.');
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomScale(prev => Math.min(Math.max(0.4, prev * zoomFactor), 2.5));
  };

  const resetView = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Dynamic non-overlapping SVG Renderer matching App Theme
  const renderTrieSVG = (node, x, y, availableWidth) => {
    if (!node) return null;

    const childKeys = Object.keys(node.children);
    const totalChildLeaves = childKeys.reduce((acc, k) => acc + getSubtreeLeaves(node.children[k]), 0);
    let currentX = x - availableWidth / 2;

    return (
      <g key={node.id}>
        {childKeys.map((key) => {
          const child = node.children[key];
          const childLeaves = getSubtreeLeaves(child);
          const childAllocatedWidth = (childLeaves / totalChildLeaves) * availableWidth;
          const childX = currentX + childAllocatedWidth / 2;
          const childY = y + 72;
          currentX += childAllocatedWidth;

          const isVisited = visitedNodeIds.includes(child.id);

          return (
            <g key={child.id}>
              <line
                x1={x}
                y1={y}
                x2={childX}
                y2={childY}
                stroke={isVisited ? '#347f7a' : (isDarkMode ? '#334155' : '#cbd5e1')}
                strokeWidth={isVisited ? '3' : '2'}
              />
              {renderTrieSVG(child, childX, childY, childAllocatedWidth)}
            </g>
          );
        })}

        {/* ELEGANT STYLED TRIE NODE CIRCLE */}
        <g transform={`translate(${x}, ${y})`}>
          <circle
            r="19"
            fill={
              activeNodeId === node.id
                ? '#347f7a'
                : visitedNodeIds.includes(node.id)
                ? (isDarkMode ? '#1e293b' : '#203247')
                : node.isEndOfWord
                ? (isDarkMode ? '#065f46' : '#10b981')
                : (isDarkMode ? '#0f172a' : '#ffffff')
            }
            stroke={
              activeNodeId === node.id || visitedNodeIds.includes(node.id)
                ? '#347f7a'
                : node.isEndOfWord
                ? '#10b981'
                : (isDarkMode ? '#475569' : '#203247')
            }
            strokeWidth="2.5"
            className="transition-all duration-200 shadow-md"
          />
          <text
            y="4.5"
            textAnchor="middle"
            fill={
              activeNodeId === node.id || visitedNodeIds.includes(node.id) || node.isEndOfWord
                ? '#ffffff'
                : (isDarkMode ? '#f8fafc' : '#203247')
            }
            fontSize="12"
            fontFamily="monospace"
            fontWeight="800"
          >
            {node.char === '(ROOT)' ? 'R' : node.char.toUpperCase()}
          </text>
          {node.isEndOfWord && (
            <g transform="translate(13, -13)">
              <circle r="6.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <text y="2.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">✓</text>
            </g>
          )}
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* TRIE HEADER CARD MATCHING APP DESIGN SYSTEM */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
          <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
            TRIE PREFIX TREE (DIGITAL SEARCH TREE)
          </span>
        </div>

        {storedWords.length > 0 && (
          <button
            onClick={handleClearTrie}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs shrink-0 ml-auto border ${isDarkMode ? 'text-rose-400 bg-rose-950/30 border-rose-900 hover:bg-rose-900/50' : 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200'}`}
            title="Clear Trie"
          >
            <Trash2 size={13} className="inline mr-1" /> Clear Trie
          </button>
        )}
      </div>

      {/* STATUS TOAST */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]')}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* CANVA STAGE WITH FLOATING ZOOM OVERLAY AND OFF-WHITE BACKGROUND */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full min-h-[360px] rounded-2xl border shadow-xs overflow-hidden flex items-center justify-center p-4 select-none cursor-grab active:cursor-grabbing transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-700/80' : 'bg-[#faf8f4] border-[#203247]/12'}`}
      >
        {/* FLOATING ZOOM / PAN CONTROL OVERLAY */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 p-1.5 rounded-xl border shadow-md z-10 font-mono text-xs ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-slate-200' : 'bg-white/90 border-[#203247]/15 text-[#203247]'}`}>
          <button
            onClick={() => setZoomScale(prev => Math.min(prev + 0.15, 2.5))}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border-none"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <span className="px-1.5 font-bold text-[11px] min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(prev => Math.max(prev - 0.15, 0.4))}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border-none"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700 mx-0.5"></div>
          <button
            onClick={resetView}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border-none flex items-center gap-1"
            title="Fit View"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* DYNAMIC RESPONSIVE SVG STAGE */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`} transform-origin="center center">
            {renderTrieSVG(trieRoot, svgWidth / 2, 45, svgWidth - 80)}
          </g>
        </svg>
      </div>

      {/* INTERACTIVE PREFIX PATH TRAVERSAL CARD */}
      <div className={`p-3 rounded-2xl border shadow-xs transition-colors shrink-0 font-mono text-xs ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-[#203247]/10 text-[#203247]'}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#347f7a]" />
            <span className="font-bold uppercase tracking-wider text-[11px]">ACTIVE PREFIX PATH TRACE:</span>
            {activePathChars.length === 0 ? (
              <span className="italic opacity-60 font-mono text-[11px]">(ROOT)</span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-md bg-[#203247] text-white font-bold text-[10px]">ROOT</span>
                {activePathChars.map((ch, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-slate-400 text-[10px]">➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#347f7a] text-white font-bold text-[11px]">
                      '{ch}'
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#647895] font-bold">
            <span>Total Nodes: <strong>{totalNodesCount}</strong></span>
            <span>•</span>
            <span>Words Stored: <strong>{storedWords.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
