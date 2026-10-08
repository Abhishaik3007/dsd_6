import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useHub } from '../../context/HubContext';
import { TinkerCanvas } from './TinkerCanvas';
import { TinkerDrawer } from './TinkerDrawer';
import { solveTinkerCircuit } from './engine/tinkerSolver';
import { TinkerCodeEditor } from './TinkerCodeEditor';
import { DEFAULT_ARDUINO_CODE, ARDUINO_PRESETS, ArduinoRunner } from './engine/arduinoRuntime';
import {
  ArrowLeft,
  Layers,
  ChevronDown,
  Check,
  Sun,
  Moon,
  HelpCircle,
  RotateCw,
  Trash2,
  Undo2,
  Redo2,
  Play,
  Square,
  X,
  Zap,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  PanelLeft,
  Code,
  Terminal
} from 'lucide-react';

export const WIRE_COLORS = [
  { id: 'red', label: 'Red (VCC)', hex: '#E53E3E' },
  { id: 'black', label: 'Black (GND)', hex: '#1A202C' },
  { id: 'green', label: 'Green', hex: '#38A169' },
  { id: 'blue', label: 'Blue', hex: '#3182CE' },
  { id: 'yellow', label: 'Yellow', hex: '#ECC94B' },
  { id: 'orange', label: 'Orange', hex: '#DD6B20' },
  { id: 'purple', label: 'Purple', hex: '#805AD5' },
  { id: 'brown', label: 'Brown', hex: '#8B4513' },
  { id: 'white', label: 'White', hex: '#E2E8F0' }
];

export const CIRCUIT_PRESETS = [
  {
    id: 'basic_led',
    name: '9V Battery + Resistor + LED (Breadboard)',
    breadboards: [{ id: 'bb_1', x: 260, y: 140 }],
    components: [
      { id: 'bat_1', type: 'battery_9v', x: 120, y: 220, rotation: 0, props: {} },
      { id: 'res_1', type: 'resistor', x: 380, y: 80, rotation: 0, props: { resistance: 220 } },
      { id: 'led_1', type: 'led', x: 500, y: 80, rotation: 0, props: { color: 'red' } }
    ],
    wires: [
      // 1. Battery (+) -> Breadboard Top (+) Rail Hole 1
      {
        id: 'w_vcc_rail',
        from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' },
        to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 1, row: 'top_pos' },
        color: '#E53E3E'
      },
      // 2. Breadboard Top (+) Rail Hole 4 -> Resistor Pin 1
      {
        id: 'w_rail_res',
        from: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 4, row: 'top_pos' },
        to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' },
        color: '#E53E3E'
      },
      // 3. Resistor Pin 2 -> LED Anode
      {
        id: 'w_res_led',
        from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' },
        color: '#ECC94B'
      },
      // 4. LED Cathode -> Breadboard Top (-) Rail Hole 12
      {
        id: 'w_led_gnd',
        from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' },
        to: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 12, row: 'top_neg' },
        color: '#1A202C'
      },
      // 5. Breadboard Top (-) Rail Hole 1 -> Battery (-)
      {
        id: 'w_rail_gnd_bat',
        from: { type: 'hole', bbId: 'bb_1', holeType: 'rail', col: 1, row: 'top_neg' },
        to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' },
        color: '#1A202C'
      }
    ]
  },
  {
    id: 'arduino_blink',
    name: 'Arduino Uno + LED Blink (C++ Code)',
    breadboards: [],
    components: [
      {
        id: 'uno_1',
        type: 'arduino_uno',
        x: 170,
        y: 200,
        rotation: 0,
        props: { code: DEFAULT_ARDUINO_CODE }
      },
      { id: 'res_1', type: 'resistor', x: 430, y: 90, rotation: 0, props: { resistance: 220 } },
      { id: 'led_1', type: 'led', x: 550, y: 90, rotation: 0, props: { color: 'red' } }
    ],
    wires: [
      {
        id: 'w_uno_d13_to_res',
        from: { type: 'component', compId: 'uno_1', pinKey: 'pin_13' },
        to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' },
        color: '#E53E3E'
      },
      {
        id: 'w_res_to_led',
        from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' },
        color: '#ECC94B'
      },
      {
        id: 'w_led_to_uno_gnd',
        from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' },
        to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_1' },
        color: '#1A202C'
      }
    ]
  },
  {
    id: 'pushbutton_led',
    name: 'Pushbutton Controlled LED',
    breadboards: [],
    components: [
      { id: 'bat_1', type: 'battery_9v', x: 120, y: 220, rotation: 0, props: {} },
      { id: 'btn_1', type: 'pushbutton', x: 300, y: 80, rotation: 0, state: { isPressed: false } },
      { id: 'res_1', type: 'resistor', x: 420, y: 80, rotation: 0, props: { resistance: 330 } },
      { id: 'led_1', type: 'led', x: 530, y: 80, rotation: 0, props: { color: 'green' } }
    ],
    wires: [
      {
        id: 'w1',
        from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' },
        to: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' },
        color: '#E53E3E'
      },
      {
        id: 'w2',
        from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' },
        to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' },
        color: '#ECC94B'
      },
      {
        id: 'w3',
        from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' },
        color: '#ECC94B'
      },
      {
        id: 'w4',
        from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' },
        to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' },
        color: '#1A202C'
      }
    ]
  },
  {
    id: 'diode_protection',
    name: 'Diode Rectifier & Polarity Protection',
    breadboards: [],
    components: [
      { id: 'bat_1', type: 'battery_9v', x: 120, y: 220, rotation: 0, props: {} },
      { id: 'diode_1', type: 'diode', x: 300, y: 80, rotation: 0, props: { model: '1N4007' } },
      { id: 'res_1', type: 'resistor', x: 420, y: 80, rotation: 0, props: { resistance: 470 } },
      { id: 'led_1', type: 'led', x: 530, y: 80, rotation: 0, props: { color: 'green' } }
    ],
    wires: [
      {
        id: 'w_d1',
        from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' },
        to: { type: 'component', compId: 'diode_1', pinKey: 'pin_anode' },
        color: '#E53E3E'
      },
      {
        id: 'w_d2',
        from: { type: 'component', compId: 'diode_1', pinKey: 'pin_cathode' },
        to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' },
        color: '#38A169'
      },
      {
        id: 'w_d3',
        from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' },
        color: '#ECC94B'
      },
      {
        id: 'w_d4',
        from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' },
        to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' },
        color: '#1A202C'
      }
    ]
  },
  {
    id: 'rgb_led_demo',
    name: 'Tri-Color RGB LED Circuit (Yellow Mix)',
    breadboards: [],
    components: [
      { id: 'bat_1', type: 'battery_9v', x: 120, y: 220, rotation: 0, props: {} },
      { id: 'res_r', type: 'resistor', x: 340, y: 70, rotation: 0, props: { resistance: 330 } },
      { id: 'res_g', type: 'resistor', x: 340, y: 120, rotation: 0, props: { resistance: 330 } },
      { id: 'rgb_1', type: 'led_rgb', x: 500, y: 90, rotation: 0, props: { common: 'cathode' } }
    ],
    wires: [
      {
        id: 'w_bat_res_r',
        from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' },
        to: { type: 'component', compId: 'res_r', pinKey: 'pin_1' },
        color: '#E53E3E'
      },
      {
        id: 'w_res_r_g',
        from: { type: 'component', compId: 'res_r', pinKey: 'pin_1' },
        to: { type: 'component', compId: 'res_g', pinKey: 'pin_1' },
        color: '#E53E3E'
      },
      {
        id: 'w_res_r_to_red',
        from: { type: 'component', compId: 'res_r', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'rgb_1', pinKey: 'pin_r' },
        color: '#E53E3E'
      },
      {
        id: 'w_res_g_to_green',
        from: { type: 'component', compId: 'res_g', pinKey: 'pin_2' },
        to: { type: 'component', compId: 'rgb_1', pinKey: 'pin_g' },
        color: '#38A169'
      },
      {
        id: 'w_rgb_gnd',
        from: { type: 'component', compId: 'rgb_1', pinKey: 'pin_common' },
        to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' },
        color: '#1A202C'
      }
    ]
  },
  {

    id: 'transistor_switch',
    name: 'Transistor Switch (NPN 2N2222 Driver)',
    breadboards: [],
    components: [
      { id: 'bat_1', type: 'battery_9v', x: 100, y: 220, rotation: 0, props: {} },
      { id: 'btn_1', type: 'pushbutton', x: 280, y: 80, rotation: 0, state: { isPressed: false } },
      { id: 'res_base', type: 'resistor', x: 390, y: 80, rotation: 0, props: { resistance: 1000 } },
      { id: 'q1', type: 'transistor_npn', x: 490, y: 140, rotation: 0, props: { model: '2N2222' } },
      { id: 'res_load', type: 'resistor', x: 420, y: 240, rotation: 0, props: { resistance: 330 } },
      { id: 'led_1', type: 'led', x: 530, y: 240, rotation: 0, props: { color: 'blue' } }
    ],
    wires: [
      { id: 'w1', from: { type: 'component', compId: 'bat_1', pinKey: 'pin_pos' }, to: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' }, color: '#E53E3E' },
      { id: 'w2', from: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' }, to: { type: 'component', compId: 'res_load', pinKey: 'pin_1' }, color: '#E53E3E' },
      { id: 'w3', from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' }, to: { type: 'component', compId: 'res_base', pinKey: 'pin_1' }, color: '#ECC94B' },
      { id: 'w4', from: { type: 'component', compId: 'res_base', pinKey: 'pin_2' }, to: { type: 'component', compId: 'q1', pinKey: 'pin_b' }, color: '#3182CE' },
      { id: 'w5', from: { type: 'component', compId: 'res_load', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' }, color: '#ECC94B' },
      { id: 'w6', from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'q1', pinKey: 'pin_c' }, color: '#E53E3E' },
      { id: 'w7', from: { type: 'component', compId: 'q1', pinKey: 'pin_e' }, to: { type: 'component', compId: 'bat_1', pinKey: 'pin_neg' }, color: '#1A202C' }
    ]
  },
  {
    id: 'arduino_button',
    name: 'Arduino Uno + Pushbutton & LED (Digital In)',
    breadboards: [],
    components: [
      {
        id: 'uno_1',
        type: 'arduino_uno',
        x: 170,
        y: 200,
        rotation: 0,
        props: {
          code: ARDUINO_PRESETS.find(p => p.id === 'button_toggle')?.code || DEFAULT_ARDUINO_CODE
        }
      },
      { id: 'btn_1', type: 'pushbutton', x: 430, y: 80, rotation: 0, state: { isPressed: false } },
      { id: 'res_1', type: 'resistor', x: 430, y: 220, rotation: 0, props: { resistance: 220 } },
      { id: 'led_1', type: 'led', x: 550, y: 220, rotation: 0, props: { color: 'green' } }
    ],
    wires: [
      { id: 'w_btn_to_d2', from: { type: 'component', compId: 'btn_1', pinKey: 'pin_1a' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_2' }, color: '#3182CE' },
      { id: 'w_btn_to_gnd', from: { type: 'component', compId: 'btn_1', pinKey: 'pin_2a' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_3' }, color: '#1A202C' },
      { id: 'w_d13_to_res', from: { type: 'component', compId: 'uno_1', pinKey: 'pin_13' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' }, color: '#E53E3E' },
      { id: 'w_res_to_led', from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' }, color: '#ECC94B' },
      { id: 'w_led_to_gnd', from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_1' }, color: '#1A202C' }
    ]
  },
  {
    id: 'arduino_potentiometer',
    name: 'Arduino Uno + Potentiometer ADC (Analog In)',
    breadboards: [],
    components: [
      {
        id: 'uno_1',
        type: 'arduino_uno',
        x: 170,
        y: 200,
        rotation: 0,
        props: {
          code: ARDUINO_PRESETS.find(p => p.id === 'analog_potentiometer')?.code || DEFAULT_ARDUINO_CODE
        }
      },
      { id: 'pot_1', type: 'potentiometer', x: 430, y: 80, rotation: 0, state: { value: 60 } },
      { id: 'res_1', type: 'resistor', x: 430, y: 220, rotation: 0, props: { resistance: 220 } },
      { id: 'led_1', type: 'led', x: 550, y: 220, rotation: 0, props: { color: 'yellow' } }
    ],
    wires: [
      { id: 'w_5v_to_pot1', from: { type: 'component', compId: 'uno_1', pinKey: 'pin_5v' }, to: { type: 'component', compId: 'pot_1', pinKey: 'pin_1' }, color: '#E53E3E' },
      { id: 'w_pot_wiper_to_a0', from: { type: 'component', compId: 'pot_1', pinKey: 'pin_wiper' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_a0' }, color: '#3182CE' },
      { id: 'w_pot3_to_gnd', from: { type: 'component', compId: 'pot_1', pinKey: 'pin_3' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_2' }, color: '#1A202C' },
      { id: 'w_d9_to_res', from: { type: 'component', compId: 'uno_1', pinKey: 'pin_9' }, to: { type: 'component', compId: 'res_1', pinKey: 'pin_1' }, color: '#E53E3E' },
      { id: 'w_res_to_led', from: { type: 'component', compId: 'res_1', pinKey: 'pin_2' }, to: { type: 'component', compId: 'led_1', pinKey: 'pin_anode' }, color: '#ECC94B' },
      { id: 'w_led_to_gnd', from: { type: 'component', compId: 'led_1', pinKey: 'pin_cathode' }, to: { type: 'component', compId: 'uno_1', pinKey: 'pin_gnd_1' }, color: '#1A202C' }
    ]
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    breadboards: [],
    components: [],
    wires: []
  }
];

// Standard Capacitor Values Grouped by Magnitude Ranges
const CAPACITOR_VALUE_OPTIONS = [
  // 1. Microfarads (µF) - High Capacity / Electrolytic Primary Range
  { isHeader: true, label: 'Microfarads (µF)' },
  { value: '1µF', label: '1 µF' },
  { value: '2.2µF', label: '2.2 µF' },
  { value: '4.7µF', label: '4.7 µF' },
  { value: '10µF', label: '10 µF' },
  { value: '22µF', label: '22 µF' },
  { value: '47µF', label: '47 µF' },
  { value: '100µF', label: '100 µF' },
  { value: '220µF', label: '220 µF' },
  { value: '470µF', label: '470 µF' },
  { value: '1000µF', label: '1000 µF' },

  // 2. Nanofarads (nF) - Coupling / Audio / Filtering Range
  { isHeader: true, label: 'Nanofarads (nF)' },
  { value: '1nF', label: '1 nF' },
  { value: '10nF', label: '10 nF' },
  { value: '47nF', label: '47 nF' },
  { value: '100nF', label: '100 nF' },
  { value: '470nF', label: '470 nF' },

  // 3. Picofarads (pF) - High Frequency Range
  { isHeader: true, label: 'Picofarads (pF)' },
  { value: '10pF', label: '10 pF' },
  { value: '100pF', label: '100 pF' },
  { value: '470pF', label: '470 pF' }
];

const CAPACITOR_VOLTAGE_OPTIONS = [
  { value: '10V', label: '10V' },
  { value: '16V', label: '16V' },
  { value: '25V', label: '25V' },
  { value: '35V', label: '35V' },
  { value: '50V', label: '50V' },
  { value: '100V', label: '100V' },
  { value: '450V', label: '450V' }
];

const DIODE_MODEL_OPTIONS = [
  { value: '1N4007', label: '1N4007 (1000V 1A Silicon)' },
  { value: '1N4001', label: '1N4001 (50V 1A Silicon)' },
  { value: '1N4148', label: '1N4148 (Fast Switching 100V)' },
  { value: '1N5819', label: '1N5819 (Schottky 40V 1A)' }
];

const RGB_LED_COMMON_OPTIONS = [
  { value: 'cathode', label: 'Common Cathode (-)' },
  { value: 'anode', label: 'Common Anode (+)' }
];

// Sleek, high-fidelity custom dropdown component matching TinkerLab's floating glass aesthetics
const TinkerSelect = ({
  value,
  options = [],
  onChange,
  isDarkMode = false,
  className = '',
  buttonClassName = '',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => (typeof opt === 'object' && !opt.isHeader ? opt.value === value : opt === value));
  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : (selectedOption || value);
  const hasHeaders = options.some(opt => typeof opt === 'object' && opt.isHeader);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer outline-none select-none ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700 text-teal-300 hover:bg-slate-700 hover:border-slate-600'
            : 'bg-white border-[#CBD5E0] text-slate-800 hover:bg-slate-50 hover:border-slate-400'
        } ${buttonClassName}`}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 ${align === 'right' ? 'right-0' : 'left-0'} z-50 ${
            hasHeaders ? 'min-w-[160px]' : 'min-w-[80px]'
          } max-h-64 overflow-y-auto py-1 rounded-xl shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
            isDarkMode
              ? 'bg-[#0f172a]/95 border-slate-700 shadow-black/50 text-slate-200'
              : 'bg-white/95 border-slate-200 shadow-slate-900/15 text-slate-800'
          }`}
        >
          {options.map((opt, idx) => {
            if (typeof opt === 'object' && opt.isHeader) {
              return (
                <div
                  key={`hdr-${idx}`}
                  className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase select-none ${
                    idx > 0 ? 'mt-1 pt-1.5 border-t' : ''
                  } ${
                    isDarkMode
                      ? 'text-teal-400/80 bg-slate-900/60 border-slate-800'
                      : 'text-slate-500 bg-slate-100/70 border-slate-200/60'
                  }`}
                >
                  {opt.label}
                </div>
              );
            }

            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const icon = typeof opt === 'object' ? opt.icon : null;
            const isSelected = val === value;

            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-1 text-left text-xs font-mono font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-teal-500/20 text-teal-300 font-bold'
                      : 'bg-[#347F7A]/10 text-[#347F7A] font-bold'
                    : isDarkMode
                      ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {icon}
                  <span>{label}</span>
                </div>
                {isSelected && <Check size={11} className={isDarkMode ? 'text-teal-400' : 'text-[#347F7A]'} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TinkerLab = () => {
  const { setActiveTab } = useHub();

  // Project Info
  const [projectName, setProjectName] = useState('Signal-Circuits-01');
  const [activeViewMode, setActiveViewMode] = useState('circuits');

  // Theme & Modal States (SignalSchool Vibe)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Toolbar States
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeWireColor, setActiveWireColor] = useState('#38A169');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const colorPickerRef = useRef(null);
  const presetMenuRef = useRef(null);

  // Close color picker and preset menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
      if (presetMenuRef.current && !presetMenuRef.current.contains(e.target)) {
        setIsPresetMenuOpen(false);
      }
    };
    if (isColorPickerOpen || isPresetMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColorPickerOpen, isPresetMenuOpen]);

  // Code Editor & Arduino Runtime State
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [selectedArduinoId, setSelectedArduinoId] = useState(null);
  const [unoRuntimeStates, setUnoRuntimeStates] = useState({});
  const [serialLogs, setSerialLogs] = useState([]);
  const [runtimeError, setRuntimeError] = useState(null);
  const runnersRef = useRef({});

  // Selection
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);


  // Circuit Data initialized from first working preset
  const defaultPreset = CIRCUIT_PRESETS[0];
  const [breadboards, setBreadboards] = useState(defaultPreset.breadboards);
  const [components, setComponents] = useState(defaultPreset.components);
  const [wires, setWires] = useState(defaultPreset.wires);

  // Undo / Redo History
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const saveSnapshot = () => {
    setHistory(prev => [...prev.slice(-20), {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
      breadboards: JSON.parse(JSON.stringify(breadboards))
    }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack(prev => [...prev, { components, wires, breadboards }]);
    setComponents(last.components);
    setWires(last.wires);
    setBreadboards(last.breadboards);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, { components, wires, breadboards }]);
    setComponents(next.components);
    setWires(next.wires);
    setBreadboards(next.breadboards);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const arduinoComponents = useMemo(() => {
    return components.filter(c => c.type === 'arduino_uno');
  }, [components]);

  // Active Arduino for Code Editor
  const activeArduino = useMemo(() => {
    if (selectedArduinoId) {
      const found = arduinoComponents.find(c => c.id === selectedArduinoId);
      if (found) return found;
    }
    return arduinoComponents[0] || null;
  }, [selectedArduinoId, arduinoComponents]);

  // Active code for selected/first Arduino
  const activeCode = activeArduino?.props?.code || DEFAULT_ARDUINO_CODE;

  // Update code for active Arduino
  const handleUpdateCode = (newCode) => {
    if (!activeArduino) return;
    setComponents(prev => prev.map(c => {
      if (c.id === activeArduino.id) {
        return {
          ...c,
          props: { ...c.props, code: newCode }
        };
      }
      return c;
    }));
  };

  // Manage Arduino Simulation Run Loop
  useEffect(() => {
    if (!isSimulating) {
      Object.values(runnersRef.current).forEach(r => r.stop());
      runnersRef.current = {};
      setUnoRuntimeStates({});
      setRuntimeError(null);
      return;
    }

    const unos = components.filter(c => c.type === 'arduino_uno');
    unos.forEach((comp, idx) => {
      const boardLabel = comp.props?.name || `Uno #${idx + 1}`;
      const runner = new ArduinoRunner({
        compId: comp.id,
        onStateChange: (pinVoltages, ledStates) => {
          setUnoRuntimeStates(prev => ({
            ...prev,
            [comp.id]: {
              pinVoltages,
              lLedState: ledStates.lLed,
              txLedState: ledStates.txLed,
              rxLedState: ledStates.rxLed
            }
          }));
        },
        onSerialLog: (text, isError) => {
          const now = new Date();
          const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
          setSerialLogs(prev => [...prev.slice(-250), { time: timeStr, boardId: comp.id, boardLabel, text, isError }]);
        },
        onError: (err) => {
          setRuntimeError(err);
          const now = new Date();
          const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
          setSerialLogs(prev => [...prev.slice(-250), { time: timeStr, boardId: comp.id, boardLabel, text: `[Error]: ${err}`, isError: true }]);
        }
      });

      runnersRef.current[comp.id] = runner;
      runner.start(comp.props?.code || DEFAULT_ARDUINO_CODE);
      const initSolved = simulationResult?.componentStates?.[comp.id]?.solvedPinVoltages;
      if (initSolved) {
        runner.setExternalVoltages(initSolved);
      }
    });

    return () => {
      Object.values(runnersRef.current).forEach(r => r.stop());
      runnersRef.current = {};
    };
  }, [isSimulating]);

  // Handle adding an Arduino Uno directly from Code Editor empty state
  const handleAddArduinoUno = () => {
    saveSnapshot();
    const newUno = {
      id: `comp_arduino_uno_${Date.now()}`,
      type: 'arduino_uno',
      x: 360,
      y: 220,
      rotation: 0,
      props: {
        code: DEFAULT_ARDUINO_CODE,
        name: `Arduino Uno #${arduinoComponents.length + 1}`
      },
      state: {}
    };
    setComponents(prev => [...prev, newUno]);
    setSelectedId(newUno.id);
    setSelectedType('component');
    setSelectedArduinoId(newUno.id);
    setIsCodeEditorOpen(true);
  };

  // Handle renaming an Arduino board
  const handleRenameArduino = (boardId, newName) => {
    setComponents(prev => prev.map(c => {
      if (c.id === boardId) {
        return {
          ...c,
          props: { ...c.props, name: newName }
        };
      }
      return c;
    }));
  };

  // Handle locating an Arduino on the canvas
  const handleLocateArduino = (boardId) => {
    setSelectedId(boardId);
    setSelectedType('component');
    setSelectedArduinoId(boardId);
  };

  // Handle sending serial text to specific Arduino runner
  const handleSendSerial = (boardId, text) => {
    const runner = runnersRef.current[boardId];
    if (runner) {
      runner.sendSerial(text);
      const targetComp = components.find(c => c.id === boardId);
      const targetIndex = arduinoComponents.findIndex(c => c.id === boardId) + 1;
      const bLabel = targetComp?.props?.name || `Uno #${targetIndex || 1}`;
      const now = new Date();
      const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
      setSerialLogs(prev => [...prev.slice(-250), {
        time: timeStr,
        boardId,
        boardLabel: bLabel,
        text: `> ${text}`,
        isError: false
      }]);
    }
  };

  // Run Real-Time Electrical Solver
  const simulationResult = useMemo(() => {
    if (!isSimulating) return null;
    return solveTinkerCircuit({ components, wires, breadboards, unoRuntimeStates });
  }, [isSimulating, components, wires, breadboards, unoRuntimeStates]);

  // Synchronize solved external circuit voltages with active Arduino runners
  useEffect(() => {
    if (!isSimulating || !simulationResult) return;
    const unos = components.filter(c => c.type === 'arduino_uno');
    unos.forEach(u => {
      const runner = runnersRef.current[u.id];
      const solved = simulationResult.componentStates?.[u.id]?.solvedPinVoltages;
      if (runner && solved) {
        runner.setExternalVoltages(solved);
      }
    });
  }, [isSimulating, simulationResult, components]);

  // Load Preset
  const handleLoadPreset = (preset) => {
    saveSnapshot();
    setBreadboards(preset.breadboards);
    setComponents(preset.components);
    setWires(preset.wires);
    setIsPresetMenuOpen(false);
    setSelectedId(null);
    setSelectedType(null);
  };

  // Handle Add / Place Component from Drawer (supports both drag-drop and click-to-place)
  const handlePlaceComponent = (catalogItem, worldPos) => {
    saveSnapshot();
    const posX = worldPos?.x !== undefined ? Math.round(worldPos.x) : 380;
    const posY = worldPos?.y !== undefined ? Math.round(worldPos.y) : 180;

    if (catalogItem.type === 'breadboard_small') {
      const newBb = {
        id: `bb_${Date.now()}`,
        x: posX - 100,
        y: posY - 60
      };
      setBreadboards(prev => [...prev, newBb]);
      setSelectedId(newBb.id);
      setSelectedType('breadboard');
    } else {
      const newComp = {
        id: `comp_${catalogItem.type}_${Date.now()}`,
        type: catalogItem.type,
        x: posX,
        y: posY,
        rotation: 0,
        props: { ...catalogItem.defaultProps },
        state: {}
      };
      setComponents(prev => [...prev, newComp]);
      setSelectedId(newComp.id);
      setSelectedType('component');
    }
  };

  // Handle Rotate Selected (Batches of 45°, supports clockwise & counter-clockwise)
  const handleRotate = (dir = 1) => {
    if (selectedType === 'component' && selectedId) {
      saveSnapshot();
      const delta = dir * 45;
      setComponents(prev => prev.map(c => {
        if (c.id === selectedId) {
          const nextRot = ((c.rotation || 0) + delta + 360) % 360;
          return { ...c, rotation: nextRot };
        }
        return c;
      }));
    }
  };

  // Handle Delete Selected
  const handleDelete = () => {
    if (!selectedId) return;
    saveSnapshot();
    if (selectedType === 'component') {
      setComponents(prev => prev.filter(c => c.id !== selectedId));
      setWires(prev => prev.filter(w => w.from?.compId !== selectedId && w.to?.compId !== selectedId));
      setSelectedId(null);
      setSelectedType(null);
    } else if (selectedType === 'wire') {
      setWires(prev => prev.filter(w => w.id !== selectedId));
      setSelectedId(null);
      setSelectedType(null);
    } else if (selectedType === 'breadboard') {
      setBreadboards(prev => prev.filter(bb => bb.id !== selectedId));
      setWires(prev => prev.filter(w => w.from?.bbId !== selectedId && w.to?.bbId !== selectedId));
      setSelectedId(null);
      setSelectedType(null);
    }
  };

  // Keyboard Shortcuts (R Rotate 45°, Shift+R Counter-Clockwise, Del, Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate(e.shiftKey ? -1 : 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedType, components, wires, breadboards]);

  // Update Component Position
  const handleUpdateComponent = (compId, updates) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, ...updates } : c));
  };

  // Update Breadboard Position
  const handleUpdateBreadboard = (bbId, updates) => {
    setBreadboards(prev => prev.map(bb => bb.id === bbId ? { ...bb, ...updates } : bb));
  };

  // Add Wire
  const handleAddWire = (newWire) => {
    saveSnapshot();
    setWires(prev => [...prev, newWire]);
    setSelectedId(newWire.id);
    setSelectedType('wire');
  };

  // Update Wire (waypoints, color)
  const handleUpdateWire = (wireId, updates) => {
    saveSnapshot();
    setWires(prev => prev.map(w => w.id === wireId ? { ...w, ...updates } : w));
  };

  // Interactive Pushbutton Toggle
  const handleTogglePushbutton = (compId) => {
    setComponents(prev => prev.map(c => {
      if (c.id === compId) {
        const nextPressed = !c.state?.isPressed;
        return { ...c, state: { ...c.state, isPressed: nextPressed } };
      }
      return c;
    }));
  };

  // Interactive Slide Switch Toggle
  const handleToggleSlideSwitch = (compId) => {
    setComponents(prev => prev.map(c => {
      if (c.id === compId) {
        const nextPos = c.state?.position === 'left' ? 'right' : 'left';
        return { ...c, state: { ...c.state, position: nextPos } };
      }
      return c;
    }));
  };

  const selectedComponent = components.find(c => c.id === selectedId);
  const selectedBreadboard = breadboards.find(b => b.id === selectedId);

  return (
    <div className={`flex flex-col w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0B132B] text-slate-100' : 'bg-[#FAF7F2] text-[#203247]'
      }`}>
      {/* 1. TOP SYSTEM NAVIGATION HEADER (SIGNALSCHOOL AESTHETIC) */}
      <header className={`h-14 px-4 flex items-center justify-between border-b backdrop-blur-xl z-50 transition-colors duration-300 ${isDarkMode
        ? 'bg-[#0f172a]/90 border-slate-800 text-white shadow-md shadow-black/20'
        : 'bg-[#FAF8F4]/90 border-[#203247]/12 text-[#203247] shadow-xs'
        }`}>
        {/* Left: Back to Hub & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${isDarkMode
              ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-[#347f7a] hover:text-white'
              : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a] hover:bg-[#faf8f4]'
              }`}
            title="Return to SignalSchool Hub"
          >
            <ArrowLeft size={13} />
            <span>Hub</span>
          </button>

          <div className={`w-[1px] h-6 ${isDarkMode ? 'bg-slate-700' : 'bg-[#203247]/15'}`} />

          {/* Logo & Lab Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-[#347F7A] dark:text-teal-400 flex items-center justify-center font-extrabold text-xs shadow-2xs">
              <Zap size={15} className="fill-current" />
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-sm tracking-tight font-space-grotesk ${isDarkMode ? 'text-white' : 'text-[#203247]'
                }`}>
                TinkerLab
              </span>
            </div>
          </div>
        </div>

        {/* Right: Presets Dropdown, View Mode, Theme Switcher, Guide */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector Dropdown */}
          <div ref={presetMenuRef} className="relative">
            <button
              onClick={() => setIsPresetMenuOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs ${isPresetMenuOpen
                ? 'bg-[#347f7a] text-white border-[#347f7a]'
                : isDarkMode
                  ? 'bg-[#1e293b] border-slate-700 text-teal-400 hover:border-[#347f7a]'
                  : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a] hover:bg-[#faf8f4]'
                }`}
            >
              <Layers size={13} className={isPresetMenuOpen ? 'text-white' : 'text-[#347f7a] dark:text-teal-400'} />
              <span className="uppercase text-[11px] font-extrabold">Presets</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${isPresetMenuOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
            </button>

            {isPresetMenuOpen && (
              <div className={`absolute top-10 mt-1 right-0 z-50 border rounded-2xl shadow-2xl p-2 w-72 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/70' : 'bg-white/95 border-slate-200/90 text-[#203247] shadow-xl shadow-slate-900/15'
                }`}>
                {/* Pointer Arrow */}
                <div
                  className={`absolute -top-1.5 right-6 w-3 h-3 rotate-45 border-t border-l ${isDarkMode
                      ? 'bg-slate-900 border-slate-700/80'
                      : 'bg-white border-slate-200/90'
                    }`}
                />
                <span className="relative z-10 px-2.5 py-1 text-[10px] font-mono font-extrabold uppercase text-[#347f7a] dark:text-teal-400 tracking-wider block">
                  Circuit Presets
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {CIRCUIT_PRESETS.map(pr => (
                    <button
                      key={pr.id}
                      onClick={() => handleLoadPreset(pr)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${isDarkMode
                        ? 'hover:bg-slate-800 text-slate-200 hover:text-teal-300'
                        : 'hover:bg-teal-50 text-slate-700 hover:text-[#347f7a]'
                        }`}
                    >
                      <span>{pr.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <div className={`flex items-center p-0.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#EDE8DC]/80 border-[#203247]/12'
            }`}>
            <button
              onClick={() => setActiveViewMode('circuits')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-space-grotesk transition-all cursor-pointer ${activeViewMode === 'circuits'
                ? 'bg-[#347F7A] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span>⚡ Workbench</span>
            </button>
            <button
              onClick={() => setActiveViewMode('components')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-space-grotesk transition-all cursor-pointer ${activeViewMode === 'components'
                ? 'bg-[#347F7A] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <span>📋 BOM Parts</span>
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            title={isDarkMode ? 'Switch to Warm Studio Mode' : 'Switch to Dark Signal Mode'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${isDarkMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
              : 'bg-white border-[#203247]/15 text-slate-600 hover:text-[#203247] hover:border-[#347F7A]'
              }`}
          >
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Help & Guide Modal Trigger */}
          <button
            onClick={() => setIsHelpOpen(true)}
            title="Lab Guide & Keyboard Shortcuts"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-teal-400'
              : 'bg-white border-[#203247]/15 text-slate-600 hover:text-[#347F7A] hover:border-[#347F7A]'
              }`}
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* 2. SECONDARY ACTION TOOLBAR (SIGNALSCHOOL DESK TOOLS) */}
      <div className={`h-11 px-4 flex items-center justify-between border-b backdrop-blur-md z-40 transition-colors duration-300 ${isDarkMode
        ? 'bg-[#1e293b]/70 border-slate-800 text-slate-300'
        : 'bg-[#FAF8F4]/80 border-[#203247]/10 text-slate-700'
        }`}>
        {/* Left: Rotate, Delete, Undo, Redo, Wire Color Palette */}
        <div className="flex items-center gap-1.5">
          {/* Rotate Button */}
          <button
            onClick={() => handleRotate(1)}
            disabled={selectedType !== 'component'}
            title="Rotate (R, Shift+R for counter-clockwise)"
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all ${selectedType === 'component'
              ? isDarkMode
                ? 'bg-slate-800 border-slate-700 text-teal-300 hover:bg-slate-700 cursor-pointer shadow-2xs'
                : 'bg-white border-[#203247]/15 text-[#203247] hover:bg-[#F4F0E6] hover:border-[#347F7A] cursor-pointer shadow-2xs'
              : 'opacity-40 border-transparent cursor-not-allowed'
              }`}
          >
            <RotateCw size={14} />
            <span className="hidden sm:inline text-[11px]">Rotate</span>
          </button>

          {/* Delete (Minimal Icon Button) */}
          <button
            onClick={handleDelete}
            disabled={!selectedId}
            title={selectedId ? "Delete selected item (Del / Backspace)" : "Select an item to delete"}
            className={`p-1.5 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${selectedId
              ? isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-[#F87171] shadow-2xs hover:bg-[#EF4444]/15 hover:border-[#EF4444]/40 hover:text-[#EF4444] active:scale-95 cursor-pointer'
                : 'bg-white border-[#203247]/15 text-[#DC2626] shadow-2xs hover:bg-[#DC2626]/10 hover:border-[#DC2626]/30 hover:text-[#B91C1C] active:scale-95 cursor-pointer'
              : 'opacity-30 border-transparent text-slate-400 cursor-not-allowed'
              }`}
          >
            <Trash2 size={14} />
          </button>

          <div className={`w-[1px] h-5 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-[#203247]/15'}`} />

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all ${history.length > 0
              ? isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer'
                : 'bg-white border-[#203247]/15 text-slate-700 hover:bg-[#F4F0E6] cursor-pointer'
              : 'opacity-40 border-transparent cursor-not-allowed'
              }`}
          >
            <Undo2 size={14} />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all ${redoStack.length > 0
              ? isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer'
                : 'bg-white border-[#203247]/15 text-slate-700 hover:bg-[#F4F0E6] cursor-pointer'
              : 'opacity-40 border-transparent cursor-not-allowed'
              }`}
          >
            <Redo2 size={14} />
          </button>

          <div className={`w-[1px] h-5 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-[#203247]/15'}`} />

          {/* Enhanced Minimal Wire Color Selector */}
          <div ref={colorPickerRef} className="relative flex items-center ml-1">
            <button
              onClick={() => setIsColorPickerOpen(prev => !prev)}
              title={`Wire Color: ${WIRE_COLORS.find(c => c.hex.toLowerCase() === activeWireColor.toLowerCase())?.label || 'Wire'}`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${isColorPickerOpen
                  ? isDarkMode
                    ? 'bg-slate-800 border-teal-400 text-teal-300 ring-1 ring-teal-400/20'
                    : 'bg-white border-[#347F7A] text-[#203247] ring-1 ring-[#347F7A]/20'
                  : isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    : 'bg-white border-[#203247]/15 text-slate-700 hover:border-[#203247]/30'
                }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/20 shadow-2xs shrink-0"
                style={{
                  backgroundColor: activeWireColor,
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)'
                }}
              />

              <ChevronDown size={12} className={`transition-transform duration-200 text-slate-400 shrink-0 ${isColorPickerOpen ? 'rotate-180 text-teal-500' : ''}`} />
            </button>

            {/* Sleek Horizontal Studio Ribbon (Pure Colors, Pointer Arrow, Glossy Beads) */}
            {isColorPickerOpen && (
              <div
                className={`absolute top-10 mt-1 left-0 z-50 px-2.5 py-2 rounded-2xl shadow-2xl border backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 ${isDarkMode
                    ? 'bg-slate-900/95 border-slate-700/80 shadow-black/70'
                    : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-900/15'
                  }`}
              >
                {/* Pointer Arrow anchored directly under button swatch */}
                <div
                  className={`absolute -top-1.5 left-3.5 w-3 h-3 rotate-45 border-t border-l ${isDarkMode
                      ? 'bg-slate-900 border-slate-700/80'
                      : 'bg-white border-slate-200/90'
                    }`}
                />

                <div className="flex items-center gap-2 relative z-10">
                  {WIRE_COLORS.map((wc) => {
                    const isSelected = activeWireColor.toLowerCase() === wc.hex.toLowerCase();
                    return (
                      <button
                        key={wc.id}
                        onClick={() => {
                          setActiveWireColor(wc.hex);
                          if (selectedType === 'wire' && selectedId) {
                            handleUpdateWire(selectedId, { color: wc.hex });
                          }
                          setIsColorPickerOpen(false);
                        }}
                        title={wc.label}
                        className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 border ${isSelected
                            ? 'scale-115 ring-2 ring-offset-2 ring-[#347F7A] dark:ring-teal-400 ring-offset-white dark:ring-offset-slate-900 border-white/60 shadow-md'
                            : 'hover:scale-120 hover:-translate-y-0.5 active:scale-95 border-black/15 dark:border-white/20 opacity-90 hover:opacity-100 shadow-2xs'
                          }`}
                        style={{
                          backgroundColor: wc.hex,
                          boxShadow: isSelected
                            ? 'inset 0 1.5px 2px rgba(255,255,255,0.65), inset 0 -2px 3px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.25)'
                            : 'inset 0 1px 1.5px rgba(255,255,255,0.4), inset 0 -1.5px 2px rgba(0,0,0,0.3), 0 1.5px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            strokeWidth={3.5}
                            className={['#E2E8F0', '#ECC94B'].includes(wc.hex) ? 'text-slate-900' : 'text-white drop-shadow-xs'}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Status Indicator & Simulation Trigger (Far Right End-Aligned) */}
        <div className="flex items-center gap-2.5 ml-auto">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold ${isSimulating
            ? simulationResult?.hasClosedCircuit
              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            : isDarkMode
              ? 'bg-slate-800/80 text-slate-400 border border-slate-700'
              : 'bg-white/80 text-slate-500 border border-[#203247]/10'
            }`}>
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
            <span>{isSimulating ? (simulationResult?.hasClosedCircuit ? 'Closed Loop Active' : 'Open Loop (No Current)') : 'Workbench Ready'}</span>
          </div>

          {/* Arduino Code Button (Tinkercad Circuits style) */}
          <button
            onClick={() => setIsCodeEditorOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold font-space-grotesk text-xs transition-all shadow-xs cursor-pointer ${
              isCodeEditorOpen
                ? 'bg-[#347F7A] text-white ring-2 ring-teal-400/50 shadow-teal-700/20'
                : isDarkMode
                  ? 'bg-slate-800 border border-slate-700 text-teal-300 hover:border-teal-400 hover:text-white'
                  : 'bg-white border border-[#203247]/15 text-[#203247] hover:border-[#347F7A] hover:bg-teal-50/50'
            }`}
            title="Open Arduino C++ Code Editor & Serial Monitor"
          >
            <Code size={13} className={isCodeEditorOpen ? 'text-white' : 'text-[#347F7A] dark:text-teal-400'} />
            <span>Code</span>
            {arduinoComponents.length > 0 ? (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                isCodeEditorOpen
                  ? 'bg-white/20 text-white'
                  : isSimulating
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
              }`}>
                {arduinoComponents.length}
              </span>
            ) : (
              <span className="text-[10px] opacity-40 font-mono">(0)</span>
            )}
          </button>

          {/* Start / Stop Simulation Button */}
          <button
            onClick={() => setIsSimulating(prev => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold font-space-grotesk text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${isSimulating
              ? 'bg-[#E53E3E] hover:bg-[#C53030] text-white ring-2 ring-red-400/50 animate-pulse shadow-red-500/20'
              : 'bg-[#347F7A] hover:bg-[#2A6561] text-white shadow-teal-700/20 hover:shadow-teal-700/40'
              }`}
          >
            {isSimulating ? <Square size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
            <span>{isSimulating ? 'Stop Simulation' : 'Start Simulation'}</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CANVAS AREA */}
      <div className="relative flex-1 w-full h-[calc(100vh-132px)] overflow-hidden">
        {activeViewMode === 'circuits' ? (
          <>
            <TinkerCanvas
              breadboards={breadboards}
              components={components}
              wires={wires}
              simulationActive={isSimulating}
              simulationResult={simulationResult}
              activeWireColor={activeWireColor}
              selectedId={selectedId}
              selectedType={selectedType}
              isDarkMode={isDarkMode}
              onPlaceComponent={handlePlaceComponent}
              onSelect={(id, type) => {
                setSelectedId(id);
                setSelectedType(type);
                if (type === 'component') {
                  const cFound = components.find(c => c.id === id);
                  if (cFound?.type === 'arduino_uno') setSelectedArduinoId(id);
                }
                if (type === 'wire') {
                  const targetWire = wires.find(w => w.id === id);
                  if (targetWire?.color) {
                    setActiveWireColor(targetWire.color);
                  }
                }
              }}
              onAddWire={handleAddWire}
              onUpdateWire={handleUpdateWire}
              onUpdateComponent={handleUpdateComponent}
              onUpdateBreadboard={handleUpdateBreadboard}
              onTogglePushbutton={handleTogglePushbutton}
              onToggleSlideSwitch={handleToggleSlideSwitch}
            />

            {/* Component Inspector Floating Pill */}
            {selectedComponent && (
              <div className={`absolute top-4 ${isDrawerOpen ? 'left-[350px]' : 'left-[168px]'} z-30 transition-all duration-300 rounded-2xl shadow-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl border bg-white/95 border-[#203247]/15 text-[#203247]`}>
                <span className="text-xs font-bold font-space-grotesk capitalize">
                  {selectedComponent.type.replace('_', ' ')}:
                </span>

                {selectedComponent.type === 'resistor' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Resistance:</span>
                    <input
                      type="number"
                      value={selectedComponent.props?.resistance || 220}
                      onChange={e => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, resistance: val }
                        });
                      }}
                      className="w-20 px-2 py-0.5 rounded-lg text-xs font-mono font-bold border outline-none bg-slate-50 border-[#CBD5E0] text-slate-800"
                    />
                    <span className="text-xs font-bold opacity-75">Ω</span>
                  </div>
                )}

                {selectedComponent.type === 'led' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Color:</span>
                    <TinkerSelect
                      value={selectedComponent.props?.color || 'red'}
                      options={[
                        { value: 'red', label: 'Red', icon: <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm inline-block" /> },
                        { value: 'green', label: 'Green', icon: <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm inline-block" /> },
                        { value: 'blue', label: 'Blue', icon: <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm inline-block" /> },
                        { value: 'yellow', label: 'Yellow', icon: <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm inline-block" /> },
                        { value: 'orange', label: 'Orange', icon: <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm inline-block" /> },
                        { value: 'white', label: 'White', icon: <span className="w-2 h-2 rounded-full bg-slate-200 border border-slate-400 shadow-sm inline-block" /> },
                      ]}
                      onChange={color => {
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, color }
                        });
                      }}
                      isDarkMode={false}
                    />
                  </div>
                )}

                {selectedComponent.type === 'potentiometer' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Dial:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedComponent.state?.value ?? 50}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        handleUpdateComponent(selectedComponent.id, {
                          state: { ...(selectedComponent.state || {}), value: val }
                        });
                      }}
                      className="w-20 accent-[#347F7A] cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold w-9 text-right opacity-90">
                      {selectedComponent.state?.value ?? 50}%
                    </span>
                    <span className="text-xs opacity-40">|</span>
                    <span className="text-xs opacity-75">Max:</span>
                    <input
                      type="number"
                      value={selectedComponent.props?.maxResistance || selectedComponent.props?.resistance || 10000}
                      onChange={e => {
                        const val = Math.max(100, parseInt(e.target.value, 10) || 10000);
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, maxResistance: val, resistance: val }
                        });
                      }}
                      className="w-16 px-1.5 py-0.5 rounded-lg text-xs font-mono font-bold border outline-none bg-slate-50 border-[#CBD5E0] text-slate-800"
                    />
                    <span className="text-xs font-bold opacity-75">Ω</span>
                  </div>
                )}

                {selectedComponent.type === 'capacitor' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Capacitance:</span>
                    <TinkerSelect
                      value={selectedComponent.props?.capacitance || '100µF'}
                      options={CAPACITOR_VALUE_OPTIONS}
                      onChange={cap => {
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, capacitance: cap }
                        });
                      }}
                      isDarkMode={false}
                    />

                    <span className="text-xs opacity-40">|</span>
                    <span className="text-xs opacity-75">Rating:</span>
                    <TinkerSelect
                      value={selectedComponent.props?.voltage || '25V'}
                      options={CAPACITOR_VOLTAGE_OPTIONS}
                      onChange={v => {
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, voltage: v }
                        });
                      }}
                      isDarkMode={false}
                    />
                  </div>
                )}

                {selectedComponent.type === 'vibration_motor' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Rating:</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
                      1.5V – 3.7V (Rated 3V)
                    </span>
                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isVibrating && (
                      <>
                        <span className="text-xs opacity-40">|</span>
                        <span className="text-xs font-mono font-bold text-teal-600 animate-pulse flex items-center gap-1">
                          <Zap size={11} className="fill-teal-600" />
                          {simulationResult.componentStates[selectedComponent.id].rpm || 10000} RPM
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 font-bold">
                          {simulationResult.componentStates[selectedComponent.id].voltage}V
                        </span>
                      </>
                    )}
                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isOverdriven && !simulationResult?.componentStates?.[selectedComponent.id]?.isBurnedOut && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-bold border border-amber-500/30">
                        ⚡ Overdriven
                      </span>
                    )}
                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isBurnedOut && (
                      <>
                        <span className="text-xs opacity-40">|</span>
                        <span className="text-xs font-mono font-bold text-red-500 animate-pulse flex items-center gap-1">
                          ⚠️ Overvoltage Burnout
                        </span>
                      </>
                    )}
                  </div>
                )}

                {selectedComponent.type === 'diode' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Model:</span>
                    <TinkerSelect
                      value={selectedComponent.props?.model || '1N4007'}
                      options={DIODE_MODEL_OPTIONS}
                      onChange={model => {
                        handleUpdateComponent(selectedComponent.id, {
                          props: { ...selectedComponent.props, model }
                        });
                      }}
                      isDarkMode={false}
                    />
                    <span className="text-xs opacity-40">|</span>
                    <span className="text-[11px] font-mono opacity-85">
                      Vf: <strong className="text-teal-600">
                        {selectedComponent.props?.model === '1N5819' ? '0.35V' : (selectedComponent.props?.model === '1N4148' ? '0.65V' : '0.7V')}
                      </strong>
                    </span>

                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isConducting && !simulationResult?.componentStates?.[selectedComponent.id]?.isBurnedOut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Forward Conducting ({simulationResult.componentStates[selectedComponent.id].currentMa} mA)
                      </span>
                    )}

                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isBlocking && !simulationResult?.componentStates?.[selectedComponent.id]?.isBurnedOut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 font-bold border border-sky-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        Reverse Blocking ({simulationResult.componentStates[selectedComponent.id].voltageDrop}V Drop)
                      </span>
                    )}

                    {isSimulating && simulationResult?.componentStates?.[selectedComponent.id]?.isBurnedOut && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 font-bold border border-red-500/30 flex items-center gap-1 animate-pulse">
                        ⚠️ Overcurrent Burnout
                      </span>
                    )}
                  </div>
                )}

                {selectedComponent.type === 'photoresistor' && (() => {
                  const currentLight = selectedComponent.props?.light ?? 50;
                  const res = Math.round(400 * Math.pow(500000 / 400, (100 - currentLight) / 100));
                  const resStr = res >= 1000000
                    ? `${(res / 1000000).toFixed(1)} MΩ`
                    : (res >= 1000 ? `${(res / 1000).toFixed(1)} kΩ` : `${res} Ω`);
                  const ldrState = isSimulating && simulationResult?.componentStates?.[selectedComponent.id];

                  return (
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs opacity-75 flex items-center gap-1">
                        <Sun size={12} className="text-amber-500" />
                        Light:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentLight}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            handleUpdateComponent(selectedComponent.id, {
                              props: { ...selectedComponent.props, light: val }
                            });
                          }}
                          className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#347F7A]"
                          title={`Light Intensity: ${currentLight}%`}
                        />
                        <span className="text-[11px] font-mono font-bold w-7 text-right">
                          {currentLight}%
                        </span>
                      </div>

                      <span className="text-xs opacity-40">|</span>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
                        {resStr}
                      </span>

                      {isSimulating && ldrState?.currentMa > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {ldrState.currentMa} mA
                        </span>
                      )}
                    </div>
                  );
                })()}

                {selectedComponent.type === 'led_rgb' && (() => {
                  const rgbState = isSimulating && simulationResult?.componentStates?.[selectedComponent.id];
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">Common:</span>
                      <TinkerSelect
                        value={selectedComponent.props?.common || 'cathode'}
                        options={RGB_LED_COMMON_OPTIONS}
                        onChange={val => {
                          handleUpdateComponent(selectedComponent.id, {
                            props: { ...selectedComponent.props, common: val }
                          });
                        }}
                        isDarkMode={false}
                      />

                      {isSimulating && (
                        <>
                          <span className="text-xs opacity-40">|</span>
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${rgbState?.rLit ? 'bg-red-500/20 text-red-600 border border-red-500/40' : 'opacity-40'}`}>
                              R: {rgbState?.rCurrent || 0}mA
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${rgbState?.gLit ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40' : 'opacity-40'}`}>
                              G: {rgbState?.gCurrent || 0}mA
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${rgbState?.bLit ? 'bg-blue-500/20 text-blue-600 border border-blue-500/40' : 'opacity-40'}`}>
                              B: {rgbState?.bCurrent || 0}mA
                            </span>
                          </div>
                        </>
                      )}

                      {isSimulating && rgbState?.isBurnedOut && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 font-bold border border-red-500/30 flex items-center gap-1 animate-pulse">
                          ⚠️ Overcurrent Burnout
                        </span>
                      )}
                    </div>
                  );
                })()}

                {selectedComponent.type === 'dc_motor' && (() => {
                  const motorState = isSimulating && simulationResult?.componentStates?.[selectedComponent.id];
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">Rating:</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
                        3V – 9V DC
                      </span>

                      {isSimulating && motorState?.isSpinning && (
                        <>
                          <span className="text-xs opacity-40">|</span>
                          <span className="text-xs font-mono font-bold text-teal-600 animate-pulse flex items-center gap-1">
                            <RotateCw size={11} className={motorState.direction === 'ccw' ? '-scale-x-100' : ''} />
                            {motorState.rpm?.toLocaleString() || 0} RPM ({motorState.direction === 'cw' ? 'CW' : 'CCW'})
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 font-bold">
                            {motorState.voltage}V • {motorState.currentMa}mA
                          </span>
                        </>
                      )}

                      {isSimulating && motorState?.isOverdriven && !motorState?.isBurnedOut && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-bold border border-amber-500/30">
                          ⚡ High Voltage
                        </span>
                      )}

                      {isSimulating && motorState?.isBurnedOut && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 font-bold border border-red-500/30 flex items-center gap-1 animate-pulse">
                          ⚠️ Overvoltage Burnout
                        </span>
                      )}
                    </div>
                  );
                })()}

                {(selectedComponent.type === 'transistor_npn' || selectedComponent.type === 'transistor') && (() => {
                  const tState = isSimulating && simulationResult?.componentStates?.[selectedComponent.id];
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">Type:</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-800">
                        NPN Transistor
                      </span>

                      {isSimulating ? (
                        tState?.isConducting ? (
                          <>
                            <span className="text-xs opacity-40">|</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Saturated (ON)
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 font-bold">
                              Ic: {tState.collectorCurrentMa || 0}mA • Ib: {tState.baseCurrentMa || 0}mA
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs opacity-40">|</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                              Cut-off (OFF) • Vbe &lt; 0.7V
                            </span>
                          </>
                        )
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                          Pins: C (Collector) • B (Base) • E (Emitter)
                        </span>
                      )}
                    </div>
                  );
                })()}

                {selectedComponent.type === 'arduino_uno' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Board:</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-teal-50 border-teal-200 text-teal-800">
                      ATmega328P @ 16 MHz
                    </span>

                    <button
                      onClick={() => {
                        setSelectedArduinoId(selectedComponent.id);
                        setIsCodeEditorOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#347F7A] text-white hover:bg-[#2A6561] text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs"
                      title="Open Arduino Code Editor"
                    >
                      <Code size={12} />
                      <span>Code</span>
                    </button>

                    {isSimulating ? (
                      <>
                        <span className="text-xs opacity-40">|</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          USB 5.0V Active
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-bold">
                          Pin 13 (L) High
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                        Standby (Start Simulation to Power)
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleRotate(1)}
                  title="Rotate 45° (R)"
                  className="px-2 py-0.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer bg-slate-50 border-slate-200 text-[#203247] hover:bg-slate-100"
                >
                  <RotateCw size={12} />
                  <span>{selectedComponent.rotation || 0}°</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="px-2.5 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Breadboard Inspector Floating Pill */}
            {selectedBreadboard && (
              <div className={`absolute top-4 ${isDrawerOpen ? 'left-[350px]' : 'left-[168px]'} z-30 transition-all duration-300 rounded-2xl shadow-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl border ${isDarkMode ? 'bg-[#0f172a]/95 border-slate-700 text-white' : 'bg-white/95 border-[#203247]/15 text-[#203247]'
                }`}>
                <span className="text-xs font-bold font-space-grotesk">Breadboard (Half):</span>
                <span className="text-xs opacity-75 font-mono">400 Tie-Points</span>
                <button
                  onClick={handleDelete}
                  className="px-2.5 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Right Drawer (Component Catalog) */}
            <TinkerDrawer
              isOpen={isDrawerOpen}
              onToggleOpen={() => setIsDrawerOpen(prev => !prev)}
              isDarkMode={isDarkMode}
            />
          </>
        ) : (
          /* Bill of Materials (BOM Table) */
          <div className={`w-full h-full p-8 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FAF8F4] text-[#203247]'
            }`}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold font-space-grotesk mb-1">Circuit Bill of Materials (BOM)</h2>
              <p className="text-xs opacity-75 mb-6 font-mono-signal">List of all electronic parts and modules in {projectName}</p>

              <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#203247]/12'
                }`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider font-mono-signal ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#F8FAFC] text-slate-500 border-[#E2E8F0]'
                      }`}>
                      <th className="p-3">Component</th>
                      <th className="p-3">Specification</th>
                      <th className="p-3 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-[#E2E8F0] text-slate-700'
                    }`}>
                    {breadboards.length > 0 && (
                      <tr className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-semibold">Half Breadboard</td>
                        <td className="p-3 opacity-75">400 Tie-Points, Power Rails</td>
                        <td className="p-3 text-center font-bold font-mono">{breadboards.length}</td>
                      </tr>
                    )}
                    {Object.entries(
                      components.reduce((acc, c) => {
                        const key = c.type === 'resistor'
                          ? `Resistor (${c.props?.resistance || 220}Ω)`
                          : c.type === 'led'
                            ? `LED (${c.props?.color || 'red'})`
                            : c.type === 'capacitor'
                              ? `Capacitor (${c.props?.capacitance || '100µF'})`
                              : c.type === 'vibration_motor'
                                ? 'ERM Micro Vibration Motor (3V)'
                                : c.type === 'diode'
                                  ? `Diode (${c.props?.model || '1N4007'})`
                                  : c.type === 'photoresistor'
                                    ? `Photoresistor (5mm CdS LDR)`
                                    : c.type === 'led_rgb'
                                      ? `LED RGB (5mm 4-Pin Tri-Color)`
                                      : c.type === 'dc_motor'
                                        ? 'DC Motor (Hobby 3V–9V)'
                                      : c.type === 'arduino_uno'
                                         ? 'Arduino Uno R3 (ATmega328P)'
                                         : c.type.replace('_', ' ').toUpperCase();
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([item, qty]) => (
                      <tr key={item} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-semibold">{item}</td>
                        <td className="p-3 opacity-75">Standard Hardware Part</td>
                        <td className="p-3 text-center font-bold font-mono">{qty}</td>
                      </tr>
                    ))}
                    <tr className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-semibold">Hookup Connecting Wires</td>
                      <td className="p-3 opacity-75">Multi-color Flexible Jumpers</td>
                      <td className="p-3 text-center font-bold font-mono">{wires.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM DIAGNOSTIC & TELEMETRY FOOTER */}
      <footer className={`h-8 px-4 flex items-center justify-between border-t text-[11px] font-mono transition-colors duration-300 z-20 ${isDarkMode
        ? 'bg-[#0f172a] border-slate-800 text-slate-400'
        : 'bg-[#FAF8F4] border-[#203247]/12 text-slate-600'
        }`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span className="text-[#347F7A] dark:text-teal-400">TELEMETRY:</span>
          </span>
          <span>
            Loop: <strong className={simulationResult?.hasClosedCircuit ? 'text-emerald-500' : 'opacity-75'}>
              {isSimulating ? (simulationResult?.hasClosedCircuit ? 'Closed (Active)' : 'Open (Idle)') : 'Standby'}
            </strong>
          </span>
          <span>
            Current: <strong className="text-slate-800 dark:text-slate-200">
              {simulationResult?.totalCurrentMa !== undefined ? `${simulationResult.totalCurrentMa} mA` : '0.0 mA'}
            </strong>
          </span>
          <span>
            Parts: <strong className="text-slate-800 dark:text-slate-200">{components.length} components • {wires.length} wires</strong>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
          <span>[R] Rotate</span>
          <span>•</span>
          <span>[Del] Delete</span>
          <span>•</span>
          <span>[Ctrl+Z] Undo</span>
          <span>•</span>
          <span>Drag parts onto workbench</span>
        </div>
      </footer>

      {/* 5. LAB GUIDE & SHORTCUTS MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className={`rounded-2xl max-w-xl w-full p-6 shadow-2xl border flex flex-col gap-4 relative animate-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-[#0f172a] text-white border-slate-700' : 'bg-white text-[#203247] border-[#203247]/15'
            }`}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-[#347F7A] dark:text-teal-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-space-grotesk">TinkerLab Circuits Guide</h3>
                  <p className="text-xs opacity-75">Interactive Breadboard & Electronic Circuit Studio</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-slate-500 hover:text-slate-900'
                  }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#FAF8F4] border-[#203247]/10'}`}>
                <h4 className="font-bold text-[#347F7A] dark:text-teal-400 mb-1.5 flex items-center gap-1.5">
                  <span>⚡</span> Routing Flexible Wires
                </h4>
                <p className="opacity-90">
                  Click any component pin or breadboard hole to start a wire. While moving across the canvas, <strong>click empty space to create rounded corners</strong> and waypoints. Double-click an existing wire to insert new corners.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#FAF8F4] border-[#203247]/10'}`}>
                <h4 className="font-bold text-[#347F7A] dark:text-teal-400 mb-1.5 flex items-center gap-1.5">
                  <span>🖐</span> Drag & Drop Parts
                </h4>
                <p className="opacity-90">
                  Drag any component or breadboard from the right catalog directly onto the canvas workbench. Click on placed components to rotate or modify resistance/color properties.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-[#FAF8F4] border-[#203247]/10'}`}>
                <h4 className="font-bold text-[#347F7A] dark:text-teal-400 mb-1.5 flex items-center gap-1.5">
                  <span>⌨</span> Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-0.5 rounded border text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>R</kbd>
                    <span>Rotate Component</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-0.5 rounded border text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>Del</kbd>
                    <span>Delete Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-0.5 rounded border text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>Ctrl+Z</kbd>
                    <span>Undo Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className={`px-2 py-0.5 rounded border text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>Esc</kbd>
                    <span>Cancel Wire / Drop</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#347F7A] text-white text-xs font-bold hover:bg-[#2A6561] transition-all cursor-pointer border-none shadow-md"
              >
                Got it, let's build!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ARDUINO C++ CODE EDITOR & SERIAL MONITOR DRAWER */}
      <TinkerCodeEditor
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        arduinoComponents={arduinoComponents}
        selectedArduinoId={activeArduino?.id}
        onSelectArduino={(boardId) => {
          setSelectedArduinoId(boardId);
          setSelectedId(boardId);
          setSelectedType('component');
        }}
        onAddArduino={handleAddArduinoUno}
        onLocateArduino={handleLocateArduino}
        onRenameArduino={handleRenameArduino}
        code={activeCode}
        onChangeCode={handleUpdateCode}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(prev => !prev)}
        serialLogs={serialLogs}
        onClearSerial={() => setSerialLogs([])}
        onSendSerial={handleSendSerial}
        runtimeError={runtimeError}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
