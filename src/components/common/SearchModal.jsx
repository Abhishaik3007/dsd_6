import React, { useState, useEffect } from 'react';
import { useHub } from '../../context/HubContext';
import { Search, X, Cpu, Binary, ArrowRight, CornerDownLeft, Sparkles, Layers, Radio, BookOpen } from 'lucide-react';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveTab } = useHub();
  const [query, setQuery] = useState('');

  const searchItems = [
    { id: 'digital-doc', title: 'Digital Electronics Study Guide & Theory', category: 'Digital Logic', tab: 'digital-doc', icon: BookOpen, desc: 'First-principles theory, truth tables, transistor models, and HDL code' },
    { id: 'digital-catalog', title: 'Digital Circuits & Silicon Directory', category: 'Digital Logic', tab: 'digital-catalog', icon: Cpu, desc: 'Fundamental gates, adders, flip-flops, multiplexers, and counters catalog' },
    { id: 'gate-sim', title: 'Digital Logic Gates Simulator', category: 'Digital Logic', tab: 'logic-gates', icon: Cpu, desc: 'Interactive AND, OR, NOT, NAND, NOR, XOR, XNOR gates simulation' },
    { id: 'truth-table', title: 'Truth Table Notebook Generator', category: 'Digital Logic', tab: 'logic-gates', icon: Cpu, desc: 'Auto-evaluate boolean outputs and boolean logic' },
    { id: 'dsa-catalog', title: 'Data Structures Directory & Study', category: 'Data Structures', tab: 'dsa-catalog', icon: Layers, desc: 'Arrays, Linked Lists, BST, AVL Trees, Hash Tables, Heaps documentation' },
    { id: 'array-lab', title: 'Arrays & Dynamic Arrays Visualizer', category: 'Data Structures', tab: 'cs-visualizer', icon: Binary, desc: 'Insert, delete, linear search, binary search visual pointers' },
    { id: 'tree-lab', title: 'Binary Search Tree & AVL Visualizer', category: 'Data Structures', tab: 'cs-visualizer', icon: Binary, desc: 'Tree node insertion, BST search path trace, tree traversals' },
    { id: 'stack-queue', title: 'Stack & Queue LIFO/FIFO Visualizer', category: 'Data Structures', tab: 'cs-visualizer', icon: Binary, desc: 'Push, pop, enqueue, dequeue animated visualizer' },
    { id: 'sorting-lab', title: 'Sorting Algorithms Visualizer', category: 'Algorithms', tab: 'cs-visualizer', icon: Binary, desc: 'Bubble sort, quick sort, merge sort, selection sort step controls' },
    { id: 'sys-arch', title: 'Computer Architecture & CPU Pipeline', category: 'Architecture', tab: 'systems-preview', icon: Layers, desc: 'Register files, ALU operations, fetch-decode-execute cycle' },
    { id: 'p2p-chat', title: 'Mesh Room (P2P Decentralized Chat)', category: 'Networking', tab: 'p2p-chat', icon: Radio, desc: 'Direct WebRTC browser-to-browser encrypted real-time multi-peer mesh chat with zero storage' },
  ];

  const filteredItems = searchItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    if (isSearchOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="nexus-search-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div className="nexus-search-modal" onClick={e => e.stopPropagation()}>
        {/* Input Header */}
        <div className="modal-input-row">
          <Search size={20} className="search-modal-icon" />
          <input
            type="text"
            className="search-modal-input"
            placeholder="Search labs, algorithms, gates, data structures..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-close-btn" onClick={() => setIsSearchOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="modal-results-list">
          {filteredItems.length === 0 ? (
            <div className="no-results">
              <Sparkles size={24} className="no-results-icon" />
              <p>No matching labs found for "{query}"</p>
              <span>Try searching for "tree", "gate", "array", or "sort"</span>
            </div>
          ) : (
            filteredItems.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="modal-result-item"
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsSearchOpen(false);
                  }}
                >
                  <div className="result-icon-box">
                    <IconComp size={18} />
                  </div>
                  <div className="result-info">
                    <div className="result-title">
                      {item.title}
                      <span className="result-category">{item.category}</span>
                    </div>
                    <div className="result-desc">{item.desc}</div>
                  </div>
                  <div className="result-enter-hint">
                    <span>Launch</span>
                    <CornerDownLeft size={14} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-hint">
            <kbd>ESC</kbd> to close
          </div>
          <div className="footer-brand">
            NEXUS CS // VIRTUAL LEARNING LABS
          </div>
        </div>
      </div>
    </div>
  );
};
