import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Compass, MapPin, Flag, Shield, Sparkles, 
  Layers, Shuffle, Zap, Info, Volume2, VolumeX
} from 'lucide-react';
import { PATHFINDING_ALGOS } from './algoData';
import { soundEngine } from './soundEngine';

const ROWS = 14;
const COLS = 26;

export const PathfindingVisualizer = ({ onStepChange, onAlgoSelect, currentAlgoId = 'astar', isDarkMode = false }) => {
  const [selectedAlgo, setSelectedAlgo] = useState(currentAlgoId);
  const [startPos, setStartPos] = useState({ r: 6, c: 3 });
  const [targetPos, setTargetPos] = useState({ r: 6, c: 22 });
  const [walls, setWalls] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragItem, setDragItem] = useState(null); // 'start' | 'target' | 'draw-wall' | 'erase-wall'

  // Pathfinding Execution State
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [soundMuted, setSoundMuted] = useState(soundEngine.isMuted);
  const [teacherInsight, setTeacherInsight] = useState(
    'Click & drag to sculpt walls, or pick a preset. Drag pins to move.'
  );

  const keyFor = (r, c) => `${r},${c}`;

  // Notify parent of algorithm choice
  useEffect(() => {
    if (onAlgoSelect) onAlgoSelect(selectedAlgo);
  }, [selectedAlgo]);

  // Sync selectedAlgo when parent dropdown algorithm changes
  useEffect(() => {
    if (currentAlgoId && PATHFINDING_ALGOS[currentAlgoId] && currentAlgoId !== selectedAlgo) {
      setSelectedAlgo(currentAlgoId);
    }
  }, [currentAlgoId]);

  // Wall drawing handlers
  const handleMouseDown = (r, c) => {
    if (isRunning) return;
    setIsMouseDown(true);
    if (r === startPos.r && c === startPos.c) {
      setDragItem('start');
      return;
    }
    if (r === targetPos.r && c === targetPos.c) {
      setDragItem('target');
      return;
    }
    const k = keyFor(r, c);
    const newWalls = new Set(walls);
    if (newWalls.has(k)) {
      newWalls.delete(k);
      setDragItem('erase-wall');
    } else {
      newWalls.add(k);
      setDragItem('draw-wall');
    }
    setWalls(newWalls);
    clearSearchPathOnly();
  };

  const handleMouseEnter = (r, c) => {
    if (!isMouseDown || isRunning) return;
    if (dragItem === 'start') {
      if ((r !== targetPos.r || c !== targetPos.c) && !walls.has(keyFor(r, c))) {
        setStartPos({ r, c });
        clearSearchPathOnly();
      }
      return;
    }
    if (dragItem === 'target') {
      if ((r !== startPos.r || c !== startPos.c) && !walls.has(keyFor(r, c))) {
        setTargetPos({ r, c });
        clearSearchPathOnly();
      }
      return;
    }
    const k = keyFor(r, c);
    if ((r === startPos.r && c === startPos.c) || (r === targetPos.r && c === targetPos.c)) return;

    const newWalls = new Set(walls);
    if (dragItem === 'draw-wall') {
      newWalls.add(k);
    } else if (dragItem === 'erase-wall') {
      newWalls.delete(k);
    }
    setWalls(newWalls);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDragItem(null);
  };

  // Clear path highlights only (keep walls)
  const clearSearchPathOnly = useCallback(() => {
    setVisitedNodes([]);
    setShortestPath([]);
    setIsDone(false);
    setIsRunning(false);
    setTeacherInsight('Grid reset. Ready to launch another search!');
  }, []);

  // Clear entire grid
  const clearEntireGrid = () => {
    clearSearchPathOnly();
    setWalls(new Set());
    setTeacherInsight('Canvas cleared. Build custom walls or launch right away.');
  };

  // Helper to protect start and target positions and their immediate neighbors
  const isNearSpecial = (r, c, dist = 1) => {
    return (
      (Math.abs(r - startPos.r) <= dist && Math.abs(c - startPos.c) <= dist) ||
      (Math.abs(r - targetPos.r) <= dist && Math.abs(c - targetPos.c) <= dist)
    );
  };

  // 1. Breathable Random Obstacles
  const generateRandomMaze = () => {
    clearSearchPathOnly();
    const newWalls = new Set();
    const density = 0.18 + Math.random() * 0.08;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (isNearSpecial(r, c)) continue;
        if (Math.random() < density) {
          newWalls.add(keyFor(r, c));
        }
      }
    }
    setWalls(newWalls);
    setTeacherInsight(`Generated scattered obstacle field (${Math.round(density * 100)}% density) with open pathways.`);
  };

  // 2. Randomized Open Corridors (Procedural vertical lanes with randomized gates & baffle turns)
  const generateRecursiveMaze = () => {
    clearSearchPathOnly();
    const newWalls = new Set();
    // Choose 3 divider columns with randomized jitter
    const colBases = [6, 12, 18];
    const dividerCols = colBases.map(base => base + (Math.floor(Math.random() * 3) - 1));

    dividerCols.forEach(c => {
      // 2 wide gates at randomized row positions
      const gate1 = 1 + Math.floor(Math.random() * 3); // upper gate
      const gate2 = 7 + Math.floor(Math.random() * 4); // lower gate
      const gateRows = new Set([gate1, gate1 + 1, gate2, gate2 + 1]);

      for (let r = 0; r < ROWS; r++) {
        if (!gateRows.has(r) && !isNearSpecial(r, c)) {
          newWalls.add(keyFor(r, c));
        }
      }

      // Add a small horizontal baffle jutting out into adjacent column for winding paths
      const baffleRow = 3 + Math.floor(Math.random() * (ROWS - 6));
      const baffleDir = Math.random() < 0.5 ? -1 : 1;
      const bCol = c + baffleDir;
      if (bCol >= 0 && bCol < COLS && !isNearSpecial(baffleRow, bCol)) {
        newWalls.add(keyFor(baffleRow, bCol));
        if (bCol + baffleDir >= 0 && bCol + baffleDir < COLS && !isNearSpecial(baffleRow, bCol + baffleDir)) {
          newWalls.add(keyFor(baffleRow, bCol + baffleDir));
        }
      }
    });

    newWalls.delete(keyFor(startPos.r, startPos.c));
    newWalls.delete(keyFor(targetPos.r, targetPos.c));
    setWalls(newWalls);
    setTeacherInsight('Generated randomized open corridor labyrinth with wide navigation gates.');
  };

  // 3. Randomized Spiral Labyrinth (Procedural concentric loops with randomized gates & bypasses)
  const generateSpiralMaze = () => {
    clearSearchPathOnly();
    const newWalls = new Set();
    
    // Randomize spiral margins and bounds
    let top = 1 + (Math.random() < 0.5 ? 0 : 1);
    let bottom = ROWS - 2 - (Math.random() < 0.5 ? 0 : 1);
    let left = 2 + (Math.random() < 0.5 ? 0 : 1);
    let right = COLS - 3 - (Math.random() < 0.5 ? 0 : 1);

    const maxRounds = 2;
    let round = 0;

    while (top <= bottom && left <= right && round < maxRounds) {
      // Randomized gap positions for each of the 4 borders
      const topGap = left + 1 + Math.floor(Math.random() * Math.max(1, right - left - 3));
      const rightGap = top + 1 + Math.floor(Math.random() * Math.max(1, bottom - top - 3));
      const bottomGap = left + 1 + Math.floor(Math.random() * Math.max(1, right - left - 3));
      const leftGap = top + 1 + Math.floor(Math.random() * Math.max(1, bottom - top - 3));

      // Build 4 edges with 2-cell wide openings
      for (let c = left; c <= right; c++) {
        if (c !== topGap && c !== topGap + 1 && !isNearSpecial(top, c)) {
          newWalls.add(keyFor(top, c));
        }
      }
      for (let r = top; r <= bottom; r++) {
        if (r !== rightGap && r !== rightGap + 1 && !isNearSpecial(r, right)) {
          newWalls.add(keyFor(r, right));
        }
      }
      for (let c = right; c >= left; c--) {
        if (c !== bottomGap && c !== bottomGap + 1 && !isNearSpecial(bottom, c)) {
          newWalls.add(keyFor(bottom, c));
        }
      }
      for (let r = bottom; r >= top + 2; r--) {
        if (r !== leftGap && r !== leftGap + 1 && !isNearSpecial(r, left)) {
          newWalls.add(keyFor(r, left));
        }
      }

      top += 2;
      bottom -= 2;
      left += 3;
      right -= 3;
      round++;
    }

    // Add 1-2 randomized bypass passages across spiral rings for interesting branching
    const bypassCount = 1 + Math.floor(Math.random() * 2);
    for (let b = 0; b < bypassCount; b++) {
      const br = 2 + Math.floor(Math.random() * (ROWS - 4));
      const bc = 3 + Math.floor(Math.random() * (COLS - 6));
      newWalls.delete(keyFor(br, bc));
      newWalls.delete(keyFor(br + 1, bc));
    }

    newWalls.delete(keyFor(startPos.r, startPos.c));
    newWalls.delete(keyFor(targetPos.r, targetPos.c));
    setWalls(newWalls);
    setTeacherInsight('Generated dynamic spiral labyrinth with randomized turns and corridors.');
  };

  // 4. Randomized Room Chambers (Procedural partitions with randomized interconnected doorways)
  const generateChambersMaze = () => {
    clearSearchPathOnly();
    const newWalls = new Set();

    // Randomize horizontal dividers
    const h1 = 4 + Math.floor(Math.random() * 2); // 4 or 5
    const h2 = 8 + Math.floor(Math.random() * 2); // 8 or 9
    const hWalls = [h1, h2];

    // Randomize vertical dividers
    const v1 = 7 + Math.floor(Math.random() * 3); // 7, 8, or 9
    const v2 = 16 + Math.floor(Math.random() * 3); // 16, 17, or 18
    const vWalls = [v1, v2];

    // Build horizontal walls with 3 randomized wide doorways per wall
    hWalls.forEach(r => {
      const door1 = 1 + Math.floor(Math.random() * Math.max(1, v1 - 3));
      const door2 = v1 + 1 + Math.floor(Math.random() * Math.max(1, v2 - v1 - 3));
      const door3 = v2 + 1 + Math.floor(Math.random() * Math.max(1, COLS - v2 - 4));
      const doorCols = new Set([
        door1, door1 + 1,
        door2, door2 + 1,
        door3, door3 + 1
      ]);

      for (let c = 1; c < COLS - 1; c++) {
        if (!doorCols.has(c) && !isNearSpecial(r, c)) {
          newWalls.add(keyFor(r, c));
        }
      }
    });

    // Build vertical walls with randomized wide doorways per room segment
    vWalls.forEach(c => {
      const doorTop = 1 + Math.floor(Math.random() * Math.max(1, h1 - 2));
      const doorMid = h1 + 1 + Math.floor(Math.random() * Math.max(1, h2 - h1 - 2));
      const doorBot = h2 + 1 + Math.floor(Math.random() * Math.max(1, ROWS - h2 - 3));
      const doorRows = new Set([
        doorTop, doorTop + 1,
        doorMid, doorMid + 1,
        doorBot, doorBot + 1
      ]);

      for (let r = 1; r < ROWS - 1; r++) {
        if (!doorRows.has(r) && !isNearSpecial(r, c)) {
          newWalls.add(keyFor(r, c));
        }
      }
    });

    // Add 1-2 small random decorative room pillars
    for (let i = 0; i < 3; i++) {
      const pr = 2 + Math.floor(Math.random() * (ROWS - 4));
      const pc = 3 + Math.floor(Math.random() * (COLS - 6));
      if (!isNearSpecial(pr, pc, 2) && !hWalls.includes(pr) && !vWalls.includes(pc)) {
        newWalls.add(keyFor(pr, pc));
      }
    }

    newWalls.delete(keyFor(startPos.r, startPos.c));
    newWalls.delete(keyFor(targetPos.r, targetPos.c));
    setWalls(newWalls);
    setTeacherInsight('Generated randomized room chambers with interconnected doorways.');
  };

  // Execute Selected Pathfinding Algorithm
  const runPathfinding = async () => {
    if (isRunning) return;
    clearSearchPathOnly();
    setIsRunning(true);
    setIsDone(false);

    const visitedInOrder = [];
    const cameFrom = new Map();
    const startKey = keyFor(startPos.r, startPos.c);
    const targetKey = keyFor(targetPos.r, targetPos.c);

    const getNeighbors = (r, c) => {
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
      const res = [];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (!walls.has(keyFor(nr, nc))) {
            res.push({ r: nr, c: nc });
          }
        }
      }
      return res;
    };

    let foundTarget = false;

    if (selectedAlgo === 'bfs') {
      setTeacherInsight('Breadth-First Search: Expanding layer-by-layer like ripples in a pond.');
      const queue = [{ r: startPos.r, c: startPos.c }];
      const visited = new Set([startKey]);

      while (queue.length > 0) {
        const curr = queue.shift();
        const currKey = keyFor(curr.r, curr.c);
        visitedInOrder.push(currKey);

        if (currKey === targetKey) {
          foundTarget = true;
          break;
        }

        for (const n of getNeighbors(curr.r, curr.c)) {
          const nKey = keyFor(n.r, n.c);
          if (!visited.has(nKey)) {
            visited.add(nKey);
            cameFrom.set(nKey, currKey);
            queue.push(n);
          }
        }
      }
    } else if (selectedAlgo === 'dfs') {
      setTeacherInsight('Depth-First Search: Plunging deep down paths until hitting walls.');
      const stack = [{ r: startPos.r, c: startPos.c }];
      const visited = new Set([startKey]);

      while (stack.length > 0) {
        const curr = stack.pop();
        const currKey = keyFor(curr.r, curr.c);
        visitedInOrder.push(currKey);

        if (currKey === targetKey) {
          foundTarget = true;
          break;
        }

        for (const n of getNeighbors(curr.r, curr.c)) {
          const nKey = keyFor(n.r, n.c);
          if (!visited.has(nKey)) {
            visited.add(nKey);
            cameFrom.set(nKey, currKey);
            stack.push(n);
          }
        }
      }
    } else if (selectedAlgo === 'dijkstra') {
      setTeacherInsight("Dijkstra's Algorithm: Prioritizing nodes with minimal path distance from start.");
      const dist = new Map();
      dist.set(startKey, 0);
      const unvisited = [{ r: startPos.r, c: startPos.c, d: 0 }];
      const visited = new Set();

      while (unvisited.length > 0) {
        unvisited.sort((a, b) => a.d - b.d);
        const curr = unvisited.shift();
        const currKey = keyFor(curr.r, curr.c);
        if (visited.has(currKey)) continue;
        visited.add(currKey);
        visitedInOrder.push(currKey);

        if (currKey === targetKey) {
          foundTarget = true;
          break;
        }

        for (const n of getNeighbors(curr.r, curr.c)) {
          const nKey = keyFor(n.r, n.c);
          if (!visited.has(nKey)) {
            const newDist = curr.d + 1;
            if (newDist < (dist.get(nKey) ?? Infinity)) {
              dist.set(nKey, newDist);
              cameFrom.set(nKey, currKey);
              unvisited.push({ r: n.r, c: n.c, d: newDist });
            }
          }
        }
      }
    } else if (selectedAlgo === 'astar') {
      setTeacherInsight('A* Search: Using Manhattan heuristic h(n) to home directly in on the target!');
      const distG = new Map();
      distG.set(startKey, 0);

      const heuristic = (r, c) => Math.abs(r - targetPos.r) + Math.abs(c - targetPos.c);

      const openSet = [{ r: startPos.r, c: startPos.c, f: heuristic(startPos.r, startPos.c) }];
      const closedSet = new Set();

      while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const curr = openSet.shift();
        const currKey = keyFor(curr.r, curr.c);

        if (closedSet.has(currKey)) continue;
        closedSet.add(currKey);
        visitedInOrder.push(currKey);

        if (currKey === targetKey) {
          foundTarget = true;
          break;
        }

        const currentG = distG.get(currKey) ?? 0;
        for (const n of getNeighbors(curr.r, curr.c)) {
          const nKey = keyFor(n.r, n.c);
          if (!closedSet.has(nKey)) {
            const tentativeG = currentG + 1;
            if (tentativeG < (distG.get(nKey) ?? Infinity)) {
              distG.set(nKey, tentativeG);
              cameFrom.set(nKey, currKey);
              const f = tentativeG + heuristic(n.r, n.c);
              openSet.push({ r: n.r, c: n.c, f });
            }
          }
        }
      }
    }

    // Reconstruct Shortest Path
    const pathKeys = [];
    if (foundTarget) {
      let curr = targetKey;
      while (curr && curr !== startKey) {
        pathKeys.unshift(curr);
        curr = cameFrom.get(curr);
      }
      pathKeys.unshift(startKey);
    }

    // Step-by-step animation of visited nodes
    const batchSize = Math.max(1, Math.floor(2 * speedMultiplier));
    const delayMs = Math.max(10, 45 / speedMultiplier);

    let idx = 0;
    const animateVisited = () => {
      if (idx < visitedInOrder.length) {
        const nextBatch = visitedInOrder.slice(idx, idx + batchSize);
        setVisitedNodes(prev => [...prev, ...nextBatch]);
        idx += batchSize;
        setTimeout(animateVisited, delayMs);
      } else {
        // Now animate the golden shortest path
        if (foundTarget) {
          let pIdx = 0;
          const animatePath = () => {
            if (pIdx < pathKeys.length) {
              setShortestPath(pathKeys.slice(0, pIdx + 1));
              pIdx++;
              soundEngine.playTone(30 + pIdx * 2, 20, 100, 30);
              setTimeout(animatePath, 35);
            } else {
              setIsRunning(false);
              setIsDone(true);
              soundEngine.playSuccessChime();
              setTeacherInsight(
                `🎉 Target reached! Explored ${visitedInOrder.length} nodes. Shortest path length: ${pathKeys.length} steps.`
              );
            }
          };
          animatePath();
        } else {
          setIsRunning(false);
          setIsDone(true);
          setTeacherInsight('⚠️ Target is unreachable! All possible pathways are blocked by walls.');
        }
      }
    };

    animateVisited();
  };

  const visitedSet = new Set(visitedNodes);
  const pathSet = new Set(shortestPath);

  return (
    <div className="flex flex-col w-full h-full min-h-0 gap-2.5">
      {/* SUB-HEADER 1: ALGORITHM SELECTION TABS & AUDIO MUTE */}
      <div className={`flex flex-wrap items-center justify-between gap-2.5 p-2 px-3 rounded-2xl border shadow-2xs shrink-0 ${
        isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white/95 border-[#203247]/10'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'dijkstra', label: "Dijkstra's Algorithm" },
            { id: 'astar', label: 'A* Search (Heuristic)' },
            { id: 'bfs', label: 'Breadth-First (BFS)' },
            { id: 'dfs', label: 'Depth-First (DFS)' }
          ].map(algo => (
            <button
              key={algo.id}
              onClick={() => {
                if (!isRunning) {
                  setSelectedAlgo(algo.id);
                  if (onAlgoSelect) onAlgoSelect(algo.id);
                  clearSearchPathOnly();
                }
              }}
              disabled={isRunning}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border ${
                selectedAlgo === algo.id
                  ? 'bg-[#347f7a] text-white border-[#347f7a] shadow-xs'
                  : isDarkMode
                  ? 'bg-[#1e293b] text-slate-300 border-slate-700 hover:border-[#347f7a]'
                  : 'bg-white text-[#526b88] border-[#203247]/10 hover:border-[#347f7a] hover:bg-[#faf8f4]'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>

        {/* Audio Mute & Sound Toggle */}
        <button
          onClick={() => {
            const m = soundEngine.toggleMute();
            setSoundMuted(m);
          }}
          title={soundMuted ? 'Unmute harmonic audio' : 'Mute audio'}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isDarkMode ? 'border-slate-700 bg-[#1e293b] text-slate-300 hover:text-white' : 'border-[#203247]/10 bg-white hover:bg-slate-50 text-[#526b88] hover:text-[#203247]'
          }`}
        >
          {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-[#347f7a]" />}
        </button>
      </div>

      {/* SUB-HEADER 2: MAZE PRESET TOOLS */}
      <div className={`flex items-center justify-between gap-2 p-2 px-3 rounded-2xl border text-xs shrink-0 ${
        isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/10'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono uppercase font-bold text-[10px] text-[#647895] tracking-wider flex items-center gap-1">
            <Shuffle size={12} className="text-[#347f7a]" /> Maze:
          </span>
          <button
            onClick={generateRandomMaze}
            disabled={isRunning}
            className={`px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer disabled:opacity-50 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-[#203247]/10 hover:bg-slate-50'
            }`}
          >
            Random Obstacles
          </button>
          <button
            onClick={generateRecursiveMaze}
            disabled={isRunning}
            className={`px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer disabled:opacity-50 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-[#203247]/10 hover:bg-slate-50'
            }`}
          >
            Open Corridors
          </button>
          <button
            onClick={generateChambersMaze}
            disabled={isRunning}
            className={`px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer disabled:opacity-50 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-[#203247]/10 hover:bg-slate-50'
            }`}
          >
            Room Chambers
          </button>
          <button
            onClick={generateSpiralMaze}
            disabled={isRunning}
            className={`px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer disabled:opacity-50 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-[#203247]/10 hover:bg-slate-50'
            }`}
          >
            Spiral Labyrinth
          </button>
          <button
            onClick={clearEntireGrid}
            disabled={isRunning}
            className={`px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer disabled:opacity-50 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700 text-rose-400 hover:bg-slate-800' : 'bg-white border-[#203247]/10 hover:bg-slate-50 text-[#dc2626]'
            }`}
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* MAIN PLAY CANVAS: TACTILE BEIGE CARD */}
      <div className={`flex-1 min-h-0 flex flex-col rounded-2xl border shadow-sm overflow-hidden ${
        isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#faf8f4] border-[#203247]/12'
      }`}>
        {/* DEDICATED CANVAS TOP BAR: STATUS INSIGHT & TACTICAL LEGEND */}
        <div className={`flex items-center justify-between gap-3 px-4 py-2 border-b shrink-0 ${
          isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white/60 border-[#203247]/10'
        }`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`p-1 rounded-lg shrink-0 ${
              isDone 
                ? (shortestPath.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') 
                : 'bg-[#347f7a]/10 text-[#347f7a]'
            }`}>
              {isDone ? (shortestPath.length > 0 ? <Sparkles size={13} /> : <Info size={13} />) : <Compass size={13} />}
            </span>
            <span className={`text-xs ${
              isDone 
                ? (shortestPath.length > 0 ? 'text-emerald-800 font-semibold' : 'text-rose-700 font-semibold') 
                : 'text-[#203247] font-medium'
            }`}>
              {teacherInsight}
            </span>
          </div>

          {/* Tactical Legend */}
          <div className="flex items-center gap-2.5 text-[#526b88] text-[10px] font-medium shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-xs" /> Start
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-xs" /> Target
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#203247] inline-block shadow-xs" /> Wall
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#f59e0b] inline-block shadow-xs" /> Path
            </span>
          </div>
        </div>

        {/* GRID CANVAS STAGE - SEAMLESS INSIDE CANVAS */}
        <div 
          className={`pathfinding-grid-container flex-1 min-h-0 w-full h-full flex items-center justify-center p-3 sm:p-4 overflow-hidden ${
            isDarkMode ? 'bg-[#0f172a]' : ''
          }`}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="path-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              aspectRatio: `${COLS} / ${ROWS}`,
              maxWidth: '100%',
              maxHeight: '100%',
              width: '100%',
              gap: '1.5px',
              padding: '5px',
              boxSizing: 'border-box'
            }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const k = keyFor(r, c);
                const isStart = r === startPos.r && c === startPos.c;
                const isTarget = r === targetPos.r && c === targetPos.c;
                const isWall = walls.has(k);
                const isShortestPath = pathSet.has(k);
                const isVisited = visitedSet.has(k);

                let cellClass = 'grid-cell';
                if (isStart) cellClass += ' start';
                else if (isTarget) cellClass += ' target';
                else if (isShortestPath) cellClass += ' path';
                else if (isVisited) cellClass += ' visited';
                else if (isWall) cellClass += ' wall';

                return (
                  <div
                    key={k}
                    className={cellClass}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                  >
                    {isStart && <MapPin className="w-[60%] h-[60%] text-white drop-shadow-sm" />}
                    {isTarget && <Flag className="w-[55%] h-[55%] text-white drop-shadow-sm" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PLAYBACK SCRUBBER & LIVE TELEMETRY BAR AT THE BOTTOM */}
        <div className="algo-playback-bar shrink-0">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={runPathfinding}
              disabled={isRunning}
              className="algo-ctrl-btn primary px-4 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Play size={13} fill="currentColor" /> Launch Search
            </button>
            <button
              onClick={clearSearchPathOnly}
              disabled={isRunning}
              className={`algo-ctrl-btn px-3 py-1.5 text-xs font-medium cursor-pointer ${
                isDarkMode ? 'bg-[#1e293b] text-slate-300 border-slate-700 hover:bg-slate-800' : ''
              }`}
            >
              Clear Path
            </button>
          </div>

          {/* Live Metrics & Speed */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="metric-badge green">Visited: {visitedNodes.length}</span>
              <span className="metric-badge amber">Path: {shortestPath.length}</span>
            </div>

            <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border ${
              isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-[#203247]/10'
            }`}>
              <span className="font-mono text-[10px] text-[#647895] font-bold">SPEED:</span>
              {[1.0, 2.0, 4.0].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer border-none transition-all ${
                    speedMultiplier === s
                      ? 'bg-[#347f7a] text-white'
                      : isDarkMode
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-[#526b88] hover:bg-slate-100'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
