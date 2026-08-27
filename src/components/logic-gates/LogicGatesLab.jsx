import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import Canvas from '../Canvas';
import Toolbar from '../Toolbar';
import { simulateCircuit, validateCircuit, GATE_TYPES } from '../../utils/simulator';
import { getPortCoordinates } from '../../utils/layout';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useHub } from '../../context/HubContext';

const PRESETS = {
  empty: { nodes: [], connections: [] },
  basic_gates: {
    nodes: [
      { id: 'in_a', type: GATE_TYPES.INPUT, x: 100, y: 100, value: true, label: 'Input A' },
      { id: 'in_b', type: GATE_TYPES.INPUT, x: 100, y: 220, value: false, label: 'Input B' },
      { id: 'in_c', type: GATE_TYPES.INPUT, x: 100, y: 340, value: true, label: 'Input C' },
      
      { id: 'gate_and', type: GATE_TYPES.AND, x: 320, y: 90, label: 'AND Gate', inputs: [false, false] },
      { id: 'gate_or', type: GATE_TYPES.OR, x: 320, y: 210, label: 'OR Gate', inputs: [false, false] },
      { id: 'gate_not', type: GATE_TYPES.NOT, x: 320, y: 330, label: 'NOT Gate', inputs: [false] },
      
      { id: 'out_and', type: GATE_TYPES.OUTPUT, x: 560, y: 95, label: 'AND Out', inputs: [false] },
      { id: 'out_or', type: GATE_TYPES.OUTPUT, x: 560, y: 215, label: 'OR Out', inputs: [false] },
      { id: 'out_not', type: GATE_TYPES.OUTPUT, x: 560, y: 335, label: 'NOT Out', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_a', toNodeId: 'gate_and', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_b', toNodeId: 'gate_and', toPortIndex: 1 },
      
      { id: 'c3', fromNodeId: 'in_b', toNodeId: 'gate_or', toPortIndex: 0 },
      { id: 'c4', fromNodeId: 'in_c', toNodeId: 'gate_or', toPortIndex: 1 },
      
      { id: 'c5', fromNodeId: 'in_c', toNodeId: 'gate_not', toPortIndex: 0 },
      
      { id: 'c6', fromNodeId: 'gate_and', toNodeId: 'out_and', toPortIndex: 0 },
      { id: 'c7', fromNodeId: 'gate_or', toNodeId: 'out_or', toPortIndex: 0 },
      { id: 'c8', fromNodeId: 'gate_not', toNodeId: 'out_not', toPortIndex: 0 },
    ]
  },
  half_adder: {
    nodes: [
      { id: 'in_a', type: GATE_TYPES.INPUT, x: 100, y: 150, value: true, label: 'Input A' },
      { id: 'in_b', type: GATE_TYPES.INPUT, x: 100, y: 280, value: true, label: 'Input B' },
      
      { id: 'gate_xor', type: GATE_TYPES.XOR, x: 320, y: 120, label: 'XOR (Sum)', inputs: [false, false] },
      { id: 'gate_and', type: GATE_TYPES.AND, x: 320, y: 260, label: 'AND (Carry)', inputs: [false, false] },
      
      { id: 'out_sum', type: GATE_TYPES.OUTPUT, x: 560, y: 125, label: 'Sum (S)', inputs: [false] },
      { id: 'out_carry', type: GATE_TYPES.OUTPUT, x: 560, y: 265, label: 'Carry (C)', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_a', toNodeId: 'gate_xor', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_b', toNodeId: 'gate_xor', toPortIndex: 1 },
      
      { id: 'c3', fromNodeId: 'in_a', toNodeId: 'gate_and', toPortIndex: 0 },
      { id: 'c4', fromNodeId: 'in_b', toNodeId: 'gate_and', toPortIndex: 1 },
      
      { id: 'c5', fromNodeId: 'gate_xor', toNodeId: 'out_sum', toPortIndex: 0 },
      { id: 'c6', fromNodeId: 'gate_and', toNodeId: 'out_carry', toPortIndex: 0 },
    ]
  },
  full_adder: {
    nodes: [
      { id: 'in_a', type: GATE_TYPES.INPUT, x: 80, y: 120, value: true, label: 'Input A' },
      { id: 'in_b', type: GATE_TYPES.INPUT, x: 80, y: 240, value: true, label: 'Input B' },
      { id: 'in_cin', type: GATE_TYPES.INPUT, x: 80, y: 380, value: false, label: 'Carry In' },
      
      { id: 'xor1', type: GATE_TYPES.XOR, x: 260, y: 110, label: 'XOR 1', inputs: [false, false] },
      { id: 'xor2', type: GATE_TYPES.XOR, x: 480, y: 170, label: 'XOR 2', inputs: [false, false] },
      
      { id: 'and1', type: GATE_TYPES.AND, x: 260, y: 230, label: 'AND 1', inputs: [false, false] },
      { id: 'and2', type: GATE_TYPES.AND, x: 480, y: 310, label: 'AND 2', inputs: [false, false] },
      
      { id: 'or1', type: GATE_TYPES.OR, x: 680, y: 260, label: 'OR 1', inputs: [false, false] },
      
      { id: 'out_sum', type: GATE_TYPES.OUTPUT, x: 880, y: 175, label: 'Sum Out', inputs: [false] },
      { id: 'out_cout', type: GATE_TYPES.OUTPUT, x: 880, y: 265, label: 'Carry Out', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_a', toNodeId: 'xor1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_b', toNodeId: 'xor1', toPortIndex: 1 },
      { id: 'c3', fromNodeId: 'xor1', toNodeId: 'xor2', toPortIndex: 0 },
      { id: 'c4', fromNodeId: 'in_cin', toNodeId: 'xor2', toPortIndex: 1 },
      { id: 'c5', fromNodeId: 'in_a', toNodeId: 'and1', toPortIndex: 0 },
      { id: 'c6', fromNodeId: 'in_b', toNodeId: 'and1', toPortIndex: 1 },
      { id: 'c7', fromNodeId: 'xor1', toNodeId: 'and2', toPortIndex: 0 },
      { id: 'c8', fromNodeId: 'in_cin', toNodeId: 'and2', toPortIndex: 1 },
      { id: 'c9', fromNodeId: 'and1', toNodeId: 'or1', toPortIndex: 0 },
      { id: 'c10', fromNodeId: 'and2', toNodeId: 'or1', toPortIndex: 1 },
      { id: 'c11', fromNodeId: 'xor2', toNodeId: 'out_sum', toPortIndex: 0 },
      { id: 'c12', fromNodeId: 'or1', toNodeId: 'out_cout', toPortIndex: 0 },
    ]
  }
};

const CIRCUIT_FILE_FORMAT = 'dsd_6_logicraft_circuit';

const normalizeCircuitFile = (rawContent) => {
  if (!rawContent || typeof rawContent !== 'object') {
    throw new Error('Circuit file is empty or invalid JSON');
  }
  const isLegacy = Array.isArray(rawContent.nodes) && Array.isArray(rawContent.connections) && !rawContent.format;
  if (!isLegacy && rawContent.format !== CIRCUIT_FILE_FORMAT) {
    throw new Error('Unrecognized circuit file format');
  }
  const nodes = Array.isArray(rawContent.nodes) ? rawContent.nodes : [];
  const connections = Array.isArray(rawContent.connections) ? rawContent.connections : [];

  const validNodes = nodes.filter(node => node && typeof node.id === 'string' && typeof node.type === 'string');
  const validNodeIds = new Set(validNodes.map(node => node.id));

  const validConnections = connections.filter(conn => (
    conn &&
    typeof conn.id === 'string' &&
    validNodeIds.has(conn.fromNodeId) &&
    validNodeIds.has(conn.toNodeId) &&
    typeof conn.toPortIndex === 'number'
  ));

  return { nodes: validNodes, connections: validConnections };
};

export const LogicGatesLab = () => {
  const { setActiveTab } = useHub();
  const [nodes, setNodes] = useState(() => simulateCircuit(PRESETS.basic_gates.nodes, PRESETS.basic_gates.connections));
  const [connections, setConnections] = useState(PRESETS.basic_gates.connections);
  const [currentPreset, setCurrentPreset] = useState('basic_gates');

  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingNodeOutside, setDraggingNodeOutside] = useState(false);

  const [draggingWire, setDraggingWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [toast, setToast] = useState(null);

  const [history, setHistory] = useState({ past: [], future: [] });

  const toastTimerRef = useRef(null);

  const showToast = (message, kind = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, kind });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const validationIssues = validateCircuit(nodes, connections);

  const recordHistory = () => {
    setHistory(prev => ({
      past: [...prev.past.slice(-20), { nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)), currentPreset }],
      future: []
    }));
  };

  const handleUndo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    setHistory({
      past: newPast,
      future: [{ nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)), currentPreset }, ...history.future]
    });
    setNodes(previous.nodes);
    setConnections(previous.connections);
    setCurrentPreset(previous.currentPreset);
    showToast('Undo action');
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    setHistory({
      past: [...history.past, { nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)), currentPreset }],
      future: newFuture
    });
    setNodes(next.nodes);
    setConnections(next.connections);
    setCurrentPreset(next.currentPreset);
    showToast('Redo action');
  };

  const createUniqueNode = (type, x, y) => {
    const uniqueId = `${type.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const inputCount = (type === GATE_TYPES.INPUT || type === GATE_TYPES.OUTPUT) ? 1 
      : (type === GATE_TYPES.NOT) ? 1 : 2;
    return {
      id: uniqueId,
      type,
      x: Math.max(20, x),
      y: Math.max(20, y),
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type === GATE_TYPES.INPUT ? false : undefined,
      inputs: Array(inputCount).fill(false)
    };
  };

  const handleAddNodeFromSidebar = (type) => {
    recordHistory();
    const newNode = createUniqueNode(type, 220 + (nodes.length % 5) * 30, 120 + (nodes.length % 5) * 30);
    const updatedNodes = simulateCircuit([...nodes, newNode], connections);
    setNodes(updatedNodes);
    showToast(`Added ${type} Gate`);
  };

  const handleAddNodeAtPosition = (type, x, y) => {
    recordHistory();
    const newNode = createUniqueNode(type, x, y);
    const updatedNodes = simulateCircuit([...nodes, newNode], connections);
    setNodes(updatedNodes);
    showToast(`Added ${type} Gate`);
  };

  const handleToggleInput = (nodeId) => {
    recordHistory();
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId && node.type === GATE_TYPES.INPUT) {
        return { ...node, value: !node.value };
      }
      return node;
    });
    setNodes(simulateCircuit(updatedNodes, connections));
  };

  const handleDeleteNode = (nodeId) => {
    recordHistory();
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedConnections = connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    setNodes(simulateCircuit(updatedNodes, updatedConnections));
    setConnections(updatedConnections);
    if (nodeToDelete) showToast(`Deleted ${nodeToDelete.label || nodeToDelete.type}`);
  };

  const handleNodeMouseDown = (e, nodeId) => {
    if (e.button !== 0) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    setDraggingNodeOutside(false);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleCanvasMouseMove = (e) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const currentMouseX = e.clientX - canvasRect.left;
    const currentMouseY = e.clientY - canvasRect.top;

    setMousePos({ x: currentMouseX, y: currentMouseY });

    if (draggingNodeId) {
      const isOutside = (
        e.clientX < canvasRect.left ||
        e.clientX > canvasRect.right ||
        e.clientY < canvasRect.top ||
        e.clientY > canvasRect.bottom
      );
      setDraggingNodeOutside(isOutside);

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      setNodes(prevNodes => prevNodes.map(n => {
        if (n.id === draggingNodeId) {
          return { ...n, x: Math.max(10, newX), y: Math.max(10, newY) };
        }
        return n;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      if (draggingNodeOutside) {
        handleDeleteNode(draggingNodeId);
      }
      setDraggingNodeId(null);
      setDraggingNodeOutside(false);
    }
    if (draggingWire) setDraggingWire(null);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/logicraft-gate-type');
    if (!type) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - canvasRect.left - 50;
    const dropY = e.clientY - canvasRect.top - 30;

    handleAddNodeAtPosition(type, dropX, dropY);
  };

  const handleStartConnection = (fromNodeId) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return;
    const startPort = getPortCoordinates(fromNode, 'output', 0);
    setDraggingWire({
      fromNodeId,
      startX: startPort.x,
      startY: startPort.y
    });
  };

  const handleCompleteConnection = (toNodeId, toPortIndex) => {
    if (!draggingWire) return;
    if (draggingWire.fromNodeId === toNodeId) {
      showToast('Cannot connect a gate to itself', 'error');
      setDraggingWire(null);
      return;
    }

    const existingConnIndex = connections.findIndex(
      c => c.toNodeId === toNodeId && c.toPortIndex === toPortIndex
    );

    recordHistory();
    let updatedConnections = [...connections];
    if (existingConnIndex >= 0) {
      updatedConnections.splice(existingConnIndex, 1);
    }

    const newConnection = {
      id: `conn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fromNodeId: draggingWire.fromNodeId,
      toNodeId,
      toPortIndex
    };

    updatedConnections.push(newConnection);
    setConnections(updatedConnections);
    setNodes(simulateCircuit(nodes, updatedConnections));
    setDraggingWire(null);
    showToast('Wire connected');
  };

  const handleDeleteConnection = (connId) => {
    recordHistory();
    const updatedConnections = connections.filter(conn => conn.id !== connId);
    setConnections(updatedConnections);
    setNodes(simulateCircuit(nodes, updatedConnections));
    showToast('Deleted connection wire');
  };

  const handleClear = () => {
    if (nodes.length > 0 || connections.length > 0) recordHistory();
    setNodes([]);
    setConnections([]);
    setCurrentPreset('empty');
    showToast('Workspace cleared');
  };

  const handleLoadPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      recordHistory();
      const presetNodes = JSON.parse(JSON.stringify(preset.nodes));
      const presetConns = JSON.parse(JSON.stringify(preset.connections));
      setNodes(simulateCircuit(presetNodes, presetConns));
      setConnections(presetConns);
      setCurrentPreset(presetName);
      if (presetName !== 'empty') {
        const formattedName = presetName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        showToast(`Loaded ${formattedName}`);
      }
    }
  };

  const handleSaveCircuit = () => {
    if (nodes.length === 0) {
      showToast('Add at least one gate before saving', 'error');
      return;
    }
    const circuit = {
      format: CIRCUIT_FILE_FORMAT,
      version: 1,
      savedAt: new Date().toISOString(),
      nodes,
      connections
    };
    const blob = new Blob([JSON.stringify(circuit, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'logicraft-circuit.json';
    link.click();
    URL.revokeObjectURL(downloadUrl);
    showToast('Circuit saved to your device');
  };

  const handleLoadCircuit = (circuit, fileName) => {
    try {
      recordHistory();
      const normalizedCircuit = normalizeCircuitFile(circuit);
      setNodes(simulateCircuit(normalizedCircuit.nodes, normalizedCircuit.connections));
      setConnections(normalizedCircuit.connections);
      setCurrentPreset(fileName);
      showToast(`Loaded ${fileName}`);
    } catch (error) {
      showToast(error.message || 'Could not load circuit', 'error');
    }
  };

  return (
    <div className="app-container">
      <Toolbar 
          onClear={handleClear} 
          onLoadPreset={handleLoadPreset}
          currentPreset={currentPreset}
          onSaveCircuit={handleSaveCircuit}
          canSaveCircuit={nodes.length > 0}
          onLoadCircuit={handleLoadCircuit}
          onCircuitError={(message) => showToast(message, 'error')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
        />
        <div className="workspace-container">
          <Sidebar
            onAddNode={handleAddNodeFromSidebar}
            onAddNodeAtPosition={handleAddNodeAtPosition}
            showShortcuts={showShortcuts}
            onHelpClick={() => setShowShortcuts(prev => !prev)}
            showTruthTable={showTruthTable}
            onToggleTruthTable={() => setShowTruthTable(prev => !prev)}
            validationIssues={validationIssues}
            hasCircuit={nodes.length > 0}
          />
          <Canvas
            nodes={nodes}
            connections={connections}
            draggingNodeId={draggingNodeId}
            draggingNodeOutside={draggingNodeOutside}
            showShortcuts={showShortcuts}
            draggingWire={draggingWire}
            mousePos={mousePos}
            onNodeMouseDown={handleNodeMouseDown}
            onToggleInput={handleToggleInput}
            onDeleteNode={handleDeleteNode}
            onStartConnection={handleStartConnection}
            onCompleteConnection={handleCompleteConnection}
            onDeleteConnection={handleDeleteConnection}
            onCanvasDrop={handleCanvasDrop}
            onCanvasDragOver={handleCanvasDragOver}
            onCanvasMouseMove={handleCanvasMouseMove}
            onCanvasMouseUp={handleCanvasMouseUp}
            showTruthTable={showTruthTable}
            validationIssues={validationIssues}
            onCloseShortcuts={() => setShowShortcuts(false)}
          />
        </div>

        {toast && (
          <div className={`toast ${toast.kind === 'error' ? 'toast-error' : ''}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
            {toast.kind === 'error' ? <XCircle size={16} className="toast-error-icon" /> : <CheckCircle2 size={16} className="toast-success-icon" />}
            <span className="toast-message">{toast.message}</span>
          </div>
        )}
      </div>
    );
  };
