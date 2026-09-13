import React, { useState } from 'react';
import { useHub } from '../../context/HubContext';
import { 
  Boxes, 
  Cpu, 
  Binary, 
  Search, 
  Home, 
  ChevronDown, 
  Layers,
  Sun,
  Moon,
  Radio
} from 'lucide-react';

export const HeaderNavbar = () => {
  const { activeTab, setActiveTab, setIsSearchOpen, themeMode, toggleThemeMode, accentTheme, setAccentTheme } = useHub();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const labs = [
    { id: 'hub', name: 'Learning Hub Home', icon: Home, badge: 'Portal', desc: 'Main 3D Visual Hub' },
    { id: 'digital-catalog', name: 'Digital Electronics Directory', icon: Cpu, badge: 'Study & Lab', desc: 'Gates, Truth Tables, Adders & HDL Theory' },
    { id: 'logic-gates', name: 'Logic Gates Simulator', icon: Cpu, badge: 'Live Lab', desc: 'Interactive Gate Canvas & Circuits' },
    { id: 'dsa-catalog', name: 'Data Structures Directory', icon: Layers, badge: 'Study & Lab', desc: 'Memory Layouts, Complexity & Code' },
    { id: 'cs-visualizer', name: 'DSA Interactive Lab', icon: Binary, badge: 'Live Lab', desc: 'Interactive Tree, Array & Algo Engine' },
    { id: 'p2p-chat', name: 'Mesh Room (P2P)', icon: Radio, badge: 'Live P2P', desc: 'Direct browser-to-browser encrypted chat' },
    { id: 'systems-preview', name: 'Computer Systems & Architecture', icon: Layers, badge: 'Preview', desc: 'Hardware Pipeline & CPU Simulation' },
  ];

  const currentLab = labs.find(l => l.id === activeTab) || labs[0];

  return (
    <header className={`nexus-navbar ${themeMode}`}>
      <div className="nexus-nav-container">
        {/* Brand & Home */}
        <div className="nexus-brand" onClick={() => setActiveTab('hub')}>
          <div className="nexus-logo-icon">
            <Boxes className="logo-svg" size={20} />
            <span className="logo-pulse"></span>
          </div>
          <div className="nexus-logo-text">
            <span className="brand-title">NEXUS<span className="brand-accent">CS</span></span>
            <span className="brand-subtitle">VIRTUAL LEARNING LABS</span>
          </div>
        </div>

        {/* Breadcrumb / Lab Switcher Dropdown */}
        <div className="nexus-lab-switcher-wrapper">
          <button 
            className="nexus-lab-switcher-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
          >
            <currentLab.icon size={16} className="switcher-icon" />
            <span className="switcher-label">{currentLab.name}</span>
            <span className="switcher-badge">{currentLab.badge}</span>
            <ChevronDown size={14} className={`switcher-arrow ${dropdownOpen ? 'rotated' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="nexus-dropdown-menu">
              <div className="dropdown-header">Select Interactive Virtual Lab</div>
              {labs.map((lab) => {
                const IconComponent = lab.icon;
                const isActive = activeTab === lab.id;
                return (
                  <div
                    key={lab.id}
                    className={`dropdown-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(lab.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="item-icon-box">
                      <IconComponent size={18} />
                    </div>
                    <div className="item-details">
                      <div className="item-title">
                        {lab.name}
                        {lab.badge && <span className={`mini-badge ${lab.badge.toLowerCase().replace(' ', '-')}`}>{lab.badge}</span>}
                      </div>
                      <div className="item-desc">{lab.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions & Utilities */}
        <div className="nexus-nav-actions">
          {/* Light / Dark Theme Mode Toggle */}
          <button 
            className="theme-mode-toggle-btn"
            onClick={toggleThemeMode}
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span className="theme-toggle-label">{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* Quick Search Button */}
          <button 
            className="nexus-search-btn"
            onClick={() => setIsSearchOpen(true)}
            title="Search Labs & Algorithms (Ctrl + K)"
          >
            <Search size={15} />
            <span className="search-text">Search...</span>
            <kbd className="search-kbd">Ctrl K</kbd>
          </button>

          {/* Return to Hub button if inside sub-lab */}
          {activeTab !== 'hub' && (
            <button 
              className="nexus-back-hub-btn"
              onClick={() => setActiveTab('hub')}
            >
              <Home size={14} />
              <span>Back to Hub</span>
            </button>
          )}

          {/* Accent theme indicator */}
          <div className="nexus-accent-picker">
            <button 
              className={`accent-dot cyan ${accentTheme === 'cyan' ? 'selected' : ''}`} 
              onClick={() => setAccentTheme('cyan')}
              title="Cyan Theme"
            />
            <button 
              className={`accent-dot purple ${accentTheme === 'purple' ? 'selected' : ''}`} 
              onClick={() => setAccentTheme('purple')}
              title="Purple Theme"
            />
            <button 
              className={`accent-dot emerald ${accentTheme === 'emerald' ? 'selected' : ''}`} 
              onClick={() => setAccentTheme('emerald')}
              title="Emerald Theme"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
