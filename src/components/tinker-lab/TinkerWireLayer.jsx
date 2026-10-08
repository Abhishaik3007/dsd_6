import React, { memo } from 'react';
import { getEndpointWorldPos } from './engine/tinkerGeometry';

// Harmonious darker border color map matching the authentic vibration motor wire insulation
const WIRE_BORDER_MAP = {
  '#e53e3e': '#991B1B', // red (matches vibration motor red lead)
  '#ef4444': '#991B1B',
  '#f87171': '#991B1B',
  '#dc2626': '#7F1D1D',
  '#1a202c': '#020617', // black
  '#000000': '#020617',
  '#0f172a': '#020617',
  '#38a169': '#1B4D2E', // green
  '#22c55e': '#15803D',
  '#16a34a': '#14532D',
  '#3182ce': '#1E3A8A', // blue (matches vibration motor blue lead)
  '#3b82f6': '#1E3A8A',
  '#2563eb': '#1E3A8A',
  '#ecc94b': '#B45309', // yellow
  '#eab308': '#A16207',
  '#facc15': '#854D0E',
  '#dd6b20': '#9A3412', // orange
  '#ea580c': '#7C2D12',
  '#f97316': '#9A3412',
  '#805ad5': '#581C87', // purple
  '#9333ea': '#581C87',
  '#8b4513': '#451A03', // brown
  '#78350f': '#451A03',
  '#e2e8f0': '#94A3B8', // white
  '#ffffff': '#94A3B8',
  '#f8fafc': '#94A3B8',
  '#06b6d4': '#0E7490', // cyan
  '#ec4899': '#9D174D'  // pink
};

export const getWireBorderColor = (color) => {
  if (!color) return '#1E3A8A';
  const lower = color.toLowerCase();
  if (WIRE_BORDER_MAP[lower]) return WIRE_BORDER_MAP[lower];

  if (lower.startsWith('#') && (lower.length === 7 || lower.length === 4)) {
    let r, g, b;
    if (lower.length === 7) {
      r = parseInt(lower.slice(1, 3), 16);
      g = parseInt(lower.slice(3, 5), 16);
      b = parseInt(lower.slice(5, 7), 16);
    } else {
      r = parseInt(lower[1] + lower[1], 16);
      g = parseInt(lower[2] + lower[2], 16);
      b = parseInt(lower[3] + lower[3], 16);
    }
    const factor = 0.6; // 40% darker for rich outer insulation edge
    const darkR = Math.max(0, Math.floor(r * factor)).toString(16).padStart(2, '0');
    const darkG = Math.max(0, Math.floor(g * factor)).toString(16).padStart(2, '0');
    const darkB = Math.max(0, Math.floor(b * factor)).toString(16).padStart(2, '0');
    return `#${darkR}${darkG}${darkB}`;
  }
  return '#1A202C';
};

/**
 * High-performance wire layer that dynamically tracks live component and breadboard coordinates,
 * renders smooth rounded fillet corners (like Tinkercad), and matches the clean vibration motor wire style.
 */
export const TinkerWireLayer = memo(({
  wires = [],
  activeWire = null,
  selectedWireId = null,
  components = [],
  breadboards = [],
  onSelectWire,
  onUpdateWireWaypoint,
  onAddWireWaypoint,
  onRemoveWireWaypoint
}) => {
  // Generates clean polyline path with smooth rounded corners at every bend point
  const getWirePath = (x1, y1, x2, y2, waypoints = []) => {
    if (!waypoints || waypoints.length === 0) {
      // Natural gentle curve if no waypoints
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const sag = Math.min(60, Math.max(12, dist * 0.15));

      const cx1 = x1 + dx * 0.25;
      const cy1 = y1 + dy * 0.25 + sag;
      const cx2 = x1 + dx * 0.75;
      const cy2 = y1 + dy * 0.75 + sag;

      return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    }

    // Full list of points: Start -> Waypoint 1 -> ... -> Waypoint N -> End
    const pts = [
      { x: x1, y: y1 },
      ...waypoints,
      { x: x2, y: y2 }
    ];

    const CORNER_RADIUS = 12; // Radius of the rounded corner
    let d = `M ${Math.round(pts[0].x)} ${Math.round(pts[0].y)}`;

    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const next = pts[i + 1];

      // Distance from current corner to prev and next
      const dPrev = Math.hypot(prev.x - curr.x, prev.y - curr.y);
      const dNext = Math.hypot(next.x - curr.x, next.y - curr.y);

      // Clamp radius so corners never overlap
      const r = Math.min(CORNER_RADIUS, dPrev / 2, dNext / 2);

      if (r < 2) {
        // Points too close together, straight line to corner
        d += ` L ${Math.round(curr.x)} ${Math.round(curr.y)}`;
      } else {
        // Point before corner
        const startX = curr.x + ((prev.x - curr.x) / dPrev) * r;
        const startY = curr.y + ((prev.y - curr.y) / dPrev) * r;

        // Point after corner
        const endX = curr.x + ((next.x - curr.x) / dNext) * r;
        const endY = curr.y + ((next.y - curr.y) / dNext) * r;

        // Line to start of corner curve, then Quadratic curve rounded through the corner!
        d += ` L ${Math.round(startX)} ${Math.round(startY)} Q ${Math.round(curr.x)} ${Math.round(curr.y)}, ${Math.round(endX)} ${Math.round(endY)}`;
      }
    }

    // Line to final target endpoint
    const last = pts[pts.length - 1];
    d += ` L ${Math.round(last.x)} ${Math.round(last.y)}`;
    return d;
  };

  return (
    <g className="tinker-wire-layer select-none pointer-events-auto">
      {/* 1. Existing Finished Wires */}
      {wires.map(wire => {
        const isSelected = selectedWireId === wire.id;
        const p1 = wire.from ? getEndpointWorldPos(wire.from, components, breadboards) : { x: wire.x1, y: wire.y1 };
        const p2 = wire.to ? getEndpointWorldPos(wire.to, components, breadboards) : { x: wire.x2, y: wire.y2 };
        const waypoints = wire.waypoints || [];

        const pathData = getWirePath(p1.x, p1.y, p2.x, p2.y, waypoints);
        const color = wire.color || '#38A169';
        const borderColor = getWireBorderColor(color);

        return (
          <g
            key={wire.id}
            className="cursor-pointer group"
            onMouseDown={e => {
              e.stopPropagation();
              onSelectWire && onSelectWire(wire.id);
            }}
            onClick={e => {
              e.stopPropagation();
              onSelectWire && onSelectWire(wire.id);
            }}
            onDoubleClick={e => {
              // Double click on wire inserts a new corner waypoint!
              e.stopPropagation();
              onAddWireWaypoint && onAddWireWaypoint(wire.id, e);
            }}
          >
            {/* Wide transparent hit-area for easy clicking/selecting */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Subtle ambient ground contact shadow */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0, 1.2)"
            />

            {/* Selected highlight aura */}
            {isSelected && (
              <path
                d={pathData}
                fill="none"
                stroke="#347F7A"
                strokeWidth="6.5"
                strokeOpacity="0.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Outer Insulation Border (3.2px - exactly matches vibration motor flying leads) */}
            <path
              d={pathData}
              fill="none"
              stroke={borderColor}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Inner Core Insulation (2.0px - vibrant wire color matching vibration motor leads) */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Corner Waypoint Handles */}
            {isSelected && waypoints.map((wp, idx) => (
              <g
                key={`wp_${wire.id}_${idx}`}
                className="cursor-move group/handle"
                onMouseDown={e => {
                  e.stopPropagation();
                  onUpdateWireWaypoint && onUpdateWireWaypoint(wire.id, idx, 'start_drag', e);
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  onRemoveWireWaypoint && onRemoveWireWaypoint(wire.id, idx);
                }}
              >
                {/* Large Transparent Hit Circle - Prevents any flickering or edge loss */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="14"
                  fill="transparent"
                />

                {/* Outer solid ring */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="6.5"
                  fill="#FFFFFF"
                  stroke="#3182CE"
                  strokeWidth="2.5"
                  className="group-hover/handle:stroke-[#2B6CB0] group-hover/handle:fill-[#EBF8FF]"
                />

                {/* Center dot */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r="2.5"
                  fill="#3182CE"
                  className="group-hover/handle:fill-[#2B6CB0]"
                />
              </g>
            ))}
          </g>
        );
      })}

      {/* 2. In-Progress Active Wire being drawn (with rounded corners!) */}
      {activeWire && (() => {
        const activeColor = activeWire.color || '#38A169';
        const activeBorder = getWireBorderColor(activeColor);
        const activePath = getWirePath(activeWire.x1, activeWire.y1, activeWire.x2, activeWire.y2, activeWire.waypoints || []);
        return (
          <g className="pointer-events-none">
            {/* Outer border dashed line */}
            <path
              d={activePath}
              fill="none"
              stroke={activeBorder}
              strokeWidth="3.2"
              strokeDasharray="6 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner core dashed line */}
            <path
              d={activePath}
              fill="none"
              stroke={activeColor}
              strokeWidth="2.0"
              strokeDasharray="6 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Start terminal dot */}
            <circle cx={activeWire.x1} cy={activeWire.y1} r="3.2" fill={activeBorder} />
            <circle cx={activeWire.x1} cy={activeWire.y1} r="2.0" fill={activeColor} />
            
            {/* Waypoints placed so far */}
            {(activeWire.waypoints || []).map((wp, idx) => (
              <g key={`active_wp_${idx}`}>
                <circle cx={wp.x} cy={wp.y} r="4.2" fill="#FFFFFF" stroke={activeBorder} strokeWidth="1.5" />
                <circle cx={wp.x} cy={wp.y} r="2.0" fill={activeColor} />
              </g>
            ))}

            {/* Mouse cursor pointer ring */}
            <circle cx={activeWire.x2} cy={activeWire.y2} r="5.5" fill="none" stroke={activeColor} strokeWidth="2" />
          </g>
        );
      })()}
    </g>
  );
});
