import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sparkles, Layers, ZoomIn, ZoomOut, Maximize2, Settings } from 'lucide-react';

// B-Tree Node Structure
class BTreeNode {
  constructor(keys = [], isLeaf = true) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.keys = keys; // Array of sorted numbers
    this.children = []; // Array of BTreeNode objects
    this.isLeaf = isLeaf;
  }
}

// Deep clone B-Tree structure for step snapshots
const cloneBTree = (node) => {
  if (!node) return null;
  const newNode = new BTreeNode([...node.keys], node.isLeaf);
  newNode.id = node.id;
  newNode.children = (node.children || []).map(child => cloneBTree(child));
  return newNode;
};

export const BTreeVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  // Configurable B-Tree Order (m = 3, 4, 5)
  const [bTreeOrder, setBTreeOrder] = useState(4); // Default m=4 (2-3-4 Tree)
  const maxKeys = bTreeOrder - 1; // max keys per node block before split

  // Initial B-Tree structure
  const [bTreeRoot, setBTreeRoot] = useState(() => {
    const root = new BTreeNode([30, 60], false);
    root.children = [
      new BTreeNode([10, 20], true),
      new BTreeNode([40, 50], true),
      new BTreeNode([70, 80], true)
    ];
    return root;
  });

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeKeyIdx, setActiveKeyIdx] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [animStatus, setAnimStatus] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);
  const [traversalType, setTraversalType] = useState('inorder');

  // Zoom & Pan interactive state
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Step playback refs
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animTimerRef = useRef(null);

  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.tree !== undefined) setBTreeRoot(step.tree);
    if (step.activeNodeId !== undefined) setActiveNodeId(step.activeNodeId);
    if (step.activeKeyIdx !== undefined) setActiveKeyIdx(step.activeKeyIdx);
    if (step.visitedNodeIds) setVisitedNodeIds(step.visitedNodeIds);
    if (step.traversalResult) setTraversalResult(step.traversalResult);
    if (step.status) setAnimStatus(step.status);

    if (typeof onStepUpdate === 'function') {
      onStepUpdate({
        currentStep: idx,
        totalSteps: stepsHistoryRef.current.length,
        isPlaying: isPlayingRef.current
      });
    }
  };

  const startAnimationTimer = (steps) => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    if (!steps || steps.length === 0) return;

    let idx = 0;
    currentStepRef.current = 0;
    isPlayingRef.current = true;
    applyStepSnapshot(0);

    if (steps.length === 1) {
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ currentStep: 0, totalSteps: 1, isPlaying: false });
      }
      return;
    }

    animTimerRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animTimerRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animTimerRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ currentStep: steps.length - 1, totalSteps: steps.length, isPlaying: false });
        }
      }
    }, Math.max(300, 750 / playbackSpeed));
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

  // Sync external operation from CSVisualizerLab operations panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val } = externalOp;
    const numVal = parseInt(val) || Math.floor(Math.random() * 85 + 10);

    if (type === 'insert-node' || type === 'insert' || type === 'push') {
      executeInsert(numVal);
    } else if (type === 'search') {
      executeSearch(numVal);
    } else if (type === 'delete-node' || type === 'delete') {
      executeDelete(numVal);
    } else if (['inorder', 'preorder', 'postorder'].includes(type)) {
      setTraversalType(type);
      executeTraversal(type);
    }
  }, [externalOp]);

  // Change B-Tree Order m (3, 4, 5)
  const handleOrderChange = (newOrder) => {
    setBTreeOrder(newOrder);
    let root;
    if (newOrder === 3) {
      root = new BTreeNode([30], false);
      root.children = [
        new BTreeNode([10, 20], true),
        new BTreeNode([40, 50], true)
      ];
    } else {
      root = new BTreeNode([30, 60], false);
      root.children = [
        new BTreeNode([10, 20], true),
        new BTreeNode([40, 50], true),
        new BTreeNode([70, 80], true)
      ];
    }
    setBTreeRoot(root);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setTraversalResult([]);
    setAnimStatus(`Configured B-Tree Order m = ${newOrder} (Max Keys/Node = ${newOrder - 1})`);
  };

  // B-Tree Search Operation
  const executeSearch = (val) => {
    if (!bTreeRoot) {
      setAnimStatus('B-Tree is currently empty. Insert a key to begin!');
      return;
    }
    const searchVal = parseInt(val) || 30;
    const steps = [];
    const visited = [];

    const searchNode = (node) => {
      if (!node) return false;
      visited.push(node.id);

      let i = 0;
      while (i < node.keys.length && searchVal > node.keys[i]) {
        i++;
      }

      let branchDesc = '';
      if (i === 0) branchDesc = `key ${searchVal} < ${node.keys[0]} → left branch`;
      else if (i === node.keys.length) branchDesc = `key ${searchVal} > ${node.keys[node.keys.length - 1]} → rightmost branch`;
      else branchDesc = `${node.keys[i - 1]} < key ${searchVal} < ${node.keys[i]} → middle branch`;

      steps.push({
        tree: cloneBTree(bTreeRoot),
        activeNodeId: node.id,
        activeKeyIdx: null,
        visitedNodeIds: [...visited],
        status: `🔍 Searching for ${searchVal}: Inspecting Node [ ${node.keys.join(' | ')} ]. Range check: ${branchDesc}`
      });

      if (i < node.keys.length && node.keys[i] === searchVal) {
        steps.push({
          tree: cloneBTree(bTreeRoot),
          activeNodeId: node.id,
          activeKeyIdx: i,
          visitedNodeIds: [...visited],
          status: `🎯 SUCCESS! Found Key ${searchVal} at index ${i} inside Node [ ${node.keys.join(' | ')} ]!`
        });
        return true;
      }

      if (node.isLeaf) {
        steps.push({
          tree: cloneBTree(bTreeRoot),
          activeNodeId: null,
          activeKeyIdx: null,
          visitedNodeIds: [...visited],
          status: `❌ Reached leaf node without finding key ${searchVal}.`
        });
        return false;
      }

      return searchNode(node.children[i]);
    };

    searchNode(bTreeRoot);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // Mathematically Correct Bottom-Up B-Tree Insertion Algorithm
  const executeInsert = (val) => {
    const insertVal = parseInt(val) || Math.floor(Math.random() * 85 + 10);
    const steps = [];

    // Empty Tree Case
    if (!bTreeRoot) {
      const newRoot = new BTreeNode([insertVal], true);
      setBTreeRoot(newRoot);
      stepsHistoryRef.current = [{
        tree: cloneBTree(newRoot),
        activeNodeId: newRoot.id,
        activeKeyIdx: 0,
        visitedNodeIds: [newRoot.id],
        status: `✅ Inserted key ${insertVal} as Root into empty B-Tree.`
      }];
      startAnimationTimer(stepsHistoryRef.current);
      return;
    }

    let rootCopy = cloneBTree(bTreeRoot);

    steps.push({
      tree: cloneBTree(rootCopy),
      activeNodeId: rootCopy.id,
      visitedNodeIds: [rootCopy.id],
      status: `⚡ Inserting key ${insertVal} into B-Tree (Order m=${bTreeOrder}, Max Capacity=${maxKeys} keys)`
    });

    // Helper: Split an overflowed node (keys.length >= bTreeOrder)
    const splitNode = (node) => {
      const midIdx = Math.floor(node.keys.length / 2);
      const medianKey = node.keys[midIdx];

      const leftKeys = node.keys.slice(0, midIdx);
      const rightKeys = node.keys.slice(midIdx + 1);

      const leftNode = new BTreeNode(leftKeys, node.isLeaf);
      leftNode.id = node.id; // Retain left node ID
      const rightNode = new BTreeNode(rightKeys, node.isLeaf);

      if (!node.isLeaf && node.children) {
        leftNode.children = node.children.slice(0, midIdx + 1);
        rightNode.children = node.children.slice(midIdx + 1);
      }

      return { medianKey, leftNode, rightNode };
    };

    // Recursive insertion helper
    const insertIntoSubtree = (node, key) => {
      if (node.isLeaf) {
        node.keys.push(key);
        node.keys.sort((a, b) => a - b);

        steps.push({
          tree: cloneBTree(rootCopy),
          activeNodeId: node.id,
          visitedNodeIds: [node.id],
          status: `✅ Added key ${key} to Leaf Node block [ ${node.keys.join(' | ')} ]`
        });

        if (node.keys.length >= bTreeOrder) {
          const split = splitNode(node);
          steps.push({
            tree: cloneBTree(rootCopy),
            activeNodeId: node.id,
            visitedNodeIds: [split.leftNode.id, split.rightNode.id],
            status: `🔄 OVERFLOW SPLIT! Leaf node reached ${node.keys.length} keys (≥ Order m=${bTreeOrder}). Splitting around median key ${split.medianKey}!`
          });
          return split;
        }
        return null;
      } else {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) {
          i++;
        }

        steps.push({
          tree: cloneBTree(rootCopy),
          activeNodeId: node.id,
          visitedNodeIds: [node.id],
          status: `🔍 Inspecting Node block [ ${node.keys.join(' | ')} ]. Key ${key} directs to child branch ${i}.`
        });

        const splitResult = insertIntoSubtree(node.children[i], key);
        if (splitResult) {
          const { medianKey, leftNode, rightNode } = splitResult;
          node.children.splice(i, 1, leftNode, rightNode);
          node.keys.splice(i, 0, medianKey);

          steps.push({
            tree: cloneBTree(rootCopy),
            activeNodeId: node.id,
            visitedNodeIds: [node.id, leftNode.id, rightNode.id],
            status: `🔄 Promoted median key ${medianKey} to parent Node [ ${node.keys.join(' | ')} ].`
          });

          if (node.keys.length >= bTreeOrder) {
            return splitNode(node);
          }
        }
        return null;
      }
    };

    const rootSplit = insertIntoSubtree(rootCopy, insertVal);
    if (rootSplit) {
      const { medianKey, leftNode, rightNode } = rootSplit;
      const newRoot = new BTreeNode([medianKey], false);
      newRoot.children = [leftNode, rightNode];
      rootCopy = newRoot;
      steps.push({
        tree: cloneBTree(rootCopy),
        activeNodeId: newRoot.id,
        visitedNodeIds: [newRoot.id, leftNode.id, rightNode.id],
        status: `👑 ROOT SPLIT! Promoted median key ${medianKey} to create new Tree Root.`
      });
    }

    setBTreeRoot(rootCopy);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // B-Tree Deletion Operation
  const executeDelete = (val) => {
    if (!bTreeRoot) {
      setAnimStatus('B-Tree is currently empty.');
      return;
    }
    const steps = [];
    const deleteVal = parseInt(val) || (bTreeRoot.keys[0] || 10);
    const rootCopy = cloneBTree(bTreeRoot);

    const deleteFromNode = (node, key) => {
      if (!node) return false;
      const idx = node.keys.indexOf(key);
      if (idx !== -1) {
        node.keys.splice(idx, 1);
        steps.push({
          tree: cloneBTree(rootCopy),
          activeNodeId: node.id,
          visitedNodeIds: [node.id],
          status: `🗑️ Deleted key ${key} from Node block.`
        });
        return true;
      }
      if (!node.isLeaf && node.children.length > 0) {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) i++;
        if (node.children[i]) {
          return deleteFromNode(node.children[i], key);
        }
      }
      return false;
    };

    const found = deleteFromNode(rootCopy, deleteVal);

    if (found) {
      if (rootCopy.keys.length === 0) {
        if (rootCopy.children.length > 0) {
          setBTreeRoot(rootCopy.children[0]);
        } else {
          setBTreeRoot(null);
        }
      } else {
        setBTreeRoot(rootCopy);
      }
    } else {
      steps.push({
        tree: cloneBTree(rootCopy),
        activeNodeId: null,
        visitedNodeIds: [],
        status: `Key ${deleteVal} not found for deletion.`
      });
    }

    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // B-Tree Traversal
  const executeTraversal = (type) => {
    if (!bTreeRoot) {
      setAnimStatus('B-Tree is currently empty.');
      return;
    }
    const steps = [];
    const result = [];
    const visited = [];

    const traverse = (node) => {
      if (!node) return;
      visited.push(node.id);

      if (type === 'preorder') {
        result.push(...node.keys);
        steps.push({
          tree: cloneBTree(bTreeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `🌿 Preorder: Visited Node block [ ${node.keys.join(', ')} ]`
        });
      }

      for (let i = 0; i < node.keys.length; i++) {
        if (!node.isLeaf && node.children[i]) traverse(node.children[i]);
        if (type === 'inorder') {
          result.push(node.keys[i]);
          steps.push({
            tree: cloneBTree(bTreeRoot),
            activeNodeId: node.id,
            activeKeyIdx: i,
            visitedNodeIds: [...visited],
            traversalResult: [...result],
            status: `🌿 Inorder: Traversed key ${node.keys[i]}`
          });
        }
      }

      if (!node.isLeaf && node.children[node.keys.length]) {
        traverse(node.children[node.keys.length]);
      }

      if (type === 'postorder') {
        result.push(...node.keys);
        steps.push({
          tree: cloneBTree(bTreeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `🌿 Postorder: Visited Node block [ ${node.keys.join(', ')} ]`
        });
      }
    };

    traverse(bTreeRoot);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  const handleClearTree = () => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setBTreeRoot(null);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setTraversalResult([]);
    setAnimStatus('B-Tree cleared.');
  };

  // Compute Layout Positions for B-Tree Nodes
  const calculateBTreePositions = (root) => {
    const nodes = [];
    const edges = [];
    if (!root) return { nodes, edges };

    const levelHeight = 90;
    const getSubtreeWidth = (node) => {
      if (!node || node.isLeaf || !node.children || node.children.length === 0) {
        return Math.max(130, (node.keys || []).length * 48 + 36);
      }
      return node.children.reduce((acc, child) => acc + getSubtreeWidth(child), 0);
    };

    const positionNode = (node, x, y, width) => {
      if (!node) return;
      const nodeW = Math.max(90, (node.keys || []).length * 42 + 28);
      nodes.push({ node, x, y, width: nodeW });

      if (!node.isLeaf && node.children && node.children.length > 0) {
        let currX = x - width / 2;
        node.children.forEach((child, childIdx) => {
          const childW = getSubtreeWidth(child);
          const childX = currX + childW / 2;

          let rangeLabel = '';
          const keys = node.keys || [];
          if (childIdx === 0) {
            rangeLabel = `< ${keys[0]}`;
          } else if (childIdx === keys.length) {
            rangeLabel = `> ${keys[keys.length - 1]}`;
          } else if (keys[childIdx - 1] !== undefined && keys[childIdx] !== undefined) {
            rangeLabel = `${keys[childIdx - 1]}–${keys[childIdx]}`;
          }

          const cellW = 42;
          const numKeys = keys.length;
          const blockW = Math.max(75, numKeys * cellW);
          const startX = x - blockW / 2;

          // Calculate distinct pointer origin slot x1 for childIdx:
          let pointerX1;
          if (childIdx === 0) {
            pointerX1 = startX + 12; // left gap of first cell
          } else if (childIdx === numKeys) {
            pointerX1 = startX + blockW - 12; // right gap of last cell
          } else {
            pointerX1 = startX + childIdx * cellW; // exact cell divider line
          }

          edges.push({
            x1: pointerX1,
            y1: y + 23,
            x2: childX,
            y2: y + levelHeight - 24,
            fromId: node.id,
            toId: child.id,
            rangeLabel
          });
          positionNode(child, childX, y + levelHeight, childW);
          currX += childW;
        });
      }
    };

    const totalW = getSubtreeWidth(root);
    positionNode(root, 400, 50, totalW);
    return { nodes, edges };
  };

  const { nodes, edges } = calculateBTreePositions(bTreeRoot);
  const totalNodes = nodes.length;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* TREE MEMORY STAGE HEADER WITH ORDER CONFIGURATION PILLS */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
            <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
              B-TREE DISK INDEX • {totalNodes} NODES
            </span>
          </div>

          {/* ORDER (m) CONFIGURATION SEGMENTED CONTROL */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-mono font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
            <span className="text-[11px] text-[#647895] px-2 uppercase font-extrabold flex items-center gap-1.5 shrink-0">
              <Settings size={12} className="text-[#347f7a]" /> ORDER (M):
            </span>
            {[
              { m: 3, label: 'm = 3' },
              { m: 4, label: 'm = 4' },
              { m: 5, label: 'm = 5' }
            ].map((item) => {
              const isSelected = bTreeOrder === item.m;
              return (
                <button
                  key={item.m}
                  onClick={() => handleOrderChange(item.m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1 ${isSelected ? 'bg-[#347f7a] text-white shadow-2xs' : 'text-[#526b88] hover:text-[#203247] hover:bg-white/60'}`}
                  title={`B-Tree Order m=${item.m} (Max ${item.m - 1} keys per node)`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {totalNodes > 0 && (
          <button
            onClick={handleClearTree}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs shrink-0 ml-auto border ${isDarkMode ? 'text-rose-400 bg-rose-950/30 border-rose-900 hover:bg-rose-900/50' : 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200'}`}
            title="Clear tree"
          >
            <Trash2 size={13} className="inline mr-1" /> Clear Tree
          </button>
        )}
      </div>

      {/* STATUS BANNER */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 shrink-0 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]'} animate-in fade-in slide-in-from-top-1 duration-200`}>
          <Sparkles size={14} className="shrink-0" />
          <span>{animStatus}</span>
        </div>
      )}

      {/* EMPTY STATE OR CANVAS STAGE */}
      {!bTreeRoot ? (
        <div className={`my-6 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/15'}`}>
          <div className={`p-4 rounded-2xl shadow-inner mb-1 ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-[#347f7a]/10 text-[#347f7a]'}`}>
            <Layers size={36} />
          </div>
          <div>
            <h4 className={`text-sm font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-100' : 'text-[#203247]'}`}>B-Tree is Empty</h4>
            <p className={`text-xs max-w-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>No nodes currently allocated in disk index memory. Execute an operation or insert a Root key to begin!</p>
          </div>

          <button
            onClick={() => executeInsert(Math.floor(Math.random() * 85 + 10))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-sm mt-2"
          >
            <Plus size={14} /> Insert Root Key
          </button>
        </div>
      ) : (
        /* SVG CANVAS STAGE WITH FLOATING ZOOM & DRAG PAN */
        <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
          <div
            ref={containerRef}
            onMouseDown={(e) => {
              if (e.button === 0) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
              }
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            className={`w-full flex-1 h-full min-h-[260px] rounded-2xl p-3 overflow-hidden relative flex items-center justify-center shadow-inner select-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border border-slate-700/80' : 'bg-[#faf8f4] border border-[#203247]/15'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {/* FLOATING ZOOM CONTROLS OVERLAY */}
            <div className={`absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-white shadow-xl' : 'bg-white/90 border-[#203247]/15 shadow-md'}`}>
              <button
                onClick={() => setZoomScale(s => Math.min(2.0, s + 0.15))}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
                title="Zoom In (+)"
              >
                <ZoomIn size={15} />
              </button>
              <span className={`font-mono text-[11px] font-extrabold px-1 min-w-[36px] text-center ${isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'}`}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(s => Math.max(0.35, s - 0.15))}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
                title="Zoom Out (-)"
              >
                <ZoomOut size={15} />
              </button>
              <button
                onClick={() => { setZoomScale(1.0); setPanOffset({ x: 0, y: 0 }); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-[#faf8f4] text-[#647895] hover:text-[#347f7a]'}`}
                title="Reset Fit View"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* TRANSFORMABLE CANVAS STAGE */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
              className="w-full flex justify-center items-center"
            >
              <svg width="800" height="340" viewBox="0 0 800 340" className="shrink-0 font-mono text-xs overflow-visible">
                <defs>
                  {/* GLOW FILTER */}
                  <filter id="glow-key" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="activeKeyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#347f7a" />
                    <stop offset="100%" stopColor="#245d58" />
                  </linearGradient>
                </defs>

                {/* CONNECTING CURVED BEZIER BRANCH LINES WITH RANGE LABELS */}
                {edges.map((edge, idx) => {
                  const midY = (edge.y1 + edge.y2) / 2;
                  const midX = (edge.x1 + edge.x2) / 2;
                  const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;
                  const isEdgeVisited = visitedNodeIds.includes(edge.toId);
                  return (
                    <g key={idx}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isEdgeVisited ? '#347f7a' : (isDarkMode ? '#475569' : '#94a3b8')}
                        strokeWidth={isEdgeVisited ? '2.8' : '1.8'}
                        strokeDasharray={isEdgeVisited ? 'none' : '5 4'}
                        opacity="0.85"
                        className="transition-all duration-300"
                      />
                      {/* BRANCH POINTER DOT */}
                      <circle
                        cx={edge.x1}
                        cy={edge.y1}
                        r="3.5"
                        fill={isEdgeVisited ? '#347f7a' : (isDarkMode ? '#64748b' : '#647895')}
                      />

                      {/* SEARCH RANGE PILL BADGE */}
                      {edge.rangeLabel && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-26"
                            y="-9"
                            width="52"
                            height="17"
                            rx="5"
                            fill={isDarkMode ? '#0f172a' : '#ffffff'}
                            stroke={isEdgeVisited ? '#347f7a' : (isDarkMode ? '#334155' : '#cbd5e1')}
                            strokeWidth="1"
                            className="shadow-2xs"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill={isEdgeVisited ? '#347f7a' : (isDarkMode ? '#94a3b8' : '#526b88')}
                            fontSize="9.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {edge.rangeLabel}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* MULTI-KEY B-TREE NODE BLOCKS */}
                {nodes.map(({ node, x, y }) => {
                  const isActive = activeNodeId === node.id;
                  const isVisited = visitedNodeIds.includes(node.id);
                  const cellW = 42;
                  const blockW = Math.max(75, (node.keys || []).length * cellW);
                  const startX = x - blockW / 2;

                  return (
                    <g key={node.id} transform={`translate(${startX}, ${y - 20})`} className="transition-all duration-300">
                      {/* OUTER NODE BLOCK CARD */}
                      <rect
                        x="0"
                        y="0"
                        width={blockW}
                        height="46"
                        rx="14"
                        fill={isActive ? (isDarkMode ? '#065f46' : '#e6f4f1') : isVisited ? (isDarkMode ? '#1e293b' : '#ffffff') : (isDarkMode ? '#0f172a' : '#ffffff')}
                        stroke={isActive ? '#347f7a' : isVisited ? '#10b981' : (isDarkMode ? '#334155' : '#203247')}
                        strokeWidth={isActive ? '2.5' : '1.8'}
                        className="transition-all duration-300 shadow-md"
                      />

                      {/* KEYS & CELL SEPARATORS */}
                      {(node.keys || []).map((k, kIdx) => {
                        const isKeyActive = isActive && activeKeyIdx === kIdx;
                        return (
                          <React.Fragment key={kIdx}>
                            {kIdx > 0 && (
                              <line
                                x1={kIdx * cellW}
                                y1="0"
                                x2={kIdx * cellW}
                                y2="46"
                                stroke={isDarkMode ? '#334155' : '#203247'}
                                strokeWidth="1.2"
                                strokeDasharray="3 3"
                                opacity="0.35"
                              />
                            )}
                            {isKeyActive ? (
                              <rect
                                x={kIdx * cellW + 3}
                                y="3"
                                width={cellW - 6}
                                height="40"
                                rx="10"
                                fill="url(#activeKeyGrad)"
                                filter="url(#glow-key)"
                              />
                            ) : (
                              <rect
                                x={kIdx * cellW + 3}
                                y="3"
                                width={cellW - 6}
                                height="40"
                                rx="10"
                                fill={isDarkMode ? '#1e293b' : '#faf8f4'}
                                opacity="0.5"
                              />
                            )}
                            <text
                              x={kIdx * cellW + cellW / 2}
                              y="28"
                              textAnchor="middle"
                              fill={isKeyActive ? '#ffffff' : (isDarkMode ? '#f8fafc' : '#203247')}
                              fontSize="14.5"
                              fontFamily="monospace"
                              fontWeight="800"
                            >
                              {k}
                            </text>
                          </React.Fragment>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATIONAL EXPLAINER FOOTER CARD - STUDIO VIBE */}
      <div className={`p-3.5 rounded-2xl border shadow-xs shrink-0 font-sans text-xs ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-[#203247]/10 text-[#203247]'}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] shrink-0 animate-pulse"></span>
            <span className={`font-extrabold uppercase tracking-wider text-[11px] ${isDarkMode ? 'text-emerald-400' : 'text-[#203247]'}`}>HOW B-TREES WORK:</span>
            
            <div className={`flex items-center gap-3 text-[11.5px] font-medium flex-wrap ${isDarkMode ? 'text-slate-300' : 'text-[#526b88]'}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border whitespace-nowrap ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/15 text-[#203247]'}`}>
                  1. Multi-Way Branching
                </span>
                <span>Node with <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>k keys</strong> guides searches into <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>k + 1 child paths</strong>.</span>
              </div>

              <span className={`hidden lg:inline ${isDarkMode ? 'text-slate-600' : 'text-[#203247]/20'}`}>•</span>

              <div className="flex items-center gap-1.5 hidden md:flex flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border whitespace-nowrap ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/15 text-[#203247]'}`}>
                  2. Median Split
                </span>
                <span>Full nodes split around middle key to balance height.</span>
              </div>
            </div>
          </div>

          {traversalResult.length > 0 && (
            <div className="flex items-center gap-1.5 font-mono ml-auto">
              <span className="font-bold text-[#347f7a] text-[11px]">{traversalType.toUpperCase()}:</span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#203247] text-white border-[#203247]'}`}>
                [ {traversalResult.join(' → ')} ]
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
