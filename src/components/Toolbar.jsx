import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Trash2, Cpu } from 'lucide-react';

export default function Toolbar({ onClear, onLoadPreset, currentPreset }) {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const presetRef = useRef(null);
  const presets = [
    ['empty', 'Empty Canvas'],
    ['basic_gates', 'Basic Gates Demo'],
    ['half_adder', 'Half Adder Circuit'],
    ['full_adder', 'Full Adder Circuit'],
    ['sr_latch', 'SR Latch (Memory)'],
  ];

  useEffect(() => {
    const handleOutsidePointerDown = (event) => {
      if (!presetRef.current?.contains(event.target)) {
        setIsPresetMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, []);

  const handlePresetChange = (presetName) => {
    onLoadPreset(presetName);
    setIsPresetMenuOpen(false);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        <div className="logo-icon">
          <Cpu size={24} />
        </div>
        <div className="logo-text">
          <h1>LogiCraft</h1>
          <p>Logic Gate Simulator & Circuit Designer</p>
        </div>
      </div>

      <div className="toolbar-controls">
        <div className={`preset-container ${isPresetMenuOpen ? 'is-open' : ''}`} ref={presetRef}>
          <span className="preset-label">Load Preset</span>
          <button
            type="button"
            className="preset-trigger"
            aria-haspopup="listbox"
            aria-expanded={isPresetMenuOpen}
            onClick={() => setIsPresetMenuOpen((isOpen) => !isOpen)}
          >
            <span>{presets.find(([value]) => value === currentPreset)?.[1]}</span>
            <ChevronDown size={16} />
          </button>
          {isPresetMenuOpen && (
            <div className="preset-menu" role="listbox" aria-label="Circuit presets">
              {presets.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`preset-option ${value === currentPreset ? 'selected' : ''}`}
                  role="option"
                  aria-selected={value === currentPreset}
                  onClick={() => handlePresetChange(value)}
                >
                  <span>{label}</span>
                  {value === currentPreset && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-danger" onClick={onClear}>
          <Trash2 size={16} />
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
