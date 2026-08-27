import React, { useState, useRef } from 'react';
import { Play, Pause, Shuffle, BarChart2 } from 'lucide-react';

export const SortingVisualizer = () => {
  const [array, setArray] = useState([45, 12, 85, 32, 89, 23, 67, 5, 54, 98, 71, 39]);
  const [selectedAlgo, setSelectedAlgo] = useState('bubble'); // 'bubble' | 'selection' | 'quick' | 'insertion'
  const [speed, setSpeed] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [compareIndices, setCompareIndices] = useState([]);
  const [swapIndices, setSwapIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [metrics, setMetrics] = useState({ comparisons: 0, swaps: 0 });
  const [logMessages, setLogMessages] = useState(['Sorting Engine initialized. Select an algorithm to start.']);

  const isSortingRef = useRef(false);

  const addLog = (msg) => {
    setLogMessages(prev => [msg, ...prev.slice(0, 8)]);
  };

  // Generate Data Arrays
  const generateRandomArray = (size = 12) => {
    setIsPlaying(false);
    isSortingRef.current = false;
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArr);
    setCompareIndices([]);
    setSwapIndices([]);
    setSortedIndices([]);
    setMetrics({ comparisons: 0, swaps: 0 });
    addLog(`Generated random array of size ${size}.`);
  };

  const generateReverseArray = () => {
    setIsPlaying(false);
    isSortingRef.current = false;
    const sorted = [...array].sort((a, b) => b - a);
    setArray(sorted);
    setCompareIndices([]);
    setSwapIndices([]);
    setSortedIndices([]);
    setMetrics({ comparisons: 0, swaps: 0 });
    addLog('Generated reverse-sorted worst case array.');
  };

  // Sleep helper based on speed
  const delay = () => new Promise(resolve => setTimeout(resolve, Math.max(80, 800 / speed)));

  // BUBBLE SORT
  const runBubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    let comps = 0;
    let swaps = 0;
    const sorted = [];

    addLog('Starting Bubble Sort execution...');

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSortingRef.current) return;

        setCompareIndices([j, j + 1]);
        comps++;
        setMetrics({ comparisons: comps, swaps });
        await delay();

        if (arr[j] > arr[j + 1]) {
          setSwapIndices([j, j + 1]);
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          setMetrics({ comparisons: comps, swaps });
          setArray([...arr]);
          await delay();
        }
        setSwapIndices([]);
      }
      sorted.push(n - 1 - i);
      setSortedIndices([...sorted]);
    }
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
    setCompareIndices([]);
    setIsPlaying(false);
    isSortingRef.current = false;
    addLog(`Bubble Sort Completed! Total Comparisons: ${comps}, Swaps: ${swaps}`);
  };

  // SELECTION SORT
  const runSelectionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    let comps = 0;
    let swaps = 0;
    const sorted = [];

    addLog('Starting Selection Sort execution...');

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (!isSortingRef.current) return;

        setCompareIndices([minIdx, j]);
        comps++;
        setMetrics({ comparisons: comps, swaps });
        await delay();

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        setSwapIndices([i, minIdx]);
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swaps++;
        setMetrics({ comparisons: comps, swaps });
        setArray([...arr]);
        await delay();
      }
      sorted.push(i);
      setSortedIndices([...sorted]);
      setSwapIndices([]);
    }
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
    setCompareIndices([]);
    setIsPlaying(false);
    isSortingRef.current = false;
    addLog(`Selection Sort Completed! Comparisons: ${comps}, Swaps: ${swaps}`);
  };

  // QUICK SORT
  const runQuickSort = async () => {
    const arr = [...array];
    let comps = 0;
    let swaps = 0;

    addLog('Starting Quick Sort execution...');

    const partition = async (low, high) => {
      let pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        if (!isSortingRef.current) return i;

        setCompareIndices([j, high]);
        comps++;
        setMetrics({ comparisons: comps, swaps });
        await delay();

        if (arr[j] < pivot) {
          i++;
          setSwapIndices([i, j]);
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          swaps++;
          setMetrics({ comparisons: comps, swaps });
          setArray([...arr]);
          await delay();
        }
      }

      setSwapIndices([i + 1, high]);
      let temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      swaps++;
      setMetrics({ comparisons: comps, swaps });
      setArray([...arr]);
      await delay();
      setSwapIndices([]);

      return i + 1;
    };

    const quickSort = async (low, high) => {
      if (low < high) {
        if (!isSortingRef.current) return;
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
      }
    };

    await quickSort(0, arr.length - 1);
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCompareIndices([]);
    setIsPlaying(false);
    isSortingRef.current = false;
    addLog(`Quick Sort Completed! Comparisons: ${comps}, Swaps: ${swaps}`);
  };

  // Handle Play/Pause
  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isSortingRef.current = false;
      addLog('Paused sorting execution.');
    } else {
      setIsPlaying(true);
      isSortingRef.current = true;

      if (selectedAlgo === 'bubble') runBubbleSort();
      else if (selectedAlgo === 'selection') runSelectionSort();
      else if (selectedAlgo === 'quick') runQuickSort();
      else runBubbleSort();
    }
  };

  const getAlgoComplexity = () => {
    switch (selectedAlgo) {
      case 'bubble': return { time: 'O(n²)', space: 'O(1)' };
      case 'selection': return { time: 'O(n²)', space: 'O(1)' };
      case 'quick': return { time: 'O(n log n)', space: 'O(log n)' };
      default: return { time: 'O(n²)', space: 'O(1)' };
    }
  };

  return (
    <div className="algo-visualizer-container">
      <div className="visualizer-header">
        <div className="v-title-box">
          <BarChart2 size={20} className="v-icon cyan" />
          <h2>Sorting Algorithms Visualizer Engine</h2>
        </div>
        <p className="v-subtitle">
          Real-time animated array bar visualizer for Bubble Sort, Selection Sort, and Quick Sort.
        </p>

        {/* ALGO SELECTOR */}
        <div className="algo-selector-bar">
          <button 
            className={`algo-tab ${selectedAlgo === 'bubble' ? 'active' : ''}`}
            onClick={() => setSelectedAlgo('bubble')}
          >
            Bubble Sort
          </button>
          <button 
            className={`algo-tab ${selectedAlgo === 'selection' ? 'active' : ''}`}
            onClick={() => setSelectedAlgo('selection')}
          >
            Selection Sort
          </button>
          <button 
            className={`algo-tab ${selectedAlgo === 'quick' ? 'active' : ''}`}
            onClick={() => setSelectedAlgo('quick')}
          >
            Quick Sort
          </button>
        </div>
      </div>

      {/* METRICS & COMPLEXITY BAR */}
      <div className="sorting-metrics-row">
        <div className="s-metric-box">
          <span className="s-label">Comparisons</span>
          <span className="s-val cyan">{metrics.comparisons}</span>
        </div>
        <div className="s-metric-box">
          <span className="s-label">Swaps</span>
          <span className="s-val purple">{metrics.swaps}</span>
        </div>
        <div className="s-metric-box">
          <span className="s-label">Time Complexity</span>
          <span className="s-val amber">{getAlgoComplexity().time}</span>
        </div>
        <div className="s-metric-box">
          <span className="s-label">Space Complexity</span>
          <span className="s-val emerald">{getAlgoComplexity().space}</span>
        </div>
      </div>

      {/* BARS VISUALIZATION STAGE */}
      <div className="sorting-bars-stage">
        {array.map((val, idx) => {
          const isComparing = compareIndices.includes(idx);
          const isSwapping = swapIndices.includes(idx);
          const isSorted = sortedIndices.includes(idx);

          let barClass = 'normal';
          if (isSwapping) barClass = 'swapping';
          else if (isComparing) barClass = 'comparing';
          else if (isSorted) barClass = 'sorted';

          return (
            <div key={idx} className="bar-wrapper">
              <span className="bar-val-text">{val}</span>
              <div 
                className={`sort-bar ${barClass}`}
                style={{ height: `${val * 2.8}px` }}
              />
              <span className="bar-idx-text">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* CONTROLS */}
      <div className="algo-controls-panel">
        <div className="control-group">
          <h4>Playback Controls</h4>
          <div className="control-inputs-row">
            <button className={`algo-btn primary ${isPlaying ? 'active-playing' : ''}`} onClick={handlePlayToggle}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Start Sort'}</span>
            </button>

            <div className="speed-slider-box">
              <span>Speed: {speed}x</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="control-group">
          <h4>Array Generators</h4>
          <div className="control-inputs-row">
            <button className="algo-btn secondary" onClick={() => generateRandomArray(12)}>
              <Shuffle size={15} />
              <span>Random</span>
            </button>
            <button className="algo-btn outline" onClick={generateReverseArray}>
              Worst Case
            </button>
          </div>
        </div>
      </div>

      {/* TERMINAL */}
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
