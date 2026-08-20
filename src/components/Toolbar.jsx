import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Trash2, Cpu, Download, Upload, MoreVertical } from 'lucide-react';

export default function Toolbar({ onClear, onLoadPreset, currentPreset, onSaveCircuit, onLoadCircuit, onCircuitError, canSaveCircuit }) {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [fileError, setFileError] = useState('');
  const presetRef = useRef(null);
  const actionsRef = useRef(null);
  const fileInputRef = useRef(null);
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
      if (!actionsRef.current?.contains(event.target)) {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, []);

  const handlePresetChange = (presetName) => {
    onLoadPreset(presetName);
    setIsPresetMenuOpen(false);
  };

  const closeActionsMenu = () => setIsActionsMenuOpen(false);
  const selectedPreset = presets.find(([value]) => value === currentPreset);
  const selectedCircuitName = selectedPreset?.[1] || currentPreset || 'Empty Canvas';

  const reportFileError = (message) => {
    setFileError(message);
    onCircuitError(message);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      reportFileError('Please choose a .json circuit file');
      return;
    }

    if (file.size === 0) {
      reportFileError('This file is empty. Choose a saved Logicraft circuit');
      return;
    }

    try {
      const fileText = await file.text();
      if (!fileText.trim()) {
        reportFileError('This file contains no data');
        return;
      }
      const circuit = JSON.parse(fileText);
      if (
        !circuit ||
        typeof circuit !== 'object' ||
        Array.isArray(circuit) ||
        circuit.format !== 'logicraft-circuit' ||
        circuit.version !== 1 ||
        !Array.isArray(circuit.nodes) ||
        !Array.isArray(circuit.connections)
      ) {
        reportFileError('This JSON is not a Logicraft circuit file');
        return;
      }
      if (circuit.nodes.length === 0) {
        reportFileError('This file does not contain a circuit');
        return;
      }
      setFileError('');
      onLoadCircuit(circuit, file.name);
    } catch (error) {
      reportFileError(error instanceof SyntaxError
        ? 'This file is not valid JSON'
        : 'Could not read that circuit file');
    }
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
            title={selectedCircuitName}
            aria-haspopup="listbox"
            aria-expanded={isPresetMenuOpen}
            onClick={() => setIsPresetMenuOpen((isOpen) => !isOpen)}
          >
            <span>{selectedCircuitName}</span>
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
        <div className={`actions-menu-container ${isActionsMenuOpen ? 'is-open' : ''}`} ref={actionsRef}>
          <button
            className="toolbar-more-btn"
            type="button"
            title="Circuit actions"
            aria-label="Circuit actions"
            aria-haspopup="menu"
            aria-expanded={isActionsMenuOpen}
            onClick={() => setIsActionsMenuOpen((isOpen) => !isOpen)}
          >
            <MoreVertical size={20} />
          </button>
          {isActionsMenuOpen && (
            <div className="actions-menu" role="menu" aria-label="Circuit actions">
              <button className="actions-menu-item" type="button" role="menuitem" disabled={!canSaveCircuit} onClick={() => { onSaveCircuit(); closeActionsMenu(); }}>
                <Download size={16} />
                <span>Save circuit</span>
              </button>
              <button className="actions-menu-item" type="button" role="menuitem" onClick={() => { fileInputRef.current?.click(); closeActionsMenu(); }}>
                <Upload size={16} />
                <span>Open circuit</span>
              </button>
              <button className="actions-menu-item danger" type="button" role="menuitem" onClick={() => { onClear(); closeActionsMenu(); }}>
                <Trash2 size={16} />
                <span>Clear canvas</span>
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          className="circuit-file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
        />
      </div>
      {fileError && (
        <div className="toolbar-file-error" role="alert" aria-live="assertive">
          <span>{fileError}</span>
          <button type="button" title="Dismiss file error" aria-label="Dismiss file error" onClick={() => setFileError('')}>×</button>
        </div>
      )}
    </div>
  );
}
