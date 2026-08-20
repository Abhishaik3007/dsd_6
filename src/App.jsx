import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { simulateCircuit, GATE_TYPES } from './utils/simulator';
import { getPortCoordinates } from './utils/layout';
import { CheckCircle2, XCircle } from 'lucide-react';

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
      // XOR 1
      { id: 'c1', fromNodeId: 'in_a', toNodeId: 'xor1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_b', toNodeId: 'xor1', toPortIndex: 1 },
      // XOR 2
      { id: 'c3', fromNodeId: 'xor1', toNodeId: 'xor2', toPortIndex: 0 },
      { id: 'c4', fromNodeId: 'in_cin', toNodeId: 'xor2', toPortIndex: 1 },
      // AND 1
      { id: 'c5', fromNodeId: 'in_a', toNodeId: 'and1', toPortIndex: 0 },
      { id: 'c6', fromNodeId: 'in_b', toNodeId: 'and1', toPortIndex: 1 },
      // AND 2
      { id: 'c7', fromNodeId: 'xor1', toNodeId: 'and2', toPortIndex: 0 },
      { id: 'c8', fromNodeId: 'in_cin', toNodeId: 'and2', toPortIndex: 1 },
      // OR 1
      { id: 'c9', fromNodeId: 'and1', toNodeId: 'or1', toPortIndex: 0 },
      { id: 'c10', fromNodeId: 'and2', toNodeId: 'or1', toPortIndex: 1 },
      // Outputs
      { id: 'c11', fromNodeId: 'xor2', toNodeId: 'out_sum', toPortIndex: 0 },
      { id: 'c12', fromNodeId: 'or1', toNodeId: 'out_cout', toPortIndex: 0 },
    ]
  },
  sr_latch: {
    nodes: [
      { id: 'in_r', type: GATE_TYPES.INPUT, x: 100, y: 130, value: false, label: 'Reset (R)' },
      { id: 'in_s', type: GATE_TYPES.INPUT, x: 100, y: 290, value: false, label: 'Set (S)' },
      
      { id: 'nor1', type: GATE_TYPES.NOR, x: 300, y: 140, label: 'NOR Q', inputs: [false, false] },
      { id: 'nor2', type: GATE_TYPES.NOR, x: 300, y: 280, label: 'NOR Q\u0305', inputs: [false, false] },
      
      { id: 'out_q', type: GATE_TYPES.OUTPUT, x: 540, y: 145, label: 'Q Output', inputs: [false] },
      { id: 'out_qbar', type: GATE_TYPES.OUTPUT, x: 540, y: 285, label: 'Q\u0305 Output', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_r', toNodeId: 'nor1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_s', toNodeId: 'nor2', toPortIndex: 1 },
      
      // Feedback loops
      { id: 'c3', fromNodeId: 'nor2', toNodeId: 'nor1', toPortIndex: 1 },
      { id: 'c4', fromNodeId: 'nor1', toNodeId: 'nor2', toPortIndex: 0 },
      
      // Outputs
      { id: 'c5', fromNodeId: 'nor1', toNodeId: 'out_q', toPortIndex: 0 },
      { id: 'c6', fromNodeId: 'nor2', toNodeId: 'out_qbar', toPortIndex: 0 },
    ]
  },
  d_flip_flop_register: {
    nodes: [
      { id: 'in_d', type: GATE_TYPES.INPUT, x: 100, y: 140, value: true, label: 'Data Input (D)' },
      { id: 'clk1', type: GATE_TYPES.CLOCK, x: 100, y: 260, value: false, label: '1Hz Clock' },
      { id: 'dff1', type: GATE_TYPES.D_FLIP_FLOP, x: 340, y: 190, value: false, label: 'D Flip-Flop', inputs: [false, false] },
      { id: 'out_q', type: GATE_TYPES.OUTPUT, x: 580, y: 195, label: 'State Q (LED)', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_d', toNodeId: 'dff1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'clk1', toNodeId: 'dff1', toPortIndex: 1 },
      { id: 'c3', fromNodeId: 'dff1', toNodeId: 'out_q', toPortIndex: 0 },
    ]
  },
  t_flip_flop_divider: {
    nodes: [
      { id: 'in_t', type: GATE_TYPES.INPUT, x: 100, y: 140, value: true, label: 'Toggle (T)' },
      { id: 'clk1', type: GATE_TYPES.CLOCK, x: 100, y: 260, value: false, label: 'Clock Signal' },
      { id: 'tff1', type: GATE_TYPES.T_FLIP_FLOP, x: 340, y: 190, value: false, label: 'T Flip-Flop', inputs: [false, false] },
      { id: 'out_q', type: GATE_TYPES.OUTPUT, x: 580, y: 195, label: 'Divided Clock Q', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_t', toNodeId: 'tff1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'clk1', toNodeId: 'tff1', toPortIndex: 1 },
      { id: 'c3', fromNodeId: 'tff1', toNodeId: 'out_q', toPortIndex: 0 },
    ]
  },
  jk_flip_flop_toggle: {
    nodes: [
      { id: 'in_j', type: GATE_TYPES.INPUT, x: 100, y: 110, value: true, label: 'Set (J)' },
      { id: 'in_k', type: GATE_TYPES.INPUT, x: 100, y: 230, value: true, label: 'Reset (K)' },
      { id: 'clk1', type: GATE_TYPES.CLOCK, x: 100, y: 350, value: false, label: 'Clock Signal' },
      { id: 'jkff1', type: GATE_TYPES.JK_FLIP_FLOP, x: 340, y: 210, value: false, label: 'JK Flip-Flop', inputs: [false, false, false] },
      { id: 'out_q', type: GATE_TYPES.OUTPUT, x: 580, y: 215, label: 'Output Q', inputs: [false] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'in_j', toNodeId: 'jkff1', toPortIndex: 0 },
      { id: 'c2', fromNodeId: 'in_k', toNodeId: 'jkff1', toPortIndex: 1 },
      { id: 'c3', fromNodeId: 'clk1', toNodeId: 'jkff1', toPortIndex: 2 },
      { id: 'c4', fromNodeId: 'jkff1', toNodeId: 'out_q', toPortIndex: 0 },
    ]
  }
};

const CIRCUIT_FILE_FORMAT = 'logicraft-circuit';

function normalizeCircuitFile(circuit) {
  if (!circuit || typeof circuit !== 'object' || Array.isArray(circuit)) {
    throw new Error('This JSON does not contain a Logicraft circuit');
  }
  if (!circuit || circuit.format !== CIRCUIT_FILE_FORMAT || circuit.version !== 1) {
    throw new Error('This is not a supported Logicraft circuit file');
  }
  if (!Array.isArray(circuit.nodes) || !Array.isArray(circuit.connections)) {
    throw new Error('Circuit file is missing nodes or connections');
  }
  if (circuit.nodes.length === 0) {
    throw new Error('This file does not contain a circuit');
  }

  const validTypes = new Set(Object.values(GATE_TYPES));
  const nodeIds = new Set();
  const nodes = circuit.nodes.map((node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node) || typeof node.id !== 'string' || !node.id.trim() || nodeIds.has(node.id) || !validTypes.has(node.type)) {
      throw new Error('Circuit contains an invalid node');
    }
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      throw new Error('Circuit contains an invalid node position');
    }
    nodeIds.add(node.id);
    return {
      ...node,
      x: Number(node.x),
      y: Number(node.y),
      value: Boolean(node.value),
      label: typeof node.label === 'string' ? node.label : node.type
    };
  });

  const connectionIds = new Set();
  const connections = circuit.connections.map((connection) => {
    if (
      !connection ||
      typeof connection !== 'object' ||
      Array.isArray(connection) ||
      typeof connection.id !== 'string' ||
      !connection.id.trim() ||
      connectionIds.has(connection.id) ||
      typeof connection.fromNodeId !== 'string' ||
      typeof connection.toNodeId !== 'string' ||
      !nodeIds.has(connection.fromNodeId) ||
      !nodeIds.has(connection.toNodeId) ||
      !Number.isInteger(connection.toPortIndex) ||
      connection.toPortIndex < 0 ||
      connection.toPortIndex >= getInputPortsCount(nodes.find(node => node.id === connection.toNodeId).type)
    ) {
      throw new Error('Circuit contains an invalid connection');
    }
    connectionIds.add(connection.id);
    return { ...connection };
  });

  return { nodes, connections };
}

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [draggingNodeOutside, setDraggingNodeOutside] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingWire, setDraggingWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentPreset, setCurrentPreset] = useState('empty');
  const [toast, setToast] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTruthTable, setShowTruthTable] = useState(true);

  // Run simulation whenever nodes toggle or connections change
  useEffect(() => {
    if (nodes.length > 0) {
      const simulated = simulateCircuit(nodes, connections);
      // To prevent infinite render loop, we only update nodes if simulated output values differ
      const hasChanged = simulated.some((simNode, i) => {
        const origNode = nodes[i];
        if (!origNode) return true;
        if (simNode.value !== origNode.value) return true;
        // Check inputs values mismatch
        if (!origNode.inputs || simNode.inputs.some((val, idx) => val !== origNode.inputs[idx])) return true;
        return false;
      });

      if (hasChanged) {
        setNodes(simulated);
      }
    }
  }, [connections, nodes]);

  // Clocks advance the circuit at a steady 1 Hz cadence.
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setNodes(prev => {
        if (!prev.some(node => node.type === GATE_TYPES.CLOCK)) return prev;

        const nextNodes = prev.map(node => (
          node.type === GATE_TYPES.CLOCK
            ? { ...node, value: !node.value }
            : node
        ));
        return simulateCircuit(nextNodes, connections);
      });
    }, 500);

    return () => clearInterval(clockTimer);
  }, [connections]);

  // Show a visual Toast notification
  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // 1. Dragging Node on Canvas Functions
  const handleNodeMouseDown = (e, nodeId, mouseX, mouseY) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (Number.isFinite(mouseX) && Number.isFinite(mouseY)) {
      setDraggingNodeId(nodeId);
      setDraggingNodeOutside(false);
      setDragOffset({
        x: mouseX - node.x,
        y: mouseY - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e, x, y, isOutsideMat = false) => {
    setMousePos({ x, y });
    setDraggingNodeOutside(Boolean(draggingNodeId && isOutsideMat));

    if (draggingNodeId) {
      setNodes(prev => prev.map(node => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            x: x - dragOffset.x,
            y: y - dragOffset.y
          };
        }
        return node;
      }));
    }
  };

  const handleCanvasMouseUp = (e, isOutsideMat = false) => {
    if (draggingNodeId && (isOutsideMat || draggingNodeOutside)) {
      handleDeleteNode(draggingNodeId);
    }
    setDraggingNodeId(null);
    setDraggingNodeOutside(false);
    setDraggingWire(null);
  };

  // 2. Drag & Drop creation from Sidebar
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e, x, y) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/react-flow-gate-type');
    
    if (type) {
      const id = `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const sameTypeCount = nodes.filter(n => n.type === type).length;
      const label = `${type} ${sameTypeCount + 1}`;
      
      const newNode = {
        id,
        type,
        x: x - 70, // Center under mouse cursor approximately (NODE_WIDTH/2)
        y: y - 45,
        value: false,
        label,
        inputs: []
      };

      const updatedNodes = [...nodes, newNode];
      const simulatedNodes = simulateCircuit(updatedNodes, connections);
      setNodes(simulatedNodes);
      showToast(`Added ${type} component to workspace`);
    }
  };

  const handleAddNodeFromSidebar = (type) => {
    const sameTypeCount = nodes.filter(n => n.type === type).length;
    const column = nodes.length % 3;
    const row = Math.floor(nodes.length / 3);
    const id = `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newNode = {
      id,
      type,
      x: 90 + column * 190,
      y: 90 + row * 130,
      value: false,
      label: `${type} ${sameTypeCount + 1}`,
      inputs: []
    };

    setNodes(simulateCircuit([...nodes, newNode], connections));
    showToast(`Added ${type} component to workspace`);
  };

  const handleAddNodeAtPosition = (type, clientX, clientY) => {
    const zoomLayerEl = document.querySelector('.canvas-zoom-layer');
    if (!zoomLayerEl) {
      handleAddNodeFromSidebar(type);
      return;
    }
    const rect = zoomLayerEl.getBoundingClientRect();
    const zoom = (rect.width / (zoomLayerEl.offsetWidth || 1)) || 1;
    const x = (clientX - rect.left) / zoom - 70;
    const y = (clientY - rect.top) / zoom - 45;

    const id = `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const sameTypeCount = nodes.filter(n => n.type === type).length;
    const label = `${type} ${sameTypeCount + 1}`;

    const newNode = {
      id,
      type,
      x: Math.max(20, Math.round(x)),
      y: Math.max(20, Math.round(y)),
      value: false,
      label,
      inputs: []
    };

    const updatedNodes = [...nodes, newNode];
    const simulatedNodes = simulateCircuit(updatedNodes, connections);
    setNodes(simulatedNodes);
    showToast(`Added ${type} component to workspace`);
  };

  // 3. Inputs Interactive Toggling
  const handleToggleInput = (nodeId) => {
    setNodes(prev => {
      const updated = prev.map(node => {
        if (node.id === nodeId && node.type === GATE_TYPES.INPUT) {
          return { ...node, value: !node.value };
        }
        return node;
      });
      return simulateCircuit(updated, connections);
    });
  };

  // 4. Node Deletion
  const handleDeleteNode = (nodeId) => {
    const deletedNode = nodes.find(n => n.id === nodeId);
    // Remove the node itself
    const filteredNodes = nodes.filter(node => node.id !== nodeId);
    // Remove all connections associated with the deleted node
    const filteredConnections = connections.filter(
      conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    );

    setNodes(simulateCircuit(filteredNodes, filteredConnections));
    setConnections(filteredConnections);
    
    if (deletedNode) {
      showToast(`Removed ${deletedNode.label}`);
    }
  };

  // 5. Connection Wiring Functions
  const handleStartConnection = (e, fromNodeId) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (fromNode) {
      const p1 = getPortCoordinates(fromNode, 'output');
      setDraggingWire({
        fromNodeId,
        startX: p1.x,
        startY: p1.y
      });
    }
  };

  const handleCompleteConnection = (toNodeId, toPortIndex) => {
    if (draggingWire) {
      const { fromNodeId } = draggingWire;

      // Prevent connecting a gate directly to itself
      if (fromNodeId === toNodeId) {
        setDraggingWire(null);
        return;
      }

      // Enforce: Input port can only have one source connection at a time
      // Filter out any existing connection going to this specific input port
      const activeConnections = connections.filter(
        conn => !(conn.toNodeId === toNodeId && conn.toPortIndex === toPortIndex)
      );

      const newConnection = {
        id: `c_${fromNodeId}_to_${toNodeId}_p${toPortIndex}`,
        fromNodeId,
        toNodeId,
        toPortIndex
      };

      const updatedConnections = [...activeConnections, newConnection];
      setConnections(updatedConnections);
      
      // Force immediate circuit recalculation
      const simulated = simulateCircuit(nodes, updatedConnections);
      setNodes(simulated);

      setDraggingWire(null);
    }
  };

  const handleDeleteConnection = (connId) => {
    const updatedConnections = connections.filter(conn => conn.id !== connId);
    setConnections(updatedConnections);
    
    const simulated = simulateCircuit(nodes, updatedConnections);
    setNodes(simulated);
    showToast('Deleted connection wire');
  };

  // 6. Toolbar Controllers
  const handleClear = () => {
    setNodes([]);
    setConnections([]);
    setCurrentPreset('empty');
    showToast('Workspace cleared');
  };

  const handleLoadPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      // Create deep copies to avoid state reference leaks
      const presetNodes = JSON.parse(JSON.stringify(preset.nodes));
      const presetConns = JSON.parse(JSON.stringify(preset.connections));
      
      // Simulate circuit once immediately before setting state
      const simulatedNodes = simulateCircuit(presetNodes, presetConns);
      
      setNodes(simulatedNodes);
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
      />
      <div className="workspace-container">
        <Sidebar
          onAddNode={handleAddNodeFromSidebar}
          onAddNodeAtPosition={handleAddNodeAtPosition}
          showShortcuts={showShortcuts}
          onHelpClick={() => setShowShortcuts(prev => !prev)}
          showTruthTable={showTruthTable}
          onToggleTruthTable={() => setShowTruthTable(prev => !prev)}
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
          onCloseShortcuts={() => setShowShortcuts(false)}
        />
      </div>

      {/* Floating interactive toast */}
      {toast && (
        <div className={`toast ${toast.kind === 'error' ? 'toast-error' : ''}`} role={toast.kind === 'error' ? 'alert' : 'status'} aria-live="assertive">
          {toast.kind === 'error' ? (
            <XCircle size={16} className="toast-error-icon" />
          ) : (
            <CheckCircle2 size={16} className="toast-success-icon" />
          )}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
