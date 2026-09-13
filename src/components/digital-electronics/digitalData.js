import {
  Cpu, Zap, Binary, Layers, GitFork, RefreshCw, Repeat, Radio, Split, Lightbulb
} from 'lucide-react';

export const DIGITAL_ELECTRONICS_DATA = [
  // ═══════════════════════════════════════════
  //  1. FUNDAMENTAL LOGIC GATES
  // ═══════════════════════════════════════════
  {
    id: 'basic-gates',
    title: 'Fundamental Logic Gates',
    category: 'Fundamental Gates',
    categoryTag: 'Combinational Primitives',
    presetId: 'basic_gates',
    icon: Cpu,
    iconColor: '#347f7a',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'basic-gates',
    icChip: '74LS08 (AND) / 74LS32 (OR) / 74LS04 (NOT)',
    propagationDelay: '9 ns (TTL) / 2.5 ns (CMOS)',
    transistorCount: '4–6 MOSFETs per gate',
    booleanEquation: 'Y = A · B (AND) | Y = A + B (OR) | Y = A̅ (NOT)',
    shortDesc: 'The elemental building blocks of all binary computing: AND, OR, and NOT gates operating on discrete voltage levels.',
    
    // BEGINNER-FRIENDLY MENTAL MODEL & INTUITION
    mentalModel: {
      analogy: 'Light Switches in Your House',
      metaphor: 'Imagine electricity flowing through switches to power a light bulb:',
      points: [
        { label: 'AND Gate', icon: '🔌', text: 'Two switches connected in a row (in series). The bulb lights up ONLY if Switch 1 AND Switch 2 are both flipped ON. Example: A safety key AND a start button are both needed to start a rocket.' },
        { label: 'OR Gate', icon: '💡', text: 'Two switches connected side-by-side (in parallel). The bulb lights up if Switch 1 OR Switch 2 is flipped ON. Example: Either the doorbell at your front door OR your back door rings the same chime.' },
        { label: 'NOT Gate', icon: '🔄', text: 'An inverted button (the Inverter). When you push it, the light turns OFF. When you let go, it turns ON. Example: The light inside your refrigerator turns ON only when the door is NOT closed.' },
        { label: 'XOR Gate', icon: '⚡', text: 'A staircase light switch! Flipping either switch toggles the light. If both switches are in the same position, the light is OFF. It is only ON when the two switches are DIFFERENT.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Computers Only Know 0 and 1', text: 'Inside a chip, 0 means 0 Volts (Ground / OFF) and 1 means +5 Volts (Power / ON). There is no "maybe".' },
      { step: '2', title: 'Gates Make Tiny Decisions', text: 'A logic gate takes one or two voltage signals in, compares them according to a simple rule, and puts out a single new voltage signal.' },
      { step: '3', title: 'Billions Work Together', text: 'A single gate can only make one tiny choice. But when you wire millions of them together, they can play 3D games, stream video, and run AI.' }
    ],

    ahaMoment: 'Every smartphone, supercomputer, and rocket guidance computer on Earth is just billions of these microscopic AND, OR, and NOT switches connected together in clever patterns.',

    beginnerMistakes: [
      { mistake: 'Confusing OR with XOR', fix: 'In everyday English, "Do you want tea or coffee?" usually means pick ONE (exclusive). But in computer logic, a standard OR gate is TRUE if you pick BOTH! Only XOR means strictly one or the other.' },
      { mistake: 'Thinking logic gates store information', fix: 'Basic logic gates have ZERO memory. The instant you flip an input switch, the output changes. If you remove the input, the output vanishes immediately. To remember things, you need sequential circuits like Latches and Flip-Flops!' }
    ],

    quiz: {
      question: 'You want a security alarm to go off if the window opens (Sensor A) OR the front door opens (Sensor B). Which logic gate should you use?',
      options: ['AND Gate', 'OR Gate', 'NOT Gate', 'NAND Gate'],
      correctIndex: 1,
      explanation: 'An OR gate outputs a 1 (Alarm ON) whenever Sensor A is triggered, Sensor B is triggered, or both are triggered simultaneously!'
    },

    overview: 'At the heart of every modern microprocessor lies the logic gate — a microscopic electronic switch composed of CMOS transistors that maps continuous physical voltages into discrete binary decisions (0 and 1). By combining the three primary primitives (AND, OR, NOT), any conceivable computational function can be synthesized.',
    
    detailedTheory: {
      mechanics: 'Logic gates operate by using complementary pairs of n-channel and p-channel MOSFETs. In CMOS technology, when an input is at logic 1 (+5V or +3.3V), the NMOS pull-down network turns ON and pulls the output toward Ground (0V), while the PMOS pull-up network turns OFF. The inversion of this action produces standard Boolean transfer curves with high noise immunity.',
      siliconArchitecture: 'Standard 7400-series TTL ICs (e.g. SN74LS08 Quad 2-Input AND) contain 4 independent gates in a 14-pin dual inline package (DIP). Modern sub-nanometer chips (FinFET / GAAFET) pack billions of these gates onto a single die measuring just a few square millimeters.',
      operations: [
        { name: 'AND (Conjunction)', rule: 'Y = A · B', desc: 'Output is HIGH (1) if and only if ALL inputs are simultaneously HIGH.' },
        { name: 'OR (Disjunction)', rule: 'Y = A + B', desc: 'Output is HIGH (1) if AT LEAST ONE input is HIGH.' },
        { name: 'NOT (Inversion)', rule: 'Y = A̅', desc: 'Single input gate that flips HIGH to LOW and LOW to HIGH (logic inverter).' },
        { name: 'XOR (Exclusive OR)', rule: 'Y = A ⊕ B', desc: 'Output is HIGH when inputs differ (odd parity detector).' }
      ],
      tradeoffs: [
        { pro: 'Universal abstraction: Any truth function can be realized using Boolean logic primitives.' },
        { pro: 'Extremely high noise margin in CMOS logic with zero static DC current draw when idle.' },
        { con: 'Propagation delay (tpd) accumulates with gate depth, limiting maximum CPU clock frequency.' },
        { con: 'Dynamic power dissipation (P = C · V² · f) scales linearly with switching frequency.' }
      ]
    },

    realWorldUseCases: [
      'Arithmetic Logic Units (ALUs) inside CPUs for branch comparison & bitwise operations',
      'Address decoders in memory management units (MMUs) selecting RAM wordlines',
      'Safety interlock circuits in industrial automation (emergency shutoff requiring redundant sensors)',
      'Hardware parity generation and error detection in PCIe and DDR bus interfaces'
    ],

    truthTable: {
      headers: ['Input A', 'Input B', 'AND (A·B)', 'OR (A+B)', 'XOR (A⊕B)', 'NAND', 'NOR'],
      rows: [
        { inputs: [0, 0], outputs: [0, 0, 0, 1, 1] },
        { inputs: [0, 1], outputs: [0, 1, 1, 1, 0] },
        { inputs: [1, 0], outputs: [0, 1, 1, 1, 0] },
        { inputs: [1, 1], outputs: [1, 1, 0, 0, 0] }
      ]
    },

    codeSnippets: {
      verilog: `// Basic Logic Gates in Verilog HDL
module basic_gates (
    input  wire a,
    input  wire b,
    output wire out_and,
    output wire out_or,
    output wire out_not_a,
    output wire out_xor
);
    // Continuous dataflow assignments
    assign out_and   = a & b;
    assign out_or    = a | b;
    assign out_not_a = ~a;
    assign out_xor   = a ^ b;
endmodule`,
      vhdl: `-- Basic Logic Gates in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity basic_gates is
    Port (
        a         : in  STD_LOGIC;
        b         : in  STD_LOGIC;
        out_and   : out STD_LOGIC;
        out_or    : out STD_LOGIC;
        out_not_a : out STD_LOGIC;
        out_xor   : out STD_LOGIC
    );
end basic_gates;

architecture Dataflow of basic_gates is
begin
    out_and   <= a and b;
    out_or    <= a or b;
    out_not_a <= not a;
    out_xor   <= a xor b;
end Dataflow;`,
      javascript: `// Software simulation of basic logic primitives
class LogicGates {
  static AND(a, b) { return Boolean(a && b); }
  static OR(a, b)  { return Boolean(a || b); }
  static NOT(a)    { return !a; }
  static XOR(a, b) { return Boolean((a || b) && !(a && b)); }
  static NAND(a, b){ return !(a && b); }
  static NOR(a, b) { return !(a || b); }
  static XNOR(a, b){ return a === b; }
}`
    }
  },

  // ═══════════════════════════════════════════
  //  2. BOOLEAN ALGEBRA & DE MORGAN'S LAWS
  // ═══════════════════════════════════════════
  {
    id: 'boolean-algebra',
    title: 'Boolean Algebra & De Morgan',
    category: 'Fundamental Gates',
    categoryTag: 'Mathematical Foundation',
    presetId: 'basic_gates',
    icon: Binary,
    iconColor: '#f09a7d',
    bgColor: 'bg-[#F4DFC9]',
    diagramType: 'boolean-algebra',
    icChip: 'Discrete Gate Minimization / Logic Synthesis',
    propagationDelay: 'Varies by optimized depth',
    transistorCount: 'Saves 30%–60% silicon area',
    booleanEquation: '(A + B)\' = A\' · B\'  |  (A · B)\' = A\' + B\'',
    shortDesc: 'Mathematical rules of algebraic logic, dual theorems, and De Morgan’s laws for circuit minimization.',
    
    mentalModel: {
      analogy: 'Simplifying Algebraic Fractions, but with Truth!',
      metaphor: 'In normal math, 2x + 4x simplifies to 6x. Boolean algebra does the exact same thing for computer circuits:',
      points: [
        { label: 'Why Simplify?', icon: '✂️', text: 'Fewer equations mean fewer real-world chips! If an equation has 10 gates and you can simplify it to 2 gates, your circuit is cheaper, faster, and stays cooler.' },
        { label: 'De Morgan in Plain English', icon: '💡', text: '"It is NOT true that I like tea AND coffee" is identical to saying "I do NOT like tea, OR I do NOT like coffee". Inverting the whole group flips AND to OR!' },
        { label: 'Double Inversion', icon: '🔄', text: 'Flipping a light switch twice returns it to where it started: NOT(NOT A) = A.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Write the Problem in Math', text: 'Instead of words, we write A · B for AND, A + B for OR, and A̅ for NOT.' },
      { step: '2', title: 'Cancel Out Redundancies', text: 'If an input doesn’t change the outcome (like A + 1 = 1), throw it away.' },
      { step: '3', title: 'Swap Gates using De Morgan', text: 'You can swap expensive or slow gates with cheaper NAND gates using De Morgan’s laws without changing the behavior.' }
    ],

    ahaMoment: 'Simplifying a Boolean formula by hand on a napkin directly translates into removing physical silicon transistors from a real chip!',

    beginnerMistakes: [
      { mistake: 'Treating "+" as arithmetic addition', fix: 'In Boolean algebra, 1 + 1 = 1 (TRUE OR TRUE is TRUE), NOT 2! Binary addition with carries is done by Adders, not the basic OR operator.' },
      { mistake: 'Forgetting to flip the operator in De Morgan’s Laws', fix: 'When pushing a NOT inside parentheses, you MUST flip the sign: (A · B)\' becomes A\' + B\', and (A + B)\' becomes A\' · B\'.' }
    ],

    quiz: {
      question: 'What is the simplified form of A · (A + B)?',
      options: ['A', 'B', 'A · B', '0'],
      correctIndex: 0,
      explanation: 'By the Absorption Law: A · (A + B) = A · A + A · B = A + A · B = A · (1 + B) = A · 1 = A. If A is 0, the output is 0. If A is 1, the output is 1. B has zero effect!'
    },

    overview: 'Boolean algebra is the formal mathematical framework used to express, analyze, and minimize digital circuits. Introduced by George Boole in 1847, it defines operations on a two-element set {0, 1}. Minimizing boolean expressions directly reduces the number of physical transistors, cuts propagation delay, and slashes power consumption.',
    
    detailedTheory: {
      mechanics: 'De Morgan’s Laws state that the negation of a conjunction is the disjunction of the negations: (A · B)\' = A\' + B\', and the negation of a disjunction is the conjunction of the negations: (A + B)\' = A\' · B\'. Graphically, an active-LOW input OR gate (bubbled inputs) is mathematically identical to a standard NAND gate.',
      siliconArchitecture: 'Modern EDA compilers (such as Synopsys Design Compiler or open-source Yosys) apply Boolean minimization algorithms (Quine-McCluskey, Espresso heuristic) to transform high-level RTL code into minimal Area/Timing Pareto-optimal gate netlists.',
      operations: [
        { name: 'Identity Laws', rule: 'A + 0 = A, A · 1 = A', desc: 'Operating with the identity element preserves the variable unchanged.' },
        { name: 'Null / Domination', rule: 'A + 1 = 1, A · 0 = 0', desc: 'Operating with the dominant value forces the output unconditionally.' },
        { name: 'Idempotent Laws', rule: 'A + A = A, A · A = A', desc: 'Repeating identical inputs adds zero additional information.' },
        { name: 'De Morgan\'s 1st Law', rule: '(A + B)\' = A\' · B\'', desc: 'NOR gate output equals AND gate with inverted inputs.' },
        { name: 'De Morgan\'s 2nd Law', rule: '(A · B)\' = A\' + B\'', desc: 'NAND gate output equals OR gate with inverted inputs.' }
      ],
      tradeoffs: [
        { pro: 'Minimizes gate count, directly shrinking silicon chip area and packaging cost.' },
        { pro: 'Reduces logic depth, lowering propagation delay and increasing maximum clock speed.' },
        { con: 'Manual algebraic simplification is error-prone for functions with more than 4 variables.' },
        { con: 'K-map manual techniques become multi-dimensional and unwieldy beyond 5 to 6 variables.' }
      ]
    },

    realWorldUseCases: [
      'Logic synthesis optimization passes in FPGA and ASIC placement and routing engines',
      'Fault detection and test pattern generation (ATPG) for silicon wafer quality control',
      'Branch prediction logic simplification in superscalar RISC-V and ARM architectures',
      'High-speed instruction decoder matrices in embedded microcontrollers'
    ],

    truthTable: {
      headers: ['A', 'B', '(A·B)\'', 'A\' + B\'', '(A+B)\'', 'A\' · B\'', 'Equivalence'],
      rows: [
        { inputs: [0, 0], outputs: [1, 1, 1, 1, '1 (Equal)'] },
        { inputs: [0, 1], outputs: [1, 1, 0, 0, '1 (Equal)'] },
        { inputs: [1, 0], outputs: [1, 1, 0, 0, '1 (Equal)'] },
        { inputs: [1, 1], outputs: [0, 0, 0, 0, '1 (Equal)'] }
      ]
    },

    codeSnippets: {
      verilog: `// De Morgan's Law Verification in Verilog
module demorgan_proof (
    input  wire a,
    input  wire b,
    output wire lhs_nand,   // ~(a & b)
    output wire rhs_or_inv, // ~a | ~b
    output wire lhs_nor,    // ~(a | b)
    output wire rhs_and_inv // ~a & ~b
);
    // Verifying (A & B)' == A' | B'
    assign lhs_nand   = ~(a & b);
    assign rhs_or_inv = (~a) | (~b);

    // Verifying (A | B)' == A' & B'
    assign lhs_nor     = ~(a | b);
    assign rhs_and_inv = (~a) & (~b);
endmodule`,
      vhdl: `-- De Morgan Equivalence in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity demorgan_proof is
    Port (
        a           : in  STD_LOGIC;
        b           : in  STD_LOGIC;
        nand_out    : out STD_LOGIC;
        demorgan_1  : out STD_LOGIC
    );
end demorgan_proof;

architecture Behavioral of demorgan_proof is
begin
    nand_out   <= not (a and b);
    demorgan_1 <= (not a) or (not b);
end Behavioral;`,
      javascript: `// Testing De Morgan equivalence across all truth vectors
function verifyDeMorgan(a, b) {
  const lhs1 = !(a && b);
  const rhs1 = (!a) || (!b);
  const lhs2 = !(a || b);
  const rhs2 = (!a) && (!b);
  
  return {
    law1Valid: lhs1 === rhs1,
    law2Valid: lhs2 === rhs2
  };
}`
    }
  },

  // ═══════════════════════════════════════════
  //  3. UNIVERSAL GATES (NAND & NOR)
  // ═══════════════════════════════════════════
  {
    id: 'universal-gates',
    title: 'Universal Gates (NAND & NOR)',
    category: 'Fundamental Gates',
    categoryTag: 'Logic Completeness',
    presetId: 'basic_gates',
    icon: RefreshCw,
    iconColor: '#38bdf8',
    bgColor: 'bg-[#cbe8e7]',
    diagramType: 'universal-gates',
    icChip: '74LS00 (Quad 2-Input NAND) / 74LS02 (Quad NOR)',
    propagationDelay: '7 ns (NAND is fastest TTL gate)',
    transistorCount: '4 CMOS MOSFETs (NAND requires no inverter)',
    booleanEquation: 'NAND = (A·B)\' | NOR = (A+B)\'',
    shortDesc: 'Complete functional logic systems capable of synthesizing any gate using only NAND or only NOR gates.',
    
    mentalModel: {
      analogy: 'Lego Bricks: A Single Universal Shape',
      metaphor: 'Imagine a Lego set that only has ONE single brick shape, yet by stacking them in different configurations, you can build any castle, car, or spaceship:',
      points: [
        { label: 'The Universal Magic', icon: '🧱', text: 'You do NOT need AND, OR, and NOT gates. If a factory can manufacture just one type of gate (NAND), you can wire them together to build EVERYTHING else!' },
        { label: 'How Apollo Went to the Moon', icon: '🚀', text: 'The 1969 Apollo Guidance Computer was built entirely out of 2,800 identical NOR chips. Using only one component made quality control easy and virtually unbreakable.' },
        { label: 'Why Chips Love NAND', icon: '⚡', text: 'In CMOS silicon physics, a NAND gate is physically smaller, uses fewer transistors, and switches faster than a standard AND gate.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Tie Inputs Together to make NOT', text: 'Connect both pins of a NAND gate to signal A. Presto: (A · A)\' = A̅. It becomes an inverter!' },
      { step: '2', title: 'Invert a NAND to make AND', text: 'Pass A and B into a NAND gate, then feed that output into a second NAND-based inverter. Two negations cancel out, leaving a pure AND gate!' },
      { step: '3', title: 'Invert First to make OR', text: 'Invert input A with one NAND, invert input B with another NAND, then feed both into a third NAND gate. Through De Morgan’s rule, you get A + B!' }
    ],

    ahaMoment: 'Chip manufacturers don’t build 10 different types of gates. They stamp out billions of tiny NAND gates because a single universal gate can create any computer program known to humankind.',

    beginnerMistakes: [
      { mistake: 'Thinking "Universal" means all gates do the same thing', fix: 'A single NAND gate still just does NAND. "Universal" means that with enough copies of NAND gates wired together, you can build any AND, OR, XOR, memory, or CPU.' },
      { mistake: 'Trying to make universal logic from basic AND or OR gates', fix: 'Neither AND nor OR can invert a signal! Without an inverter, you can never get a 0 from all 1s. That is why AND and OR are NOT universal.' }
    ],

    quiz: {
      question: 'How do you turn a 2-input NAND gate into a NOT gate (inverter)?',
      options: ['Connect both input pins together to the same signal', 'Connect one input to 0 and the other to the signal', 'Disconnect the output pin', 'Feed the output back into the input'],
      correctIndex: 0,
      explanation: 'When both inputs are tied together to signal A, the gate computes (A · A)\' which equals NOT A!'
    },

    overview: 'A logic gate family is classified as "Universal" if ANY boolean circuit can be constructed solely from that single gate type, without needing any other components. NAND and NOR are both universal gates. In silicon fabrication, NAND is preferred in CMOS because NMOS transistors are faster and smaller than PMOS transistors, making CMOS NAND gates faster and more compact than AND or OR gates.',
    
    detailedTheory: {
      mechanics: 'To create a NOT gate with NAND: Tie both inputs together (A · A)\' = A\'. To create an AND gate: Feed the output of a NAND gate into a NAND-based inverter: ((A · B)\')\' = A · B. To create an OR gate: Invert each input using NANDs, then feed both into a NAND gate: (A\' · B\')\' = A + B (via De Morgan’s theorem).',
      siliconArchitecture: 'The iconic Apollo Guidance Computer (AGC) that took humanity to the Moon in 1969 was built entirely out of 2,800 dual 3-input NOR logic integrated circuits. Using a single universal gate type drastically lowered manufacturing costs and maximized batch reliability.',
      operations: [
        { name: 'NAND as NOT', rule: 'Y = (A · A)\' = A̅', desc: 'Tie both input pins together to form an inverter.' },
        { name: 'NAND as AND', rule: 'Y = ((A · B)\')\' = A · B', desc: 'NAND followed by an inverter restores the AND function.' },
        { name: 'NAND as OR', rule: 'Y = (A̅ · B̅)\' = A + B', desc: 'Invert both inputs then NAND them together (De Morgan).' },
        { name: 'NAND as XOR', rule: '4 NAND gates', desc: 'Efficient cross-coupled 4-gate synthesis of A ⊕ B.' }
      ],
      tradeoffs: [
        { pro: 'Universal standard: Fabrication plants only need to optimize a single lithography cell.' },
        { pro: 'CMOS NAND gates have NMOS pull-downs in series, which provide lower resistance and higher speed.' },
        { con: 'Synthesizing complex gates (like XOR or MUX) purely from NANDs can increase total gate count.' },
        { con: 'Increased gate count adds propagation stages, causing higher total delay if unbuffered.' }
      ]
    },

    realWorldUseCases: [
      'NAND Flash Memory arrays in SSDs and smartphones (multibillion bit storage density)',
      'Legacy Apollo Guidance Computer (AGC) built 100% using discrete NOR gates',
      'ASIC standard-cell library optimization where NAND-dominated cells minimize die area',
      'Automotive safety-critical ASIL-D controllers with homogeneous redundancy'
    ],

    truthTable: {
      headers: ['A', 'B', 'NAND (A·B)\'', 'NOR (A+B)\'', 'NOT via NAND', 'OR via NAND'],
      rows: [
        { inputs: [0, 0], outputs: [1, 1, 1, 0] },
        { inputs: [0, 1], outputs: [1, 0, 1, 1] },
        { inputs: [1, 0], outputs: [1, 0, 0, 1] },
        { inputs: [1, 1], outputs: [0, 0, 0, 1] }
      ]
    },

    codeSnippets: {
      verilog: `// Pure NAND-only synthesis of an XOR Gate (4 NAND gates)
module xor_using_nand (
    input  wire a,
    input  wire b,
    output wire out_xor
);
    wire n1, n2, n3;

    assign n1      = ~(a & b);
    assign n2      = ~(a & n1);
    assign n3      = ~(b & n1);
    assign out_xor = ~(n2 & n3);
endmodule`,
      vhdl: `-- Pure NAND-only synthesis of an XOR Gate in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity xor_using_nand is
    Port ( a, b : in STD_LOGIC; out_xor : out STD_LOGIC );
end xor_using_nand;

architecture Structural of xor_using_nand is
    signal n1, n2, n3 : STD_LOGIC;
begin
    n1      <= not (a and b);
    n2      <= not (a and n1);
    n3      <= not (b and n1);
    out_xor <= not (n2 and n3);
end Structural;`,
      javascript: `// Synthesizing ALL gates using ONLY a primitive NAND function
const nand = (a, b) => !(a && b);

const notGate  = (a) => nand(a, a);
const andGate  = (a, b) => notGate(nand(a, b));
const orGate   = (a, b) => nand(notGate(a), notGate(b));
const xorGate  = (a, b) => {
  const n1 = nand(a, b);
  return nand(nand(a, n1), nand(b, n1));
};`
    }
  },

  // ═══════════════════════════════════════════
  //  4. HALF ADDER CIRCUIT
  // ═══════════════════════════════════════════
  {
    id: 'half-adder',
    title: 'Half Adder Circuit',
    category: 'Arithmetic Circuits',
    categoryTag: 'Binary Arithmetic',
    presetId: 'half_adder',
    icon: Zap,
    iconColor: '#e06c53',
    bgColor: 'bg-[#f5dec5]',
    diagramType: 'half-adder',
    icChip: 'Discrete XOR (7486) + AND (7408)',
    propagationDelay: '10 ns (Sum) / 7 ns (Carry)',
    transistorCount: '16 MOSFETs',
    booleanEquation: 'Sum = A ⊕ B  |  Carry = A · B',
    shortDesc: 'Elementary 2-input arithmetic circuit computing the binary sum and carry bit.',
    
    mentalModel: {
      analogy: 'Adding 1 + 1 in Elementary School',
      metaphor: 'Remember when you learned to add 7 + 8 = 15? You wrote down 5 in the ones column, and "carried" the 1 over to the tens column. Computers do the exact same thing in binary:',
      points: [
        { label: '0 + 0', icon: '0️⃣', text: 'Zero plus zero is 0. Sum is 0, Carry is 0.' },
        { label: '0 + 1 or 1 + 0', icon: '1️⃣', text: 'Zero plus one is 1. Sum is 1, Carry is 0.' },
        { label: '1 + 1 = 10 (Binary 2!)', icon: '✌️', text: 'One plus one is 2 (written as 10 in binary). The Sum digit in this column is 0, and the Carry digit sent to the next column is 1!' },
        { label: 'Why "Half"?', icon: '❓', text: 'It is only half an adder because it can only add two numbers. It has no way to receive a carry from a previous column!' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Sum is just XOR', text: 'The Sum bit is 1 whenever inputs are different (0+1=1, 1+0=1), and 0 when they match (0+0=0, 1+1=0). That is the exact definition of an XOR gate!' },
      { step: '2', title: 'Carry is just AND', text: 'A Carry only happens when both inputs are 1 (1+1=2). That is the exact definition of an AND gate!' },
      { step: '3', title: 'Combine 2 Gates', text: 'Wire input A and B into both an XOR gate and an AND gate. Now you have a working computer calculator!' }
    ],

    ahaMoment: 'Two simple logic gates (XOR + AND) are all it takes to teach silicon how to do arithmetic.',

    beginnerMistakes: [
      { mistake: 'Thinking 1 + 1 = 1 in an adder', fix: 'In an OR gate, 1 OR 1 is 1. But in an ADDER (addition), 1 + 1 = 2 (which in binary is written as 10, meaning Sum = 0 and Carry = 1).' },
      { mistake: 'Trying to build an 8-bit calculator out of Half Adders', fix: 'You can only use a Half Adder for the very first column (the 1s column). All subsequent columns need to accept a carry-in from the previous column, so they require Full Adders!' }
    ],

    quiz: {
      question: 'When inputs A = 1 and B = 1 are fed into a Half Adder, what are the Sum and Carry outputs?',
      options: ['Sum = 1, Carry = 1', 'Sum = 0, Carry = 1', 'Sum = 1, Carry = 0', 'Sum = 0, Carry = 0'],
      correctIndex: 1,
      explanation: '1 + 1 = 2 (binary 10). The least significant bit (Sum) is 0, and the most significant bit (Carry) is 1.'
    },

    overview: 'The Half Adder is the foundation of computer arithmetic. When adding two single binary digits (A + B), the result can be at most 1 + 1 = 10 in binary (decimal 2). This requires two output bits: a least-significant Sum bit (S) and a most-significant Carry bit (C). It is called a "Half" adder because it has no input for a carry bit generated by a preceding stage.',
    
    detailedTheory: {
      mechanics: 'The Sum bit produces a 1 when either input is 1, but not both (1+0=1, 0+1=1, and 1+1=0 with carry). This is precisely the XOR truth function: S = A ⊕ B. The Carry bit is only generated when both inputs are 1 (1+1=2), which is precisely the AND truth function: C = A · B.',
      siliconArchitecture: 'Inside modern ALUs, high-speed adders (like Kogge-Stone or Brent-Kung parallel prefix adders) generate initial propagate (P = A ⊕ B) and generate (G = A · B) signals at the first stage, which are mathematically identical to Half Adder outputs.',
      operations: [
        { name: 'Binary Addition (0+0)', rule: '0 + 0 = 0 (Carry 0)', desc: 'Both outputs remain at logic LOW (0).' },
        { name: 'Binary Addition (0+1)', rule: '0 + 1 = 1 (Carry 0)', desc: 'Sum output is HIGH (1), Carry remains 0.' },
        { name: 'Binary Addition (1+0)', rule: '1 + 0 = 1 (Carry 0)', desc: 'Sum output is HIGH (1), Carry remains 0.' },
        { name: 'Binary Addition (1+1)', rule: '1 + 1 = 0 (Carry 1)', desc: 'Sum wraps to 0, Carry bit is set to HIGH (1).' }
      ],
      tradeoffs: [
        { pro: 'Extremely simple layout requiring only 2 standard logic gates (XOR and AND).' },
        { pro: 'Zero carry ripple latency within the single stage.' },
        { con: 'Cannot be chained directly into multi-bit additions because it lacks a Carry-In (Cin) port.' },
        { con: 'Must be combined in pairs with an OR gate to construct a true Full Adder.' }
      ]
    },

    realWorldUseCases: [
      'Least-Significant Bit (LSB) stage of multi-bit ripple carry adders (no carry-in required)',
      'Multiplication array partial product accumulation in hardware integer multipliers',
      'Address calculation units in embedded microcontrollers (incrementing program counter by 1)',
      'Parity bit generators and Hamming code error correction encoders'
    ],

    truthTable: {
      headers: ['Input A', 'Input B', 'Sum (A⊕B)', 'Carry (A·B)', 'Decimal Output'],
      rows: [
        { inputs: [0, 0], outputs: [0, 0, 0] },
        { inputs: [0, 1], outputs: [1, 0, 1] },
        { inputs: [1, 0], outputs: [1, 0, 1] },
        { inputs: [1, 1], outputs: [0, 1, 2] }
      ]
    },

    codeSnippets: {
      verilog: `// Half Adder in Verilog HDL
module half_adder (
    input  wire a,
    input  wire b,
    output wire sum,
    output wire carry
);
    assign sum   = a ^ b; // XOR gate
    assign carry = a & b; // AND gate
endmodule`,
      vhdl: `-- Half Adder in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity half_adder is
    Port (
        a     : in  STD_LOGIC;
        b     : in  STD_LOGIC;
        sum   : out STD_LOGIC;
        carry : out STD_LOGIC
    );
end half_adder;

architecture Dataflow of half_adder is
begin
    sum   <= a xor b;
    carry <= a and b;
end Dataflow;`,
      javascript: `// Software simulation of a Half Adder
function halfAdder(a, b) {
  const sum   = (a ^ b) & 1; // XOR for Sum
  const carry = (a & b) & 1; // AND for Carry
  return { sum, carry, decimalValue: (carry << 1) | sum };
}`
    }
  },

  // ═══════════════════════════════════════════
  //  5. FULL ADDER CIRCUIT
  // ═══════════════════════════════════════════
  {
    id: 'full-adder',
    title: 'Full Adder Circuit',
    category: 'Arithmetic Circuits',
    categoryTag: 'Binary Arithmetic',
    presetId: 'full_adder',
    icon: Split,
    iconColor: '#a855f7',
    bgColor: 'bg-[#e5dfed]',
    diagramType: 'full-adder',
    icChip: '74LS283 (4-Bit Binary Full Adder) / Discrete 7486+7408+7432',
    propagationDelay: '14 ns (Sum) / 11 ns (Carry Out)',
    transistorCount: '28 MOSFETs (or 2 Half Adders + OR gate)',
    booleanEquation: 'Sum = A ⊕ B ⊕ Cin  |  Cout = (A·B) + (Cin·(A⊕B))',
    shortDesc: '3-input arithmetic adder supporting Carry-In, enabling multi-bit cascading addition across 32-bit and 64-bit ALUs.',
    
    mentalModel: {
      analogy: 'Adding 3 digits on paper: Top, Bottom, and the Carried-Over 1',
      metaphor: 'When you add 47 + 38 on paper, in the tens column you add 4 + 3 PLUS the carried-over 1 from 7+8=15. A Full Adder does that exact three-number addition:',
      points: [
        { label: '3 Inputs', icon: '🔢', text: 'Input A, Input B, and the Carry-In (Cin) that floated over from the column to the right.' },
        { label: '2 Outputs', icon: '📤', text: 'Sum (the answer for this column) and Carry-Out (Cout, any overflow carried over to the column on the left).' },
        { label: 'Made of 2 Half Adders', icon: '🧩', text: 'Half Adder 1 adds A + B. Half Adder 2 takes that result and adds Cin. An OR gate bundles the two possible carry outputs together.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Why 3 bits?', text: 'Because in multi-bit math, almost every column has to handle a leftover carry from the previous column.' },
      { step: '2', title: 'Maximum sum is 3', text: 'The biggest number you can add is 1 + 1 + 1 = 3 (binary 11). So Sum is 1, and Cout is 1.' },
      { step: '3', title: 'Chain 64 of them', text: 'Put 64 Full Adders side by side with the Cout of one feeding into the Cin of the next. Congratulations: you just designed a 64-bit CPU addition unit!' }
    ],

    ahaMoment: 'Every 64-bit CPU core in modern laptops and iPhones is simply 64 Full Adders lined up in a row calculating results at billions of times per second.',

    beginnerMistakes: [
      { mistake: 'Thinking Carry-In and Carry-Out are the same wire', fix: 'Cin comes FROM the previous right-hand stage. Cout goes TO the next left-hand stage. They are two completely different physical pins.' },
      { mistake: 'Worrying that both Half Adders might generate a Carry simultaneously', fix: 'It is mathematically impossible! If A and B generate a carry (both are 1), their intermediate sum is 0, so the second Half Adder cannot generate a carry. That is why a simple OR gate safely combines the two carries.' }
    ],

    quiz: {
      question: 'In a Full Adder, what happens when all three inputs are 1 (A=1, B=1, Cin=1)?',
      options: ['Sum = 0, Cout = 0', 'Sum = 1, Cout = 0', 'Sum = 0, Cout = 1', 'Sum = 1, Cout = 1'],
      correctIndex: 3,
      explanation: '1 + 1 + 1 = 3 in decimal, which is 11 in binary! Thus, both Sum = 1 and Cout = 1.'
    },

    overview: 'While a Half Adder can only add two single bits, a Full Adder adds three 1-bit inputs: A, B, and a Carry-In (Cin) propagating from the previous stage. This allows full adders to be chained in series to form Ripple Carry Adders of arbitrary bit-width (8-bit, 16-bit, 32-bit, 64-bit), making it the primary arithmetic engine of all digital processors.',
    
    detailedTheory: {
      mechanics: 'A Full Adder can be constructed out of two Half Adders and an OR gate. First, HA1 adds A and B, generating an intermediate sum S1 = A ⊕ B and carry C1 = A · B. Then, HA2 adds S1 and Cin, producing the final Sum S = S1 ⊕ Cin = A ⊕ B ⊕ Cin and carry C2 = S1 · Cin. Finally, the overall Carry-Out is Cout = C1 + C2. Notice that C1 and C2 can never both be 1 simultaneously, so an OR gate is completely safe.',
      siliconArchitecture: 'In a 64-bit Ripple Carry Adder, the carry bit must ripple through 64 consecutive stages, resulting in 64 × tpd delay. Modern processors bypass this ripple bottleneck using Carry-Lookahead Adders (CLA), which compute carry signals in parallel using generate (Gi = Ai·Bi) and propagate (Pi = Ai ⊕ Bi) logic trees in O(log n) time.',
      operations: [
        { name: 'Zero addition (0+0+0)', rule: '0 + 0 + 0 = 0 (Cout 0)', desc: 'Sum and Carry-Out both remain 0.' },
        { name: 'Single bit set (0+0+1)', rule: '0 + 0 + 1 = 1 (Cout 0)', desc: 'Sum is 1, Carry-Out is 0.' },
        { name: 'Two bits set (1+1+0)', rule: '1 + 1 + 0 = 0 (Cout 1)', desc: 'Sum wraps to 0, Carry-Out propagates to next stage as 1.' },
        { name: 'All three bits set (1+1+1)', rule: '1 + 1 + 1 = 1 (Cout 1)', desc: 'Maximum single-stage result: decimal 3 (binary 11). Both Sum and Cout are 1.' }
      ],
      tradeoffs: [
        { pro: 'Can be chained seamlessly to build arbitrary N-bit arithmetic units (ALU adders and subtractors).' },
        { pro: 'Universal arithmetic capability: can also perform subtraction by inverting B and setting Cin=1 (Two\'s Complement).' },
        { con: 'Chaining in series causes carry ripple latency proportional to bit width O(N).' },
        { con: 'Requires 5 logic gates (2 XORs, 2 ANDs, 1 OR) per bit in basic discrete topology.' }
      ]
    },

    realWorldUseCases: [
      'CPU Integer Execution Units for ADD, SUB, INC, and CMP assembly instructions',
      'Floating Point Units (FPUs) inside GPUs for vector arithmetic and mantissa addition',
      'Digital signal processors (DSPs) performing Multiply-Accumulate (MAC) filters',
      'Graphics rasterizers computing screen coordinate pixel offsets in real time'
    ],

    truthTable: {
      headers: ['A', 'B', 'Cin', 'Sum (S)', 'Carry Out (Cout)', 'Decimal Total'],
      rows: [
        { inputs: [0, 0, 0], outputs: [0, 0, 0] },
        { inputs: [0, 0, 1], outputs: [1, 0, 1] },
        { inputs: [0, 1, 0], outputs: [1, 0, 1] },
        { inputs: [0, 1, 1], outputs: [0, 1, 2] },
        { inputs: [1, 0, 0], outputs: [1, 0, 1] },
        { inputs: [1, 0, 1], outputs: [0, 1, 2] },
        { inputs: [1, 1, 0], outputs: [0, 1, 2] },
        { inputs: [1, 1, 1], outputs: [1, 1, 3] }
      ]
    },

    codeSnippets: {
      verilog: `// 1-Bit Full Adder in Verilog HDL
module full_adder (
    input  wire a,
    input  wire b,
    input  wire cin,
    output wire sum,
    output wire cout
);
    // Structural decomposition: 2 Half Adders + 1 OR
    wire s1, c1, c2;

    assign s1   = a ^ b;
    assign c1   = a & b;
    assign sum  = s1 ^ cin;
    assign c2   = s1 & cin;
    assign cout = c1 | c2;
endmodule`,
      vhdl: `-- 1-Bit Full Adder in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity full_adder is
    Port (
        a    : in  STD_LOGIC;
        b    : in  STD_LOGIC;
        cin  : in  STD_LOGIC;
        sum  : out STD_LOGIC;
        cout : out STD_LOGIC
    );
end full_adder;

architecture Behavioral of full_adder is
begin
    sum  <= a xor b xor cin;
    cout <= (a and b) or (cin and (a xor b));
end Behavioral;`,
      javascript: `// Software simulation of a 1-Bit Full Adder
function fullAdder(a, b, cin) {
  const sum  = (a ^ b ^ cin) & 1;
  const cout = ((a & b) | (cin & (a ^ b))) & 1;
  return { sum, cout, decimalValue: (cout << 1) | sum };
}

// Chaining into an 8-bit Ripple Carry Adder
function add8Bit(valA, valB) {
  let cin = 0, result = 0;
  for (let i = 0; i < 8; i++) {
    const bitA = (valA >> i) & 1;
    const bitB = (valB >> i) & 1;
    const { sum, cout } = fullAdder(bitA, bitB, cin);
    result |= (sum << i);
    cin = cout;
  }
  return { result, carryOut: cin };
}`
    }
  },

  // ═══════════════════════════════════════════
  //  6. SR LATCH (BISTABLE MEMORY)
  // ═══════════════════════════════════════════
  {
    id: 'sr-latch',
    title: 'SR Latch (Bistable Memory)',
    category: 'Sequential & Memory',
    categoryTag: 'Asynchronous Storage',
    presetId: 'sr_latch',
    icon: Repeat,
    iconColor: '#10b981',
    bgColor: 'bg-[#d9e8df]',
    diagramType: 'sr-latch',
    icChip: '74LS279 (Quad SR Latch) / Cross-Coupled NOR 7402',
    propagationDelay: '8 ns switching latency',
    transistorCount: '8 MOSFETs (4 per cross-coupled NOR gate)',
    booleanEquation: 'Q(next) = S + R\'·Q  (Constraint: S·R = 0)',
    shortDesc: 'The simplest electronic 1-bit memory cell using cross-coupled feedback to retain its state indefinitely.',
    
    mentalModel: {
      analogy: 'A Light Switch with Two Pushbuttons (ON and OFF)',
      metaphor: 'Imagine a bedside lamp with two buttons: a Green button (SET) and a Red button (RESET):',
      points: [
        { label: 'Push Green (SET = 1)', icon: '🟢', text: 'The lamp turns ON (Q = 1). Now release the button! The lamp STAYS ON! It remembered your action.' },
        { label: 'Push Red (RESET = 1)', icon: '🔴', text: 'The lamp turns OFF (Q = 0). Now release the button! The lamp STAYS OFF.' },
        { label: 'Push Neither (S = 0, R = 0)', icon: '🔒', text: 'The lamp simply remembers whatever state it was already in (HOLD state).' },
        { label: 'Push Both at Once? (S = 1, R = 1)', icon: '⚠️', text: 'Telling it to turn ON and OFF at the exact same moment causes confusion (the Forbidden State)!' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Why Basic Gates Cannot Remember', text: 'In an AND gate, when you remove the input, the output dies. It has zero memory.' },
      { step: '2', title: 'The Feedback Trick', text: 'Feed the output of Gate A back into Gate B, and feed the output of Gate B back into Gate A! They hold each other in place like two people leaning back-to-back.' },
      { step: '3', title: 'The Birth of Memory', text: 'This feedback loop is the physical foundation of Static RAM (SRAM) used in all computer cache memory.' }
    ],

    ahaMoment: 'Memory is not magic storage pixie dust. It is simply two logic gates feeding their outputs back into each other in a stable circle!',

    beginnerMistakes: [
      { mistake: 'Thinking you have to keep holding S=1 to keep the value stored', fix: 'No! The whole point of a latch is memory. You pulse S=1 for a nanosecond, and it locks in Q=1 indefinitely even after S drops back to 0.' },
      { mistake: 'Pressing S=1 and R=1 together', fix: 'This is called the Forbidden State. When you release both simultaneously, the circuit races unpredictably (metastability).' }
    ],

    quiz: {
      question: 'If an SR Latch is currently storing Q = 1, and both S and R inputs are 0, what happens to the output Q?',
      options: ['Q resets to 0', 'Q stays at 1 (HOLD)', 'Q toggles back and forth', 'The circuit burns out'],
      correctIndex: 1,
      explanation: 'When S=0 and R=0, the latch is in its quiescent HOLD mode, safely retaining its previous stored bit (Q = 1) indefinitely.'
    },

    overview: 'Unlike combinational circuits whose outputs depend solely on present inputs, Sequential circuits have memory: their outputs depend on both current inputs AND past history. The SR Latch (Set-Reset Latch) is the fundamental memory element. By crossing the output of one gate back into the input of the other, feedback is created that locks the circuit into one of two stable states (Q=1 or Q=0).',
    
    detailedTheory: {
      mechanics: 'In an active-HIGH NOR-based SR Latch, raising S=1 with R=0 forces the lower NOR gate output to 0, which feeds into the top NOR gate along with R=0, forcing Q=1 (the SET state). When S returns to 0, the feedback maintains Q=1 indefinitely (the HOLD state). Conversely, raising R=1 forces Q=0 (the RESET state). If both S=1 and R=1 simultaneously, both Q and Q̅ drop to 0, violating complementarity; removing both simultaneously causes an unpredictable race condition.',
      siliconArchitecture: 'Static RAM (SRAM) cache cells inside modern CPU L1/L2 caches consist of a 6-transistor (6T) cell built around two cross-coupled CMOS inverters, which operate on the exact same bistable latching feedback principle.',
      operations: [
        { name: 'HOLD State (S=0, R=0)', rule: 'Q(t+1) = Q(t)', desc: 'Circuit retains whatever previous state was stored (quiescent memory retention).' },
        { name: 'SET State (S=1, R=0)', rule: 'Q(t+1) = 1, Q̅ = 0', desc: 'Forces output Q to HIGH (1), storing a logical 1 in the cell.' },
        { name: 'RESET State (S=0, R=1)', rule: 'Q(t+1) = 0, Q̅ = 1', desc: 'Forces output Q to LOW (0), storing a logical 0 in the cell.' },
        { name: 'FORBIDDEN State (S=1, R=1)', rule: 'Undefined / Race', desc: 'Violates Q = Q̅ logic. Removing inputs simultaneously triggers unpredictable oscillation.' }
      ],
      tradeoffs: [
        { pro: 'Extremely fast bistable storage requiring zero clock signal or refresh cycles.' },
        { pro: 'Non-volatile as long as continuous DC power supply is maintained.' },
        { con: 'Vulnerable to forbidden race conditions when S and R are asserted simultaneously.' },
        { con: 'Transparent/unclocked: sensitive to transient input glitches and contact bounce.' }
      ]
    },

    realWorldUseCases: [
      'Switch debounce circuits for mechanical pushbuttons and toggle switches',
      'High-speed hardware alarm and interrupt latch flags in microcontroller peripherals',
      'Bistable relay control in power electronics and motor start/stop interlocks',
      'Foundation cell for 6T SRAM cells in L1 cache memory matrices'
    ],

    truthTable: {
      headers: ['Set (S)', 'Reset (R)', 'Q(t+1)', 'Q̅(t+1)', 'Operational State'],
      rows: [
        { inputs: [0, 0], outputs: ['Q(t)', 'Q̅(t)', 'HOLD / No Change'] },
        { inputs: [0, 1], outputs: [0, 1, 'RESET (Clear)'] },
        { inputs: [1, 0], outputs: [1, 0, 'SET (Store 1)'] },
        { inputs: [1, 1], outputs: ['0*', '0*', 'FORBIDDEN / Invalid'] }
      ]
    },

    codeSnippets: {
      verilog: `// Active-HIGH SR Latch with Cross-Coupled NOR in Verilog
module sr_latch (
    input  wire s,
    input  wire r,
    output wire q,
    output wire q_bar
);
    // Continuous assignment with cross-coupled feedback
    assign q     = ~(r | q_bar);
    assign q_bar = ~(s | q);
endmodule`,
      vhdl: `-- SR Latch in VHDL using concurrent feedback
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity sr_latch is
    Port (
        s     : in  STD_LOGIC;
        r     : in  STD_LOGIC;
        q     : buffer STD_LOGIC;
        q_bar : buffer STD_LOGIC
    );
end sr_latch;

architecture Structural of sr_latch is
begin
    q     <= not (r or q_bar);
    q_bar <= not (s or q);
end Structural;`,
      javascript: `// Software simulation of an SR Latch with state memory
class SRLatch {
  constructor() {
    this.q = 0;
  }

  evaluate(s, r) {
    if (s && r) {
      return { q: 0, qBar: 0, status: 'INVALID_METASTABLE' };
    } else if (s && !r) {
      this.q = 1; // SET
    } else if (!s && r) {
      this.q = 0; // RESET
    }
    // s === 0 && r === 0 -> HOLD previous state
    return { q: this.q, qBar: this.q ? 0 : 1, status: 'STABLE' };
  }
}`
    }
  },

  // ═══════════════════════════════════════════
  //  7. D FLIP-FLOP & REGISTERS
  // ═══════════════════════════════════════════
  {
    id: 'd-flip-flop',
    title: 'D Flip-Flop (Edge-Triggered)',
    category: 'Sequential & Memory',
    categoryTag: 'Synchronous Storage',
    presetId: 'd_flip_flop_register',
    icon: GitFork,
    iconColor: '#3b82f6',
    bgColor: 'bg-[#dbeafe]',
    diagramType: 'd-flip-flop',
    icChip: '74LS74 (Dual D-Type Positive Edge-Triggered Flip-Flop)',
    propagationDelay: '15 ns clock-to-output (tco)',
    transistorCount: '24 MOSFETs (Master-Slave configuration)',
    booleanEquation: 'Q(t+1) = D  (sampled on CLK ↑ edge)',
    shortDesc: 'Clock-synchronized single-bit memory that captures data strictly at the rising edge of a clock pulse.',
    
    mentalModel: {
      analogy: 'A Camera Snapping a Photo on the Shutter Click',
      metaphor: 'Imagine taking a photo of a moving athlete:',
      points: [
        { label: 'The Data Input (D)', icon: '🏃', text: 'The runner moving in front of the lens. The runner can change positions all day.' },
        { label: 'The Clock (CLK)', icon: '📸', text: 'The camera shutter button! The instant the shutter button clicks (the rising edge ↑ of the clock), the camera captures the runner\'s exact pose.' },
        { label: 'The Output (Q)', icon: '🖼️', text: 'The printed photograph! Even if the runner sprints away or changes clothes afterward, the photo on Q stays frozen until the next shutter click.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Why We Need Clocks', text: 'If millions of gates in a CPU updated at random random speeds, total chaos would ensue. The Clock acts like a conductor’s baton keeping everyone in sync.' },
      { step: '2', title: 'Edge-Triggered Magic', text: 'A D Flip-Flop ONLY looks at the Data input during the tiny split-second when the clock transitions from 0 to 1 (the rising edge). At all other times, it is blind to changes.' },
      { step: '3', title: 'Making CPU Registers', text: 'Line up 64 of these D Flip-Flops in parallel, all sharing the same clock wire. That is a 64-bit CPU register (like RAX or R0)!' }
    ],

    ahaMoment: 'Your 3.5 GHz processor simply means the clock shutter clicks 3.5 billion times per second, moving data smoothly from one flip-flop register to the next like a precision assembly line.',

    beginnerMistakes: [
      { mistake: 'Confusing a Latch with a Flip-Flop', fix: 'A latch is level-sensitive (open like a barn door whenever CLK=1). A Flip-Flop is edge-triggered (only snaps a photo during the transition 0 → 1, then immediately closes).' },
      { mistake: 'Changing Data during the Clock edge', fix: 'Input D must be steady right before and after the clock edge (called Setup and Hold time). Changing it during the edge causes metastability — like a coin landing on its edge!' }
    ],

    quiz: {
      question: 'If Data D = 1, but the Clock signal stays flat at 0 (no rising edge), what happens to output Q?',
      options: ['Q immediately changes to 1', 'Q stays at its previous stored value', 'Q resets to 0', 'Q oscillates'],
      correctIndex: 1,
      explanation: 'A flip-flop only samples data on the rising clock transition (0 → 1). If the clock does not transition, changes on D are completely ignored!'
    },

    overview: 'While latches are level-sensitive (transparent whenever enabled), Flip-Flops are edge-triggered: they sample their inputs only at the precise moment the clock transition occurs (e.g., from LOW to HIGH). The D Flip-Flop (Data or Delay flip-flop) transfers the input D to output Q on the clock edge and locks it until the next cycle, preventing race conditions across pipelined processor stages.',
    
    detailedTheory: {
      mechanics: 'A classic master-slave D Flip-Flop consists of two latches in series controlled by complementary clocks. When CLK=0, the master latch is transparent and tracks D, while the slave latch is locked. When the clock rises (CLK=1), the master locks the sampled data, and the slave opens, driving the new value to output Q. Because both latches are never open at the same instant, data cannot race through multiple registers in one clock cycle.',
      siliconArchitecture: 'Synchronous timing requires satisfying two strict constraints: Setup Time (tsu, data must be stable before the clock edge) and Hold Time (th, data must remain stable after the clock edge). Violating these parameters causes metastability, where the output hovers between 0 and 1 before settling unpredictably.',
      operations: [
        { name: 'Positive Clock Edge (CLK ↑)', rule: 'Q <= D', desc: 'Samples input D and updates output Q within clock-to-output delay tco.' },
        { name: 'Clock Steady (CLK = 0 or 1)', rule: 'Q <= Q (latch)', desc: 'Changes on D are completely ignored; state remains frozen.' },
        { name: 'Asynchronous Preset (PRE)', rule: 'Q <= 1 override', desc: 'Directly forces Q to 1 regardless of clock or data lines.' },
        { name: 'Asynchronous Clear (CLR)', rule: 'Q <= 0 override', desc: 'Directly resets Q to 0 for system power-on initialization.' }
      ],
      tradeoffs: [
        { pro: 'Completely eliminates race hazards in multi-stage synchronous pipelines.' },
        { pro: 'Single data line prevents invalid/forbidden input combinations.' },
        { con: 'Requires clock distribution tree, which accounts for 30%–40% of total dynamic chip power.' },
        { con: 'Susceptible to metastability if asynchronous inputs violate setup/hold timing windows.' }
      ]
    },

    realWorldUseCases: [
      'CPU Pipeline registers (IF/ID, ID/EX, EX/MEM, MEM/WB) in RISC-V and x86 processors',
      'Shift registers for Serial-In/Parallel-Out (SIPO) SPI and UART serial communication',
      'Dual-flop synchronizers to safely bring asynchronous signals across clock domains',
      'Register Files storing general-purpose CPU registers (RAX, RBX, R0–R31)'
    ],

    truthTable: {
      headers: ['Clock (CLK)', 'Data (D)', 'Preset (PRE)', 'Clear (CLR)', 'Output Q', 'Output Q̅'],
      rows: [
        { inputs: ['↑ (Rising)', 0, 1, 1], outputs: [0, 1, 'Sampled 0'] },
        { inputs: ['↑ (Rising)', 1, 1, 1], outputs: [1, 0, 'Sampled 1'] },
        { inputs: ['0 or 1 (Static)', 'X', 1, 1], outputs: ['Q(t)', 'Q̅(t)', 'HOLD State'] },
        { inputs: ['X', 'X', 0, 1], outputs: [1, 0, 'Async Preset'] },
        { inputs: ['X', 'X', 1, 0], outputs: [0, 1, 'Async Clear'] }
      ]
    },

    codeSnippets: {
      verilog: `// Positive Edge-Triggered D Flip-Flop with Asynchronous Reset
module d_flip_flop (
    input  wire clk,
    input  wire rst_n, // Active-LOW async reset
    input  wire d,
    output reg  q
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            q <= 1'b0; // Reset state
        else
            q <= d;    // Sample data on clock edge
    end
endmodule`,
      vhdl: `-- Edge-Triggered D Flip-Flop in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity d_flip_flop is
    Port (
        clk   : in  STD_LOGIC;
        rst   : in  STD_LOGIC;
        d     : in  STD_LOGIC;
        q     : out STD_LOGIC
    );
end d_flip_flop;

architecture Behavioral of d_flip_flop is
begin
    process(clk, rst)
    begin
        if rst = '1' then
            q <= '0';
        elsif rising_edge(clk) then
            q <= d;
        end if;
    end process;
end Behavioral;`,
      javascript: `// Software simulation of an Edge-Triggered D Register
class DFlipFlop {
  constructor() {
    this.q = 0;
    this.prevClk = 0;
  }

  clockTick(clk, d, rst = false) {
    if (rst) {
      this.q = 0;
    } else if (this.prevClk === 0 && clk === 1) {
      // Detected positive rising edge
      this.q = d ? 1 : 0;
    }
    this.prevClk = clk;
    return { q: this.q, qBar: this.q ? 0 : 1 };
  }
}`
    }
  },

  // ═══════════════════════════════════════════
  //  8. MULTIPLEXERS (DATA SELECTORS)
  // ═══════════════════════════════════════════
  {
    id: 'multiplexer',
    title: 'Multiplexers & Data Selectors',
    category: 'Combinational Circuits',
    categoryTag: 'Data Routing',
    presetId: 'basic_gates',
    icon: Layers,
    iconColor: '#eab308',
    bgColor: 'bg-[#fef9c3]',
    diagramType: 'multiplexer',
    icChip: '74LS151 (8:1 MUX) / 74LS157 (Quad 2:1 MUX)',
    propagationDelay: '9 ns from select to output',
    transistorCount: '12 MOSFETs (2:1 CMOS transmission gates)',
    booleanEquation: 'Y = S\'·I₀ + S·I₁  (2:1 Multiplexer)',
    shortDesc: 'Digital rotary switches directing one of many input signals onto a single shared transmission line.',
    
    mentalModel: {
      analogy: 'A Train Track Switcher or Old-School TV Channel Knob',
      metaphor: 'Imagine 4 different railway tracks arriving at a station, but only 1 single track departing to the city:',
      points: [
        { label: 'Data Inputs (I₀, I₁...)', icon: '🚂', text: 'The incoming train tracks carrying data streams from different parts of your computer.' },
        { label: 'Select Line (S)', icon: '🎛️', text: 'The track lever or TV channel knob! Turn the knob to "0", track 0 passes through. Turn the knob to "1", track 1 passes through.' },
        { label: 'Output (Y)', icon: '🛤️', text: 'The single shared wire heading into the processor or memory.' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'The Problem: Too Many Wires', text: 'If every memory bank, register, and sensor had its own dedicated wire to the CPU, chips would require millions of physical pins.' },
      { step: '2', title: 'The Solution: Time Sharing', text: 'Use a multiplexer to take turns sharing one fast wire.' },
      { step: '3', title: 'Universal Gate Trick', text: 'You can actually build any logic gate using a MUX simply by hardwiring its data inputs to 0 or 1!' }
    ],

    ahaMoment: 'FPGAs (field-programmable gate arrays) are essentially huge arrays of multiplexers connected to tiny memory cells called Look-Up Tables (LUTs).',

    beginnerMistakes: [
      { mistake: 'Confusing inputs with select lines', fix: 'A 4-to-1 MUX has 4 DATA inputs, but only 2 SELECT control lines ($2^2 = 4$). Two bits (00, 01, 10, 11) are enough to address all 4 channels.' },
      { mistake: 'Thinking a MUX mixes signals together', fix: 'A MUX is NOT an audio mixer. It never blends inputs. It connects EXACTLY ONE chosen channel to the output while completely disconnecting the others.' }
    ],

    quiz: {
      question: 'How many select control lines are required for an 8:1 Multiplexer?',
      options: ['8', '4', '3', '2'],
      correctIndex: 2,
      explanation: 'Since 2³ = 8, exactly 3 binary select bits (000 through 111) are needed to address all 8 channels.'
    },

    overview: 'A Multiplexer (MUX), often referred to as a "Data Selector", acts as an electronic multi-position switch. Given 2ⁿ data input channels, it uses n control/select lines to route exactly one chosen input directly to the single output line. Multiplexers are universal combinational modules: any n-variable truth table can be implemented using a single 2ⁿ:1 MUX without adding external logic gates.',
    
    detailedTheory: {
      mechanics: 'In a 2:1 Multiplexer with inputs I₀, I₁ and select line S: When S=0, the AND gate for I₀ is enabled by S̅, while the I₁ gate is inhibited, yielding Y = I₀. When S=1, I₁ is enabled and I₀ is blocked, yielding Y = I₁. The complete Boolean function is Y = S̅I₀ + SI₁.',
      siliconArchitecture: 'Inside FPGA architectures (such as Xilinx 7-Series or AMD Versal), the basic computational unit is a Configurable Logic Block (CLB) containing Look-Up Tables (LUTs). A 6-input LUT is physically built as a 64:1 multiplexer whose 64 inputs are fed by SRAM configuration bits.',
      operations: [
        { name: 'Channel 0 Select (S = 0)', rule: 'Y = I₀', desc: 'Select line LOW connects Input 0 directly to output.' },
        { name: 'Channel 1 Select (S = 1)', rule: 'Y = I₁', desc: 'Select line HIGH connects Input 1 directly to output.' },
        { name: '4:1 MUX (2 Select Lines)', rule: 'Y = S₁\'S₀\'I₀ + S₁\'S₀I₁ + S₁S₀\'I₂ + S₁S₀I₃', desc: 'Routes 1 of 4 inputs using 2 binary address lines.' },
        { name: 'Logic Function Synthesis', rule: 'Universal MUX logic', desc: 'Can implement any boolean function by applying truth table outputs directly to data inputs.' }
      ],
      tradeoffs: [
        { pro: 'Drastically reduces the number of physical bus wires needed across circuit boards and silicon dies.' },
        { pro: 'Can implement any arbitrary Boolean function by hardwiring input channels.' },
        { con: 'Propagation delay through cascaded multiplexer trees increases latency on critical paths.' },
        { con: 'High fan-in multiplexers require large buffer trees to drive the capacitive load.' }
      ]
    },

    realWorldUseCases: [
      'ALU operand source selection: routing registers, immediate constants, or memory values to ALU inputs',
      'Time-Division Multiplexing (TDM) in fiber-optic telecommunication backbones',
      'Look-Up Tables (LUTs) serving as the fundamental programmable fabric of modern FPGAs',
      'Memory bank interleaving and memory chip chip-select line decoding'
    ],

    truthTable: {
      headers: ['Select (S)', 'Input I₀', 'Input I₁', 'Output Y', 'Selected Channel'],
      rows: [
        { inputs: [0, 0, 'X'], outputs: [0, 'Channel I₀ (0)'] },
        { inputs: [0, 1, 'X'], outputs: [1, 'Channel I₀ (1)'] },
        { inputs: [1, 'X', 0], outputs: [0, 'Channel I₁ (0)'] },
        { inputs: [1, 'X', 1], outputs: [1, 'Channel I₁ (1)'] }
      ]
    },

    codeSnippets: {
      verilog: `// Parameterized 2:1 Multiplexer in Verilog HDL
module mux_2to1 (
    input  wire i0,
    input  wire i1,
    input  wire sel,
    output wire y
);
    // Continuous conditional ternary assignment
    assign y = sel ? i1 : i0;
endmodule

// 4:1 Multiplexer
module mux_4to1 (
    input  wire [3:0] in_data,
    input  wire [1:0] sel,
    output wire       y
);
    assign y = in_data[sel];
endmodule`,
      vhdl: `-- 4:1 Multiplexer in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity mux_4to1 is
    Port (
        in_data : in  STD_LOGIC_VECTOR(3 downto 0);
        sel     : in  STD_LOGIC_VECTOR(1 downto 0);
        y       : out STD_LOGIC
    );
end mux_4to1;

architecture Behavioral of mux_4to1 is
begin
    with sel select
        y <= in_data(0) when "00",
             in_data(1) when "01",
             in_data(2) when "10",
             in_data(3) when others;
end Behavioral;`,
      javascript: `// Software simulation of an N-to-1 Multiplexer
function multiplexer(inputs, selectIndex) {
  if (selectIndex < 0 || selectIndex >= inputs.length) {
    throw new Error('Select index out of bounds');
  }
  return inputs[selectIndex];
}`
    }
  },

  // ═══════════════════════════════════════════
  //  9. JK & T FLIP-FLOPS (COUNTERS & TIMERS)
  // ═══════════════════════════════════════════
  {
    id: 'jk-flip-flop',
    title: 'JK & T Flip-Flops (Counters & Timers)',
    category: 'Sequential & Memory',
    categoryTag: 'Universal Flip-Flop',
    presetId: 'jk_flip_flop_toggle',
    icon: Radio,
    iconColor: '#ec4899',
    bgColor: 'bg-[#fce7f3]',
    diagramType: 'jk-flip-flop',
    icChip: '74LS76 (Dual Master-Slave JK Flip-Flop) / 74LS73',
    propagationDelay: '16 ns maximum toggle latency',
    transistorCount: '32 MOSFETs',
    booleanEquation: 'Q(t+1) = J·Q\' + K\'·Q  (J=K=1 -> Toggle)',
    shortDesc: 'The versatile universal flip-flop that eliminates the SR forbidden state with an indispensable Toggle mode for binary counters.',
    
    mentalModel: {
      analogy: 'A Clicky Ballpoint Pen (The Toggle Button)',
      metaphor: 'Think of a clicky retractable pen in your pocket:',
      points: [
        { label: 'Click 1', icon: '🖊️', text: 'You click the button once, the pen tip pops OUT (State = 1).' },
        { label: 'Click 2', icon: '🔄', text: 'You click the exact same button again, the pen tip retracts IN (State = 0).' },
        { label: 'Toggle Mode (T)', icon: '⏱️', text: 'This flip-flop mode alternates its output on every single clock pulse. Two input clock pulses yield one full output wave — dividing the frequency in HALF!' }
      ]
    },

    plainEnglish: [
      { step: '1', title: 'Fixing the SR Latch flaw', text: 'The old SR latch broke if you pushed both buttons at once. The JK Flip-Flop fixes this: if you turn both J=1 and K=1, it simply TOGGLES (inverts) its current state!' },
      { step: '2', title: 'Tie J and K Together to make a "T" Flip-Flop', text: 'When J and K are wired together, it becomes a Toggle (T) flip-flop.' },
      { step: '3', title: 'Making Binary Counters', text: 'Connect the output of Stage 1 to the clock of Stage 2. Now Stage 1 counts 1s, Stage 2 counts 2s, Stage 3 counts 4s, and Stage 4 counts 8s. You just built a digital stopwatch clock!' }
    ],

    ahaMoment: 'Every digital clock on your microwave, dashboard, or wristwatch uses T Flip-Flops to divide a fast quartz crystal frequency down to exactly 1 tick per second.',

    beginnerMistakes: [
      { mistake: 'Thinking J is for Jump and K is for Kill', fix: 'J and K were actually named in honor of Jack Kilby, the Texas Instruments engineer who co-invented the integrated circuit!' },
      { mistake: 'Forgetting that ripple counters have slight delay', fix: 'Because each flip-flop waits for the previous one to toggle, tiny ripple delays add up. For ultra-high speed counters, synchronous counters are used instead.' }
    ],

    quiz: {
      question: 'What happens to a JK Flip-Flop on the clock edge when both J = 1 and K = 1?',
      options: ['It crashes into an undefined state', 'Output Q stays unchanged', 'Output Q toggles to its opposite state', 'Output Q always becomes 0'],
      correctIndex: 2,
      explanation: 'When J=1 and K=1, the JK flip-flop is in TOGGLE mode. If Q was 0, it flips to 1; if Q was 1, it flips to 0!'
    },

    overview: 'The JK Flip-Flop is named after Jack Kilby (co-inventor of the integrated circuit). It improves upon the SR latch by eliminating the ambiguous/forbidden state: when both J=1 and K=1, the circuit toggles its output state (Q → Q̅). When J and K are tied together (J=K=T), it forms a T (Toggle) Flip-Flop, which acts as a binary frequency divider by 2 — the basic building block of all digital timers, clocks, and counters.',
    
    detailedTheory: {
      mechanics: 'The JK flip-flop uses internal feedback from the outputs back into the input AND gates. When J=1, K=1 and Q=0, the J gate is enabled because Q̅=1, driving the internal latch to SET on the clock edge. Conversely, if Q=1, the K gate is enabled, driving the latch to RESET. This guarantees that each clock pulse alternates the output state.',
      siliconArchitecture: 'Connecting the Q̅ output of stage N to the clock input of stage N+1 creates an Asynchronous Ripple Counter. Stage 0 divides the master clock frequency by 2, stage 1 divides by 4, stage 2 by 8, and stage N by 2ⁿ⁺¹.',
      operations: [
        { name: 'HOLD (J=0, K=0)', rule: 'Q <= Q', desc: 'No state transition on clock edge; retains stored bit.' },
        { name: 'RESET (J=0, K=1)', rule: 'Q <= 0', desc: 'Forces output Q to 0 on clock pulse.' },
        { name: 'SET (J=1, K=0)', rule: 'Q <= 1', desc: 'Forces output Q to 1 on clock pulse.' },
        { name: 'TOGGLE (J=1, K=1)', rule: 'Q <= Q̅ (Flip)', desc: 'Inverts previous state. T-flip flop frequency divider mode.' }
      ],
      tradeoffs: [
        { pro: 'Zero forbidden/undefined states: full 2-variable input space {00, 01, 10, 11} is valid.' },
        { pro: 'Toggle mode enables direct binary counter cascades without external logic.' },
        { con: 'Internal feedback increases propagation delay compared to simpler D flip-flops.' },
        { con: 'Ripple counter cascades accumulate clock skew, causing transient output glitches.' }
      ]
    },

    realWorldUseCases: [
      'Real-Time Clock (RTC) prescalers dividing 32.768 kHz crystal oscillators down to 1 Hz ticks',
      'Asynchronous (Ripple) and Synchronous Up/Down binary counters',
      'Frequency dividers in PLL (Phase-Locked Loop) clock synthesizer ICs',
      'PWM (Pulse-Width Modulation) waveform generators in brushless motor controllers'
    ],

    truthTable: {
      headers: ['Clock (CLK)', 'J', 'K', 'Q(t+1)', 'Q̅(t+1)', 'Mode Description'],
      rows: [
        { inputs: ['↑ (Rising)', 0, 0], outputs: ['Q(t)', 'Q̅(t)', 'HOLD (No Change)'] },
        { inputs: ['↑ (Rising)', 0, 1], outputs: [0, 1, 'RESET (Clear)'] },
        { inputs: ['↑ (Rising)', 1, 0], outputs: [1, 0, 'SET (Store 1)'] },
        { inputs: ['↑ (Rising)', 1, 1], outputs: ['Q̅(t)', 'Q(t)', 'TOGGLE (Invert State)'] }
      ]
    },

    codeSnippets: {
      verilog: `// Negative Edge-Triggered JK Flip-Flop with Active-LOW Reset
module jk_flip_flop (
    input  wire clk,
    input  wire rst_n,
    input  wire j,
    input  wire k,
    output reg  q,
    output wire q_bar
);
    assign q_bar = ~q;

    always @(negedge clk or negedge rst_n) begin
        if (!rst_n)
            q <= 1'b0;
        else begin
            case ({j, k})
                2'b00: q <= q;       // HOLD
                2'b01: q <= 1'b0;    // RESET
                2'b10: q <= 1'b1;    // SET
                2'b11: q <= ~q;      // TOGGLE
            endcase
        end
    end
endmodule`,
      vhdl: `-- JK Flip-Flop in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity jk_flip_flop is
    Port (
        clk : in  STD_LOGIC;
        j   : in  STD_LOGIC;
        k   : in  STD_LOGIC;
        q   : out STD_LOGIC
    );
end jk_flip_flop;

architecture Behavioral of jk_flip_flop is
    signal q_reg : STD_LOGIC := '0';
begin
    process(clk)
    begin
        if rising_edge(clk) then
            if (j = '0' and k = '1') then
                q_reg <= '0';
            elsif (j = '1' and k = '0') then
                q_reg <= '1';
            elsif (j = '1' and k = '1') then
                q_reg <= not q_reg;
            end if;
        end if;
    end process;
    q <= q_reg;
end Behavioral;`,
      javascript: `// Software simulation of a 4-Bit Binary Ripple Counter using T Flip-Flops
class TFlipFlop {
  constructor() { this.q = 0; }
  tick(t) {
    if (t) this.q = this.q ? 0 : 1; // Toggle on clock
    return this.q;
  }
}

class RippleCounter4Bit {
  constructor() {
    this.stages = [new TFlipFlop(), new TFlipFlop(), new TFlipFlop(), new TFlipFlop()];
  }

  clockPulse() {
    // Stage 0 toggles on every pulse
    const q0 = this.stages[0].tick(1);
    // Subsequent stages toggle when preceding output transitions 1 -> 0
    // Yielding binary count 0000 -> 1111
  }
}`
    }
  }
];
