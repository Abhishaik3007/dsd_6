import { solveTinkerCircuit } from './tinkerSolver.js';
import { transpileArduino, ArduinoRunner, ARDUINO_PRESETS } from './arduinoRuntime.js';

console.log('=== TINKERLAB ENGINE & COMPONENT AUDIT ===\n');

let passCount = 0;
let failCount = 0;

function assert(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${desc}`);
    failCount++;
  }
}

// TEST 1: Basic LED Circuit (9V Battery + 220Ω Resistor + Red LED)
const test1 = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v', props: {} },
    { id: 'res_1', type: 'resistor', props: { resistance: 220 } },
    { id: 'led_1', type: 'led', props: { color: 'red' } }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Basic LED is lit', test1.componentStates.led_1.isLit === true);
assert('Basic LED is not burned out', test1.componentStates.led_1.isBurnedOut === false);
assert('Basic LED current is ~31.8mA', test1.componentStates.led_1.currentMa >= 30 && test1.componentStates.led_1.currentMa <= 33);
assert('Total loop current recorded', test1.hasClosedCircuit === true);

// TEST 2: Pushbutton LED Circuit (Unpressed vs Pressed)
const test2_unpressed = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v', props: {} },
    { id: 'btn_1', type: 'pushbutton', state: { isPressed: false } },
    { id: 'res_1', type: 'resistor', props: { resistance: 330 } },
    { id: 'led_1', type: 'led', props: { color: 'green' } }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' } },
    { from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Pushbutton unpressed: LED is OFF', test2_unpressed.componentStates.led_1.isLit === false);

const test2_pressed = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v', props: {} },
    { id: 'btn_1', type: 'pushbutton', state: { isPressed: true } },
    { id: 'res_1', type: 'resistor', props: { resistance: 330 } },
    { id: 'led_1', type: 'led', props: { color: 'green' } }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' } },
    { from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Pushbutton pressed: LED is ON', test2_pressed.componentStates.led_1.isLit === true);

// TEST 3: Diode Forward Bias vs Reverse Bias
const test3_fwd = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'd1', type: 'diode', props: { model: '1N4007' } },
    { id: 'res_1', type: 'resistor', props: { resistance: 470 } },
    { id: 'led_1', type: 'led' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'd1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'd1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Diode Forward Bias conducts', test3_fwd.componentStates.d1.isConducting === true);
assert('Diode Forward Bias LED is lit', test3_fwd.componentStates.led_1.isLit === true);

const test3_rev = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'd1', type: 'diode', props: { model: '1N4007' } },
    { id: 'res_1', type: 'resistor', props: { resistance: 470 } },
    { id: 'led_1', type: 'led' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'd1', pinKey: 'pin_cathode' } },
    { from: { type: 'component', compId: 'd1', pinKey: 'pin_anode' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Diode Reverse Bias blocks', test3_rev.componentStates.d1.isBlocking === true);
assert('Diode Reverse Bias LED stays OFF', test3_rev.componentStates.led_1.isLit === false);

// TEST 4: Vibration Motor & DC Motor
const test4_motor = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_coin' },
    { id: 'vm_1', type: 'vibration_motor' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'vm_1', pinKey: 'pin_pos' } },
    { from: { type: 'component', compId: 'vm_1', pinKey: 'pin_neg' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Vibration motor vibrates on 3V coin', test4_motor.componentStates.vm_1.isVibrating === true);
assert('Vibration motor rpm is realistic', test4_motor.componentStates.vm_1.rpm > 5000);

// TEST 5: NPN Transistor Switch (2N2222)
const test5_npn = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'btn_1', type: 'pushbutton', state: { isPressed: true } },
    { id: 'res_base', type: 'resistor', props: { resistance: 1000 } },
    { id: 'q1', type: 'transistor_npn', props: { model: '2N2222' } },
    { id: 'res_load', type: 'resistor', props: { resistance: 330 } },
    { id: 'led_1', type: 'led' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' } },
    { from: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' }, to: { type: 'component', compId: 'res_load', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' }, to: { type: 'component', compId: 'res_base', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_base', pinKey: 'pin_2' }, to: { type: 'component', compId: 'q1', pinKey: 'pin_b' } },
    { from: { type: 'component', compId: 'res_load', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'q1', pinKey: 'pin_c' } },
    { from: { type: 'component', compId: 'q1', pinKey: 'pin_e' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('NPN Transistor conducts when Base is driven', test5_npn.componentStates.q1.isConducting === true);
assert('NPN Transistor turns on load LED', test5_npn.componentStates.led_1.isLit === true);

// TEST 6: Arduino Potentiometer Analog Voltage Divider Solver
const test6_pot_adc = solveTinkerCircuit({
  components: [
    { id: 'uno_1', type: 'arduino_uno' },
    { id: 'pot_1', type: 'potentiometer', state: { value: 50 }, props: { maxResistance: 10000 } }
  ],
  wires: [
    { from: { type: 'component', compId: 'uno_1', pinKey: 'pin_5v' }, to: { type: 'component', compId: 'pot_1', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'pot_1', pinKey: 'pin_wiper' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_a0' } },
    { from: { type: 'component', compId: 'pot_1', pinKey: 'pin_3' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_1' } }
  ]
});
const a0_v = test6_pot_adc.componentStates.uno_1.solvedPinVoltages['a0'];
assert(`Arduino A0 reads 2.5V from 50% Potentiometer (actual: ${a0_v}V)`, a0_v >= 2.4 && a0_v <= 2.6);

// TEST 6.5: RGB LED (Common Cathode Red + Blue)
const test_rgb = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'res_r', type: 'resistor', props: { resistance: 330 } },
    { id: 'res_b', type: 'resistor', props: { resistance: 330 } },
    { id: 'rgb_1', type: 'led_rgb', props: { common: 'cathode' } }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'res_r', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'res_b', pinKey: 'pin_1' } },
    { from: { type: 'component', compId: 'res_r', pinKey: 'pin_2' }, to: { type: 'component', compId: 'rgb_1', pinKey: 'pin_r' } },
    { from: { type: 'component', compId: 'res_b', pinKey: 'pin_2' }, to: { type: 'component', compId: 'rgb_1', pinKey: 'pin_b' } },
    { from: { type: 'component', compId: 'rgb_1', pinKey: 'pin_common' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('RGB LED lights up Red & Blue channels', test_rgb.componentStates.rgb_1.rLit === true && test_rgb.componentStates.rgb_1.bLit === true);
assert('RGB LED Green channel remains off', test_rgb.componentStates.rgb_1.gLit === false);

// TEST 6.6: DC Motor Spinning
const test_dc = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'dc_1', type: 'dc_motor' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'dc_1', pinKey: 'pin_pos' } },
    { from: { type: 'component', compId: 'dc_1', pinKey: 'pin_neg' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('DC Motor is spinning on 9V battery', test_dc.componentStates.dc_1.isSpinning === true);
assert('DC Motor direction is CW when pos connected to pin_pos', test_dc.componentStates.dc_1.direction === 'cw');

// TEST 6.7: Breadboard Rails & Tie-Points Distribution Test
const test_bb = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'res_1', type: 'resistor', props: { resistance: 330 } },
    { id: 'led_1', type: 'led' }
  ],
  breadboards: [{ id: 'bb_1' }],
  wires: [
    // 9V (+) -> Breadboard Power Rail (+) at column 2
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 2, row: 'top_pos' } },
    // Resistor Pin 1 plugged into Breadboard Power Rail (+) at column 28 (distant column on same rail)
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_1' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 28, row: 'top_pos' } },
    // Resistor Pin 2 plugged into Column 12 row A
    { from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'column', col: 12, row: 'a' } },
    // LED Anode plugged into Column 12 row D (same column group top)
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'column', col: 12, row: 'd' } },
    // LED Cathode plugged into Column 18 row B
    { from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'column', col: 18, row: 'b' } },
    // Wire from Column 18 row E (same column group top) to Breadboard Power Rail (-) at col 18
    { from: { type: 'hole', bbId: 'bb_1', holeType: 'column', col: 18, row: 'e' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 18, row: 'top_neg' } },
    // 9V (-) connected to Breadboard Power Rail (-) at col 1
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' }, to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 1, row: 'top_neg' } }
  ]
});
assert('Breadboard power rail and tie-point columns conduct circuit', test_bb.componentStates.led_1.isLit === true);
assert('Breadboard LED current is normal', test_bb.componentStates.led_1.currentMa >= 15 && test_bb.componentStates.led_1.currentMa <= 35);

// TEST 6.8: Capacitor Voltage & Charge Solving
const test_cap = solveTinkerCircuit({
  components: [
    { id: 'bat_1', type: 'battery_9v' },
    { id: 'cap_1', type: 'capacitor' }
  ],
  wires: [
    { from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'cap_1', pinKey: 'pin_anode' } },
    { from: { type: 'component', compId: 'cap_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' } }
  ]
});
assert('Capacitor charges to source voltage', test_cap.componentStates.cap_1.isCharged === true);
assert('Capacitor voltage is 9V', test_cap.componentStates.cap_1.voltage === 9);

// TEST 7: Arduino Runner AnalogRead & DigitalRead Execution
const transpiledCode = transpileArduino(`
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}
void loop() {
  int val = analogRead(A0);
  int btn = digitalRead(2);
  if (val > 500 && btn == HIGH) {
    digitalWrite(13, HIGH);
  }
}
`);
assert('Transpiler converted A0 and setup/loop', transpiledCode.includes('runHarness'));

const runner = new ArduinoRunner({
  compId: 'uno_1',
  onStateChange: () => {},
  onSerialLog: () => {},
  onError: (err) => console.error('Runner error:', err)
});

// Pass external voltages: A0 = 2.5V (counts ~512), Pin 2 = 5.0V (HIGH)
runner.setExternalVoltages({ a0: 2.5, 2: 5.0 });
runner.start(`
int readA = 0;
int readBtn = 0;
void setup() {
  pinMode(2, INPUT_PULLUP);
}
void loop() {
  readA = analogRead(A0);
  readBtn = digitalRead(2);
  if (readA > 500 && readBtn == 1) {
    digitalWrite(13, HIGH);
  }
}
`);

setTimeout(() => {
  assert('Arduino executed and drove Pin 13 HIGH via analogRead(A0) & digitalRead(2)', runner.pinVoltages[13] === 5.0);
  runner.stop();

  console.log(`\n=== AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED ===`);
  process.exit(failCount === 0 ? 0 : 1);
}, 250);
