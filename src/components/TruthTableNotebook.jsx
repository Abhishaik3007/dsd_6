import React from 'react';

export default function TruthTableNotebook({ title = 'Truth Table', columns = ['A', 'B', 'Y (A OR B)'], rows: rowsProp }) {
  const rows = rowsProp || [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];

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
      <div className="nb-paper">
        {/* Title */}
        <div className="nb-title-row">
          <span className="nb-title">{title}</span>
          <svg className="nb-title-underline" viewBox="0 0 200 12" preserveAspectRatio="none">
            <path d="M 2 6 Q 50 2 100 6 T 198 6" fill="none" stroke="#6d5dd3" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Table */}
        <table className="nb-tbl">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`nb-th ${i === columns.length - 1 ? 'nb-th-wide' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
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
      </div>
    </div>
  );
}