import React, { useState } from 'react';
import { Info, Search } from 'lucide-react';
import { GATE_TYPES } from '../utils/simulator';

const GATE_TEMPLATES = [
  {
    category: 'I/O',
    gridClass: 'io-grid',
    items: [
      { 
        type: GATE_TYPES.INPUT, 
        name: 'Switch', 
        svg: (
          <svg width="76" height="52" viewBox="42 20 76 70">
            <defs>
              <linearGradient id="sidebar-toggle-on" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="sidebar-toggle-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect x="60" y="44" width="40" height="22" rx="11" fill="url(#sidebar-toggle-on)" stroke="#059669" strokeWidth="1.5" filter="url(#sidebar-toggle-glow)" />
            <rect x="60" y="44" width="40" height="6" rx="3" fill="rgba(0,0,0,0.15)" />
            <circle cx="91" cy="55" r="9" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="1" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            <circle cx="89" cy="52" r="3" fill="rgba(255,255,255,0.6)" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.OUTPUT, 
        name: 'LED', 
        svg: (
          <svg width="50" height="36" viewBox="0 0 50 36">
            {/* 3D clay container box */}
            <rect x="12" y="4" width="26" height="28" rx="6" fill="#1c1917" stroke="#1e293b" strokeWidth="2" transform="translate(0, 2)" />
            <rect x="12" y="4" width="26" height="28" rx="6" fill="#292524" stroke="#1e293b" strokeWidth="2" />
            {/* Pins */}
            <line x1="21" y1="22" x2="21" y2="27" stroke="#1e293b" strokeWidth="2" />
            <line x1="29" y1="22" x2="29" y2="27" stroke="#1e293b" strokeWidth="2" />
            {/* Red LED Bulb */}
            <circle cx="25" cy="14" r="7" fill="#ef4444" stroke="#1e293b" strokeWidth="2" />
            <circle cx="25" cy="14" r="5" fill="rgba(254, 226, 226, 0.4)" />
          </svg>
        )
      },
    ]
  },
  {
    category: 'Gates',
    gridClass: 'gates-grid',
    items: [
      { 
        type: GATE_TYPES.NOT, 
        name: 'NOT', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 8 7 L 28 17 L 8 27 Z" fill="#a855f7" stroke="#5b21b6" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="33" cy="17" r="3" fill="#a855f7" stroke="#5b21b6" strokeWidth="2" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.AND, 
        name: 'AND', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 10 7 H 22 A 10 10 0 0 1 22 27 H 10 Z" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.NAND, 
        name: 'NAND', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 10 7 H 20 A 10 10 0 0 1 20 27 H 10 Z" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="36" cy="17" r="3" fill="#0ea5e9" stroke="#0369a1" strokeWidth="2" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.OR, 
        name: 'OR', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 8 7 Q 15 17 8 27 Q 20 27 34 17 Q 20 7 8 7 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.NOR, 
        name: 'NOR', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 8 7 Q 15 17 8 27 Q 20 27 30 17 Q 20 7 8 7 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="36" cy="17" r="3" fill="#f43f5e" stroke="#9f1239" strokeWidth="2" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.XOR, 
        name: 'XOR', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 3 7 Q 8 17 3 27" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 9 7 Q 15 17 9 27 Q 19 27 31 17 Q 19 7 9 7 Z" fill="#a855f7" stroke="#5b21b6" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        )
      },
      { 
        type: GATE_TYPES.XNOR, 
        name: 'XNOR', 
        svg: (
          <svg width="46" height="34" viewBox="0 0 46 34">
            <path d="M 3 7 Q 8 17 3 27" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 9 7 Q 15 17 9 27 Q 19 27 29 17 Q 19 7 9 7 Z" fill="#a855f7" stroke="#5b21b6" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="35" cy="17" r="3" fill="#a855f7" stroke="#5b21b6" strokeWidth="2" />
          </svg>
        )
      },
    ]
  }
];

export default function Sidebar({ onAddNode, onHelpClick }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (e, gateType) => {
    e.dataTransfer.setData('application/react-flow-gate-type', gateType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Filter templates based on search input
  const filteredTemplates = GATE_TEMPLATES.map(section => {
    const matchedItems = section.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...section,
      items: matchedItems
    };
  }).filter(section => section.items.length > 0);

  return (
    <aside className="sidebar">
      {/* Premium Dark Search Bar Container */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search components..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="sidebar-help-btn" type="button" title="How to use" onClick={onHelpClick}>
          <Info size={16} />
          <span>How to use</span>
        </button>
      </div>

      <div className="sidebar-scroll">
        {filteredTemplates.map((section, idx) => (
          <div key={idx} className="category-section-container">
            <div className="category-header">
              <span className="category-title">{section.category}</span>
            </div>
            
            <div className={`templates-grid ${section.gridClass}`}>
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="gate-template-tile"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  onPointerDown={(e) => {
                    if (e.pointerType !== 'mouse') {
                      e.preventDefault();
                      onAddNode(item.type);
                    }
                  }}
                >
                  <div className="tile-icon-container">
                    {item.svg}
                  </div>
                  <span className="tile-name">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
