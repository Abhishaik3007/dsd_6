import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Sparkles, Hash, ArrowRight, Layers, Cpu, Activity, Info, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HashTableVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  const BUCKET_COUNT = 7;
  const [buckets, setBuckets] = useState([
    [{ key: '14', val: 14, addr: '0x5008' }, { key: '21', val: 21, addr: '0x5024' }], // index 0 (collision)
    [{ key: '15', val: 15, addr: '0x5010' }],                                         // index 1
    [{ key: '30', val: 30, addr: '0x5018' }],                                         // index 2
    [],                                                                               // index 3
    [{ key: '18', val: 18, addr: '0x5020' }],                                         // index 4
    [{ key: '26', val: 26, addr: '0x502C' }],                                         // index 5
    [{ key: '41', val: 41, addr: '0x5038' }],                                         // index 6
  ]);

  const [activeBucketIdx, setActiveBucketIdx] = useState(null);
  const [activeChainIdx, setActiveChainIdx] = useState(null);
  const [activeCalculation, setActiveCalculation] = useState(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [animStatus, setAnimStatus] = useState(null);
  const [isShake, setIsShake] = useState(false);

  // Step playback state
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animIntervalRef = useRef(null);
  const bucketRefs = useRef({});
  const nodeRefs = useRef({});

  // Stats calculation
  const totalElements = buckets.reduce((acc, b) => acc + b.length, 0);
  const loadFactor = (totalElements / BUCKET_COUNT).toFixed(2);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, []);

  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.buckets) setBuckets(step.buckets);
    if (step.activeBucketIdx !== undefined) {
      setActiveBucketIdx(step.activeBucketIdx);
      if (step.activeBucketIdx !== null && bucketRefs.current[step.activeBucketIdx]) {
        bucketRefs.current[step.activeBucketIdx].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
    if (step.activeChainIdx !== undefined) {
      setActiveChainIdx(step.activeChainIdx);
      if (step.activeBucketIdx !== null && step.activeChainIdx !== null) {
        const nodeEl = nodeRefs.current[`${step.activeBucketIdx}-${step.activeChainIdx}`];
        if (nodeEl) {
          nodeEl.scrollIntoView({
            behavior: 'smooth',
            inline: 'nearest',
            block: 'nearest'
          });
        }
      }
    }
    if (step.activeCalculation !== undefined) setActiveCalculation(step.activeCalculation);
    if (step.status) setAnimStatus(step.status);

    if (typeof onStepUpdate === 'function') {
      onStepUpdate({
        currentStep: idx,
        totalSteps: stepsHistoryRef.current.length,
        isPlaying: isPlayingRef.current
      });
    }
  };

  useEffect(() => {
    if (!stepCommand) return;
    const { action } = stepCommand;

    if (action === 'first') {
      isPlayingRef.current = false;
      applyStepSnapshot(0);
    } else if (action === 'prev') {
      isPlayingRef.current = false;
      applyStepSnapshot(currentStepRef.current - 1);
    } else if (action === 'next') {
      isPlayingRef.current = false;
      applyStepSnapshot(currentStepRef.current + 1);
    } else if (action === 'last') {
      isPlayingRef.current = false;
      applyStepSnapshot(stepsHistoryRef.current.length - 1);
    } else if (action === 'toggle-play') {
      isPlayingRef.current = !isPlayingRef.current;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: isPlayingRef.current });
      }
    }
  }, [stepCommand]);

  // Sync external operations from CSVisualizerLab panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val, pos } = externalOp;
    const keyStr = String(val !== undefined && val !== null && val !== '' ? val : '25');
    const valStr = String(pos !== undefined && pos !== null && pos !== '' ? pos : keyStr);

    if (type === 'hash-insert' || type === 'hash-set' || type === 'insert-node' || type === 'push' || type === 'insert-pos') {
      executeInsert(keyStr, valStr);
    } else if (type === 'hash-search' || type === 'search') {
      executeSearch(keyStr);
    } else if (type === 'hash-delete' || type === 'delete-node' || type === 'delete-pos') {
      executeDelete(keyStr);
    } else if (type === 'clear') {
      handleClearHashTable();
    }
  }, [externalOp]);

  // Hash function calculation breakdown
  const computeHash = (key) => {
    const num = parseInt(key);
    if (!isNaN(num)) {
      const hash = Math.abs(num) % BUCKET_COUNT;
      return {
        key,
        hash,
        formulaStr: `${key} % ${BUCKET_COUNT} = Index [${hash}]`,
        stepsDetail: [
          { title: '1. Key Input', val: `"${key}"` },
          { title: '2. Integer Value', val: `${num}` },
          { title: '3. Modulo Math', val: `${num} % ${BUCKET_COUNT}` },
          { title: '4. Target Slot', val: `Index [${hash}]` }
        ],
        rawSum: null
      };
    }
    let sum = 0;
    const charCodes = [];
    for (let i = 0; i < key.length; i++) {
      const code = key.charCodeAt(i);
      sum += code;
      charCodes.push(`${key[i]}:${code}`);
    }
    const hash = sum % BUCKET_COUNT;
    return {
      key,
      hash,
      formulaStr: `ASCII Sum (${sum}) % ${BUCKET_COUNT} = Index [${hash}]`,
      stepsDetail: [
        { title: '1. Key Input', val: `"${key}"` },
        { title: '2. ASCII Sum', val: charCodes.join(' + ') },
        { title: '3. Modulo Math', val: `${sum} % ${BUCKET_COUNT}` },
        { title: '4. Target Slot', val: `Index [${hash}]` }
      ],
      rawSum: sum
    };
  };

  // Execute Insert
  const executeInsert = (key, val) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const calcObj = computeHash(key);
    const steps = [];

    // Stage 1: Engine Input Processing
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: null,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 1 },
      status: `Step 1: Hash Function Engine initialized with Input Key "${key}".`
    });

    // Stage 2: Modulo Arithmetic Evaluation
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: null,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 2 },
      status: `Step 2: Evaluating Hash Formula (${calcObj.formulaStr}). Calculated Index: [${calcObj.hash}].`
    });

    // Stage 3: Locating Target Bucket in RAM
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: calcObj.hash,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 3 },
      status: `Step 3: Hash Calculation complete! Addressing Target Bucket Slot [${calcObj.hash}] at 0x${5000 + calcObj.hash * 8}.`
    });

    const targetBucket = [...buckets[calcObj.hash]];
    const existingIdx = targetBucket.findIndex(item => item.key === key);

    // Stage 4: Traversal of Collision Chain if exists
    if (targetBucket.length > 0) {
      for (let cIdx = 0; cIdx < targetBucket.length; cIdx++) {
        steps.push({
          buckets: [...buckets],
          activeBucketIdx: calcObj.hash,
          activeChainIdx: cIdx,
          activeCalculation: { ...calcObj, activeStage: 3 },
          status: `Step 4: Inspecting collision chain node [${cIdx}] (Key: "${targetBucket[cIdx].key}").`
        });
        if (targetBucket[cIdx].key === key) break;
      }
    }

    // Stage 5: Store & Node Allocation
    const newAddress = `0x${Math.floor(0x5000 + Math.random() * 0x0ffe).toString(16).toUpperCase()}`;
    if (existingIdx !== -1) {
      targetBucket[existingIdx] = { key, val, addr: targetBucket[existingIdx].addr };
      steps.push({
        buckets: buckets.map((b, i) => i === calcObj.hash ? targetBucket : b),
        activeBucketIdx: calcObj.hash,
        activeChainIdx: existingIdx,
        activeCalculation: { ...calcObj, activeStage: 3 },
        status: `Step 5: Key "${key}" already exists in chain [${existingIdx}]. Updated stored value to "${val}".`
      });
    } else {
      targetBucket.push({ key, val, addr: newAddress });
      steps.push({
        buckets: buckets.map((b, i) => i === calcObj.hash ? targetBucket : b),
        activeBucketIdx: calcObj.hash,
        activeChainIdx: targetBucket.length - 1,
        activeCalculation: { ...calcObj, activeStage: 3 },
        status: `Step 5: 🎉 Appended Key-Value pair ("${key}": ${val}) at RAM ${newAddress} into Bucket [${calcObj.hash}] chain.`
      });
    }

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    animIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animIntervalRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animIntervalRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 650 / playbackSpeed);
  };

  // Execute Search
  const executeSearch = (key) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const calcObj = computeHash(key);
    const steps = [];

    // Stage 1: Engine Input
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: null,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 1 },
      status: `Step 1: Processing Search Key "${key}" in Hash Engine.`
    });

    // Stage 2: Modulo Evaluation
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: null,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 2 },
      status: `Step 2: Evaluating Hash Formula (${calcObj.formulaStr}). Calculated Index: [${calcObj.hash}].`
    });

    // Stage 3: Bucket Lookup
    steps.push({
      buckets: [...buckets],
      activeBucketIdx: calcObj.hash,
      activeChainIdx: null,
      activeCalculation: { ...calcObj, activeStage: 3 },
      status: `Step 3: Accessing Bucket Slot [${calcObj.hash}] at address 0x${5000 + calcObj.hash * 8}...`
    });

    const chain = buckets[calcObj.hash];
    let found = false;

    for (let cIdx = 0; cIdx < chain.length; cIdx++) {
      steps.push({
        buckets: [...buckets],
        activeBucketIdx: calcObj.hash,
        activeChainIdx: cIdx,
        activeCalculation: { ...calcObj, activeStage: 3 },
        status: `Step 4: Inspecting chain node [${cIdx}] with key "${chain[cIdx].key}"...`
      });

      if (chain[cIdx].key === key) {
        found = true;
        steps.push({
          buckets: [...buckets],
          activeBucketIdx: calcObj.hash,
          activeChainIdx: cIdx,
          activeCalculation: { ...calcObj, activeStage: 3 },
          status: `🎯 SUCCESS: Found Key "${key}" in Bucket [${calcObj.hash}] at chain position [${cIdx}]!`
        });
        break;
      }
    }

    if (!found) {
      steps.push({
        buckets: [...buckets],
        activeBucketIdx: calcObj.hash,
        activeChainIdx: null,
        activeCalculation: { ...calcObj, activeStage: 3 },
        status: `❌ Key "${key}" not found in Bucket [${calcObj.hash}] chain.`
      });
    }

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);

    let idx = 0;
    isPlayingRef.current = true;
    if (typeof onStepUpdate === 'function') {
      onStepUpdate({ isPlaying: true });
    }

    animIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) {
        clearInterval(animIntervalRef.current);
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
        return;
      }
      idx++;
      if (idx < steps.length) {
        applyStepSnapshot(idx);
      } else {
        clearInterval(animIntervalRef.current);
        isPlayingRef.current = false;
        if (typeof onStepUpdate === 'function') {
          onStepUpdate({ isPlaying: false });
        }
      }
    }, 650 / playbackSpeed);
  };

  // Execute Delete
  const executeDelete = (key) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const calcObj = computeHash(key);
    const steps = [];

    const newBuckets = buckets.map((b, i) => i === calcObj.hash ? b.filter(item => item.key !== key) : b);

    steps.push({
      buckets: newBuckets,
      activeBucketIdx: calcObj.hash,
      activeChainIdx: null,
      activeCalculation: calcObj,
      status: `Deleted Key "${key}" from Bucket [${calcObj.hash}] chain.`
    });

    stepsHistoryRef.current = steps;
    applyStepSnapshot(0);
  };

  const handleClearHashTable = () => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    setBuckets(Array.from({ length: BUCKET_COUNT }, () => []));
    setActiveBucketIdx(null);
    setActiveChainIdx(null);
    setActiveCalculation(null);
    setSelectedNodeInfo(null);
    setAnimStatus('Hash Table buckets cleared. All collision chains deallocated.');
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* HASH TABLE HEADER CARD WITH LOAD FACTOR INDICATOR */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
              HASH TABLE ({BUCKET_COUNT} BUCKETS, SEPARATE CHAINING)
            </span>
          </div>
        </div>

        {buckets.some(b => b.length > 0) && (
          <button
            onClick={handleClearHashTable}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs shrink-0 ml-auto border ${isDarkMode ? 'text-rose-400 bg-rose-950/30 border-rose-900 hover:bg-rose-900/50' : 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200'}`}
            title="Clear table"
          >
            <Trash2 size={13} className="inline mr-1" /> Clear Table
          </button>
        )}
      </div>

      {/* VISUAL HASH COMPUTATION PIPELINE CARD */}
      {activeCalculation && (
        <div className={`p-3.5 rounded-2xl border shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-[#203247]/10 text-[#203247]'}`}>
          {/* BANNER HEADER */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#347f7a]/15 text-[#347f7a]">
                <Cpu size={14} className="animate-pulse" />
              </span>
              <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
                HASH FUNCTION ENGINE
              </span>
            </div>
            <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${isDarkMode ? 'text-slate-300 bg-[#0f172a] border-slate-700' : 'text-[#647895] bg-[#faf8f4] border-[#203247]/10'}`}>
              Formula: h(k) = k mod {BUCKET_COUNT}
            </span>
          </div>

          {/* DYNAMIC PIPELINE FLOW */}
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            {/* STEP 1: KEY */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[130px] transition-all ${activeCalculation.activeStage === 1 ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md scale-[1.02]' : (isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10')}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${activeCalculation.activeStage === 1 ? 'bg-white/20 text-white' : 'bg-[#347f7a]/15 text-[#347f7a]'}`}>1</div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-bold uppercase ${activeCalculation.activeStage === 1 ? 'opacity-80' : 'text-[#647895]'}`}>Input Key</span>
                <span className={`font-extrabold text-xs ${activeCalculation.activeStage === 1 ? 'text-white' : 'text-[#347f7a]'}`}>"{activeCalculation.key}"</span>
              </div>
            </div>

            <ArrowRight size={14} className="text-[#647895]/60 shrink-0 hidden sm:block" />

            {/* STEP 2: ALGORITHM */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[150px] transition-all ${activeCalculation.activeStage === 2 ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md scale-[1.02]' : (isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10')}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${activeCalculation.activeStage === 2 ? 'bg-white/20 text-white' : 'bg-[#347f7a]/15 text-[#347f7a]'}`}>2</div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-bold uppercase ${activeCalculation.activeStage === 2 ? 'opacity-80' : 'text-[#647895]'}`}>Modulo Math</span>
                <span className="font-extrabold text-xs">
                  {activeCalculation.rawSum !== null ? `${activeCalculation.rawSum} % ${BUCKET_COUNT}` : `${activeCalculation.key} % ${BUCKET_COUNT}`}
                </span>
              </div>
            </div>

            <ArrowRight size={14} className="text-[#647895]/60 shrink-0 hidden sm:block" />

            {/* STEP 3: RESULT INDEX */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border flex-1 min-w-[140px] transition-all ${activeCalculation.activeStage === 3 ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md scale-[1.02]' : (isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300' : 'bg-[#faf8f4] border-[#203247]/10 text-[#203247]')}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${activeCalculation.activeStage === 3 ? 'bg-white/20 text-white' : 'bg-[#347f7a]/15 text-[#347f7a]'}`}>3</div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-bold uppercase ${activeCalculation.activeStage === 3 ? 'opacity-80' : 'text-[#647895]'}`}>Target Bucket</span>
                <span className="font-extrabold text-xs">Index [{activeCalculation.hash}]</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS TOAST */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]')}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* BUCKET ARRAY STAGE WITH SEPARATE CHAINING NODES (CLEAN ELEGANT LAYOUT) */}
      <div className={`flex flex-col gap-2.5 p-4 rounded-2xl border shadow-xs overflow-auto flex-1 w-full h-full min-h-[350px] custom-scrollbar transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-700/80' : 'bg-[#faf8f4] border-[#203247]/12'}`}>
        {buckets.map((chain, bIdx) => {
          const isBucketActive = activeBucketIdx === bIdx;

          return (
            <div
              key={bIdx}
              ref={el => bucketRefs.current[bIdx] = el}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 px-3.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#1e293b] border-slate-700/70 hover:border-slate-600' : 'bg-white border-[#203247]/10 hover:border-[#203247]/20 shadow-2xs'}`}
            >
              {/* BUCKET SLOT BADGE (CLEAN BADGE WITHOUT RAM ADDRESS) */}
              <div
                onClick={() => setSelectedNodeInfo({ bucketIdx: bIdx, chainCount: chain.length, addr: `0x${5000 + bIdx * 8}` })}
                className={`w-28 px-3 py-2 rounded-xl flex items-center justify-center font-mono text-xs font-bold cursor-pointer shrink-0 transition-all ${isBucketActive ? 'bg-[#347f7a] text-white shadow-md scale-[1.02]' : (isDarkMode ? 'bg-[#0f172a] text-slate-200 border border-slate-700 hover:border-slate-500' : 'bg-[#203247] text-white hover:bg-[#203247]/90')}`}
                title="Click to view Bucket RAM details"
              >
                <span>Bucket [{bIdx}]</span>
              </div>

              <ArrowRight size={14} className={isDarkMode ? 'text-slate-500 shrink-0 hidden sm:block' : 'text-[#647895]/60 shrink-0 hidden sm:block'} />

              {/* LINKED LIST SEPARATE CHAIN NODES */}
              {chain.length === 0 ? (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed text-xs font-mono font-medium select-none ${isDarkMode ? 'border-slate-800 text-slate-500 bg-[#0f172a]/50' : 'border-slate-200 text-slate-400 bg-slate-50/50'}`}>
                  <span>EMPTY SLOT</span>
                  <span className="opacity-60 font-bold">∅</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {chain.map((item, cIdx) => {
                    const isChainActive = isBucketActive && activeChainIdx === cIdx;
                    const nextAddr = cIdx < chain.length - 1 ? chain[cIdx + 1].addr : 'NULL ∅';

                    return (
                      <React.Fragment key={cIdx}>
                        {/* STRUCT STYLE NODE CARD */}
                        <div
                          ref={el => nodeRefs.current[`${bIdx}-${cIdx}`] = el}
                          onClick={() => setSelectedNodeInfo({ bucketIdx: bIdx, chainIdx: cIdx, key: item.key, val: item.val, addr: item.addr, nextAddr })}
                          className={`flex items-center rounded-xl border font-mono text-xs font-bold transition-all shrink-0 cursor-pointer overflow-hidden ${isChainActive ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md scale-[1.03]' : (isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-700 hover:border-slate-500' : 'bg-[#faf8f4] text-[#203247] border-[#203247]/15 hover:border-[#347f7a] shadow-2xs')}`}
                          title="Click to inspect Node RAM Pointers"
                        >
                          <div className={`px-2.5 py-1.5 border-r flex items-center gap-1 ${isChainActive ? 'bg-black/15 border-white/20' : (isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200')}`}>
                            <span className="text-[9px] opacity-70 uppercase font-bold">KEY</span>
                            <span className={`font-extrabold ${isChainActive ? 'text-white' : 'text-[#347f7a]'}`}>{item.key}</span>
                          </div>
                          <div className="px-2.5 py-1.5 flex items-center gap-1">
                            <span className="text-[9px] opacity-70 uppercase font-bold">VAL</span>
                            <span className="font-extrabold">{item.val}</span>
                          </div>
                        </div>

                        {cIdx < chain.length - 1 && <ArrowRight size={13} className={isDarkMode ? 'text-emerald-400 shrink-0' : 'text-[#347f7a] shrink-0'} />}
                      </React.Fragment>
                    );
                  })}
                  <span className={`font-mono text-[11px] font-bold px-2 py-1 rounded-lg border shrink-0 ml-1 ${isDarkMode ? 'text-rose-400 bg-rose-950/40 border-rose-900/60' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                    NULL ∅
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE RAM INSPECTOR MODAL / TOOLTIP CARD */}
      {selectedNodeInfo && (
        <div className={`p-3.5 rounded-2xl border shadow-md font-mono text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${isDarkMode ? 'bg-[#1e293b] border-cyan-500/50 text-slate-100' : 'bg-white border-[#347f7a] text-[#203247]'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-extrabold text-cyan-500">
              <Info size={15} />
              <span>RAM POINTER INSPECTOR</span>
            </div>
            {selectedNodeInfo.key !== undefined ? (
              <span className="opacity-90">
                Node Address: <strong className="text-emerald-500">{selectedNodeInfo.addr}</strong> | Key: <strong>"{selectedNodeInfo.key}"</strong> | Val: <strong>{selectedNodeInfo.val}</strong> | Next: <strong className="text-amber-500">{selectedNodeInfo.nextAddr}</strong>
              </span>
            ) : (
              <span className="opacity-90">
                Bucket [{selectedNodeInfo.bucketIdx}] Slot Address: <strong className="text-emerald-500">{selectedNodeInfo.addr}</strong> | Chaining Length: <strong>{selectedNodeInfo.chainCount}</strong> nodes
              </span>
            )}
          </div>
          <button
            onClick={() => setSelectedNodeInfo(null)}
            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:opacity-80 text-xs font-bold border-none cursor-pointer shrink-0"
          >
            Close ✕
          </button>
        </div>
      )}
    </div>
  );
};
