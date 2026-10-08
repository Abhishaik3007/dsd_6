/**
 * Dead Star Devs (DSD) - TinkerLab Circuits Simulation Engine
 * Graph-based nodal and closed-loop electrical solver.
 * Handles:
 * - Breadboard internal buses (power rails, columns a-e, f-j)
 * - Wires connecting component pins to breadboard holes or pin-to-pin
 * - Power sources (9V Battery, 3V Coin, 1.5V AA, DC Supply)
 * - Series resistors & variable potentiometers
 * - Switches (Tactile Pushbutton, Slide Switch SPDT)
 * - Diodes/LEDs (threshold voltage, polarity, overcurrent burnout)
 */

export const RESISTOR_COLORS = {
  0: { color: '#18181B', name: 'Black' },
  1: { color: '#854D0E', name: 'Brown' },
  2: { color: '#DC2626', name: 'Red' },
  3: { color: '#EA580C', name: 'Orange' },
  4: { color: '#EAB308', name: 'Yellow' },
  5: { color: '#16A34A', name: 'Green' },
  6: { color: '#2563EB', name: 'Blue' },
  7: { color: '#9333EA', name: 'Violet' },
  8: { color: '#6B7280', name: 'Gray' },
  9: { color: '#F8FAFC', name: 'White' },
};

export const RESISTOR_MULTIPLIERS = {
  0: { mult: 1, color: '#18181B' },       // 10^0 Black
  1: { mult: 10, color: '#854D0E' },      // 10^1 Brown
  2: { mult: 100, color: '#DC2626' },     // 10^2 Red
  3: { mult: 1000, color: '#EA580C' },    // 10^3 (1k) Orange
  4: { mult: 10000, color: '#EAB308' },   // 10^4 (10k) Yellow
  5: { mult: 100000, color: '#16A34A' },  // 10^5 (100k) Green
  6: { mult: 1000000, color: '#2563EB' }, // 10^6 (1M) Blue
};

export function getResistorColorBands(ohms = 220) {
  const val = Math.max(1, Math.round(Number(ohms) || 220));
  const s = val.toString();
  const digit1 = parseInt(s[0], 10);
  const digit2 = s.length > 1 ? parseInt(s[1], 10) : 0;
  const power = s.length - 2;
  const multBand = RESISTOR_MULTIPLIERS[Math.max(0, Math.min(6, power))] || RESISTOR_MULTIPLIERS[0];

  return [
    RESISTOR_COLORS[digit1]?.color || '#8B4513',
    RESISTOR_COLORS[digit2]?.color || '#000000',
    multBand.color,
    '#CFB53B' // Gold (5% tolerance)
  ];
}

/**
 * Returns canonical net ID for breadboard holes
 */
export function getBreadboardNetId(bbId, holeType, col, row) {
  if (holeType === 'rail') {
    return `bb_${bbId}_rail_${row}`;
  }
  const group = ['a', 'b', 'c', 'd', 'e'].includes(row) ? 'top' : 'bot';
  return `bb_${bbId}_col_${col}_${group}`;
}

/**
 * Get canonical node ID for an endpoint descriptor
 */
export function getEndpointNodeId(endpoint) {
  if (!endpoint) return null;
  if (endpoint.type === 'component') {
    return `comp_${endpoint.compId}_${endpoint.pinKey}`;
  }
  if (endpoint.type === 'hole') {
    return getBreadboardNetId(endpoint.bbId, endpoint.holeType, endpoint.col, endpoint.row);
  }
  return null;
}

/**
 * Solves circuit using graph adjacency and pathfinding for closed DC loops
 */
export function solveTinkerCircuit({ components = [], wires = [], breadboards = [], unoRuntimeStates = {} }) {
  // Graph adjacency list: node -> array of { neighbor, weight, type, compId }
  const adj = {};
  function addEdge(u, v, resistance = 0, type = 'wire', compId = null) {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push({ node: v, resistance, type, compId });
    adj[v].push({ node: u, resistance, type, compId });
  }

  // 1. Add all wires as zero-resistance connections
  wires.forEach(wire => {
    const u = getEndpointNodeId(wire.from);
    const v = getEndpointNodeId(wire.to);
    if (u && v && u !== v) {
      addEdge(u, v, 0, 'wire', wire.id);
    }
  });

  // 2. Add Resistors as resistive edges
  components.forEach(comp => {
    if (comp.type === 'resistor') {
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      const r = Number(comp.props?.resistance) || 220;
      addEdge(p1, p2, r, 'resistor', comp.id);
    } else if (comp.type === 'led') {
      const pAnode = `comp_${comp.id}_pin_anode`;
      const pCathode = `comp_${comp.id}_pin_cathode`;
      if (!adj[pAnode]) adj[pAnode] = [];
      if (!adj[pCathode]) adj[pCathode] = [];
      adj[pAnode].push({ node: pCathode, resistance: 5, type: 'diode_forward', compId: comp.id });
      adj[pCathode].push({ node: pAnode, resistance: 5, type: 'diode_reverse', compId: comp.id });
    } else if (comp.type === 'potentiometer') {
      const p1 = `comp_${comp.id}_pin_1`;
      const pw = `comp_${comp.id}_pin_wiper`;
      const p3 = `comp_${comp.id}_pin_3`;
      const maxR = Number(comp.props?.maxResistance || comp.props?.resistance) || 10000;
      const ratio = Math.max(0.01, Math.min(0.99, (comp.state?.value || 50) / 100));
      addEdge(p1, pw, Math.round(maxR * ratio), 'potentiometer', comp.id);
      addEdge(pw, p3, Math.round(maxR * (1 - ratio)), 'potentiometer', comp.id);
    } else if (comp.type === 'vibration_motor') {
      const pPos = `comp_${comp.id}_pin_pos`;
      const pNeg = `comp_${comp.id}_pin_neg`;
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      addEdge(pPos, p1, 0, 'pin_alias', comp.id);
      addEdge(pNeg, p2, 0, 'pin_alias', comp.id);
      addEdge(pPos, pNeg, 35, 'motor_coil', comp.id);
    } else if (comp.type === 'diode') {
      const pAnode = `comp_${comp.id}_pin_anode`;
      const pCathode = `comp_${comp.id}_pin_cathode`;
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      addEdge(pAnode, p1, 0, 'pin_alias', comp.id);
      addEdge(pCathode, p2, 0, 'pin_alias', comp.id);

      // Model forward drop & directional conduction
      if (!adj[pAnode]) adj[pAnode] = [];
      if (!adj[pCathode]) adj[pCathode] = [];
      adj[pAnode].push({ node: pCathode, resistance: 1, type: 'diode_forward', compId: comp.id });
      adj[pCathode].push({ node: pAnode, resistance: 1, type: 'diode_reverse', compId: comp.id });
    } else if (comp.type === 'photoresistor') {
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      const pa = `comp_${comp.id}_pin_a`;
      const pb = `comp_${comp.id}_pin_b`;
      addEdge(p1, pa, 0, 'pin_alias', comp.id);
      addEdge(p2, pb, 0, 'pin_alias', comp.id);

      // Light-dependent resistance (GL5528 CdS response curve: 400Ω in full sun to 500kΩ in dark)
      const light = comp.state?.light ?? (comp.props?.light ?? 50);
      const clampedLight = Math.max(0, Math.min(100, Number(light) || 0));
      const r = Math.round(400 * Math.pow(500000 / 400, (100 - clampedLight) / 100));
      addEdge(p1, p2, r, 'photoresistor', comp.id);
    } else if (comp.type === 'led_rgb') {
      const pr = `comp_${comp.id}_pin_r`;
      const pcom = `comp_${comp.id}_pin_common`;
      const pb = `comp_${comp.id}_pin_b`;
      const pg = `comp_${comp.id}_pin_g`;
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      const p3 = `comp_${comp.id}_pin_3`;
      const p4 = `comp_${comp.id}_pin_4`;
      addEdge(pr, p1, 0, 'pin_alias', comp.id);
      addEdge(pcom, p2, 0, 'pin_alias', comp.id);
      addEdge(pcom, `comp_${comp.id}_pin_cathode`, 0, 'pin_alias', comp.id);
      addEdge(pcom, `comp_${comp.id}_pin_anode`, 0, 'pin_alias', comp.id);
      addEdge(pb, p3, 0, 'pin_alias', comp.id);
      addEdge(pg, p4, 0, 'pin_alias', comp.id);
    } else if (comp.type === 'dc_motor') {
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      const pPos = `comp_${comp.id}_pin_pos`;
      const pNeg = `comp_${comp.id}_pin_neg`;
      addEdge(p1, pNeg, 0, 'pin_alias', comp.id);
      addEdge(p2, pPos, 0, 'pin_alias', comp.id);
      addEdge(p1, p2, 20, 'motor_coil', comp.id);
    } else if (comp.type === 'arduino_uno') {
      const gnd1 = `comp_${comp.id}_pin_gnd_1`;
      const gnd2 = `comp_${comp.id}_pin_gnd_2`;
      const gnd3 = `comp_${comp.id}_pin_gnd_3`;
      const gndTop = `comp_${comp.id}_pin_gnd`;
      addEdge(gnd1, gnd2, 0, 'arduino_gnd_bus', comp.id);
      addEdge(gnd1, gnd3, 0, 'arduino_gnd_bus', comp.id);
      addEdge(gnd3, gndTop, 0, 'pin_alias', comp.id);

      // Digital aliases (d0-d13 <-> 0-13)
      for (let i = 0; i <= 13; i++) {
        addEdge(`comp_${comp.id}_pin_${i}`, `comp_${comp.id}_pin_d${i}`, 0, 'pin_alias', comp.id);
      }
      // Analog aliases (a0-a5 <-> 14-19)
      for (let i = 0; i <= 5; i++) {
        addEdge(`comp_${comp.id}_pin_a${i}`, `comp_${comp.id}_pin_${14 + i}`, 0, 'pin_alias', comp.id);
        addEdge(`comp_${comp.id}_pin_a${i}`, `comp_${comp.id}_pin_d${14 + i}`, 0, 'pin_alias', comp.id);
      }
      addEdge(`comp_${comp.id}_pin_5v`, `comp_${comp.id}_pin_vcc`, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_3v3`, `comp_${comp.id}_pin_3v`, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_1`, `comp_${comp.id}_pin_tx`, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_0`, `comp_${comp.id}_pin_rx`, 0, 'pin_alias', comp.id);
    } else if (comp.type === 'capacitor') {
      const pCathode = `comp_${comp.id}_pin_cathode`;
      const pAnode = `comp_${comp.id}_pin_anode`;
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`;
      addEdge(pCathode, p1, 0, 'pin_alias', comp.id);
      addEdge(pAnode, p2, 0, 'pin_alias', comp.id);
    } else if (comp.type === 'transistor_npn' || comp.type === 'transistor') {
      const pc = `comp_${comp.id}_pin_collector`;
      const pb = `comp_${comp.id}_pin_base`;
      const pe = `comp_${comp.id}_pin_emitter`;
      addEdge(`comp_${comp.id}_pin_c`, pc, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_1`, pc, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_b`, pb, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_2`, pb, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_e`, pe, 0, 'pin_alias', comp.id);
      addEdge(`comp_${comp.id}_pin_3`, pe, 0, 'pin_alias', comp.id);
    }
  });

  // 3. Add Switches (Pushbutton and Slide Switch)
  components.forEach(comp => {
    if (comp.type === 'pushbutton') {
      const p1a = `comp_${comp.id}_pin_1a`;
      const p1b = `comp_${comp.id}_pin_1b`;
      const p2a = `comp_${comp.id}_pin_2a`;
      const p2b = `comp_${comp.id}_pin_2b`;
      // Internally tied sides
      addEdge(p1a, p1b, 0, 'switch_bus', comp.id);
      addEdge(p2a, p2b, 0, 'switch_bus', comp.id);
      // Contact made when pressed
      if (comp.state?.isPressed) {
        addEdge(p1a, p2a, 0, 'switch_closed', comp.id);
      }
    } else if (comp.type === 'slideswitch') {
      const p1 = `comp_${comp.id}_pin_1`;
      const p2 = `comp_${comp.id}_pin_2`; // Common
      const p3 = `comp_${comp.id}_pin_3`;
      if (comp.state?.position === 'left' || !comp.state?.position) {
        addEdge(p1, p2, 0, 'switch_closed', comp.id);
      } else if (comp.state?.position === 'right') {
        addEdge(p2, p3, 0, 'switch_closed', comp.id);
      }
    }
  });

  // 4. Identify Power Sources
  const powerSources = components.filter(c => ['battery_9v', 'battery_coin', 'battery_aa', 'powersupply'].includes(c.type));

  // Add Arduino Uno Power Rails (5V, 3.3V, and dynamic digital/PWM pins)
  components.forEach(comp => {
    if (comp.type === 'arduino_uno') {
      const unoRuntime = unoRuntimeStates?.[comp.id] || comp.state?.unoRuntime;
      // 5V and 3.3V power rails are always live when Arduino is powered
      powerSources.push({
        id: `${comp.id}_5v`,
        type: 'arduino_5v',
        voltage: 5.0,
        posNode: `comp_${comp.id}_pin_5v`,
        negNode: `comp_${comp.id}_pin_gnd_1`
      });
      powerSources.push({
        id: `${comp.id}_3v3`,
        type: 'arduino_3v3',
        voltage: 3.3,
        posNode: `comp_${comp.id}_pin_3v3`,
        negNode: `comp_${comp.id}_pin_gnd_1`
      });

      // Dynamic digital/PWM pins (0 to 13) driven by Arduino code
      const pinVoltages = unoRuntime?.pinVoltages || (comp.props?.code ? {} : { 13: 5.0 });
      for (let p = 0; p <= 13; p++) {
        const v = pinVoltages[p];
        if (v && v > 0) {
          powerSources.push({
            id: `${comp.id}_d${p}`,
            type: `arduino_d${p}`,
            voltage: v,
            posNode: `comp_${comp.id}_pin_${p}`,
            negNode: `comp_${comp.id}_pin_gnd_1`
          });
        }
      }
    }
  });

  // Find shortest path / total series resistance between two nodes
  function findPathResistance(startNode, endNode, forbiddenTypes = []) {
    if (!adj[startNode] || !adj[endNode]) return { connected: false, resistance: Infinity };
    const dist = { [startNode]: 0 };
    const queue = [{ node: startNode, r: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
      queue.sort((a, b) => a.r - b.r);
      const curr = queue.shift();

      if (curr.node === endNode) {
        return { connected: true, resistance: curr.r };
      }

      if (visited.has(curr.node)) continue;
      visited.add(curr.node);

      for (const edge of (adj[curr.node] || [])) {
        if (forbiddenTypes.includes(edge.type)) continue;
        const newR = curr.r + edge.resistance;
        if (dist[edge.node] === undefined || newR < dist[edge.node]) {
          dist[edge.node] = newR;
          queue.push({ node: edge.node, r: newR });
        }
      }
    }

    return { connected: false, resistance: Infinity };
  }

  // 4.5 Evaluate Transistors (BJT NPN 2N2222: Base-Emitter threshold triggers Collector-Emitter conduction)
  const transistorStates = {};
  components.forEach(comp => {
    if (comp.type === 'transistor_npn' || comp.type === 'transistor') {
      const pc = `comp_${comp.id}_pin_collector`;
      const pb = `comp_${comp.id}_pin_base`;
      const pe = `comp_${comp.id}_pin_emitter`;

      let isConducting = false;
      let baseCurrentMa = 0;
      let vBe = 0;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        // Base-Emitter circuit check
        const toBase = findPathResistance(posNode, pb, ['diode_reverse']);
        const fromEmitter = findPathResistance(pe, negNode, ['diode_reverse']);

        if (toBase.connected && fromEmitter.connected) {
          const totalLoopR = toBase.resistance + fromEmitter.resistance;
          const drop = 0.65; // ~0.65V to 0.7V V_be forward diode drop
          if (vSrc >= drop) {
            const currentA = (vSrc - drop) / Math.max(10, totalLoopR);
            baseCurrentMa = currentA * 1000;
            vBe = drop;
            if (baseCurrentMa >= 0.05) { // 50 uA activates BJT saturation
              isConducting = true;
              break;
            }
          }
        }
      }

      if (isConducting) {
        // Transistor turns ON / Saturated: close switch between Collector and Emitter (R_ce_sat ~ 1.5 ohm)
        addEdge(pc, pe, 1.5, 'transistor_ce_on', comp.id);
      }

      transistorStates[comp.id] = {
        isConducting,
        isSaturated: isConducting,
        baseCurrentMa: Math.round(baseCurrentMa * 10) / 10,
        collectorCurrentMa: 0,
        vBe: Math.round(vBe * 100) / 100,
        vCe: isConducting ? 0.2 : 0
      };
    }
  });

  // 5. Evaluate LEDs & Loads
  const componentStates = {};
  let totalActiveCurrentMa = 0;
  let hasClosedCircuit = false;

  components.forEach(comp => {
    if (comp.type === 'led') {
      const anodeNode = `comp_${comp.id}_pin_anode`;
      const cathodeNode = `comp_${comp.id}_pin_cathode`;

      let isLit = false;
      let isBurnedOut = false;
      let currentMa = 0;
      let supplyVoltage = 0;

      // Check all active power sources
      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        // Path from Positive Source -> Anode (must not traverse diode backwards)
        const toAnode = findPathResistance(posNode, anodeNode, ['diode_reverse']);
        // Path from Cathode -> Negative Source (must not traverse diode backwards)
        const fromCathode = findPathResistance(cathodeNode, negNode, ['diode_reverse']);

        if (toAnode.connected && fromCathode.connected) {
          supplyVoltage = vSrc;
          hasClosedCircuit = true;
          const totalSeriesR = toAnode.resistance + fromCathode.resistance;
          const forwardV = 2.0;

          if (vSrc >= forwardV) {
            if (totalSeriesR > 0) {
              currentMa = ((vSrc - forwardV) / totalSeriesR) * 1000;
              if (currentMa >= 1.5) {
                isLit = true;
              }
              if (currentMa > 40) {
                isBurnedOut = true; // Overcurrent threshold
              }
            } else {
              // Direct short circuit across battery without resistor!
              isLit = true;
              if (vSrc >= 3.0) {
                isBurnedOut = true;
              }
              currentMa = 200; // Simulated dangerous surge
            }
          }
          break;
        }
      }

      componentStates[comp.id] = {
        isLit,
        isBurnedOut,
        currentMa: Math.round(currentMa * 10) / 10,
        voltage: supplyVoltage
      };

      if (isLit) {
        totalActiveCurrentMa += currentMa;
      }
    } else if (comp.type === 'led_rgb') {
      const isCommonCathode = (comp.props?.common || 'cathode') === 'cathode';
      const rNode = `comp_${comp.id}_pin_r`;
      const comNode = `comp_${comp.id}_pin_common`;
      const bNode = `comp_${comp.id}_pin_b`;
      const gNode = `comp_${comp.id}_pin_g`;

      let rLit = false, gLit = false, bLit = false;
      let rBurned = false, gBurned = false, bBurned = false;
      let rCurrent = 0, gCurrent = 0, bCurrent = 0;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        const evalChannel = (channelNode, forwardV) => {
          let lit = false, burned = false, cur = 0;
          const toAnode = isCommonCathode
            ? findPathResistance(posNode, channelNode, ['diode_reverse'])
            : findPathResistance(posNode, comNode, ['diode_reverse']);
          const fromCathode = isCommonCathode
            ? findPathResistance(comNode, negNode, ['diode_reverse'])
            : findPathResistance(channelNode, negNode, ['diode_reverse']);

          if (toAnode.connected && fromCathode.connected) {
            hasClosedCircuit = true;
            const totalR = toAnode.resistance + fromCathode.resistance;
            if (vSrc >= forwardV) {
              if (totalR > 0) {
                cur = ((vSrc - forwardV) / totalR) * 1000;
                if (cur >= 1.5) lit = true;
                if (cur > 40) burned = true;
              } else {
                lit = true;
                if (vSrc >= 3.0) burned = true;
                cur = 200;
              }
            }
          }
          return { lit, burned, cur };
        };

        const rRes = evalChannel(rNode, 2.0);
        if (rRes.lit) { rLit = true; rBurned = rRes.burned; rCurrent = rRes.cur; }

        const gRes = evalChannel(gNode, 3.0);
        if (gRes.lit) { gLit = true; gBurned = gRes.burned; gCurrent = gRes.cur; }

        const bRes = evalChannel(bNode, 3.0);
        if (bRes.lit) { bLit = true; bBurned = bRes.burned; bCurrent = bRes.cur; }
      }

      const isLit = rLit || gLit || bLit;
      const isBurnedOut = rBurned || gBurned || bBurned;
      const totalRgbCurrent = rCurrent + gCurrent + bCurrent;

      componentStates[comp.id] = {
        isLit,
        isBurnedOut,
        rLit,
        gLit,
        bLit,
        rCurrent: Math.round(rCurrent * 10) / 10,
        gCurrent: Math.round(gCurrent * 10) / 10,
        bCurrent: Math.round(bCurrent * 10) / 10,
        totalCurrentMa: Math.round(totalRgbCurrent * 10) / 10
      };

      if (isLit) {
        totalActiveCurrentMa += totalRgbCurrent;
      }
    } else if (comp.type === 'vibration_motor') {
      const posMotorNode = `comp_${comp.id}_pin_pos`;
      const negMotorNode = `comp_${comp.id}_pin_neg`;

      let isVibrating = false;
      let isBurnedOut = false;
      let currentMa = 0;
      let motorVoltage = 0;
      let rpm = 0;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        // Direct or through series circuit (forbid motor coil and reverse diode)
        const toPos = findPathResistance(posNode, posMotorNode, ['motor_coil', 'diode_reverse']);
        const fromNeg = findPathResistance(negMotorNode, negNode, ['motor_coil', 'diode_reverse']);

        const toPosRev = findPathResistance(posNode, negMotorNode, ['motor_coil', 'diode_reverse']);
        const fromNegRev = findPathResistance(posMotorNode, negNode, ['motor_coil', 'diode_reverse']);

        const isForward = toPos.connected && fromNeg.connected;
        const isReverse = toPosRev.connected && fromNegRev.connected;

        if (isForward || isReverse) {
          hasClosedCircuit = true;
          const seriesR = isForward
            ? (toPos.resistance + fromNeg.resistance)
            : (toPosRev.resistance + fromNegRev.resistance);
          const motorInternalR = 35; // ~35 ohms micro motor coil

          const totalR = seriesR + motorInternalR;
          const currentA = vSrc / totalR;
          currentMa = currentA * 1000;
          motorVoltage = currentA * motorInternalR;

          // ERM micro vibration motor starts around 0.8V - 1.0V
          if (motorVoltage >= 0.8) {
            isVibrating = true;
            rpm = Math.round(Math.min(22000, (motorVoltage / 3.0) * 11000));
          }

          // 9V battery direct connection is over-driven (~250mA, runs hot and spins fast)
          if (motorVoltage > 16.0) {
            isBurnedOut = true;
          }

          break;
        }
      }

      componentStates[comp.id] = {
        isVibrating,
        isBurnedOut,
        isOverdriven: motorVoltage > 5.5,
        currentMa: Math.round(currentMa * 10) / 10,
        voltage: Math.round(motorVoltage * 10) / 10,
        rpm
      };

      if (isVibrating) {
        totalActiveCurrentMa += currentMa;
      }
    } else if (comp.type === 'diode') {
      const anodeNode = `comp_${comp.id}_pin_anode`;
      const cathodeNode = `comp_${comp.id}_pin_cathode`;

      let isConducting = false;
      let isBlocking = false;
      let isBurnedOut = false;
      let currentMa = 0;
      let voltageDrop = 0;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        // Check Forward Bias (+ -> Anode, and Cathode -> -)
        const toAnodeFwd = findPathResistance(posNode, anodeNode, ['diode_reverse']);
        const fromCathodeFwd = findPathResistance(cathodeNode, negNode, ['diode_reverse']);

        // Check Reverse Bias (+ -> Cathode, and Anode -> -)
        const toCathodeRev = findPathResistance(posNode, cathodeNode, ['diode_reverse']);
        const fromAnodeRev = findPathResistance(anodeNode, negNode, ['diode_reverse']);

        if (toAnodeFwd.connected && fromCathodeFwd.connected) {
          hasClosedCircuit = true;
          const totalSeriesR = toAnodeFwd.resistance + fromCathodeFwd.resistance;
          const vf = comp.props?.model === '1N5819' ? 0.35 : (comp.props?.model === '1N4148' ? 0.65 : 0.7);

          if (vSrc >= vf) {
            voltageDrop = vf;
            if (totalSeriesR > 2) {
              currentMa = ((vSrc - vf) / totalSeriesR) * 1000;
              isConducting = true;
              if (currentMa > 1500) {
                isBurnedOut = true;
              }
            } else {
              // Direct short circuit across power source
              isConducting = true;
              if (vSrc >= 3.0) {
                isBurnedOut = true;
              }
              currentMa = 1000;
            }
          }
          break;
        } else if (toCathodeRev.connected && fromAnodeRev.connected) {
          // Reverse-biased: effectively blocks reverse current!
          isBlocking = true;
          voltageDrop = vSrc;
          break;
        }
      }

      componentStates[comp.id] = {
        isConducting,
        isBlocking,
        isBurnedOut,
        currentMa: Math.round(currentMa * 10) / 10,
        voltageDrop: Math.round(voltageDrop * 100) / 100
      };

      if (isConducting) {
        totalActiveCurrentMa += currentMa;
      }
    } else if (comp.type === 'photoresistor') {
      const light = comp.state?.light ?? (comp.props?.light ?? 50);
      const clampedLight = Math.max(0, Math.min(100, Number(light) || 0));
      const r = Math.round(400 * Math.pow(500000 / 400, (100 - clampedLight) / 100));
      componentStates[comp.id] = {
        light: clampedLight,
        resistance: r
      };
    } else if (comp.type === 'dc_motor') {
      const pin1Node = `comp_${comp.id}_pin_1`;
      const pin2Node = `comp_${comp.id}_pin_2`;

      let isSpinning = false;
      let isBurnedOut = false;
      let isOverdriven = false;
      let direction = 'cw';
      let rpm = 0;
      let currentMa = 0;
      let motorVoltage = 0;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        // CW (Forward): Pin 2 (Red/Pos) to (+), Pin 1 (Black/Neg) to (-)
        const toPin2 = findPathResistance(posNode, pin2Node, ['motor_coil', 'diode_reverse']);
        const fromPin1 = findPathResistance(pin1Node, negNode, ['motor_coil', 'diode_reverse']);

        // CCW (Reverse): Pin 1 (Black/Neg) to (+), Pin 2 (Red/Pos) to (-)
        const toPin1 = findPathResistance(posNode, pin1Node, ['motor_coil', 'diode_reverse']);
        const fromPin2 = findPathResistance(pin2Node, negNode, ['motor_coil', 'diode_reverse']);

        const isCW = toPin2.connected && fromPin1.connected;
        const isCCW = toPin1.connected && fromPin2.connected;

        if (isCW || isCCW) {
          hasClosedCircuit = true;
          direction = isCW ? 'cw' : 'ccw';
          const seriesR = isCW
            ? (toPin2.resistance + fromPin1.resistance)
            : (toPin1.resistance + fromPin2.resistance);
          const motorInternalR = 20; // 20 ohms hobby motor internal coil resistance

          const totalR = seriesR + motorInternalR;
          const currentA = vSrc / totalR;
          currentMa = currentA * 1000;
          motorVoltage = currentA * motorInternalR;

          // 130 Hobby DC motor starts spinning around 1.0V
          if (motorVoltage >= 1.0) {
            isSpinning = true;
            rpm = Math.min(25000, Math.round(motorVoltage * 1950));
          }

          if (motorVoltage > 9.5) {
            isOverdriven = true;
          }

          if (motorVoltage > 16.0) {
            isBurnedOut = true;
          }

          break;
        }
      }

      componentStates[comp.id] = {
        isSpinning,
        isBurnedOut,
        isOverdriven,
        direction,
        currentMa: Math.round(currentMa * 10) / 10,
        voltage: Math.round(motorVoltage * 10) / 10,
        rpm
      };

      if (isSpinning) {
        totalActiveCurrentMa += currentMa;
      }
    } else if (comp.type === 'arduino_uno') {
      const unoRuntime = unoRuntimeStates?.[comp.id] || comp.state?.unoRuntime;

      // Solve external voltages reaching Arduino pins (0-13 digital, a0-a5 analog)
      const solvedPinVoltages = {};
      const pinsToSolve = [
        ...Array.from({ length: 14 }, (_, i) => ({ id: i, node: `comp_${comp.id}_pin_${i}` })),
        ...Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, node: `comp_${comp.id}_pin_a${i}` }))
      ];

      pinsToSolve.forEach(({ id, node }) => {
        let maxV = 0;
        for (const pSrc of powerSources) {
          // If this pin itself is driving voltage as OUTPUT, do not treat itself as external input
          if (pSrc.posNode === node) continue;

          let vSrc = pSrc.voltage || 5;
          if (pSrc.type === 'battery_9v') vSrc = 9;
          if (pSrc.type === 'battery_coin') vSrc = 3;
          if (pSrc.type === 'battery_aa') vSrc = 1.5;

          const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
          const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

          const toPos = findPathResistance(posNode, node, ['diode_reverse']);
          const toNeg = findPathResistance(node, negNode, ['diode_reverse']);

          if (toPos.connected && toNeg.connected) {
            const totalR = toPos.resistance + toNeg.resistance;
            const v = totalR > 0 ? (vSrc * (toNeg.resistance / totalR)) : vSrc;
            if (v > maxV) maxV = v;
          } else if (toPos.connected) {
            if (vSrc > maxV) maxV = vSrc;
          }
        }
        const roundedV = Math.round(maxV * 100) / 100;
        solvedPinVoltages[id] = roundedV;
        if (typeof id === 'string' && id.startsWith('a')) {
          const numIdx = 14 + parseInt(id.slice(1), 10);
          solvedPinVoltages[numIdx] = roundedV;
        }
      });

      componentStates[comp.id] = {
        isOn: true,
        isUsbConnected: true,
        lLedState: unoRuntime ? Boolean(unoRuntime.lLedState) : true,
        txLedState: unoRuntime ? Boolean(unoRuntime.txLedState) : false,
        rxLedState: unoRuntime ? Boolean(unoRuntime.rxLedState) : false,
        pinVoltages: unoRuntime?.pinVoltages || { 13: 5.0 },
        solvedPinVoltages,
        v5v: 5.0,
        v3v3: 3.3
      };
    } else if (comp.type === 'transistor_npn' || comp.type === 'transistor') {
      const tState = transistorStates[comp.id] || { isConducting: false, isSaturated: false };
      const pc = `comp_${comp.id}_pin_collector`;
      const pe = `comp_${comp.id}_pin_emitter`;

      let collectorCurrentMa = 0;
      if (tState.isConducting) {
        // Measure collector current from power sources through collector-emitter
        for (const pSrc of powerSources) {
          let vSrc = pSrc.voltage || 5;
          if (pSrc.type === 'battery_9v') vSrc = 9;
          if (pSrc.type === 'battery_coin') vSrc = 3;
          if (pSrc.type === 'battery_aa') vSrc = 1.5;

          const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
          const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

          const toCollector = findPathResistance(posNode, pc, ['diode_reverse']);
          const fromEmitter = findPathResistance(pe, negNode, ['diode_reverse']);

          if (toCollector.connected && fromEmitter.connected) {
            const totalR = toCollector.resistance + fromEmitter.resistance + 1.5;
            if (totalR > 0) {
              collectorCurrentMa = ((vSrc - 0.2) / totalR) * 1000;
              break;
            }
          }
        }
      }

      componentStates[comp.id] = {
        isConducting: tState.isConducting,
        isSaturated: tState.isSaturated,
        baseCurrentMa: tState.baseCurrentMa,
        collectorCurrentMa: Math.round(collectorCurrentMa * 10) / 10,
        vBe: tState.vBe,
        vCe: tState.vCe
      };

      if (tState.isConducting) {
        hasClosedCircuit = true;
        totalActiveCurrentMa += collectorCurrentMa;
      }
    } else if (comp.type === 'capacitor') {
      const pCathode = `comp_${comp.id}_pin_cathode`;
      const pAnode = `comp_${comp.id}_pin_anode`;
      let capVoltage = 0;
      let isReversePolarized = false;

      for (const pSrc of powerSources) {
        let vSrc = pSrc.voltage || 5;
        if (pSrc.type === 'battery_9v') vSrc = 9;
        if (pSrc.type === 'battery_coin') vSrc = 3;
        if (pSrc.type === 'battery_aa') vSrc = 1.5;

        const posNode = pSrc.posNode || `comp_${pSrc.id}_pin_pos`;
        const negNode = pSrc.negNode || `comp_${pSrc.id}_pin_neg`;

        const toAnode = findPathResistance(posNode, pAnode, ['diode_reverse']);
        const toCathode = findPathResistance(pCathode, negNode, ['diode_reverse']);
        const toRevAnode = findPathResistance(posNode, pCathode, ['diode_reverse']);
        const toRevCathode = findPathResistance(pAnode, negNode, ['diode_reverse']);

        if (toAnode.connected && toCathode.connected) {
          capVoltage = vSrc;
        } else if (toRevAnode.connected && toRevCathode.connected) {
          capVoltage = vSrc;
          isReversePolarized = true;
        }
      }

      componentStates[comp.id] = {
        voltage: capVoltage,
        isCharged: capVoltage > 0,
        isReversePolarized
      };
    }
  });

  return {
    hasClosedCircuit,
    totalCurrentMa: Math.round(totalActiveCurrentMa * 10) / 10,
    componentStates
  };
}
