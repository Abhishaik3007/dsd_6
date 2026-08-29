import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Plus, Trash2, Search, Sparkles, Layers } from 'lucide-react';

export const ArrayVisualizer = ({ externalOp, onStepUpdate, stepCommand, playbackSpeed = 1.0 }) => {
  const [array, setArray] = useState([15, 42, 8, 93, 27, 64, 31]);
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [activePointer, setActivePointer] = useState(null); // Current index highlighted in operation
  const [searchResult, setSearchResult] = useState(null);
  const [viewMode, setViewMode] = useState('tape'); // 'tape' | 'grid'

  const [animStatus, setAnimStatus] = useState(null); // Educational status toast message
  const [animatingState, setAnimatingState] = useState(null); // 'traversing' | 'deleting' | 'inserting'
  const [isShake, setIsShake] = useState(false); // Squiggle buffer animation on empty operation warning

  const itemRefs = useRef({});
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Apply a specific step snapshot
  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.array) setArray(step.array);
    setActivePointer(step.activePointer);
    setAnimStatus(step.status);

    if (typeof onStepUpdate === 'function') {
      onStepUpdate({
        currentStep: idx,
        totalSteps: stepsHistoryRef.current.length,
        isPlaying: isPlayingRef.current
      });
    }
  };

  // Listen to step control commands from parent (First, Prev, Play/Pause, Next, Last)
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

  // AUTO-SCROLL ACTIVE ELEMENT INTO VIEW DURING ANIMATION
  useEffect(() => {
    if (activePointer !== null && itemRefs.current[activePointer]) {
      itemRefs.current[activePointer].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activePointer]);

  useEffect(() => {
    if (!externalOp) return;
    const { type, val, pos } = externalOp;

    // VALIDATION: Check if value is empty for operations requiring a value
    const requiresValue = ['insert-pos', 'insert-head', 'insert-tail', 'search'].includes(type);
    if (requiresValue && (val === undefined || val === null || String(val).trim() === '' || isNaN(parseInt(val)))) {
      setAnimStatus('⚠️ Cannot execute operation: Value field cannot be empty! Please specify a number.');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    // VALIDATION: Reject negative position/index values
    if (type === 'insert-pos' || type === 'delete-pos') {
      const parsedPos = parseInt(pos);
      if (isNaN(parsedPos) || parsedPos < 0) {
        setAnimStatus('⚠️ Invalid Index: Array indices must be non-negative (>= 0)! Negative positions are not permitted.');
        setIsShake(true);
        setTimeout(() => setIsShake(false), 850);
        return;
      }
    }

    const runAnimatedOperation = async () => {
      const steps = [];
      let baseArr = [...array];

      // 1. INSERT AT POSITION / HEAD / TAIL
      if (type === 'insert-pos' || type === 'insert-head' || type === 'insert-tail') {
        const numVal = parseInt(val);
        const parsedPos = parseInt(pos);
        const targetPos = type === 'insert-head' ? 0 : type === 'insert-tail' ? baseArr.length : Math.min(parsedPos, baseArr.length);

        for (let i = 0; i <= targetPos && i < baseArr.length; i++) {
          steps.push({
            activePointer: i,
            status: `Step 1: Traversing index [${i}]... scanning RAM (0x${1000 + i * 4})`,
            state: 'traversing',
            array: [...baseArr]
          });
        }

        const newArr = [...baseArr];
        newArr.splice(targetPos, 0, numVal);

        steps.push({
          activePointer: targetPos,
          status: `Step 2: Allocating memory slot at index [${targetPos}] & inserting value ${numVal}...`,
          state: 'inserting',
          array: newArr
        });

        steps.push({
          activePointer: targetPos,
          status: `SUCCESS: Inserted ${numVal} at index [${targetPos}].`,
          state: null,
          array: newArr
        });
      }

      // 2. DELETE AT POSITION
      else if (type === 'delete-pos') {
        if (baseArr.length === 0) return;
        const parsedPos = parseInt(pos);
        if (parsedPos >= baseArr.length) {
          setAnimStatus(`⚠️ Index Out of Bounds: Position [${parsedPos}] is beyond array length (${baseArr.length})!`);
          setIsShake(true);
          setTimeout(() => setIsShake(false), 850);
          return;
        }
        const targetPos = parsedPos;

        for (let i = 0; i <= targetPos; i++) {
          steps.push({
            activePointer: i,
            status: `Step 1: Scanning array elements... Index [${i}] (Address 0x${1000 + i * 4})`,
            state: 'traversing',
            array: [...baseArr]
          });
        }

        const deletedVal = baseArr[targetPos];
        const newArr = baseArr.filter((_, i) => i !== targetPos);

        steps.push({
          activePointer: targetPos,
          status: `Step 2: Target Located! Freeing memory for value ${deletedVal} at index [${targetPos}]...`,
          state: 'deleting',
          array: [...baseArr]
        });

        steps.push({
          activePointer: null,
          status: `SUCCESS: Deleted element at index [${targetPos}]. Memory freed.`,
          state: null,
          array: newArr
        });
      }

      // 3. SEARCH
      else if (type === 'search') {
        const targetVal = parseInt(val) || 42;
        let foundIdx = -1;

        for (let i = 0; i < baseArr.length; i++) {
          steps.push({
            activePointer: i,
            status: `Comparing index [${i}] (value: ${baseArr[i]}) with search target ${targetVal}...`,
            state: 'traversing',
            array: [...baseArr]
          });
          if (baseArr[i] === targetVal) {
            foundIdx = i;
            break;
          }
        }

        if (foundIdx !== -1) {
          steps.push({
            activePointer: foundIdx,
            status: `MATCH FOUND! Target ${targetVal} located at index [${foundIdx}]`,
            state: null,
            array: [...baseArr]
          });
        } else {
          steps.push({
            activePointer: null,
            status: `SEARCH FINISHED: Target ${targetVal} not found in array.`,
            state: null,
            array: [...baseArr]
          });
        }
      }

      // 4. INSERT AT TAIL
      else if (type === 'insert-tail') {
        const numVal = parseInt(val) || Math.floor(Math.random() * 90 + 10);
        for (let i = 0; i < baseArr.length; i++) {
          steps.push({
            activePointer: i,
            status: `Scanning array to tail... Index [${i}]`,
            state: 'traversing',
            array: [...baseArr]
          });
        }
        const newArr = [...baseArr, numVal];
        steps.push({
          activePointer: baseArr.length,
          status: `Allocating tail index [${baseArr.length}] for value ${numVal}...`,
          state: 'inserting',
          array: newArr
        });
        steps.push({
          activePointer: baseArr.length,
          status: `SUCCESS: Inserted ${numVal} at tail.`,
          state: null,
          array: newArr
        });
      }

      // 5. TRAVERSE
      else if (type === 'traverse') {
        for (let i = 0; i < baseArr.length; i++) {
          steps.push({
            activePointer: i,
            status: `Traversing element at index [${i}] (value: ${baseArr[i]}, Address 0x${1000 + i * 4})`,
            state: 'traversing',
            array: [...baseArr]
          });
        }
        steps.push({
          activePointer: null,
          status: `TRAVERSAL COMPLETE: Inspected all ${baseArr.length} RAM memory cells.`,
          state: null,
          array: [...baseArr]
        });
      }

      stepsHistoryRef.current = steps;
      isPlayingRef.current = true;

      // Play back steps automatically adhering to playbackSpeed
      for (let s = 0; s < steps.length; s++) {
        if (!isPlayingRef.current && s > 0) {
          break;
        }
        applyStepSnapshot(s);
        const delay = Math.round(850 / (playbackSpeed || 1.0));
        await new Promise(r => setTimeout(r, delay));
      }
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    };

    runAnimatedOperation();
  }, [externalOp]);
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

  const handleSortArray = () => {
    const sorted = [...array].sort((a, b) => a - b);
    setArray(sorted);
    setActivePointer(null);
    setSearchResult('Array Sorted Ascending');
  };

  const [firstValInput, setFirstValInput] = useState('');

  const handleAddFirstElement = () => {
    if (firstValInput.trim() === '' || isNaN(parseInt(firstValInput))) {
      setIsShake(true);
      setAnimStatus('⚠️ Value cannot be empty! Please enter a number for the first element.');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const numVal = parseInt(firstValInput);
    setArray([numVal]);
    setActivePointer(0);
    setAnimStatus(`Initialized array with element ${numVal} at index [0]`);
    setFirstValInput('');
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* CONTIGUOUS MEMORY ARRAY STAGE HEADER (2-ROW CLEAN LAYOUT) */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#203247]/10 shadow-xs">
        {/* TOP ROW: TITLE ON LEFT, CLEAR BUTTON ON TOP RIGHT */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#203247]">
              RAM CONTIGUOUS ALLOCATION ({array.length} ELEMENTS)
            </span>
          </div>

          {array.length > 0 && (
            <button
              onClick={() => { setArray([]); setActivePointer(null); setAnimStatus('Array cleared. Memory cells deallocated.'); }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer bg-white shadow-2xs shrink-0 ml-auto"
              title="Clear array to start from scratch"
            >
              <Trash2 size={13} className="inline mr-1" /> Clear Array
            </button>
          )}
        </div>

        {/* BOTTOM ROW: VIEW MODE TOGGLE (TAPE VS GRID MATRIX) TAB BAR */}
        <div className="flex items-center gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#203247]/10 text-xs font-mono font-bold w-fit">
          <button
            onClick={() => setViewMode('tape')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${viewMode === 'tape' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
            title="Horizontal Tape View with sleek track"
          >
            Linear Tape
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${viewMode === 'grid' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
            title="Grid Matrix View"
          >
            Grid Matrix
          </button>
        </div>
      </div>

      {/* EDUCATIONAL STATUS ANIMATION BANNER */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a] animate-in fade-in slide-in-from-top-1 duration-200'}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'text-[#347f7a] shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* EMPTY STATE SCREEN (START FROM SCRATCH) */}
      {array.length === 0 ? (
        <div className="my-6 p-8 rounded-2xl bg-white border-2 border-dashed border-[#203247]/15 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none">
          <div className="p-4 rounded-2xl bg-[#347f7a]/10 text-[#347f7a] shadow-inner mb-1">
            <Layers size={36} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#203247] uppercase tracking-wider mb-1">Array Memory is Empty</h4>
            <p className="text-xs text-[#647895] max-w-sm font-medium">No memory cells currently allocated in RAM. Enter a value below to start building your array!</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
            {/* INLINE NUMBER INPUT FOR CUSTOM FIRST ELEMENT */}
            <div className="flex items-center gap-1.5 bg-[#faf8f4] p-1.5 rounded-xl border border-[#203247]/15 shadow-2xs">
              <input
                type="number"
                placeholder="Enter number..."
                value={firstValInput}
                onChange={e => setFirstValInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddFirstElement()}
                className={`w-32 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold text-[#203247] placeholder-[#647895] focus:outline-none bg-white transition-all ${isShake ? 'input-error-squiggle' : 'border-[#203247]/15 focus:border-[#347f7a]'}`}
              />
              <button
                onClick={handleAddFirstElement}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-xs"
              >
                <Plus size={14} />
                <span>Add First Element</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ELEMENTS CONTAINER (TAPE OR GRID WRAP) */
        <div className={`px-2 pt-3.5 pb-4 transition-all ${viewMode === 'grid' ? 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-y-7 gap-x-3.5 w-full overflow-x-hidden overflow-y-visible' : 'flex items-center gap-3 overflow-x-auto custom-horizontal-scrollbar overflow-y-hidden'}`}>
          {array.map((val, idx) => {
            const isActive = activePointer === idx;
            const isDeleting = isActive && animatingState === 'deleting';
            const isInserting = isActive && animatingState === 'inserting';

            return (
              <div
                key={idx}
                ref={el => itemRefs.current[idx] = el}
                onClick={() => setActivePointer(idx)}
                className={`relative flex flex-col items-center ${viewMode === 'grid' ? 'w-full' : 'min-w-[64px] sm:min-w-[70px] w-auto'} p-3 rounded-xl transition-all cursor-pointer border-2 select-none group ${isDeleting ? 'bg-rose-500 text-white border-rose-600 shadow-lg scale-110 z-30 animate-pulse' : isInserting ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-110 z-30' : isActive ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md -translate-y-1 scale-105 z-20' : 'bg-white text-[#203247] border-[#203247]/20 shadow-2xs hover:border-[#347f7a] hover:shadow-xs'}`}
              >
                {/* ACTIVE POINTER ARROW */}
                {isActive && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-xs animate-bounce ${isDeleting ? 'text-rose-500' : 'text-[#347f7a]'}`}>
                    ▼
                  </div>
                )}

                {/* MEMORY ADDRESS */}
                <span className={`font-mono text-[9.5px] sm:text-[10.5px] font-extrabold mb-2 tracking-tight ${isActive ? 'text-white/90' : 'text-[#647895]'}`}>
                  0x{1000 + idx * 4}
                </span>

                {/* HIGH-CONTRAST DYNAMIC WIDTH ELEMENT VALUE BOX */}
                <div className={`min-w-[44px] sm:min-w-[48px] h-11 sm:h-12 px-2.5 rounded-xl flex items-center justify-center font-mono font-extrabold shadow-sm whitespace-nowrap transition-all ${String(val).length > 5 ? 'text-xs sm:text-sm' : String(val).length > 3 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} ${isActive ? 'bg-white text-[#347f7a]' : 'bg-[#203247] text-white'}`}>
                  {val}
                </div>

                {/* INDEX LABEL */}
                <span className={`font-mono text-[10px] sm:text-[11px] font-bold mt-2 ${isActive ? 'text-white' : 'text-[#347f7a]'}`}>
                  [{idx}]
                </span>

                {/* DELETE HOVER BUTTON */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteIndex(idx); }}
                  className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border cursor-pointer z-30 ${isActive ? 'bg-rose-500 text-white border-white scale-110' : 'bg-white text-rose-500 border-rose-200 hover:bg-rose-50'}`}
                  title="Delete element"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
