import React, { memo } from 'react';
import { BREADBOARD_DIMENSIONS } from './engine/tinkerGeometry';

/**
 * Realistic 400-Point Half Breadboard Component with Magnetic Snapping,
 * Bus Column/Rail Glow Highlighting, and Large Interactive Click Targets.
 */
export const TinkerBreadboard = memo(({
  id = 'bb_default',
  x = 100,
  y = 100,
  isSelected = false,
  onMouseDown,
  onHoleClick,
  hoveredHole,
  onHoverHole,
  activeWireSource
}) => {
  const COLS = 30;
  const { START_X, PITCH, TOP_RAIL_POS_Y, TOP_RAIL_NEG_Y, ROW_A_Y, ROW_F_Y, BOT_RAIL_POS_Y, BOT_RAIL_NEG_Y } = BREADBOARD_DIMENSIONS;
  const ROW_E_Y = ROW_A_Y + 4 * PITCH; // 162
  const TROUGH_Y = ROW_E_Y + 16;       // 178
  const ROW_J_Y = ROW_F_Y + 4 * PITCH; // 274

  const BOARD_WIDTH = START_X * 2 + (COLS - 1) * PITCH; // 660px
  const BOARD_HEIGHT = 360;

  const rowsTop = ['a', 'b', 'c', 'd', 'e'];
  const rowsBot = ['f', 'g', 'h', 'i', 'j'];

  // Check if hole is directly hovered
  const isDirectHole = (type, col, row) => {
    return hoveredHole &&
      hoveredHole.bbId === id &&
      hoveredHole.holeType === type &&
      hoveredHole.col === col &&
      hoveredHole.row === row;
  };

  // Check if hole is in the same electrically connected bus as hovered hole
  const isBusConnectedToHover = (type, col, row) => {
    if (!hoveredHole || hoveredHole.bbId !== id) return false;
    if (type === 'rail' && hoveredHole.holeType === 'rail') {
      return hoveredHole.row === row;
    }
    if (type === 'terminal' && hoveredHole.holeType === 'terminal') {
      const isTopHover = rowsTop.includes(hoveredHole.row);
      const isTopThis = rowsTop.includes(row);
      return hoveredHole.col === col && isTopHover === isTopThis;
    }
    return false;
  };

  const isHoleActiveWireStart = (type, col, row) => {
    if (!activeWireSource || !activeWireSource.fromHole) return false;
    const h = activeWireSource.fromHole;
    return h.bbId === id && h.holeType === type && h.col === col && h.row === row;
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={onMouseDown}
      className="select-none cursor-move"
      style={{ filter: isSelected ? 'drop-shadow(0 0 12px rgba(52, 127, 122, 0.55))' : 'drop-shadow(0 14px 28px rgba(0,0,0,0.14))' }}
    >
      {/* Outer Breadboard Plastic Casing */}
      <rect
        x="0"
        y="0"
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        rx="14"
        fill="#FAFAF8"
        stroke={isSelected ? '#347F7A' : '#D5D5CE'}
        strokeWidth={isSelected ? '3' : '1.5'}
      />

      {/* Glossy inner bevel */}
      <rect
        x="4"
        y="4"
        width={BOARD_WIDTH - 8}
        height={BOARD_HEIGHT - 8}
        rx="11"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Central DIP Divider Trough */}
      <rect
        x="20"
        y={TROUGH_Y - 4}
        width={BOARD_WIDTH - 40}
        height="12"
        rx="3"
        fill="#E8E8E2"
        stroke="#D2D2CA"
        strokeWidth="1"
      />

      {/* Top Power Rails Indicator Lines */}
      {/* Positive (Red) */}
      <line
        x1={START_X - 10}
        y1={TOP_RAIL_POS_Y}
        x2={START_X + (COLS - 1) * PITCH + 10}
        y2={TOP_RAIL_POS_Y}
        stroke="#E53E3E"
        strokeWidth="2"
        strokeOpacity="0.45"
      />
      <text x={START_X - 24} y={TOP_RAIL_POS_Y + 4} fill="#E53E3E" fontSize="13" fontWeight="bold" fontFamily="monospace">+</text>
      <text x={START_X + (COLS - 1) * PITCH + 16} y={TOP_RAIL_POS_Y + 4} fill="#E53E3E" fontSize="13" fontWeight="bold" fontFamily="monospace">+</text>

      {/* Negative (Blue) */}
      <line
        x1={START_X - 10}
        y1={TOP_RAIL_NEG_Y}
        x2={START_X + (COLS - 1) * PITCH + 10}
        y2={TOP_RAIL_NEG_Y}
        stroke="#3182CE"
        strokeWidth="2"
        strokeOpacity="0.45"
      />
      <text x={START_X - 22} y={TOP_RAIL_NEG_Y + 4} fill="#3182CE" fontSize="14" fontWeight="bold" fontFamily="monospace">-</text>
      <text x={START_X + (COLS - 1) * PITCH + 16} y={TOP_RAIL_NEG_Y + 4} fill="#3182CE" fontSize="14" fontWeight="bold" fontFamily="monospace">-</text>

      {/* Bottom Power Rails Indicator Lines */}
      {/* Positive (Red) */}
      <line
        x1={START_X - 10}
        y1={BOT_RAIL_POS_Y}
        x2={START_X + (COLS - 1) * PITCH + 10}
        y2={BOT_RAIL_POS_Y}
        stroke="#E53E3E"
        strokeWidth="2"
        strokeOpacity="0.45"
      />
      <text x={START_X - 24} y={BOT_RAIL_POS_Y + 4} fill="#E53E3E" fontSize="13" fontWeight="bold" fontFamily="monospace">+</text>
      <text x={START_X + (COLS - 1) * PITCH + 16} y={BOT_RAIL_POS_Y + 4} fill="#E53E3E" fontSize="13" fontWeight="bold" fontFamily="monospace">+</text>

      {/* Negative (Blue) */}
      <line
        x1={START_X - 10}
        y1={BOT_RAIL_NEG_Y}
        x2={START_X + (COLS - 1) * PITCH + 10}
        y2={BOT_RAIL_NEG_Y}
        stroke="#3182CE"
        strokeWidth="2"
        strokeOpacity="0.45"
      />
      <text x={START_X - 22} y={BOT_RAIL_NEG_Y + 4} fill="#3182CE" fontSize="14" fontWeight="bold" fontFamily="monospace">-</text>
      <text x={START_X + (COLS - 1) * PITCH + 16} y={BOT_RAIL_NEG_Y + 4} fill="#3182CE" fontSize="14" fontWeight="bold" fontFamily="monospace">-</text>

      {/* Row Labels Left and Right (a, b, c, d, e) and (f, g, h, i, j) */}
      {rowsTop.map((rowName, rIdx) => {
        const ry = ROW_A_Y + rIdx * PITCH + 4;
        return (
          <React.Fragment key={`lbl_top_${rowName}`}>
            <text x={START_X - 18} y={ry} fill="#8A8A80" fontSize="10" fontFamily="sans-serif" textAnchor="middle">{rowName}</text>
            <text x={START_X + (COLS - 1) * PITCH + 18} y={ry} fill="#8A8A80" fontSize="10" fontFamily="sans-serif" textAnchor="middle">{rowName}</text>
          </React.Fragment>
        );
      })}
      {rowsBot.map((rowName, rIdx) => {
        const ry = ROW_F_Y + rIdx * PITCH + 4;
        return (
          <React.Fragment key={`lbl_bot_${rowName}`}>
            <text x={START_X - 18} y={ry} fill="#8A8A80" fontSize="10" fontFamily="sans-serif" textAnchor="middle">{rowName}</text>
            <text x={START_X + (COLS - 1) * PITCH + 18} y={ry} fill="#8A8A80" fontSize="10" fontFamily="sans-serif" textAnchor="middle">{rowName}</text>
          </React.Fragment>
        );
      })}

      {/* Column Number Labels (1, 5, 10, 15, 20, 25, 30) */}
      {Array.from({ length: COLS }).map((_, cIdx) => {
        const colNum = cIdx + 1;
        const cx = START_X + cIdx * PITCH;
        if (colNum === 1 || colNum % 5 === 0) {
          return (
            <React.Fragment key={`col_num_${colNum}`}>
              <text x={cx} y={ROW_A_Y - 14} fill="#8A8A80" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{colNum}</text>
              <text x={cx} y={ROW_J_Y + 18} fill="#8A8A80" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{colNum}</text>
            </React.Fragment>
          );
        }
        return null;
      })}

      {/* Holes Matrix */}
      {Array.from({ length: COLS }).map((_, cIdx) => {
        const cx = START_X + cIdx * PITCH;
        const colNum = cIdx + 1;

        return (
          <g key={`col_${colNum}`}>
            {/* Top Power Rails Holes */}
            {/* Pos */}
            <Hole
              cx={cx}
              cy={TOP_RAIL_POS_Y}
              isDirectHover={isDirectHole('rail', colNum, 'top_pos')}
              isBusHover={isBusConnectedToHover('rail', colNum, 'top_pos')}
              isActiveWireStart={isHoleActiveWireStart('rail', colNum, 'top_pos')}
              onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'rail', col: colNum, row: 'top_pos' } : null) : null}
              onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'rail', col: colNum, row: 'top_pos' })}
            />
            {/* Neg */}
            <Hole
              cx={cx}
              cy={TOP_RAIL_NEG_Y}
              isDirectHover={isDirectHole('rail', colNum, 'top_neg')}
              isBusHover={isBusConnectedToHover('rail', colNum, 'top_neg')}
              isActiveWireStart={isHoleActiveWireStart('rail', colNum, 'top_neg')}
              onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'rail', col: colNum, row: 'top_neg' } : null) : null}
              onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'rail', col: colNum, row: 'top_neg' })}
            />

            {/* Terminal Strip Rows a-e */}
            {rowsTop.map((rowName, rIdx) => {
              const cy = ROW_A_Y + rIdx * PITCH;
              return (
                <Hole
                  key={`hole_${colNum}_${rowName}`}
                  cx={cx}
                  cy={cy}
                  isDirectHover={isDirectHole('terminal', colNum, rowName)}
                  isBusHover={isBusConnectedToHover('terminal', colNum, rowName)}
                  isActiveWireStart={isHoleActiveWireStart('terminal', colNum, rowName)}
                  onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'terminal', col: colNum, row: rowName } : null) : null}
                  onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'terminal', col: colNum, row: rowName })}
                />
              );
            })}

            {/* Terminal Strip Rows f-j */}
            {rowsBot.map((rowName, rIdx) => {
              const cy = ROW_F_Y + rIdx * PITCH;
              return (
                <Hole
                  key={`hole_${colNum}_${rowName}`}
                  cx={cx}
                  cy={cy}
                  isDirectHover={isDirectHole('terminal', colNum, rowName)}
                  isBusHover={isBusConnectedToHover('terminal', colNum, rowName)}
                  isActiveWireStart={isHoleActiveWireStart('terminal', colNum, rowName)}
                  onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'terminal', col: colNum, row: rowName } : null) : null}
                  onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'terminal', col: colNum, row: rowName })}
                />
              );
            })}

            {/* Bottom Power Rails Holes */}
            {/* Pos */}
            <Hole
              cx={cx}
              cy={BOT_RAIL_POS_Y}
              isDirectHover={isDirectHole('rail', colNum, 'bot_pos')}
              isBusHover={isBusConnectedToHover('rail', colNum, 'bot_pos')}
              isActiveWireStart={isHoleActiveWireStart('rail', colNum, 'bot_pos')}
              onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'rail', col: colNum, row: 'bot_pos' } : null) : null}
              onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'rail', col: colNum, row: 'bot_pos' })}
            />
            {/* Neg */}
            <Hole
              cx={cx}
              cy={BOT_RAIL_NEG_Y}
              isDirectHover={isDirectHole('rail', colNum, 'bot_neg')}
              isBusHover={isBusConnectedToHover('rail', colNum, 'bot_neg')}
              isActiveWireStart={isHoleActiveWireStart('rail', colNum, 'bot_neg')}
              onHover={onHoverHole ? (hovering) => onHoverHole(hovering ? { bbId: id, holeType: 'rail', col: colNum, row: 'bot_neg' } : null) : null}
              onClick={() => onHoleClick && onHoleClick({ bbId: id, holeType: 'rail', col: colNum, row: 'bot_neg' })}
            />
          </g>
        );
      })}

      {/* Brand Watermark on Right Edge */}
      <text
        x={BOARD_WIDTH - 24}
        y={TROUGH_Y + 5}
        fill="#A5A59C"
        fontSize="9"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="1"
        textAnchor="end"
      >
        DEAD STAR DEVS • TINKERLAB
      </text>
    </g>
  );
});

// Single Breadboard Tie-Point Hole with metallic interior & magnetic snap ring
const Hole = memo(({ cx, cy, isDirectHover, isBusHover, isActiveWireStart, onHover, onClick }) => {
  return (
    <g
      className="cursor-crosshair transition-all"
      onMouseDown={e => e.stopPropagation()}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {/* Invisible Large Hit Area for Effortless Clicking */}
      <circle
        cx={cx}
        cy={cy}
        r="11"
        fill="transparent"
      />

      {/* Connected Bus Highlighting Aura (Tinkercad feature!) */}
      {isBusHover && !isDirectHover && (
        <circle
          cx={cx}
          cy={cy}
          r="6.5"
          fill="#48BB78"
          fillOpacity="0.4"
        />
      )}

      {/* Outer metallic contact ring */}
      <circle
        cx={cx}
        cy={cy}
        r="4.2"
        fill={isDirectHover ? '#48BB78' : '#D6D6CF'}
        stroke={isDirectHover ? '#2F855A' : '#9E9E94'}
        strokeWidth="0.8"
      />

      {/* Hole Cavity */}
      <rect
        x={cx - 2}
        y={cy - 2}
        width="4"
        height="4"
        rx="0.8"
        fill="#262624"
      />

      {/* Direct Hover Magnetic Snapping Ring */}
      {isDirectHover && (
        <circle
          cx={cx}
          cy={cy}
          r="9"
          fill="none"
          stroke="#38A169"
          strokeWidth="2.2"
          className="animate-pulse"
        />
      )}

      {/* Active Wire Start Indicator */}
      {isActiveWireStart && (
        <circle
          cx={cx}
          cy={cy}
          r="10"
          fill="none"
          stroke="#3182CE"
          strokeWidth="2.5"
          className="animate-ping"
        />
      )}
    </g>
  );
});
