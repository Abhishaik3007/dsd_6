import React, { useState, useRef, useEffect } from 'react';
import {
  Code,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  X,
  Play,
  Square,
  Sparkles,
  ChevronDown,
  Trash2,
  Send,
  AlertCircle,
  Cpu,
  Plus
} from 'lucide-react';
import { ARDUINO_PRESETS, DEFAULT_ARDUINO_CODE } from './engine/arduinoRuntime';

export const TinkerCodeEditor = ({
  isOpen,
  onClose,
  arduinoComponents = [],
  selectedArduinoId,
  onSelectArduino,
  onAddArduino,
  code,
  onChangeCode,
  isSimulating,
  onToggleSimulation,
  serialLogs = [],
  onClearSerial,
  onSendSerial,
  runtimeError,
  isDarkMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [isSerialExpanded, setIsSerialExpanded] = useState(true);
  const baudRate = '9600';
  
  const textareaRef = useRef(null);
  const serialEndRef = useRef(null);
  const presetRef = useRef(null);
  const boardDropdownRef = useRef(null);

  // Active Arduino component
  const activeArduino = arduinoComponents.find(c => c.id === selectedArduinoId) || arduinoComponents[0] || null;
  const activeArduinoIndex = arduinoComponents.findIndex(c => c.id === (activeArduino?.id)) + 1;
  const activeBoardName = activeArduino?.props?.name || `Arduino Uno #${activeArduinoIndex || 1}`;

  // Auto-scroll Serial Monitor to bottom when new logs arrive
  useEffect(() => {
    if (serialEndRef.current && isSerialExpanded) {
      serialEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, isSerialExpanded]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (presetRef.current && !presetRef.current.contains(e.target)) {
        setIsPresetOpen(false);
      }
      if (boardDropdownRef.current && !boardDropdownRef.current.contains(e.target)) {
        setIsBoardDropdownOpen(false);
      }
    };
    if (isPresetOpen || isBoardDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPresetOpen, isBoardDropdownOpen]);

  if (!isOpen) return null;

  // Handle Tab indentation inside textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      onChangeCode(nextVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code || DEFAULT_ARDUINO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPreset = (preset) => {
    onChangeCode(preset.code);
    setIsPresetOpen(false);
  };

  const handleSendSerial = (e) => {
    e.preventDefault();
    if (!serialInput.trim() || !activeArduino) return;
    if (onSendSerial) {
      onSendSerial(activeArduino.id, serialInput);
    }
    setSerialInput('');
  };

  // Filter serial logs: only show output for the currently selected board in the top dropdown
  const filteredLogs = serialLogs.filter(log => {
    if (!activeArduino) return true;
    return log.boardId === activeArduino.id;
  });

  // Generate line numbers
  const linesCount = Math.max(1, (code || '').split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div
      className={`fixed top-14 right-0 bottom-0 z-50 flex flex-col w-[580px] max-w-[95vw] shadow-2xl border-l backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-right-4 ${
        isDarkMode
          ? 'bg-[#0f172a]/95 border-slate-700 text-slate-100 shadow-black/70'
          : 'bg-[#FAF8F4]/95 border-slate-300 text-slate-800 shadow-slate-900/25'
      }`}
    >
      {/* ── 1. UNIFIED HEADER BAR ────────────────────────────────────── */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between shrink-0 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        {/* Left: Board Selector Dropdown (or title if no boards) */}
        {arduinoComponents.length > 0 ? (
          <div className="flex items-center gap-2">
            {/* Sleek Board Selector Dropdown */}
            <div ref={boardDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsBoardDropdownOpen(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs select-none ${
                  isBoardDropdownOpen
                    ? 'bg-[#347F7A] text-white border-[#347F7A]'
                    : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-teal-300 hover:border-teal-400'
                      : 'bg-white border-slate-300 text-slate-800 hover:border-[#347F7A]'
                }`}
                title="Click to switch target Arduino board"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`} />
                <Cpu size={13} className={isBoardDropdownOpen ? 'text-white' : 'text-[#347F7A] dark:text-teal-400'} />
                <span className="font-space-grotesk font-extrabold">{activeBoardName}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 opacity-70 ${isBoardDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBoardDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1.5 z-50 min-w-[270px] rounded-xl border p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
                  isDarkMode ? 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/80' : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/20'
                }`}>
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#347F7A] dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>Target Microcontroller</span>
                    <span className="opacity-60">{arduinoComponents.length} board{arduinoComponents.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1 max-h-56 overflow-y-auto">
                    {arduinoComponents.map((comp, idx) => {
                      const isSelected = comp.id === activeArduino?.id;
                      const bName = comp.props?.name || `Arduino Uno #${idx + 1}`;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            onSelectArduino && onSelectArduino(comp.id);
                            setIsBoardDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? isDarkMode ? 'bg-teal-500/20 text-teal-300 font-bold' : 'bg-[#347F7A]/10 text-[#347F7A] font-bold'
                              : isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-teal-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`} />
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">{bName}</span>
                              <span className="text-[10px] opacity-60">ID: {comp.id.slice(-6)} • ATmega328P</span>
                            </div>
                          </div>
                          {isSelected && <Check size={13} className="text-[#347F7A] dark:text-teal-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-[#347F7A] dark:text-teal-400 flex items-center justify-center font-bold">
              <Code size={15} />
            </div>
            <span className="font-space-grotesk font-extrabold text-sm">Arduino Code Editor</span>
          </div>
        )}

        {/* Right: Run Sketch Button + Close Button */}
        <div className="flex items-center gap-2">
          {arduinoComponents.length > 0 && (
            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSimulating
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-[#347F7A] hover:bg-[#2A6561] text-white shadow-teal-700/20'
              }`}
              title={isSimulating ? 'Stop Simulation' : 'Run Sketch on Microcontroller'}
            >
              {isSimulating ? <Square size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
              <span className="text-xs font-space-grotesk">{isSimulating ? 'Stop' : 'Run Sketch'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Close Code Editor"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── 2. CASE A: NO PROGRAMMABLE COMPONENTS EMPTY STATE ─────────── */}
      {arduinoComponents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border-2 border-dashed border-[#347F7A]/40 flex items-center justify-center text-[#347F7A] dark:text-teal-400 mb-4 animate-pulse">
            <Cpu size={32} />
          </div>
          <h3 className="font-space-grotesk font-extrabold text-base mb-1.5">
            No Programmable Microcontroller on Canvas
          </h3>
          <p className="text-xs opacity-70 max-w-sm font-mono-signal mb-6 leading-relaxed">
            The Code Editor executes C++ sketches directly on hardware boards like the <strong>Arduino Uno R3</strong>. Currently, there are no programmable boards on your workbench.
          </p>

          <button
            onClick={onAddArduino}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#347F7A] hover:bg-[#2A6561] text-white font-bold text-xs transition-all shadow-md cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus size={15} />
            <span>+ Add Arduino Uno R3 to Circuit</span>
          </button>
        </div>
      ) : (
        /* ── 2. CASE B: CODE EDITOR & TOOLBAR ── */
        <>
          {/* ── CODE SUB-TOOLBAR: TEMPLATES (LEFT) & COPY/RESET (RIGHT) ── */}
          <div className={`px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0 text-xs ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {/* Left: Preset Templates Dropdown */}
            <div ref={presetRef} className="relative">
              <button
                onClick={() => setIsPresetOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold font-mono transition-all cursor-pointer ${
                  isPresetOpen
                    ? 'bg-[#347F7A] text-white border-[#347F7A]'
                    : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-teal-400'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-[#347F7A]'
                }`}
              >
                <Sparkles size={12} className="text-amber-400 fill-amber-400" />
                <span>Templates</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isPresetOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPresetOpen && (
                <div className={`absolute top-full left-0 mt-1 z-50 w-72 rounded-xl border p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
                  isDarkMode ? 'bg-slate-900/95 border-slate-700 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
                }`}>
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#347F7A] dark:text-teal-400 border-b border-slate-200 dark:border-slate-800">
                    Arduino Sketch Templates
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1 max-h-64 overflow-y-auto">
                    {ARDUINO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col ${
                          isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-teal-50 text-slate-700'
                        }`}
                      >
                        <span className="font-bold text-xs">{p.name}</span>
                        <span className="text-[10px] opacity-60 line-clamp-1">{p.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Copy & Reset */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                    : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title="Copy code to clipboard"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onChangeCode(DEFAULT_ARDUINO_CODE)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                }`}
                title="Reset code to default Blink sketch"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* ── CODE EDITOR CANVAS WITH LINE NUMBERS ─────────────── */}
          <div className="relative flex-1 flex overflow-hidden bg-[#181E29] text-slate-100 font-mono text-xs select-text">
            {/* Line Numbers Column */}
            <div className="w-12 py-3 bg-[#131720] text-slate-500 text-right pr-3 select-none border-r border-slate-800 shrink-0 font-mono text-[11px] leading-[1.6]">
              {lineNumbers.map(n => (
                <div key={n} className="leading-[1.6]">{n}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code || ''}
              onChange={(e) => onChangeCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Type Arduino C++ code here..."
              className="flex-1 w-full h-full p-3 bg-transparent text-emerald-300/90 font-mono text-[11px] leading-[1.6] resize-none outline-none border-none overflow-auto whitespace-pre tab-[2]"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Error Banner if Compile/Runtime Error */}
          {runtimeError && (
            <div className="px-4 py-2 bg-red-900/70 border-t border-red-700 text-red-200 text-xs flex items-center gap-2 shrink-0">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span className="font-mono text-[11px] line-clamp-1 flex-1">{runtimeError}</span>
            </div>
          )}

          {/* ── ADVANCED TWO-WAY SERIAL MONITOR PANEL ─────────────── */}
          <div className={`border-t flex flex-col shrink-0 transition-all duration-200 ${
            isSerialExpanded ? 'h-48' : 'h-9'
          } bg-[#0d1117] border-slate-800`}>
            {/* Serial Monitor Header */}
            <div className="h-9 px-3 flex items-center justify-between border-b border-slate-800/80 bg-[#161b22] text-slate-300 shrink-0 select-none">
              <div
                onClick={() => setIsSerialExpanded(prev => !prev)}
                className="flex items-center gap-2 cursor-pointer hover:text-white"
              >
                <Terminal size={13} className="text-teal-400" />
                <span className="font-space-grotesk font-bold text-xs">Serial Monitor</span>
                <ChevronDown size={12} className={`transition-transform duration-200 text-slate-400 ${isSerialExpanded ? '' : 'rotate-180'}`} />
              </div>

              <div className="flex items-center gap-3">
                {/* Fixed default 9600 baud */}
                <span className="text-[10px] font-mono text-slate-400 select-none">
                  9600 baud
                </span>

                <div className="flex items-center gap-1.5 select-none">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[10px] font-mono text-slate-400">
                    {isSimulating ? 'RX/TX Live' : 'Standby'}
                  </span>
                </div>

                {filteredLogs.length > 0 && (
                  <button
                    onClick={onClearSerial}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Clear Serial Monitor"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Serial Logs Body */}
            {isSerialExpanded && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] text-teal-300/90 space-y-0.5 select-text">
                  {filteredLogs.length === 0 ? (
                    <div className="text-slate-500 italic text-[11px] py-1 select-none">
                      {isSimulating
                        ? `Listening on Serial (${activeBoardName}) @ 9600 baud...`
                        : 'Serial Monitor idle. Click "Run Sketch" or "Start Simulation" to stream serial output.'}
                    </div>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <div key={idx} className="leading-tight break-all font-mono">
                        <span className="text-slate-500 select-none mr-1.5">[{log.time}]</span>
                        <span className={log.isError ? 'text-red-400 font-bold' : 'text-slate-200'}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={serialEndRef} />
                </div>

                {/* Serial Send Input with Target Indicator */}
                <form onSubmit={handleSendSerial} className="h-8 px-2 border-t border-slate-800 bg-[#161b22] flex items-center gap-2">
                  <span className="text-[10px] font-mono text-teal-400 shrink-0 font-bold">
                    {activeBoardName} &gt;
                  </span>
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="Send serial input to Serial.read()..."
                    disabled={!isSimulating}
                    className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-500 outline-none border-none disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={!isSimulating || !serialInput.trim()}
                    className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#347F7A] hover:bg-[#2A6561] disabled:opacity-40 text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Send</span>
                    <Send size={10} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
