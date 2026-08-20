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
        return { x: node.x + 116, y: node.y + 55 }; // Protrudes outside switch casing edge at 112px
      case GATE_TYPES.AND:
        return { x: node.x + 110, y: node.y + 55 }; // Protrudes outside AND tip edge at 106px
      case GATE_TYPES.NAND:
        return { x: node.x + 129, y: node.y + 55 }; // Protrudes outside NAND bubble edge at 125px
      case GATE_TYPES.OR:
        return { x: node.x + 115, y: node.y + 55 }; // Protrudes outside OR tip edge at 111px
      case GATE_TYPES.NOR:
        return { x: node.x + 129, y: node.y + 55 }; // Protrudes outside NOR bubble edge at 125px
      case GATE_TYPES.NOT:
        return { x: node.x + 121, y: node.y + 55 }; // Protrudes outside NOT bubble edge at 117px
      case GATE_TYPES.XOR:
        return { x: node.x + 107, y: node.y + 55 }; // Protrudes outside XOR tip edge at 103px
      case GATE_TYPES.XNOR:
        return { x: node.x + 126, y: node.y + 55 }; // Protrudes outside XNOR bubble edge at 122px
      case GATE_TYPES.CLOCK:
      case GATE_TYPES.D_FLIP_FLOP:
      case GATE_TYPES.T_FLIP_FLOP:
      case GATE_TYPES.JK_FLIP_FLOP:
        return { x: node.x + 144, y: node.y + 55 }; // IC card edge at 144px
      default:
        return { x: node.x + 110, y: node.y + 55 };
    }
  } else {
    // Input Ports (protruding outside component boundaries)
    if (node.type === GATE_TYPES.OUTPUT || node.type === GATE_TYPES.LIGHT_BULB) {
      return { x: node.x + 44, y: node.y + 55 }; // Protrudes outside bulb casing at 48px
    }

    const portsCount = getInputPortsCount(node.type);
    let xOffset = 38;

    switch (node.type) {
      case GATE_TYPES.AND:
      case GATE_TYPES.NAND:
        xOffset = 38; // Protrudes outside AND/NAND back edge at 44px
        break;
      case GATE_TYPES.OR:
      case GATE_TYPES.NOR:
      case GATE_TYPES.NOT:
        xOffset = 32; // Protrudes outside OR/NOR/NOT back edge at 38px
        break;
      case GATE_TYPES.XOR:
      case GATE_TYPES.XNOR:
        xOffset = 18; // Protrudes outside XOR/XNOR arc at 24px
        break;
      case GATE_TYPES.CLOCK:
      case GATE_TYPES.D_FLIP_FLOP:
      case GATE_TYPES.T_FLIP_FLOP:
      case GATE_TYPES.JK_FLIP_FLOP:
        xOffset = 16; // IC card edge at 16px
        break;
      default:
        xOffset = 32;
        break;
    }

    if (portsCount === 1) {
      return {
        x: node.x + xOffset,
        y: node.y + 55
      };
    } else if (portsCount === 3) {
      const yOffset = [22, 55, 88][portIndex] ?? 55;
      return {
        x: node.x + xOffset,
        y: node.y + yOffset
      };
    } else {
      const isSeq2 = node.type === GATE_TYPES.D_FLIP_FLOP || node.type === GATE_TYPES.T_FLIP_FLOP;
      return {
        x: node.x + xOffset,
        y: portIndex === 0 ? (isSeq2 ? node.y + 36 : node.y + 38) : (isSeq2 ? node.y + 74 : node.y + 74)
      };
    }
  }
}
