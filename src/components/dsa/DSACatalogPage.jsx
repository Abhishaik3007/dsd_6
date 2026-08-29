import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { DATA_STRUCTURES_DATA } from './dsaData';
import { 
  Search, ArrowRight, ArrowUpRight, Sparkles, Filter, Play, BookOpen, Layers
} from 'lucide-react';

export const DSACatalogPage = () => {
  const { openDsDoc, launchDsLab, setActiveTab } = useHub();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Linear', 'Non-Linear', 'Advanced'];

  const filteredItems = DATA_STRUCTURES_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb]">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
            className="flex items-center text-decoration-none group cursor-pointer"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>

          <div className="flex items-center gap-5">
            <span className="hidden sm:inline font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#647895]">
              data structures directory
            </span>
            <button
              onClick={() => launchDsLab('none')}
              className="bg-[#203247] text-[#f6f3eb] rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-[#347f7a] transition-colors cursor-pointer shadow-sm border-none flex items-center gap-1.5"
            >
              <span>Interactive DS Lab</span> <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-[#f5f3ed]">
        {/* TOP HERO CONTENT WITH GRID LINES */}
        <div className="relative bg-grid-paper">
          <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 pt-14 pb-8 sm:px-8 sm:pt-20 sm:pb-10">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#f09a7d]" />
              interactive computer science directory
            </p>

            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-6xl lg:text-[4.8rem] leading-[0.95] tracking-[-0.05em] text-[#203247]">
              Data Structures & <br />
              <em className="italic font-normal text-[#347f7a]">Memory Layouts.</em>
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#526b88]">
              Explore foundational data structures from first principles. Read documentation, inspect complexity matrices, and jump into the interactive DS visualizer lab.
            </p>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER TOOLBAR (NO DIVIDERS, NO GRID LINES) */}
        <div className="bg-[#f5f3ed]">
          <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 py-4 sm:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895]" />
              <input
                type="text"
                placeholder="Search data structures (e.g. Linked List, BST)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#203247]/15 bg-white/80 py-3 pl-11 pr-5 text-sm outline-none transition-all focus:border-[#347f7a] focus:bg-white text-[#203247]"
              />
            </div>

            {/* Category Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-[#647895] mr-1 hidden sm:inline" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer border-none ${
                    selectedCategory === cat
                      ? 'bg-[#203247] text-[#f6f3eb] shadow-sm'
                      : 'bg-white/60 text-[#526b88] hover:bg-white hover:text-[#203247]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG CARDS GRID SECTION */}
      <section className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 pt-4 pb-12 sm:px-8 sm:pt-6 sm:pb-16">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono-signal text-[11px] uppercase tracking-[0.2em] text-[#526b88] font-medium">
            {filteredItems.length} DATA STRUCTURES AVAILABLE
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                className={`group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-[#203247]/10 ${item.bgColor} p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
                onClick={() => openDsDoc(item.id)}
              >
                {/* TOP HEADER */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#203247]/10 bg-white/50 shadow-sm">
                    <IconComp size={22} strokeWidth={1.6} className="text-[#203247]" />
                  </div>
                  <span className="rounded-full border border-[#203247]/15 px-3 py-1 font-mono-signal text-[9px] uppercase tracking-wider text-[#203247]/80 font-bold bg-white/40">
                    {item.categoryTag}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="mt-6">
                  <h3 className="font-display text-3xl font-bold tracking-tight text-[#203247]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#203247]/75">
                    {item.shortDesc}
                  </p>

                  {/* QUICK COMPLEXITY BADGES */}
                  <div className="mt-5 flex items-center gap-3 border-t border-[#203247]/10 pt-4 text-xs font-mono">
                    <span className="text-[#526b88]">Access: <strong className="text-[#347f7a]">{item.complexity.access.time}</strong></span>
                    <span className="text-[#526b88]">Search: <strong className="text-[#347f7a]">{item.complexity.search.time}</strong></span>
                  </div>
                </div>

                {/* ACTION CTA BUTTONS */}
                <div className="mt-6 flex items-center justify-between border-t border-[#203247]/10 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#203247] group-hover:text-[#347f7a] transition-colors">
                    <BookOpen size={14} /> Documentation
                  </span>
                  
                  {item.id !== 'set' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        launchDsLab(item.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#203247] px-3.5 py-1.5 text-xs font-semibold text-[#f6f3eb] hover:bg-[#347f7a] transition-colors border-none cursor-pointer"
                    >
                      <Play size={12} fill="#f6f3eb" /> Lab
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f6f3eb] border-t border-[#203247]/10 py-8 px-5 sm:px-8 text-[#526b88] text-xs">
        <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <div className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </div>
            <p className="mt-2 text-xs text-[#526b88] max-w-xs">
              Interactive computer science directory & learning environment.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('hub')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">Home</button>
            <button onClick={() => launchDsLab('none')} className="hover:text-[#203247] cursor-pointer border-none bg-transparent p-0">DS Lab</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
