import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  Network,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle,
  ExternalLink,
  Zap,
  Code2,
  Terminal,
  Activity,
  Key
} from 'lucide-react';

export const PublicHeroPage = () => {
  const { setActiveTab } = useHub();
  const { isAuthenticated, currentUser } = useAuth();
  const [pulseActive, setPulseActive] = useState(true);

  const handleEnterPlatform = () => {
    if (isAuthenticated) {
      setActiveTab('hub');
    } else {
      setActiveTab('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#203247] font-space-grotesk selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* =========================================================
          TOP PUBLIC NAVBAR
          ========================================================= */}
      <nav className="sticky top-0 z-50 bg-[#f5f3ed]/95 backdrop-blur-md border-b border-[#203247]/10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-decoration-none flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#203247] text-[#f6f3eb] flex items-center justify-center font-bold text-sm shadow-xs">
                S
              </div>
              <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
                signal<span className="text-[#347f7a] font-normal">school</span>
              </span>
            </a>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono-signal uppercase tracking-wider font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
              Academic Core v2.4
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-[#647895]">
            <a href="#laboratories" className="hover:text-[#203247] transition-colors">
              Laboratories
            </a>
            <a href="#interactive-preview" className="hover:text-[#203247] transition-colors">
              Interactive Engines
            </a>
            <a href="#institutional" className="hover:text-[#203247] transition-colors">
              Institutions & Campus
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold text-[#647895] hover:text-[#203247] px-3 py-2 cursor-pointer transition-colors hidden sm:inline-block"
            >
              Have a Lab Pass?
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setActiveTab('hub')}
                className="bg-[#347f7a] hover:bg-[#28635f] text-[#f6f3eb] rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>Resume Workspace</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <span>Sign In / Enter Lab</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO SECTION
          ========================================================= */}
      <header className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-5 sm:px-8 max-w-[1440px] mx-auto overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#d9e8df]/40 via-[#f0ece1]/60 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#203247]/12 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#347f7a] animate-pulse" />
            <span className="font-mono-signal text-[11px] uppercase tracking-[0.18em] text-[#203247] font-semibold">
              Interactive Computer Science & Hardware Simulator
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal text-[#203247] leading-[1.08] tracking-tight">
            Master the invisible architecture of computation.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#647895] max-w-2xl mx-auto font-normal leading-relaxed">
            From gate-level silicon logic propagation to high-performance tree structures, sorting passes, and collaborative peer-to-peer visualizers. Built for universities, researchers, and engineers.
          </p>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleEnterPlatform}
              className="bg-[#203247] hover:bg-[#347f7a] text-[#f6f3eb] rounded-full px-7 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md flex items-center gap-2 hover:-translate-y-0.5 border-none"
            >
              <span>Launch Learning Hub</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className="bg-white hover:bg-[#fbf9f4] text-[#203247] border border-[#203247]/15 rounded-full px-6 py-3 text-sm font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-2 hover:border-[#347f7a]"
            >
              <Key size={14} className="text-[#347f7a]" />
              <span>Enter with Invite Token</span>
            </button>
          </div>

          {/* Live System Signal Pulse Indicator */}
          <div className="pt-6 flex items-center justify-center gap-6 text-[11px] font-mono-signal text-[#647895]">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-[#347f7a]" />
              <span>Realtime Signal Engine: 60 FPS</span>
            </div>
            <span className="text-[#647895]/40">•</span>
            <div>Zero Install • Pure WebGL & Canvas</div>
            <span className="text-[#647895]/40">•</span>
            <div>Institutional Single Sign-On Ready</div>
          </div>
        </div>

        {/* HERO INTERACTIVE SHOWCASE CARD */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-[#203247]/15 bg-[#fbf9f4] p-3 sm:p-4 shadow-2xl backdrop-blur-md">
          <div className="rounded-2xl border border-[#203247]/10 bg-white overflow-hidden">
            {/* Top Bar of Window */}
            <div className="px-5 py-3 border-b border-[#203247]/10 bg-[#f5f3ed]/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f09a7d]/70" />
                <span className="w-3 h-3 rounded-full bg-[#f6d06f]/70" />
                <span className="w-3 h-3 rounded-full bg-[#82c49b]/70" />
                <span className="ml-3 font-mono-signal text-[10px] text-[#647895] uppercase tracking-wider">
                  Engine Playground • Live Topology
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono-signal text-[10px] text-[#347f7a]">
                <button
                  type="button"
                  onClick={() => setPulseActive(!pulseActive)}
                  className="hover:underline cursor-pointer bg-[#d9e8df]/70 px-2 py-0.5 rounded"
                >
                  {pulseActive ? 'Pulse: ACTIVE' : 'Pulse: PAUSED'}
                </button>
              </div>
            </div>

            {/* Interactive Grid Simulation Preview */}
            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-white to-[#fcfbfa]">
              {/* Tile 1: Logic Gates */}
              <div className="p-5 rounded-2xl border border-[#203247]/10 bg-[#fbf9f4]/80 hover:border-[#347f7a]/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <span className="font-mono-signal text-[10px] text-[#647895]">Lab 01</span>
                </div>
                <h4 className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors">
                  Digital Logic Studio
                </h4>
                <p className="text-xs text-[#647895] mt-1.5 leading-relaxed">
                  Interactive Boolean networks with instantaneous gate delay propagation and live truth tables.
                </p>
                <div className="mt-4 pt-3 border-t border-[#203247]/8 flex items-center justify-between text-[11px] font-mono-signal text-[#347f7a]">
                  <span>NAND, XOR, ALU & Decoders</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Tile 2: DSA Visualizer */}
              <div className="p-5 rounded-2xl border border-[#203247]/10 bg-[#fbf9f4]/80 hover:border-[#347f7a]/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#f5dec5] text-[#d97d54] flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <span className="font-mono-signal text-[10px] text-[#647895]">Lab 02</span>
                </div>
                <h4 className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors">
                  Computer Science Data Structures
                </h4>
                <p className="text-xs text-[#647895] mt-1.5 leading-relaxed">
                  Inspect memory pointers, AVL balancing rotations, binary heaps, and dynamic hash buckets step-by-step.
                </p>
                <div className="mt-4 pt-3 border-t border-[#203247]/8 flex items-center justify-between text-[11px] font-mono-signal text-[#d97d54]">
                  <span>Live Pointer Visualization</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Tile 3: Algorithm Lab */}
              <div className="p-5 rounded-2xl border border-[#203247]/10 bg-[#fbf9f4]/80 hover:border-[#347f7a]/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center">
                    <Code2 size={16} />
                  </div>
                  <span className="font-mono-signal text-[10px] text-[#647895]">Lab 03</span>
                </div>
                <h4 className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors">
                  Algorithm Analysis & Execution
                </h4>
                <p className="text-xs text-[#647895] mt-1.5 leading-relaxed">
                  Step through pathfinding (A*, Dijkstra), dynamic programming grids, and sorting recursion trees.
                </p>
                <div className="mt-4 pt-3 border-t border-[#203247]/8 flex items-center justify-between text-[11px] font-mono-signal text-[#347f7a]">
                  <span>Code-Sync Stepper</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          LABORATORIES DIRECTORY SECTION
          ========================================================= */}
      <section id="laboratories" className="py-20 border-t border-[#203247]/10 bg-[#f5f3ed]/50 px-5 sm:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
                Comprehensive Curricula
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#203247] mt-1.5">
                Engineered for Academic Mastery
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#647895] max-w-md font-mono-signal">
              Each laboratory combines mathematical formalism, visual inspection models, and real-time execution sandboxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lab 1 */}
            <div className="bg-white border border-[#203247]/12 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono-signal text-xs text-[#347f7a] font-semibold mb-2">01 / DIGITAL ELECTRONICS</div>
                <h3 className="font-display text-xl text-[#203247] mb-2">Digital Circuit Workbench</h3>
                <p className="text-xs text-[#647895] leading-relaxed">
                  Create schematics with interactive gates, flip-flops, multiplexers, and truth table notebooks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#203247]/8">
                <button
                  onClick={handleEnterPlatform}
                  className="w-full py-2 bg-[#f5f3ed] hover:bg-[#347f7a] hover:text-white text-[#203247] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter Circuit Lab</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Lab 2 */}
            <div className="bg-white border border-[#203247]/12 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono-signal text-xs text-[#d97d54] font-semibold mb-2">02 / STRUCTURES</div>
                <h3 className="font-display text-xl text-[#203247] mb-2">Data Structures Studio</h3>
                <p className="text-xs text-[#647895] leading-relaxed">
                  Watch linked list pointers re-link, trees rotate on balance factors, and heaps sift down in real time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#203247]/8">
                <button
                  onClick={handleEnterPlatform}
                  className="w-full py-2 bg-[#f5f3ed] hover:bg-[#347f7a] hover:text-white text-[#203247] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter DSA Studio</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Lab 3 */}
            <div className="bg-white border border-[#203247]/12 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono-signal text-xs text-[#347f7a] font-semibold mb-2">03 / ALGORITHMS</div>
                <h3 className="font-display text-xl text-[#203247] mb-2">Algorithm Laboratory</h3>
                <p className="text-xs text-[#647895] leading-relaxed">
                  Inspect time and space complexities, comparison counters, and multi-language syntax in parallel.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#203247]/8">
                <button
                  onClick={handleEnterPlatform}
                  className="w-full py-2 bg-[#f5f3ed] hover:bg-[#347f7a] hover:text-white text-[#203247] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter Algo Lab</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Lab 4 */}
            <div className="bg-white border border-[#203247]/12 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="font-mono-signal text-xs text-[#8250df] font-semibold mb-2">04 / PEER MESH</div>
                <h3 className="font-display text-xl text-[#203247] mb-2">P2P Collaborative Chat</h3>
                <p className="text-xs text-[#647895] leading-relaxed">
                  Decentralized WebRTC room signaling for synchronized student-faculty peer problem solving.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#203247]/8">
                <button
                  onClick={handleEnterPlatform}
                  className="w-full py-2 bg-[#f5f3ed] hover:bg-[#347f7a] hover:text-white text-[#203247] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter Mesh Room</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INSTITUTIONAL / ENTERPRISE SECTION
          ========================================================= */}
      <section id="institutional" className="py-20 px-5 sm:px-8 max-w-[1440px] mx-auto">
        <div className="bg-[#203247] text-[#f6f3eb] rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Background pattern */}
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#347f7a]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="font-mono-signal text-[11px] uppercase tracking-[0.2em] text-[#82c49b] font-semibold">
              Institutional Multi-Tenant Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-normal leading-tight">
              Provision dedicated department labs & student seat quotas in minutes.
            </h2>
            <p className="text-sm sm:text-base text-[#d0d7de] leading-relaxed font-normal">
              SignalSchool provides university administrators with complete tenant isolation, role-based access control, tokenized lab passes, and real-time seat tracking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold font-display text-[#82c49b]">100%</div>
                <div className="text-xs text-[#d0d7de] mt-1 font-mono-signal">Client-Side Simulation</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold font-display text-[#82c49b]">Instant</div>
                <div className="text-xs text-[#d0d7de] mt-1 font-mono-signal">Token Onboarding</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold font-display text-[#82c49b]">Multi-Tier</div>
                <div className="text-xs text-[#d0d7de] mt-1 font-mono-signal">Department & Campus Packs</div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveTab('login')}
                className="bg-[#347f7a] hover:bg-[#28635f] text-[#f6f3eb] rounded-full px-6 py-3 text-xs font-semibold transition-all cursor-pointer shadow-md flex items-center gap-2 border-none"
              >
                <span>Access University Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ACADEMIC FOOTER
          ========================================================= */}
      <footer className="border-t border-[#203247]/10 bg-[#f5f3ed] py-12 px-5 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#647895] font-mono-signal">
          <div className="flex items-center gap-2">
            <span className="font-space-grotesk font-bold text-sm text-[#203247]">signalschool</span>
            <span>•</span>
            <span>Computational Hardware & Algorithm Foundry</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('login')} className="hover:text-[#203247] cursor-pointer">
              Sign In
            </button>
            <button onClick={() => setActiveTab('login')} className="hover:text-[#203247] cursor-pointer">
              Claim Pass
            </button>
            <button onClick={handleEnterPlatform} className="hover:text-[#203247] cursor-pointer text-[#347f7a] font-semibold">
              Enter Platform →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
