import React, { useState } from 'react';
import { Plus, Search, Play, RotateCcw, GitCommit, Sparkles } from 'lucide-react';

// BST Node Structure Class Helper
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substring(2, 9);
  }
}

export const TreeVisualizer = () => {
  // Tree state represented as nested object
  const [treeData, setTreeData] = useState(() => {
    const root = new TreeNode(50);
    root.left = new TreeNode(30);
    root.right = new TreeNode(70);
    root.left.left = new TreeNode(20);
    root.left.right = new TreeNode(40);
    root.right.left = new TreeNode(60);
    root.right.right = new TreeNode(80);
    return root;
  });

  const [newValue, setNewValue] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [visitedNodes, setVisitedNodes] = useState([]); // List of node IDs in traversal
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [traversalResult, setTraversalResult] = useState([]);
  const [logMessages, setLogMessages] = useState(['Binary Search Tree initialized with Root 50']);

  const addLog = (msg) => {
    setLogMessages(prev => [msg, ...prev.slice(0, 8)]);
  };

  // Insert into BST helper
  const insertBST = (root, val) => {
    if (!root) return new TreeNode(val);
    if (val < root.value) root.left = insertBST(root.left, val);
    else if (val > root.value) root.right = insertBST(root.right, val);
    return root;
  };

  const handleInsertNode = () => {
    const val = parseInt(newValue);
    if (isNaN(val)) return;
    const newRoot = insertBST(treeData, val);
    setTreeData({ ...newRoot });
    addLog(`Inserted node ${val} into Binary Search Tree.`);
    setNewValue('');
  };

  // Search Node Path Trace
  const handleSearchNode = async () => {
    const target = parseInt(searchTarget);
    if (isNaN(target)) return;

    addLog(`Starting BST Search for node ${target}...`);
    setVisitedNodes([]);
    let curr = treeData;
    let found = false;

    while (curr) {
      setActiveNodeId(curr.id);
      setVisitedNodes(prev => [...prev, curr.id]);
      addLog(`Inspecting node ${curr.value}...`);
      await new Promise(r => setTimeout(r, 700));

      if (curr.value === target) {
        found = true;
        addLog(`SUCCESS: Found target node ${target} in tree!`);
        break;
      } else if (target < curr.value) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    if (!found) {
      addLog(`Target node ${target} not found in BST.`);
    }
  };

  // Traversals: Inorder
  const handleInorderTraversal = async () => {
    addLog('Starting Inorder Traversal (Left -> Root -> Right)...');
    setVisitedNodes([]);
    setTraversalResult([]);
    const result = [];
    
    const inorder = async (node) => {
      if (!node) return;
      await inorder(node.left);
      setActiveNodeId(node.id);
      setVisitedNodes(prev => [...prev, node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      addLog(`Visited Inorder node: ${node.value}`);
      await new Promise(r => setTimeout(r, 600));
      await inorder(node.right);
    };

    await inorder(treeData);
    addLog(`Inorder Complete: [${result.join(', ')}]`);
  };

  // Traversals: Preorder
  const handlePreorderTraversal = async () => {
    addLog('Starting Preorder Traversal (Root -> Left -> Right)...');
    setVisitedNodes([]);
    setTraversalResult([]);
    const result = [];

    const preorder = async (node) => {
      if (!node) return;
      setActiveNodeId(node.id);
      setVisitedNodes(prev => [...prev, node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      addLog(`Visited Preorder node: ${node.value}`);
      await new Promise(r => setTimeout(r, 600));
      await preorder(node.left);
      await preorder(node.right);
    };

    await preorder(treeData);
    addLog(`Preorder Complete: [${result.join(', ')}]`);
  };

  // Traversals: Level-Order BFS
  const handleBFSTraversal = async () => {
    addLog('Starting Level-Order BFS Traversal...');
    setVisitedNodes([]);
    setTraversalResult([]);
    const result = [];
    const queue = [treeData];

    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) continue;
      setActiveNodeId(curr.id);
      setVisitedNodes(prev => [...prev, curr.id]);
      result.push(curr.value);
      setTraversalResult([...result]);
      addLog(`BFS Level Visit: ${curr.value}`);
      await new Promise(r => setTimeout(r, 600));
      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }

    addLog(`BFS Complete: [${result.join(', ')}]`);
  };

  // Recursive Tree Renderer calculation
  const renderTreeNodes = (node, x, y, level, dx) => {
    if (!node) return null;

    const isActive = activeNodeId === node.id;
    const isVisited = visitedNodes.includes(node.id);

    const leftX = x - dx;
    const leftY = y + 70;
    const rightX = x + dx;
    const rightY = y + 70;

    return (
      <g key={node.id}>
        {/* Draw Edges to Left & Right Children */}
        {node.left && (
          <line 
            x1={x} y1={y} 
            x2={leftX} y2={leftY} 
            className={`tree-edge ${isVisited && visitedNodes.includes(node.left.id) ? 'active-edge' : ''}`}
          />
        )}
        {node.right && (
          <line 
            x1={x} y1={y} 
            x2={rightX} y2={rightY} 
            className={`tree-edge ${isVisited && visitedNodes.includes(node.right.id) ? 'active-edge' : ''}`}
          />
        )}

        {/* Recursive Children */}
        {renderTreeNodes(node.left, leftX, leftY, level + 1, dx * 0.55)}
        {renderTreeNodes(node.right, rightX, rightY, level + 1, dx * 0.55)}

        {/* Render Current Node Circle */}
        <g className={`tree-node-group ${isActive ? 'active-node' : ''} ${isVisited ? 'visited-node' : ''}`}>
          <circle cx={x} cy={y} r={24} className="node-circle" />
          <text x={x} y={y + 5} className="node-text" textAnchor="middle">{node.value}</text>
        </g>
      </g>
    );
  };

  return (
    <div className="algo-visualizer-container">
      <div className="visualizer-header">
        <div className="v-title-box">
          <GitCommit size={20} className="v-icon purple" />
          <h2>Binary Search Tree & Traversal Engine</h2>
        </div>
        <p className="v-subtitle">
          Interactive BST node insertion, search path trace, and step-by-step traversal playback.
        </p>
      </div>

      {/* SVG TREE CANVAS */}
      <div className="tree-display-stage">
        {traversalResult.length > 0 && (
          <div className="traversal-result-bar">
            <span>Traversal Sequence: </span>
            <strong>[ {traversalResult.join(' -> ')} ]</strong>
          </div>
        )}

        <svg className="tree-svg" viewBox="0 0 800 360">
          {treeData && renderTreeNodes(treeData, 400, 50, 1, 180)}
        </svg>
      </div>

      {/* CONTROLS */}
      <div className="algo-controls-panel">
        <div className="control-group">
          <h4>Node Insertion</h4>
          <div className="control-inputs-row">
            <input
              type="number"
              placeholder="Value"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="algo-input"
            />
            <button className="algo-btn primary" onClick={handleInsertNode}>
              <Plus size={16} />
              <span>Insert Node</span>
            </button>
          </div>
        </div>

        <div className="control-group">
          <h4>Path Search</h4>
          <div className="control-inputs-row">
            <input
              type="number"
              placeholder="Target Node"
              value={searchTarget}
              onChange={e => setSearchTarget(e.target.value)}
              className="algo-input"
            />
            <button className="algo-btn secondary" onClick={handleSearchNode}>
              <Search size={15} />
              <span>Trace Path</span>
            </button>
          </div>
        </div>

        <div className="control-group">
          <h4>Tree Traversals</h4>
          <div className="control-inputs-row">
            <button className="algo-btn outline" onClick={handleInorderTraversal}>
              Inorder
            </button>
            <button className="algo-btn outline" onClick={handlePreorderTraversal}>
              Preorder
            </button>
            <button className="algo-btn outline" onClick={handleBFSTraversal}>
              Level BFS
            </button>
          </div>
        </div>
      </div>

      {/* TERMINAL */}
      <div className="algo-logs-terminal">
        <div className="terminal-header">
          <span>CONSOLE OPERATION LOGS</span>
        </div>
        <div className="terminal-body">
          {logMessages.map((log, i) => (
            <div key={i} className="log-line">
              <span className="log-arrow">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
