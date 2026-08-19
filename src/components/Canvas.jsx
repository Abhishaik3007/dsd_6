import React, { useRef } from 'react';
import GateNode from './GateNode';
import TruthTableNotebook from './TruthTableNotebook';
import { getPortCoordinates } from '../utils/layout';
import { Play } from 'lucide-react';

export default function Canvas({
  nodes,
  connections,
  draggingNodeId,
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
  onCanvasMouseUp
}) {
  const matRef = useRef(null);

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
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          onCanvasDrop(e, x, y);
        }
      }}
      onMouseMove={(e) => {
        if (matRef.current) {
          const rect = matRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          onCanvasMouseMove(e, x, y);
        }
      }}
      onMouseUp={onCanvasMouseUp}
    >
      {/* Green Cutting Mat Deskmat (Responsive sizing) */}
      <div 
        className="cutting-mat"
        ref={matRef}
      >
        {/* Metric Rulers, Degree Lines, and Mat Markings SVG Layer */}
        <svg className="mat-grid-markings">
          <defs>
            <pattern id="centimeter-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <path d="M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.5" />
              <path d="M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#centimeter-grid)" />
        </svg>

        {/* Protractor Guidelines - Anchored to bottom-left corner */}
        <svg 
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            width: '300px', 
            height: '300px', 
            pointerEvents: 'none', 
            opacity: 0.12 
          }}
          viewBox="0 0 300 300"
        >
          <path d="M 0 300 A 200 200 0 0 0 200 100" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M 0 300 A 270 270 0 0 0 270 30" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="0" y1="300" x2="212" y2="88" stroke="white" strokeWidth="1" />
          <line x1="0" y1="300" x2="150" y2="150" stroke="white" strokeWidth="1.5" />
        </svg>

        {/* Warning and Branding Labels (Positioned absolute via CSS classes) */}
        <div className="mat-label-warning">
          WARNING: DO NOT CUT ON WOODEN SURFACE<br />
          GRID UNIT: 10mm (SUBDIVIDED)
        </div>

        <div className="mat-label-branding">
          LOGICRAFT DSD MAT<br />
          MODEL A1 - RESPONSIVE DESKMAT
        </div>

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
              onMouseDown={onNodeMouseDown}
              onToggleInput={onToggleInput}
              onDelete={onDeleteNode}
              onStartConnection={onStartConnection}
              onCompleteConnection={onCompleteConnection}
            />
          ))}
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
        <div className="sticky-note">
          <div className="sticky-pin" />
          <h4>Shortcuts</h4>
          <ul>
            <li><strong>Drag & Drop</strong> toolbox gates</li>
            <li><strong>Drag copper pins</strong> to connect</li>
            <li><strong>Click wire</strong> to delete connection</li>
            <li><strong>Click toggles</strong> to test logic flow</li>
          </ul>
        </div>

        {/* Bottom toolbar indicators */}
        <div className="bottom-controls">
          <button className="bottom-control-btn active" title="Select Tool">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </button>
          <button className="bottom-control-btn" title="Pan Tool">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 10a7 7 0 0 1 14 0v4a7 7 0 0 1-14 0z" />
            </svg>
          </button>
          <button className="bottom-control-btn" title="Text Annotation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 20h9M3 20v-4L14 5l4 4L7 20H3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
