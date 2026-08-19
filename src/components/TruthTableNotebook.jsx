import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GATE_PAGES = [
  {
    name: 'AND',
    columns: ['A', 'B', 'Y = A·B'],
    rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
  },
  {
    name: 'OR',
    columns: ['A', 'B', 'Y = A + B'],
    rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
  },
  {
    name: 'NOT',
    columns: ['A', 'Y = A'],
    overlineOutput: true,
    overlineInputOnly: true,
    rows: [[0, 1], [1, 0]],
  },
  {
    name: 'NAND',
    columns: ['A', 'B', 'Y = A·B'],
    overlineOutput: true,
    rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  },
  {
    name: 'NOR',
    columns: ['A', 'B', 'Y = A + B'],
    overlineOutput: true,
    rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]],
  },
  {
    name: 'XOR',
    columns: ['A', 'B', 'Y = A ⊕ B'],
    rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  },
  {
    name: 'XNOR',
    columns: ['A', 'B', 'Y = A ⊙ B'],
    rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
  },
];

export default function TruthTableNotebook() {
  const [pageIndex, setPageIndex] = useState(1);
  const page = GATE_PAGES[pageIndex];

  return (
    <div className="nb-outer">
      {/* Spiral rings column */}
      <div className="nb-rings">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="nb-ring">
            <div className="nb-ring-inner" />
          </div>
        ))}
      </div>

      {/* Paper body */}
      <div key={page.name} className="nb-paper">
        {/* Title */}
        <div className="nb-title-row">
          <div className="nb-title-copy">
            <span className="nb-title">Truth Table <span className="nb-gate-name">: {page.name}</span></span>
            <svg className="nb-title-underline" viewBox="0 0 200 12" preserveAspectRatio="none">
              <path d="M 2 6 Q 50 2 100 6 T 198 6" fill="none" stroke="#6d5dd3" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <table className="nb-tbl">
          <thead>
            <tr>
              {page.columns.map((col, i) => (
                <th key={i} className={`nb-th ${i === page.columns.length - 1 ? 'nb-th-wide' : ''}`}>
                  {page.overlineOutput && i === page.columns.length - 1 ? (
                    <>Y = <span className="nb-formula-overline">{col.replace('Y = ', '')}</span></>
                  ) : page.overlineInputOnly && i === page.columns.length - 1 ? (
                    <>Y = <span className="nb-formula-overline">A</span></>
                  ) : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => {
                  const isOutput = j === row.length - 1;
                  return (
                    <td
                      key={j}
                      className={`nb-td ${isOutput ? (val ? 'nb-td-hi' : 'nb-td-lo') : ''}`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="nb-page-controls" aria-label="Truth table pages">
          <button
            type="button"
            className="nb-page-btn"
            title="Previous truth table"
            onClick={() => setPageIndex((pageIndex - 1 + GATE_PAGES.length) % GATE_PAGES.length)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="nb-page-count">{pageIndex + 1}/{GATE_PAGES.length}</span>
          <button
            type="button"
            className="nb-page-btn"
            title="Next truth table"
            onClick={() => setPageIndex((pageIndex + 1) % GATE_PAGES.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}