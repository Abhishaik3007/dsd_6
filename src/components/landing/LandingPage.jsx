import React, { useState, useEffect } from 'react';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import { SignalDiagram } from './SignalDiagram';
import { Manifesto3DCard } from './Manifesto3DCard';
import { LabsIndexModal } from './LabsIndexModal';
import { UserProfileMenu } from '../common/UserProfileMenu';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  GitBranch,
  Layers,
  Orbit,
  Sparkles,
  Braces,
  Menu,
  X,
  Radio
} from 'lucide-react';

export const LandingPage = ({ initialIndexOpen = false }) => {
  const { activeTab, setActiveTab } = useHub();
  const { isAuthenticated, currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpenState] = useState(initialIndexOpen || activeTab === 'labs');
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setIsIndexOpen = (open) => {
    setIsIndexOpenState(open);
    if (open) {
      setActiveTab('labs');
    } else {
      setActiveTab('hub');
    }
  };

  useEffect(() => {
    if (initialIndexOpen || activeTab === 'labs') {
      setIsIndexOpenState(true);
    }
  }, [initialIndexOpen, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const labs = [
    {
      number: '01',
      title: 'Digital circuits',
      desc: 'Build with the tiny decisions that power every computer.',
      tab: 'digital-catalog',
      path: '/circuits',
      icon: GitBranch,
      bgColor: 'bg-[#d9e8df]',
      tag: 'start here',
      featured: true
    },
    {
      number: '02',
      title: 'Data structures',
      desc: 'See how information moves, waits, and finds its way.',
      tab: 'dsa-catalog',
      path: '/dsa',
      icon: Layers,
      bgColor: 'bg-[#f5dec5]',
      tag: 'explore now',
      featured: false
    },
    {
      number: '03',
      title: 'Algorithms',
      desc: 'Turn a question into a sequence of tiny, solvable steps.',
      tab: 'algo-catalog',
      path: '/algorithms',
      icon: Orbit,
      bgColor: 'bg-[#d9e8df]',
      tag: 'explore now',
      featured: false
    },
    {
      number: '04',
      title: 'Mesh Room',
      desc: 'Zero-backend, ultra-low latency real-time multi-peer mesh chat.',
      tab: 'p2p-chat',
      path: '/mesh',
      icon: Radio,
      bgColor: 'bg-[#cbe8e7]',
      tag: 'live direct',
      featured: false
    }
  ];

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* TOP NAVIGATION BAR */}
      <nav
        className={`relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md transition-all duration-300 ${scrolled
          ? 'shadow-sm'
          : ''
          }`}
      >
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          {/* Logo / Brand */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center text-decoration-none group"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>

          {/* Action CTA Pill & User Profile */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895]">learn by doing</span>
            <button
              onClick={() => setIsIndexOpen(true)}
              className="bg-[#203247] text-[#f6f3eb] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#347f7a] transition-colors cursor-pointer shadow-sm border-none"
            >
              Start exploring <ArrowUpRight size={14} className="ml-1 inline" />
            </button>

            {isAuthenticated && currentUser ? (
              <div className="pl-3 border-l border-[#203247]/10 flex items-center">
                <UserProfileMenu />
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="bg-white hover:bg-[#fbf9f4] text-[#203247] border border-[#203247]/15 hover:border-[#347f7a] rounded-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#203247] p-1.5 cursor-pointer bg-transparent border-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#f6f3eb] flex flex-col justify-between px-8 py-24 md:hidden">
          <div className="flex flex-col gap-6">
            <a
              href="#labs"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-3xl text-[#203247] text-decoration-none"
            >
              Labs
            </a>
            <a
              href="#why-signal-school"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-3xl text-[#203247] text-decoration-none"
            >
              Approach
            </a>
            <a
              href="#manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-3xl text-[#203247] text-decoration-none"
            >
              Manifesto
            </a>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab('logic-gates');
            }}
            className="w-full bg-[#203247] text-[#f6f3eb] rounded-full py-4 text-base font-semibold text-center"
          >
            Enter Logicraft Lab
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#203247]/10 bg-[#f5f3ed]">
        <div className="pointer-events-none absolute inset-0 bg-grid-paper opacity-85" />

        <div className="relative mx-auto grid max-w-[1440px] 2xl:max-w-[1560px] items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1fr_0.8fr] 2xl:grid-cols-[1fr_0.85fr] lg:gap-16 2xl:gap-24 lg:pt-20">
          {/* Left Text */}
          <div className="relative">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#f09a7d]" />
              an interactive home for computer science
            </p>

            <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.5rem,7.5vw,7.4rem)] leading-[0.9] tracking-[-0.065em] text-[#203247]">
              Make the<br />
              <em className="italic font-normal text-[#347f7a]">invisible</em> visible.
            </h1>

            <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-[#526b88]">
              Computer science is a lot less mysterious when you can touch it. Flip a bit. Trace a path. Watch an idea click into place.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsIndexOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-[#347f7a] px-6 py-3.5 text-sm font-semibold text-[#f6f3eb] shadow-lg shadow-[#347f7a]/20 transition-transform hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <span>Explore the labs</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#why-signal-school"
                onClick={(e) => {
                  e.preventDefault();
                  const elem = document.getElementById('why-signal-school');
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[#526b88] hover:text-[#203247] text-decoration-none group transition-all"
              >
                <span>Why Signal School</span>
                <ArrowDown size={15} className="transition-transform group-hover:translate-y-1" />
              </a>
            </div>
          </div>

          {/* Right Interactive Signal Diagram */}
          <div className="lg:pt-6">
            <SignalDiagram />
          </div>
        </div>
      </section>

      {/* WHY SIGNAL SCHOOL SECTION */}
      <section id="why-signal-school" className="bg-[#f5f4ed] border-b border-[#203247]/10">
        <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f09a7d] font-semibold">
                a different kind of classroom
              </p>
              <h2 className="mt-5 max-w-md font-display text-4xl sm:text-5xl leading-[.98] tracking-[-0.05em] text-[#203247]">
                Start with a question. Leave with a <span className="text-[#347f7a]">mental model.</span>
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <span className="font-mono text-[11px] text-[#f09a7d] font-semibold">01</span>
                <h3 className="mt-3 text-base font-bold text-[#203247]">See it move</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#526b88]">
                  Diagrams become playgrounds. The rules stay the same, but now you can watch them work.
                </p>
              </div>

              <div>
                <span className="font-mono text-[11px] text-[#f09a7d] font-semibold">02</span>
                <h3 className="mt-3 text-base font-bold text-[#203247]">Try the weird thing</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#526b88]">
                  There is no wrong button to press here. Curiosity is a perfectly good debugging strategy.
                </p>
              </div>

              <div>
                <span className="font-mono text-[11px] text-[#f09a7d] font-semibold">03</span>
                <h3 className="mt-3 text-base font-bold text-[#203247]">Name the pattern</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#526b88]">
                  Once the shape makes sense, the vocabulary sticks. That is the whole trick.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE LAUNCHPAD SECTION (LABS GRID) */}
      <section id="labs" className="border-y border-[#203247]/10 bg-[#f4f0e6]">
        <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
                the launchpad
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#203247]">
                Pick a thread.
              </h2>
            </div>

            <button
              onClick={() => setIsIndexOpen(true)}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#203247] hover:text-[#347f7a] transition-colors border-none bg-transparent cursor-pointer p-0"
            >
              <span>See all experiments</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
            {labs.map((lab) => {
              const IconComp = lab.icon;
              return (
                <div
                  key={lab.number}
                  onClick={() => {
                    if (lab.tab === 'digital-catalog' || lab.tab === 'logic-gates') {
                      setActiveTab('digital-catalog');
                    } else if (lab.tab === 'dsa-catalog') {
                      setActiveTab('dsa-catalog');
                    } else if (lab.tab === 'algo-catalog' || lab.tab === 'algo-visualizer') {
                      setActiveTab('algo-catalog');
                    } else if (lab.tab === 'p2p-chat') {
                      setActiveTab('p2p-chat');
                    } else {
                      triggerToast('Lab coming soon — building in public ✨');
                    }
                  }}
                  className={`group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-[#203247]/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#203247]/25 hover:shadow-xl cursor-pointer ${lab.bgColor} ${lab.featured ? 'md:min-h-[340px] md:p-8' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] tracking-wider text-[#203247]/60 font-semibold">
                      {lab.number} / lab
                    </span>
                    <span className="rounded-full border border-[#203247]/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#203247]/70 font-semibold">
                      {lab.tag}
                    </span>
                  </div>

                  <div>
                    <IconComp size={27} strokeWidth={1.4} className="mb-6 text-[#203247]/70 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
                    <h3 className={`font-display tracking-[-.05em] ${lab.featured ? 'text-4xl sm:text-5xl' : 'text-3xl'} text-[#203247]`}>
                      {lab.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-[#526b88]">
                      {lab.desc}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#203247]">
                      Open lab <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MANIFESTO SECTION */}
      <section id="manifesto" className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 py-20 sm:px-8 sm:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
          {/* Left Interactive 3D Manifesto Card */}
          <Manifesto3DCard />

          {/* Right Copy */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f09a7d] font-semibold">
              our tiny manifesto
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-[#203247]">
              No black boxes. No busywork.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#526b88]">
              Signal School turns the parts of computer science that usually live behind a wall of jargon into small, friendly machines you can poke at. The goal is not to make you faster at a worksheet. It is to make you notice the machinery everywhere.
            </p>
            <div className="mt-8 flex items-center gap-3 border-t border-[#203247]/10 pt-6">
              <Braces size={20} className="text-[#347f7a]" />
              <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#526b88] font-semibold">
                for first principles people
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="bg-[#347f7a] px-5 py-24 sm:px-8 sm:py-32 text-[#f6f3eb]">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <p className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#c0e4db] font-medium mb-2">
            YOUR NEXT RABBIT HOLE IS READY
          </p>
          <h2 className="mt-4 font-display text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95] text-[#f6f3eb]">
            Follow the signal.
          </h2>
          <p className="mt-6 max-w-md text-base sm:text-lg leading-relaxed text-[#f6f3eb]/85">
            Ten minutes, one interactive lab, and a new way to look at the world under your screen.
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                setIsIndexOpen(true);
              } else {
                setActiveTab('pricing');
              }
            }}
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-[#f7bd65] px-7 py-3.5 text-sm font-bold text-[#203247] transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md border-none"
          >
            <span>Enter Signal School</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f6f3eb] border-t border-[#203247]/10 py-7 sm:py-9 px-5 sm:px-8 text-[#526b88] text-xs">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <div className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#526b88] max-w-xs">
              A small, curious corner of the internet for understanding how computers think.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-xs text-[#526b88]">
            <a href="#labs" className="hover:text-[#203247] transition-colors text-decoration-none font-medium">
              Labs
            </a>
            <a href="#manifesto" className="hover:text-[#203247] transition-colors text-decoration-none font-medium">
              Say hello
            </a>
            <span className="font-mono-signal text-[10px] uppercase tracking-widest text-[#526b88]/70 font-medium">
              MADE FOR CURIOUS MINDS
            </span>
          </div>
        </div>
      </footer>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-[#203247] px-6 py-3.5 font-mono-signal text-xs font-semibold text-[#f6f3eb] shadow-2xl border border-white/15 animate-bounce">
          <Sparkles size={15} className="text-[#f7bd65]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LABS INDEX FULL-PAGE OVERLAY */}
      <LabsIndexModal isOpen={isIndexOpen} onClose={() => setIsIndexOpen(false)} />
    </div>
  );
};
