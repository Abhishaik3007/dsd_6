/**
 * Dead Star Devs (DSD) - TinkerLab Geometry & Coordinate Mapping Engine
 * Calculates exact live world coordinates for component pins and breadboard holes
 * taking into account rotation and canvas translations.
 */

export function rotatePoint(px, py, angleDeg = 0) {
  if (!angleDeg) return { x: px, y: py };
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: px * cos - py * sin,
    y: px * sin + py * cos
  };
}

export const COMPONENT_PIN_OFFSETS = {
  resistor: {
    pin_1: { x: -30, y: 0 },
    pin_2: { x: 30, y: 0 }
  },
  led: {
    pin_cathode: { x: -6, y: 28 },
    pin_anode: { x: 6, y: 28 }
  },
  pushbutton: {
    pin_1a: { x: -16, y: -14 },
    pin_1b: { x: 16, y: -14 },
    pin_2a: { x: -16, y: 14 },
    pin_2b: { x: 16, y: 14 }
  },
  slideswitch: {
    pin_1: { x: -16, y: 18 },
    pin_2: { x: 0, y: 18 },
    pin_3: { x: 16, y: 18 }
  },
  battery_9v: {
    pin_pos: { x: -16, y: -59.5 },
    pin_neg: { x: 16, y: -59.5 }
  },
  battery_coin: {
    pin_pos: { x: 34, y: -18.5 },
    pin_neg: { x: -34, y: 18.5 }
  },
  battery_aa: {
    pin_pos: { x: 0, y: -56 },
    pin_neg: { x: 0, y: 50 }
  },
  potentiometer: {
    pin_1: { x: -16, y: 30 },
    pin_wiper: { x: 0, y: 30 },
    pin_3: { x: 16, y: 30 }
  },
  capacitor: {
    pin_1: { x: -6, y: 28 },
    pin_2: { x: 6, y: 28 },
    pin_cathode: { x: -6, y: 28 },
    pin_anode: { x: 6, y: 28 }
  },
  vibration_motor: {
    pin_pos: { x: -10, y: 32 },
    pin_neg: { x: 10, y: 32 },
    pin_1: { x: -10, y: 32 },
    pin_2: { x: 10, y: 32 }
  },
  diode: {
    pin_anode: { x: -30, y: 0 },
    pin_cathode: { x: 30, y: 0 },
    pin_1: { x: -30, y: 0 },
    pin_2: { x: 30, y: 0 }
  },
  transistor_npn: {
    pin_c: { x: -14, y: 28 },
    pin_collector: { x: -14, y: 28 },
    pin_1: { x: -14, y: 28 },
    pin_b: { x: 0, y: 28 },
    pin_base: { x: 0, y: 28 },
    pin_2: { x: 0, y: 28 },
    pin_e: { x: 14, y: 28 },
    pin_emitter: { x: 14, y: 28 },
    pin_3: { x: 14, y: 28 }
  },
  transistor: {
    pin_c: { x: -14, y: 28 },
    pin_collector: { x: -14, y: 28 },
    pin_1: { x: -14, y: 28 },
    pin_b: { x: 0, y: 28 },
    pin_base: { x: 0, y: 28 },
    pin_2: { x: 0, y: 28 },
    pin_e: { x: 14, y: 28 },
    pin_emitter: { x: 14, y: 28 },
    pin_3: { x: 14, y: 28 }
  },
  photoresistor: {
    pin_1: { x: -6, y: 28 },
    pin_2: { x: 6, y: 28 },
    pin_a: { x: -6, y: 28 },
    pin_b: { x: 6, y: 28 }
  },
  led_rgb: {
    pin_r: { x: -18, y: 28 },
    pin_1: { x: -18, y: 28 },
    pin_common: { x: -6, y: 28 },
    pin_cathode: { x: -6, y: 28 },
    pin_anode: { x: -6, y: 28 },
    pin_2: { x: -6, y: 28 },
    pin_b: { x: 6, y: 28 },
    pin_3: { x: 6, y: 28 },
    pin_g: { x: 18, y: 28 },
    pin_4: { x: 18, y: 28 }
  },
  dc_motor: {
    pin_1: { x: -10, y: 32 },
    pin_2: { x: 10, y: 32 },
    pin_neg: { x: -10, y: 32 },
    pin_pos: { x: 10, y: 32 }
  },
  arduino_uno: {
    // Top Digital Header Left (10 pins: SCL→D8, pitch=13, starting x=-113, y=-78)
    pin_scl:   { x: -113, y: -78 },
    pin_sda:   { x: -100, y: -78 },
    pin_aref:  { x:  -87, y: -78 },
    pin_gnd_3: { x:  -74, y: -78 },
    pin_gnd:   { x:  -74, y: -78 },
    pin_13:    { x:  -61, y: -78 },
    pin_d13:   { x:  -61, y: -78 },
    pin_12:    { x:  -48, y: -78 },
    pin_d12:   { x:  -48, y: -78 },
    pin_11:    { x:  -35, y: -78 },
    pin_d11:   { x:  -35, y: -78 },
    pin_10:    { x:  -22, y: -78 },
    pin_d10:   { x:  -22, y: -78 },
    pin_9:     { x:   -9, y: -78 },
    pin_d9:    { x:   -9, y: -78 },
    pin_8:     { x:    4, y: -78 },
    pin_d8:    { x:    4, y: -78 },

    // Top Digital Header Right (8 pins: D7→D0, pitch=13, starting x=24, y=-78)
    pin_7:  { x:  24, y: -78 },
    pin_d7: { x:  24, y: -78 },
    pin_6:  { x:  37, y: -78 },
    pin_d6: { x:  37, y: -78 },
    pin_5:  { x:  50, y: -78 },
    pin_d5: { x:  50, y: -78 },
    pin_4:  { x:  63, y: -78 },
    pin_d4: { x:  63, y: -78 },
    pin_3:  { x:  76, y: -78 },
    pin_d3: { x:  76, y: -78 },
    pin_2:  { x:  89, y: -78 },
    pin_d2: { x:  89, y: -78 },
    pin_1:  { x: 102, y: -78 },
    pin_d1: { x: 102, y: -78 },
    pin_tx: { x: 102, y: -78 },
    pin_0:  { x: 115, y: -78 },
    pin_d0: { x: 115, y: -78 },
    pin_rx: { x: 115, y: -78 },

    // Bottom Power Header (8 pins: NC→VIN, pitch=13, starting x=-67, y=78)
    pin_nc:    { x: -67, y: 78 },
    pin_ioref: { x: -54, y: 78 },
    pin_reset: { x: -41, y: 78 },
    pin_3v3:   { x: -28, y: 78 },
    pin_3v:    { x: -28, y: 78 },
    pin_5v:    { x: -15, y: 78 },
    pin_vcc:   { x: -15, y: 78 },
    pin_gnd_1: { x:  -2, y: 78 },
    pin_gnd_2: { x:  11, y: 78 },
    pin_vin:   { x:  24, y: 78 },

    // Bottom Analog Header (6 pins: A0→A5, pitch=13, starting x=50, y=78)
    pin_a0: { x:  50, y: 78 },
    pin_a1: { x:  63, y: 78 },
    pin_a2: { x:  76, y: 78 },
    pin_a3: { x:  89, y: 78 },
    pin_a4: { x: 102, y: 78 },
    pin_a5: { x: 115, y: 78 }
  }
};

export const BREADBOARD_DIMENSIONS = {
  START_X: 40,
  PITCH: 20,
  TOP_RAIL_POS_Y: 28,
  TOP_RAIL_NEG_Y: 48,
  ROW_A_Y: 82,
  ROW_F_Y: 194,
  BOT_RAIL_POS_Y: 308,
  BOT_RAIL_NEG_Y: 328
};

/**
 * Calculates live world (x, y) coordinates for any component pin
 */
export function getComponentPinWorldPos(comp, pinKey) {
  if (!comp) return { x: 0, y: 0 };
  const typeOffsets = COMPONENT_PIN_OFFSETS[comp.type] || {};
  const offset = typeOffsets[pinKey] || { x: 0, y: 0 };
  const rotated = rotatePoint(offset.x, offset.y, comp.rotation || 0);
  return {
    x: Math.round(comp.x + rotated.x),
    y: Math.round(comp.y + rotated.y)
  };
}

/**
 * Calculates live world (x, y) coordinates for any breadboard hole
 */
export function getBreadboardHoleWorldPos(bb, holeType, col, row) {
  if (!bb) return { x: 0, y: 0 };
  const { START_X, PITCH, TOP_RAIL_POS_Y, TOP_RAIL_NEG_Y, ROW_A_Y, ROW_F_Y, BOT_RAIL_POS_Y, BOT_RAIL_NEG_Y } = BREADBOARD_DIMENSIONS;
  const colIndex = Math.max(1, Number(col) || 1) - 1;
  const cx = START_X + colIndex * PITCH;
  let cy = ROW_A_Y;

  if (holeType === 'rail') {
    if (row === 'top_pos') cy = TOP_RAIL_POS_Y;
    else if (row === 'top_neg') cy = TOP_RAIL_NEG_Y;
    else if (row === 'bot_pos') cy = BOT_RAIL_POS_Y;
    else if (row === 'bot_neg') cy = BOT_RAIL_NEG_Y;
  } else {
    const topRows = ['a', 'b', 'c', 'd', 'e'];
    const botRows = ['f', 'g', 'h', 'i', 'j'];
    if (topRows.includes(row)) {
      cy = ROW_A_Y + topRows.indexOf(row) * PITCH;
    } else if (botRows.includes(row)) {
      cy = ROW_F_Y + botRows.indexOf(row) * PITCH;
    }
  }

  return {
    x: Math.round(bb.x + cx),
    y: Math.round(bb.y + cy)
  };
}

/**
 * Resolves any endpoint (component pin or breadboard hole) to its live current (x, y)
 */
export function getEndpointWorldPos(endpoint, components = [], breadboards = []) {
  if (!endpoint) return { x: 0, y: 0 };

  if (endpoint.type === 'component') {
    const comp = components.find(c => c.id === endpoint.compId);
    return getComponentPinWorldPos(comp, endpoint.pinKey);
  }

  if (endpoint.type === 'hole') {
    const bb = breadboards.find(b => b.id === endpoint.bbId);
    return getBreadboardHoleWorldPos(bb, endpoint.holeType, endpoint.col, endpoint.row);
  }

  // Fallback to static x, y if provided
  return {
    x: endpoint.x || 0,
    y: endpoint.y || 0
  };
}
