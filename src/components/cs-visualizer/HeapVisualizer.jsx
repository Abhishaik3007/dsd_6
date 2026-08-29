import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sparkles, Cpu, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

export const HeapVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  const [heapType, setHeapType] = useState('min'); // 'min' | 'max'
  const [heapArray, setHeapArray] = useState([10, 15, 30, 40, 50, 60, 70]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [swappingIndices, setSwappingIndices] = useState([]); // [idx1, idx2]
  const [animStatus, setAnimStatus] = useState(null);
  const [isShake, setIsShake] = useState(false);

  // Zoom & Pan state
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Step playback state
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animIntervalRef = useRef(null);

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

    if (step.heapArray) setHeapArray(step.heapArray);
    if (step.activeIdx !== undefined) setActiveIdx(step.activeIdx);
    if (step.swappingIndices) setSwappingIndices(step.swappingIndices);
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

  // Re-build (Heapify) entire array with step-by-step visual animation
  const rebuildHeap = (targetType) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    setHeapType(targetType);

    if (heapArray.length === 0) {
      setAnimStatus(`Switched to ${targetType === 'min' ? 'Min' : 'Max'}-Heap mode.`);
      return;
    }

    const steps = [];
    const arr = [...heapArray];
    const n = arr.length;
    const compare = (child, parent) => targetType === 'min' ? child < parent : child > parent;

    steps.push({
      heapArray: [...arr],
      activeIdx: null,
      swappingIndices: [],
      status: `Step 1: Converting ${targetType === 'min' ? 'Max-Heap ➔ Min-Heap' : 'Min-Heap ➔ Max-Heap'} using Floyd's Bottom-Up Heapify Algorithm.`
    });

    const siftDown = (heap, len, i) => {
      let curr = i;
      while (true) {
        let target = curr;
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < len && compare(heap[left], heap[target])) target = left;
        if (right < len && compare(heap[right], heap[target])) target = right;

        if (target !== curr) {
          steps.push({
            heapArray: [...heap],
            activeIdx: curr,
            swappingIndices: [curr, target],
            status: `Heapify at index [${curr}]: Node(${heap[curr]}) violates ${targetType === 'min' ? 'Min' : 'Max'}-Heap property with child Node(${heap[target]}). Swapping...`
          });

          // Swap
          const temp = heap[curr];
          heap[curr] = heap[target];
          heap[target] = temp;

          steps.push({
            heapArray: [...heap],
            activeIdx: target,
            swappingIndices: [curr, target],
            status: `Swapped index [${curr}] & [${target}]. Continuing Heapify Sift-Down...`
          });

          curr = target;
        } else {
          break;
        }
      }
    };

    const startIdx = Math.floor(n / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      steps.push({
        heapArray: [...arr],
        activeIdx: i,
        swappingIndices: [i],
        status: `Inspecting non-leaf subtree root at index [${i}] (Value: ${arr[i]})...`
      });
      siftDown(arr, n, i);
    }

    steps.push({
      heapArray: [...arr],
      activeIdx: 0,
      swappingIndices: [],
      status: `🎉 Conversion Complete! Data structure converted to ${targetType === 'min' ? 'Min' : 'Max'}-Heap. Root is Node(${arr[0]}).`
    });

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
    }, 700 / playbackSpeed);
  };

  // Sync external operations from CSVisualizerLab panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val } = externalOp;
    const numVal = parseInt(val) || Math.floor(Math.random() * 85 + 5);

    if (type === 'insert-node' || type === 'push' || type === 'enqueue') {
      executeInsert(numVal);
    } else if (type === 'delete-node' || type === 'pop' || type === 'dequeue') {
      executeExtract();
    } else if (type === 'min-heap') {
      rebuildHeap('min');
    } else if (type === 'max-heap') {
      rebuildHeap('max');
    } else if (type === 'clear') {
      handleClearHeap();
    }
  }, [externalOp]);

  // Insert Value with Sift-Up (Heapify-Up)
  const executeInsert = (val) => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    if (heapArray.length >= 31) {
      setIsShake(true);
      setAnimStatus('⚠️ OVERFLOW NOTICE: Binary Heap maximum capacity reached (31 nodes)!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const steps = [];
    const arr = [...heapArray, val];
    let curr = arr.length - 1;

    steps.push({
      heapArray: [...arr],
      activeIdx: curr,
      swappingIndices: [],
      status: `Step 1: Appended value ${val} at index [${curr}] of heap array.`
    });

    const compare = (child, parent) => heapType === 'min' ? child < parent : child > parent;

    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (compare(arr[curr], arr[parent])) {
        steps.push({
          heapArray: [...arr],
          activeIdx: curr,
          swappingIndices: [curr, parent],
          status: `Comparing Heap Node(${arr[curr]}) at index [${curr}] with parent (${arr[parent]}) at index [${parent}]... Violation detected! Swapping.`
        });

        // Swap
        const temp = arr[curr];
        arr[curr] = arr[parent];
        arr[parent] = temp;

        steps.push({
          heapArray: [...arr],
          activeIdx: parent,
          swappingIndices: [curr, parent],
          status: `Swapped index [${curr}] & [${parent}]. Continuing Sift-Up...`
        });

        curr = parent;
      } else {
        break;
      }
    }

    steps.push({
      heapArray: [...arr],
      activeIdx: curr,
      swappingIndices: [],
      status: `🎉 Successfully inserted Node(${val}) into ${heapType === 'min' ? 'Min' : 'Max'}-Heap. Sift-Up complete!`
    });

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

  // Extract Root (Min/Max) with Sift-Down (Heapify-Down)
  const executeExtract = () => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    if (heapArray.length === 0) return;

    const steps = [];
    const arr = [...heapArray];
    const extractedVal = arr[0];

    if (arr.length === 1) {
      steps.push({
        heapArray: [],
        activeIdx: null,
        swappingIndices: [],
        status: `Extracted last node (${extractedVal}) from Heap.`
      });
      stepsHistoryRef.current = steps;
      applyStepSnapshot(0);
      return;
    }

    // Replace root with last element
    const lastVal = arr.pop();
    arr[0] = lastVal;

    steps.push({
      heapArray: [...arr],
      activeIdx: 0,
      swappingIndices: [0],
      status: `Extracted Root element (${extractedVal}). Replaced root with last element (${lastVal}). Starting Sift-Down...`
    });

    let curr = 0;
    const compare = (child, parent) => heapType === 'min' ? child < parent : child > parent;

    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let target = curr;

      if (left < arr.length && compare(arr[left], arr[target])) {
        target = left;
      }
      if (right < arr.length && compare(arr[right], arr[target])) {
        target = right;
      }

      if (target !== curr) {
        steps.push({
          heapArray: [...arr],
          activeIdx: curr,
          swappingIndices: [curr, target],
          status: `Violation at index [${curr}] vs child [${target}]. Swapping...`
        });

        const temp = arr[curr];
        arr[curr] = arr[target];
        arr[target] = temp;

        steps.push({
          heapArray: [...arr],
          activeIdx: target,
          swappingIndices: [curr, target],
          status: `Swapped index [${curr}] & [${target}]. Continuing Sift-Down...`
        });

        curr = target;
      } else {
        break;
      }
    }

    steps.push({
      heapArray: [...arr],
      activeIdx: null,
      swappingIndices: [],
      status: `🎉 Extracted Root node (${extractedVal}). Heapify-Down complete!`
    });

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

  const handleClearHeap = () => {
    setHeapArray([]);
    setActiveIdx(null);
    setSwappingIndices([]);
    setAnimStatus('Binary Heap cleared. Memory deallocated.');
  };

  // Mouse pan & zoom handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoomScale(s => Math.min(2.0, Math.max(0.35, s * zoomFactor)));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Render Binary Tree SVG representation
  const renderTreeSVG = () => {
    if (heapArray.length === 0) return null;

    const maxLevel = Math.floor(Math.log2(heapArray.length));
    const svgWidth = Math.max(620, Math.pow(2, maxLevel) * 85);
    const svgHeight = Math.max(220, (maxLevel + 1) * 56);

    const getNodeCoordinates = (index) => {
      const level = Math.floor(Math.log2(index + 1));
      const posInLevel = index - (Math.pow(2, level) - 1);
      const totalInLevel = Math.pow(2, level);
      const step = svgWidth / (totalInLevel + 1);
      const x = step * (posInLevel + 1);
      const y = 35 + level * 50;
      return { x, y };
    };

    return (
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
        className="w-full flex justify-center items-center"
      >
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="shrink-0 font-mono text-xs overflow-visible">
          {/* EDGES */}
          {heapArray.map((_, i) => {
            if (i === 0) return null;
            const parentIdx = Math.floor((i - 1) / 2);
            const parentPos = getNodeCoordinates(parentIdx);
            const childPos = getNodeCoordinates(i);

            const isSwapEdge = swappingIndices.includes(i) && swappingIndices.includes(parentIdx);

            return (
              <line
                key={`edge-${i}`}
                x1={parentPos.x}
                y1={parentPos.y}
                x2={childPos.x}
                y2={childPos.y}
                stroke={isSwapEdge ? '#347f7a' : (isDarkMode ? '#475569' : '#cbd5e1')}
                strokeWidth={isSwapEdge ? '3.5' : '2'}
                strokeDasharray={isSwapEdge ? '5,3' : 'none'}
              />
            );
          })}

          {/* NODES */}
          {heapArray.map((val, i) => {
            const { x, y } = getNodeCoordinates(i);
            const isActive = activeIdx === i;
            const isSwapping = swappingIndices.includes(i);

            return (
              <g key={`node-${i}`} transform={`translate(${x}, ${y})`}>
                <circle
                  r="18"
                  fill={
                    isSwapping
                      ? '#347f7a'
                      : isActive
                      ? (isDarkMode ? '#0284c7' : '#203247')
                      : i === 0
                      ? '#347f7a'
                      : (isDarkMode ? '#1e293b' : '#ffffff')
                  }
                  stroke={
                    isActive || isSwapping
                      ? (isDarkMode ? '#38bdf8' : '#347f7a')
                      : i === 0
                      ? (isDarkMode ? '#347f7a' : '#203247')
                      : (isDarkMode ? '#475569' : '#203247')
                  }
                  strokeWidth={isActive || isSwapping ? '3' : '2'}
                  className="transition-all duration-200 shadow-md"
                />
                <text
                  y="4.5"
                  textAnchor="middle"
                  fill={isDarkMode ? '#f8fafc' : (isSwapping || isActive || i === 0 ? '#ffffff' : '#203247')}
                  fontSize="12.5"
                  fontFamily="monospace"
                  fontWeight="800"
                >
                  {val}
                </text>
                {/* INDEX BADGE */}
                <text
                  y="27"
                  textAnchor="middle"
                  fill={isDarkMode ? '#94a3b8' : '#647895'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  [{i}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 gap-3 font-sans">
      {/* HEAP CANVAS HEADER (CLEAN CARD WITH TOP-RIGHT CLEAR BUTTON) */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs shrink-0 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
            BINARY {heapType.toUpperCase()}-HEAP ({heapArray.length} NODES)
          </span>
        </div>

        {heapArray.length > 0 && (
          <button
            onClick={handleClearHeap}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs shrink-0 ml-auto border ${isDarkMode ? 'text-rose-400 bg-rose-950/30 border-rose-900 hover:bg-rose-900/50' : 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200'}`}
            title="Clear heap"
          >
            <Trash2 size={13} className="inline mr-1" /> Clear Heap
          </button>
        )}
      </div>

      {/* STATUS TOAST */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]')}`}>
          <Sparkles size={13} className={isShake ? 'text-amber-600 shrink-0' : 'shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* DUAL DISPLAY STAGE: TREE SVG + SEQUENTIAL RAM ARRAY */}
      <div className="flex flex-col flex-1 h-full min-h-0 gap-3">
        {/* BINARY TREE CANVA STAGE WITH DRAG TO PAN AND FLOATING ZOOM CONTROLS */}
        <div
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative flex-1 w-full h-full min-h-[300px] rounded-2xl border shadow-xs overflow-hidden flex items-center justify-center p-3 select-none transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-700/80' : 'bg-[#faf8f4] border-[#203247]/12'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {/* FLOATING ZOOM CONTROLS OVERLAY */}
          <div className={`absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-white shadow-xl' : 'bg-white/90 border-[#203247]/15 shadow-md'}`}>
            <button
              onClick={() => setZoomScale(s => Math.min(2.0, s + 0.15))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
              title="Zoom In (+)"
            >
              <ZoomIn size={15} />
            </button>
            <span className={`font-mono text-[11px] font-extrabold px-1 min-w-[36px] text-center ${isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'}`}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(s => Math.max(0.35, s - 0.15))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
              title="Zoom Out (-)"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={handleResetZoom}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-[#faf8f4] text-[#647895] hover:text-[#347f7a]'}`}
              title="Reset Fit View"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {heapArray.length === 0 ? (
            <div className={`text-center font-mono text-xs py-6 ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>
              Heap is empty. Execute <strong>Insert Node</strong> to populate min/max heap tree!
            </div>
          ) : (
            renderTreeSVG()
          )}
        </div>

        {/* SEQUENTIAL RAM ARRAY VIEW */}
        <div className={`p-3 rounded-2xl border shadow-xs transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/12'}`}>
          <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu size={13} className={isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'} />
            <span className={isDarkMode ? 'text-white font-extrabold' : 'text-[#203247]'}>
              Heap Memory Array Representation (Contiguous RAM)
            </span>
          </h4>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {heapArray.map((val, idx) => {
              const isActive = activeIdx === idx;
              const isSwapping = swappingIndices.includes(idx);

              return (
                <div key={idx} className="flex flex-col items-center shrink-0">
                  <span className={`font-mono text-[8.5px] mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>0x{4000 + idx * 4}</span>
                  <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-xs border-2 transition-all ${isSwapping ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md scale-105' : isActive ? 'bg-[#0284c7] text-white border-[#0284c7]' : (isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-700' : 'bg-[#faf8f4] text-[#203247] border-[#203247]/15')}`}>
                    <span className="text-[7px] opacity-75 leading-none">VAL</span>
                    <span>{val}</span>
                  </div>
                  <span className={`font-mono text-[9.5px] font-bold mt-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'}`}>[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
