import React, { useState, useEffect } from 'react';
import { Layers, ArrowDown, ArrowUp, Plus, Trash2, Sparkles, RotateCcw, Eye } from 'lucide-react';

export const StackQueueVisualizer = ({
  externalOp,
  playbackSpeed = 1.0,
  initialMode = 'stack'
}) => {
  const [mode, setMode] = useState(initialMode); // 'stack' | 'queue'
  const [items, setItems] = useState([15, 42, 27, 88]);
  const [activeIdx, setActiveIdx] = useState(null); // Highlighted index for PEEK or PUSH/POP
  const [animStatus, setAnimStatus] = useState(null);
  const [animatingState, setAnimatingState] = useState(null); // 'pushing' | 'popping' | 'peeking'
  const [firstValInput, setFirstValInput] = useState('');
  const [isShake, setIsShake] = useState(false);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Sync external operation from CSVisualizerLab operations panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val } = externalOp;
    const numVal = parseInt(val) || 25;

    if (type === 'push' || type === 'enqueue' || type === 'push-front') {
      executePush(numVal);
    } else if (type === 'pop' || type === 'dequeue' || type === 'pop-back') {
      executePop();
    } else if (type === 'peek') {
      executePeek();
    } else if (type === 'clear') {
      executeClear();
    }
  }, [externalOp]);

  // PUSH Operation
  const executePush = (val) => {
    if (items.length >= 28) {
      setIsShake(true);
      setAnimStatus('⚠️ OVERFLOW ERROR: Stack memory limit of 28 frames reached!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    setAnimatingState('pushing');
    const newIdx = items.length;
    setActiveIdx(newIdx);
    setAnimStatus(`Pushing value ${val} onto top of Stack (Index [${newIdx}])...`);

    setTimeout(() => {
      setItems(prev => [...prev, val]);
      setActiveIdx(newIdx);
      setAnimatingState(null);
      setAnimStatus(`Successfully PUSHED value ${val} at TOP pointer.`);
    }, 550 / playbackSpeed);
  };

  // POP Operation
  const executePop = () => {
    if (items.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ UNDERFLOW ERROR: Cannot POP from an empty Stack!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const topIdx = items.length - 1;
    const poppedVal = items[topIdx];
    setActiveIdx(topIdx);
    setAnimatingState('popping');
    setAnimStatus(`POPPING top element (${poppedVal}) from index [${topIdx}]...`);

    setTimeout(() => {
      setItems(prev => prev.slice(0, -1));
      setActiveIdx(null);
      setAnimatingState(null);
      setAnimStatus(`Successfully POPPED value ${poppedVal} from Stack.`);
    }, 600 / playbackSpeed);
  };

  // PEEK Operation
  const executePeek = () => {
    if (items.length === 0) {
      setIsShake(true);
      setAnimStatus('⚠️ UNDERFLOW NOTICE: Stack is empty. Nothing to PEEK!');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const topIdx = items.length - 1;
    const topVal = items[topIdx];
    setActiveIdx(topIdx);
    setAnimatingState('peeking');
    setAnimStatus(`🔍 PEEK: Top element is ${topVal} at index [${topIdx}].`);

    setTimeout(() => setAnimatingState(null), 1200 / playbackSpeed);
  };

  // CLEAR Operation
  const executeClear = () => {
    setItems([]);
    setActiveIdx(null);
    setAnimStatus('Stack cleared. All memory frames deallocated.');
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
    setAnimStatus(`Initialized Stack with first frame value ${numVal} at TOP pointer.`);
    setFirstValInput('');
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* STACK MEMORY STAGE HEADER (2-ROW CLEAN CARD) */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#203247]/10 shadow-xs">
        {/* TOP ROW: TITLE ON LEFT, CLEAR BUTTON ON TOP RIGHT */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#203247]">
              STACK (LIFO - LAST IN FIRST OUT) ({items.length} FRAMES)
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={executeClear}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer bg-white shadow-2xs shrink-0 ml-auto"
              title="Clear stack to start from scratch"
            >
              <Trash2 size={13} className="inline mr-1" /> Clear Stack
            </button>
          )}
        </div>

        {/* BOTTOM ROW: MEMORY STRUCTURE BADGE */}
        <div className="flex items-center gap-2 flex-wrap w-full text-xs font-mono font-bold text-[#647895]">
          <div className="flex items-center gap-1.5 bg-[#faf8f4] px-3 py-1.5 rounded-xl border border-[#203247]/10 text-[11px]">
            <span className="text-[#347f7a]">LIFO</span>
            <span>• Push / Pop from TOP Only</span>
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
            <h4 className="text-sm font-extrabold text-[#203247] uppercase tracking-wider mb-1">Stack Memory is Empty</h4>
            <p className="text-xs text-[#647895] max-w-sm font-medium">Underflow condition: No frames currently in Stack. Enter a value below to PUSH the first frame!</p>
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
                <span>Push First Element</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VERTICAL STACK BUCKET CONTAINER */
        <div className="flex flex-col items-center max-w-sm sm:max-w-md mx-auto py-2 w-full select-none">
          {/* TOP POINTER BADGE */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#347f7a] text-white font-mono text-[11px] font-extrabold shadow-xs mb-3 animate-bounce">
            <span>TOP Pointer ↓ Index [{items.length - 1}]</span>
          </div>

          {/* STACK BUCKET VESSEL */}
          <div className="w-full flex flex-col gap-2 p-3 bg-[#faf8f4] border-x-2 border-b-2 border-[#203247]/15 rounded-b-2xl shadow-xs min-h-[200px]">
            {/* OPEN TOP STACK INDICATOR */}
            <div className="flex items-center justify-between px-2 pb-1.5 border-b border-dashed border-[#203247]/15 font-mono text-[9.5px] font-extrabold text-[#647895]">
              <span>▲ OPEN TOP (PUSH / POP)</span>
              <span>LIFO ORDER</span>
            </div>

            {items.slice().reverse().map((val, reverseIdx) => {
              const originalIdx = items.length - 1 - reverseIdx;
              const isTop = originalIdx === items.length - 1;
              const isActive = activeIdx === originalIdx;
              const isPopping = isActive && animatingState === 'popping';
              const isPushing = isActive && animatingState === 'pushing';
              const isPeeking = isActive && animatingState === 'peeking';

              return (
                <div
                  key={originalIdx}
                  onClick={() => setActiveIdx(originalIdx)}
                  className={`grid grid-cols-3 items-center px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${isPopping ? 'bg-rose-500 text-white border-rose-600 shadow-lg scale-105 animate-pulse' : isPushing ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-105' : isPeeking ? 'bg-amber-400 text-[#203247] border-amber-500 shadow-md font-bold scale-102' : isTop ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md -translate-y-0.5' : 'bg-white text-[#203247] border-[#203247]/15 shadow-2xs hover:border-[#347f7a]/40'}`}
                >
                  {/* MEMORY ADDRESS (LEFT) */}
                  <span className={`justify-self-start font-mono text-[10px] font-extrabold ${isTop ? 'text-white/90' : 'text-[#647895]'}`}>
                    0x{(0x7FFF0040 + originalIdx * 4).toString(16).toUpperCase()}
                  </span>

                  {/* CONSISTENT FIXED-WIDTH VALUE PAYLOAD (DEAD CENTER) */}
                  <div className={`justify-self-center w-24 sm:w-28 h-9 px-2 rounded-lg flex items-center justify-center font-mono font-extrabold whitespace-nowrap transition-all ${String(val).length > 5 ? 'text-xs' : 'text-sm sm:text-base'} ${isTop ? 'bg-white text-[#347f7a] shadow-2xs' : 'bg-[#203247] text-white shadow-2xs'}`}>
                    <span>{val}</span>
                  </div>

                  {/* INDEX & TOP BADGE (RIGHT) */}
                  <div className="justify-self-end flex items-center gap-1.5 font-mono text-xs font-bold">
                    {isTop && (
                      <span className="px-2 py-0.5 rounded-md bg-white text-[#347f7a] text-[9px] font-extrabold tracking-wider uppercase shadow-2xs">
                        TOP
                      </span>
                    )}
                    <span className={isTop ? 'text-white font-extrabold' : 'text-[#647895]'}>
                      [{originalIdx}]
                    </span>
                  </div>
                </div>
              );
            })}

            {/* STACK BOTTOM BASE LINE */}
            <div className="w-full text-center py-2 text-[#647895] font-mono text-[10px] font-extrabold uppercase tracking-widest border-t border-[#203247]/10 mt-1">
              • STACK BOTTOM BASE •
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

