import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Sparkles, Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// BST / Red-Black Tree Node Structure Class
class TreeNode {
  constructor(value, color = 'BLACK', address) {
    this.value = value;
    this.color = color; // 'RED' | 'BLACK'
    this.address = address || `0x${Math.floor(0x3000 + Math.random() * 0x0ffe).toString(16).toUpperCase()}`;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substring(2, 9);
  }
}

export const TreeVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  dsType = 'tree',
  isDarkMode = false
}) => {
  // Default Tree structure
  const [treeData, setTreeData] = useState(() => {
    if (dsType === 'red-black-tree') {
      const root = new TreeNode(50, 'BLACK', '0x3004');
      root.left = new TreeNode(30, 'BLACK', '0x3028');
      root.right = new TreeNode(70, 'BLACK', '0x3050');
      root.left.left = new TreeNode(20, 'RED', '0x3074');
      root.left.right = new TreeNode(40, 'RED', '0x3098');
      root.right.left = new TreeNode(60, 'RED', '0x30BC');
      root.right.right = new TreeNode(80, 'RED', '0x30E0');
      return root;
    }
    const root = new TreeNode(50, 'BLACK', '0x3004');
    root.left = new TreeNode(30, 'BLACK', '0x3028');
    root.right = new TreeNode(70, 'BLACK', '0x3050');
    root.left.left = new TreeNode(20, 'BLACK', '0x3074');
    root.left.right = new TreeNode(40, 'BLACK', '0x3098');
    root.right.left = new TreeNode(60, 'BLACK', '0x30BC');
    root.right.right = new TreeNode(80, 'BLACK', '0x30E0');
    return root;
  });

  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState([]);
  const [traversalType, setTraversalType] = useState('inorder'); // 'inorder' | 'preorder' | 'postorder'
  const [traversalResult, setTraversalResult] = useState([]);
  const [animStatus, setAnimStatus] = useState(null);
  const [firstValInput, setFirstValInput] = useState('');
  const [isShake, setIsShake] = useState(false);

  // Zoom & Pan interactive state
  const [zoomScale, setZoomScale] = useState(1.0); // 100% sharp fit view by default
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Step playback state
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);

  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.treeData) setTreeData(step.treeData);
    if (step.activeNodeId !== undefined) setActiveNodeId(step.activeNodeId);
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
    } else if (type === 'inorder') {
      executeTraversal('inorder');
    } else if (type === 'preorder') {
      executeTraversal('preorder');
    } else if (type === 'postorder') {
      executeTraversal('postorder');
    } else if (type === 'clear') {
      handleClearTree();
    }
  }, [externalOp]);

  // Count total nodes recursively
  const countNodes = (node) => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  // Get max tree depth recursively
  const getTreeDepth = (node) => {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
  };

  // Helper to clone a Red-Black Tree node structure with parent links
  const cloneRBNode = (node, parent = null) => {
    if (!node) return null;
    const newNode = new TreeNode(node.value, node.color, node.address);
    newNode.id = node.id;
    newNode.parent = parent;
    newNode.left = cloneRBNode(node.left, newNode);
    newNode.right = cloneRBNode(node.right, newNode);
    return newNode;
  };

  // RED-BLACK TREE INSERTION & AUTO-BALANCING RECOLORING/ROTATIONS ENGINE
  const executeRedBlackInsert = (val) => {
    if (!treeData) {
      const root = new TreeNode(val, 'BLACK');
      setTreeData(root);
      setActiveNodeId(root.id);
      setAnimStatus(`Initialized Red-Black Tree with ROOT node (${val}). Color: BLACK.`);
      return;
    }

    const steps = [];
    const visited = [];

    // Clone working tree root
    let root = cloneRBNode(treeData);

    // 1. Standard BST Insert with new node Z colored RED
    let z = new TreeNode(val, 'RED');
    let y = null;
    let x = root;

    while (x !== null) {
      y = x;
      visited.push(x.id);
      steps.push({
        treeData: cloneRBNode(root),
        activeNodeId: x.id,
        visitedNodeIds: [...visited],
        status: `Step 1: Placement. Comparing (${val}) with current node (${x.value}).`
      });

      if (val < x.value) {
        x = x.left;
      } else if (val > x.value) {
        x = x.right;
      } else {
        steps.push({
          treeData: cloneRBNode(root),
          activeNodeId: x.id,
          visitedNodeIds: [...visited],
          status: `⚠️ Node (${val}) already exists in Red-Black Tree. Duplicate ignored!`
        });
        stepsHistoryRef.current = steps;
        applyStepSnapshot(0);
        return;
      }
    }

    z.parent = y;
    if (y === null) {
      root = z;
    } else if (val < y.value) {
      y.left = z;
    } else {
      y.right = z;
    }

    visited.push(z.id);
    steps.push({
      treeData: cloneRBNode(root),
      activeNodeId: z.id,
      visitedNodeIds: [...visited],
      status: `Inserted node (${val}) as RED leaf.`
    });

    // 2. Fixup Red-Black Tree Invariants (Recoloring & Rotations)
    const rotateLeft = (node) => {
      const r = node.right;
      if (!r) return;
      node.right = r.left;
      if (r.left !== null) r.left.parent = node;
      r.parent = node.parent;
      if (node.parent === null) {
        root = r;
      } else if (node === node.parent.left) {
        node.parent.left = r;
      } else {
        node.parent.right = r;
      }
      r.left = node;
      node.parent = r;
    };

    const rotateRight = (node) => {
      const l = node.left;
      if (!l) return;
      node.left = l.right;
      if (l.right !== null) l.right.parent = node;
      l.parent = node.parent;
      if (node.parent === null) {
        root = l;
      } else if (node === node.parent.right) {
        node.parent.right = l;
      } else {
        node.parent.left = l;
      }
      l.right = node;
      node.parent = l;
    };

    let curr = z;
    while (curr.parent !== null && curr.parent.color === 'RED') {
      const grandParent = curr.parent.parent;
      if (!grandParent) break;

      if (curr.parent === grandParent.left) {
        const uncle = grandParent.right;
        if (uncle !== null && uncle.color === 'RED') {
          // Case 1: Uncle is RED -> Recolor parent, uncle, grandparent
          curr.parent.color = 'BLACK';
          uncle.color = 'BLACK';
          grandParent.color = 'RED';
          steps.push({
            treeData: cloneRBNode(root),
            activeNodeId: grandParent.id,
            visitedNodeIds: [curr.id, curr.parent.id, uncle.id, grandParent.id],
            status: `🔴 Double-RED Violation! Case 1: Uncle (${uncle.value}) is RED. Recolored Parent & Uncle to BLACK, Grandparent (${grandParent.value}) to RED.`
          });
          curr = grandParent;
        } else {
          // Case 2: Uncle is BLACK & curr is right child (Triangle shape)
          if (curr === curr.parent.right) {
            curr = curr.parent;
            rotateLeft(curr);
            steps.push({
              treeData: cloneRBNode(root),
              activeNodeId: curr.id,
              visitedNodeIds: [curr.id],
              status: `🔄 Case 2 (Triangle): Performed Left-Rotation on (${curr.value}) to align branches.`
            });
          }
          // Case 3: Line shape -> Recolor & Right-Rotate grandparent
          curr.parent.color = 'BLACK';
          grandParent.color = 'RED';
          rotateRight(grandParent);
          steps.push({
            treeData: cloneRBNode(root),
            activeNodeId: curr.parent.id,
            visitedNodeIds: [curr.parent.id, grandParent.id],
            status: `🔄 Case 3 (Line): Recolored Parent to BLACK, Grandparent to RED & Right-Rotated on (${grandParent.value}).`
          });
        }
      } else {
        const uncle = grandParent.left;
        if (uncle !== null && uncle.color === 'RED') {
          // Case 1: Uncle is RED -> Recolor
          curr.parent.color = 'BLACK';
          uncle.color = 'BLACK';
          grandParent.color = 'RED';
          steps.push({
            treeData: cloneRBNode(root),
            activeNodeId: grandParent.id,
            visitedNodeIds: [curr.id, curr.parent.id, uncle.id, grandParent.id],
            status: `🔴 Double-RED Violation! Case 1: Uncle (${uncle.value}) is RED. Recolored Parent & Uncle to BLACK, Grandparent (${grandParent.value}) to RED.`
          });
          curr = grandParent;
        } else {
          // Case 2: Triangle
          if (curr === curr.parent.left) {
            curr = curr.parent;
            rotateRight(curr);
            steps.push({
              treeData: cloneRBNode(root),
              activeNodeId: curr.id,
              visitedNodeIds: [curr.id],
              status: `🔄 Case 2 (Triangle): Performed Right-Rotation on (${curr.value}) to align branches.`
            });
          }
          // Case 3: Line
          curr.parent.color = 'BLACK';
          grandParent.color = 'RED';
          rotateLeft(grandParent);
          steps.push({
            treeData: cloneRBNode(root),
            activeNodeId: curr.parent.id,
            visitedNodeIds: [curr.parent.id, grandParent.id],
            status: `🔄 Case 3 (Line): Recolored Parent to BLACK, Grandparent to RED & Left-Rotated on (${grandParent.value}).`
          });
        }
      }
    }

    // Root is ALWAYS BLACK
    if (root) {
      root.color = 'BLACK';
    }

    steps.push({
      treeData: cloneRBNode(root),
      activeNodeId: root ? root.id : null,
      visitedNodeIds: [],
      status: `🎉 Red-Black Tree balanced! Root (${root ? root.value : val}) is BLACK. All 5 Red-Black invariants satisfied.`
    });

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    const timer = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(timer);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(timer);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 700 / playbackSpeed);
  };

  // INSERT BST NODE WITH STEP ANIMATION
  const executeInsert = (val) => {
    if (dsType === 'red-black-tree') {
      executeRedBlackInsert(val);
      return;
    }
    if (!treeData) {
      const root = new TreeNode(val, 'BLACK');
      setTreeData(root);
      setActiveNodeId(root.id);
      setAnimStatus(`Initialized ${dsType === 'red-black-tree' ? 'Red-Black' : 'Binary Search'} Tree with ROOT node (${val}).`);
      return;
    }

    const steps = [];
    const visited = [];

    const insertNode = (current, value) => {
      visited.push(current.id);
      steps.push({
        activeNodeId: current.id,
        visitedNodeIds: [...visited],
        status: `Comparing ${value} with current node (${current.value})...`
      });

      if (value < current.value) {
        if (!current.left) {
          const newNode = new TreeNode(value, dsType === 'red-black-tree' ? 'RED' : 'BLACK');
          current.left = newNode;
          visited.push(newNode.id);
          steps.push({
            activeNodeId: newNode.id,
            visitedNodeIds: [...visited],
            status: `Successfully inserted node(${value}) into left branch of (${current.value}).`
          });
        } else {
          insertNode(current.left, value);
        }
      } else if (value > current.value) {
        if (!current.right) {
          const newNode = new TreeNode(value, dsType === 'red-black-tree' ? 'RED' : 'BLACK');
          current.right = newNode;
          visited.push(newNode.id);
          steps.push({
            activeNodeId: newNode.id,
            visitedNodeIds: [...visited],
            status: `Successfully inserted node(${value}) into right branch of (${current.value}).`
          });
        } else {
          insertNode(current.right, value);
        }
      } else {
        steps.push({
          activeNodeId: current.id,
          visitedNodeIds: [...visited],
          status: `⚠️ Node with value (${value}) already exists in the Binary Search Tree!`
        });
      }
    };

    const newTree = JSON.parse(JSON.stringify(treeData));
    insertNode(newTree, val);

    stepsHistoryRef.current = steps;
    currentStepRef.current = 0;
    setTreeData(newTree);
    applyStepSnapshot(0);

    let stepIdx = 0;
    const timer = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        applyStepSnapshot(stepIdx);
      } else {
        clearInterval(timer);
      }
    }, 700 / playbackSpeed);
  };

  // EXECUTE TREE TRAVERSALS (INORDER, PREORDER, POSTORDER) WITH STEP ANIMATIONS
  const executeTraversal = (type = 'inorder') => {
    if (!treeData) {
      setIsShake(true);
      setAnimStatus('⚠️ Tree is empty! Cannot perform traversal.');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    setTraversalType(type);
    const steps = [];
    const visited = [];
    const result = [];

    const traverse = (node) => {
      if (!node) return;

      if (type === 'preorder') {
        visited.push(node.id);
        result.push(node.value);
        steps.push({
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `Pre-Order Traversal: Processed Root node (${node.value}). Path: [ ${result.join(', ')} ].`
        });
        traverse(node.left);
        traverse(node.right);
      } else if (type === 'inorder') {
        traverse(node.left);
        visited.push(node.id);
        result.push(node.value);
        steps.push({
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `In-Order Traversal: Visited left subtree, processed node (${node.value}). Path: [ ${result.join(', ')} ].`
        });
        traverse(node.right);
      } else if (type === 'postorder') {
        traverse(node.left);
        traverse(node.right);
        visited.push(node.id);
        result.push(node.value);
        steps.push({
          activeNodeId: node.id,
          visitedNodeIds: [...visited],
          traversalResult: [...result],
          status: `Post-Order Traversal: Visited subtrees, processed node (${node.value}). Path: [ ${result.join(', ')} ].`
        });
      }
    };

    traverse(treeData);

    steps.push({
      activeNodeId: null,
      visitedNodeIds: [...visited],
      traversalResult: [...result],
      status: `🎉 Completed ${type.toUpperCase()} Traversal: Final Sequence = [ ${result.join(' ➔ ')} ].`
    });

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    const timer = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(timer);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(timer);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 700 / playbackSpeed);
  };

  // SEARCH BST NODE
  const executeSearch = (val) => {
    if (!treeData) {
      setIsShake(true);
      setAnimStatus('⚠️ Binary Search Tree is empty!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const visited = [];

    const searchNode = (current, value) => {
      if (!current) {
        setAnimStatus(`❌ Value (${value}) not found in the Binary Search Tree.`);
        return;
      }

      visited.push(current.id);
      setActiveNodeId(current.id);
      setVisitedNodeIds([...visited]);
      setAnimStatus(`Searching value (${value}): Checking node (${current.value})...`);

      if (value === current.value) {
        setAnimStatus(`✅ FOUND value (${value}) at memory address ${current.address}!`);
        return;
      }

      setTimeout(() => {
        if (value < current.value) {
          searchNode(current.left, value);
        } else {
          searchNode(current.right, value);
        }
      }, 700 / playbackSpeed);
    };

    searchNode(treeData, val);
  };

  // DELETE BST NODE
  const executeDelete = (val) => {
    if (!treeData) {
      setIsShake(true);
      setAnimStatus('⚠️ Binary Search Tree is empty!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const deleteNode = (root, value) => {
      if (!root) return null;

      if (value < root.value) {
        root.left = deleteNode(root.left, value);
      } else if (value > root.value) {
        root.right = deleteNode(root.right, value);
      } else {
        // Node with only one child or no child
        if (!root.left) return root.right;
        if (!root.right) return root.left;

        // Node with two children: Get in-order successor
        let temp = root.right;
        while (temp.left) temp = temp.left;
        root.value = temp.value;
        root.right = deleteNode(root.right, temp.value);
      }
      return root;
    };

    const newTree = JSON.parse(JSON.stringify(treeData));
    const updated = deleteNode(newTree, val);
    setTreeData(updated);
    setActiveNodeId(null);
    setAnimStatus(`Deleted node (${val}) from Binary Search Tree.`);
  };

  // CLEAR TREE
  const handleClearTree = () => {
    setTreeData(null);
    setActiveNodeId(null);
    setVisitedNodeIds([]);
    setTraversalResult([]);
    setAnimStatus('Binary Search Tree cleared. Heap memory deallocated.');
  };

  // Add First Root Node
  const handleAddFirstNode = () => {
    if (firstValInput.trim() === '' || isNaN(parseInt(firstValInput))) {
      setIsShake(true);
      setAnimStatus('⚠️ Value cannot be empty! Please enter a number.');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const numVal = parseInt(firstValInput);
    const root = new TreeNode(numVal, '0x3004');
    setTreeData(root);
    setActiveNodeId(root.id);
    setAnimStatus(`Initialized Binary Search Tree with ROOT node value ${numVal}.`);
    setFirstValInput('');
  };

  // Pan and Drag Handlers
  const handleMouseDown = (e) => {
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
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoomScale(prev => Math.min(2.2, Math.max(0.35, prev * zoomFactor)));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const totalNodes = countNodes(treeData);
  const treeDepth = getTreeDepth(treeData);

  // Compact default spacing for depth <= 3, scale dynamically ONLY when deeper nodes are added
  const svgWidth = Math.max(720, Math.pow(2, Math.min(treeDepth, 5)) * 52);
  const svgHeight = Math.max(480, treeDepth * 85 + 60);
  const startX = svgWidth / 2;
  const startDx = treeDepth <= 3 ? 135 : Math.min(200, 135 + (treeDepth - 3) * 30);

  // Recursive SVG Tree Nodes Renderer matching exact outer design image with zero badge collisions
  const renderTreeSVG = (node, x, y, dx, level = 1, isRoot = false) => {
    if (!node) return null;

    const isActive = activeNodeId === node.id;
    const isVisited = visitedNodeIds.includes(node.id);

    // Dynamic level-specific horizontal offset
    const childDx = level === 1 ? (treeDepth <= 3 ? 72 : 88) : level === 2 ? 44 : Math.max(26, dx * 0.52);
    const leftX = x - dx;
    const leftY = y + 74;
    const rightX = x + dx;
    const rightY = y + 74;

    // Position badges at 50% (dead center) along line vector from parent
    const leftMidX = (x + leftX) / 2;
    const leftMidY = (y + leftY) / 2;
    const rightMidX = (x + rightX) / 2;
    const rightMidY = (y + rightY) / 2;

    return (
      <g key={node.id}>
        {/* LEFT CHILD CONNECTOR EDGE */}
        {node.left && (
          <g>
            <line
              x1={x} y1={y}
              x2={leftX} y2={leftY}
              stroke={isVisited && visitedNodeIds.includes(node.left.id) ? '#347f7a' : (isDarkMode ? '#475569' : '#647895')}
              strokeWidth={isVisited && visitedNodeIds.includes(node.left.id) ? '3' : '2'}
              opacity="0.8"
            />
            {/* BRANCH CONDITION BADGE: < parentValue (Positioned at 50% dead center along vector) */}
            <g transform={`translate(${leftMidX}, ${leftMidY})`}>
              <rect
                x="-19" y="-9" width="38" height="18" rx="4"
                fill={isDarkMode ? '#1e293b' : '#f1f5f9'}
                stroke={isDarkMode ? '#334155' : '#cbd5e1'}
                strokeWidth="1"
              />
              <text
                x="0" y="3" textAnchor="middle"
                fill={isDarkMode ? '#38bdf8' : '#347f7a'}
                fontSize="9.5" fontFamily="monospace" fontWeight="bold"
              >
                &lt; {node.value}
              </text>
            </g>
          </g>
        )}

        {/* RIGHT CHILD CONNECTOR EDGE */}
        {node.right && (
          <g>
            <line
              x1={x} y1={y}
              x2={rightX} y2={rightY}
              stroke={isVisited && visitedNodeIds.includes(node.right.id) ? '#347f7a' : (isDarkMode ? '#475569' : '#647895')}
              strokeWidth={isVisited && visitedNodeIds.includes(node.right.id) ? '3' : '2'}
              opacity="0.8"
            />
            {/* BRANCH CONDITION BADGE: > parentValue (Positioned at 50% dead center along vector) */}
            <g transform={`translate(${rightMidX}, ${rightMidY})`}>
              <rect
                x="-19" y="-9" width="38" height="18" rx="4"
                fill={isDarkMode ? '#1e293b' : '#f1f5f9'}
                stroke={isDarkMode ? '#334155' : '#cbd5e1'}
                strokeWidth="1"
              />
              <text
                x="0" y="3" textAnchor="middle"
                fill={isDarkMode ? '#38bdf8' : '#347f7a'}
                fontSize="9.5" fontFamily="monospace" fontWeight="bold"
              >
                &gt; {node.value}
              </text>
            </g>
          </g>
        )}

        {/* RECURSIVE CHILD NODES */}
        {renderTreeSVG(node.left, leftX, leftY, childDx, level + 1, false)}
        {renderTreeSVG(node.right, rightX, rightY, childDx, level + 1, false)}

        {/* NODE CIRCLE GROUP MATCHING OUTER DESIGN */}
        <g transform={`translate(${x}, ${y})`} className="cursor-pointer group">
          <circle
            r="23"
            fill={
              dsType === 'red-black-tree' || node.color
                ? (node.color === 'RED' ? '#ef4444' : (isDarkMode ? '#0f172a' : '#1e293b'))
                : isRoot
                ? (isDarkMode ? '#347f7a' : '#203247')
                : isActive
                ? (isDarkMode ? '#0284c7' : '#203247')
                : isVisited
                ? (isDarkMode ? '#115e59' : '#e6f4f1')
                : (isDarkMode ? '#1e293b' : '#ffffff')
            }
            stroke={
              isActive
                ? '#f59e0b'
                : (dsType === 'red-black-tree' || node.color)
                ? (node.color === 'RED' ? '#b91c1c' : (isDarkMode ? '#38bdf8' : '#64748b'))
                : isRoot
                ? (isDarkMode ? '#347f7a' : '#203247')
                : (isDarkMode ? '#475569' : '#203247')
            }
            strokeWidth={isActive ? '4' : '3'}
            className="transition-all duration-200"
          />

          {/* NODE VALUE TEXT */}
          <text
            y="5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="14.5"
            fontFamily="monospace"
            fontWeight="800"
          >
            {node.value}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* TREE MEMORY STAGE HEADER (CLEAN CARD WITH TOP-RIGHT CLEAR BUTTON) */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
          <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
            {dsType === 'red-black-tree' ? `RED-BLACK TREE (${totalNodes} NODES)` : `BINARY SEARCH TREE (${totalNodes} NODES)`}
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
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 shrink-0 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]')} animate-in fade-in slide-in-from-top-1 duration-200`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* EMPTY STATE SCREEN */}
      {!treeData ? (
        <div className={`my-6 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none flex-1 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/15'}`}>
          <div className={`p-4 rounded-2xl shadow-inner mb-1 ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-[#347f7a]/10 text-[#347f7a]'}`}>
            <Layers size={36} />
          </div>
          <div>
            <h4 className={`text-sm font-extrabold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-100' : 'text-[#203247]'}`}>Binary Tree is Empty</h4>
            <p className={`text-xs max-w-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>No root node currently allocated in heap memory. Enter a value below to set the ROOT node!</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
            <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border shadow-2xs ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/15'}`}>
              <input
                type="number"
                placeholder="Enter number..."
                value={firstValInput}
                onChange={e => setFirstValInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddFirstNode()}
                className={`w-32 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-[#203247]/15 text-[#203247] placeholder-[#647895]'} ${isShake ? 'input-error-squiggle' : 'focus:border-[#347f7a]'}`}
              />
              <button
                onClick={handleAddFirstNode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-xs"
              >
                <Plus size={14} />
                <span>Insert Root Node</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SVG TREE CANVAS WITH FLOATING ZOOM & DRAG-TO-PAN CONTROLS (DYNAMIC FULL HEIGHT) */
        <div className="flex flex-col flex-1 h-full min-h-0 relative">
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full flex-1 h-full min-h-[380px] rounded-2xl p-4 overflow-hidden relative flex items-center justify-center shadow-inner select-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border border-slate-700/80' : 'bg-[#faf8f4] border border-[#203247]/15'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                onClick={handleResetZoom}
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
              <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="shrink-0 font-mono text-xs overflow-visible">
                {renderTreeSVG(treeData, startX, 45, startDx, 1, true)}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TRAVERSAL SEQUENCE RESULT CARD */}
      {traversalResult.length > 0 && (
        <div className={`p-3.5 rounded-2xl border shadow-xs shrink-0 font-mono text-xs ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-200' : 'bg-white border-[#203247]/10 text-[#203247]'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#347f7a]">{traversalType} TRAVERSAL PATH:</span>
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar max-w-full py-0.5">
              {traversalResult.map((val, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400 text-[10px]">➔</span>}
                  <span className="px-2 py-0.5 rounded-md bg-[#203247] text-white font-bold text-[11px]">
                    {val}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
