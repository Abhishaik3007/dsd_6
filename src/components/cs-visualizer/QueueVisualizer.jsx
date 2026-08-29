import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';

export const QueueVisualizer = ({
  externalOp,
  playbackSpeed = 1.0,
  initialMode = 'queue',
  onModeChange
}) => {
  const [mode, setMode] = useState(initialMode === 'deque' ? 'deque' : 'queue'); // 'queue' | 'deque'
  const [viewMode, setViewMode] = useState('tape'); // 'tape' | 'grid'
  const [items, setItems] = useState([12, 45, 67, 89]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [animStatus, setAnimStatus] = useState(null);
  const [animatingState, setAnimatingState] = useState(null); // 'enqueuing' | 'dequeuing'
  const [firstValInput, setFirstValInput] = useState('');
  const [isShake, setIsShake] = useState(false);

  useEffect(() => {
    if (initialMode) setMode(initialMode === 'deque' ? 'deque' : 'queue');
  }, [initialMode]);

  // Sync external operation from CSVisualizerLab operations panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val } = externalOp;
    const numVal = parseInt(val) || 25;

    if (type === 'enqueue') {
      executeEnqueue(numVal);
    } else if (type === 'dequeue') {
      executeDequeue();
    } else if (type === 'push-front') {
      executePushFront(numVal);
    } else if (type === 'pop-back') {
      executePopBack();
    } else if (type === 'clear') {
      executeClear();
    }
  }, [externalOp]);

  // ENQUEUE (Push Back)
  const executeEnqueue = (val) => {
    if (items.length >= 28) {
      setIsShake(true);
      setAnimStatus('⚠️ OVERFLOW ERROR: Queue memory limit of 28 elements reached!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    setAnimatingState('enqueuing');
    const newIdx = items.length;
    setActiveIdx(newIdx);
    setAnimStatus(`Enqueuing value ${val} at REAR pointer (Index [${newIdx}])...`);

    setTimeout(() => {
      setItems(prev => [...prev, val]);
      setActiveIdx(newIdx);
      setAnimatingState(null);
      setAnimStatus(`Successfully ENQUEUED value ${val} at REAR pointer.`);
    }, 550 / playbackSpeed);
  };

  // DEQUEUE (Pop Front)
  const executeDequeue = () => {
    if (items.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ UNDERFLOW ERROR: Cannot DEQUEUE from an empty Queue!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const frontVal = items[0];
    setActiveIdx(0);
    setAnimatingState('dequeuing');
    setAnimStatus(`DEQUEUING front element (${frontVal}) from index [0]...`);

    setTimeout(() => {
      setItems(prev => prev.slice(1));
      setActiveIdx(null);
      setAnimatingState(null);
      setAnimStatus(`Successfully DEQUEUED value ${frontVal} from FRONT pointer.`);
    }, 600 / playbackSpeed);
  };

  // PUSH FRONT (For Deque)
  const executePushFront = (val) => {
    if (items.length >= 28) {
      setIsShake(true);
      setAnimStatus('⚠️ OVERFLOW ERROR: Deque memory limit of 28 elements reached!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    setAnimatingState('enqueuing');
    setActiveIdx(0);
    setAnimStatus(`Pushing ${val} to FRONT of Deque (Index [0])...`);

    setTimeout(() => {
      setItems(prev => [val, ...prev]);
      setActiveIdx(0);
      setAnimatingState(null);
      setAnimStatus(`Pushed ${val} to FRONT of Deque.`);
    }, 550 / playbackSpeed);
  };

  // POP BACK (For Deque)
  const executePopBack = () => {
    if (items.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ UNDERFLOW ERROR: Deque is empty!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const rearIdx = items.length - 1;
    const rearVal = items[rearIdx];
    setActiveIdx(rearIdx);
    setAnimatingState('dequeuing');
    setAnimStatus(`Popping REAR element (${rearVal}) from index [${rearIdx}]...`);

    setTimeout(() => {
      setItems(prev => prev.slice(0, -1));
      setActiveIdx(null);
      setAnimatingState(null);
      setAnimStatus(`Popped ${rearVal} from REAR of Deque.`);
    }, 600 / playbackSpeed);
  };

  // CLEAR
  const executeClear = () => {
    setItems([]);
    setActiveIdx(null);
    setAnimStatus('Queue cleared. All elements deallocated.');
  };

  // Add First Element
  const handleAddFirstElement = () => {
    if (firstValInput.trim() === '' || isNaN(parseInt(firstValInput))) {
      setIsShake(true);
      setAnimStatus('⚠️ Value cannot be empty! Please enter a number.');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const numVal = parseInt(firstValInput);
    setItems([numVal]);
    setActiveIdx(0);
    setAnimStatus(`Initialized Queue with first element value ${numVal}.`);
    setFirstValInput('');
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* QUEUE MEMORY STAGE HEADER (2-ROW CLEAN CARD) */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#203247]/10 shadow-xs">
        {/* TOP ROW: TITLE ON LEFT, CLEAR BUTTON ON TOP RIGHT */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#203247]">
              {mode === 'deque' ? 'DOUBLE-ENDED QUEUE (DEQUE)' : 'STANDARD QUEUE (FIFO)'} ({items.length} ELEMENTS)
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={executeClear}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer bg-white shadow-2xs shrink-0 ml-auto"
              title="Clear queue to start from scratch"
            >
              <Trash2 size={13} className="inline mr-1" /> Clear Queue
            </button>
          )}
        </div>

        {/* BOTTOM ROW: QUEUE VS DEQUE (LEFT) & LINEAR TAPE VS GRID MATRIX (RIGHT) */}
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#203247]/10 text-xs font-mono font-bold">
            <button
              onClick={() => {
                setMode('queue');
                setAnimStatus('Switched to Standard Queue (FIFO) mode.');
                if (typeof onModeChange === 'function') onModeChange('queue');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${mode === 'queue' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
            >
              Standard Queue (FIFO)
            </button>
            <button
              onClick={() => {
                setMode('deque');
                setAnimStatus('Switched to Double-Ended Queue (Deque) mode.');
                if (typeof onModeChange === 'function') onModeChange('deque');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${mode === 'deque' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
            >
              Deque (Double-Ended)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#203247]/10 text-xs font-mono font-bold ml-auto">
            <button
              onClick={() => setViewMode('tape')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${viewMode === 'tape' ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
              title="Linear Tape View"
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
      </div>

      {/* STATUS BANNER */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a] animate-in fade-in slide-in-from-top-1 duration-200'}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'text-[#347f7a] shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* EMPTY STATE SCREEN */}
      {items.length === 0 ? (
        <div className="my-6 p-8 rounded-2xl bg-white border-2 border-dashed border-[#203247]/15 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none">
          <div className="p-4 rounded-2xl bg-[#347f7a]/10 text-[#347f7a] shadow-inner mb-1">
            <Layers size={36} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#203247] uppercase tracking-wider mb-1">{mode === 'deque' ? 'Deque Memory is Empty' : 'Queue Memory is Empty'}</h4>
            <p className="text-xs text-[#647895] max-w-sm font-medium">Underflow condition: No elements in Queue. Enter a value below to enqueue the first element!</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
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
                <span>Enqueue First Element</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STAGE CONTAINER (CONVEYOR TAPE OR GRID MATRIX) */
        <div className="flex flex-col gap-3 py-2">
          {/* FRONT & REAR POINTER BADGES */}
          {viewMode === 'tape' && (
            <div className="flex items-center justify-between px-2 font-mono text-xs font-extrabold text-[#347f7a]">
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#203247]/10 shadow-2xs">
                <ArrowLeft size={14} /> FRONT (Dequeue) [0]
              </span>
              <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#203247]/10 shadow-2xs">
                REAR (Enqueue) [{items.length - 1}] <ArrowRight size={14} />
              </span>
            </div>
          )}

          {/* CONVEYOR TRACK OR GRID MATRIX */}
          <div className={`px-3 pt-5 pb-4 transition-all ${viewMode === 'grid' ? 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-y-7 gap-x-3.5 w-full overflow-x-hidden overflow-y-visible' : 'flex items-center gap-3 overflow-x-auto custom-horizontal-scrollbar overflow-y-hidden'}`}>
            {items.map((val, idx) => {
              const isFront = idx === 0;
              const isRear = idx === items.length - 1;
              const isActive = activeIdx === idx;
              const isDequeuing = isActive && animatingState === 'dequeuing';
              const isEnqueuing = isActive && animatingState === 'enqueuing';

              return (
                <div
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer border select-none group ${viewMode === 'grid' ? 'w-full' : 'min-w-[64px] sm:min-w-[70px] shrink-0'} ${isDequeuing ? 'bg-rose-500 text-white border-rose-600 shadow-lg scale-110 z-30 animate-pulse' : isEnqueuing ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-110 z-30' : isFront || isRear ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md' : 'bg-white text-[#203247] border-[#203247]/15 hover:border-[#347f7a]'}`}
                >
                  {/* FRONT / REAR BADGES ABOVE */}
                  {isFront && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#203247] text-white font-mono text-[9px] font-bold tracking-wider uppercase shadow-2xs z-30">
                      FRONT
                    </span>
                  )}
                  {isRear && !isFront && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#347f7a] text-white font-mono text-[9px] font-bold tracking-wider uppercase shadow-2xs z-30">
                      REAR
                    </span>
                  )}

                  {/* ADDRESS */}
                  <span className={`font-mono text-[9.5px] sm:text-[10.5px] font-extrabold mb-1.5 ${isFront || isRear ? 'text-white/90' : 'text-[#647895]'}`}>
                    0x{(0x4000 + idx * 4).toString(16).toUpperCase()}
                  </span>

                  {/* DYNAMIC WIDTH HIGH-CONTRAST VALUE BOX */}
                  <div className={`min-w-[44px] px-2.5 h-11 sm:h-12 rounded-xl flex items-center justify-center font-mono font-extrabold whitespace-nowrap transition-all ${String(val).length > 5 ? 'text-xs' : 'text-sm sm:text-base'} ${isFront || isRear ? 'bg-white text-[#347f7a]' : 'bg-[#203247] text-white'}`}>
                    <span>{val}</span>
                  </div>

                  {/* INDEX */}
                  <span className={`font-mono text-[10px] sm:text-[11px] font-bold mt-2 ${isFront || isRear ? 'text-white' : 'text-[#347f7a]'}`}>
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
