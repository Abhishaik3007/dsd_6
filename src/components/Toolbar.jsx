import React from 'react';
import { Play, RotateCcw, Trash2, Cpu } from 'lucide-react';

export default function Toolbar({ onClear, onLoadPreset, currentPreset }) {
  const handlePresetChange = (e) => {
    onLoadPreset(e.target.value);
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
        <div className="preset-container">
          <span className="preset-label">Load Preset:</span>
          <select 
            className="preset-select" 
            value={currentPreset} 
            onChange={handlePresetChange}
          >
            <option value="empty">Empty Canvas</option>
            <option value="basic_gates">Basic Gates Demo</option>
            <option value="half_adder">Half Adder Circuit</option>
            <option value="full_adder">Full Adder Circuit</option>
            <option value="sr_latch">SR Latch (Memory)</option>
          </select>
        </div>

        <button className="btn btn-danger" onClick={onClear}>
          <Trash2 size={16} />
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
