import React from 'react';
import { GATE_TYPES, getInputPortsCount } from '../utils/simulator';
import { NODE_WIDTH, getNodeHeight, getPortCoordinates } from '../utils/layout';

export default function GateNode({
  node,
  isDraggingOutside,
  onMouseDown,
  onToggleInput,
  onDelete,
  onStartConnection,
  onCompleteConnection
}) {
  const isInput = node.type === GATE_TYPES.INPUT;
  const isOutput = node.type === GATE_TYPES.OUTPUT;
  const inputsCount = getInputPortsCount(node.type);

  const getBorderGlowClass = () => {
    if (isInput && node.value) return 'node-input-active';
    if (isOutput && node.value) return 'node-output-active';
    return node.value ? 'node-gate-active' : '';
  };

  const renderGateSvg = () => {
    const isActive = node.value;
    const strokeWidth = '3';

    // Aligned exact colors from the sidebar
    const gateColor = isActive
      ? (node.type === GATE_TYPES.AND || node.type === GATE_TYPES.NAND ? '#0ea5e9'
        : node.type === GATE_TYPES.OR || node.type === GATE_TYPES.NOR ? '#f43f5e'
          : '#a855f7')
      : (node.type === GATE_TYPES.AND || node.type === GATE_TYPES.NAND ? '#0284c7'
        : node.type === GATE_TYPES.OR || node.type === GATE_TYPES.NOR ? '#be123c'
          : '#7c3aed');

    const strokeColor = node.type === GATE_TYPES.AND || node.type === GATE_TYPES.NAND ? '#0369a1'
      : node.type === GATE_TYPES.OR || node.type === GATE_TYPES.NOR ? '#9f1239'
        : '#5b21b6';

    const isNand = node.type === GATE_TYPES.NAND;
    const isNor = node.type === GATE_TYPES.NOR;
    const isXor = node.type === GATE_TYPES.XOR;
    const isXnor = node.type === GATE_TYPES.XNOR;

    return (
      <svg className="gate-svg" width="160" height="110" viewBox="0 0 160 110">
        {/* Render paths wrapped inside scale(2.8) to make gates bigger and match sidebar paths 100% */}
        <g transform="translate(16, 8) scale(2.8)">
          {/* --- AND / NAND --- */}
          {(node.type === GATE_TYPES.AND || isNand) && (
            <>
              <path 
                d={isNand ? "M 10 7 H 20 A 10 10 0 0 1 20 27 H 10 Z" : "M 10 7 H 22 A 10 10 0 0 1 22 27 H 10 Z"} 
                fill={gateColor} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                strokeLinejoin="round" 
                strokeLinecap="round" 
              />
              {isNand && <circle cx="36" cy="17" r="3" fill={gateColor} stroke={strokeColor} strokeWidth="2" />}
            </>
          )}

          {/* --- OR / NOR --- */}
          {(node.type === GATE_TYPES.OR || isNor) && (
            <>
              <path 
                d={isNor ? "M 8 7 Q 15 17 8 27 Q 20 27 30 17 Q 20 7 8 7 Z" : "M 8 7 Q 15 17 8 27 Q 20 27 34 17 Q 20 7 8 7 Z"} 
                fill={gateColor} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                strokeLinejoin="round" 
                strokeLinecap="round" 
              />
              {isNor && <circle cx="36" cy="17" r="3" fill={gateColor} stroke={strokeColor} strokeWidth="2" />}
            </>
          )}

          {/* --- NOT --- */}
          {node.type === GATE_TYPES.NOT && (
            <>
              <path 
                d="M 8 7 L 28 17 L 8 27 Z" 
                fill={gateColor} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                strokeLinejoin="round" 
                strokeLinecap="round" 
              />
              <circle cx="33" cy="17" r="3" fill={gateColor} stroke={strokeColor} strokeWidth="2" />
            </>
          )}

          {/* --- XOR / XNOR --- */}
          {(isXor || isXnor) && (
            <>
              <path d="M 3 7 Q 8 17 3 27" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
              <path 
                d={isXnor ? "M 9 7 Q 15 17 9 27 Q 19 27 29 17 Q 19 7 9 7 Z" : "M 9 7 Q 15 17 9 27 Q 19 27 31 17 Q 19 7 9 7 Z"} 
                fill={gateColor} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                strokeLinejoin="round" 
                strokeLinecap="round" 
              />
              {isXnor && <circle cx="35" cy="17" r="3" fill={gateColor} stroke={strokeColor} strokeWidth="2" />}
            </>
          )}
        </g>
      </svg>
    );
  };

  const getShortLabel = () => {
    if (node.label) {
      if (node.label.toLowerCase().includes('input')) {
        return node.label.replace(/input\s*/i, '');
      }
      if (node.label.toLowerCase().includes('out')) {
        return node.label.replace(/\s*out/i, '');
      }
      return node.label;
    }
    return isInput ? 'IN' : 'OUT';
  };

  const getPortStyles = (portType, portIndex = 0) => {
    const coords = getPortCoordinates({ x: 0, y: 0, type: node.type }, portType, portIndex);
    return {
      left: `${coords.x}px`,
      top: `${coords.y}px`
    };
  };

  return (
    <div
      className={`gate-node ${getBorderGlowClass()} ${isDraggingOutside ? 'dragging-outside' : ''}`}
      style={{
        left: node.x,
        top: node.y,
        width: `${NODE_WIDTH}px`,
        height: `${getNodeHeight()}px`
      }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('.port') || e.target.closest('.node-delete-btn') || e.target.closest('.input-toggle')) {
          return;
        }
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onMouseDown(e, node.id);
      }}
    >
      <div className="node-body" style={{ height: '100%', position: 'relative' }}>
        {!isInput && !isOutput && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderGateSvg()}
          </div>
        )}

        {/* INPUT Switch - iOS horizontal toggle */}
        {isInput && (
          <div className="led-bulb-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="160" height="110" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              <defs>
                <linearGradient id={`box-grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2d2a27" />
                  <stop offset="100%" stopColor="#1a1816" />
                </linearGradient>
                <linearGradient id={`toggle-on-${node.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id={`toggle-glow-${node.id}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Dark background casing */}
              <rect x="48" y="30" width="64" height="50" rx="10" fill="#1a1816" stroke="#0f0e0d" strokeWidth="3" transform="translate(0, 4)" />
              <rect x="48" y="30" width="64" height="50" rx="10" fill={`url(#box-grad-${node.id})`} stroke="#333" strokeWidth="2" />

              {/* Toggle track */}
              <rect
                x="60" y="44"
                width="40" height="22"
                rx="11"
                fill={node.value ? `url(#toggle-on-${node.id})` : '#3f3f46'}
                stroke={node.value ? '#059669' : '#27272a'}
                strokeWidth="1.5"
                filter={node.value ? `url(#toggle-glow-${node.id})` : undefined}
              />

              {/* Track inner shadow line */}
              <rect
                x="60" y="44"
                width="40" height="6"
                rx="3"
                fill="rgba(0,0,0,0.15)"
              />

              {/* Toggle thumb */}
              <circle
                cx={node.value ? 91 : 69}
                cy="55"
                r="9"
                fill="white"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
              />

              {/* Thumb highlight */}
              <circle
                cx={node.value ? 89 : 67}
                cy="52"
                r="3"
                fill="rgba(255,255,255,0.6)"
              />
            </svg>

            <div
              className="input-toggle"
              style={{
                position: 'absolute',
                left: '60px',
                top: '44px',
                width: '40px',
                height: '22px',
                cursor: 'pointer',
                opacity: 0,
                zIndex: 15,
                borderRadius: '11px'
              }}
              onClick={() => onToggleInput(node.id)}
            />
          </div>
        )}

        {/* OUTPUT LED - Premium PCB SMD */}
        {isOutput && (
          <div className="led-bulb-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="160" height="110" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              <defs>
                {/* Node casing background */}
                <linearGradient id={`box-grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e1e22" />
                  <stop offset="100%" stopColor="#111114" />
                </linearGradient>

                {/* PCB board surface — dark green */}
                <linearGradient id={`pcb-${node.id}`} x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0%"   stopColor="#1a3a2a" />
                  <stop offset="100%" stopColor="#0f2018" />
                </linearGradient>

                {/* Solder pad — silver/tin */}
                <linearGradient id={`pad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e2e8f0" />
                  <stop offset="40%"  stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                {/* SMD body — off-white epoxy top */}
                <linearGradient id={`smd-top-${node.id}`} x1="0" y1="0" x2="0.2" y2="1">
                  <stop offset="0%"   stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                {/* Lens active gradient */}
                <radialGradient id={`lens-${node.id}`} cx="38%" cy="32%" r="65%">
                  <stop offset="0%"   stopColor={node.value ? '#ffffff' : '#450a0a'} />
                  <stop offset="30%"  stopColor={node.value ? '#fca5a5' : '#3b0707'} />
                  <stop offset="70%"  stopColor={node.value ? '#ef4444' : '#250505'} />
                  <stop offset="100%" stopColor={node.value ? '#b91c1c' : '#160303'} />
                </radialGradient>

                {/* Outer bloom halo */}
                <radialGradient id={`bloom-${node.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={node.value ? 'rgba(239,68,68,0.55)' : 'transparent'} />
                  <stop offset="55%"  stopColor={node.value ? 'rgba(239,68,68,0.15)' : 'transparent'} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Strong glow filter when ON */}
                <filter id={`glow-${node.id}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="5" result="b1" />
                  <feGaussianBlur stdDeviation="2.5" result="b2" in="SourceGraphic" />
                  <feMerge>
                    <feMergeNode in="b1" />
                    <feMergeNode in="b2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Subtle inset shadow for OFF lens */}
                <filter id={`inset-${node.id}`}>
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.7" />
                </filter>

                {/* PCB trace subtle texture */}
                <pattern id={`grid-${node.id}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="6" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* ── Outer node casing ── */}
              <rect x="42" y="25" width="76" height="60" rx="11" fill="#111114" stroke="#0a0a0d" strokeWidth="3" transform="translate(0,5)" />
              <rect x="42" y="25" width="76" height="60" rx="11" fill={`url(#box-grad-${node.id})`} stroke="#2a2a32" strokeWidth="1.5" />

              {/* ── PCB substrate ── */}
              <rect x="52" y="34" width="56" height="42" rx="5" fill={`url(#pcb-${node.id})`} stroke="#0d2418" strokeWidth="1.2" />
              {/* PCB grid texture */}
              <rect x="52" y="34" width="56" height="42" rx="5" fill={`url(#grid-${node.id})`} />
              {/* PCB silkscreen outline */}
              <rect x="63" y="40" width="34" height="30" rx="2" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="3,2" />

              {/* ── PCB traces — gold lines leading to pads ── */}
              <line x1="52" y1="55" x2="63" y2="55" stroke="#b8860b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="97" y1="55" x2="108" y2="55" stroke="#b8860b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

              {/* ── Left solder pad (anode +) ── */}
              <rect x="55" y="47" width="10" height="16" rx="2.5" fill={`url(#pad-${node.id})`} stroke="#64748b" strokeWidth="0.8" />
              <text x="60" y="59" fontSize="6.5" fill="#475569" textAnchor="middle" fontFamily="monospace" fontWeight="bold">+</text>

              {/* ── Right solder pad (cathode −) ── */}
              <rect x="95" y="47" width="10" height="16" rx="2.5" fill={`url(#pad-${node.id})`} stroke="#64748b" strokeWidth="0.8" />
              <text x="100" y="59" fontSize="7" fill="#475569" textAnchor="middle" fontFamily="monospace" fontWeight="bold">−</text>

              {/* ── SMD LED package body ── */}
              <rect x="63" y="40" width="34" height="30" rx="3" fill={`url(#smd-top-${node.id})`} stroke="#94a3b8" strokeWidth="1" />
              {/* Body top sheen */}
              <rect x="63" y="40" width="34" height="10" rx="3" fill="rgba(255,255,255,0.2)" />

              {/* ── Dark lens recess ── */}
              <circle cx="80" cy="55" r="10" fill="#0a0a0a" stroke="#1e293b" strokeWidth="1.2" />
              {/* Inner ring / reflector rim */}
              <circle cx="80" cy="55" r="10" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />

              {/* Ambient bloom */}
              {node.value && (
                <circle cx="80" cy="55" r="22" fill={`url(#bloom-${node.id})`} />
              )}

              {/* ── LED die / emitter ── */}
              <circle
                cx="80" cy="55" r="7.5"
                fill={`url(#lens-${node.id})`}
                stroke={node.value ? '#dc2626' : '#1c0404'}
                strokeWidth="0.8"
                filter={node.value ? `url(#glow-${node.id})` : `url(#inset-${node.id})`}
              />

              {/* Lens highlight — primary */}
              <ellipse cx="76.5" cy="51.5" rx="3" ry="2" fill="rgba(255,255,255,0.32)" transform="rotate(-30,76.5,51.5)" />
              {/* Lens highlight — sharp specular */}
              <ellipse cx="75.5" cy="50.8" rx="1.3" ry="0.8" fill="rgba(255,255,255,0.68)" transform="rotate(-30,75.5,50.8)" />
              {/* Pinpoint */}
              <circle cx="75" cy="50.5" r="0.7" fill="rgba(255,255,255,0.9)" />

              {/* ── Status label on PCB silkscreen ── */}
              <text x="80" y="44" fontSize="5.5" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="monospace" letterSpacing="1">LED</text>
            </svg>
          </div>
        )}


      </div>

      {!isOutput && (
        <div
          className={`port port-output ${node.value ? 'connected active' : 'connected'}`}
          style={getPortStyles('output')}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onStartConnection(e, node.id);
          }}
        >
          <div className="port-value-tooltip">
            OUT: {node.value ? '1' : '0'}
          </div>
        </div>
      )}

      {Array.from({ length: inputsCount }).map((_, index) => {
        const portVal = node.inputs ? node.inputs[index] : false;

        return (
          <div
            key={index}
            className={`port port-input ${portVal ? 'connected active' : 'connected'}`}
              data-node-id={node.id}
              data-port-index={index}
            style={getPortStyles('input', index)}
            onPointerUp={(e) => {
              e.stopPropagation();
              onCompleteConnection(node.id, index);
            }}
          >
            <div className="port-value-tooltip">
              IN {inputsCount > 1 ? index + 1 : ''}: {portVal ? '1' : '0'}
            </div>
          </div>
        );
      })}
    </div>
  );
}