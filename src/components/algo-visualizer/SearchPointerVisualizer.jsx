import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, Search, 
  Sparkles, Droplets, Sliders, Volume2, VolumeX, Trophy
} from 'lucide-react';
import { soundEngine } from './soundEngine';

export const SearchPointerVisualizer = ({ onStepChange, onAlgoSelect, currentAlgoId = 'binary', isDarkMode = false }) => {
  const [subMode, setSubMode] = useState(currentAlgoId === 'twoPointers' ? 'twoPointers' : 'binary');
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  // Sync subMode when parent algorithm selection changes
  useEffect(() => {
    if (currentAlgoId === 'twoPointers') setSubMode('twoPointers');
    else if (currentAlgoId === 'binary') setSubMode('binary');
  }, [currentAlgoId]);

  useEffect(() => {
    if (onAlgoSelect) onAlgoSelect(subMode);
  }, [subMode]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // ==========================================
  // 1. BINARY SEARCH STATE & LOGIC
  // ==========================================
  const [sortedArray, setSortedArray] = useState([4, 9, 15, 21, 28, 33, 42, 49, 56, 63, 72, 80, 89, 95]);
  const [targetVal, setTargetVal] = useState(56);
  const [customArrayInput, setCustomArrayInput] = useState('');
  const [customTargetInput, setCustomTargetInput] = useState('56');
  const [binarySteps, setBinarySteps] = useState([]);
  const [bStepIdx, setBStepIdx] = useState(0);
  const [isBPlaying, setIsBPlaying] = useState(false);

  // Generate Binary Search Steps
  useEffect(() => {
    const steps = [];
    let low = 0;
    let high = sortedArray.length - 1;
    let found = false;

    steps.push({
      low,
      high,
      mid: Math.floor((low + high) / 2),
      status: 'init',
      eliminatedPct: 0,
      insight: `Search space: [0..${high}] for target ${targetVal}.`
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midVal = sortedArray[mid];
      const remaining = high - low + 1;
      const eliminatedPct = Math.round((1 - remaining / sortedArray.length) * 100);

      steps.push({
        low,
        high,
        mid,
        status: 'inspect',
        eliminatedPct,
        insight: `Mid at [${mid}] = ${midVal}. Comparing with target ${targetVal}.`
      });

      if (midVal === targetVal) {
        steps.push({
          low,
          high,
          mid,
          status: 'found',
          eliminatedPct: 100,
          insight: `🎯 Target ${targetVal} found at index [${mid}]!`
        });
        found = true;
        break;
      } else if (midVal < targetVal) {
        steps.push({
          low: mid + 1,
          high,
          mid,
          status: 'narrow-right',
          eliminatedPct: Math.round((1 - (high - (mid + 1) + 1) / sortedArray.length) * 100),
          insight: `${midVal} < ${targetVal}. Discarding left half [${low}..${mid}]. Low moves to ${mid + 1}.`
        });
        low = mid + 1;
      } else {
        steps.push({
          low,
          high: mid - 1,
          mid,
          status: 'narrow-left',
          eliminatedPct: Math.round((1 - ((mid - 1) - low + 1) / sortedArray.length) * 100),
          insight: `${midVal} > ${targetVal}. Discarding right half [${mid}..${high}]. High moves to ${mid - 1}.`
        });
        high = mid - 1;
      }
    }

    if (!found) {
      steps.push({
        low,
        high,
        mid: -1,
        status: 'not-found',
        eliminatedPct: 100,
        insight: `❌ Target ${targetVal} not found in array.`
      });
    }

    setBinarySteps(steps);
    setBStepIdx(0);
    setIsBPlaying(false);
  }, [targetVal, sortedArray]);

  // Binary search animation ticker
  useEffect(() => {
    if (!isBPlaying) return;
    const delayMs = Math.max(150, 800 / speedMultiplier);
    const timer = setTimeout(() => {
      if (bStepIdx < binarySteps.length - 1) {
        setBStepIdx(prev => prev + 1);
        soundEngine.playTone(30 + bStepIdx * 8, 10, 100, 60);
      } else {
        setIsBPlaying(false);
        soundEngine.playSuccessChime();
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isBPlaying, bStepIdx, binarySteps.length, speedMultiplier]);

  // Binary Search Handlers
  const handleGenerateRandomSorted = (size = 14) => {
    setIsBPlaying(false);
    const nums = new Set();
    while (nums.size < size) {
      nums.add(Math.floor(Math.random() * 92) + 6);
    }
    const sorted = Array.from(nums).sort((a, b) => a - b);
    setSortedArray(sorted);
    const newTarget = sorted[Math.floor(Math.random() * sorted.length)];
    setTargetVal(newTarget);
    setCustomTargetInput(String(newTarget));
  };

  const handleCustomArraySubmit = (e) => {
    e.preventDefault();
    const nums = customArrayInput
      .split(/[, ]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (nums.length >= 3) {
      setIsBPlaying(false);
      const sorted = Array.from(new Set(nums)).sort((a, b) => a - b).slice(0, 18);
      setSortedArray(sorted);
      setCustomArrayInput('');
      setShowCustomInput(false);
      if (!sorted.includes(targetVal)) {
        const midElement = sorted[Math.floor(sorted.length / 2)];
        setTargetVal(midElement);
        setCustomTargetInput(String(midElement));
      }
    }
  };

  const handleCustomTargetSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customTargetInput.trim(), 10);
    if (!isNaN(val)) {
      setIsBPlaying(false);
      setTargetVal(val);
    }
  };

  // ==========================================
  // 2. TWO POINTERS (CONTAINER WITH MOST WATER)
  // ==========================================
  const [heights, setHeights] = useState([1, 8, 6, 2, 5, 4, 8, 3, 7]);
  const [customHeightsInput, setCustomHeightsInput] = useState('');
  const [tpSteps, setTpSteps] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [tpStepIdx, setTpStepIdx] = useState(0);
  const [isTpPlaying, setIsTpPlaying] = useState(false);

  useEffect(() => {
    const steps = [];
    const milestones = [];
    let l = 0;
    let r = heights.length - 1;
    let maxArea = 0;
    let bestL = 0;
    let bestR = 0;

    steps.push({
      l, r,
      currentArea: 0,
      maxArea: 0,
      bestL: 0,
      bestR: 0,
      width: r - l,
      minHeight: Math.min(heights[0], heights[r]),
      isNewRecord: false,
      bottleneck: 'none',
      insight: `Start at boundaries: [${l}] (h=${heights[l]}) and [${r}] (h=${heights[r]}).`
    });

    while (l < r) {
      const hL = heights[l];
      const hR = heights[r];
      const w = r - l;
      const minH = Math.min(hL, hR);
      const area = w * minH;
      const isNewRecord = area > maxArea;

      if (isNewRecord) {
        maxArea = area;
        bestL = l;
        bestR = r;
        milestones.push({
          stepIdx: steps.length,
          l, r,
          w, minH,
          area,
          isPeak: false
        });
      }

      steps.push({
        l, r,
        currentArea: area,
        maxArea,
        bestL,
        bestR,
        width: w,
        minHeight: minH,
        isNewRecord,
        bottleneck: hL <= hR ? 'left' : 'right',
        insight: `[${l}, ${r}]: Width ${w} × Min-Height ${minH} = ${area} u². ${isNewRecord ? '🎉 New Record!' : ''}`
      });

      if (hL < hR) {
        steps.push({
          l: l + 1, r,
          currentArea: area,
          maxArea,
          bestL,
          bestR,
          width: w - 1,
          minHeight: Math.min(heights[l + 1], hR),
          isNewRecord: false,
          bottleneck: 'left',
          insight: `Left wall (${hL}) < Right wall (${hR}). Left is bottleneck ➔ Move Left inward (${l} ➔ ${l + 1}).`
        });
        l++;
      } else {
        steps.push({
          l, r: r - 1,
          currentArea: area,
          maxArea,
          bestL,
          bestR,
          width: w - 1,
          minHeight: Math.min(hL, heights[r - 1]),
          isNewRecord: false,
          bottleneck: 'right',
          insight: `Right wall (${hR}) ≤ Left wall (${hL}). Right is bottleneck ➔ Move Right inward (${r} ➔ ${r - 1}).`
        });
        r--;
      }
    }

    if (milestones.length > 0) {
      milestones[milestones.length - 1].isPeak = true;
    }

    steps.push({
      l: bestL, r: bestR,
      currentArea: maxArea,
      maxArea,
      bestL,
      bestR,
      width: bestR - bestL,
      minHeight: Math.min(heights[bestL], heights[bestR]),
      isNewRecord: false,
      bottleneck: 'none',
      insight: `🏆 Finished! Optimal container holds ${maxArea} u² between [${bestL}] and [${bestR}].`
    });

    setTpSteps(steps);
    setAllMilestones(milestones);
    setTpStepIdx(0);
    setIsTpPlaying(false);
  }, [heights]);

  // Two pointer animation ticker
  useEffect(() => {
    if (!isTpPlaying) return;
    const delayMs = Math.max(150, 750 / speedMultiplier);
    const timer = setTimeout(() => {
      if (tpStepIdx < tpSteps.length - 1) {
        setTpStepIdx(prev => prev + 1);
        soundEngine.playTone(25 + tpStepIdx * 6, 10, 100, 50);
      } else {
        setIsTpPlaying(false);
        soundEngine.playSuccessChime();
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isTpPlaying, tpStepIdx, tpSteps.length, speedMultiplier]);

  // Two Pointers Handlers
  const handleGenerateRandomHeights = (size = 9) => {
    setIsTpPlaying(false);
    const newHeights = Array.from({ length: size }, () => Math.floor(Math.random() * 9) + 1);
    setHeights(newHeights);
    setShowCustomInput(false);
  };

  const handleCustomHeightsSubmit = (e) => {
    e.preventDefault();
    const nums = customHeightsInput
      .split(/[, ]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    if (nums.length >= 3) {
      setIsTpPlaying(false);
      setHeights(nums.slice(0, 14));
      setCustomHeightsInput('');
      setShowCustomInput(false);
    }
  };

  // Tactile Direct Manipulation: Click any pillar to adjust its height!
  const handlePillarClick = (idx) => {
    setIsTpPlaying(false);
    setHeights(prev => {
      const next = [...prev];
      next[idx] = next[idx] >= 9 ? 1 : next[idx] + 1;
      return next;
    });
    soundEngine.playTone(heights[idx] * 10, 10, 90, 60);
  };

  // Keyboard Navigation Support (Space to Play/Pause, Left/Right to Step)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (subMode === 'binary') setIsBPlaying(p => !p);
        else setIsTpPlaying(p => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (subMode === 'binary') {
          setIsBPlaying(false);
          setBStepIdx(prev => Math.min(binarySteps.length - 1, prev + 1));
        } else {
          setIsTpPlaying(false);
          setTpStepIdx(prev => Math.min(tpSteps.length - 1, prev + 1));
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (subMode === 'binary') {
          setIsBPlaying(false);
          setBStepIdx(prev => Math.max(0, prev - 1));
        } else {
          setIsTpPlaying(false);
          setTpStepIdx(prev => Math.max(0, prev - 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subMode, binarySteps.length, tpSteps.length]);

  // Sync active step to parent
  useEffect(() => {
    if (subMode === 'binary' && binarySteps[bStepIdx] && onStepChange) {
      onStepChange({
        ...binarySteps[bStepIdx],
        title: 'Binary Search',
        line: binarySteps[bStepIdx].status === 'found' ? 8 : 4
      });
    } else if (subMode === 'twoPointers' && tpSteps[tpStepIdx] && onStepChange) {
      onStepChange({
        ...tpSteps[tpStepIdx],
        title: 'Two Pointers (Container With Most Water)',
        line: 5
      });
    }
  }, [subMode, bStepIdx, tpStepIdx, binarySteps, tpSteps]);

  const currentBStep = binarySteps[bStepIdx] || { low: 0, high: sortedArray.length - 1, mid: 0, insight: '', eliminatedPct: 0 };
  const currentTpStep = tpSteps[tpStepIdx] || { 
    l: 0, r: heights.length - 1, currentArea: 0, maxArea: 0, 
    bestL: 0, bestR: heights.length - 1, width: 0, minHeight: 0,
    insight: '', isNewRecord: false, bottleneck: 'none' 
  };
  const maxH = Math.max(...heights, 1);

  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-2">
      {/* ========================================================= */}
      {/* 1. ULTRA-MINIMAL TOP CONTROLS RIBBON                      */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#203247]/10 shrink-0">
        
        {/* SUBMODE TABS */}
        <div className="flex items-center gap-1 shrink-0">
          {[
            { id: 'binary', label: 'Binary Search', icon: Search },
            { id: 'twoPointers', label: 'Two Pointers', icon: Droplets }
          ].map(item => {
            const Icon = item.icon;
            const isSelected = subMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setSubMode(item.id); setShowCustomInput(false); }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#347f7a] text-white border-[#347f7a]'
                    : 'bg-transparent text-[#526b88] border-transparent hover:bg-slate-100'
                }`}
              >
                <Icon size={12} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* DATASET PRESET CHIPS */}
        <div className="flex items-center gap-1 text-xs">
          {subMode === 'twoPointers' ? (
            <>
              <button
                onClick={() => { setHeights([1, 8, 6, 2, 5, 4, 8, 3, 7]); setShowCustomInput(false); }}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Classic
              </button>
              <button
                onClick={() => { setHeights([8, 2, 3, 1, 2, 4, 1, 3, 9]); setShowCustomInput(false); }}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Valley
              </button>
              <button
                onClick={() => { setHeights([1, 3, 5, 8, 9, 8, 5, 3, 1]); setShowCustomInput(false); }}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Mountain
              </button>
              <button
                onClick={() => handleGenerateRandomHeights(9)}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Random
              </button>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold cursor-pointer flex items-center gap-1 ${
                  showCustomInput
                    ? 'bg-[#203247] text-white border-[#203247]'
                    : 'bg-[#faf8f4] border-[#203247]/10 text-[#526b88] hover:bg-slate-100'
                }`}
              >
                <Sliders size={10} />
                <span>Custom</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { handleGenerateRandomSorted(14); setShowCustomInput(false); }}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Random (14)
              </button>
              <button
                onClick={() => { setSortedArray([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]); setTargetVal(70); setCustomTargetInput('70'); setShowCustomInput(false); }}
                className="px-2 py-0.5 rounded-md bg-[#faf8f4] border border-[#203247]/10 text-[11px] text-[#203247] hover:bg-slate-100 cursor-pointer"
              >
                Dense (10)
              </button>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold cursor-pointer flex items-center gap-1 ${
                  showCustomInput
                    ? 'bg-[#203247] text-white border-[#203247]'
                    : 'bg-[#faf8f4] border-[#203247]/10 text-[#526b88] hover:bg-slate-100'
                }`}
              >
                <Sliders size={10} />
                <span>Custom</span>
              </button>
            </>
          )}
        </div>

        {/* RIGHT: RECORD BADGE OR TARGET SEARCH */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {subMode === 'binary' ? (
            <form onSubmit={handleCustomTargetSubmit} className="flex items-center gap-1 bg-[#faf8f4] px-2 py-0.5 rounded-lg border border-[#203247]/10">
              <span className="font-mono text-[10px] text-[#647895] font-bold">Target:</span>
              <input
                type="number"
                value={customTargetInput}
                onChange={e => setCustomTargetInput(e.target.value)}
                className="w-12 px-1 py-0.5 rounded border border-[#203247]/15 bg-white text-xs outline-none focus:border-[#347f7a] font-mono font-bold text-center"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-[#203247] text-white font-semibold text-[10px] cursor-pointer border-none hover:bg-[#347f7a]"
              >
                Search
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
              <Trophy size={12} className="text-amber-500 fill-amber-400" />
              <span>Record: <span className="text-emerald-700">{currentTpStep.maxArea || 0}</span> u²</span>
            </div>
          )}
        </div>
      </div>

      {/* COMPACT CUSTOM INPUT FORM (SLIDES IN ONLY WHEN TOGGLED) */}
      {showCustomInput && (
        <form
          onSubmit={subMode === 'twoPointers' ? handleCustomHeightsSubmit : handleCustomArraySubmit}
          className="flex items-center gap-2 p-2 px-3 bg-white rounded-xl border border-[#203247]/10 shadow-2xs shrink-0"
        >
          <span className="font-mono text-[11px] text-[#647895] font-semibold">
            {subMode === 'twoPointers' ? 'Heights:' : 'Numbers:'}
          </span>
          <input
            type="text"
            placeholder={subMode === 'twoPointers' ? "e.g. 1, 8, 6, 2, 5, 4, 8, 3, 7" : "e.g. 4, 9, 15, 28, 42, 56..."}
            value={subMode === 'twoPointers' ? customHeightsInput : customArrayInput}
            onChange={e => subMode === 'twoPointers' ? setCustomHeightsInput(e.target.value) : setCustomArrayInput(e.target.value)}
            className="flex-1 px-2.5 py-0.5 rounded border border-[#203247]/15 bg-[#faf8f4] text-xs font-mono outline-none focus:border-[#347f7a]"
          />
          <button
            type="submit"
            className="px-3 py-0.5 rounded bg-[#203247] text-white font-semibold text-xs cursor-pointer border-none hover:bg-[#347f7a]"
          >
            Apply
          </button>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. TWO POINTERS WATER VISUALIZER (CLEAN & MINIMAL)        */}
      {/* ========================================================= */}
      {subMode === 'twoPointers' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#faf8f4] rounded-2xl border border-[#203247]/10 shadow-2xs overflow-hidden">
          
          {/* TEACHER INSIGHT HEADER STRIP */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[#203247]/10 bg-white/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`p-1 rounded-md shrink-0 ${
                currentTpStep.isNewRecord
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-[#347f7a]/10 text-[#347f7a]'
              }`}>
                {currentTpStep.isNewRecord ? <Sparkles size={13} /> : <Droplets size={13} />}
              </span>
              <span className={`text-xs truncate ${
                currentTpStep.isNewRecord
                  ? 'text-emerald-800 font-bold'
                  : 'text-[#203247] font-medium'
              }`}>
                {currentTpStep.insight}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#526b88] text-[11px] font-mono shrink-0">
              <span className="text-emerald-700 font-semibold">L=[{currentTpStep.l}]</span>
              <span className="opacity-40">|</span>
              <span className="text-[#0891b2] font-semibold">R=[{currentTpStep.r}]</span>
            </div>
          </div>

          {/* CLEAN WATER & PILLARS STAGE */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden">
            <svg
              viewBox="0 0 1000 400"
              className="w-full h-full max-h-[360px] select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Fluid Water Gradient */}
                <linearGradient id="tpWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.92" />
                </linearGradient>

                {/* Best Container Ghost Gradient */}
                <linearGradient id="tpBestWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
                </linearGradient>

                {/* Hover Milestone Preview Gradient */}
                <linearGradient id="tpHoverWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.06" />
                </linearGradient>

                {/* Pillar Left Gradient (Emerald) */}
                <linearGradient id="pillarLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Pillar Right Gradient (Cyan) */}
                <linearGradient id="pillarRight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                {/* Standard Pillar */}
                <linearGradient id="pillarStandard" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDarkMode ? '#38bdf8' : '#203247'} stopOpacity={isDarkMode ? '0.35' : '1'} />
                  <stop offset="100%" stopColor={isDarkMode ? '#0284c7' : '#334155'} stopOpacity={isDarkMode ? '0.6' : '1'} />
                </linearGradient>
              </defs>

              {/* CLEAN GLASS TANK FRAME */}
              <rect
                x="45"
                y="35"
                width="910"
                height="325"
                rx="14"
                fill={isDarkMode ? 'rgba(30, 41, 59, 0.45)' : '#ffffff'}
                fillOpacity={isDarkMode ? '1' : '0.5'}
                stroke={isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(32, 50, 71, 0.08)'}
                strokeWidth="1.2"
              />

              {/* ========================================================= */}
              {/* INTERACTIVE "LAST MAX HISTORY" GHOST (WITH HOVER PREVIEW)  */}
              {/* ========================================================= */}
              {(() => {
                const targetRecord = hoveredMilestone || (currentTpStep.maxArea > 0 ? {
                  l: currentTpStep.bestL,
                  r: currentTpStep.bestR,
                  area: currentTpStep.maxArea,
                  isHover: false
                } : null);

                if (!targetRecord) return null;

                const bL = targetRecord.l;
                const bR = targetRecord.r;
                const padX = 75;
                const xBL = padX + (bL * (1000 - 2 * padX)) / Math.max(1, heights.length - 1);
                const xBR = padX + (bR * (1000 - 2 * padX)) / Math.max(1, heights.length - 1);
                const bMinH = Math.min(heights[bL], heights[bR]);
                const yB = 360 - (bMinH / maxH) * 270;
                const isCurrentRecord = currentTpStep.l === bL && currentTpStep.r === bR && !hoveredMilestone;
                const ghostW = xBR - xBL;
                const ghostH = 360 - yB;
                const isHoverPreview = Boolean(hoveredMilestone);

                return (
                  <g className="transition-all duration-200">
                    <rect
                      x={xBL}
                      y={yB}
                      width={ghostW}
                      height={ghostH}
                      fill={isCurrentRecord ? "none" : isHoverPreview ? "url(#tpHoverWaterGradient)" : "url(#tpBestWaterGradient)"}
                      stroke={isHoverPreview ? "#f59e0b" : "#10b981"}
                      strokeWidth={isCurrentRecord ? "2" : "1.5"}
                      strokeDasharray={isCurrentRecord ? "none" : "5 4"}
                      rx="6"
                    />

                    {/* Watermark Tag */}
                    {!isCurrentRecord && (
                      <g transform={`translate(${xBL + ghostW / 2}, ${yB + 14})`}>
                        <rect
                          x="-45"
                          y="-9"
                          width="90"
                          height="18"
                          rx="5"
                          fill="#ffffff"
                          fillOpacity="0.92"
                          stroke={isHoverPreview ? "#f59e0b" : "#10b981"}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill={isHoverPreview ? "#b45309" : "#065f46"}
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {isHoverPreview ? `Preview: ${targetRecord.area} u²` : `Record: ${targetRecord.area} u²`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* ACTIVE WATER BODY RESERVOIR                               */}
              {/* ========================================================= */}
              {currentTpStep.l < currentTpStep.r && (() => {
                const curL = currentTpStep.l;
                const curR = currentTpStep.r;
                const padX = 75;
                const xL = padX + (curL * (1000 - 2 * padX)) / Math.max(1, heights.length - 1);
                const xR = padX + (curR * (1000 - 2 * padX)) / Math.max(1, heights.length - 1);
                const minH = Math.min(heights[curL], heights[curR]);
                const yWater = 360 - (minH / maxH) * 270;
                const waterW = xR - xL;
                const waterH = 360 - yWater;

                return (
                  <g className="transition-all duration-150">
                    <rect
                      x={xL}
                      y={yWater}
                      width={waterW}
                      height={waterH}
                      fill="url(#tpWaterGradient)"
                      rx="5"
                    />
                    <line x1={xL} y1={yWater} x2={xR} y2={yWater} stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Area Badge Inside Active Water */}
                    {waterW > 55 && (
                      <g transform={`translate(${xL + waterW / 2}, ${yWater + waterH / 2})`}>
                        <rect
                          x="-32"
                          y="-9"
                          width="64"
                          height="18"
                          rx="5"
                          fill={isDarkMode ? '#0f172a' : '#ffffff'}
                          fillOpacity="0.95"
                          stroke={isDarkMode ? '#38bdf8' : 'rgba(2, 132, 199, 0.25)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill={isDarkMode ? '#38bdf8' : '#0369a1'}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {currentTpStep.currentArea} u²
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* ========================================================= */}
              {/* DIRECT-MANIPULATION PILLARS & POINTERS                    */}
              {/* ========================================================= */}
              {heights.map((h, idx) => {
                const padX = 75;
                const cx = padX + (idx * (1000 - 2 * padX)) / Math.max(1, heights.length - 1);
                const py = 360 - (h / maxH) * 270;
                const ph = 360 - py;
                const isL = idx === currentTpStep.l;
                const isR = idx === currentTpStep.r;
                const isBest = (idx === currentTpStep.bestL || idx === currentTpStep.bestR) && currentTpStep.maxArea > 0;
                const isShorter = (isL && heights[currentTpStep.l] <= heights[currentTpStep.r]) || (isR && heights[currentTpStep.r] < heights[currentTpStep.l]);

                return (
                  <g
                    key={idx}
                    onClick={() => handlePillarClick(idx)}
                    className="cursor-pointer group"
                  >
                    <title>{`Click to increase height (current: ${h})`}</title>

                    {/* Pillar Body */}
                    <rect
                      x={cx - 11}
                      y={py}
                      width="22"
                      height={ph}
                      rx="5"
                      fill={
                        isL
                          ? 'url(#pillarLeft)'
                          : isR
                          ? 'url(#pillarRight)'
                          : isBest
                          ? (isDarkMode ? '#38bdf8' : '#0f172a')
                          : 'url(#pillarStandard)'
                      }
                      opacity={isL || isR || isBest ? '1' : '0.55'}
                      stroke={isShorter ? '#f59e0b' : 'none'}
                      strokeWidth={isShorter ? '2' : '0'}
                      className="transition-all duration-150 group-hover:brightness-110"
                    />

                    {/* Minimal Overhead Pointer Badge */}
                    {isL && (
                      <g transform={`translate(${cx}, ${Math.max(16, py - 20)})`}>
                        <rect x="-11" y="-10" width="22" height="16" rx="4" fill="#10b981" />
                        <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                          L
                        </text>
                        {isShorter && (
                          <circle cx="9" cy="-7" r="3" fill="#f59e0b" />
                        )}
                      </g>
                    )}

                    {isR && (
                      <g transform={`translate(${cx}, ${Math.max(16, py - 20)})`}>
                        <rect x="-11" y="-10" width="22" height="16" rx="4" fill="#06b6d4" />
                        <text x="0" y="2" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                          R
                        </text>
                        {isShorter && (
                          <circle cx="-9" cy="-7" r="3" fill="#f59e0b" />
                        )}
                      </g>
                    )}

                    {/* Height Value */}
                    <text
                      x={cx}
                      y={py - 5}
                      textAnchor="middle"
                      fill={isDarkMode ? '#e2e8f0' : '#203247'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {h}
                    </text>

                    {/* Index Label */}
                    <text
                      x={cx}
                      y="380"
                      textAnchor="middle"
                      fill={isL ? '#059669' : isR ? '#0891b2' : isDarkMode ? '#94a3b8' : '#647895'}
                      fontSize="9.5"
                      fontWeight={isL || isR ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      [{idx}]
                    </text>
                  </g>
                );
              })}

              {/* FLOOR LINE */}
              <line x1="30" y1="360" x2="970" y2="360" stroke={isDarkMode ? '#475569' : '#203247'} strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE "LAST MAX HISTORY" STRIP (WITH HOVER PREVIEW) */}
          {/* ========================================================= */}
          {allMilestones.length > 0 && (
            <div className="px-4 py-1.5 bg-white/70 border-t border-[#203247]/10 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="font-mono text-[10px] text-[#647895] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Trophy size={11} className="text-amber-500 fill-amber-400" /> Max History:
                </span>
                {allMilestones.map((m, idx) => {
                  const isUnlocked = tpStepIdx >= m.stepIdx;
                  const isSelected = currentTpStep.bestL === m.l && currentTpStep.bestR === m.r && isUnlocked;

                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setHoveredMilestone(m)}
                      onMouseLeave={() => setHoveredMilestone(null)}
                      onClick={() => {
                        setIsTpPlaying(false);
                        setTpStepIdx(m.stepIdx);
                        soundEngine.playTone(35 + idx * 8, 10, 100, 50);
                      }}
                      title={`Jump to record [${m.l}, ${m.r}] = ${m.area} u² (Hover to preview)`}
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-semibold transition-all cursor-pointer border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#10b981] text-white border-[#059669] shadow-xs'
                          : isUnlocked
                          ? 'bg-white text-[#203247] border-[#203247]/15 hover:border-[#10b981]'
                          : 'bg-white/40 text-[#94a3b8] border-slate-200 opacity-50'
                      }`}
                    >
                      <span>{m.area} u²</span>
                      {m.isPeak && <span className="text-amber-300">★</span>}
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] text-[#647895] font-mono shrink-0 hidden md:inline">
                Click pillar to change height • Space to play
              </span>
            </div>
          )}

          {/* ========================================================= */}
          {/* MINIMAL PLAYBACK BAR WITH SCRUBBER & AUDIO TOGGLE         */}
          {/* ========================================================= */}
          <div className="algo-playback-bar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { setIsTpPlaying(false); setTpStepIdx(0); }}
                disabled={tpStepIdx === 0}
                className="algo-ctrl-btn"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { setIsTpPlaying(false); setTpStepIdx(prev => Math.max(0, prev - 1)); }}
                disabled={tpStepIdx === 0}
                className="algo-ctrl-btn"
                title="Step Backward (Left Arrow)"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsTpPlaying(!isTpPlaying)}
                className="algo-ctrl-btn primary px-4"
                title="Play/Pause (Space)"
              >
                {isTpPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isTpPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setIsTpPlaying(false); setTpStepIdx(prev => Math.min(tpSteps.length - 1, prev + 1)); }}
                disabled={tpStepIdx >= tpSteps.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward (Right Arrow)"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* TIMELINE SCRUBBER */}
            <div className="flex-1 max-w-xs mx-3 hidden sm:flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, tpSteps.length - 1)}
                value={tpStepIdx}
                onChange={e => {
                  setIsTpPlaying(false);
                  setTpStepIdx(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider w-full"
                title="Scrub steps"
              />
            </div>

            {/* RIGHT: AUDIO, STEP COUNTER & SPEED */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-[#203247]/15 text-[#347f7a] hover:bg-slate-50'
                }`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <span className="text-[11px] font-mono text-[#526b88]">
                {tpStepIdx + 1}/{tpSteps.length}
              </span>

              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-[#203247]/10">
                {[1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold cursor-pointer border-none transition-all ${
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

      {/* ========================================================= */}
      {/* 3. BINARY SEARCH VISUALIZER (CLEAN & MINIMAL)              */}
      {/* ========================================================= */}
      {subMode === 'binary' && (
        <div className="flex-1 min-h-0 flex flex-col bg-[#faf8f4] rounded-2xl border border-[#203247]/10 shadow-2xs overflow-hidden">
          
          {/* TEACHER INSIGHT HEADER STRIP */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[#203247]/10 bg-white/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`p-1 rounded-md shrink-0 ${
                currentBStep.status === 'found'
                  ? 'bg-emerald-100 text-emerald-700'
                  : currentBStep.status === 'not-found'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-[#347f7a]/10 text-[#347f7a]'
              }`}>
                {currentBStep.status === 'found' ? (
                  <Sparkles size={13} />
                ) : (
                  <Search size={13} />
                )}
              </span>
              <span className={`text-xs truncate ${
                currentBStep.status === 'found'
                  ? 'text-emerald-800 font-bold'
                  : currentBStep.status === 'not-found'
                  ? 'text-rose-700 font-semibold'
                  : 'text-[#203247] font-medium'
              }`}>
                {currentBStep.insight}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[10.5px] font-mono font-bold shrink-0">
              <span>Pruned: {currentBStep.eliminatedPct || 0}%</span>
            </div>
          </div>

          {/* ARRAY BLOCKS DISPLAY WITH SLIDING BRACKET */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 overflow-x-auto">
            <div className="flex items-end gap-2">
              {sortedArray.map((val, idx) => {
                const isLow = idx === currentBStep.low;
                const isHigh = idx === currentBStep.high;
                const isMid = idx === currentBStep.mid;
                const isFound = currentBStep.status === 'found' && isMid;
                const isEliminated = idx < currentBStep.low || idx > currentBStep.high;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* POINTER BADGE */}
                    <div className="h-6 flex items-center justify-center gap-1 mb-1">
                      {isMid && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-mono font-bold text-[9.5px]">
                          MID
                        </span>
                      )}
                      {isLow && (
                        <span className="px-1 py-0.2 rounded bg-emerald-600 text-white font-mono font-bold text-[9.5px]">
                          L
                        </span>
                      )}
                      {isHigh && (
                        <span className="px-1 py-0.2 rounded bg-[#347f7a] text-white font-mono font-bold text-[9.5px]">
                          R
                        </span>
                      )}
                    </div>

                    {/* CELL BUTTON */}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetVal(val);
                        setCustomTargetInput(String(val));
                      }}
                      title={`Search for ${val}`}
                      className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                        isFound
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105 font-bold'
                          : isMid
                          ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold'
                          : isEliminated
                          ? 'bg-white/40 border-slate-200 text-slate-400 opacity-25'
                          : 'bg-white border-[#203247]/15 text-[#203247] shadow-2xs hover:border-[#347f7a]'
                      }`}
                    >
                      <span className="font-mono font-bold text-xs">{val}</span>
                      <span className="font-mono text-[8.5px] opacity-60">[{idx}]</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SLIDING ACTIVE RANGE TRACK */}
            {currentBStep.low <= currentBStep.high && (
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                <span>Active Search Window: [{currentBStep.low} .. {currentBStep.high}]</span>
                <span className="opacity-40">•</span>
                <span>{currentBStep.high - currentBStep.low + 1} elements</span>
              </div>
            )}

            <span className="text-[10px] text-[#647895] font-mono mt-3 opacity-70">
              Click any tile to search • Space to play
            </span>
          </div>

          {/* PLAYBACK BAR */}
          <div className="algo-playback-bar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => { setIsBPlaying(false); setBStepIdx(0); }}
                disabled={bStepIdx === 0}
                className="algo-ctrl-btn"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => { setIsBPlaying(false); setBStepIdx(prev => Math.max(0, prev - 1)); }}
                disabled={bStepIdx === 0}
                className="algo-ctrl-btn"
                title="Step Backward (Left Arrow)"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={() => setIsBPlaying(!isBPlaying)}
                className="algo-ctrl-btn primary px-4"
                title="Play/Pause (Space)"
              >
                {isBPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isBPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setIsBPlaying(false); setBStepIdx(prev => Math.min(binarySteps.length - 1, prev + 1)); }}
                disabled={bStepIdx >= binarySteps.length - 1}
                className="algo-ctrl-btn"
                title="Step Forward (Right Arrow)"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* SCRUBBER SLIDER */}
            <div className="flex-1 max-w-xs mx-3 hidden sm:flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, binarySteps.length - 1)}
                value={bStepIdx}
                onChange={e => {
                  setIsBPlaying(false);
                  setBStepIdx(parseInt(e.target.value, 10));
                }}
                className="algo-scrub-slider w-full"
                title="Scrub steps"
              />
            </div>

            {/* RIGHT: AUDIO, STEP COUNTER & SPEED */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-[#203247]/15 text-[#347f7a] hover:bg-slate-50'
                }`}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <span className="text-[11px] font-mono text-[#526b88]">
                {bStepIdx + 1}/{binarySteps.length}
              </span>

              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-[#203247]/10">
                {[1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold cursor-pointer border-none transition-all ${
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
    </div>
  );
};
