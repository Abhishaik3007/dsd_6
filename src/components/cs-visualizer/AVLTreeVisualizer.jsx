import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sparkles, Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// AVL Tree Node Structure
class AVLTreeNode {
  constructor(val) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

// Helper: Get node height
const getHeight = (node) => (node ? node.height : 0);

// Helper: Get Balance Factor (BF = height(Left) - height(Right))
const getBalanceFactor = (node) => (node ? getHeight(node.left) - getHeight(node.right) : 0);

// Update node height based on children
const updateNodeHeight = (node) => {
  if (node) {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  }
};

// Deep clone AVL Tree structure for step snapshots with ID preservation
const cloneAVLTree = (node) => {
  if (!node) return null;
  const newNode = new AVLTreeNode(node.val);
  newNode.id = node.id;
  newNode.height = node.height;
  newNode.left = cloneAVLTree(node.left);
  newNode.right = cloneAVLTree(node.right);
  return newNode;
};

export const AVLTreeVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  // Initial Balanced AVL Tree
  const [treeRoot, setTreeRoot] = useState(() => {
    const root = new AVLTreeNode(30);
    root.left = new AVLTreeNode(20);
    root.right = new AVLTreeNode(40);
    root.left.left = new AVLTreeNode(10);
    root.right.right = new AVLTreeNode(50);
    updateNodeHeight(root.left);
    updateNodeHeight(root.right);
    updateNodeHeight(root);
    return root;
  });

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [rotatingNodeIds, setRotatingNodeIds] = useState([]);
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

    if (step.tree !== undefined) setTreeRoot(step.tree);
    if (step.activeNodeId !== undefined) setActiveNodeId(step.activeNodeId);
    if (step.visitedNodeIds) setVisitedNodeIds(step.visitedNodeIds);
    setRotatingNodeIds(step.rotatingNodeIds || []);
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
      setRotatingNodeIds([]);
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ currentStep: 0, totalSteps: 1, isPlaying: false });
      }
      return;
    }

    animTimerRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animTimerRef.current);
        setRotatingNodeIds([]);
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
        setRotatingNodeIds([]);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ currentStep: steps.length - 1, totalSteps: steps.length, isPlaying: false });
        }
      }
    }, Math.max(450, 950 / playbackSpeed));
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

  // Right Rotation (Single Right - LL Imbalance)
  const rotateRight = (y) => {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    updateNodeHeight(y);
    updateNodeHeight(x);

    return x;
  };

  // Left Rotation (Single Left - RR Imbalance)
  const rotateLeft = (x) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateNodeHeight(x);
    updateNodeHeight(y);

    return y;
  };

  // AVL Search Operation
  const executeSearch = (val) => {
    if (!treeRoot) {
      setAnimStatus('AVL Tree is currently empty. Insert a node to begin!');
      return;
    }
    const searchVal = parseInt(val) || 30;
    const steps = [];
    const visited = [];

    const searchNode = (node) => {
      if (!node) return false;
      visited.push(node.id);
      const bf = getBalanceFactor(node);

      steps.push({
        tree: cloneAVLTree(treeRoot),
        activeNodeId: node.id,
        visitedNodeIds: [...visited],
        rotatingNodeIds: [],
        status: `🔍 Inspecting Node ${node.val} (Height: ${node.height}, Balance Factor: ${bf >= 0 ? '+' + bf : bf})`
      });

      if (node.val === searchVal) {
        steps.push({
          tree: cloneAVLTree(treeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          rotatingNodeIds: [],
          status: `🎯 Found Key ${searchVal} in AVL Tree!`
        });
        return true;
      }

      if (searchVal < node.val) {
        if (!node.left) {
          steps.push({
            tree: cloneAVLTree(treeRoot),
            activeNodeId: null,
            visitedNodeIds: [...visited],
            rotatingNodeIds: [],
            status: `❌ Key ${searchVal} < ${node.val}, but left child is NULL.`
          });
          return false;
        }
        return searchNode(node.left);
      } else {
        if (!node.right) {
          steps.push({
            tree: cloneAVLTree(treeRoot),
            activeNodeId: null,
            visitedNodeIds: [...visited],
            rotatingNodeIds: [],
            status: `❌ Key ${searchVal} > ${node.val}, but right child is NULL.`
          });
          return false;
        }
        return searchNode(node.right);
      }
    };

    searchNode(treeRoot);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // AVL Insertion with In-Place Connected Snapshots
  const executeInsert = (val) => {
    const insertVal = parseInt(val) || Math.floor(Math.random() * 85 + 10);
    const steps = [];

    if (!treeRoot) {
      const newRoot = new AVLTreeNode(insertVal);
      setTreeRoot(newRoot);
      stepsHistoryRef.current = [{
        tree: cloneAVLTree(newRoot),
        activeNodeId: newRoot.id,
        visitedNodeIds: [newRoot.id],
        rotatingNodeIds: [],
        status: `✅ Inserted key ${insertVal} as Root.`
      }];
      startAnimationTimer(stepsHistoryRef.current);
      return;
    }

    let rootCopy = cloneAVLTree(treeRoot);

    // Phase 1: Search and Traverse Down to Leaf
    const path = [];
    let curr = rootCopy;
    let parent = null;
    let isDuplicate = false;

    steps.push({
      tree: cloneAVLTree(rootCopy),
      activeNodeId: curr.id,
      visitedNodeIds: [curr.id],
      rotatingNodeIds: [],
      status: `⚡ Inserting key ${insertVal}...`
    });

    while (curr) {
      path.push(curr);
      if (insertVal === curr.val) {
        isDuplicate = true;
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: curr.id,
          visitedNodeIds: path.map(n => n.id),
          rotatingNodeIds: [],
          status: `⚠️ Key ${insertVal} already exists. Duplicates ignored.`
        });
        break;
      }

      parent = curr;
      if (insertVal < curr.val) {
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: curr.id,
          visitedNodeIds: path.map(n => n.id),
          rotatingNodeIds: [],
          status: `🔍 ${insertVal} < ${curr.val} → Traversing left...`
        });
        curr = curr.left;
      } else {
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: curr.id,
          visitedNodeIds: path.map(n => n.id),
          rotatingNodeIds: [],
          status: `🔍 ${insertVal} > ${curr.val} → Traversing right...`
        });
        curr = curr.right;
      }
    }

    if (isDuplicate) {
      stepsHistoryRef.current = steps;
      startAnimationTimer(steps);
      return;
    }

    // Phase 2: Create and Attach New Node
    const newNode = new AVLTreeNode(insertVal);
    if (insertVal < parent.val) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    path.push(newNode);

    steps.push({
      tree: cloneAVLTree(rootCopy),
      activeNodeId: newNode.id,
      visitedNodeIds: path.map(n => n.id),
      rotatingNodeIds: [],
      status: `✅ Attached node ${insertVal}.`
    });

    // Phase 3: Bottom-up height updates & rotation checks
    for (let i = path.length - 2; i >= 0; i--) {
      const ancNode = path[i];
      updateNodeHeight(ancNode);
      const bf = getBalanceFactor(ancNode);

      steps.push({
        tree: cloneAVLTree(rootCopy),
        activeNodeId: ancNode.id,
        visitedNodeIds: path.map(n => n.id),
        rotatingNodeIds: [],
        status: `📐 Checking Node ${ancNode.val}: BF = ${bf >= 0 ? '+' + bf : bf}`
      });

      if (Math.abs(bf) > 1) {
        const ancParent = i > 0 ? path[i - 1] : null;
        const setSubtreeRoot = (newSubRoot) => {
          if (!ancParent) {
            rootCopy = newSubRoot;
          } else if (ancParent.left === ancNode) {
            ancParent.left = newSubRoot;
          } else {
            ancParent.right = newSubRoot;
          }
        };

        // 1. LL Case (Single Right Rotation)
        if (bf > 1 && getBalanceFactor(ancNode.left) >= 0) {
          const leftChild = ancNode.left;
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.id,
            visitedNodeIds: [ancNode.id],
            rotatingNodeIds: [ancNode.id, leftChild.id],
            status: `🔄 LL Imbalance detected at Node ${ancNode.val} (BF = +${bf})! Pivot child Node ${leftChild.val} will rise.`
          });

          const rotated = rotateRight(ancNode);
          setSubtreeRoot(rotated);

          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: rotated.id,
            visitedNodeIds: [rotated.id],
            rotatingNodeIds: [rotated.id],
            status: `✨ LL Single Right Rotation complete! Subtree root is now Node ${rotated.val} (BF = 0).`
          });
        }
        // 2. RR Case (Single Left Rotation)
        else if (bf < -1 && getBalanceFactor(ancNode.right) <= 0) {
          const rightChild = ancNode.right;
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.id,
            visitedNodeIds: [ancNode.id],
            rotatingNodeIds: [ancNode.id, rightChild.id],
            status: `🔄 RR Imbalance detected at Node ${ancNode.val} (BF = ${bf})! Pivot child Node ${rightChild.val} will rise.`
          });

          const rotated = rotateLeft(ancNode);
          setSubtreeRoot(rotated);

          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: rotated.id,
            visitedNodeIds: [rotated.id],
            rotatingNodeIds: [rotated.id],
            status: `✨ RR Single Left Rotation complete! Subtree root is now Node ${rotated.val} (BF = 0).`
          });
        }
        // 3. LR Case (Double Left-Right Rotation)
        else if (bf > 1 && getBalanceFactor(ancNode.left) < 0) {
          const leftChild = ancNode.left;
          const grandchild = leftChild.right;
          
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.id,
            visitedNodeIds: [ancNode.id],
            rotatingNodeIds: [ancNode.id, leftChild.id, grandchild ? grandchild.id : null].filter(Boolean),
            status: `🔄 LR (Left-Right) Zigzag Imbalance at Node ${ancNode.val}! Initiating 2-Step Double Rotation.`
          });

          // Step 1: Left rotate child
          ancNode.left = rotateLeft(leftChild);
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.left.id,
            visitedNodeIds: [ancNode.left.id],
            rotatingNodeIds: [ancNode.left.id],
            status: `🔄 Step 1/2: Left-rotated child Node ${leftChild.val} around ${ancNode.left.val} → Converted to Left-Left (LL) shape!`
          });

          // Step 2: Right rotate parent
          const rotated = rotateRight(ancNode);
          setSubtreeRoot(rotated);
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: rotated.id,
            visitedNodeIds: [rotated.id],
            rotatingNodeIds: [rotated.id],
            status: `✨ Step 2/2: Right-rotated Node ${ancNode.val} around ${rotated.val} → Restored AVL balance with root Node ${rotated.val}!`
          });
        }
        // 4. RL Case (Double Right-Left Rotation)
        else if (bf < -1 && getBalanceFactor(ancNode.right) > 0) {
          const rightChild = ancNode.right;
          const grandchild = rightChild.left;

          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.id,
            visitedNodeIds: [ancNode.id],
            rotatingNodeIds: [ancNode.id, rightChild.id, grandchild ? grandchild.id : null].filter(Boolean),
            status: `🔄 RL (Right-Left) Zigzag Imbalance at Node ${ancNode.val}! Initiating 2-Step Double Rotation.`
          });

          // Step 1: Right rotate child
          ancNode.right = rotateRight(rightChild);
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: ancNode.right.id,
            visitedNodeIds: [ancNode.right.id],
            rotatingNodeIds: [ancNode.right.id],
            status: `🔄 Step 1/2: Right-rotated child Node ${rightChild.val} around ${ancNode.right.val} → Converted to Right-Right (RR) shape!`
          });

          // Step 2: Left rotate parent
          const rotated = rotateLeft(ancNode);
          setSubtreeRoot(rotated);
          steps.push({
            tree: cloneAVLTree(rootCopy),
            activeNodeId: rotated.id,
            visitedNodeIds: [rotated.id],
            rotatingNodeIds: [rotated.id],
            status: `✨ Step 2/2: Left-rotated Node ${ancNode.val} around ${rotated.val} → Restored AVL balance with root Node ${rotated.val}!`
          });
        }

        // Final step: Balance restored
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: null,
          visitedNodeIds: [],
          rotatingNodeIds: [],
          status: `🌟 AVL Tree balance successfully restored.`
        });

        break;
      }
    }

    setTreeRoot(rootCopy);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // AVL Deletion Operation with Rebalancing
  const executeDelete = (val) => {
    if (!treeRoot) {
      setAnimStatus('AVL Tree is currently empty.');
      return;
    }
    const deleteVal = parseInt(val) || treeRoot.val;
    const steps = [];
    let rootCopy = cloneAVLTree(treeRoot);

    const getMinValueNode = (node) => {
      let curr = node;
      while (curr.left) curr = curr.left;
      return curr;
    };

    const deleteNode = (node, key) => {
      if (!node) {
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: null,
          status: `Key ${key} not found.`
        });
        return null;
      }

      if (key < node.val) {
        node.left = deleteNode(node.left, key);
      } else if (key > node.val) {
        node.right = deleteNode(node.right, key);
      } else {
        steps.push({
          tree: cloneAVLTree(rootCopy),
          activeNodeId: node.id,
          visitedNodeIds: [node.id],
          status: `🗑️ Target Key ${key} located for deletion.`
        });

        if (!node.left || !node.right) {
          const temp = node.left ? node.left : node.right;
          if (!temp) {
            node = null;
          } else {
            node = temp;
          }
        } else {
          const temp = getMinValueNode(node.right);
          node.val = temp.val;
          node.right = deleteNode(node.right, temp.val);
        }
      }

      if (!node) return null;

      updateNodeHeight(node);
      const balance = getBalanceFactor(node);

      if (balance > 1 && getBalanceFactor(node.left) >= 0) return rotateRight(node);
      if (balance > 1 && getBalanceFactor(node.left) < 0) {
        node.left = rotateLeft(node.left);
        return rotateRight(node);
      }
      if (balance < -1 && getBalanceFactor(node.right) <= 0) return rotateLeft(node);
      if (balance < -1 && getBalanceFactor(node.right) > 0) {
        node.right = rotateRight(node.right);
        return rotateLeft(node);
      }

      return node;
    };

    rootCopy = deleteNode(rootCopy, deleteVal);
    setTreeRoot(rootCopy);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  // AVL Traversals
  const executeTraversal = (type) => {
    if (!treeRoot) {
      setAnimStatus('AVL Tree is currently empty.');
      return;
    }
    const steps = [];
    const result = [];
    const visited = [];

    const traverse = (node) => {
      if (!node) return;
      visited.push(node.id);

      if (type === 'preorder') {
        result.push(node.val);
        steps.push({
          tree: cloneAVLTree(treeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `🌿 Preorder: Visited Node ${node.val}`
        });
      }

      if (node.left) traverse(node.left);

      if (type === 'inorder') {
        result.push(node.val);
        steps.push({
          tree: cloneAVLTree(treeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `🌿 Inorder: Traversed Node ${node.val}`
        });
      }

      if (node.right) traverse(node.right);

      if (type === 'postorder') {
        result.push(node.val);
        steps.push({
          tree: cloneAVLTree(treeRoot),
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `🌿 Postorder: Visited Node ${node.val}`
        });
      }
    };

    traverse(treeRoot);
    stepsHistoryRef.current = steps;
    startAnimationTimer(steps);
  };

  const handleClearTree = () => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setTreeRoot(null);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setRotatingNodeIds([]);
    setTraversalResult([]);
    setAnimStatus('AVL Tree cleared.');
  };

  // Compute Layout Positions for Binary AVL Tree Nodes
  const calculateAVLPositions = (root) => {
    const nodes = [];
    const edges = [];
    if (!root) return { nodes, edges };

    const levelHeight = 75;
    const getSubtreeWidth = (node) => {
      if (!node) return 60;
      if (!node.left && !node.right) return 70;
      return getSubtreeWidth(node.left) + getSubtreeWidth(node.right);
    };

    const positionNode = (node, x, y, width) => {
      if (!node) return;
      nodes.push({ node, x, y });

      if (node.left) {
        const leftW = getSubtreeWidth(node.left);
        const leftX = x - width / 2 + leftW / 2;
        edges.push({ x1: x, y1: y + 20, x2: leftX, y2: y + levelHeight - 20, fromId: node.id, toId: node.left.id });
        positionNode(node.left, leftX, y + levelHeight, leftW);
      }

      if (node.right) {
        const rightW = getSubtreeWidth(node.right);
        const rightX = x + width / 2 - rightW / 2;
        edges.push({ x1: x, y1: y + 20, x2: rightX, y2: y + levelHeight - 20, fromId: node.id, toId: node.right.id });
        positionNode(node.right, rightX, y + levelHeight, rightW);
      }
    };

    const totalW = getSubtreeWidth(root);
    positionNode(root, 400, 50, totalW);
    return { nodes, edges };
  };

  const { nodes, edges } = calculateAVLPositions(treeRoot);
  const totalNodes = nodes.length;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* STAGE HEADER */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
          <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
            AVL TREE (SELF-BALANCING BST) • {totalNodes} NODES
          </span>
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
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]'} animate-in fade-in slide-in-from-top-1 duration-200`}>
          <Sparkles size={14} className="shrink-0" />
          <span>{animStatus}</span>
        </div>
      )}

      {/* EMPTY STATE OR CANVAS STAGE */}
      {!treeRoot ? (
        <div className={`my-6 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/15'}`}>
          <div className={`p-4 rounded-2xl shadow-inner mb-1 ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-[#347f7a]/10 text-[#347f7a]'}`}>
            <Layers size={36} />
          </div>
          <div>
            <h4 className={`text-sm font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-100' : 'text-[#203247]'}`}>AVL Tree is Empty</h4>
            <p className={`text-xs max-w-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>No nodes currently allocated in memory stage. Execute an operation or insert a Root node to begin!</p>
          </div>

          <button
            onClick={() => executeInsert(Math.floor(Math.random() * 85 + 10))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-sm mt-2"
          >
            <Plus size={14} /> Insert Root Node
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
                  <filter id="glow-avl" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="avlActiveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#347f7a" />
                    <stop offset="100%" stopColor="#245d58" />
                  </linearGradient>
                </defs>

                {/* CONNECTING BEZIER BRANCH LINES WITH SMOOTH MORPHING */}
                {edges.map((edge) => {
                  const midY = (edge.y1 + edge.y2) / 2;
                  const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;
                  const isEdgeVisited = visitedNodeIds.includes(edge.toId);
                  return (
                    <path
                      key={`${edge.fromId}-${edge.toId}`}
                      d={pathD}
                      fill="none"
                      stroke={isEdgeVisited ? '#347f7a' : (isDarkMode ? '#475569' : '#94a3b8')}
                      strokeWidth={isEdgeVisited ? '2.8' : '1.8'}
                      strokeDasharray={isEdgeVisited ? 'none' : '4 4'}
                      opacity="0.85"
                      style={{
                        transition: 'd 0.55s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.3s ease'
                      }}
                    />
                  );
                })}

                {/* AVL TREE NODES WITH BALANCED BADGES */}
                {nodes.map(({ node, x, y }) => {
                  const isActive = activeNodeId === node.id;
                  const isVisited = visitedNodeIds.includes(node.id);
                  const isRotating = rotatingNodeIds.includes(node.id);
                  const bf = getBalanceFactor(node);
                  const isImbalanced = Math.abs(bf) > 1;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${x}, ${y})`}
                      style={{
                        transition: 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    >
                      {/* ROTATION HIGHLIGHT GLOW */}
                      {isRotating && (
                        <circle
                          r="27"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                          opacity="0.9"
                        />
                      )}

                      {/* MAIN NODE CIRCLE */}
                      <circle
                        r="22"
                        fill={isActive ? 'url(#avlActiveGrad)' : isVisited ? (isDarkMode ? '#1e293b' : '#ffffff') : (isDarkMode ? '#0f172a' : '#ffffff')}
                        stroke={isImbalanced ? '#f43f5e' : isRotating ? '#f59e0b' : isActive ? '#347f7a' : isVisited ? '#10b981' : (isDarkMode ? '#334155' : '#203247')}
                        strokeWidth={isActive || isImbalanced || isRotating ? '2.8' : '1.8'}
                        filter={isActive ? 'url(#glow-avl)' : 'none'}
                        className="transition-colors duration-200 shadow-md"
                      />

                      {/* NODE VALUE */}
                      <text
                        y="5"
                        textAnchor="middle"
                        fill={isActive ? '#ffffff' : (isDarkMode ? '#f8fafc' : '#203247')}
                        fontSize="14"
                        fontFamily="monospace"
                        fontWeight="800"
                      >
                        {node.val}
                      </text>

                      {/* HEIGHT & BALANCE FACTOR MICRO BADGE - RENDERED IN FRONT */}
                      <g transform="translate(19, -16)">
                        <rect
                          x="-20"
                          y="-9"
                          width="40"
                          height="18"
                          rx="6"
                          fill={isImbalanced ? (isDarkMode ? '#7f1d1d' : '#ffe4e6') : (isDarkMode ? '#1e293b' : '#ffffff')}
                          stroke={isImbalanced ? '#f43f5e' : isRotating ? '#f59e0b' : (isDarkMode ? '#334155' : '#203247')}
                          strokeWidth="1.2"
                          className="shadow-sm"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill={isImbalanced ? '#e11d48' : isRotating ? '#d97706' : (isDarkMode ? '#34d399' : '#347f7a')}
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="800"
                        >
                          {bf >= 0 ? `+${bf}` : `${bf}`}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATIONAL EXPLAINER FOOTER CARD */}
      <div className={`p-3.5 rounded-2xl border shadow-xs shrink-0 font-sans text-xs ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-[#203247]/10 text-[#203247]'}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] shrink-0 animate-pulse"></span>
            <span className={`font-extrabold uppercase tracking-wider text-[11px] ${isDarkMode ? 'text-emerald-400' : 'text-[#203247]'}`}>HOW AVL TREES WORK:</span>
            
            <div className={`flex items-center gap-3 text-[11.5px] font-medium flex-wrap ${isDarkMode ? 'text-slate-300' : 'text-[#526b88]'}`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border whitespace-nowrap ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/15 text-[#203247]'}`}>
                  1. Strict Balance (-1, 0, +1)
                </span>
                <span>Balance Factor = <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>Height(Left) - Height(Right)</strong>.</span>
              </div>

              <span className={`hidden lg:inline ${isDarkMode ? 'text-slate-600' : 'text-[#203247]/20'}`}>•</span>

              <div className="flex items-center gap-1.5 hidden md:flex flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border whitespace-nowrap ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-[#faf8f4] border-[#203247]/15 text-[#203247]'}`}>
                  2. Rotations (LL, RR, LR, RL)
                </span>
                <span>Executes single or double rotations whenever <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>|BF| &gt; 1</strong> to guarantee O(log n) height.</span>
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
