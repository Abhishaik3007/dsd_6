/**
 * SignalSchool TinkerLab - Arduino Uno C++ Simulation Engine & Runtime
 * Transpiles Arduino C++ code to safe sandboxed async JS execution.
 * Drives real-time digital/PWM pin voltages, built-in LEDs (L, TX, RX),
 * and dynamic Serial Monitor bidirectional communication.
 */

export const ARDUINO_PRESETS = [
  {
    id: 'blink',
    name: 'Blink (Built-in LED & Pin 13)',
    description: 'Toggles digital Pin 13 and the onboard L LED every second.',
    code: `// Arduino Uno Starter - Blink
// Turns the onboard 'L' LED and digital Pin 13 on and off every second

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino Uno Initialized - Blink Demo");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED Status: ON (5V)");
  delay(1000);

  digitalWrite(ledPin, LOW);
  Serial.println("LED Status: OFF (0V)");
  delay(1000);
}
`
  },
  {
    id: 'fast_strobe',
    name: 'Fast Strobe (100ms)',
    description: 'High-speed 10Hz strobe blink on Pin 13.',
    code: `// Fast Strobe Demonstration
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("High Speed Strobe Active (100ms)");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(100);
  digitalWrite(ledPin, LOW);
  delay(100);
}
`
  },
  {
    id: 'traffic_light',
    name: 'Traffic Light (Pins 10, 11, 12)',
    description: 'Cycles Red (Pin 12), Yellow (Pin 11), and Green (Pin 10).',
    code: `// Traffic Light Controller
const int greenPin = 10;
const int yellowPin = 11;
const int redPin = 12;

void setup() {
  pinMode(greenPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Traffic Light Sequence Started");
}

void loop() {
  // Green Light
  digitalWrite(greenPin, HIGH);
  digitalWrite(yellowPin, LOW);
  digitalWrite(redPin, LOW);
  Serial.println("State: GREEN (Go)");
  delay(2500);

  // Yellow Light
  digitalWrite(greenPin, LOW);
  digitalWrite(yellowPin, HIGH);
  digitalWrite(redPin, LOW);
  Serial.println("State: YELLOW (Caution)");
  delay(1000);

  // Red Light
  digitalWrite(greenPin, LOW);
  digitalWrite(yellowPin, LOW);
  digitalWrite(redPin, HIGH);
  Serial.println("State: RED (Stop)");
  delay(3000);
}
`
  },
  {
    id: 'chaser',
    name: 'LED Chaser / Knight Rider (Pins 8 to 13)',
    description: 'Sequential LED light sweep across pins 8 through 13.',
    code: `// Knight Rider LED Sweep
// Connect LEDs with 220Ω resistors to Pins 8, 9, 10, 11, 12, 13

void setup() {
  for (int p = 8; p <= 13; p++) {
    pinMode(p, OUTPUT);
  }
  Serial.begin(9600);
  Serial.println("Running LED Chaser Sweep...");
}

void loop() {
  // Sweep Forward
  for (int p = 8; p <= 13; p++) {
    digitalWrite(p, HIGH);
    delay(120);
    digitalWrite(p, LOW);
  }

  // Sweep Backward
  for (int p = 12; p >= 9; p--) {
    digitalWrite(p, HIGH);
    delay(120);
    digitalWrite(p, LOW);
  }
}
`
  },
  {
    id: 'serial_echo',
    name: 'Serial Two-Way Echo & Control',
    description: 'Listens for Serial text commands (type "1" to turn LED ON, "0" for OFF).',
    code: `// Serial Interactive Echo & Control
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Type '1' to turn LED ON, '0' to turn LED OFF in Serial Monitor!");
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readString();
    Serial.print("Received Command: ");
    Serial.println(command);

    if (command.indexOf("1") >= 0 || command.indexOf("on") >= 0 || command.indexOf("ON") >= 0) {
      digitalWrite(ledPin, HIGH);
      Serial.println("-> Pin 13 LED turned ON");
    } else if (command.indexOf("0") >= 0 || command.indexOf("off") >= 0 || command.indexOf("OFF") >= 0) {
      digitalWrite(ledPin, LOW);
      Serial.println("-> Pin 13 LED turned OFF");
    }
  }
  delay(50);
}
`
  },
  {
    id: 'serial_counter',
    name: 'Serial Telemetry Counter',
    description: 'Outputs periodic sensor/telemetry counter strings to Serial Monitor.',
    code: `// Serial Telemetry Counter
int count = 0;
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("=== Arduino Uno Telemetry System ===");
}

void loop() {
  count++;
  digitalWrite(ledPin, count % 2 == 0 ? HIGH : LOW);
  
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.print("s | Packet #");
  Serial.println(count);
  
  delay(800);
}
`
  },
  {
    id: 'button_toggle',
    name: 'Pushbutton Input & LED (Pin 2 & 13)',
    description: 'Reads digital input on Pin 2 with INPUT_PULLUP and controls Pin 13 LED.',
    code: `// Pushbutton Input & LED Control
// Connect a pushbutton between Pin 2 and GND (using internal pull-up)
const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Pushbutton Controller Ready (INPUT_PULLUP on Pin 2)");
}

void loop() {
  // Reads LOW when pressed (connected to GND), HIGH when released
  int buttonState = digitalRead(buttonPin);

  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Button Pressed -> Pin 13 LED ON");
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(60);
}
`
  },
  {
    id: 'analog_potentiometer',
    name: 'Potentiometer ADC & PWM (A0 & Pin 9)',
    description: 'Reads 10-bit analog voltage (0-1023) on A0 and adjusts PWM brightness on Pin 9.',
    code: `// Potentiometer Analog Read & PWM Dimmer
// Connect Potentiometer Wiper to A0, outer legs to 5V and GND
const int sensorPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Potentiometer ADC Reader Initialized");
}

void loop() {
  int sensorValue = analogRead(sensorPin);
  float voltage = sensorValue * (5.0 / 1023.0);
  int brightness = map(sensorValue, 0, 1023, 0, 255);

  analogWrite(ledPin, brightness);

  Serial.print("Raw ADC: ");
  Serial.print(sensorValue);
  Serial.print(" | Voltage: ");
  Serial.print(voltage);
  Serial.println("V");

  delay(250);
}
`
  },
  {
    id: 'photoresistor_sensor',
    name: 'Light Sensor Monitor (A0 & Pin 13)',
    description: 'Reads CdS photoresistor on A0 and triggers LED when dark.',
    code: `// Photoresistor Automatic Night Light
// Connect Photoresistor to A0 in a voltage divider
const int sensorPin = A0;
const int ledPin = 13;
const int darkThreshold = 450; // ADC counts

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Photoresistor Night Monitor Active");
}

void loop() {
  int lightLevel = analogRead(sensorPin);
  Serial.print("Ambient Light Level: ");
  Serial.println(lightLevel);

  if (lightLevel < darkThreshold) {
    digitalWrite(ledPin, HIGH);
    Serial.println("-> Darkness Detected: Pin 13 LED ON");
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(300);
}
`
  }
];

export const DEFAULT_ARDUINO_CODE = ARDUINO_PRESETS[0].code;

// Polyfill Arduino String methods if needed
if (typeof String.prototype.toInt !== 'function') {
  String.prototype.toInt = function() { return parseInt(this, 10) || 0; };
}
if (typeof String.prototype.toFloat !== 'function') {
  String.prototype.toFloat = function() { return parseFloat(this) || 0.0; };
}
if (typeof String.prototype.equalsIgnoreCase !== 'function') {
  String.prototype.equalsIgnoreCase = function(other) {
    return this.toLowerCase() === String(other ?? '').toLowerCase();
  };
}
if (typeof String.prototype.equals !== 'function') {
  String.prototype.equals = function(other) {
    return this === String(other ?? '');
  };
}

/**
 * Transpile Arduino C++ into runnable async JavaScript
 */
export function transpileArduino(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') {
    return 'async function run() {}';
  }

  let code = sourceCode;

  // 1. Comment out #include statements
  code = code.replace(/^[ \t]*#include\s+.*$/gm, '// $&');

  // 2. Convert #define CONST VAL to const CONST = VAL;
  code = code.replace(/^[ \t]*#define\s+([A-Za-z0-9_]+)\s+([^\r\n]+)$/gm, 'const $1 = $2;');

  // 2.5 Remove 'static' and 'volatile' keywords
  code = code.replace(/\b(static|volatile)\s+/g, '');

  // 2.6 Replace .length() method call with property .length
  code = code.replace(/\.length\(\)/g, '.length');

  // 3. Convert C++ numeric / string type declarations
  const types = [
    'unsigned long',
    'unsigned int',
    'unsigned short',
    'uint8_t',
    'uint16_t',
    'uint32_t',
    'int8_t',
    'int16_t',
    'int32_t',
    'int',
    'long',
    'short',
    'float',
    'double',
    'char',
    'byte',
    'bool',
    'boolean',
    'String',
    'auto'
  ];

  for (const t of types) {
    // const <type> -> const
    const constRegex = new RegExp(`\\bconst\\s+${t}\\b`, 'g');
    code = code.replace(constRegex, 'const');

    // for (<type> i = ...) -> for (let i = ...)
    const forRegex = new RegExp(`\\bfor\\s*\\(\\s*${t}\\b`, 'g');
    code = code.replace(forRegex, 'for (let');

    // standalone declaration: <type> varName
    const declRegex = new RegExp(`(^|;|\n|\r)[ \t]*${t}\\s+([A-Za-z0-9_]+)`, 'g');
    code = code.replace(declRegex, '$1 let $2');
  }

  // 4. Convert function definitions: void funcName(...) { or int funcName(...) {
  code = code.replace(
    /\b(void|int|bool|boolean|float|double|long|String)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g,
    'async function $2($3) {'
  );

  // 5. Replace standard Arduino calls with sandbox helpers
  code = code.replace(/\bdelay\s*\(/g, 'await __delay(');
  code = code.replace(/\bdelayMicroseconds\s*\(([^)]+)\)/g, 'await __delay(($1) / 1000)');
  code = code.replace(/\bSerial\.println\s*\(/g, '__serialPrintln(');
  code = code.replace(/\bSerial\.print\s*\(/g, '__serialPrint(');
  code = code.replace(/\bSerial\.begin\s*\(/g, '__serialBegin(');
  code = code.replace(/\bSerial\.available\s*\(\s*\)/g, '__serialAvailable()');
  code = code.replace(/\bSerial\.readString\s*\(\s*\)/g, '__serialReadString()');
  code = code.replace(/\bSerial\.read\s*\(\s*\)/g, '__serialRead()');
  code = code.replace(/\bdigitalWrite\s*\(/g, '__digitalWrite(');
  code = code.replace(/\bdigitalRead\s*\(/g, '__digitalRead(');
  code = code.replace(/\banalogWrite\s*\(/g, '__analogWrite(');
  code = code.replace(/\banalogRead\s*\(/g, '__analogRead(');
  code = code.replace(/\bpinMode\s*\(/g, '__pinMode(');
  code = code.replace(/\bmillis\s*\(\s*\)/g, '__millis()');
  code = code.replace(/\bmicros\s*\(\s*\)/g, '__micros()');

  // Wrap inside execution harness
  return `
    return async function runHarness(env) {
      const {
        __digitalWrite,
        __digitalRead,
        __analogWrite,
        __analogRead,
        __pinMode,
        __delay,
        __serialPrint,
        __serialPrintln,
        __serialBegin,
        __serialAvailable,
        __serialRead,
        __serialReadString,
        __millis,
        __micros,
        __isRunning,
        __yield
      } = env;

      const HIGH = 1;
      const LOW = 0;
      const OUTPUT = 'OUTPUT';
      const INPUT = 'INPUT';
      const INPUT_PULLUP = 'INPUT_PULLUP';
      const LED_BUILTIN = 13;

      // Analog Pin Constants
      const A0 = 14;
      const A1 = 15;
      const A2 = 16;
      const A3 = 17;
      const A4 = 18;
      const A5 = 19;

      // Standard Arduino math & random helpers
      const abs = Math.abs;
      const min = Math.min;
      const max = Math.max;
      const round = Math.round;
      const floor = Math.floor;
      const ceil = Math.ceil;
      const sqrt = Math.sqrt;
      const pow = Math.pow;
      const sin = Math.sin;
      const cos = Math.cos;
      const tan = Math.tan;
      const sq = (x) => x * x;
      const constrain = (amt, low, high) => Math.max(low, Math.min(high, amt));
      const map = (x, in_min, in_max, out_min, out_max) => {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
      };
      const random = (min, max) => {
        if (max === undefined) { max = min; min = 0; }
        return Math.floor(Math.random() * (max - min)) + min;
      };
      const bit = (b) => (1 << b);
      const bitRead = (value, bit) => ((value >> bit) & 0x01);
      const bitSet = (value, bit) => (value | (1 << bit));
      const bitClear = (value, bit) => (value & ~(1 << bit));
      const bitWrite = (value, bit, bitvalue) => (bitvalue ? (value | (1 << bit)) : (value & ~(1 << bit)));
      const lowByte = (w) => (w & 0xff);
      const highByte = (w) => ((w >> 8) & 0xff);

      // Fallback Serial API object
      const Serial = {
        begin: __serialBegin,
        print: __serialPrint,
        println: __serialPrintln,
        available: __serialAvailable,
        read: __serialRead,
        readString: __serialReadString
      };

      // User Code Block
      ${code}

      // Arduino Lifecycle Execution
      if (typeof setup === 'function') {
        await setup();
      }

      if (typeof loop === 'function') {
        while (__isRunning()) {
          await loop();
          await __yield();
        }
      }
    };
  `;
}

/**
 * High-performance Arduino execution worker instance
 */
export class ArduinoRunner {
  constructor({ compId, onStateChange, onSerialLog, onError }) {
    this.compId = compId;
    this.onStateChange = onStateChange; // (pinVoltages, ledStates) => void
    this.onSerialLog = onSerialLog;     // (text, isError) => void
    this.onError = onError;             // (errorMsg) => void

    this.isRunning = false;
    this.startTime = 0;
    this.pinVoltages = {};     // Pin voltages driven as OUTPUT (0..13)
    this.externalVoltages = {}; // External circuit voltages arriving at pins (0..13, a0..a5)
    this.pinModes = {};
    this.lLed = false;
    this.txLed = false;
    this.rxLed = false;
    this.serialBuffer = '';
    this.serialInputQueue = '';
    this.txTimer = null;
    this.rxTimer = null;
  }

  setExternalVoltages(voltages = {}) {
    this.externalVoltages = { ...voltages };
  }

  start(sourceCode) {
    this.stop();
    this.isRunning = true;
    this.startTime = Date.now();
    this.pinVoltages = { 13: 0.0 };
    this.serialInputQueue = '';
    this.lLed = false;
    this.txLed = false;
    this.rxLed = false;

    try {
      const transpiled = transpileArduino(sourceCode);
      const factory = new Function(transpiled);
      const harness = factory();

      const env = {
        __digitalWrite: (pin, val) => {
          if (!this.isRunning) return;
          let pinNum = parseInt(pin, 10);
          if (typeof pin === 'string' && pin.match(/^[aA](\d+)$/)) {
            pinNum = 14 + parseInt(pin.slice(1), 10);
          }
          const isHigh = val === 1 || val === 'HIGH' || val === true || val > 0;
          this.pinVoltages[pinNum] = isHigh ? 5.0 : 0.0;
          if (pinNum === 13) {
            this.lLed = isHigh;
          }
          this._notifyState();
        },

        __digitalRead: (pin) => {
          let pinNum = parseInt(pin, 10);
          if (typeof pin === 'string' && pin.match(/^[aA](\d+)$/)) {
            pinNum = 14 + parseInt(pin.slice(1), 10);
          }
          const mode = this.pinModes[pinNum] || 'INPUT';

          // Check if circuit has external voltage applied
          const extV = this.externalVoltages[pinNum] ??
                       this.externalVoltages[`a${pinNum - 14}`] ??
                       this.externalVoltages[pinNum - 14];

          if (mode === 'INPUT_PULLUP') {
            // Internal pull-up drives to 5V. Pulled LOW only if external circuit grounds it (<1.5V)
            if (extV !== undefined && extV < 1.5) {
              return 0;
            }
            return 1;
          }

          if (extV !== undefined) {
            return extV > 2.0 ? 1 : 0;
          }

          // Fallback to internal pin voltage (if configured or driven)
          return (this.pinVoltages[pinNum] || 0) > 2.0 ? 1 : 0;
        },

        __analogWrite: (pin, val) => {
          if (!this.isRunning) return;
          const pinNum = parseInt(pin, 10);
          const clamped = Math.max(0, Math.min(255, Number(val) || 0));
          const voltage = (clamped / 255) * 5.0;
          this.pinVoltages[pinNum] = Math.round(voltage * 100) / 100;
          if (pinNum === 13) {
            this.lLed = clamped > 20;
          }
          this._notifyState();
        },

        __analogRead: (pin) => {
          let aIndex = 0;
          if (typeof pin === 'string') {
            const match = pin.match(/^[aA](\d+)$/);
            if (match) {
              aIndex = parseInt(match[1], 10);
            } else {
              const pNum = parseInt(pin, 10);
              aIndex = pNum >= 14 ? pNum - 14 : pNum;
            }
          } else if (typeof pin === 'number') {
            aIndex = pin >= 14 ? pin - 14 : pin;
          }
          aIndex = Math.max(0, Math.min(5, aIndex));

          // External analog voltage from circuit solver
          const v = this.externalVoltages[`a${aIndex}`] ??
                    this.externalVoltages[14 + aIndex] ??
                    this.externalVoltages[aIndex] ?? 0;

          // Clamped 10-bit ADC counts (0V -> 0, 5V -> 1023)
          return Math.round((Math.max(0, Math.min(5.0, v)) / 5.0) * 1023);
        },

        __pinMode: (pin, mode) => {
          let pinNum = parseInt(pin, 10);
          if (typeof pin === 'string' && pin.match(/^[aA](\d+)$/)) {
            pinNum = 14 + parseInt(pin.slice(1), 10);
          }
          this.pinModes[pinNum] = mode;
        },

        __delay: (ms) => {
          return new Promise(resolve => {
            if (!this.isRunning) return resolve();
            const waitTime = Math.max(5, Number(ms) || 0);
            setTimeout(() => {
              resolve();
            }, waitTime);
          });
        },

        __serialBegin: (baud) => {
          this._flashTx();
        },

        __serialPrint: (arg) => {
          if (!this.isRunning) return;
          this._flashTx();
          const str = String(arg ?? '');
          this.serialBuffer += str;
          if (this.onSerialLog) {
            this.onSerialLog(str, false);
          }
        },

        __serialPrintln: (arg) => {
          if (!this.isRunning) return;
          this._flashTx();
          const str = (arg !== undefined ? String(arg) : '') + '\n';
          this.serialBuffer += str;
          if (this.onSerialLog) {
            this.onSerialLog(str, false);
          }
        },

        __serialAvailable: () => {
          return this.serialInputQueue.length > 0;
        },

        __serialRead: () => {
          if (this.serialInputQueue.length === 0) return -1;
          const char = this.serialInputQueue.charAt(0);
          this.serialInputQueue = this.serialInputQueue.slice(1);
          return char.charCodeAt(0);
        },

        __serialReadString: () => {
          const content = this.serialInputQueue;
          this.serialInputQueue = '';
          return content;
        },

        __millis: () => {
          return Date.now() - this.startTime;
        },

        __micros: () => {
          return (Date.now() - this.startTime) * 1000;
        },

        __isRunning: () => this.isRunning,

        __yield: () => {
          return new Promise(resolve => setTimeout(resolve, 15));
        }
      };

      harness(env).catch(err => {
        if (!this.isRunning) return;
        console.warn(`[Arduino Runtime Error on ${this.compId}]:`, err);
        if (this.onError) {
          this.onError(err.message || String(err));
        }
      });
    } catch (err) {
      console.warn(`[Arduino Transpile Error on ${this.compId}]:`, err);
      if (this.onError) {
        this.onError(`Compile Error: ${err.message || String(err)}`);
      }
    }
  }

  sendSerial(text) {
    if (!this.isRunning) return;
    this._flashRx();
    this.serialInputQueue += text;
  }

  _flashTx() {
    this.txLed = true;
    this._notifyState();
    if (this.txTimer) clearTimeout(this.txTimer);
    this.txTimer = setTimeout(() => {
      this.txLed = false;
      this._notifyState();
    }, 70);
  }

  _flashRx() {
    this.rxLed = true;
    this._notifyState();
    if (this.rxTimer) clearTimeout(this.rxTimer);
    this.rxTimer = setTimeout(() => {
      this.rxLed = false;
      this._notifyState();
    }, 70);
  }

  _notifyState() {
    if (this.onStateChange) {
      this.onStateChange(
        { ...this.pinVoltages },
        { lLed: this.lLed, txLed: this.txLed, rxLed: this.rxLed }
      );
    }
  }

  stop() {
    this.isRunning = false;
    if (this.txTimer) {
      clearTimeout(this.txTimer);
      this.txTimer = null;
    }
    if (this.rxTimer) {
      clearTimeout(this.rxTimer);
      this.rxTimer = null;
    }
    this.pinVoltages = {};
    for (let i = 0; i <= 13; i++) {
      this.pinVoltages[i] = 0.0;
    }
    this.lLed = false;
    this.txLed = false;
    this.rxLed = false;
    this.serialInputQueue = '';
    this._notifyState();
  }
}
