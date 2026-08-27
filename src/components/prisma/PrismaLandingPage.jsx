import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Play, Terminal, Layers, Cpu, Binary, Network } from 'lucide-react';
import { useHub } from '../../context/HubContext';
import { WordsPullUp, WordsPullUpMultiStyle } from './WordsPullUp';
import { AnimatedParagraph } from './AnimatedParagraph';
import { ThreeHeroCanvas } from './ThreeHeroCanvas';

export const PrismaLandingPage = () => {
  const { setActiveTab, setIsSearchOpen } = useHub();

  const heroVideoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
  const featureVideoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

  const card1Icon = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85";
  const card2Icon = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85";
  const card3Icon = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85";

  const navItems = [
    { label: "Logic Gates", action: () => setActiveTab('logic-gates') },
    { label: "CS Visualizer", action: () => setActiveTab('cs-visualizer') },
    { label: "Architecture", action: () => setActiveTab('systems-preview') },
    { label: "Graph Theory", action: () => setActiveTab('systems-preview') },
    { label: "Search (Ctrl+K)", action: () => setIsSearchOpen(true) },
  ];

  // Motion variants for features grid cards
  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' });

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="bg-black text-[#E1E0CC] min-h-screen selection:bg-[#DEDBC8] selection:text-black">
      {/* =========================================================
         SECTION 1: HERO (Full viewport height with inset padding & 3D Canvas)
         ========================================================= */}
      <section className="h-screen p-4 md:p-6 relative bg-black">
        <div className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden relative bg-black border border-white/10">
          
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
            src={heroVideoUrl}
          />

          {/* Interactive 3D WebGL Node Engine Overlay */}
          <ThreeHeroCanvas />

          {/* Noise Overlay */}
          <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none z-2" />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-3 pointer-events-none" />

          {/* Top Hanging Navbar */}
          <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2.5 md:px-8 shadow-2xl border-b border-x border-white/10">
            <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14 list-none m-0 p-0">
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={item.action}
                    className="text-[10px] sm:text-xs md:text-sm transition-colors duration-200 cursor-pointer font-medium"
                    style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hero Content (Bottom-aligned Grid) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              {/* Left 8 columns: Giant Heading "Prisma*" */}
              <div className="lg:col-span-8">
                <h1 className="m-0 leading-none text-[#E1E0CC] select-none">
                  <WordsPullUp
                    text="Prisma"
                    showAsterisk={true}
                    className="text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em]"
                  />
                </h1>
              </div>

              {/* Right 4 columns: Description Paragraph + CTA Button */}
              <div className="lg:col-span-4 flex flex-col gap-6 items-start lg:pb-4">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-primary/70 text-xs sm:text-sm md:text-base leading-[1.3] m-0 max-w-md"
                >
                  Prisma is a worldwide network of computer science visualizers, hardware architects, and logic engineers bound not by place or status, but by passion to master algorithms and digital circuit synthesis through 3D interactive labs.
                </motion.p>

                {/* CTA Button "Join the lab" */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveTab('logic-gates')}
                  className="group inline-flex items-center gap-2 hover:gap-3 bg-[#DEDBC8] text-black font-medium text-sm sm:text-base rounded-full pl-5 pr-2 py-2 sm:pl-6 sm:pr-2.5 sm:py-2.5 transition-all duration-300 cursor-pointer shadow-lg"
                >
                  <span>Join the lab</span>
                  <div className="bg-black text-[#DEDBC8] rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#E1E0CC]" />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         SECTION 2: ABOUT (Computer Science Virtual Hub Context)
         ========================================================= */}
      <section className="bg-black py-24 sm:py-32 px-4 md:px-6 relative">
        <div className="bg-[#101010] rounded-3xl p-8 sm:p-12 md:p-20 max-w-6xl mx-auto text-center border border-white/5 shadow-2xl">
          <span className="text-[#DEDBC8] text-[10px] sm:text-xs uppercase tracking-widest block mb-8 opacity-80">
            Virtual CS Labs
          </span>

          {/* Main Heading with Multi-Style Pull-Up Animation */}
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9] text-[#E1E0CC] mb-12">
            <WordsPullUpMultiStyle
              segments={[
                { text: "I am Nexus Core,", className: "font-normal text-[#E1E0CC]" },
                { text: "an interactive 3D learning engine.", className: "font-serif text-[#E1E0CC] italic" },
                { text: "I synthesize boolean logic, tree traversals, array pointers, and CPU hardware in real-time.", className: "font-normal text-[#E1E0CC]" },
              ]}
            />
          </div>

          {/* Body paragraph with scroll-linked character opacity animation */}
          <AnimatedParagraph
            text="Over the last seven years, our interactive learning engine has enabled over 1.4 thousand logic operations per second across multi-input boolean gates, binary search trees, and algorithm visualizers. Together, we empower students to visualize complex computer science fundamentals."
            className="text-[#DEDBC8] text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed mt-8"
          />
        </div>
      </section>

      {/* =========================================================
         SECTION 3: FEATURES (4-column card grid for Virtual CS Labs)
         ========================================================= */}
      <section className="min-h-screen bg-black relative py-20 sm:py-28 px-4 md:px-8 border-t border-white/5">
        <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Text */}
          <div className="text-center mb-16 sm:mb-20">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Studio-grade workflows for visionary creators.", className: "text-[#E1E0CC] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal block w-full" },
                { text: "Built for pure vision. Powered by art.", className: "text-gray-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal block w-full mt-2" },
              ]}
            />
          </div>

          {/* 4-Column Card Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-2 lg:h-[480px]"
          >
            {/* Card 1 - Video Card */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate={isGridInView ? "visible" : "hidden"}
              className="relative rounded-2xl overflow-hidden h-[340px] lg:h-full group cursor-pointer border border-white/10"
              onClick={() => setActiveTab('logic-gates')}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700"
                src={featureVideoUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-1" />
              <div className="absolute bottom-6 left-6 right-6 z-2">
                <span className="text-[#E1E0CC] text-lg sm:text-xl font-medium block">
                  Your creative canvas.
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  Digital Logic Gates Simulator
                </span>
              </div>
            </motion.div>

            {/* Card 2 - "Project Storyboard." (01) */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate={isGridInView ? "visible" : "hidden"}
              className="bg-[#212121] rounded-2xl p-6 flex flex-col justify-between h-[340px] lg:h-full hover:bg-[#282828] transition-colors duration-300 cursor-pointer border border-white/5"
              onClick={() => setActiveTab('logic-gates')}
            >
              <div>
                <img
                  src={card1Icon}
                  alt="Storyboard Icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mb-6 border border-white/10"
                />
                <h3 className="text-lg sm:text-xl font-medium text-[#E1E0CC] mb-4">
                  Project Storyboard. <span className="text-gray-500 font-normal">(01)</span>
                </h3>
                <ul className="space-y-2.5 p-0 m-0 list-none">
                  {[
                    "Real-time Logic Node Tracing",
                    "Automated Circuit Evaluation",
                    "Notebook Truth Table Generator",
                    "Drag & Drop Canvas Tools"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-400">
                      <Check className="w-4 h-4 text-[#DEDBC8] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[#E1E0CC] font-medium border-t border-white/5 mt-4">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 transform -rotate-45" />
              </div>
            </motion.div>

            {/* Card 3 - "Smart Critiques." (02) */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate={isGridInView ? "visible" : "hidden"}
              className="bg-[#212121] rounded-2xl p-6 flex flex-col justify-between h-[340px] lg:h-full hover:bg-[#282828] transition-colors duration-300 cursor-pointer border border-white/5"
              onClick={() => setActiveTab('cs-visualizer')}
            >
              <div>
                <img
                  src={card2Icon}
                  alt="Critiques Icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mb-6 border border-white/10"
                />
                <h3 className="text-lg sm:text-xl font-medium text-[#E1E0CC] mb-4">
                  Smart Critiques. <span className="text-gray-500 font-normal">(02)</span>
                </h3>
                <ul className="space-y-2.5 p-0 m-0 list-none">
                  {[
                    "Step-by-Step BST Traversals",
                    "Array & Pointer Trace Engine",
                    "Sorting Algorithm Speed Slider",
                    "Interactive Stack & Queue Frames"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-400">
                      <Check className="w-4 h-4 text-[#DEDBC8] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[#E1E0CC] font-medium border-t border-white/5 mt-4">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 transform -rotate-45" />
              </div>
            </motion.div>

            {/* Card 4 - "Immersion Capsule." (03) */}
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate={isGridInView ? "visible" : "hidden"}
              className="bg-[#212121] rounded-2xl p-6 flex flex-col justify-between h-[340px] lg:h-full hover:bg-[#282828] transition-colors duration-300 cursor-pointer border border-white/5"
              onClick={() => setActiveTab('systems-preview')}
            >
              <div>
                <img
                  src={card3Icon}
                  alt="Capsule Icon"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mb-6 border border-white/10"
                />
                <h3 className="text-lg sm:text-xl font-medium text-[#E1E0CC] mb-4">
                  Immersion Capsule. <span className="text-gray-500 font-normal">(03)</span>
                </h3>
                <ul className="space-y-2.5 p-0 m-0 list-none">
                  {[
                    "Distraction-free focus mode",
                    "Ambient 3D soundscapes",
                    "Hardware CPU Pipeline preview",
                    "Schedule & session syncing"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-400">
                      <Check className="w-4 h-4 text-[#DEDBC8] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[#E1E0CC] font-medium border-t border-white/5 mt-4">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 transform -rotate-45" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 py-12 px-6 text-center text-xs text-gray-500">
        <p className="m-0">© 2026 Prisma Virtual Learning Platform & Creative Studio. All Rights Reserved.</p>
      </footer>
    </div>
  );
};
