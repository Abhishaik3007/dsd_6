import React, { useEffect, useRef, useState } from 'react';
import GateNode from './GateNode';
import TruthTableNotebook from './TruthTableNotebook';
import { getPortCoordinates } from '../utils/layout';
import { Maximize, Minimize, Minus, Plus, X } from 'lucide-react';

export default function Canvas({
  nodes,
  connections,
  draggingNodeId,
  draggingNodeOutside,
  showShortcuts,
  draggingWire,
  mousePos,
  onNodeMouseDown,
  onToggleInput,
  onDeleteNode,
  onStartConnection,
  onCompleteConnection,
  onDeleteConnection,
  onCanvasDrop,
  onCanvasDragOver,
  onCanvasMouseMove,
  onCanvasMouseUp,
  showTruthTable,
  onCloseShortcuts
}) {
  const matRef = useRef(null);
  const shortcutDragRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [shortcutPosition, setShortcutPosition] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.error('Fullscreen exit failed:', err);
      });
    }
  };

  const updateZoom = (nextZoom) => {
    setZoom(Math.min(1.5, Math.max(0.5, nextZoom)));
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      updateZoom(zoom + delta);
    } else {
      setPan((p) => ({
        x: Math.min(600, Math.max(-600, p.x - e.deltaX)),
        y: Math.min(600, Math.max(-600, p.y - e.deltaY))
      }));
    }
  };

  const handleHSliderPointer = (e) => {
    e.stopPropagation();
    const track = e.currentTarget;
    track.setPointerCapture?.(e.pointerId);
    const update = (evt) => {
      const rect = track.getBoundingClientRect();
      const relX = Math.min(Math.max(0, evt.clientX - rect.left), rect.width);
      const frac = relX / rect.width;
      const newX = Math.round(-600 + frac * 1200);
      setPan((p) => ({ ...p, x: newX }));
    };
    update(e);
  };

  const handleVSliderPointer = (e) => {
    e.stopPropagation();
    const track = e.currentTarget;
    track.setPointerCapture?.(e.pointerId);
    const update = (evt) => {
      const rect = track.getBoundingClientRect();
      const relY = Math.min(Math.max(0, evt.clientY - rect.top), rect.height);
      const frac = relY / rect.height;
      const newY = Math.round(600 - frac * 1200);
      setPan((p) => ({ ...p, y: newY }));
    };
    update(e);
  };

  // Helper to draw a smooth bezier curve path between two coordinates
  const getBezierPath = (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1) * 0.55;
    const curvature = Math.max(dx, 50);
    return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div
      className={`canvas-area ${draggingNodeId ? 'has-dragging-node' : ''} ${showShortcuts ? 'has-shortcuts' : ''} ${isPanning ? 'is-panning' : ''}`}
      onDragOver={onCanvasDragOver}
      onWheel={handleWheel}
      onPointerDown={(e) => {
        if (e.button === 1 || (e.button === 0 && !e.target.closest('.gate-node') && !e.target.closest('.port') && !e.target.closest('.zoom-controls') && !e.target.closest('.mat-border-slider-h') && !e.target.closest('.mat-border-slider-v') && !e.target.closest('.sticky-shortcuts-note'))) {
          setIsPanning(true);
          panStartRef.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            panX: pan.x,
            panY: pan.y
          };
        }
      }}
      onDrop={(e) => {
        if (matRef.current) {
          const rect = matRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          onCanvasDrop(e, x, y);
        }
      }}
      onPointerMove={(e) => {
        if (isPanning) {
          const dx = e.clientX - panStartRef.current.pointerX;
          const dy = e.clientY - panStartRef.current.pointerY;
          setPan({
            x: Math.min(600, Math.max(-600, panStartRef.current.panX + dx)),
            y: Math.min(600, Math.max(-600, panStartRef.current.panY + dy))
          });
          return;
        }

        if (matRef.current) {
          const rect = matRef.current.getBoundingClientRect();
          if (shortcutDragRef.current) {
            setShortcutPosition({
              left: e.clientX - rect.left - shortcutDragRef.current.offsetX,
              top: e.clientY - rect.top - shortcutDragRef.current.offsetY
            });
          }
          const isOutsideMat =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
          const zoomLayerEl = document.querySelector('.canvas-zoom-layer');
          let x = (e.clientX - rect.left - pan.x) / zoom;
          let y = (e.clientY - rect.top - pan.y) / zoom;
          if (zoomLayerEl) {
            const zRect = zoomLayerEl.getBoundingClientRect();
            const zScale = (zRect.width / (zoomLayerEl.offsetWidth || 1)) || zoom;
            x = (e.clientX - zRect.left) / zScale;
            y = (e.clientY - zRect.top) / zScale;
          }
          onCanvasMouseMove(e, x, y, isOutsideMat);
        }
      }}
      onPointerUp={(e) => {
        setIsPanning(false);
        shortcutDragRef.current = null;
        const releaseTarget = document.elementFromPoint(e.clientX, e.clientY) || e.target;
        const targetPort = releaseTarget.closest?.('.port-input');
        if (targetPort) {
          const nodeId = targetPort.dataset.nodeId;
          const portIndex = Number(targetPort.dataset.portIndex);
          if (nodeId && Number.isInteger(portIndex)) {
            onCompleteConnection(nodeId, portIndex);
          }
        }
        const rect = matRef.current?.getBoundingClientRect();
        const isOutsideMat = rect && (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        );
        onCanvasMouseUp(e, isOutsideMat);
      }}
      onPointerCancel={(e) => {
        setIsPanning(false);
        shortcutDragRef.current = null;
        onCanvasMouseUp(e);
      }}
    >
      <div
        className="cutting-mat"
        ref={matRef}
      >
        <svg className="mat-grid-markings">
          <defs>
            <pattern id="square-grid" x="54" y="54" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(202, 255, 230, 0.24)" strokeWidth="1" />
              <path d="M 20 0V40 M 0 20H40" fill="none" stroke="rgba(202, 255, 230, 0.24)" strokeWidth="0.8" strokeDasharray="1 4" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect x="54" y="54" width="calc(100% - 54px)" height="calc(100% - 54px)" fill="url(#square-grid)" />
          <rect className="mat-grid-border" x="54" y="54" width="calc(100% - 54px)" height="calc(100% - 54px)" fill="none" />
          <g className="mat-ruler" fill="none" stroke="rgba(202, 255, 230, 0.5)" strokeWidth="1">
            <line x1="0" y1="54" x2="100%" y2="54" />
            <line x1="54" y1="0" x2="54" y2="100%" />
            {Array.from({ length: 600 }, (_, index) => {
              const position = 54 + index * 4;
              const isMajor = index > 0 && index % 10 === 0;
              const isMedium = index > 0 && index % 5 === 0 && !isMajor;
              const isNumbered = index > 0 && index % 10 === 0;
              return (
                <g key={position}>
                  <path d={`M ${position} 54V${isMajor ? 30 : isMedium ? 36 : 42}`} />
                  <path d={`M 54 ${position}H${isMajor ? 30 : isMedium ? 36 : 42}`} />
                  {isNumbered && index / 10 <= 44 && (
                    <>
                      <text className="mat-ruler-label mat-ruler-label-horizontal" x={position} y="22" stroke="none">{index / 10}</text>
                      <text className="mat-ruler-label mat-ruler-label-vertical" x="26" y={position + 3} stroke="none">{index / 10}</text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <div
          className="canvas-zoom-layer"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '54px 54px' }}
        >
          <svg className="canvas-svg-layer">
            {connections.map((conn) => {
              const fromNode = nodes.find(n => n.id === conn.fromNodeId);
              const toNode = nodes.find(n => n.id === conn.toNodeId);

              if (!fromNode || !toNode) return null;

              const p1 = getPortCoordinates(fromNode, 'output');
              const p2 = getPortCoordinates(toNode, 'input', conn.toPortIndex);
              const pathD = getBezierPath(p1.x, p1.y, p2.x, p2.y);
              const isActive = fromNode.value;

              return (
                <g key={conn.id}>
                  <path
                    d={pathD}
                    className="wire-path-delete-zone"
                    onClick={() => onDeleteConnection(conn.id)}
                  />
                  <path
                    d={pathD}
                    className={`wire-path ${isActive ? 'active' : ''}`}
                  />
                  <path
                    d={pathD}
                    className="wire-path-flow"
                  />
                  <path
                    d={pathD}
                    className="wire-path-shine"
                  />
                </g>
              );
            })}

            {draggingWire && (
              <g>
                <path
                  d={getBezierPath(draggingWire.startX, draggingWire.startY, mousePos.x, mousePos.y)}
                  className="wire-path active"
                />
                <path
                  d={getBezierPath(draggingWire.startX, draggingWire.startY, mousePos.x, mousePos.y)}
                  className="wire-path-flow active-drag"
                />
                <path
                  d={getBezierPath(draggingWire.startX, draggingWire.startY, mousePos.x, mousePos.y)}
                  className="wire-path-shine"
                />
              </g>
            )}
          </svg>

          <div className="canvas-nodes-container">
            {nodes.map((node) => (
              <GateNode
                key={node.id}
                node={node}
                isDraggingOutside={draggingNodeId === node.id && draggingNodeOutside}
                onMouseDown={(e, nodeId) => {
                  const rect = matRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const canvasX = (e.clientX - rect.left - pan.x) / zoom;
                  const canvasY = (e.clientY - rect.top - pan.y) / zoom;
                  onNodeMouseDown(e, nodeId, canvasX, canvasY);
                }}
                onToggleInput={onToggleInput}
                onDeleteNode={onDeleteNode}
                onStartConnection={onStartConnection}
                onCompleteConnection={onCompleteConnection}
              />
            ))}
          </div>
        </div>

        {showTruthTable && (
          <TruthTableNotebook
            nodes={nodes}
            connections={connections}
          />
        )}

        {showShortcuts && (
          <div
            className="sticky-note sticky-shortcuts-note"
            style={shortcutPosition ? {
              left: `${shortcutPosition.left}px`,
              top: `${shortcutPosition.top}px`,
              right: 'auto',
              bottom: 'auto'
            } : {}}
            onPointerDown={(e) => {
              if (e.target.closest('.sticky-note-close') || e.target.closest('a') || e.target.closest('button')) {
                return;
              }
              const noteRect = e.currentTarget.getBoundingClientRect();
              const matRect = matRef.current?.getBoundingClientRect();
              if (!matRect) return;
              shortcutDragRef.current = {
                offsetX: e.clientX - noteRect.left,
                offsetY: e.clientY - noteRect.top
              };
              e.currentTarget.setPointerCapture?.(e.pointerId);
              if (!shortcutPosition) {
                setShortcutPosition({
                  left: noteRect.left - matRect.left,
                  top: noteRect.top - matRect.top
                });
              }
            }}
          >
            <div className="sticky-pin" />
            <button className="sticky-note-close" type="button" title="Close help" onClick={onCloseShortcuts}>
              <X size={14} />
            </button>
            <h4>How to use</h4>
            <ul>
              <li><strong>Drag & Drop</strong> toolbox gates</li>
              <li><strong>Drag copper pins</strong> to connect</li>
              <li><strong>Click wire</strong> to delete connection</li>
              <li><strong>Click toggles</strong> to test logic flow</li>
            </ul>
          </div>
        )}

        <div
          className="mat-border-slider-h"
          title="Horizontal Pan Canvas"
          onPointerDown={handleHSliderPointer}
          onPointerMove={(e) => {
            if (e.buttons === 1) handleHSliderPointer(e);
          }}
        >
          <div className="mat-slider-track">
            <div
              className="mat-slider-thumb"
              style={{ left: `calc(${((pan.x + 600) / 1200) * 100}% - 14px)` }}
            />
          </div>
        </div>

        <div
          className="mat-border-slider-v"
          title="Vertical Pan Canvas"
          onPointerDown={handleVSliderPointer}
          onPointerMove={(e) => {
            if (e.buttons === 1) handleVSliderPointer(e);
          }}
        >
          <div className="mat-slider-track">
            <div
              className="mat-slider-thumb"
              style={{ top: `calc(${((600 - pan.y) / 1200) * 100}% - 14px)` }}
            />
          </div>
        </div>

        <div className="zoom-controls" aria-label="Canvas zoom controls">
          <button className="zoom-control-btn" title="Zoom out" onClick={() => updateZoom(zoom - 0.1)}>
            <Minus size={18} />
          </button>
          <button
            className="zoom-level"
            title="Reset Zoom & Pan"
            onClick={() => {
              updateZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button className="zoom-control-btn" title="Zoom in" onClick={() => updateZoom(zoom + 0.1)}>
            <Plus size={18} />
          </button>
          <button
            className={`zoom-control-btn ${isFullscreen ? 'active-fullscreen' : ''}`}
            title={isFullscreen ? 'Exit Fullscreen Focus Mode' : 'Enter Fullscreen Focus Mode (Greenmat only)'}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}
