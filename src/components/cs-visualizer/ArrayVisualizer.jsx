import React, { useState } from 'react';
import { Play, RotateCcw, Plus, Trash2, Search, Sparkles } from 'lucide-react';

export const ArrayVisualizer = () => {
  const [array, setArray] = useState([15, 42, 8, 93, 27, 64, 31]);
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [activePointer, setActivePointer] = useState(null); // Current index highlighted in operation
  const [searchResult, setSearchResult] = useState(null);
  const [logMessages, setLogMessages] = useState([
    'Array Initialized with 7 elements.'
  ]);

  const addLog = (msg) => {
    setLogMessages(prev => [msg, ...prev.slice(0, 8)]);
  };

  const handleAppend = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setArray([...array, val]);
    addLog(`Appended ${val} at index ${array.length}`);
    setInputValue('');
  };

  const handleInsertAtIndex = () => {
    const val = parseInt(inputValue);
    const idx = parseInt(inputIndex);
    if (isNaN(val) || isNaN(idx) || idx < 0 || idx > array.length) return;
    const newArr = [...array];
    newArr.splice(idx, 0, val);
    setArray(newArr);
    setActivePointer(idx);
    addLog(`Inserted ${val} at index ${idx}`);
    setInputValue('');
    setInputIndex('');
  };

  const handleDeleteIndex = (idx) => {
    const val = array[idx];
    const newArr = array.filter((_, i) => i !== idx);
    setArray(newArr);
    addLog(`Deleted element ${val} at index ${idx}`);
    setSearchResult(null);
  };

  const handleLinearSearch = async () => {
    const target = parseInt(searchTarget);
    if (isNaN(target)) return;

    addLog(`Starting Linear Search for target value ${target}...`);
    setSearchResult(null);

    for (let i = 0; i < array.length; i++) {
      setActivePointer(i);
      addLog(`Checking index ${i}: value = ${array[i]}`);
      await new Promise(r => setTimeout(r, 600));

      if (array[i] === target) {
        setSearchResult(`FOUND at index ${i}`);
        addLog(`SUCCESS: Target ${target} found at index ${i}!`);
        return;
      }
    }

    setSearchResult(`NOT FOUND`);
    addLog(`Target ${target} is not present in array.`);
    setActivePointer(null);
  };

  const handleBinarySearch = async () => {
    const target = parseInt(searchTarget);
    if (isNaN(target)) return;

    // Binary search requires sorted array
    const sorted = [...array].sort((a, b) => a - b);
    setArray(sorted);
    addLog(`Sorted array for Binary Search: [${sorted.join(', ')}]`);
    setSearchResult(null);

    let low = 0;
    let high = sorted.length - 1;

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      setActivePointer(mid);
      addLog(`Binary Search range [${low}..${high}], Mid index = ${mid} (val=${sorted[mid]})`);
      await new Promise(r => setTimeout(r, 800));

      if (sorted[mid] === target) {
        setSearchResult(`FOUND at index ${mid}`);
        addLog(`SUCCESS: Found target ${target} at mid index ${mid}!`);
        return;
      } else if (sorted[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    setSearchResult(`NOT FOUND`);
    addLog(`Target ${target} not found via Binary Search.`);
    setActivePointer(null);
  };

  const handleShuffle = () => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    setArray(shuffled);
    setActivePointer(null);
    setSearchResult(null);
    addLog('Shuffled array elements randomly.');
  };

  return (
    <div className="algo-visualizer-container">
      <div className="visualizer-header">
        <div className="v-title-box">
          <Sparkles size={20} className="v-icon" />
          <h2>Interactive Array & Dynamic Array Engine</h2>
        </div>
        <p className="v-subtitle">
          Perform insertion, index deletion, linear search trace, and binary search mid-pointer calculations.
        </p>
      </div>

      {/* VISUAL CANVAS DISPLAY */}
      <div className="array-display-stage">
        <div className="stage-pointers-info">
          {activePointer !== null && (
            <div className="active-pointer-badge">
              Active Pointer Index: <strong>[{activePointer}]</strong>
            </div>
          )}
          {searchResult && (
            <div className={`search-result-badge ${searchResult.includes('FOUND') ? 'found' : 'not-found'}`}>
              Search Result: {searchResult}
            </div>
          )}
        </div>

        <div className="array-boxes-row">
          {array.map((val, idx) => {
            const isActive = activePointer === idx;
            return (
              <div 
                key={idx} 
                className={`array-element-card ${isActive ? 'highlighted' : ''}`}
                onClick={() => setActivePointer(idx)}
              >
                <div className="element-address">0x{1000 + idx * 4}</div>
                <div className="element-box">
                  <span className="element-val">{val}</span>
                </div>
                <div className="element-index">Index [{idx}]</div>
                <button 
                  className="delete-item-btn" 
                  onClick={(e) => { e.stopPropagation(); handleDeleteIndex(idx); }}
                  title="Delete element"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTROLS TOOLBAR */}
      <div className="algo-controls-panel">
        <div className="control-group">
          <h4>Insert / Append Element</h4>
          <div className="control-inputs-row">
            <input
              type="number"
              placeholder="Value"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="algo-input"
            />
            <input
              type="number"
              placeholder="Index (Optional)"
              value={inputIndex}
              onChange={e => setInputIndex(e.target.value)}
              className="algo-input short"
            />
            <button className="algo-btn primary" onClick={inputIndex !== '' ? handleInsertAtIndex : handleAppend}>
              <Plus size={16} />
              <span>{inputIndex !== '' ? 'Insert at Index' : 'Append'}</span>
            </button>
          </div>
        </div>

        <div className="control-group">
          <h4>Search Engine</h4>
          <div className="control-inputs-row">
            <input
              type="number"
              placeholder="Target value"
              value={searchTarget}
              onChange={e => setSearchTarget(e.target.value)}
              className="algo-input"
            />
            <button className="algo-btn secondary" onClick={handleLinearSearch}>
              <Search size={15} />
              <span>Linear Search</span>
            </button>
            <button className="algo-btn secondary" onClick={handleBinarySearch}>
              <Play size={15} />
              <span>Binary Search</span>
            </button>
          </div>
        </div>

        <div className="control-group">
          <h4>Actions</h4>
          <div className="control-inputs-row">
            <button className="algo-btn outline" onClick={handleShuffle}>
              <RotateCcw size={15} />
              <span>Shuffle</span>
            </button>
            <button className="algo-btn outline" onClick={() => setArray([10, 20, 30, 40, 50])}>
              Reset Default
            </button>
          </div>
        </div>
      </div>

      {/* REALTIME LOGS TERMINAL */}
      <div className="algo-logs-terminal">
        <div className="terminal-header">
          <span>CONSOLE OPERATION LOGS</span>
        </div>
        <div className="terminal-body">
          {logMessages.map((log, i) => (
            <div key={i} className="log-line">
              <span className="log-arrow">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
