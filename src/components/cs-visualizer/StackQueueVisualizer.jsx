import React, { useState } from 'react';
import { Layers, ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

export const StackQueueVisualizer = () => {
  const [mode, setMode] = useState('stack'); // 'stack' | 'queue'
  const [items, setItems] = useState([10, 25, 40, 65]);
  const [valInput, setValInput] = useState('');
  const [logMessages, setLogMessages] = useState(['Stack / Queue Visualizer initialized.']);

  const addLog = (msg) => {
    setLogMessages(prev => [msg, ...prev.slice(0, 8)]);
  };

  // Stack PUSH
  const handlePush = () => {
    const val = parseInt(valInput);
    if (isNaN(val)) return;
    if (items.length >= 8) {
      addLog('OVERFLOW WARNING: Stack limit of 8 reached.');
      return;
    }
    setItems([...items, val]);
    addLog(`PUSH: Pushed ${val} onto top of Stack.`);
    setValInput('');
  };

  // Stack POP
  const handlePop = () => {
    if (items.length === 0) {
      addLog('UNDERFLOW WARNING: Stack is empty!');
      return;
    }
    const popped = items[items.length - 1];
    setItems(items.slice(0, -1));
    addLog(`POP: Popped element ${popped} from top of Stack.`);
  };

  // Queue ENQUEUE
  const handleEnqueue = () => {
    const val = parseInt(valInput);
    if (isNaN(val)) return;
    if (items.length >= 8) {
      addLog('OVERFLOW WARNING: Queue limit of 8 reached.');
      return;
    }
    setItems([...items, val]);
    addLog(`ENQUEUE: Enqueued ${val} at Rear of Queue.`);
    setValInput('');
  };

  // Queue DEQUEUE
  const handleDequeue = () => {
    if (items.length === 0) {
      addLog('UNDERFLOW WARNING: Queue is empty!');
      return;
    }
    const dequeued = items[0];
    setItems(items.slice(1));
    addLog(`DEQUEUE: Dequeued ${dequeued} from Front of Queue.`);
  };

  return (
    <div className="algo-visualizer-container">
      <div className="visualizer-header">
        <div className="v-title-box">
          <Layers size={20} className="v-icon emerald" />
          <h2>Stack (LIFO) & Queue (FIFO) Engine</h2>
        </div>
        <p className="v-subtitle">
          Toggle between vertical LIFO memory frame stack and horizontal FIFO conveyor queue.
        </p>

        <div className="mode-toggle-group">
          <button 
            className={`mode-btn ${mode === 'stack' ? 'active' : ''}`}
            onClick={() => { setMode('stack'); addLog('Switched mode to Stack (Last-In First-Out).'); }}
          >
            Stack Mode (LIFO)
          </button>
          <button 
            className={`mode-btn ${mode === 'queue' ? 'active' : ''}`}
            onClick={() => { setMode('queue'); addLog('Switched mode to Queue (First-In First-Out).'); }}
          >
            Queue Mode (FIFO)
          </button>
        </div>
      </div>

      {/* VISUAL STAGE */}
      <div className="sq-display-stage">
        {mode === 'stack' ? (
          /* VERTICAL STACK CONTAINER */
          <div className="stack-vertical-frame">
            <div className="stack-top-pointer-label">
              <span>TOP Pointer &rarr; Index [{items.length - 1}]</span>
            </div>

            <div className="stack-bucket">
              {items.length === 0 ? (
                <div className="empty-sq-msg">Stack is empty. Click PUSH to add elements.</div>
              ) : (
                items.slice().reverse().map((val, idx) => {
                  const originalIdx = items.length - 1 - idx;
                  const isTop = originalIdx === items.length - 1;
                  return (
                    <div key={originalIdx} className={`stack-item-card ${isTop ? 'top-item' : ''}`}>
                      <span className="sq-val">{val}</span>
                      <span className="sq-idx">[{originalIdx}] {isTop ? '(TOP)' : ''}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="stack-bottom-base">STACK BASE (BOTTOM)</div>
          </div>
        ) : (
          /* HORIZONTAL QUEUE CONVEYOR */
          <div className="queue-horizontal-frame">
            <div className="queue-labels">
              <span className="front-label">&larr; FRONT (Dequeue)</span>
              <span className="rear-label">REAR (Enqueue) &rarr;</span>
            </div>

            <div className="queue-conveyor">
              {items.length === 0 ? (
                <div className="empty-sq-msg">Queue is empty. Click ENQUEUE to add elements.</div>
              ) : (
                items.map((val, idx) => {
                  const isFront = idx === 0;
                  const isRear = idx === items.length - 1;
                  return (
                    <div key={idx} className={`queue-item-card ${isFront ? 'front-item' : ''} ${isRear ? 'rear-item' : ''}`}>
                      <span className="sq-val">{val}</span>
                      <span className="sq-idx">
                        [{idx}] {isFront ? 'FRONT' : isRear ? 'REAR' : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="algo-controls-panel">
        <div className="control-group">
          <h4>{mode === 'stack' ? 'Stack Operations' : 'Queue Operations'}</h4>
          <div className="control-inputs-row">
            <input
              type="number"
              placeholder="Value"
              value={valInput}
              onChange={e => setValInput(e.target.value)}
              className="algo-input"
            />
            {mode === 'stack' ? (
              <>
                <button className="algo-btn primary" onClick={handlePush}>
                  <ArrowDown size={16} />
                  <span>PUSH</span>
                </button>
                <button className="algo-btn secondary" onClick={handlePop}>
                  <ArrowUp size={16} />
                  <span>POP</span>
                </button>
              </>
            ) : (
              <>
                <button className="algo-btn primary" onClick={handleEnqueue}>
                  <ArrowDown size={16} />
                  <span>ENQUEUE</span>
                </button>
                <button className="algo-btn secondary" onClick={handleDequeue}>
                  <ArrowUp size={16} />
                  <span>DEQUEUE</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="control-group">
          <h4>Reset</h4>
          <div className="control-inputs-row">
            <button className="algo-btn outline" onClick={() => setItems([10, 25, 40, 65])}>
              <RotateCcw size={15} />
              <span>Reset Default</span>
            </button>
            <button className="algo-btn outline" onClick={() => setItems([])}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* TERMINAL */}
      <div className="algo-logs-terminal">
        <div className="terminal-header">
          <span>CONSOLE OPERATION LOGS</span>
        </div>
        <div className="terminal-body">
          {logMessages.map((log, i) => (
            <div key={i} className="log-line">
              <span className="log-arrow">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
