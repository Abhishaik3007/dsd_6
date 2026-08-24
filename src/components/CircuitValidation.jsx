import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function CircuitValidation({ issues, hasCircuit }) {
  const hasErrors = issues.some(issue => issue.level === 'error');
  const isValid = hasCircuit && issues.length === 0;
  const heading = !hasCircuit
    ? 'No circuit yet'
    : isValid
      ? 'Circuit ready'
      : `${issues.length} circuit issue${issues.length === 1 ? '' : 's'}`;

  return (
    <section className={`circuit-validation ${isValid ? 'is-valid' : ''}`} aria-live="polite">
      <div className="validation-heading">
        {isValid ? <CheckCircle2 size={16} /> : hasCircuit && hasErrors ? <AlertTriangle size={16} /> : <Info size={16} />}
        <span>{heading}</span>
      </div>
      {hasCircuit && !isValid && (
        <ul className="validation-list">
          {issues.map((issue, index) => <li key={`${issue.message}-${index}`}>{issue.message}</li>)}
        </ul>
      )}
    </section>
  );
}
