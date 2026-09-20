# ⚡ signalschool — Virtual Learning Labs
### *Make the invisible visible: Interactive Digital Circuits, Data Structures, Algorithms & P2P Mesh Room*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-dsd6.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://dsd6.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Abhishaik3007/dsd_6.git)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![WebRTC](https://img.shields.io/badge/PeerJS-WebRTC_P2P-ff4081?style=for-the-badge&logo=webrtc&logoColor=white)](https://peerjs.com/)

---

## 🌟 Run It Instantly in Your Browser

You don't even need to install anything to start exploring! The full application is deployed and live:

👉 **[Launch signalschool Web Application (https://dsd6.vercel.app/)](https://dsd6.vercel.app/)** 👈

Open it on your desktop, laptop, tablet, or smartphone to simulate live logic gates, visualize algorithms, and connect with peers.

---

## 📖 Table of Contents

- [What is signalschool?](#-what-is-signalschool)
- [Quickstart: Clone & Run Locally](#-quickstart-clone--run-locally)
- [Complete Technology Stack](#-complete-technology-stack)
- [Feature Walkthrough & Labs](#-feature-walkthrough--labs)
  - [Lab 01: Digital Circuits & Logic Gates Simulator](#lab-01-digital-circuits--logic-gates-simulator)
  - [Lab 02: Data Structures & Algorithms Interactive Lab](#lab-02-data-structures--algorithms-interactive-lab)
  - [Lab 03: Mesh Room (Zero-Backend P2P Chat)](#lab-03-mesh-room-zero-backend-p2p-chat)
- [Project File Structure](#-project-file-structure)
- [Available Scripts](#-available-scripts)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 What is signalschool?

In computer science, the most foundational concepts—how electrons flip bits, how memory organizes pointers, and how data traverses network meshes—are usually hidden away inside black boxes or dry textbook diagrams.

**signalschool** makes these invisible mechanisms visible, tangible, and fun:
- **Build real digital circuits** with your mouse or touch screen: wire up switches, gates, flip-flops, and clocks, and watch pulses flow in real time.
- **Watch data structures move and breathe**: insert, delete, balance AVL trees, traverse graphs with BFS/DFS, and step through sorting algorithms at your own speed.
- **Collaborate peer-to-peer**: chat and share files in an encrypted mesh room without any middleman server storing your conversations.

Written in **simple, easy-to-understand language** with interactive mental models, analogies (e.g., household light switches, refrigerator sensors), and real-world silicon specs (propagation delay, IC chip numbers, transistor counts).

---

## 🚀 Quickstart: Clone & Run Locally

Want to run or develop signalschool on your own computer? Follow these easy steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher recommended) and [Git](https://git-scm.com/) installed on your machine.

### 2. Clone the Repository
Open your terminal or command prompt and run:
```bash
git clone https://github.com/Abhishaik3007/dsd_6.git
```

### 3. Enter the Project Folder
```bash
cd dsd_6
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Development Server
```bash
npm run dev
```

Your terminal will show a local URL:
```text
  VITE v8.2.x ready in 400 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Hold `Ctrl` and click the link (or open `http://localhost:5173/` in your browser) to explore!

---

## 🛠️ Complete Technology Stack

Every piece of signalschool is powered by modern, high-performance web standards:

| Technology | Version / Tool | Why We Use It |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | The latest React release featuring concurrent rendering, lightning-fast component updates, and modern hooks. |
| **Vite** | `^8.2.0` | Ultra-fast build tool offering near-instant Hot Module Replacement (HMR) and optimized bundle generation. |
| **Tailwind CSS** | `^4.3.3` + `@tailwindcss/vite` | Modern utility-first CSS engine providing responsive layouts, smooth color palettes, and sleek styling. |
| **Three.js** | `^0.185.1` | WebGL 3D graphics engine powering interactive particle fields, floating meshes, and 3D landing cards. |
| **Framer Motion** | `^13.1.1` | Production-ready motion library for fluid gesture physics, page transitions, and card hover effects. |
| **PeerJS** | `^1.5.5` | WebRTC data-channel wrapper enabling direct browser-to-browser peer communication with zero database reliance. |
| **Lucide React** | `^1.32.0` | Comprehensive suite of clean, consistent vector icons for circuits, algorithms, and toolbar controls. |
| **Web Audio API** | Native Browser API | Procedural sound synthesizer creating retro 8-bit audio feedback for gate triggers, connections, and chat events. |
| **Oxlint** | `^1.75.0` | High-speed, Rust-powered linter that keeps the codebase tidy and catches potential bugs early. |
| **Vercel** | Edge Network | Global CDN hosting for high availability and instant live deployment at [https://dsd6.vercel.app/](https://dsd6.vercel.app/). |

---

## 🔬 Feature Walkthrough & Labs

### Lab 01: Digital Circuits & Logic Gates Simulator
Accessible via `/logicraft` or `/circuits`

A full-fledged digital electronic schematic playground built from scratch:
- **Interactive Drag & Drop Canvas**: Place components, drag wire connections from output pins to input pins, and move gates anywhere on an infinite workspace.
- **Complete Logic & Sequential Library**:
  - **I/O Elements**: Toggle Switches (Input), LED Bulbs with realistic glow (Output).
  - **Combinational Gates**: NOT (Inverter), AND, NAND, OR, NOR, XOR, XNOR.
  - **Sequential / Timing Components**: Clock pulse generator with frequency control, D Flip-Flop, T Flip-Flop, JK Flip-Flop.
- **Simulation Engine (`simulator.js`)**:
  - Dynamic iterative propagation engine capable of simulating feedback loops (latches and flip-flop memory units).
  - Real-time circuit validation that catches floating inputs, short-circuits, and invalid pin bindings.
- **Interactive Truth Table Notebook**:
  - Live table that updates automatically as inputs change.
  - Verification mode to test whether your circuit matches standard truth table values.
- **One-Click Circuit Presets**:
  - *Basic Gates Demo* (AND, OR, NOT primitives)
  - *Half Adder* & *Full Adder* (arithmetic calculation)
  - *SR Latch* (fundamental binary memory cell)
  - *D Flip-Flop Register* (clocked data latching)
  - *T Flip-Flop Frequency Divider* (clock halving)
  - *JK Flip-Flop Toggle Circuit* (universal sequential flip-flop)
- **Circuit Management**: Save circuits to JSON files, load them back, export schematics, and use full **Undo / Redo** history.
- **Theory & Documentation Guide (`/circuits/study`)**:
  - Plain-English explanations, real-world analogies (house light switches, staircases, alarm systems).
  - Interactive SVG circuit diagram previews.
  - Silicon specs: IC chip numbers (74LS08, 74LS04, etc.), transistor counts, propagation delays, and self-testing quizzes.

---

### Lab 02: Data Structures & Algorithms Interactive Lab
Accessible via `/dsa`, `/dsa/doc`, or `/dsa-visualizer`

Turn abstract algorithms into visual step-by-step animations:
- **12+ Interactive Visualizers**:
  1. **Array Visualizer**: Indexing, linear search, binary search, and in-place mutations.
  2. **Linked List Visualizer**: Singly and Doubly linked list node traversal and pointer rewiring.
  3. **Stack & Queue Visualizer**: LIFO / FIFO push, pop, enqueue, and dequeue mechanics.
  4. **Binary Search Tree (BST) Visualizer**: Recursive insert, search, min/max lookup, and deletions.
  5. **AVL Tree Visualizer**: Self-balancing tree with live left/right and double rotations (LL, RR, LR, RL).
  6. **B-Tree Visualizer**: Multi-way search tree node splitting and multi-key disk-block modeling.
  7. **Hash Table Visualizer**: Hash functions, bucket distribution, and collision resolution techniques.
  8. **Binary Heap Visualizer**: Min-Heap & Max-Heap bubble-up and bubble-down priority queue operations.
  9. **Graph Visualizer**: Nodes, weighted edges, Breadth-First Search (BFS), and Depth-First Search (DFS).
  10. **Trie (Prefix Tree) Visualizer**: Character-by-character string storage and autocomplete lookups.
  11. **Sorting Algorithms Engine**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort with real-time comparison highlights and step controls.
- **Interactive Learning Controls**:
  - Play, Pause, Step Forward, Step Backward, and Speed Slider.
  - Randomize input data or enter your own custom numbers.
  - Big-O Time & Space Complexity tables (Best, Average, Worst case).
  - Multi-language code snippets (C++, Java, Python, JavaScript).

---

### Lab 03: Mesh Room (Zero-Backend P2P Chat)
Accessible via `/mesh` or `/chat`

A decentralized, private communication space powered directly by WebRTC:
- **Direct Browser-to-Browser**: Connect directly to friends or classmates via peer IDs or room codes (`?room=YOUR_CODE`).
- **Zero Database Storage**: Messages travel directly between peer browsers via encrypted WebRTC data channels. Nothing is stored on any server.
- **Audio Feedback**: Procedurally generated audio tones for incoming messages, member joins, and room disconnections using the Web Audio API.
- **Rich Interaction**: Full emoji picker, message reactions, file and image transfers, copyable invite links, and room member status indicators.

---

## 📁 Project File Structure

Here is a simplified overview of how the codebase is organized:

```text
dsd_6/
├── public/                       # Static public assets, favicons, textures
│   ├── signalschool-favicon.svg  # Official platform logo favicon
│   └── wooden_desk.png           # Lab workbench textures
├── src/
│   ├── assets/                   # Image assets and SVG icons
│   ├── components/
│   │   ├── chat/                 # Lab 03: P2P WebRTC Mesh Room
│   │   │   ├── P2PChatPage.jsx   # Mesh room UI, file transfer, and emoji reactions
│   │   │   ├── chatAudio.js      # Web Audio API sound effect synthesizer
│   │   │   └── useP2PChat.js     # PeerJS connection lifecycle hook
│   │   ├── common/               # Shared components
│   │   │   ├── AccessDeniedView.jsx
│   │   │   ├── LabTopBar.jsx     # Shared lab navigation header
│   │   │   └── UserProfileMenu.jsx # Unified account & subscription menu
│   │   ├── cs-visualizer/        # Lab 02: DSA Visualizer Engines
│   │   │   ├── ArrayVisualizer.jsx
│   │   │   ├── AVLTreeVisualizer.jsx
│   │   │   ├── BTreeVisualizer.jsx
│   │   │   ├── GraphVisualizer.jsx
│   │   │   ├── HashTableVisualizer.jsx
│   │   │   ├── HeapVisualizer.jsx
│   │   │   ├── LinkedListVisualizer.jsx
│   │   │   ├── SortingVisualizer.jsx
│   │   │   ├── TreeVisualizer.jsx
│   │   │   └── TrieVisualizer.jsx
│   │   ├── digital-electronics/  # Lab 01: Digital Circuits Catalog & Docs
│   │   │   ├── CircuitDiagramPreview.jsx  # SVG schematics preview generator
│   │   │   ├── DigitalCatalogPage.jsx     # Topic browser & flashcards
│   │   │   ├── DigitalDocumentationPage.jsx # Deep-dive theory, analogies & quizzes
│   │   │   └── digitalData.js             # Comprehensive educational content database
│   │   ├── dsa/                  # Lab 02: Data Structures Catalog & Docs
│   │   │   ├── DSACatalogPage.jsx
│   │   │   ├── DSADocumentationPage.jsx
│   │   │   └── dsaData.js        # Algorithm specs, complexity & sample code
│   │   ├── landing/              # Home landing page & manifesto
│   │   │   ├── LandingPage.jsx   # Main portal hero section & lab cards
│   │   │   ├── Manifesto3DCard.jsx
│   │   │   └── LabsIndexModal.jsx
│   │   ├── logic-gates/          # Lab 01: Interactive Logic Simulator
│   │   │   └── LogicGatesLab.jsx # Main interactive canvas & workbench wrapper
│   │   ├── Canvas.jsx            # SVG wire router & interactive gate canvas
│   │   ├── GateNode.jsx          # Individual logic gate node with ports & switches
│   │   ├── Sidebar.jsx           # Component drag-and-drop drawer & circuit validation
│   │   ├── Toolbar.jsx           # Preset selector, Save/Load JSON, Undo/Redo
│   │   └── TruthTableNotebook.jsx# Live truth table notebook & test runner
│   ├── context/
│   │   └── HubContext.jsx        # Global navigation router, theme state, and selection
│   ├── utils/
│   │   ├── layout.js             # Automatic canvas layout algorithms
│   │   └── simulator.js          # Boolean circuit solver & propagation engine
│   ├── App.jsx                   # Root application container & tab router
│   ├── index.css                 # Global styles & Tailwind CSS v4 definitions
│   └── main.jsx                  # React application entry point
├── package.json                  # Dependencies, scripts, and package metadata
├── vite.config.js                # Vite build configuration with React & Tailwind plugins
└── README.md                     # You are here!
```

---

## 📜 Available Scripts

In the project root, you can run:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with instant HMR at `http://localhost:5173/`. |
| `npm run build` | Compiles and optimizes all React and asset files into the production-ready `dist/` directory. |
| `npm run preview` | Locally serves the production build to verify bundle performance prior to deployment. |
| `npm run lint` | Runs `oxlint` to perform blazing-fast static code analysis across the codebase. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Esc` | Close open modal (Presets, Lab Index, Truth Table) |
| `Ctrl + Z` / `Cmd + Z` | Undo the last circuit edit |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo the last undone circuit edit |
| `Delete` / `Backspace` | Delete the currently selected circuit gate or wire |

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's adding a new circuit component, building another data structure visualizer, fixing typos, or optimizing styles:

1. **Fork** the repository: [https://github.com/Abhishaik3007/dsd_6](https://github.com/Abhishaik3007/dsd_6)
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add amazing new visualizer"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** on GitHub.

---

## 📄 License

This project is open-source and built for educational purposes. Feel free to use, study, and expand it!

---

### 🌐 Built with passion for computing education.
**Experience it now:** [https://dsd6.vercel.app/](https://dsd6.vercel.app/)  
**Source Code:** [https://github.com/Abhishaik3007/dsd_6.git](https://github.com/Abhishaik3007/dsd_6.git)
