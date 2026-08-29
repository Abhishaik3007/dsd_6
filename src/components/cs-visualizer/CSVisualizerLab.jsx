import React, { useState, useEffect } from 'react';
import {
  Binary, GitCommit, Layers, BarChart2, Hash, GitBranch, Cpu, Network, ShieldCheck,
  Undo2, Redo2, Edit2, Save, Share2, Sun, Moon, HelpCircle, ChevronDown,
  Plus, Trash2, Search, X, Play, Pause, Square, Sparkles, Bot, Check, ArrowRight, ArrowLeft,
  SkipBack, SkipForward, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { LinkedListVisualizer } from './LinkedListVisualizer';
import { ArrayVisualizer } from './ArrayVisualizer';
import { TreeVisualizer } from './TreeVisualizer';
import { StackQueueVisualizer } from './StackQueueVisualizer';
import { QueueVisualizer } from './QueueVisualizer';
import { SortingVisualizer } from './SortingVisualizer';
import { GraphVisualizer } from './GraphVisualizer';
import { HeapVisualizer } from './HeapVisualizer';
import { HashTableVisualizer } from './HashTableVisualizer';
import { TrieVisualizer } from './TrieVisualizer';
import { BTreeVisualizer } from './BTreeVisualizer';
import { AVLTreeVisualizer } from './AVLTreeVisualizer';
import { useHub } from '../../context/HubContext';
import './cs-visualizer-styles.css';

export const CSVisualizerLab = () => {
  const { setActiveTab, selectedDsId, setSelectedDsId } = useHub();

  // Active DS Selection
  const [activeDs, setActiveDs] = useState(selectedDsId || 'none');
  const [activeTab, setActiveNotebookTab] = useState('visualization'); // 'visualization' | 'code' | 'properties' | 'flow'

  // Custom structure title
  const [titleText, setTitleText] = useState('Select Data Structure');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Sync selectedDsId from Hub Context
  useEffect(() => {
    if (selectedDsId) {
      setActiveDs(selectedDsId);
      setTitleText(getDsTitle(selectedDsId));
    }
  }, [selectedDsId]);

  // Universal Mouse Wheel Listener (Tape Mode -> Horizontal Scroll, Grid Mode -> Strict Vertical Scroll)
  useEffect(() => {
    const handleWheel = (e) => {
      let el = e.target;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const isHorizontalHidden = style.overflowX === 'hidden' || el.classList.contains('overflow-x-hidden');
        const isVerticalScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
        const hasHorizontalClass = el.classList.contains('custom-horizontal-scrollbar');

        if (isHorizontalHidden) {
          // Grid mode - strictly allow native vertical scrolling
          break;
        }

        if (isVerticalScrollable) {
          // Vertical container - allow native vertical scrolling
          break;
        }

        if (hasHorizontalClass || (style.overflowX === 'auto' && el.scrollWidth > el.clientWidth)) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY * 0.85;
            e.preventDefault();
            break;
          }
        }
        el = el.parentElement;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Linked List State & Operations
  const [nodes, setNodes] = useState([
    { id: 1, val: 10 },
    { id: 2, val: 20 },
    { id: 3, val: 30 },
    { id: 4, val: 40 },
    { id: 5, val: 50 }
  ]);
  const [highlightedIdx, setHighlightedIdx] = useState(null);

  // Operations Form State
  const [operationType, setOperationType] = useState('insert-pos');
  const [posInput, setPosInput] = useState('2');
  const [valInput, setValInput] = useState('25');
  const [weightInput, setWeightInput] = useState('5');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Animation Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);
  const [lastExecutedOp, setLastExecutedOp] = useState(null);

  // Animation Step Controller State
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [stepCommand, setStepCommand] = useState(null);

  const isOperationRunning = isPlaying || isPlayingAnim || isExecuting;

  // Tab View Controls State
  const [codeLang, setCodeLang] = useState('js'); // 'js' | 'python' | 'cpp'
  const [copiedCode, setCopiedCode] = useState(false);

  const handleStepControl = (action) => {
    if (action === 'toggle-play') {
      setIsPlayingAnim(prev => !prev);
      setStepCommand({ action: 'toggle-play', timestamp: Date.now() });
    } else {
      setStepCommand({ action, timestamp: Date.now() });
    }
  };

  const handleStepUpdateFromVisualizer = (data) => {
    if (data.totalSteps !== undefined) setTotalSteps(data.totalSteps);
    if (data.currentStep !== undefined) setCurrentStepIdx(data.currentStep);
    if (data.isPlaying !== undefined) setIsPlayingAnim(data.isPlaying);
  };

  // Console Logs State
  const [consoleLogs, setConsoleLogs] = useState([
    { id: 1, op: 'Insert(10)', msg: 'List was empty. 10 is set as head.' },
    { id: 2, op: 'Insert(20)', msg: '20 inserted after 10.' },
    { id: 3, op: 'Insert(30)', msg: '30 inserted after 20.' },
    { id: 4, op: 'Insert(40)', msg: '40 inserted after 30.' },
    { id: 5, op: 'Insert(50)', msg: '50 inserted after 40.' }
  ]);

  const addConsoleLog = (op, msg) => {
    setConsoleLogs(prev => [...prev.slice(-9), { id: Date.now(), op, msg }]);
  };

  const [valInputShake, setValInputShake] = useState(false);

  // Execute operation function
  const handleExecuteOperation = async () => {
    if (isOperationRunning) return;

    const val = parseInt(valInput);
    const pos = parseInt(posInput);

    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, Math.max(900, 1000 / playbackSpeed));

    // Safety fallback auto-unlock if animation finishes or gets interrupted
    setTimeout(() => {
      setIsExecuting(false);
      setIsPlayingAnim(false);
      setIsPlaying(false);
    }, Math.max(2500, 4500 / playbackSpeed));

    if (operationType === 'add-edge') {
      if (valInput.trim() === '' || posInput.trim() === '') {
        setValInputShake(true);
        setTimeout(() => setValInputShake(false), 850);
        return;
      }
      const customWeight = parseInt(weightInput) || Math.floor(Math.random() * 9 + 1);
      setLastExecutedOp({
        ds: activeDs,
        type: operationType,
        val: valInput.trim(),
        pos: posInput.trim(),
        weight: customWeight,
        timestamp: Date.now()
      });
      return;
    }

    if (['inorder', 'preorder', 'postorder', 'clear', 'min-heap', 'max-heap'].includes(operationType)) {
      setLastExecutedOp({
        ds: activeDs,
        type: operationType,
        val: valInput.trim(),
        timestamp: Date.now()
      });
      return;
    }

    const isTextOp = ['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-search', 'hash-delete', 'hash-set', 'trie-insert', 'trie-search', 'trie-delete', 'trie-prefix'].includes(operationType);
    const requiresValue = ['insert-pos', 'insert-head', 'insert-tail', 'hash-insert', 'hash-search', 'hash-delete', 'push', 'enqueue', 'push-front', 'hash-set', 'trie-insert', 'trie-search', 'trie-delete', 'trie-prefix'].includes(operationType);

    if (requiresValue) {
      if (valInput.trim() === '' || (!isTextOp && isNaN(val))) {
        setValInputShake(true);
        setTimeout(() => setValInputShake(false), 850);
        return;
      }
    }

    const finalVal = isTextOp ? valInput.trim() : (isNaN(val) ? (valInput.trim() || Math.floor(Math.random() * 85 + 10)) : val);

    setLastExecutedOp({
      ds: activeDs,
      type: operationType,
      val: finalVal,
      pos: isNaN(pos) ? posInput : pos,
      timestamp: Date.now()
    });

    if (operationType === 'insert-head') {
      const numVal = isNaN(val) ? Math.floor(Math.random() * 90 + 10) : val;
      const newNode = { id: Date.now(), val: numVal };
      setNodes(prev => [newNode, ...prev]);
      setHighlightedIdx(0);
      addConsoleLog(`Insert(${numVal})`, `${numVal} inserted at head.`);
    } else if (operationType === 'insert-tail') {
      const numVal = isNaN(val) ? Math.floor(Math.random() * 90 + 10) : val;
      const newNode = { id: Date.now(), val: numVal };
      setNodes(prev => [...prev, newNode]);
      setHighlightedIdx(nodes.length);
      addConsoleLog(`Insert(${numVal})`, `${numVal} inserted at tail.`);
    } else if (operationType === 'insert-pos') {
      const numVal = isNaN(val) ? Math.floor(Math.random() * 90 + 10) : val;
      const targetPos = isNaN(pos) ? 0 : Math.min(Math.max(0, pos), nodes.length);
      const newNode = { id: Date.now(), val: numVal };
      const newNodes = [...nodes];
      newNodes.splice(targetPos, 0, newNode);
      setNodes(newNodes);
      setHighlightedIdx(targetPos);
      addConsoleLog(`Insert(${numVal})`, `${numVal} inserted at position ${targetPos}.`);
    } else if (operationType === 'delete-pos') {
      const targetPos = isNaN(pos) ? 0 : Math.min(Math.max(0, pos), nodes.length - 1);
      if (nodes.length > 0) {
        const deletedVal = nodes[targetPos]?.val;
        const newNodes = nodes.filter((_, i) => i !== targetPos);
        setNodes(newNodes);
        setHighlightedIdx(null);
        addConsoleLog(`Delete(${targetPos})`, `Deleted node with value ${deletedVal} at position ${targetPos}.`);
      }
    } else if (operationType === 'search') {
      const searchVal = isNaN(val) ? 20 : val;
      addConsoleLog(`Search(${searchVal})`, `Starting search for value ${searchVal}...`);
      setIsPlaying(true);
      let foundIndex = -1;
      for (let i = 0; i < nodes.length; i++) {
        setHighlightedIdx(i);
        await new Promise(r => setTimeout(r, 600));
        if (nodes[i].val === searchVal) {
          foundIndex = i;
          break;
        }
      }
      setIsPlaying(false);
      if (foundIndex !== -1) {
        addConsoleLog(`Search(${searchVal})`, `SUCCESS: Found value ${searchVal} at index ${foundIndex}!`);
      } else {
        addConsoleLog(`Search(${searchVal})`, `Value ${searchVal} not found.`);
        setHighlightedIdx(null);
      }
    } else if (operationType === 'traverse') {
      addConsoleLog(`Traverse()`, `Traversing linked list from HEAD to NULL...`);
      setIsPlaying(true);
      for (let i = 0; i < nodes.length; i++) {
        setHighlightedIdx(i);
        await new Promise(r => setTimeout(r, 500));
      }
      setIsPlaying(false);
      addConsoleLog(`Traverse()`, `Completed full traversal.`);
    }
  };

  const handleClear = () => {
    setNodes([]);
    setHighlightedIdx(null);
    addConsoleLog('Clear()', 'Cleared all nodes from the linked list.');
  };

  const getDsTitle = (id) => {
    const titles = {
      'none': 'Select Data Structure',
      'array': 'Array Visualizer',
      'linked-list': 'Singly Linked List',
      'doubly-linked-list': 'Doubly Linked List',
      'stack': 'Stack Frame (LIFO)',
      'queue': 'Queue Frame (FIFO)',
      'deque': 'Double-Ended Queue (Deque)',
      'tree': 'Binary Tree',
      'binary-tree': 'Binary Search Tree',
      'graph': 'Graph Visualizer',
      'heap': 'Binary Heap (Min/Max)',
      'hash-table': 'Hash Table',
      'trie': 'Trie (Prefix Tree)',
      'avl-tree': 'AVL Tree (Self-Balancing)',
      'red-black-tree': 'Red-Black Tree',
      'b-tree': 'B-Tree (Multi-Key Index)',
      'set': 'Set (Unique Collection)'
    };
    return titles[id] || 'Select Data Structure';
  };

  const getOperationsForDs = (ds) => {
    if (ds === 'stack') {
      return [
        { value: 'push', label: 'Push to Top' },
        { value: 'pop', label: 'Pop Top Element' },
        { value: 'peek', label: 'Peek Top Element' },
        { value: 'clear', label: 'Clear Stack' }
      ];
    }
    if (ds === 'queue') {
      return [
        { value: 'enqueue', label: 'Enqueue (Push Back)' },
        { value: 'dequeue', label: 'Dequeue (Pop Front)' },
        { value: 'clear', label: 'Clear Queue' }
      ];
    }
    if (ds === 'deque') {
      return [
        { value: 'enqueue', label: 'Push Back (Rear)' },
        { value: 'dequeue', label: 'Pop Front (Front)' },
        { value: 'push-front', label: 'Push Front (Front)' },
        { value: 'pop-back', label: 'Pop Back (Rear)' },
        { value: 'clear', label: 'Clear Deque' }
      ];
    }
    if (ds === 'heap') {
      return [
        { value: 'insert-node', label: 'Insert Value' },
        { value: 'min-heap', label: 'Switch to Min-Heap' },
        { value: 'max-heap', label: 'Switch to Max-Heap' },
        { value: 'clear', label: 'Clear Heap' }
      ];
    }
    if (ds === 'hash-table') {
      return [
        { value: 'hash-insert', label: 'Insert Key-Value' },
        { value: 'hash-search', label: 'Search Key' },
        { value: 'hash-delete', label: 'Delete Key' },
        { value: 'clear', label: 'Clear Table' }
      ];
    }
    if (['tree', 'binary-tree', 'avl-tree', 'red-black-tree', 'b-tree'].includes(ds)) {
      return [
        { value: 'insert-node', label: 'Insert Node Value' },
        { value: 'delete-node', label: 'Delete Node Value' },
        { value: 'search', label: 'Search Value' },
        { value: 'inorder', label: 'Inorder Traversal' },
        { value: 'preorder', label: 'Preorder Traversal' },
        { value: 'postorder', label: 'Postorder Traversal' }
      ];
    }
    if (ds === 'graph') {
      return [
        { value: 'add-node', label: 'Add Vertex' },
        { value: 'add-edge', label: 'Add Edge (From ➔ To)' },
        { value: 'bfs', label: 'BFS Traversal (Queue)' },
        { value: 'dfs', label: 'DFS Traversal (Stack)' },
        { value: 'clear', label: 'Clear Graph' }
      ];
    }
    if (ds === 'hash-table') {
      return [
        { value: 'hash-set', label: 'Insert Key-Value' },
        { value: 'hash-get', label: 'Lookup Key' },
        { value: 'hash-delete', label: 'Delete Key' }
      ];
    }
    if (ds === 'trie') {
      return [
        { value: 'trie-insert', label: 'Insert Word' },
        { value: 'trie-search', label: 'Search Word' },
        { value: 'trie-delete', label: 'Delete Word' },
        { value: 'trie-prefix', label: 'Check Prefix' },
        { value: 'clear', label: 'Clear Trie' }
      ];
    }
    if (ds === 'doubly-linked-list') {
      return [
        { value: 'insert-head', label: 'Insert at Head' },
        { value: 'insert-tail', label: 'Insert at Tail' },
        { value: 'insert-pos', label: 'Insert at Position' },
        { value: 'delete-pos', label: 'Delete at Position' },
        { value: 'search', label: 'Search' },
        { value: 'traverse', label: 'Traverse' }
      ];
    }
    // Default Linked List / Array
    return [
      { value: 'insert-pos', label: 'Insert at Position' },
      { value: 'insert-head', label: 'Insert at Head' },
      { value: 'insert-tail', label: 'Insert at Tail' },
      { value: 'delete-pos', label: 'Delete at Position' },
      { value: 'search', label: 'Search' },
      { value: 'traverse', label: 'Traverse' }
    ];
  };

  const getComplexityForOperation = (ds, op) => {
    if (ds === 'none') return { time: '-', space: '-' };

    // 1. Array
    if (ds === 'array') {
      if (op === 'access' || op === 'peek') return { time: 'O(1)', space: 'O(1)' };
      if (op === 'insert-tail') return { time: 'O(1) amortized', space: 'O(1)' };
      if (op === 'search' || op === 'traverse' || op === 'insert-pos' || op === 'delete-pos' || op === 'insert-head') {
        return { time: 'O(n)', space: 'O(1)' };
      }
      return { time: 'O(n)', space: 'O(1)' };
    }

    // 2. Singly Linked List
    if (ds === 'linked-list') {
      if (op === 'insert-head' || op === 'delete-head') return { time: 'O(1)', space: 'O(1)' };
      if (op === 'insert-tail') return { time: 'O(n)', space: 'O(1)' };
      if (op === 'search' || op === 'traverse' || op === 'insert-pos' || op === 'delete-pos') {
        return { time: 'O(n)', space: 'O(1)' };
      }
      return { time: 'O(n)', space: 'O(1)' };
    }

    // 3. Doubly Linked List
    if (ds === 'doubly-linked-list') {
      if (op === 'insert-head' || op === 'delete-head' || op === 'insert-tail') return { time: 'O(1)', space: 'O(1)' };
      if (op === 'search' || op === 'traverse' || op === 'insert-pos' || op === 'delete-pos') {
        return { time: 'O(n)', space: 'O(1)' };
      }
      return { time: 'O(n)', space: 'O(1)' };
    }

    // 4. Stack & Queue & Deque
    if (ds === 'stack' || ds === 'queue' || ds === 'deque') {
      return { time: 'O(1)', space: 'O(1)' };
    }

    // 5. Binary Search Tree (BST)
    if (ds === 'binary-tree' || ds === 'tree') {
      if (['inorder', 'preorder', 'postorder'].includes(op)) return { time: 'O(n)', space: 'O(h)' };
      return { time: 'O(log n) avg', space: 'O(h)' };
    }

    // 6. Red-Black Tree
    if (ds === 'red-black-tree') {
      if (['inorder', 'preorder', 'postorder'].includes(op)) return { time: 'O(n)', space: 'O(h)' };
      return { time: 'O(log n) worst', space: 'O(1)' };
    }

    // 7. Binary Heap
    if (ds === 'heap') {
      if (op === 'insert-node') return { time: 'O(log n)', space: 'O(1)' };
      if (op === 'min-heap' || op === 'max-heap') return { time: 'O(n) heapify', space: 'O(1)' };
      return { time: 'O(log n)', space: 'O(1)' };
    }

    // 8. Graph
    if (ds === 'graph') {
      if (op === 'bfs' || op === 'dfs') return { time: 'O(V + E)', space: 'O(V)' };
      if (op === 'add-node' || op === 'add-edge') return { time: 'O(1)', space: 'O(1)' };
      return { time: 'O(V + E)', space: 'O(V)' };
    }

    // 9. Hash Table
    if (ds === 'hash-table') {
      return { time: 'O(1) avg', space: 'O(1)' };
    }

    // 10. Trie (Prefix Tree)
    if (ds === 'trie') {
      return { time: 'O(k) [word len]', space: 'O(k)' };
    }

    return { time: 'O(1)', space: 'O(1)' };
  };

  const handleDsSelect = (dsId) => {
    setActiveDs(dsId);
    if (typeof setSelectedDsId === 'function') {
      setSelectedDsId(dsId);
    }
    setTitleText(getDsTitle(dsId));
    setLastExecutedOp(null);
    setValInput('');
    setPosInput('');
    setWeightInput('');
    setIsExecuting(false);
    setIsPlayingAnim(false);
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setTotalSteps(0);
    setStepCommand({ action: 'reset', timestamp: Date.now() });
    const ops = getOperationsForDs(dsId);
    if (ops.length > 0) setOperationType(ops[0].value);
  };

  // Sync valid operationType whenever activeDs changes & reset operational state
  useEffect(() => {
    setLastExecutedOp(null);
    setValInput('');
    setPosInput('');
    setWeightInput('');
    setIsExecuting(false);
    setIsPlayingAnim(false);
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setTotalSteps(0);
    setStepCommand({ action: 'reset', timestamp: Date.now() });
    const ops = getOperationsForDs(activeDs);
    if (ops.length > 0 && !ops.some(op => op.value === operationType)) {
      setOperationType(ops[0].value);
    }
  }, [activeDs]);

  // Theme & Help Modal state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDsMenuOpen, setIsDsMenuOpen] = useState(false);

  // Scoped Operation Filter: Ensures operations only run on their target DS
  const activeOp = lastExecutedOp?.ds === activeDs ? lastExecutedOp : null;

  return (
    <div className={`logicraft-desk-workspace ${isDarkMode ? 'dark-mode-lab' : ''}`}>
      {/* 1. TOP SYSTEM NAVIGATION HEADER (EXPANDS DIRECTLY IN HEIGHT OVER CANVAS) */}
      <header className={`logicraft-top-header ${isDsMenuOpen ? 'is-open' : ''}`}>
        {/* TOP MAIN ROW */}
        <div className="flex items-center justify-between w-full h-[36px] shrink-0">
          <div className="header-left-brand flex items-center gap-3">
            <button
              className="icon-btn-pill"
              onClick={() => setActiveTab('dsa-doc')}
              title="Back to Documentation"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
            >
              <ArrowLeft size={14} /> Docs
            </button>

            <div className="flex items-center gap-1.5 font-sans">
              <span className={`font-extrabold text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-[#347f7a]'}`}>
                Data Structure Visualizer
              </span>
            </div>

            {/* EXPAND TOP BAR BUTTON */}
            <button
              onClick={() => setIsDsMenuOpen(!isDsMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs ${isDsMenuOpen ? 'bg-[#347f7a] text-white border-[#347f7a]' : (isDarkMode ? 'bg-[#1e293b] border-slate-700 text-emerald-400 hover:border-[#347f7a]' : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a] hover:bg-[#faf8f4]')}`}
            >
              <Layers size={14} className={isDsMenuOpen ? 'text-white' : 'text-[#347f7a]'} />
              <span className="uppercase font-extrabold">{getDsTitle(activeDs)}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDsMenuOpen ? 'rotate-180 text-white' : 'text-[#647895]'}`} />
            </button>
          </div>

          {/* HEADER RIGHT ACTIONS */}
          <div className="header-right-actions flex items-center gap-2">
            <button
              className={`w-9 h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center ${isDarkMode ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 shadow-xs' : 'bg-white border-[#203247]/12 text-[#647895] hover:text-[#203247] hover:border-[#347f7a] shadow-2xs'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Warm Studio" : "Switch to Dark Signal Mode"}
            >
              {isDarkMode ? <Moon size={17} className="text-amber-400 animate-in spin-in-90 duration-300" /> : <Sun size={17} className="text-amber-500 animate-in spin-in-90 duration-300" />}
            </button>

            <button
              className={`w-9 h-9 rounded-full border transition-all cursor-pointer flex items-center justify-center ${isDarkMode ? 'bg-[#347f7a]/20 border-[#347f7a]/40 text-emerald-400 hover:bg-[#347f7a]/35 shadow-xs' : 'bg-white border-[#203247]/12 text-[#347f7a] hover:bg-[#347f7a]/10 hover:border-[#347f7a] shadow-2xs'}`}
              onClick={() => setIsHelpOpen(true)}
              title="Visualizer Guide & Keyboard Shortcuts"
            >
              <HelpCircle size={17} />
            </button>
          </div>
        </div>

        {/* SMOOTH ANIMATED EXPANDING CONTAINER */}
        <div className={`ds-menu-expand-container ${isDsMenuOpen ? 'open' : ''}`}>
          <div className="ds-menu-expand-inner">
            <div className="w-full pt-3 mt-3 border-t border-[#203247]/10 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-4 pb-1">
                {/* LINEAR */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-[#647895] tracking-wider px-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span> LINEAR DATA STRUCTURES
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'linked-list', label: 'Singly Linked List' },
                      { id: 'doubly-linked-list', label: 'Doubly Linked List' },
                      { id: 'array', label: 'Static Array' },
                      { id: 'stack', label: 'Stack (LIFO)' },
                      { id: 'queue', label: 'Queue (FIFO)' },
                      { id: 'deque', label: 'Deque' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => { handleDsSelect(item.id); setIsDsMenuOpen(false); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex items-center justify-between ${activeDs === item.id ? (isDarkMode ? 'bg-[#347f7a]/25 border-[#347f7a] text-emerald-400' : 'bg-[#347f7a] border-[#347f7a] text-white shadow-xs') : (isDarkMode ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600' : 'bg-white/80 border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white')}`}
                      >
                        <span>{item.label}</span>
                        {activeDs === item.id && <Check size={14} className={activeDs === item.id && !isDarkMode ? 'text-white' : 'text-[#347f7a]'} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TREES */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-[#647895] tracking-wider px-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> TREES & HIERARCHICAL
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'binary-tree', label: 'Binary Search Tree' },
                      { id: 'avl-tree', label: 'AVL Tree (Self-Balancing)' },
                      { id: 'heap', label: 'Heap (Min/Max)' },
                      { id: 'graph', label: 'Graph Visualizer' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => { handleDsSelect(item.id); setIsDsMenuOpen(false); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex items-center justify-between ${activeDs === item.id ? (isDarkMode ? 'bg-[#347f7a]/25 border-[#347f7a] text-emerald-400' : 'bg-[#347f7a] border-[#347f7a] text-white shadow-xs') : (isDarkMode ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600' : 'bg-white/80 border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white')}`}
                      >
                        <span>{item.label}</span>
                        {activeDs === item.id && <Check size={14} className={activeDs === item.id && !isDarkMode ? 'text-white' : 'text-[#347f7a]'} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ADVANCED */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-[#647895] tracking-wider px-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> ADVANCED & HASHING
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'hash-table', label: 'Hash Table' },
                      { id: 'trie', label: 'Prefix Tree (Trie)' },
                      { id: 'red-black-tree', label: 'Red-Black Tree' },
                      { id: 'b-tree', label: 'B-Tree' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => { handleDsSelect(item.id); setIsDsMenuOpen(false); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex items-center justify-between ${activeDs === item.id ? (isDarkMode ? 'bg-[#347f7a]/25 border-[#347f7a] text-emerald-400' : 'bg-[#347f7a] border-[#347f7a] text-white shadow-xs') : (isDarkMode ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600' : 'bg-white/80 border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white')}`}
                      >
                        <span>{item.label}</span>
                        {activeDs === item.id && <Check size={14} className={activeDs === item.id && !isDarkMode ? 'text-white' : 'text-[#347f7a]'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HELP & LAB GUIDE MODAL (WIDE MAX-W-3XL LAYOUT) */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className={`rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border flex flex-col gap-5 relative animate-in zoom-in-95 duration-150 font-sans ${isDarkMode ? 'bg-[#0f172a] text-white border-slate-700' : 'bg-white text-[#203247] border-[#203247]/15'}`}>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#347f7a]/10 text-[#347f7a]'}`}>
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Signal Studio Laboratory Guide</h3>
                  <p className="text-xs opacity-75">Interactive Data Structure & Memory Allocation Playground</p>
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
                  <span>⚡</span> How to Execute Operations
                </h4>
                <ul className="list-disc list-inside space-y-1.5 opacity-90 leading-relaxed">
                  <li>Select a Data Structure (Array, Linked List, Stack, Queue) from the left panel.</li>
                  <li>In the <strong>Operations Panel</strong> on the right, pick an action (Insert, Delete, Search).</li>
                  <li>Enter the required <strong>Position</strong> and <strong>Value</strong> parameters.</li>
                  <li>Click <strong>Execute</strong> to launch step-by-step RAM memory animations.</li>
                </ul>
              </div>

              {/* SECTION 2: STEP CONTROLLER */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#347f7a] flex items-center gap-1.5">
                  <span>⏮</span> Animation Step Controller
                </h4>
                <p className="opacity-90 leading-relaxed">
                  Use the step controls below Complexity to scrub through step history: <strong>⏮ First</strong>, <strong>◀ Prev</strong>, <strong>⏯ Play/Pause</strong>, <strong>Next ▶</strong>, and <strong>Last ⏭</strong>. You can also adjust animation playback speed (0.5x – 2.0x).
                </p>
              </div>

              {/* SECTION 3: INTERACTIVE NOTEBOOK TABS (FULL SPAN) */}
              <div className={`md:col-span-2 p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#347f7a] flex items-center gap-1.5">
                  <span>📚</span> Notebook Studio Tabs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1 font-mono text-[11px]">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold">✨ Visualization</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Live RAM memory cells & active pointers</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold">&lt;/&gt; Code Trace</span>
                    <p className="text-[10px] opacity-75 mt-0.5">JS, Python & C++ algorithm implementations</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold">🛡️ Invariants & Props</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Indexed formula & memory tradeoffs</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#203247]/10'}`}>
                    <span className="font-bold">🌿 Flowchart</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Vector decision tree diagram</p>
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

      {/* 2. MAIN DESK WORKSPACE THREE-COLUMN LAYOUT */}
      <div className="logicraft-desk-grid">



        {/* CENTER COLUMN: SIGNAL STUDIO CANVAS STAGE */}
        <main className="logicraft-center-stage">
          {/* SIGNAL STUDIO CANVAS CONTAINER */}
          <div className="spiral-notebook-container">
            {/* NOTEBOOK CANVAS INSIDE */}
            <div className="notebook-graph-paper">
              {/* DIRECT VISUALIZER CANVAS STAGE */}
              <div className="notebook-view-stage">
                {activeDs === 'none' && (
                  <div className="flex flex-col items-center justify-center p-6 text-center min-h-[480px] w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-[#347f7a]/15 text-[#347f7a] dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                      <Layers size={28} />
                    </div>

                    <h2 className={`font-space-grotesk text-xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>
                      Choose a Data Structure to Begin
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-8">
                      Select any data structure below to launch interactive step-by-step memory visualizations, algorithm traversals, and execution controls.
                    </p>

                    {/* 3 CATEGORIES GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
                      {/* LINEAR */}
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-[#203247]/12 shadow-sm'}`}>
                        <div className="text-[11px] font-mono font-extrabold uppercase text-[#347f7a] dark:text-emerald-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span> LINEAR DATA STRUCTURES
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'linked-list', label: 'Singly Linked List' },
                            { id: 'doubly-linked-list', label: 'Doubly Linked List' },
                            { id: 'array', label: 'Static Array' },
                            { id: 'stack', label: 'Stack (LIFO)' },
                            { id: 'queue', label: 'Queue (FIFO)' },
                            { id: 'deque', label: 'Deque' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleDsSelect(item.id)}
                              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left flex items-center justify-between ${isDarkMode ? 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white'}`}
                            >
                              <span>{item.label}</span>
                              <ArrowRight size={13} className="opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* TREES */}
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-[#203247]/12 shadow-sm'}`}>
                        <div className="text-[11px] font-mono font-extrabold uppercase text-[#347f7a] dark:text-emerald-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> TREES & HIERARCHICAL
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'binary-tree', label: 'Binary Search Tree' },
                            { id: 'avl-tree', label: 'AVL Tree (Self-Balancing)' },
                            { id: 'heap', label: 'Heap (Min/Max)' },
                            { id: 'graph', label: 'Graph Visualizer' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleDsSelect(item.id)}
                              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left flex items-center justify-between ${isDarkMode ? 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white'}`}
                            >
                              <span>{item.label}</span>
                              <ArrowRight size={13} className="opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ADVANCED */}
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-[#203247]/12 shadow-sm'}`}>
                        <div className="text-[11px] font-mono font-extrabold uppercase text-[#347f7a] dark:text-emerald-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span> ADVANCED & HASHING
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'hash-table', label: 'Hash Table' },
                            { id: 'trie', label: 'Prefix Tree (Trie)' },
                            { id: 'red-black-tree', label: 'Red-Black Tree' },
                            { id: 'b-tree', label: 'B-Tree' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleDsSelect(item.id)}
                              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left flex items-center justify-between ${isDarkMode ? 'bg-slate-900/60 border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/10 text-[#203247] hover:border-[#347f7a] hover:bg-white'}`}
                            >
                              <span>{item.label}</span>
                              <ArrowRight size={13} className="opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {(activeDs === 'linked-list' || activeDs === 'doubly-linked-list') && (
                  <LinkedListVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDoubly={activeDs === 'doubly-linked-list'}
                    onModeChange={handleDsSelect}
                  />
                )}
                {activeDs === 'array' && (
                  <ArrayVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                  />
                )}
                {activeDs === 'stack' && (
                  <StackQueueVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                  />
                )}
                {(activeDs === 'queue' || activeDs === 'deque') && (
                  <QueueVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    initialMode={activeDs === 'deque' ? 'deque' : 'queue'}
                    onModeChange={handleDsSelect}
                  />
                )}
                {activeDs === 'graph' && (
                  <GraphVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeDs === 'heap' && (
                  <HeapVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeDs === 'hash-table' && (
                  <HashTableVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeDs === 'trie' && (
                  <TrieVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeDs === 'b-tree' && (
                  <BTreeVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeDs === 'avl-tree' && (
                  <AVLTreeVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    isDarkMode={isDarkMode}
                  />
                )}
                {(activeDs === 'tree' || activeDs === 'binary-tree' || activeDs === 'red-black-tree' || activeDs === 'set') && (
                  <TreeVisualizer
                    key={activeDs}
                    externalOp={activeOp}
                    onStepUpdate={handleStepUpdateFromVisualizer}
                    stepCommand={stepCommand}
                    playbackSpeed={playbackSpeed}
                    dsType={activeDs}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: OPERATIONS & COMPLEXITY */}
        <aside className="logicraft-right-sidebar">
          {/* OPERATIONS PANEL */}
          <div className="right-panel-card ops-panel-card relative z-30">
            <div className="panel-title">OPERATIONS PANEL</div>

            {/* CUSTOM MODERN DROPDOWN */}
            <div className="form-field-group relative">
              <label className="block text-[11px] font-bold text-[#647895] uppercase tracking-wider mb-1.5">Operation</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#203247]/15 rounded-xl text-xs font-bold text-[#203247] hover:border-[#347f7a] focus:outline-none transition-all shadow-xs cursor-pointer select-none"
                >
                  <span>{getOperationsForDs(activeDs).find(op => op.value === operationType)?.label || 'Select Operation'}</span>
                  <ChevronDown size={14} className={`text-[#647895] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#347f7a]' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-[#203247]/12 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                      {getOperationsForDs(activeDs).map(op => {
                        const isSelected = op.value === operationType;
                        return (
                          <button
                            key={op.value}
                            type="button"
                            onClick={() => {
                              setOperationType(op.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer select-none ${isSelected ? 'bg-[#347f7a]/10 text-[#347f7a]' : 'text-[#203247] hover:bg-[#faf8f4]'}`}
                          >
                            <span>{op.label}</span>
                            {isSelected && <Check size={14} className="text-[#347f7a]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {['insert-pos', 'insert-head', 'insert-tail', 'search', 'push', 'enqueue', 'push-front', 'insert-node', 'delete-node', 'hash-insert', 'hash-search', 'hash-delete', 'hash-set', 'add-edge', 'bfs', 'dfs', 'trie-insert', 'trie-search', 'trie-delete', 'trie-prefix'].includes(operationType) && (
              <div className="form-field-group">
                <label>
                  {operationType === 'push'
                    ? 'Value to Push'
                    : operationType === 'enqueue'
                      ? 'Value to Enqueue'
                      : operationType === 'add-edge'
                        ? 'From Vertex Name (e.g. V0)'
                        : operationType === 'bfs' || operationType === 'dfs'
                          ? 'Start Vertex Name (e.g. V0)'
                          : ['hash-insert', 'hash-search', 'hash-delete', 'hash-set'].includes(operationType)
                            ? 'Key (e.g. 14 or 25)'
                            : operationType === 'trie-insert'
                              ? 'Word to Insert'
                              : operationType === 'trie-search'
                                ? 'Word to Search'
                                : operationType === 'trie-delete'
                                  ? 'Word to Delete'
                                  : operationType === 'trie-prefix'
                                    ? 'Prefix to Check'
                                    : 'Value'}
                </label>
                <input
                  type={['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-search', 'hash-delete', 'hash-set', 'trie-insert', 'trie-search', 'trie-delete', 'trie-prefix'].includes(operationType) ? 'text' : 'number'}
                  value={valInput}
                  onChange={e => setValInput(e.target.value.slice(0, 15))}
                  maxLength={15}
                  className={`ops-input uppercase font-mono transition-all ${valInputShake ? 'input-error-squiggle' : ''}`}
                  placeholder={
                    operationType === 'push'
                      ? 'Enter number...'
                      : operationType === 'add-edge'
                        ? 'e.g. V0 or v0...'
                        : operationType === 'bfs' || operationType === 'dfs'
                          ? 'e.g. V0, V1 (default V0)...'
                          : ['hash-insert', 'hash-search', 'hash-delete', 'hash-set'].includes(operationType)
                            ? 'e.g. 14, 25 or "user"...'
                            : ['trie-insert', 'trie-search', 'trie-delete', 'trie-prefix'].includes(operationType)
                              ? 'e.g. CAT, CAR, CODE...'
                              : 'Enter value (max 7 digits)...'
                  }
                />
              </div>
            )}

            {(operationType === 'insert-pos' || operationType === 'delete-pos' || operationType === 'add-edge' || operationType === 'bfs' || operationType === 'dfs' || operationType === 'hash-insert' || operationType === 'hash-set') && (
              <div className="form-field-group">
                <label>
                  {operationType === 'bfs' || operationType === 'dfs'
                    ? 'Target Search Vertex (e.g. V3, optional)'
                    : operationType === 'add-edge'
                      ? 'To Vertex Name (e.g. V2)'
                      : operationType === 'hash-insert' || operationType === 'hash-set'
                        ? 'Value to Store (e.g. 99)'
                        : 'Position'}
                </label>
                <input
                  type={['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-set'].includes(operationType) ? 'text' : 'number'}
                  min={['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-set'].includes(operationType) ? undefined : "0"}
                  value={posInput}
                  onChange={e => {
                    const rawVal = e.target.value;
                    if (!['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-set'].includes(operationType)) {
                      const num = parseInt(rawVal);
                      if (rawVal !== '' && (isNaN(num) || num < 0)) return;
                    }
                    setPosInput(rawVal);
                  }}
                  onKeyDown={e => {
                    if (!['add-edge', 'bfs', 'dfs', 'hash-insert', 'hash-set'].includes(operationType) && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
                      e.preventDefault();
                    }
                  }}
                  className="ops-input uppercase font-mono"
                  placeholder={
                    operationType === 'bfs' || operationType === 'dfs'
                      ? 'e.g. V3 (leave empty for full)...'
                      : operationType === 'add-edge'
                        ? 'e.g. V2 or v2...'
                        : operationType === 'hash-insert' || operationType === 'hash-set'
                          ? 'e.g. 99 (optional value)...'
                          : 'Enter position (>= 0)...'
                  }
                />
              </div>
            )}

            {operationType === 'add-edge' && (
              <div className="form-field-group">
                <label>Edge Cost / Weight (e.g. 5)</label>
                <input
                  type="number"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="ops-input font-mono"
                  placeholder="Enter weight/cost (e.g. 5)..."
                />
              </div>
            )}

            <button
              className="execute-gold-btn"
              onClick={handleExecuteOperation}
              disabled={isOperationRunning}
            >
              {isOperationRunning ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="#ffffff" color="#ffffff" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>

          {/* ANIMATION STEP CONTROLLER CARD */}
          <div className="right-panel-card animation-step-card relative z-10 font-sans">
            <div className="flex items-center justify-between mb-2">
              <span className="panel-title text-xs font-bold text-[#203247] uppercase tracking-wider mb-0">ANIMATION STEPS</span>
              <span className="text-[11px] font-mono font-bold text-[#347f7a]">
                {totalSteps > 0 ? `Step ${currentStepIdx + 1} / ${totalSteps}` : 'Idle'}
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-[#203247]/10 h-1.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-[#347f7a] h-full transition-all duration-300 rounded-full"
                style={{ width: `${totalSteps > 0 ? ((currentStepIdx + 1) / totalSteps) * 100 : 0}%` }}
              />
            </div>

            {/* STEP NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between gap-1 mb-3.5 bg-[#faf8f4] p-1 rounded-2xl border border-[#203247]/10 w-full overflow-hidden">
              <button
                onClick={() => handleStepControl('first')}
                disabled={totalSteps === 0 || currentStepIdx === 0}
                className="w-7 h-7 p-0 flex items-center justify-center rounded-xl text-[#203247] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer border-none shrink-0"
                title="Skip to Start (First Step)"
              >
                <SkipBack size={13} />
              </button>

              <button
                onClick={() => handleStepControl('prev')}
                disabled={totalSteps === 0 || currentStepIdx === 0}
                className="flex-1 h-7 flex items-center justify-center gap-0.5 px-1 rounded-xl bg-white border border-[#203247]/10 text-[11px] font-mono font-bold text-[#203247] hover:border-[#347f7a] disabled:opacity-30 disabled:hover:border-[#203247]/10 transition-all cursor-pointer shadow-2xs min-w-0"
                title="Step Backward"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <button
                onClick={() => handleStepControl('toggle-play')}
                disabled={totalSteps === 0}
                className={`w-8 h-7 p-0 rounded-xl text-white font-bold transition-all cursor-pointer border-none shrink-0 shadow-xs flex items-center justify-center ${isPlayingAnim ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#347f7a] hover:bg-[#203247]'}`}
                title={isPlayingAnim ? 'Pause Auto-Play' : 'Auto Play Steps'}
              >
                {isPlayingAnim ? <Pause size={13} fill="#ffffff" /> : <Play size={13} fill="#ffffff" />}
              </button>

              <button
                onClick={() => handleStepControl('next')}
                disabled={totalSteps === 0 || currentStepIdx >= totalSteps - 1}
                className="flex-1 h-7 flex items-center justify-center gap-0.5 px-1 rounded-xl bg-white border border-[#203247]/10 text-[11px] font-mono font-bold text-[#203247] hover:border-[#347f7a] disabled:opacity-30 disabled:hover:border-[#203247]/10 transition-all cursor-pointer shadow-2xs min-w-0"
                title="Step Forward"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => handleStepControl('last')}
                disabled={totalSteps === 0 || currentStepIdx >= totalSteps - 1}
                className="w-7 h-7 p-0 flex items-center justify-center rounded-xl text-[#203247] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer border-none shrink-0"
                title="Skip to End (Final Step)"
              >
                <SkipForward size={13} />
              </button>
            </div>

            {/* SPEED SLIDER / PILLS (FULL WIDTH GRID) */}
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#647895]">
                <span>Playback Speed</span>
                <span className="text-[#347f7a] font-extrabold">{playbackSpeed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#203247]/10 w-full">
                {[0.5, 1.0, 1.5, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all border-none text-center ${playbackSpeed === s ? 'bg-[#347f7a] text-white shadow-2xs' : 'text-[#526b88] hover:text-[#203247] hover:bg-white/60'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COMPLEXITY METRICS CARD */}
          <div className="right-panel-card complexity-card relative z-10 mt-3">
            <div className="panel-title">COMPLEXITY METRICS</div>
            <div className="complexity-row">
              <span className="c-label">Time Complexity</span>
              <span className="c-val green-gold font-mono font-bold">
                {getComplexityForOperation(activeDs, operationType).time}
              </span>
            </div>
            <div className="complexity-row">
              <span className="c-label">Space Complexity</span>
              <span className="c-val green-gold font-mono font-bold">
                {getComplexityForOperation(activeDs, operationType).space}
              </span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
