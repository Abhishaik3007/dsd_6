import React, { useRef, useState } from 'react';
import GateNode from './GateNode';
import TruthTableNotebook from './TruthTableNotebook';
import { getPortCoordinates } from '../utils/layout';
import { Maximize, Minus, Play, Plus, X } from 'lucide-react';

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
  onCloseShortcuts
}) {
  const matRef = useRef(null);
  const shortcutDragRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [shortcutPosition, setShortcutPosition] = useState(null);

  const updateZoom = (nextZoom) => {
    setZoom(Math.min(1.5, Math.max(0.5, nextZoom)));
  };

  // Helper to draw a smooth bezier curve path between two coordinates
  const getBezierPath = (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1) * 0.55;
    const curvature = Math.max(dx, 50);
    return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div 
      className="canvas-area"
      onDragOver={onCanvasDragOver}
      onDrop={(e) => {
        if (matRef.current) {
          const rect = matRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          onCanvasDrop(e, x, y);
        }
      }}
      onPointerMove={(e) => {
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
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          onCanvasMouseMove(e, x, y, isOutsideMat);
        }
      }}
      onPointerUp={(e) => {
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
        shortcutDragRef.current = null;
        onCanvasMouseUp(e);
      }}
    >
      {/* Green Cutting Mat Deskmat (Responsive sizing) */}
      <div 
        className="cutting-mat"
        ref={matRef}
      >
        {/* Fixed ruler frame: this stays in place while the workspace zooms. */}
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
          style={{ transform: `scale(${zoom})` }}
        >
          {/* SVG connection wires layer */}
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
                {/* Thick overlay for deleting connections */}
                <path
                  d={pathD}
                  className="wire-path-delete-zone"
                  onClick={() => onDeleteConnection(conn.id)}
                />
                {/* Cartoon line border */}
                <path
                  d={pathD}
                  className={`wire-path ${isActive ? 'active' : ''}`}
                  onClick={() => onDeleteConnection(conn.id)}
                />
                {/* Signal line flow indicator */}
                <path
                  d={pathD}
                  className="wire-path-flow"
                />
                {/* Glossy top streak line highlight */}
                <path
                  d={pathD}
                  className="wire-path-shine"
                />
              </g>
            );
          })}

          {/* Active wire drag drawing preview */}
          {draggingWire && (() => {
            const fromNode = nodes.find(n => n.id === draggingWire.fromNodeId);
            if (!fromNode) return null;

            const p1 = getPortCoordinates(fromNode, 'output');
            const pathD = getBezierPath(p1.x, p1.y, mousePos.x, mousePos.y);

            return (
              <path
                d={pathD}
                className="wire-path-preview"
              />
            );
          })()}
          </svg>

          {/* Nodes layer */}
          <div className="canvas-nodes-container">
          {nodes.map((node) => (
            <GateNode
              key={node.id}
              node={node}
              isDraggingOutside={draggingNodeId === node.id && draggingNodeOutside}
              onMouseDown={onNodeMouseDown}
              onToggleInput={onToggleInput}
              onDelete={onDeleteNode}
              onStartConnection={onStartConnection}
              onCompleteConnection={onCompleteConnection}
            />
          ))}
          </div>
        </div>

        {/* Empty State message */}
        {nodes.length === 0 && (
          <div className="empty-canvas-message">
            <div className="empty-canvas-icon">
              <Play size={64} color="rgba(255,255,255,0.12)" />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.5)' }}>Empty Workbench</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>
              Drag switches, gates, and LEDs from the toolbox on the left onto the cutting mat, then wire output pins to input pins.
            </p>
          </div>
        )}

        {/* Truth Table Notebook */}
        <TruthTableNotebook />

        {/* Yellow Paper Sticky Note Shortcuts */}
        {showShortcuts && (
          <div
            className="sticky-note"
            style={shortcutPosition ? {
              left: `${shortcutPosition.left}px`,
              top: `${shortcutPosition.top}px`,
              right: 'auto',
              bottom: 'auto'
            } : undefined}
            onPointerDown={(e) => {
              if (e.target.closest('.sticky-note-close')) return;
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

        <div className="zoom-controls" aria-label="Canvas zoom controls">
          <button className="zoom-control-btn" title="Zoom out" onClick={() => updateZoom(zoom - 0.1)}>
            <Minus size={18} />
          </button>
          <button className="zoom-level" title="Reset zoom" onClick={() => updateZoom(1)}>
            {Math.round(zoom * 100)}%
          </button>
          <button className="zoom-control-btn" title="Zoom in" onClick={() => updateZoom(zoom + 0.1)}>
            <Plus size={18} />
          </button>
          <button className="zoom-control-btn" title="Reset zoom to 100%" onClick={() => updateZoom(1)}>
            <Maximize size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
