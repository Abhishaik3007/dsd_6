import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, Shuffle, 
  Swords, Volume2, VolumeX, Sparkles, Trophy, Award, CheckCircle2,
  ChevronRight, ArrowRight, ChevronDown, Check
} from 'lucide-react';
import { SORTING_ALGOS } from './algoData';
import { soundEngine } from './soundEngine';

// Modern tactile CustomSelect dropdown matching the app design system
const CustomSelect = ({ label, value, onChange, options, disabled, accentColor = '#347f7a', isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer select-none disabled:opacity-50 ${
          isDarkMode
            ? 'bg-[#0f172a] border-slate-700 text-slate-100 hover:border-[#347f7a]'
            : 'bg-white border-[#203247]/15 text-[#203247] hover:border-[#347f7a]'
        }`}
      >
        {label && <span className="text-[11px] font-bold" style={{ color: accentColor }}>{label}:</span>}
        <span className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-[#203247]'}`}>{selectedOption?.label || selectedOption?.name}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#347f7a]' : isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`} 
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full left-0 mt-1.5 min-w-[170px] p-1.5 backdrop-blur-md border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#0f172a]/95 border-slate-700' : 'bg-white/95 border-[#203247]/12'
          }`}>
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-[#347f7a]/20 text-emerald-400 font-bold' 
                      : isDarkMode
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-[#203247] hover:bg-[#faf8f4]'
                  }`}
                >
                  <span>{opt.label || opt.name}</span>
                  {isSelected && <Check size={14} className="text-[#347f7a]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Generator functions producing a timeline of steps
export const generateSortingTimeline = (algoId, initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivots: [],
    sorted: [],
    comparisons: 0,
    swaps: 0,
    line: 1,
    insight: `Array initialized with ${n} elements. Preparing ${SORTING_ALGOS[algoId]?.name}.`
  });

  if (algoId === 'bubble') {
    for (let i = 0; i < n; i++) {
      let swappedInPass = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapping: [],
          pivots: [],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          comparisons,
          swaps,
          line: 5,
          insight: `Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]}).`
        });

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swappedInPass = true;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            pivots: [],
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            comparisons,
            swaps,
            line: 7,
            insight: `Swapped: ${arr[j + 1]} was greater than ${arr[j]}, bubbling it rightward.`
          });
        }
      }
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivots: [],
        sorted: Array.from({ length: i + 1 }, (_, k) => n - 1 - k),
        comparisons,
        swaps,
        line: 10,
        insight: `Pass ${i + 1} complete. Largest unsorted value is now locked at position ${n - 1 - i}.`
      });
      if (!swappedInPass) break;
    }
  } else if (algoId === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        pivots: [minIdx],
        sorted: Array.from({ length: i }, (_, k) => k),
        comparisons,
        swaps,
        line: 4,
        insight: `Assumed index ${i} (${arr[i]}) as current minimum for pass ${i + 1}.`
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, minIdx],
          swapping: [],
          pivots: [minIdx],
          sorted: Array.from({ length: i }, (_, k) => k),
          comparisons,
          swaps,
          line: 6,
          insight: `Scanning index ${j} (${arr[j]}) against current minimum (${arr[minIdx]}).`
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            pivots: [minIdx],
            sorted: Array.from({ length: i }, (_, k) => k),
            comparisons,
            swaps,
            line: 7,
            insight: `New minimum found at index ${minIdx} (${arr[minIdx]}).`
          });
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swaps++;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, minIdx],
          pivots: [],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          comparisons,
          swaps,
          line: 10,
          insight: `Swapped minimum (${arr[i]}) into sorted position index ${i}.`
        });
      }
    }
  } else if (algoId === 'insertion') {
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        pivots: [i],
        sorted: Array.from({ length: i }, (_, k) => k),
        comparisons,
        swaps,
        line: 3,
        insight: `Picking key element ${key} at index ${i} to insert into sorted left partition.`
      });

      while (j >= 0) {
        comparisons++;
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;
          steps.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapping: [j + 1],
            pivots: [],
            sorted: [],
            comparisons,
            swaps,
            line: 6,
            insight: `${arr[j]} > ${key}. Shifted ${arr[j]} one position to the right.`
          });
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j + 1],
        pivots: [],
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        comparisons,
        swaps,
        line: 9,
        insight: `Inserted key ${key} into correct position ${j + 1}.`
      });
    }
  } else if (algoId === 'quick') {
    const partition = (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivots: [high],
        sorted: [],
        comparisons,
        swaps,
        line: 12,
        insight: `Pivot selected: ${pivot} at index ${high}. Partitioning subarray [${low}..${high}].`
      });

      for (let j = low; j < high; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, high],
          swapping: [],
          pivots: [high],
          sorted: [],
          comparisons,
          swaps,
          line: 14,
          insight: `Comparing element ${arr[j]} with pivot ${pivot}.`
        });

        if (arr[j] <= pivot) {
          i++;
          const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
          if (i !== j) swaps++;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            pivots: [high],
            sorted: [],
            comparisons,
            swaps,
            line: 16,
            insight: `${arr[i]} <= pivot (${pivot}). Swapped into left partition.`
          });
        }
      }
      const t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t;
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i + 1, high],
        pivots: [i + 1],
        sorted: [i + 1],
        comparisons,
        swaps,
        line: 19,
        insight: `Placed pivot ${arr[i + 1]} into final position ${i + 1}. Left items are ≤, right are >.`
      });
      return i + 1;
    };

    const qs = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        qs(low, pi - 1);
        qs(pi + 1, high);
      }
    };
    qs(0, n - 1);
  } else if (algoId === 'merge') {
    const merge = (l, m, r) => {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      steps.push({
        array: [...arr],
        comparing: [l, r],
        swapping: [],
        pivots: [m],
        sorted: [],
        comparisons,
        swaps,
        line: 9,
        insight: `Merging left sublist [${l}..${m}] and right sublist [${m + 1}..${r}].`
      });

      while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        swaps++;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [k],
          pivots: [],
          sorted: [],
          comparisons,
          swaps,
          line: 12,
          insight: `Placed ${arr[k]} into merged position index ${k}.`
        });
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        i++; k++;
        swaps++;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [k - 1],
          pivots: [],
          sorted: [],
          comparisons,
          swaps,
          line: 15,
          insight: `Appended remaining left item ${arr[k - 1]} to index ${k - 1}.`
        });
      }

      while (j < right.length) {
        arr[k] = right[j];
        j++; k++;
        swaps++;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [k - 1],
          pivots: [],
          sorted: [],
          comparisons,
          swaps,
          line: 16,
          insight: `Appended remaining right item ${arr[k - 1]} to index ${k - 1}.`
        });
      }
    };

    const ms = (l, r) => {
      if (l < r) {
        const m = Math.floor((l + r) / 2);
        ms(l, m);
        ms(m + 1, r);
        merge(l, m, r);
      }
    };
    ms(0, n - 1);
  } else if (algoId === 'heap') {
    const heapify = (size, idx) => {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < size) {
        comparisons++;
        if (arr[left] > arr[largest]) largest = left;
      }
      if (right < size) {
        comparisons++;
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== idx) {
        const t = arr[idx]; arr[idx] = arr[largest]; arr[largest] = t;
        swaps++;
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [idx, largest],
          pivots: [largest],
          sorted: [],
          comparisons,
          swaps,
          line: 14,
          insight: `Sift-down: Swapped root ${arr[largest]} with larger child ${arr[idx]}.`
        });
        heapify(size, largest);
      }
    };

    // Build Max Heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      pivots: [0],
      sorted: [],
      comparisons,
      swaps,
      line: 5,
      insight: `Max-Heap constructed! Root (${arr[0]}) holds the maximum element.`
    });

    // Extract elements
    for (let i = n - 1; i > 0; i--) {
      const t = arr[0]; arr[0] = arr[i]; arr[i] = t;
      swaps++;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [0, i],
        pivots: [],
        sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k),
        comparisons,
        swaps,
        line: 8,
        insight: `Extracted max ${arr[i]} to sorted end index ${i}. Heapifying remaining elements.`
      });
      heapify(i, 0);
    }
  }

  // Final sorted completion step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivots: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    comparisons,
    swaps,
    line: 99,
    insight: `✨ Completed! ${SORTING_ALGOS[algoId]?.name} sorted ${n} elements with ${comparisons} comparisons and ${swaps} swaps.`
  });

  return steps;
};

export const SortingAlgoVisualizer = ({ onStepChange, onAlgoSelect, currentAlgoId = 'bubble', isDarkMode = false }) => {
  // Mode: 'solo' | 'duel'
  const [viewMode, setViewMode] = useState('solo');
  const [selectedAlgo, setSelectedAlgo] = useState(currentAlgoId);
  const [soundMuted, setSoundMuted] = useState(false);

  // Initial Data
  const defaultArr = useMemo(() => [48, 14, 76, 32, 95, 23, 62, 8, 84, 51, 39, 68, 29, 88], []);
  const [baseArray, setBaseArray] = useState(defaultArr);
  const [customInputText, setCustomInputText] = useState('');

  // Solo Step State
  const [timeline, setTimeline] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const playTimerRef = useRef(null);

  // Re-generate timeline when algorithm or baseArray changes
  useEffect(() => {
    const steps = generateSortingTimeline(selectedAlgo, baseArray);
    setTimeline(steps);
    setCurrentStepIdx(0);
    setIsPlaying(false);
    if (onAlgoSelect) onAlgoSelect(selectedAlgo);
  }, [selectedAlgo, baseArray]);

  // Sync selectedAlgo when currentAlgoId prop changes from parent dropdown
  useEffect(() => {
    if (currentAlgoId && SORTING_ALGOS[currentAlgoId] && currentAlgoId !== selectedAlgo) {
      setSelectedAlgo(currentAlgoId);
    }
  }, [currentAlgoId]);

  // Sync active step up to parent for code trace & teacher notes
  useEffect(() => {
    if (timeline[currentStepIdx] && onStepChange) {
      onStepChange(timeline[currentStepIdx]);
    }
  }, [currentStepIdx, timeline]);

  // Audio tone trigger
  useEffect(() => {
    if (isPlaying && timeline[currentStepIdx]) {
      const step = timeline[currentStepIdx];
      const activeIdx = step.comparing[0] ?? step.swapping[0];
      if (activeIdx !== undefined && step.array[activeIdx] !== undefined) {
        soundEngine.playTone(step.array[activeIdx], 5, 100, 50 / speedMultiplier);
      }
    }
  }, [currentStepIdx, isPlaying, timeline, speedMultiplier]);

  // Animation interval loop
  useEffect(() => {
    if (isPlaying) {
      const delayMs = Math.max(25, 450 / speedMultiplier);
      playTimerRef.current = setTimeout(() => {
        if (currentStepIdx < timeline.length - 1) {
          setCurrentStepIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
          soundEngine.playSuccessChime();
        }
      }, delayMs);
    }
    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, currentStepIdx, timeline.length, speedMultiplier]);

  // Array Generators
  const handleGenerateRandom = (size = 14) => {
    setIsPlaying(false);
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 10);
    setBaseArray(newArr);
  };

  const handleGenerateReversed = () => {
    setIsPlaying(false);
    const reversed = [...baseArray].sort((a, b) => b - a);
    setBaseArray(reversed);
  };

  const handleGenerateNearlySorted = () => {
    setIsPlaying(false);
    const sorted = [...baseArray].sort((a, b) => a - b);
    // Swap two random elements
    if (sorted.length > 3) {
      const i1 = Math.floor(sorted.length / 3);
      const i2 = Math.floor((sorted.length * 2) / 3);
      [sorted[i1], sorted[i2]] = [sorted[i2], sorted[i1]];
    }
    setBaseArray(sorted);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const nums = customInputText
      .split(/[, ]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (nums.length >= 3) {
      setIsPlaying(false);
      setBaseArray(nums.slice(0, 20));
      setCustomInputText('');
    }
  };

  // DUEL / RACE MODE STATE
  const [duelAlgoA, setDuelAlgoA] = useState('quick');
  const [duelAlgoB, setDuelAlgoB] = useState('bubble');
  const [isRacing, setIsRacing] = useState(false);
  const [duelTimelineA, setDuelTimelineA] = useState([]);
  const [duelTimelineB, setDuelTimelineB] = useState([]);
  const [stepA, setStepA] = useState(0);
  const [stepB, setStepB] = useState(0);
  const [duelWinner, setDuelWinner] = useState(null);

  const startDuelRace = () => {
    const raceArr = Array.from({ length: 14 }, () => Math.floor(Math.random() * 88) + 10);
    setBaseArray(raceArr);
    const tA = generateSortingTimeline(duelAlgoA, raceArr);
    const tB = generateSortingTimeline(duelAlgoB, raceArr);
    setDuelTimelineA(tA);
    setDuelTimelineB(tB);
    setStepA(0);
    setStepB(0);
    setDuelWinner(null);
    setIsRacing(true);
  };

  // Duel animation ticker
  useEffect(() => {
    if (!isRacing) return;
    const interval = setInterval(() => {
      setStepA(prevA => {
        const nextA = Math.min(prevA + 1, duelTimelineA.length - 1);
        if (nextA === duelTimelineA.length - 1 && !duelWinner) {
          setDuelWinner(SORTING_ALGOS[duelAlgoA]?.name);
          soundEngine.playSuccessChime();
        }
        return nextA;
      });
      setStepB(prevB => {
        const nextB = Math.min(prevB + 1, duelTimelineB.length - 1);
        if (nextB === duelTimelineB.length - 1 && !duelWinner) {
          setDuelWinner(SORTING_ALGOS[duelAlgoB]?.name);
          soundEngine.playSuccessChime();
        }
        return nextB;
      });
    }, Math.max(20, 180 / speedMultiplier));

    if (stepA >= duelTimelineA.length - 1 && stepB >= duelTimelineB.length - 1) {
      setIsRacing(false);
    }
    return () => clearInterval(interval);
  }, [isRacing, duelTimelineA.length, duelTimelineB.length, stepA, stepB, duelWinner, speedMultiplier, duelAlgoA, duelAlgoB]);

  const currentStep = timeline[currentStepIdx] || {
    array: baseArray,
    comparing: [],
    swapping: [],
    pivots: [],
    sorted: [],
    comparisons: 0,
    swaps: 0,
    insight: 'Ready'
  };

  const currentStepDuelA = duelTimelineA[stepA] || { array: baseArray, comparisons: 0, swaps: 0, sorted: [] };
  const currentStepDuelB = duelTimelineB[stepB] || { array: baseArray, comparisons: 0, swaps: 0, sorted: [] };

  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-2.5">
      {/* SUB-HEADER: SOLO VS DUEL RACE TOGGLE & SORTING ALGO TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/95 p-2 px-3 rounded-2xl border border-[#203247]/10 shadow-2xs shrink-0">
        {/* View Mode Tabs (Solo vs Duel) */}
        <div className="flex items-center gap-1 bg-[#f6f4ee] p-1 rounded-xl border border-[#203247]/10">
          <button
            onClick={() => { setIsPlaying(false); setViewMode('solo'); }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
              viewMode === 'solo' ? 'bg-[#203247] text-white shadow-sm' : 'text-[#526b88] hover:text-[#203247]'
            }`}
          >
            <Sparkles size={13} /> Solo Step Engine
          </button>
          <button
            onClick={() => { setIsPlaying(false); setViewMode('duel'); }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 ${
              viewMode === 'duel' ? 'bg-[#347f7a] text-white shadow-sm' : 'text-[#526b88] hover:text-[#347f7a]'
            }`}
          >
            <Swords size={13} /> Algorithm Duel (Race)
          </button>
        </div>

        {/* Algorithm Selectors on Main Canvas (Solo Mode) */}
        {viewMode === 'solo' && (
          <div className="flex items-center gap-1 flex-wrap">
            {Object.values(SORTING_ALGOS).map(algo => (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgo(algo.id);
                  if (onAlgoSelect) onAlgoSelect(algo.id);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border ${
                  selectedAlgo === algo.id
                    ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-xs'
                    : 'bg-white text-[#526b88] border-[#203247]/10 hover:border-[#347f7a] hover:bg-[#faf8f4]'
                }`}
              >
                {algo.name}
              </button>
            ))}
          </div>
        )}

        {/* Audio Mute & Sound Toggle */}
        <button
          onClick={() => {
            const m = soundEngine.toggleMute();
            setSoundMuted(m);
          }}
          title={soundMuted ? 'Unmute harmonic audio' : 'Mute audio'}
          className="p-1.5 rounded-xl border border-[#203247]/10 bg-white hover:bg-slate-50 text-[#526b88] hover:text-[#203247] transition-colors cursor-pointer"
        >
          {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-[#347f7a]" />}
        </button>
      </div>

      {/* DATASET CONTROL BAR (EXCLUSIVE TO SOLO STEP ENGINE) */}
      {viewMode === 'solo' && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#faf8f4] p-2 px-3 rounded-2xl border border-[#203247]/10 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono uppercase font-bold text-[10px] text-[#647895] tracking-wider">Input Array:</span>
            <button
              onClick={() => handleGenerateRandom(14)}
              className="px-2.5 py-0.5 rounded-lg bg-white border border-[#203247]/10 font-medium hover:bg-slate-50 cursor-pointer flex items-center gap-1"
            >
              <Shuffle size={12} /> Random (14)
            </button>
            <button
              onClick={handleGenerateReversed}
              className="px-2.5 py-0.5 rounded-lg bg-white border border-[#203247]/10 font-medium hover:bg-slate-50 cursor-pointer"
            >
              Worst-Case (Reversed)
            </button>
            <button
              onClick={handleGenerateNearlySorted}
              className="px-2.5 py-0.5 rounded-lg bg-white border border-[#203247]/10 font-medium hover:bg-slate-50 cursor-pointer"
            >
              Nearly Sorted
            </button>
          </div>

          {/* Custom Array Input */}
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Custom: 45, 12, 89, 3..."
              value={customInputText}
              onChange={e => setCustomInputText(e.target.value)}
              className="px-2.5 py-0.5 rounded-lg border border-[#203247]/15 bg-white text-xs outline-none focus:border-[#347f7a] w-40"
            />
            <button
              type="submit"
              className="px-2.5 py-0.5 rounded-lg bg-[#203247] text-white font-semibold cursor-pointer border-none hover:bg-[#347f7a]"
            >
              Apply
            </button>
          </form>
        </div>
      )}

      {/* SOLO VIEW MODE - EXPANDS DYNAMICALLY TO FILL SCREEN HEIGHT */}
      {viewMode === 'solo' && (
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-[#203247]/12 shadow-sm overflow-hidden">
          {/* SORTING BARS STAGE - ADAPTS FREELY TO SCREEN SIZE */}
          <div className="sorting-bars-stage flex-1 min-h-0">
            {currentStep.array.map((val, idx) => {
              const isComparing = currentStep.comparing?.includes(idx);
              const isSwapping = currentStep.swapping?.includes(idx);
              const isPivot = currentStep.pivots?.includes(idx);
              const isSorted = currentStep.sorted?.includes(idx);

              let statusClass = '';
              if (isSwapping) statusClass = 'swapping';
              else if (isComparing) statusClass = 'comparing';
              else if (isPivot) statusClass = 'pivot';
              else if (isSorted) statusClass = 'sorted';

              const heightPct = Math.max(10, Math.min(100, (val / 100) * 100));

              return (
                <div key={idx} className="sorting-bar-wrapper">
                  <div
                    className={`sorting-bar ${statusClass}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="bar-val-label">{val}</span>
                </div>
              );
            })}
          </div>

          {/* PLAYBACK SCRUBBER & INTEGRATED METRIC CONTROLS */}
          <div className="algo-playback-bar shrink-0">
            {/* Play/Pause & Step Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { setIsPlaying(false); setCurrentStepIdx(0); }}
                disabled={currentStepIdx === 0}
                className="algo-ctrl-btn"
                title="First Step"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.max(0, prev - 1)); }}
                disabled={currentStepIdx === 0}
                className="algo-ctrl-btn"
                title="Step Back"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="algo-ctrl-btn primary px-4"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setIsPlaying(false); setCurrentStepIdx(prev => Math.min(timeline.length - 1, prev + 1)); }}
                disabled={currentStepIdx >= timeline.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* Step Scrubber Slider */}
            <div className="flex items-center gap-2.5 flex-1 max-w-sm mx-2">
              <span className="font-mono text-[11px] text-[#647895] w-14 text-right">
                {currentStepIdx + 1}/{timeline.length || 1}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, timeline.length - 1)}
                value={currentStepIdx}
                onChange={e => {
                  setIsPlaying(false);
                  setCurrentStepIdx(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider flex-1"
              />
            </div>

            {/* Comps & Swaps Badges + Speed Multiplier */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="metric-badge amber">Comps: {currentStep.comparisons}</span>
                <span className="metric-badge teal">Swaps: {currentStep.swaps}</span>
              </div>

              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-[#203247]/10">
                <span className="font-mono text-[10px] text-[#647895] font-bold">SPEED:</span>
                {[0.5, 1.0, 2.0, 3.5].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer border-none transition-all ${
                      speedMultiplier === s ? 'bg-[#347f7a] text-white' : 'text-[#526b88] hover:bg-slate-100'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUEL / RACE VIEW MODE */}
      {viewMode === 'duel' && (
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto">
          {/* DUEL SETUP & LAUNCH */}
          <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm ${
            isDarkMode
              ? 'bg-[#0f172a] border-slate-700'
              : 'bg-gradient-to-r from-teal-50/50 to-slate-50 border-[#347f7a]/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#347f7a] text-white">
                <Swords size={22} />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>Algorithm Duel: Side-by-Side Race</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-[#526b88]'}`}>
                  Select any two algorithms and watch them compete on identical data to feel the power of Big-O complexity!
                </p>
              </div>
            </div>

            {/* Duel Algorithm Pickers & Start Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <CustomSelect
                label="Lane 1"
                accentColor={isDarkMode ? '#38bdf8' : '#203247'}
                value={duelAlgoA}
                onChange={setDuelAlgoA}
                disabled={isRacing}
                isDarkMode={isDarkMode}
                options={Object.values(SORTING_ALGOS).map(a => ({ value: a.id, label: a.name }))}
              />

              <span className="font-extrabold text-xs text-slate-400">VS</span>

              <CustomSelect
                label="Lane 2"
                accentColor="#347f7a"
                value={duelAlgoB}
                onChange={setDuelAlgoB}
                disabled={isRacing}
                isDarkMode={isDarkMode}
                options={Object.values(SORTING_ALGOS).map(a => ({ value: a.id, label: a.name }))}
              />

              <button
                onClick={startDuelRace}
                disabled={isRacing}
                className="px-5 py-2 rounded-xl bg-[#347f7a] text-white font-bold text-xs hover:bg-[#2dd4bf] hover:text-[#0f172a] transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play size={14} /> Start Race!
              </button>
            </div>
          </div>

          {/* WINNER BANNER */}
          {duelWinner && (
            <div className={`flex items-center justify-between p-4 rounded-2xl border animate-in fade-in zoom-in-95 duration-300 ${
              isDarkMode
                ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                : 'bg-[#d1fae5] border-[#10b981]/40 text-[#065f46]'
            }`}>
              <div className="flex items-center gap-3">
                <Trophy size={26} className="text-[#10b981]" />
                <div>
                  <h4 className="font-extrabold text-sm">🏆 {duelWinner} Finished First!</h4>
                  <p className="text-xs opacity-90">Notice the efficiency difference in comparison and swap operations.</p>
                </div>
              </div>
              <button
                onClick={startDuelRace}
                className="px-3.5 py-1.5 rounded-lg bg-[#059669] text-white font-bold text-xs cursor-pointer border-none hover:bg-[#047857]"
              >
                Rematch!
              </button>
            </div>
          )}

          {/* SIDE-BY-SIDE LANES */}
          <div className="duel-arena-grid">
            {/* LANE A */}
            <div className={`duel-lane-card ${duelWinner === SORTING_ALGOS[duelAlgoA]?.name ? 'winner' : ''}`}>
              <div className="duel-lane-header">
                <div>
                  <h4 className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>{SORTING_ALGOS[duelAlgoA]?.name}</h4>
                  <span className={`font-mono text-[10px] font-semibold ${isDarkMode ? 'text-[#38bdf8]' : 'text-[#203247]'}`}>Avg: {SORTING_ALGOS[duelAlgoA]?.timeAvg}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="metric-badge amber">Comps: {currentStepDuelA.comparisons || 0}</span>
                  <span className="metric-badge green">Swaps: {currentStepDuelA.swaps || 0}</span>
                </div>
              </div>

              {/* Lane A Bars */}
              <div className="duel-bars-stage">
                {currentStepDuelA.array.map((val, idx) => {
                  const isSorted = currentStepDuelA.sorted?.includes(idx);
                  const heightPct = Math.max(10, Math.min(100, (val / 100) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-75 ${
                          isSorted ? 'bg-emerald-500' : isDarkMode ? 'bg-[#38bdf8]' : 'bg-[#203247]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden mt-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`${isDarkMode ? 'bg-[#38bdf8]' : 'bg-[#203247]'} h-full transition-all duration-75`}
                  style={{ width: `${((stepA + 1) / Math.max(1, duelTimelineA.length)) * 100}%` }}
                />
              </div>
            </div>

            {/* LANE B */}
            <div className={`duel-lane-card ${duelWinner === SORTING_ALGOS[duelAlgoB]?.name ? 'winner' : ''}`}>
              <div className="duel-lane-header">
                <div>
                  <h4 className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>{SORTING_ALGOS[duelAlgoB]?.name}</h4>
                  <span className={`font-mono text-[10px] font-semibold ${isDarkMode ? 'text-[#2dd4bf]' : 'text-teal-600'}`}>Avg: {SORTING_ALGOS[duelAlgoB]?.timeAvg}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="metric-badge amber">Comps: {currentStepDuelB.comparisons || 0}</span>
                  <span className="metric-badge teal">Swaps: {currentStepDuelB.swaps || 0}</span>
                </div>
              </div>

              {/* Lane B Bars */}
              <div className="duel-bars-stage">
                {currentStepDuelB.array.map((val, idx) => {
                  const isSorted = currentStepDuelB.sorted?.includes(idx);
                  const heightPct = Math.max(10, Math.min(100, (val / 100) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-75 ${
                          isSorted ? 'bg-emerald-500' : isDarkMode ? 'bg-[#2dd4bf]' : 'bg-teal-800'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden mt-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`${isDarkMode ? 'bg-[#2dd4bf]' : 'bg-teal-600'} h-full transition-all duration-75`}
                  style={{ width: `${((stepB + 1) / Math.max(1, duelTimelineB.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
