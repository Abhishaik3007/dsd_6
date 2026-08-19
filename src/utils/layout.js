import { getInputPortsCount, GATE_TYPES } from './simulator';

export const NODE_WIDTH = 160;

export function getNodeHeight() {
  return 110;
}

// Compute exact port coordinates so that port circles sit completely outside the gate outline
export function getPortCoordinates(node, portType, portIndex = 0) {
  if (portType === 'output') {
    switch (node.type) {
      case GATE_TYPES.INPUT:
        return { x: node.x + 119, y: node.y + 55 }; // Casing ends at 105 (+14px gap)
      case GATE_TYPES.AND:
        return { x: node.x + 120, y: node.y + 55 }; // Ends at 106 (+14px gap)
      case GATE_TYPES.NAND:
        return { x: node.x + 139, y: node.y + 55 }; // Bubble ends at 125 (cx=36) (+14px gap)
      case GATE_TYPES.OR:
        return { x: node.x + 125, y: node.y + 55 }; // Tip ends at 111 (+14px gap)
      case GATE_TYPES.NOR:
        return { x: node.x + 139, y: node.y + 55 }; // Bubble ends at 125 (cx=36) (+14px gap)
      case GATE_TYPES.NOT:
        return { x: node.x + 131, y: node.y + 55 }; // Bubble ends at 117 (cx=33) (+14px gap)
      case GATE_TYPES.XOR:
        return { x: node.x + 117, y: node.y + 55 }; // Tip ends at 103 (+14px gap)
      case GATE_TYPES.XNOR:
        return { x: node.x + 136, y: node.y + 55 }; // Bubble ends at 122 (cx=35) (+14px gap)
      default:
        return { x: node.x + 120, y: node.y + 55 };
    }
  } else {
    // Input Ports (inputs are at -14px from boundary)
    if (node.type === GATE_TYPES.OUTPUT || node.type === GATE_TYPES.LIGHT_BULB) {
      return { x: node.x + 41, y: node.y + 55 }; // 55 - 14px offset
    }

    const portsCount = getInputPortsCount(node.type);
    let xOffset = 30;

    switch (node.type) {
      case GATE_TYPES.AND:
      case GATE_TYPES.NAND:
        xOffset = 30; // 44 - 14px offset
        break;
      case GATE_TYPES.OR:
      case GATE_TYPES.NOR:
        xOffset = 24; // 38 - 14px offset
        break;
      case GATE_TYPES.NOT:
        xOffset = 24; // 38 - 14px offset
        break;
      case GATE_TYPES.XOR:
      case GATE_TYPES.XNOR:
        xOffset = 10; // 24 - 14px offset
        break;
      default:
        xOffset = 24;
        break;
    }

    if (portsCount === 1) {
      return {
        x: node.x + xOffset,
        y: node.y + 55
      };
    } else {
      // 2 inputs: top at 28px, bottom at 84px (scaled from 7px and 27px)
      return {
        x: node.x + xOffset,
        y: portIndex === 0 ? node.y + 38 : node.y + 74
      };
    }
  }
}
