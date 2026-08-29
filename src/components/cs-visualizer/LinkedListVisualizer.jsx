import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeftRight, Layers, Plus, Trash2, Sparkles } from 'lucide-react';

export const LinkedListVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDoubly: isDoublyProp = false,
  onModeChange
}) => {
  const [nodes, setNodes] = useState([
    { id: 1, val: 15, address: '0x2004' },
    { id: 2, val: 42, address: '0x2048' },
    { id: 3, val: 8,  address: '0x2090' },
    { id: 4, val: 93, address: '0x20D4' },
    { id: 5, val: 27, address: '0x2118' }
  ]);

  const [isDoubly, setIsDoubly] = useState(isDoublyProp);
  const [viewMode, setViewMode] = useState('tape'); // 'tape' | 'grid'
  const [activePointer, setActivePointer] = useState(null); // Current node index
  const [animStatus, setAnimStatus] = useState(null);
  const [animatingState, setAnimatingState] = useState(null); // 'traversing' | 'inserting' | 'deleting'
  const [firstValInput, setFirstValInput] = useState('');
  const [isShake, setIsShake] = useState(false);

  const nodeRefs = useRef({});
  const stepsHistoryRef = useRef([]);
  const currentStepRef = useRef(0);
  const isPlayingRef = useRef(false);

  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.nodes) setNodes(step.nodes);
    if (step.activePointer !== undefined) setActivePointer(step.activePointer);
    if (step.animatingState !== undefined) setAnimatingState(step.animatingState);
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

  // Sync external operation from CSVisualizerLab operations panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val, pos } = externalOp;
    const numVal = parseInt(val) || 25;
    const targetPos = parseInt(pos) || 0;

    if (type === 'insert-head') {
      executeInsertHead(numVal);
    } else if (type === 'insert-tail') {
      executeInsertTail(numVal);
    } else if (type === 'insert-pos') {
      executeInsertPos(numVal, targetPos);
    } else if (type === 'delete-pos') {
      executeDeletePos(targetPos);
    } else if (type === 'search') {
      executeSearch(numVal);
    } else if (type === 'traverse') {
      executeTraverse();
    }
  }, [externalOp]);

  // Insert at Head
  const executeInsertHead = (val) => {
    setAnimatingState('inserting');
    setActivePointer(0);
    const newAddress = `0x${Math.floor(0x2000 + Math.random() * 0x0ffe).toString(16).toUpperCase()}`;
    const newNode = { id: Date.now(), val, address: newAddress };
    
    setAnimStatus(`Allocated new Heap Node(${val}) at ${newAddress}. Updating HEAD -> ${newAddress}`);
    setTimeout(() => {
      setNodes(prev => [newNode, ...prev]);
      setActivePointer(0);
      setAnimatingState(null);
      setAnimStatus(`Successfully inserted Node(${val}) at HEAD.`);
    }, 600 / playbackSpeed);
  };

  // Insert at Tail
  const executeInsertTail = (val) => {
    setAnimatingState('inserting');
    const newAddress = `0x${Math.floor(0x2000 + Math.random() * 0x0ffe).toString(16).toUpperCase()}`;
    const newNode = { id: Date.now(), val, address: newAddress };
    const tailIdx = nodes.length;

    setAnimStatus(`Traversing to tail index [${tailIdx}]...`);
    setActivePointer(tailIdx > 0 ? tailIdx - 1 : 0);

    setTimeout(() => {
      setNodes(prev => [...prev, newNode]);
      setActivePointer(tailIdx);
      setAnimatingState(null);
      setAnimStatus(`Appended new Node(${val}) at TAIL.`);
    }, 700 / playbackSpeed);
  };

  // Insert at Position
  const executeInsertPos = (val, pos) => {
    const validPos = Math.min(Math.max(0, pos), nodes.length);
    setAnimatingState('traversing');
    setActivePointer(0);
    setAnimStatus(`Traversing pointers from HEAD to position [${validPos}]...`);

    let current = 0;
    const interval = setInterval(() => {
      if (current < validPos) {
        setActivePointer(current);
        current++;
      } else {
        clearInterval(interval);
        setAnimatingState('inserting');
        const newAddress = `0x${Math.floor(0x2000 + Math.random() * 0x0ffe).toString(16).toUpperCase()}`;
        const newNode = { id: Date.now(), val, address: newAddress };

        setNodes(prev => {
          const nextNodes = [...prev];
          nextNodes.splice(validPos, 0, newNode);
          return nextNodes;
        });

        setActivePointer(validPos);
        setAnimStatus(`Inserted Node(${val}) at index [${validPos}]. Updated pointers.`);
        setTimeout(() => setAnimatingState(null), 500);
      }
    }, 450 / playbackSpeed);
  };

  // Delete at Position
  const executeDeletePos = (pos) => {
    if (nodes.length === 0) return;
    const validPos = Math.min(Math.max(0, pos), nodes.length - 1);
    setActivePointer(validPos);
    setAnimatingState('deleting');
    setAnimStatus(`Bypassing node at index [${validPos}] (${nodes[validPos]?.address}). Deallocating memory...`);

    setTimeout(() => {
      setNodes(prev => prev.filter((_, i) => i !== validPos));
      setActivePointer(null);
      setAnimatingState(null);
      setAnimStatus(`Deleted node at position [${validPos}]. Free memory pool updated.`);
    }, 700 / playbackSpeed);
  };

  // Search Value
  const executeSearch = (targetVal) => {
    if (nodes.length === 0) return;
    setAnimatingState('traversing');
    setAnimStatus(`Starting pointer search for value ${targetVal}...`);

    let current = 0;
    let found = false;

    const interval = setInterval(() => {
      if (current < nodes.length) {
        setActivePointer(current);
        if (nodes[current].val === targetVal) {
          found = true;
          clearInterval(interval);
          setAnimatingState(null);
          setAnimStatus(`🎉 Search SUCCESS: Found value ${targetVal} at node [${current}] (${nodes[current].address})!`);
        } else {
          current++;
        }
      } else {
        clearInterval(interval);
        setAnimatingState(null);
        setActivePointer(null);
        setAnimStatus(`❌ Value ${targetVal} not found in Linked List.`);
      }
    }, 550 / playbackSpeed);
  };

  // Traverse List
  const executeTraverse = () => {
    if (nodes.length === 0) return;
    setAnimatingState('traversing');
    setAnimStatus(`Traversing linked list from HEAD to NULL...`);

    let current = 0;
    const interval = setInterval(() => {
      if (current < nodes.length) {
        setActivePointer(current);
        current++;
      } else {
        clearInterval(interval);
        setAnimatingState(null);
        setActivePointer(null);
        setAnimStatus(`Completed full linked list traversal.`);
      }
    }, 500 / playbackSpeed);
  };

  // Add First Element Handler
  const handleAddFirstNode = () => {
    if (firstValInput.trim() === '' || isNaN(parseInt(firstValInput))) {
      setIsShake(true);
      setAnimStatus('⚠️ Value cannot be empty! Enter a number for the first node.');
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const numVal = parseInt(firstValInput);
    const newAddress = '0x2004';
    setNodes([{ id: Date.now(), val: numVal, address: newAddress }]);
    setActivePointer(0);
    setAnimStatus(`Initialized Linked List with HEAD node (${numVal}) at ${newAddress}.`);
    setFirstValInput('');
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* HEAP MEMORY LINKED LIST STAGE HEADER (2-ROW CLEAN CARD) */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#203247]/10 shadow-xs">
        {/* TOP ROW: TITLE ON LEFT, CLEAR BUTTON ON TOP RIGHT */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#347f7a] animate-pulse"></span>
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#203247]">
              {isDoubly ? 'DOUBLY' : 'SINGLY'} LINKED LIST ({nodes.length} NODES)
            </span>
          </div>

          {nodes.length > 0 && (
            <button
              onClick={() => { setNodes([]); setActivePointer(null); setAnimStatus('Linked List cleared. Heap nodes deallocated.'); }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer bg-white shadow-2xs shrink-0 ml-auto"
              title="Clear all nodes"
            >
              <Trash2 size={13} className="inline mr-1" /> Clear List
            </button>
          )}
        </div>
        {/* BOTTOM ROW: SINGLY VS DOUBLY (LEFT) & LINEAR TAPE VS GRID MATRIX (RIGHT) */}
        <div className="flex items-center justify-between gap-2 flex-wrap w-full">
          <div className="flex items-center gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#203247]/10 text-xs font-mono font-bold">
            <button
              onClick={() => {
                setIsDoubly(false);
                if (typeof onModeChange === 'function') onModeChange('linked-list');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${!isDoubly ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
              title="Singly Linked List (Head -> Next)"
            >
              Singly Linked
            </button>
            <button
              onClick={() => {
                setIsDoubly(true);
                if (typeof onModeChange === 'function') onModeChange('doubly-linked-list');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${isDoubly ? 'bg-[#347f7a] text-white shadow-xs' : 'text-[#526b88] hover:text-[#203247]'}`}
              title="Doubly Linked List (Prev <-> Next)"
            >
              Doubly Linked
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

      {/* STATUS ANIMATION BANNER */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a] animate-in fade-in slide-in-from-top-1 duration-200'}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'text-[#347f7a] shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

        {/* EMPTY STATE SCREEN */}
        {nodes.length === 0 ? (
          <div className="my-6 p-8 rounded-2xl bg-white border-2 border-dashed border-[#203247]/15 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in zoom-in-95 duration-200 select-none">
            <div className="p-4 rounded-2xl bg-[#347f7a]/10 text-[#347f7a] shadow-inner mb-1">
              <Layers size={36} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#203247] uppercase tracking-wider mb-1">Linked List Memory is Empty</h4>
              <p className="text-xs text-[#647895] max-w-sm font-medium">No heap nodes currently allocated. Enter a value below to set the HEAD pointer!</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
              <div className="flex items-center gap-1.5 bg-[#faf8f4] p-1.5 rounded-xl border border-[#203247]/15 shadow-2xs">
                <input
                  type="number"
                  placeholder="Enter number..."
                  value={firstValInput}
                  onChange={e => setFirstValInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFirstNode()}
                  className={`w-32 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold text-[#203247] placeholder-[#647895] focus:outline-none bg-white transition-all ${isShake ? 'input-error-squiggle' : 'border-[#203247]/15 focus:border-[#347f7a]'}`}
                />
                <button
                  onClick={handleAddFirstNode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#347f7a] text-white text-xs font-bold hover:bg-[#203247] transition-all cursor-pointer border-none shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add First Node (HEAD)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NODES CHAIN CONTAINER (TAPE OR GRID MATRIX) */
          <div className={`px-2 pt-7 pb-4 transition-all ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-7 gap-x-4 w-full items-center justify-items-center overflow-x-hidden overflow-y-visible' : 'flex items-center gap-2 sm:gap-4 overflow-x-auto custom-horizontal-scrollbar overflow-y-hidden'}`}>
            {/* HEAD POINTER BADGE (TAPE MODE - POINTS RIGHT TO NODE 0) */}
            {viewMode === 'tape' && (
              <div className="flex items-center shrink-0 mr-1 gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-[#347f7a] text-white font-mono text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                  HEAD
                </span>
                <ArrowRight size={16} className="text-[#347f7a] stroke-[2.5]" />
              </div>
            )}

            {nodes.map((node, idx) => {
              const isActive = activePointer === idx;
              const isDeleting = isActive && animatingState === 'deleting';
              const isInserting = isActive && animatingState === 'inserting';
              const nextAddress = idx < nodes.length - 1 ? nodes[idx + 1].address : 'NULL';
              const prevAddress = idx > 0 ? nodes[idx - 1].address : 'NULL';

              return (
                <React.Fragment key={node.id || idx}>
                  <div 
                    key={node.id}
                    ref={el => nodeRefs.current[idx] = el}
                    onClick={() => setActivePointer(idx)}
                    className={`relative flex flex-col items-center p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border-2 select-none group ${viewMode === 'grid' ? 'w-fit min-w-[155px] max-w-[195px] mx-auto' : 'shrink-0'} ${isDeleting ? 'bg-rose-500 text-white border-rose-600 shadow-lg scale-110 z-30 animate-pulse' : isInserting ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-110 z-30' : isActive ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-md -translate-y-1 scale-105 z-20' : 'bg-white text-[#203247] border-[#203247]/20 shadow-2xs hover:border-[#347f7a] hover:shadow-xs'}`}
                  >
                    {/* HEAD BADGE ON FIRST NODE IN GRID MODE */}
                    {viewMode === 'grid' && idx === 0 && (
                      <span className="absolute -top-3.5 left-2 px-2 py-0.5 rounded-md bg-[#347f7a] text-white font-mono text-[8.5px] font-extrabold tracking-wider uppercase shadow-2xs z-30">
                        HEAD
                      </span>
                    )}

                    {/* ACTIVE POINTER ARROW */}
                    {isActive && (
                      <div className={`absolute ${idx === 0 && viewMode === 'grid' ? '-top-6' : '-top-5'} left-1/2 -translate-x-1/2 font-bold text-xs animate-bounce ${isDeleting ? 'text-rose-500' : 'text-[#347f7a]'}`}>
                        ▼
                      </div>
                    )}

                    {/* NODE HEAP ADDRESS */}
                    <span className={`font-mono text-[9px] sm:text-[10px] font-extrabold mb-1 tracking-tight ${isActive ? 'text-white/90' : 'text-[#647895]'}`}>
                      {node.address}
                    </span>

                    {/* HIGH-CONTRAST NODE DUAL COMPARTMENT (DATA | PREV/NEXT POINTERS) */}
                    <div className={`flex items-center rounded-lg p-1 gap-1 border ${isActive ? 'bg-white/20 border-white/30' : 'bg-[#203247] border-[#203247]'}`}>
                      {/* PREV POINTER (FOR DOUBLY LINKED LIST) */}
                      {isDoubly && (
                        <div className={`px-1.5 py-1 rounded-md font-mono text-[8.5px] font-bold text-center flex flex-col justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-[#347f7a] text-white'}`}>
                          <span className="text-[7.5px] opacity-80 font-sans">PREV</span>
                          <span>{prevAddress === 'NULL' ? '∅' : prevAddress.slice(2, 6)}</span>
                        </div>
                      )}

                      {/* DYNAMIC WIDTH COMPACT DATA PAYLOAD */}
                      <div className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-1.5 rounded-md flex flex-col items-center justify-center font-mono font-extrabold whitespace-nowrap transition-all ${String(node.val).length > 5 ? 'text-[11px]' : String(node.val).length > 3 ? 'text-xs' : 'text-sm sm:text-base'} ${isActive ? 'bg-white text-[#347f7a]' : 'bg-white text-[#203247]'}`}>
                        <span className="text-[7px] font-sans font-extrabold text-[#647895] leading-none mb-0.5 uppercase">VAL</span>
                        <span>{node.val}</span>
                      </div>

                      {/* NEXT POINTER */}
                      <div className={`px-1.5 py-1 rounded-md font-mono text-[8.5px] font-bold text-center flex flex-col justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-[#347f7a] text-white'}`}>
                        <span className="text-[7.5px] opacity-80 font-sans">NEXT</span>
                        <span>{nextAddress === 'NULL' ? '∅' : nextAddress.slice(2, 6)}</span>
                      </div>
                    </div>

                    {/* NODE INDEX LABEL */}
                    <span className={`font-mono text-[9.5px] sm:text-[10.5px] font-bold mt-1.5 ${isActive ? 'text-white' : 'text-[#347f7a]'}`}>
                      Node [{idx}]
                    </span>

                    {/* DELETE HOVER BUTTON */}
                    <button
                      onClick={(e) => { e.stopPropagation(); executeDeletePos(idx); }}
                      className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border cursor-pointer z-30 ${isActive ? 'bg-rose-500 text-white border-white scale-110' : 'bg-white text-rose-500 border-rose-200 hover:bg-rose-50'}`}
                      title="Delete Node"
                    >
                      <Trash2 size={11} />
                    </button>

                    {/* CONNECTOR ARROW IN GRID MATRIX MODE (BETWEEN ADJACENT NODES) */}
                    {viewMode === 'grid' && idx < nodes.length - 1 && (idx + 1) % 4 !== 0 && (
                      <div className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 text-[#347f7a] font-bold z-20 pointer-events-none">
                        {isDoubly ? (
                          <ArrowLeftRight size={15} className="stroke-[2.5]" />
                        ) : (
                          <ArrowRight size={15} className="stroke-[2.5]" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* CONNECTING POINTER ARROW (TAPE MODE ONLY) */}
                  {viewMode === 'tape' && idx < nodes.length - 1 && (
                    <div className="flex items-center shrink-0 px-0.5 text-[#347f7a]">
                      {isDoubly ? (
                        <ArrowLeftRight size={18} className="stroke-[2.5]" />
                      ) : (
                        <ArrowRight size={18} className="stroke-[2.5]" />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* NULL TERMINATOR BADGE */}
            <div className={`flex flex-col items-center shrink-0 ${viewMode === 'grid' ? 'self-center justify-self-center my-auto' : 'ml-1'}`}>
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-400 text-rose-600 font-mono text-xs font-bold shadow-2xs">
                NULL ∅
              </span>
            </div>
          </div>
        )}
    </div>
  );
};
