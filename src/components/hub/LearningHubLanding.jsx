import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { ThreeBackgroundCanvas } from './ThreeBackgroundCanvas';
import { 
  Cpu, 
  Binary, 
  Layers, 
  Network, 
  ArrowRight, 
  Sparkles, 
  Play, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  Zap, 
  BookOpen, 
  ShieldCheck,
  MousePointerClick
} from 'lucide-react';

export const LearningHubLanding = () => {
  const { setActiveTab, stats, setIsSearchOpen, themeMode } = useHub();
  const [activeSandboxTab, setActiveSandboxTab] = useState('logic');

  // Mini Sandbox State for Logic Preview
  const [gateA, setGateA] = useState(1);
  const [gateB, setGateB] = useState(0);
  const [gateType, setGateType] = useState('AND');

  // Mini Sandbox State for Array Preview
  const [arrayElements, setArrayElements] = useState([18, 42, 75, 29, 64]);
  const [newVal, setNewVal] = useState('');

  const calculateGateOutput = () => {
    switch (gateType) {
      case 'AND': return gateA && gateB ? 1 : 0;
      case 'OR': return gateA || gateB ? 1 : 0;
      case 'NAND': return !(gateA && gateB) ? 1 : 0;
      case 'NOR': return !(gateA || gateB) ? 1 : 0;
      case 'XOR': return (gateA ^ gateB) ? 1 : 0;
      default: return 0;
    }
  };

  const handleArrayInsert = () => {
    const val = parseInt(newVal);
    if (!isNaN(val)) {
      setArrayElements([...arrayElements, val]);
      setNewVal('');
    }
  };

  return (
    <div className={`nexus-hub-landing ${themeMode}`}>
      {/* 3D WebGL Background Scene with Silky Smooth Polyhedra Centerpiece */}
      <ThreeBackgroundCanvas />

      <div className="nexus-hub-content">
        {/* HERO SECTION */}
        <section className="hub-hero">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-sparkle" />
            <span>VIRTUAL INTERACTIVE LEARNING HUB</span>
          </div>

          <h1 className="hero-title">
            Master Computer Science <br />
            <span className="hero-gradient-text">Through Interactive 3D Labs</span>
          </h1>

          <p className="hero-subtitle">
            An ultra-modern learning environment built to visualize digital logic gates, circuit synthesis, 
            data structures, tree traversals, and algorithms with real-time interactive engines.
          </p>

          <div className="hero-cta-group">
            <button className="cta-primary-btn" onClick={() => setActiveTab('cs-visualizer')}>
              <Play size={18} />
              <span>Launch CS Visualizer</span>
              <ArrowRight size={16} className="btn-arrow" />
            </button>

            <button className="cta-secondary-btn" onClick={() => setActiveTab('logic-gates')}>
              <Cpu size={18} />
              <span>Open Logic Gates Lab</span>
            </button>

            <button className="cta-outline-btn" onClick={() => setIsSearchOpen(true)}>
              <Terminal size={16} />
              <span>Quick Search (Ctrl+K)</span>
            </button>
          </div>

          {/* HUB LIVE METRICS BAR */}
          <div className="hub-metrics-bar">
            <div className="metric-item">
              <div className="metric-icon-box cyan">
                <Activity size={18} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{stats.labsCount}</span>
                <span className="metric-label">Virtual Labs</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-icon-box purple">
                <Zap size={18} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{stats.operationsCount}+</span>
                <span className="metric-label">Simulations / Sec</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-icon-box emerald">
                <ShieldCheck size={18} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{stats.hardwareNodes}</span>
                <span className="metric-label">Hardware Gate Types</span>
              </div>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <div className="metric-icon-box amber">
                <BookOpen size={18} />
              </div>
              <div className="metric-info">
                <span className="metric-value">100%</span>
                <span className="metric-label">Interactive Engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED VIRTUAL LABS CARDS */}
        <section className="hub-labs-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <span className="section-subtitle">LAB CATALOGUE</span>
              <h2 className="section-title">Explore Interactive Learning Labs</h2>
            </div>
            <p className="section-desc">
              Select a specialized lab environment below to start experimenting with logic circuits, 
              data structure manipulations, and algorithm visualizers.
            </p>
          </div>

          <div className="labs-grid">
            {/* LAB CARD 1: DIGITAL LOGIC GATES */}
            <div className="lab-card logic-card" onClick={() => setActiveTab('logic-gates')}>
              <div className="card-top">
                <div className="card-icon-box logic">
                  <Cpu size={24} />
                </div>
                <div className="card-status-badge live">
                  <span className="status-dot" /> LIVE LAB
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">Digital Logic Gates Simulator</h3>
                <p className="card-text">
                  Design, wire, and evaluate complex boolean circuits in real-time. Features custom AND, OR, NOT, 
                  NAND, NOR, XOR gates with drag-and-drop canvas and notebook truth tables.
                </p>
                <div className="card-features-list">
                  <span><CheckCircle2 size={13} /> Multi-Input Custom Logic Gates</span>
                  <span><CheckCircle2 size={13} /> Notebook Truth Table Evaluator</span>
                  <span><CheckCircle2 size={13} /> Auto Circuit Layout & Wire Tracing</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-action-text">Enter Logic Gates Simulator</span>
                <div className="action-circle">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            {/* LAB CARD 2: CS DATA STRUCTURES & ALGORITHMS */}
            <div className="lab-card visualizer-card" onClick={() => setActiveTab('cs-visualizer')}>
              <div className="card-top">
                <div className="card-icon-box algo">
                  <Binary size={24} />
                </div>
                <div className="card-status-badge live">
                  <span className="status-dot" /> LIVE LAB
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">Data Structures & Algo Visualizer</h3>
                <p className="card-text">
                  Visualize step-by-step array modifications, Binary Search Tree traversals (Inorder, Preorder, BFS), 
                  LIFO Stack / FIFO Queue frames, and Sorting Algorithms with speed sliders.
                </p>
                <div className="card-features-list">
                  <span><CheckCircle2 size={13} /> BST & AVL Node Traversal Animations</span>
                  <span><CheckCircle2 size={13} /> Interactive Arrays & Pointer Tracing</span>
                  <span><CheckCircle2 size={13} /> Bubble, Quick & Merge Sort Step Engine</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-action-text">Enter CS Visualizer Lab</span>
                <div className="action-circle">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            {/* LAB CARD 3: COMPUTER ARCHITECTURE (PREVIEW) */}
            <div className="lab-card preview-card" onClick={() => setActiveTab('systems-preview')}>
              <div className="card-top">
                <div className="card-icon-box sys">
                  <Layers size={24} />
                </div>
                <div className="card-status-badge preview">
                  <span>PREVIEW LAB</span>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">Computer Architecture & CPU Pipeline</h3>
                <p className="card-text">
                  Simulate the Fetch-Decode-Execute instruction pipeline, register file updates, ALU operations, 
                  and memory cache hierarchy in an interactive architectural diagram.
                </p>
                <div className="card-features-list">
                  <span><CheckCircle2 size={13} /> RISC Register File Simulation</span>
                  <span><CheckCircle2 size={13} /> 5-Stage Pipeline Hazard Visualizer</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-action-text">Inspect Architecture Preview</span>
                <div className="action-circle">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            {/* LAB CARD 4: NETWORK & GRAPH THEORY (PREVIEW) */}
            <div className="lab-card preview-card" onClick={() => setActiveTab('systems-preview')}>
              <div className="card-top">
                <div className="card-icon-box net">
                  <Network size={24} />
                </div>
                <div className="card-status-badge preview">
                  <span>PREVIEW LAB</span>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">Graph Theory & Network Routing</h3>
                <p className="card-text">
                  Interactive node-edge graph playground for Dijkstra's shortest path, Kruskal's MST, 
                  Breadth-First Search, and network packet routing animation.
                </p>
                <div className="card-features-list">
                  <span><CheckCircle2 size={13} /> Shortest Path Dijkstra Visualizer</span>
                  <span><CheckCircle2 size={13} /> Interactive Node Weight Editor</span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-action-text">Inspect Graph Preview</span>
                <div className="action-circle">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE MINI SANDBOX PREVIEW ON HOMEPAGE */}
        <section className="hub-sandbox-section">
          <div className="sandbox-card">
            <div className="sandbox-header">
              <div className="sandbox-title-row">
                <MousePointerClick size={20} className="sandbox-icon" />
                <h3>Quick Interactive Playground</h3>
              </div>
              <div className="sandbox-tabs">
                <button 
                  className={`sandbox-tab ${activeSandboxTab === 'logic' ? 'active' : ''}`}
                  onClick={() => setActiveSandboxTab('logic')}
                >
                  <Cpu size={14} /> Logic Gate Teaser
                </button>
                <button 
                  className={`sandbox-tab ${activeSandboxTab === 'array' ? 'active' : ''}`}
                  onClick={() => setActiveSandboxTab('array')}
                >
                  <Binary size={14} /> Array Teaser
                </button>
              </div>
            </div>

            <div className="sandbox-content">
              {activeSandboxTab === 'logic' ? (
                <div className="sandbox-logic-demo">
                  <div className="demo-inputs">
                    <label>Input A: </label>
                    <button 
                      className={`val-toggle ${gateA ? 'on' : 'off'}`} 
                      onClick={() => setGateA(gateA ? 0 : 1)}
                    >
                      {gateA}
                    </button>
                    
                    <label>Gate Type: </label>
                    <select value={gateType} onChange={e => setGateType(e.target.value)}>
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                      <option value="NAND">NAND</option>
                      <option value="NOR">NOR</option>
                      <option value="XOR">XOR</option>
                    </select>

                    <label>Input B: </label>
                    <button 
                      className={`val-toggle ${gateB ? 'on' : 'off'}`} 
                      onClick={() => setGateB(gateB ? 0 : 1)}
                    >
                      {gateB}
                    </button>
                  </div>

                  <div className="demo-wire-visual">
                    <span className={`wire-line ${gateA ? 'high' : 'low'}`} />
                    <div className="gate-box">{gateType}</div>
                    <span className={`wire-line ${calculateGateOutput() ? 'high' : 'low'}`} />
                    <div className={`output-bulb ${calculateGateOutput() ? 'on' : 'off'}`}>
                      Output: {calculateGateOutput()}
                    </div>
                  </div>

                  <button className="open-full-lab-btn" onClick={() => setActiveTab('logic-gates')}>
                    Launch Full Logic Gates Simulator Lab <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="sandbox-array-demo">
                  <div className="array-boxes">
                    {arrayElements.map((el, idx) => (
                      <div key={idx} className="array-box-item">
                        <div className="box-val">{el}</div>
                        <div className="box-idx">[{idx}]</div>
                      </div>
                    ))}
                  </div>

                  <div className="array-controls-inline">
                    <input 
                      type="number" 
                      placeholder="Add number" 
                      value={newVal} 
                      onChange={e => setNewVal(e.target.value)}
                    />
                    <button onClick={handleArrayInsert}>Append to Array</button>
                    <button onClick={() => setArrayElements([18, 42, 75, 29, 64])}>Reset</button>
                  </div>

                  <button className="open-full-lab-btn" onClick={() => setActiveTab('cs-visualizer')}>
                    Launch Full CS Visualizer Lab <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="hub-footer">
          <div className="footer-container">
            <div className="footer-left">
              <span className="footer-brand">NEXUS CS // VIRTUAL LEARNING LABS</span>
              <p>Next-generation 3D interactive learning ecosystem for computer science education.</p>
            </div>
            <div className="footer-right">
              <span className="footer-copy">Built with React & Three.js WebGL Engine</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
