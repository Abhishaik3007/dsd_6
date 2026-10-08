import React, { useRef, useState, useCallback, useEffect } from 'react';
import { TinkerBreadboard } from './TinkerBreadboard';
import { TinkerWireLayer } from './TinkerWireLayer';
import {
  TinkerResistor,
  TinkerLED,
  TinkerPushbutton,
  TinkerSlideSwitch,
  Tinker9VBattery,
  TinkerCoinCell,
  TinkerAABattery,
  TinkerPotentiometer,
  TinkerCapacitor,
  TinkerVibrationMotor,
  TinkerDiode,
  TinkerPhotoresistor,
  TinkerRGBLED,
  TinkerDCMotor,
  TinkerArduinoUno,
  TinkerTransistorNpn
} from './TinkerComponents';
import { getEndpointWorldPos, getComponentPinWorldPos, getBreadboardHoleWorldPos } from './engine/tinkerGeometry';

export const TinkerCanvas = ({
  breadboards = [],
  components = [],
  wires = [],
  simulationActive = false,
  simulationResult = null,
  activeWireColor = '#38A169',
  selectedId = null,
  selectedType = null,
  isDarkMode = false,
  onPlaceComponent,
  onSelect,
  onAddWire,
  onUpdateWire,
  onUpdateComponent,
  onUpdateBreadboard,
  onTogglePushbutton,
  onToggleSlideSwitch
}) => {
  const containerRef = useRef(null);

  // Pan & Zoom Transform State
  const [transform, setTransform] = useState({ x: 80, y: 60, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Component Dragging State
  const [draggingCompId, setDraggingCompId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Breadboard Dragging State
  const [draggingBbId, setDraggingBbId] = useState(null);

  // Wire Waypoint Dragging State
  const [draggingWaypoint, setDraggingWaypoint] = useState(null); // { wireId, index }

  // Wire In-Progress State (supports multiple corner waypoints!)
  const [wireStart, setWireStart] = useState(null); // { from, waypoints: [{x, y}], color }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredHole, setHoveredHole] = useState(null);
  const lastWireTimeRef = useRef(0);

  // Convert screen coordinates to world canvas coordinates
  const screenToWorld = useCallback((screenX, screenY) => {
    if (!containerRef.current) return { x: screenX, y: screenY };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - transform.x) / transform.scale,
      y: (screenY - rect.top - transform.y) / transform.scale
    };
  }, [transform]);

  // Handle Zoom via Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(5.0, Math.max(0.3, transform.scale * zoomFactor));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
      y: mouseY - (mouseY - prev.y) * (newScale / prev.scale)
    }));
  };

  // Background Click (or Add Corner Waypoint if routing a wire!)
  const handleMouseDownBackground = (e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);

    // If wire is in progress, clicking on empty canvas ADDS A CORNER WAYPOINT! (Tinkercad feature!)
    if (wireStart) {
      if (e.button === 0) {
        setWireStart(prev => ({
          ...prev,
          waypoints: [...(prev.waypoints || []), { x: Math.round(worldPos.x), y: Math.round(worldPos.y) }]
        }));
      } else {
        // Right click cancels or pops last waypoint
        if (wireStart.waypoints?.length > 0) {
          setWireStart(prev => ({
            ...prev,
            waypoints: prev.waypoints.slice(0, -1)
          }));
        } else {
          setWireStart(null);
        }
      }
      return;
    }

    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      onSelect && onSelect(null, null);
    }
  };

  // Global Mouse Move (Instantaneous 60fps tracking)
  const handleMouseMove = (e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMousePos(worldPos);

    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
    } else if (draggingCompId) {
      // Direct drag update without lag
      onUpdateComponent && onUpdateComponent(draggingCompId, {
        x: Math.round(worldPos.x - dragOffset.x),
        y: Math.round(worldPos.y - dragOffset.y)
      });
    } else if (draggingBbId) {
      // Direct breadboard drag update without lag
      onUpdateBreadboard && onUpdateBreadboard(draggingBbId, {
        x: Math.round(worldPos.x - dragOffset.x),
        y: Math.round(worldPos.y - dragOffset.y)
      });
    } else if (draggingWaypoint) {
      // Dragging a wire's corner waypoint!
      const { wireId, index } = draggingWaypoint;
      const wire = wires.find(w => w.id === wireId);
      if (wire) {
        const newWaypoints = [...(wire.waypoints || [])];
        newWaypoints[index] = { x: Math.round(worldPos.x), y: Math.round(worldPos.y) };
        onUpdateWire && onUpdateWire(wireId, { waypoints: newWaypoints });
      }
    }
  };

  // Global Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
    setDraggingBbId(null);
    setDraggingWaypoint(null);
  };

  // Keyboard Shortcuts: Esc to cancel wire in progress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (wireStart) {
          if (wireStart.waypoints?.length > 0) {
            setWireStart(prev => ({
              ...prev,
              waypoints: prev.waypoints.slice(0, -1)
            }));
          } else {
            setWireStart(null);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wireStart]);

  // Handle Breadboard Hole Click
  const handleHoleClick = useCallback((holeData) => {
    if (Date.now() - lastWireTimeRef.current < 100) return;

    const endpoint = {
      type: 'hole',
      bbId: holeData.bbId,
      holeType: holeData.holeType,
      col: holeData.col,
      row: holeData.row
    };

    if (!wireStart) {
      // Start drawing wire from this hole
      setWireStart({
        from: endpoint,
        waypoints: [],
        color: activeWireColor
      });
    } else {
      // Complete wire to this hole with all collected corner waypoints!
      if (wireStart.from.type === 'hole' &&
        wireStart.from.bbId === holeData.bbId &&
        wireStart.from.col === holeData.col &&
        wireStart.from.row === holeData.row &&
        (!wireStart.waypoints || wireStart.waypoints.length === 0)) {
        setWireStart(null);
        return;
      }

      // Check if a wire already connects these exact two endpoints
      const endpointsMatch = (ep1, ep2) => {
        if (!ep1 || !ep2) return false;
        if (ep1.type !== ep2.type) return false;
        if (ep1.type === 'hole') {
          return ep1.bbId === ep2.bbId && ep1.holeType === ep2.holeType && ep1.col === ep2.col && ep1.row === ep2.row;
        }
        if (ep1.type === 'component') {
          return ep1.compId === ep2.compId && ep1.pinKey === ep2.pinKey;
        }
        return false;
      };

      const existingWire = wires.find(w => {
        const direct = endpointsMatch(w.from, wireStart.from) && endpointsMatch(w.to, endpoint);
        const reverse = endpointsMatch(w.from, endpoint) && endpointsMatch(w.to, wireStart.from);
        return direct || reverse;
      });

      lastWireTimeRef.current = Date.now();

      if (existingWire) {
        onUpdateWire && onUpdateWire(existingWire.id, { color: wireStart.color || activeWireColor });
        onSelect && onSelect(existingWire.id, 'wire');
        setWireStart(null);
        return;
      }

      onAddWire && onAddWire({
        id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        from: wireStart.from,
        to: endpoint,
        waypoints: wireStart.waypoints || [],
        color: wireStart.color || activeWireColor
      });
      setWireStart(null);
    }
  }, [wireStart, activeWireColor, onAddWire, wires, onUpdateWire, onSelect]);

  // Handle Component Pin Click
  const handlePinClick = useCallback((comp, pinKey) => {
    if (Date.now() - lastWireTimeRef.current < 100) return;

    const endpoint = {
      type: 'component',
      compId: comp.id,
      pinKey
    };

    if (!wireStart) {
      // Start drawing wire from component pin
      setWireStart({
        from: endpoint,
        waypoints: [],
        color: activeWireColor
      });
    } else {
      // Complete wire to this pin with all collected corner waypoints!
      if (wireStart.from.type === 'component' &&
        wireStart.from.compId === comp.id &&
        wireStart.from.pinKey === pinKey &&
        (!wireStart.waypoints || wireStart.waypoints.length === 0)) {
        setWireStart(null);
        return;
      }

      // Check if a wire already connects these exact two endpoints
      const endpointsMatch = (ep1, ep2) => {
        if (!ep1 || !ep2) return false;
        if (ep1.type !== ep2.type) return false;
        if (ep1.type === 'hole') {
          return ep1.bbId === ep2.bbId && ep1.holeType === ep2.holeType && ep1.col === ep2.col && ep1.row === ep2.row;
        }
        if (ep1.type === 'component') {
          return ep1.compId === ep2.compId && ep1.pinKey === ep2.pinKey;
        }
        return false;
      };

      const existingWire = wires.find(w => {
        const direct = endpointsMatch(w.from, wireStart.from) && endpointsMatch(w.to, endpoint);
        const reverse = endpointsMatch(w.from, endpoint) && endpointsMatch(w.to, wireStart.from);
        return direct || reverse;
      });

      lastWireTimeRef.current = Date.now();

      if (existingWire) {
        onUpdateWire && onUpdateWire(existingWire.id, { color: wireStart.color || activeWireColor });
        onSelect && onSelect(existingWire.id, 'wire');
        setWireStart(null);
        return;
      }

      onAddWire && onAddWire({
        id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        from: wireStart.from,
        to: endpoint,
        waypoints: wireStart.waypoints || [],
        color: wireStart.color || activeWireColor
      });
      setWireStart(null);
    }
  }, [wireStart, activeWireColor, onAddWire, wires, onUpdateWire, onSelect]);

  // Start Dragging a Breadboard
  const handleBreadboardMouseDown = (e, bb) => {
    if (wireStart) return;
    e.stopPropagation();
    onSelect && onSelect(bb.id, 'breadboard');
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setDraggingBbId(bb.id);
    setDragOffset({
      x: worldPos.x - bb.x,
      y: worldPos.y - bb.y
    });
  };

  // Start Dragging a Component
  const handleComponentMouseDown = (e, comp) => {
    e.stopPropagation();
    onSelect && onSelect(comp.id, 'component');
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setDraggingCompId(comp.id);
    setDragOffset({
      x: worldPos.x - comp.x,
      y: worldPos.y - comp.y
    });
  };

  // Start Dragging a Wire Waypoint
  const handleWaypointDragStart = (wireId, index, action, e) => {
    onSelect && onSelect(wireId, 'wire');
    setDraggingWaypoint({ wireId, index });
  };

  // Double Click Wire to Insert New Corner Waypoint into the clicked segment
  const handleAddWireWaypoint = (wireId, e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const wire = wires.find(w => w.id === wireId);
    if (!wire) return;

    const p1 = wire.from ? getEndpointWorldPos(wire.from, components, breadboards) : { x: wire.x1, y: wire.y1 };
    const p2 = wire.to ? getEndpointWorldPos(wire.to, components, breadboards) : { x: wire.x2, y: wire.y2 };
    const waypoints = wire.waypoints || [];

    const pts = [p1, ...waypoints, p2];

    // Find which segment was clicked by finding minimum perpendicular distance
    let bestSegmentIndex = 0;
    let minDistanceSq = Infinity;

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;

      let distSq;
      if (lenSq === 0) {
        distSq = (worldPos.x - a.x) ** 2 + (worldPos.y - a.y) ** 2;
      } else {
        const t = Math.max(0, Math.min(1, ((worldPos.x - a.x) * dx + (worldPos.y - a.y) * dy) / lenSq));
        const projX = a.x + t * dx;
        const projY = a.y + t * dy;
        distSq = (worldPos.x - projX) ** 2 + (worldPos.y - projY) ** 2;
      }

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestSegmentIndex = i;
      }
    }

    // Insert at the exact segment index in waypoints array
    const newWaypoints = [...waypoints];
    newWaypoints.splice(bestSegmentIndex, 0, {
      x: Math.round(worldPos.x),
      y: Math.round(worldPos.y)
    });

    onSelect && onSelect(wireId, 'wire');
    onUpdateWire && onUpdateWire(wireId, { waypoints: newWaypoints });
  };

  // Double Click Waypoint to Remove It
  const handleRemoveWireWaypoint = (wireId, index) => {
    const wire = wires.find(w => w.id === wireId);
    if (!wire) return;
    const newWaypoints = (wire.waypoints || []).filter((_, i) => i !== index);
    onUpdateWire && onUpdateWire(wireId, { waypoints: newWaypoints });
  };

  // Active wire live starting point
  const activeWireStartPos = wireStart ? getEndpointWorldPos(wireStart.from, components, breadboards) : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDownBackground}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const worldPos = screenToWorld(e.clientX, e.clientY);
        setMousePos(worldPos);
      }}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const json = e.dataTransfer.getData('application/json');
          if (json) {
            const catalogItem = JSON.parse(json);
            const worldPos = screenToWorld(e.clientX, e.clientY);
            onPlaceComponent && onPlaceComponent(catalogItem, worldPos);
          }
        } catch (err) {
          console.error('Canvas onDrop parse error:', err);
        }
      }}
      onContextMenu={e => {
        // Prevent browser context menu during wire drawing
        if (wireStart) e.preventDefault();
      }}
      className={`relative w-full h-full overflow-hidden select-none transition-colors duration-300 ${isDarkMode ? 'bg-[#0B132B] bg-grid-paper-dark' : 'bg-[#FAF7F2] bg-grid-paper'
        } ${wireStart ? 'cursor-crosshair' : 'cursor-default'}`}
    >
      {/* Bottom Right Canvas Reset & Zoom Controls (Horizontal / 90° Rotated) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-row items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-[#203247]/12 dark:border-slate-700/80 rounded-xl shadow-md p-1 font-space-grotesk">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.85) }))}
          title="Zoom Out"
          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#347F7A] dark:hover:text-teal-400 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors font-bold text-sm cursor-pointer"
        >
          -
        </button>
        <span className="text-[11px] font-mono px-1 font-bold text-slate-500 dark:text-slate-400 select-none min-w-[44px] text-center">
          {Math.round(transform.scale * 100)}%
        </span>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(5.0, prev.scale * 1.15) }))}
          title="Zoom In"
          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#347F7A] dark:hover:text-teal-400 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors font-bold text-sm cursor-pointer"
        >
          +
        </button>
        <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />
        <button
          onClick={() => setTransform({ x: 80, y: 60, scale: 1 })}
          title="Reset View (100%)"
          className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#347F7A] dark:hover:text-teal-400 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-lg transition-colors text-sm cursor-pointer"
        >
          ⛶
        </button>
      </div>

      {/* Wire In-Progress Floating Helper Banner (Centered) */}
      {wireStart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#203247]/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-teal-500/30 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 font-space-grotesk whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>Routing Wire: Click empty space for corners • Connect to pin/hole • Esc to cancel</span>
        </div>
      )}

      {/* SVG Canvas Layer */}
      <svg
        className="w-full h-full pointer-events-auto"
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* 1. Breadboards */}
          {breadboards.map(bb => (
            <TinkerBreadboard
              key={bb.id}
              id={bb.id}
              x={bb.x}
              y={bb.y}
              isSelected={selectedId === bb.id && selectedType === 'breadboard'}
              onMouseDown={e => handleBreadboardMouseDown(e, bb)}
              onHoleClick={handleHoleClick}
              hoveredHole={hoveredHole}
              onHoverHole={setHoveredHole}
              activeWireSource={wireStart}
            />
          ))}

          {/* 2. Physical Components */}
          {components.map(comp => {
            const isSelected = selectedId === comp.id && selectedType === 'component';
            const state = simulationResult?.componentStates?.[comp.id] || {};

            switch (comp.type) {
              case 'resistor':
                return (
                  <TinkerResistor
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    resistance={comp.props?.resistance || 220}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'led':
                return (
                  <TinkerLED
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    color={comp.props?.color || 'red'}
                    isLit={simulationActive && state.isLit}
                    isBurnedOut={simulationActive && state.isBurnedOut}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'pushbutton':
                return (
                  <TinkerPushbutton
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    isPressed={comp.state?.isPressed || false}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPressToggle={() => onTogglePushbutton && onTogglePushbutton(comp.id)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'slideswitch':
                return (
                  <TinkerSlideSwitch
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    position={comp.state?.position || 'left'}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onToggle={() => onToggleSlideSwitch && onToggleSlideSwitch(comp.id)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'battery_9v':
                return (
                  <Tinker9VBattery
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'battery_coin':
                return (
                  <TinkerCoinCell
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'battery_aa':
                return (
                  <TinkerAABattery
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'potentiometer':
                return (
                  <TinkerPotentiometer
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    value={comp.state?.value ?? 50}
                    onChange={(newVal) => {
                      if (onUpdateComponent) {
                        onUpdateComponent(comp.id, {
                          state: { ...(comp.state || {}), value: newVal }
                        });
                      }
                    }}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'capacitor':
                return (
                  <TinkerCapacitor
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    capacitance={comp.props?.capacitance || '100µF'}
                    voltage={comp.props?.voltage || '25V'}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'vibration_motor':
                const motorState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerVibrationMotor
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    isVibrating={Boolean(motorState?.isVibrating)}
                    isBurnedOut={Boolean(motorState?.isBurnedOut)}
                    rpm={motorState?.rpm || 0}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'diode':
                const diodeState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerDiode
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    model={comp.props?.model || '1N4007'}
                    isConducting={Boolean(diodeState?.isConducting)}
                    isBlocking={Boolean(diodeState?.isBlocking)}
                    isBurnedOut={Boolean(diodeState?.isBurnedOut)}
                    currentMa={diodeState?.currentMa || 0}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'photoresistor':
                return (
                  <TinkerPhotoresistor
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    light={comp.props?.light ?? 50}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'led_rgb':
                const rgbState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerRGBLED
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    common={comp.props?.common || 'cathode'}
                    rLit={Boolean(rgbState?.rLit)}
                    gLit={Boolean(rgbState?.gLit)}
                    bLit={Boolean(rgbState?.bLit)}
                    isBurnedOut={Boolean(rgbState?.isBurnedOut)}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'dc_motor':
                const dcMotorState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerDCMotor
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    isSpinning={Boolean(dcMotorState?.isSpinning)}
                    isBurnedOut={Boolean(dcMotorState?.isBurnedOut)}
                    isOverdriven={Boolean(dcMotorState?.isOverdriven)}
                    direction={dcMotorState?.direction || 'cw'}
                    rpm={dcMotorState?.rpm || 0}
                    voltage={dcMotorState?.voltage || 0}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'arduino_uno':
                const unoState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerArduinoUno
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    isOn={Boolean(simulationActive)}
                    lLedState={Boolean(simulationActive && (unoState?.lLedState ?? true))}
                    txLedState={Boolean(simulationActive && unoState?.txLedState)}
                    rxLedState={Boolean(simulationActive && unoState?.rxLedState)}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              case 'transistor_npn':
              case 'transistor':
                const transistorState = simulationActive && simulationResult?.componentStates?.[comp.id];
                return (
                  <TinkerTransistorNpn
                    key={comp.id}
                    x={comp.x}
                    y={comp.y}
                    rotation={comp.rotation || 0}
                    isSelected={isSelected}
                    model={comp.props?.model || '2N2222'}
                    isConducting={Boolean(transistorState?.isConducting)}
                    isSaturated={Boolean(transistorState?.isSaturated)}
                    currentMa={transistorState?.collectorCurrentMa || 0}
                    baseCurrentMa={transistorState?.baseCurrentMa || 0}
                    onMouseDown={e => handleComponentMouseDown(e, comp)}
                    onPinClick={(pinKey) => handlePinClick(comp, pinKey)}
                  />
                );

              default:
                return null;
            }
          })}

          {/* 3. Wires Layer (Live tracking of all component pins and corner waypoints) */}
          <TinkerWireLayer
            wires={wires}
            activeWire={activeWireStartPos ? {
              x1: activeWireStartPos.x,
              y1: activeWireStartPos.y,
              x2: mousePos.x,
              y2: mousePos.y,
              waypoints: wireStart.waypoints || [],
              color: wireStart.color
            } : null}
            selectedWireId={selectedType === 'wire' ? selectedId : null}
            components={components}
            breadboards={breadboards}
            onSelectWire={wireId => {
              setWireStart(null);
              onSelect && onSelect(wireId, 'wire');
            }}
            onUpdateWireWaypoint={handleWaypointDragStart}
            onAddWireWaypoint={handleAddWireWaypoint}
            onRemoveWireWaypoint={handleRemoveWireWaypoint}
          />
        </g>
      </svg>
    </div>
  );
};
