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
};

// Gets the number of input ports for a given type
export function getInputPortsCount(type) {
  switch (type) {
    case GATE_TYPES.INPUT:
      return 0;
    case GATE_TYPES.NOT:
    case GATE_TYPES.OUTPUT:
    case GATE_TYPES.LIGHT_BULB:
      return 1;
    default:
      return 2; // AND, OR, NAND, NOR, XOR, XNOR have 2 inputs
  }
}

/**
 * Simulates the entire circuit by iteratively propagating signals until values stabilize or max iterations are reached.
 * @param {Array} nodes - Array of node objects
 * @param {Array} connections - Array of connection objects { id, fromNodeId, toNodeId, toPortIndex }
 * @param {number} maxIterations - Limit on iteration to prevent infinite cycles in oscillating circuits
 * @returns {Array} - Updated nodes with new calculated values
 */
export function simulateCircuit(nodes, connections, maxIterations = 30) {
  // Create a deep copy of nodes to work with
  let currentNodes = nodes.map(node => ({
    ...node,
    value: node.value ?? false,
    // Add temporary input states to keep track of port values for display/debugging
    inputs: Array(getInputPortsCount(node.type)).fill(false)
  }));

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

    // Populate incoming values from connections
    connections.forEach(conn => {
      const sourceNode = currentNodes.find(n => n.id === conn.fromNodeId);
      const targetNode = currentNodes.find(n => n.id === conn.toNodeId);

      if (sourceNode && targetNode) {
        const portIndex = conn.toPortIndex;
        if (portIndex >= 0 && portIndex < nodeIncomingValues[conn.toNodeId].length) {
          nodeIncomingValues[conn.toNodeId][portIndex] = sourceNode.value;
        }
      }
    });

    // 2. Compute new values for each node
    // eslint-disable-next-line no-loop-func
    currentNodes = currentNodes.map(node => {
      const incoming = nodeIncomingValues[node.id];
      let newValue = node.value;

      switch (node.type) {
        case GATE_TYPES.INPUT:
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
        default:
          break;
      }

      if (newValue !== node.value) {
        changed = true;
      }

      // Check if any port inputs changed, so we can save them for rendering
      let inputsChanged = false;
      for (let i = 0; i < incoming.length; i++) {
        if (node.inputs[i] !== incoming[i]) {
          inputsChanged = true;
        }
      }
      if (inputsChanged) {
        changed = true;
      }

      return {
        ...node,
        value: newValue,
        inputs: incoming
      };
    });
  }

  return currentNodes;
}
