import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Sparkles, Network, ZoomIn, ZoomOut, Maximize2, GitBranch } from 'lucide-react';

export const GraphVisualizer = ({
  externalOp,
  onStepUpdate,
  stepCommand,
  playbackSpeed = 1.0,
  isDarkMode = false
}) => {
  // Initial Graph state: Vertices and Edges
  const [vertices, setVertices] = useState([
    { id: 0, label: 'V0 (Head)', x: 140, y: 80, val: 0 },
    { id: 1, label: 'V1', x: 300, y: 60, val: 1 },
    { id: 2, label: 'V2', x: 460, y: 120, val: 2 },
    { id: 3, label: 'V3', x: 160, y: 220, val: 3 },
    { id: 4, label: 'V4', x: 340, y: 240, val: 4 },
  ]);

  const [edges, setEdges] = useState([
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 3, weight: 2 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 4, weight: 1 },
    { from: 3, to: 4, weight: 8 },
    { from: 2, to: 4, weight: 3 },
  ]);

  const [activeVertexId, setActiveVertexId] = useState(null);
  const [visitedVertexIds, setVisitedVertexIds] = useState([]);
  const [activeEdge, setActiveEdge] = useState(null); // { from, to }
  const [traversalType, setTraversalType] = useState('bfs'); // 'bfs' | 'dfs'
  const [traversalResult, setTraversalResult] = useState([]);
  const [traversalStructure, setTraversalStructure] = useState([]); // Current Queue or Stack array
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

  // Apply step snapshot
  const applyStepSnapshot = (stepIdx) => {
    if (!stepsHistoryRef.current || stepsHistoryRef.current.length === 0) return;
    const idx = Math.min(Math.max(0, stepIdx), stepsHistoryRef.current.length - 1);
    currentStepRef.current = idx;
    const step = stepsHistoryRef.current[idx];

    if (step.activeVertexId !== undefined) setActiveVertexId(step.activeVertexId);
    if (step.visitedVertexIds) setVisitedVertexIds(step.visitedVertexIds);
    if (step.activeEdge !== undefined) setActiveEdge(step.activeEdge);
    if (step.traversalResult) setTraversalResult(step.traversalResult);
    if (step.traversalStructure) setTraversalStructure(step.traversalStructure);
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

  // Dragging vertex state
  const [draggingVertexId, setDraggingVertexId] = useState(null);
  const svgRef = useRef(null);

  // Sync external operations from CSVisualizerLab panel
  useEffect(() => {
    if (!externalOp) return;
    const { type, val, pos, weight } = externalOp;

    if (type === 'add-node') {
      handleAddVertex();
    } else if (type === 'add-edge') {
      handleAddEdge(val, pos, weight);
    } else if (type === 'bfs' || type === 'search' || type === 'inorder') {
      executeBFS(val, pos);
    } else if (type === 'dfs' || type === 'preorder') {
      executeDFS(val, pos);
    } else if (type === 'clear') {
      handleClearGraph();
    }
  }, [externalOp]);

  // Helper to parse vertex by name (e.g. "v2", "V2", "2")
  const findVertexByInput = (input) => {
    if (input === undefined || input === null) return null;
    const str = String(input).trim().toLowerCase();
    if (str === '') return null;

    return vertices.find(v => {
      const vLabel = v.label.toLowerCase(); // e.g. "v2" or "v0 (head)"
      const vIdStr = String(v.id);
      return vLabel === str || vLabel.startsWith(str) || vIdStr === str || str === `v${vIdStr}`;
    });
  };

  // Add Vertex
  const handleAddVertex = () => {
    const newId = vertices.length;
    const angle = (newId * 1.2);
    const radius = 120;
    const newX = Math.round(300 + Math.cos(angle) * radius);
    const newY = Math.round(160 + Math.sin(angle) * radius);

    const newVertex = {
      id: newId,
      label: `V${newId}`,
      x: Math.min(520, Math.max(80, newX)),
      y: Math.min(280, Math.max(50, newY)),
      val: newId
    };

    setVertices(prev => [...prev, newVertex]);
    setAnimStatus(`Added new Graph Vertex V${newId} at coordinates (${newVertex.x}, ${newVertex.y}). Drag to position anywhere!`);
  };

  // Add Edge by Vertex Name (e.g. V0 -> V2, v0 -> v2, 0 -> 2)
  const handleAddEdge = (fromInput, toInput, customWeight) => {
    const fromV = findVertexByInput(fromInput);
    const toV = findVertexByInput(toInput);

    if (!fromV || !toV || fromV.id === toV.id) {
      setIsShake(true);
      setAnimStatus(`⚠️ Cannot add edge: Invalid vertices "${fromInput}" ➔ "${toInput}". Use vertex names like V0, V1, V2.`);
      setTimeout(() => setIsShake(false), 850);
      return;
    }

    const fromId = fromV.id;
    const toId = toV.id;

    const exists = edges.some(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId));
    if (exists) {
      setAnimStatus(`Edge V${fromId} - V${toId} already exists in graph.`);
      return;
    }

    const parsedW = parseInt(customWeight);
    const finalWeight = !isNaN(parsedW) && parsedW > 0 ? parsedW : Math.floor(Math.random() * 9 + 1);

    const newEdge = { from: fromId, to: toId, weight: finalWeight };
    setEdges(prev => [...prev, newEdge]);
    setAnimStatus(`Added undirected edge V${fromId} - V${toId} (Weight / Cost: ${newEdge.weight}).`);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    };
  }, []);

  // Execute BFS Traversal / Search
  const executeBFS = (startInput = 0, targetInput = '') => {
    if (vertices.length === 0) {
      setAnimStatus('⚠️ Graph is empty. Please add vertices first.');
      return;
    }

    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const startV = findVertexByInput(startInput) || vertices[0];
    if (!startV) return;

    const targetV = targetInput ? findVertexByInput(targetInput) : null;
    const startId = startV.id;

    setTraversalType('bfs');
    setVisitedVertexIds([]);
    setTraversalResult([]);
    setTraversalStructure([]);

    const steps = [];
    const queue = [startId];
    const visited = new Set([startId]);
    const result = [];
    let foundTarget = false;

    steps.push({
      activeVertexId: startId,
      visitedVertexIds: [startId],
      activeEdge: null,
      traversalResult: [],
      traversalStructure: [...queue],
      status: `Step 1: Enqueue start vertex V${startId} into BFS FIFO Queue.`
    });

    while (queue.length > 0) {
      const curr = queue.shift();
      result.push(curr);

      if (targetV && curr === targetV.id) {
        steps.push({
          activeVertexId: curr,
          visitedVertexIds: Array.from(visited),
          activeEdge: null,
          traversalResult: [...result],
          traversalStructure: [...queue],
          status: `🎯 SUCCESS: Found target vertex V${curr} in BFS search!`
        });
        foundTarget = true;
        break;
      }

      steps.push({
        activeVertexId: curr,
        visitedVertexIds: Array.from(visited),
        activeEdge: null,
        traversalResult: [...result],
        traversalStructure: [...queue],
        status: `Dequeued V${curr} from Queue and marked as visited.`
      });

      // Find adjacent unvisited vertices
      const neighbors = edges
        .filter(e => e.from === curr || e.to === curr)
        .map(e => e.from === curr ? e.to : e.from);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);

          steps.push({
            activeVertexId: neighbor,
            visitedVertexIds: Array.from(visited),
            activeEdge: { from: curr, to: neighbor },
            traversalResult: [...result],
            traversalStructure: [...queue],
            status: `Inspecting neighbor V${neighbor}. Enqueued into BFS Queue.`
          });
        }
      }
    }

    if (!foundTarget) {
      steps.push({
        activeVertexId: null,
        visitedVertexIds: Array.from(visited),
        activeEdge: null,
        traversalResult: [...result],
        traversalStructure: [],
        status: targetV
          ? `❌ Target vertex "${targetInput}" not reachable from V${startId}.`
          : `🌐 BFS Traversal Complete: [${result.map(v => 'V' + v).join(' ➔ ')}]`
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
    }, 700 / playbackSpeed);
  };

  // Execute DFS Traversal / Search
  const executeDFS = (startInput = 0, targetInput = '') => {
    if (vertices.length === 0) {
      setAnimStatus('⚠️ Graph is empty. Please add vertices first.');
      return;
    }

    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      isPlayingRef.current = false;
      if (typeof onStepUpdate === 'function') {
        onStepUpdate({ isPlaying: false });
      }
    }

    const startV = findVertexByInput(startInput) || vertices[0];
    if (!startV) return;

    const targetV = targetInput ? findVertexByInput(targetInput) : null;
    const startId = startV.id;

    setTraversalType('dfs');
    setVisitedVertexIds([]);
    setTraversalResult([]);
    setTraversalStructure([]);

    const steps = [];
    const stack = [startId];
    const visited = new Set();
    const result = [];
    let foundTarget = false;

    steps.push({
      activeVertexId: startId,
      visitedVertexIds: [],
      activeEdge: null,
      traversalResult: [],
      traversalStructure: [...stack],
      status: `Step 1: Push start vertex V${startId} onto DFS Call Stack.`
    });

    while (stack.length > 0) {
      const curr = stack.pop();

      if (!visited.has(curr)) {
        visited.add(curr);
        result.push(curr);

        if (targetV && curr === targetV.id) {
          steps.push({
            activeVertexId: curr,
            visitedVertexIds: Array.from(visited),
            activeEdge: null,
            traversalResult: [...result],
            traversalStructure: [...stack],
            status: `🎯 SUCCESS: Found target vertex V${curr} in DFS search!`
          });
          foundTarget = true;
          break;
        }

        steps.push({
          activeVertexId: curr,
          visitedVertexIds: Array.from(visited),
          activeEdge: null,
          traversalResult: [...result],
          traversalStructure: [...stack],
          status: `Popped V${curr} from Stack and visited.`
        });

        const neighbors = edges
          .filter(e => e.from === curr || e.to === curr)
          .map(e => e.from === curr ? e.to : e.from);

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            steps.push({
              activeVertexId: neighbor,
              visitedVertexIds: Array.from(visited),
              activeEdge: { from: curr, to: neighbor },
              traversalResult: [...result],
              traversalStructure: [...stack],
              status: `Inspecting neighbor V${neighbor}. Pushed to Stack.`
            });
          }
        }
      }
    }

    if (!foundTarget) {
      steps.push({
        activeVertexId: null,
        visitedVertexIds: Array.from(visited),
        activeEdge: null,
        traversalResult: [...result],
        traversalStructure: [],
        status: targetV
          ? `❌ Target vertex "${targetInput}" not reachable from V${startId}.`
          : `🌿 DFS Traversal Complete: [${result.map(v => 'V' + v).join(' ➔ ')}]`
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
    }, 700 / playbackSpeed);
  };

  const handleClearGraph = () => {
    setVertices([]);
    setEdges([]);
    setActiveVertexId(null);
    setVisitedVertexIds([]);
    setTraversalResult([]);
    setTraversalStructure([]);
    setAnimStatus('Graph cleared. Vertices and adjacency memory deallocated.');
  };

  // Mouse pan and node dragging handlers
  const handleNodeMouseDown = (e, vertexId) => {
    e.stopPropagation();
    setDraggingVertexId(vertexId);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (draggingVertexId !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const mouseX = ((e.clientX - rect.left) / rect.width) * 600;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 360;

        const boundedX = Math.round(Math.min(550, Math.max(50, mouseX)));
        const boundedY = Math.round(Math.min(320, Math.max(40, mouseY)));

        setVertices(prev => prev.map(v => v.id === draggingVertexId ? { ...v, x: boundedX, y: boundedY } : v));
      }
      return;
    }

    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingVertexId(null);
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* GRAPH CANVAS HEADER (CLEAN CARD WITH TOP-RIGHT CLEAR BUTTON) */}
      <div className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-[#203247]'}`}>
            GRAPH ADJACENCY STUDIO ({vertices.length} VERTICES, {edges.length} EDGES)
          </span>
        </div>

        {vertices.length > 0 && (
          <button
            onClick={handleClearGraph}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs shrink-0 ml-auto border ${isDarkMode ? 'text-rose-400 bg-rose-950/30 border-rose-900 hover:bg-rose-900/50' : 'text-rose-600 bg-white hover:bg-rose-50 border-rose-200'}`}
            title="Clear graph"
          >
            <Trash2 size={13} className="inline mr-1" /> Clear Graph
          </button>
        )}
      </div>

      {/* ANIMATION STATUS TOAST */}
      {animStatus && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all mb-1 shrink-0 ${isShake ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-800 animate-shake shadow-md' : (isDarkMode ? 'bg-emerald-900/20 border border-emerald-800 text-emerald-400' : 'bg-[#347f7a]/10 border border-[#347f7a]/30 text-[#347f7a]')}`}>
          <Sparkles size={14} className={isShake ? 'text-amber-600 shrink-0' : 'shrink-0'} />
          <span>{animStatus}</span>
        </div>
      )}

      {/* GRAPH SVG CANVAS & ADJACENCY MATRIX SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRAPH SVG VISUALIZER STAGE */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`lg:col-span-2 relative min-h-[320px] sm:min-h-[360px] rounded-2xl border shadow-xs overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-700/80' : 'bg-[#faf8f4] border-[#203247]/12'}`}
        >
          {/* CANVAS CONTROLS OVERLAY */}
          <div className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#1e293b]/90 border-slate-700 text-white shadow-xl' : 'bg-white/90 border-[#203247]/12 shadow-xs'}`}>
            <button
              onClick={() => setZoomScale(prev => Math.min(2.0, prev + 0.15))}
              className={`p-1.5 rounded-lg transition-colors border-none cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.15))}
              className={`p-1.5 rounded-lg transition-colors border-none cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => { setZoomScale(1.0); setPanOffset({ x: 0, y: 0 }); }}
              className={`p-1.5 rounded-lg transition-colors border-none cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400' : 'hover:bg-[#faf8f4] text-[#203247]'}`}
              title="Reset View"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          <svg
            ref={svgRef}
            width="100%"
            height="360"
            viewBox="0 0 600 360"
            className="w-full h-full"
            style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`, transformOrigin: 'center' }}
          >
            {/* DRAW EDGES */}
            {edges.map((edge, i) => {
              const fromV = vertices.find(v => v.id === edge.from);
              const toV = vertices.find(v => v.id === edge.to);
              if (!fromV || !toV) return null;

              const isEdgeActive = activeEdge && ((activeEdge.from === edge.from && activeEdge.to === edge.to) || (activeEdge.from === edge.to && activeEdge.to === edge.from));
              const midX = (fromV.x + toV.x) / 2;
              const midY = (fromV.y + toV.y) / 2;

              return (
                <g key={i}>
                  <line
                    x1={fromV.x}
                    y1={fromV.y}
                    x2={toV.x}
                    y2={toV.y}
                    stroke={isEdgeActive ? '#347f7a' : (isDarkMode ? '#475569' : '#cbd5e1')}
                    strokeWidth={isEdgeActive ? '4' : '2.5'}
                    strokeDasharray={isEdgeActive ? '6,3' : 'none'}
                    className="transition-all duration-300"
                  />
                  {/* EDGE WEIGHT BADGE */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-11" y="-9" width="22" height="18" rx="4"
                      fill={isDarkMode ? '#1e293b' : '#ffffff'}
                      stroke={isDarkMode ? '#334155' : '#94a3b8'}
                      strokeWidth="1"
                    />
                    <text
                      x="0" y="3.5" textAnchor="middle"
                      fill={isDarkMode ? '#38bdf8' : '#203247'}
                      fontSize="10" fontFamily="monospace" fontWeight="bold"
                    >
                      {edge.weight}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* DRAW VERTICES */}
            {vertices.map(v => {
              const isActive = activeVertexId === v.id;
              const isVisited = visitedVertexIds.includes(v.id);

              return (
                <g
                  key={v.id}
                  transform={`translate(${v.x}, ${v.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, v.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    executeBFS(v.id);
                  }}
                  className="cursor-move group"
                >
                  <circle
                    r="24"
                    fill={
                      isActive
                        ? (isDarkMode ? '#0284c7' : '#347f7a')
                        : isVisited
                        ? (isDarkMode ? '#347f7a' : '#203247')
                        : (isDarkMode ? '#1e293b' : '#ffffff')
                    }
                    stroke={
                      isActive
                        ? (isDarkMode ? '#38bdf8' : '#347f7a')
                        : isVisited
                        ? (isDarkMode ? '#347f7a' : '#203247')
                        : (isDarkMode ? '#475569' : '#94a3b8')
                    }
                    strokeWidth={isActive || isVisited ? '3.5' : '2.5'}
                    className="transition-all duration-200 shadow-md"
                  />
                  <text
                    y="5"
                    textAnchor="middle"
                    fill={isDarkMode ? '#f8fafc' : (isActive || isVisited ? '#ffffff' : '#203247')}
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="800"
                  >
                    V{v.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ADJACENCY LIST & LIVE TRAVERSAL QUEUE/STACK PANEL */}
        <div className="flex flex-col gap-3">
          {/* TRAVERSAL QUEUE/STACK BUFFER DISPLAY */}
          <div className={`p-3.5 rounded-2xl border shadow-xs transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/12'}`}>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className={isDarkMode ? 'text-white font-extrabold' : 'text-[#203247]'}>
                {traversalType === 'bfs' ? 'FIFO Queue' : 'LIFO Call Stack'} Buffer
              </span>
              <span className={`text-[10px] font-mono ${isDarkMode ? 'text-emerald-400 font-bold' : 'text-[#347f7a]'}`}>
                [{traversalStructure.length} items]
              </span>
            </h4>
            <div className={`flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl border min-h-[44px] ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
              {traversalStructure.length === 0 ? (
                <span className={`font-mono text-xs px-2 italic ${isDarkMode ? 'text-slate-400' : 'text-[#647895]'}`}>Buffer Empty (Idle)</span>
              ) : (
                traversalStructure.map((vId, idx) => (
                  <span key={idx} className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold shrink-0 ${isDarkMode ? 'bg-[#347f7a] text-white shadow-2xs' : 'bg-[#203247] text-white'}`}>
                    V{vId}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ADJACENCY LIST */}
          <div className={`p-3.5 rounded-2xl border shadow-xs flex-1 transition-colors ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/12'}`}>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Network size={14} className={isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'} />
              <span className={isDarkMode ? 'text-white font-extrabold' : 'text-[#203247]'}>
                Adjacency Memory List
              </span>
            </h4>
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              {vertices.map(v => {
                const adj = edges
                  .filter(e => e.from === v.id || e.to === v.id)
                  .map(e => e.from === v.id ? `V${e.to}(w:${e.weight})` : `V${e.from}(w:${e.weight})`);

                return (
                  <div key={v.id} className={`flex items-center justify-between p-2 rounded-xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'}`}>
                    <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-[#347f7a]'}`}>V{v.id} ➔</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#203247]'}`}>{adj.length > 0 ? adj.join(', ') : '∅ (Isolated)'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
