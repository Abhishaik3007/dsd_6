/**
 * Logic Gate Simulator Engine
 * Evaluates node values iteratively to support propagation and feedback loops (e.g. latches).
 */

export const GATE_TYPES = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  NAND: 'NAND',
  NOR: 'NOR',
  XOR: 'XOR',
  XNOR: 'XNOR',
  LIGHT_BULB: 'LIGHT_BULB',
  CLOCK: 'CLOCK',
  D_FLIP_FLOP: 'D_FLIP_FLOP',
  T_FLIP_FLOP: 'T_FLIP_FLOP',
  JK_FLIP_FLOP: 'JK_FLIP_FLOP',
  SR_LATCH: 'SR_LATCH',
  SR_FLIP_FLOP: 'SR_FLIP_FLOP',
  HALF_ADDER: 'HALF_ADDER',
  HALF_SUBTRACTOR: 'HALF_SUBTRACTOR',
  FULL_ADDER: 'FULL_ADDER',
  FULL_SUBTRACTOR: 'FULL_SUBTRACTOR',
  MUX_2TO1: 'MUX_2TO1',
  DEMUX_1TO2: 'DEMUX_1TO2',
  ENCODER_4TO2: 'ENCODER_4TO2',
  DECODER_2TO4: 'DECODER_2TO4',
};

// Gets the number of input ports for a given type
export function getInputPortsCount(type) {
  switch (type) {
    case GATE_TYPES.INPUT:
    case GATE_TYPES.CLOCK:
      return 0;
    case GATE_TYPES.NOT:
    case GATE_TYPES.OUTPUT:
    case GATE_TYPES.LIGHT_BULB:
      return 1;
    case GATE_TYPES.HALF_ADDER:
    case GATE_TYPES.HALF_SUBTRACTOR:
    case GATE_TYPES.SR_LATCH:
    case GATE_TYPES.DEMUX_1TO2:
    case GATE_TYPES.DECODER_2TO4:
    case GATE_TYPES.D_FLIP_FLOP:
    case GATE_TYPES.T_FLIP_FLOP:
      return 2;
    case GATE_TYPES.FULL_ADDER:
    case GATE_TYPES.FULL_SUBTRACTOR:
    case GATE_TYPES.JK_FLIP_FLOP:
    case GATE_TYPES.SR_FLIP_FLOP:
    case GATE_TYPES.MUX_2TO1:
      return 3;
    case GATE_TYPES.ENCODER_4TO2:
      return 4;
    default:
      return 2; // AND, OR, NAND, NOR, XOR, XNOR have 2 inputs
  }
}

// Gets the number of output ports for a given type
export function getOutputPortsCount(type) {
  switch (type) {
    case GATE_TYPES.OUTPUT:
    case GATE_TYPES.LIGHT_BULB:
      return 0;
    case GATE_TYPES.HALF_ADDER:
    case GATE_TYPES.HALF_SUBTRACTOR:
    case GATE_TYPES.FULL_ADDER:
    case GATE_TYPES.FULL_SUBTRACTOR:
    case GATE_TYPES.DEMUX_1TO2:
    case GATE_TYPES.ENCODER_4TO2:
      return 2;
    case GATE_TYPES.DECODER_2TO4:
      return 4;
    default:
      return 1;
  }
}

export function getInputPortLabel(type, index) {
  switch (type) {
    case GATE_TYPES.HALF_ADDER:
    case GATE_TYPES.HALF_SUBTRACTOR:
      return index === 0 ? 'A' : 'B';
    case GATE_TYPES.FULL_ADDER:
      return index === 0 ? 'A' : index === 1 ? 'B' : 'Cin';
    case GATE_TYPES.FULL_SUBTRACTOR:
      return index === 0 ? 'A' : index === 1 ? 'B' : 'Bin';
    case GATE_TYPES.D_FLIP_FLOP:
      return index === 0 ? 'D' : 'CLK';
    case GATE_TYPES.T_FLIP_FLOP:
      return index === 0 ? 'T' : 'CLK';
    case GATE_TYPES.JK_FLIP_FLOP:
      return index === 0 ? 'J' : index === 1 ? 'K' : 'CLK';
    case GATE_TYPES.SR_LATCH:
      return index === 0 ? 'S' : 'R';
    case GATE_TYPES.SR_FLIP_FLOP:
      return index === 0 ? 'S' : index === 1 ? 'R' : 'CLK';
    case GATE_TYPES.MUX_2TO1:
      return index === 0 ? 'D0' : index === 1 ? 'D1' : 'SEL';
    case GATE_TYPES.DEMUX_1TO2:
      return index === 0 ? 'D' : 'SEL';
    case GATE_TYPES.ENCODER_4TO2:
      return `D${index}`;
    case GATE_TYPES.DECODER_2TO4:
      return index === 0 ? 'A' : 'B';
    default:
      return getInputPortsCount(type) > 1 ? `IN ${index + 1}` : 'IN';
  }
}

export function getOutputPortLabel(type, index) {
  switch (type) {
    case GATE_TYPES.HALF_ADDER:
      return index === 0 ? 'S' : 'C';
    case GATE_TYPES.HALF_SUBTRACTOR:
      return index === 0 ? 'D' : 'Bo';
    case GATE_TYPES.FULL_ADDER:
      return index === 0 ? 'S' : 'Co';
    case GATE_TYPES.FULL_SUBTRACTOR:
      return index === 0 ? 'D' : 'Bo';
    case GATE_TYPES.DEMUX_1TO2:
      return `Y${index}`;
    case GATE_TYPES.ENCODER_4TO2:
      return index === 0 ? 'Y1' : 'Y0';
    case GATE_TYPES.DECODER_2TO4:
      return `Y${index}`;
    case GATE_TYPES.D_FLIP_FLOP:
    case GATE_TYPES.T_FLIP_FLOP:
    case GATE_TYPES.JK_FLIP_FLOP:
    case GATE_TYPES.SR_LATCH:
    case GATE_TYPES.SR_FLIP_FLOP:
      return 'Q';
    case GATE_TYPES.MUX_2TO1:
      return 'Y';
    default:
      return 'OUT';
  }
}

export function validateCircuit(nodes, connections) {
  const nodeIds = new Set(nodes.map(node => node.id));
  const issues = [];
  const incomingPorts = new Map();

  connections.forEach(connection => {
    if (!nodeIds.has(connection.fromNodeId) || !nodeIds.has(connection.toNodeId)) {
      issues.push({ level: 'error', message: 'A wire is connected to a missing component.' });
      return;
    }
    const target = nodes.find(node => node.id === connection.toNodeId);
    if (connection.toPortIndex < 0 || connection.toPortIndex >= getInputPortsCount(target.type)) {
      issues.push({ level: 'error', message: `Wire to ${target.label || target.type} uses an invalid input.` });
      return;
    }
    const portKey = `${connection.toNodeId}:${connection.toPortIndex}`;
    if (incomingPorts.has(portKey)) {
      issues.push({ level: 'error', message: `${target.label || target.type} has more than one wire on an input.` });
    }
    incomingPorts.set(portKey, true);
  });

  nodes.forEach(node => {
    const portCount = getInputPortsCount(node.type);
    for (let portIndex = 0; portIndex < portCount; portIndex += 1) {
      if (!incomingPorts.has(`${node.id}:${portIndex}`)) {
        issues.push({ level: 'warning', message: `${node.label || node.type} has an unconnected input ${portIndex + 1}.` });
      }
    }
  });

  if (nodes.length > 0 && !nodes.some(node => [GATE_TYPES.OUTPUT, GATE_TYPES.LIGHT_BULB].includes(node.type))) {
    issues.push({ level: 'warning', message: 'Add an output or light bulb to observe the circuit.' });
  }

  return issues;
}

/**
 * Simulates the entire circuit by iteratively propagating signals until values stabilize or max iterations are reached.
 * @param {Array} nodes - Array of node objects
 * @param {Array} connections - Array of connection objects { id, fromNodeId, fromPortIndex, toNodeId, toPortIndex }
 * @param {number} maxIterations - Limit on iteration to prevent infinite cycles in oscillating circuits
 * @returns {Array} - Updated nodes with new calculated values
 */
export function simulateCircuit(nodes, connections, maxIterations = 30) {
  // Create a deep copy of nodes to work with
  let currentNodes = nodes.map(node => {
    const outCount = getOutputPortsCount(node.type);
    return {
      ...node,
      value: node.value ?? false,
      outputs: node.outputs || Array(outCount).fill(node.value ?? false),
      inputs: Array(getInputPortsCount(node.type)).fill(false)
    };
  });

  let changed = true;
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // 1. Gather all incoming values for each node's input ports
    const nodeIncomingValues = {};
    currentNodes.forEach(node => {
      nodeIncomingValues[node.id] = Array(getInputPortsCount(node.type)).fill(false);
    });

    // Populate incoming values from connections (supporting multi-output sources)
    connections.forEach(conn => {
      const sourceNode = currentNodes.find(n => n.id === conn.fromNodeId);
      const targetNode = currentNodes.find(n => n.id === conn.toNodeId);

      if (sourceNode && targetNode) {
        const portIndex = conn.toPortIndex;
        if (portIndex >= 0 && portIndex < nodeIncomingValues[conn.toNodeId].length) {
          const fromPortIndex = conn.fromPortIndex || 0;
          const sourceVal = Array.isArray(sourceNode.outputs) && sourceNode.outputs.length > fromPortIndex
            ? Boolean(sourceNode.outputs[fromPortIndex])
            : Boolean(sourceNode.value);
          nodeIncomingValues[conn.toNodeId][portIndex] = sourceVal;
        }
      }
    });

    // 2. Compute new values for each node
    // eslint-disable-next-line no-loop-func
    currentNodes = currentNodes.map(node => {
      const incoming = nodeIncomingValues[node.id];
      let newValue = node.value;
      let nodeOutputs = null;

      switch (node.type) {
        case GATE_TYPES.INPUT:
        case GATE_TYPES.CLOCK:
          // Input node value is managed manually by the user
          break;
        case GATE_TYPES.OUTPUT:
        case GATE_TYPES.LIGHT_BULB:
          newValue = incoming[0];
          break;
        case GATE_TYPES.AND:
          newValue = incoming[0] && incoming[1];
          break;
        case GATE_TYPES.OR:
          newValue = incoming[0] || incoming[1];
          break;
        case GATE_TYPES.NOT:
          newValue = !incoming[0];
          break;
        case GATE_TYPES.NAND:
          newValue = !(incoming[0] && incoming[1]);
          break;
        case GATE_TYPES.NOR:
          newValue = !(incoming[0] || incoming[1]);
          break;
        case GATE_TYPES.XOR:
          newValue = incoming[0] !== incoming[1];
          break;
        case GATE_TYPES.XNOR:
          newValue = incoming[0] === incoming[1];
          break;
        case GATE_TYPES.D_FLIP_FLOP:
          if (incoming[1] && !node.clockState) {
            newValue = incoming[0];
          }
          break;
        case GATE_TYPES.T_FLIP_FLOP:
          if (incoming[1] && !node.clockState && incoming[0]) {
            newValue = !node.value;
          }
          break;
        case GATE_TYPES.JK_FLIP_FLOP:
          if (incoming[2] && !node.clockState) {
            if (incoming[0] && incoming[1]) newValue = !node.value;
            else if (incoming[0]) newValue = true;
            else if (incoming[1]) newValue = false;
          }
          break;
        case GATE_TYPES.SR_LATCH: {
          const s = incoming[0];
          const r = incoming[1];
          if (s && !r) newValue = true;
          else if (!s && r) newValue = false;
          else if (s && r) newValue = false; // invalid/metastable
          break;
        }
        case GATE_TYPES.SR_FLIP_FLOP: {
          const s = incoming[0];
          const r = incoming[1];
          const clk = incoming[2];
          if (clk && !node.clockState) {
            if (s && !r) newValue = true;
            else if (!s && r) newValue = false;
            else if (s && r) newValue = false;
          }
          break;
        }
        case GATE_TYPES.HALF_ADDER: {
          const a = Boolean(incoming[0]);
          const b = Boolean(incoming[1]);
          const s = a !== b;
          const c = a && b;
          nodeOutputs = [s, c];
          newValue = s || c;
          break;
        }
        case GATE_TYPES.HALF_SUBTRACTOR: {
          const a = Boolean(incoming[0]);
          const b = Boolean(incoming[1]);
          const d = a !== b;
          const bo = !a && b;
          nodeOutputs = [d, bo];
          newValue = d || bo;
          break;
        }
        case GATE_TYPES.FULL_ADDER: {
          const a = Boolean(incoming[0]);
          const b = Boolean(incoming[1]);
          const cin = Boolean(incoming[2]);
          const s = (a !== b) !== cin;
          const co = (a && b) || (a && cin) || (b && cin);
          nodeOutputs = [s, co];
          newValue = s || co;
          break;
        }
        case GATE_TYPES.FULL_SUBTRACTOR: {
          const a = Boolean(incoming[0]);
          const b = Boolean(incoming[1]);
          const bin = Boolean(incoming[2]);
          const d = (a !== b) !== bin;
          const bo = (!a && b) || (!a && bin) || (b && bin);
          nodeOutputs = [d, bo];
          newValue = d || bo;
          break;
        }
        case GATE_TYPES.MUX_2TO1: {
          const d0 = incoming[0];
          const d1 = incoming[1];
          const sel = incoming[2];
          newValue = sel ? d1 : d0;
          break;
        }
        case GATE_TYPES.DEMUX_1TO2: {
          const d = incoming[0];
          const sel = incoming[1];
          const y0 = !sel && d;
          const y1 = sel && d;
          nodeOutputs = [y0, y1];
          newValue = y0 || y1;
          break;
        }
        case GATE_TYPES.ENCODER_4TO2: {
          const [d0, d1, d2, d3] = incoming;
          let y1 = false;
          let y0 = false;
          if (d3) { y1 = true; y0 = true; }
          else if (d2) { y1 = true; y0 = false; }
          else if (d1) { y1 = false; y0 = true; }
          else if (d0) { y1 = false; y0 = false; }
          nodeOutputs = [y1, y0];
          newValue = y1 || y0;
          break;
        }
        case GATE_TYPES.DECODER_2TO4: {
          const a = incoming[0];
          const b = incoming[1];
          const y0 = !a && !b;
          const y1 = !a && b;
          const y2 = a && !b;
          const y3 = a && b;
          nodeOutputs = [y0, y1, y2, y3];
          newValue = y0 || y1 || y2 || y3;
          break;
        }
        default:
          break;
      }

      const finalOutputs = nodeOutputs || [newValue];

      if (newValue !== node.value) {
        changed = true;
      }

      // Check if any port outputs changed
      if (node.outputs) {
        for (let i = 0; i < finalOutputs.length; i++) {
          if (node.outputs[i] !== finalOutputs[i]) {
            changed = true;
          }
        }
      }

      // Check if any port inputs changed, so we can save them for rendering
      for (let i = 0; i < incoming.length; i++) {
        if (node.inputs[i] !== incoming[i]) {
          changed = true;
        }
      }

      const isClocked = [
        GATE_TYPES.D_FLIP_FLOP,
        GATE_TYPES.T_FLIP_FLOP,
        GATE_TYPES.JK_FLIP_FLOP,
        GATE_TYPES.SR_FLIP_FLOP
      ].includes(node.type);

      return {
        ...node,
        value: newValue,
        outputs: finalOutputs,
        inputs: incoming,
        ...(isClocked ? { clockState: incoming[incoming.length - 1] } : {})
      };
    });
  }

  return currentNodes;
}
