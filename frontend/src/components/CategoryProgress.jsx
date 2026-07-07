import React from 'react';

const CategoryProgress = ({ category, spent, limit }) => {
  const hasLimit = limit > 0;
  const percent = hasLimit ? (spent / limit) * 100 : 0;
  const roundedPercent = Math.min(Math.round(percent), 100);

  // Determine styling based on budget threshold
  let progressClass = 'progress-safe';
  let statusText = 'Safe';
  let statusColor = 'var(--success-color)';

  if (hasLimit) {
    if (percent >= 100) {
      progressClass = 'progress-danger';
      statusText = 'Over Budget';
      statusColor = 'var(--danger-color)';
    } else if (percent >= 80) {
      progressClass = 'progress-warn';
      statusText = 'Warning';
      statusColor = 'var(--warning-color)';
    }
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-family-title)' }}>
          {category}
        </span>
        {hasLimit && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: statusColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {statusText}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-family-title)' }}>
          ${spent.toFixed(2)}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {hasLimit ? `of $${limit.toFixed(2)} limit` : 'spent (no limit set)'}
        </span>
      </div>

      {hasLimit ? (
        <div className="budget-progress-container">
          <div className="budget-progress-bar-bg">
            <div
              className={`budget-progress-bar-fill ${progressClass}`}
              style={{ width: `${roundedPercent}%` }}
            />
          </div>
          <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{roundedPercent}% Utilized</span>
            <span>${(limit - spent).toFixed(2)} {spent > limit ? 'over' : 'left'}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Establish a limit in Budgets to track status.
        </div>
      )}
    </div>
  );
};

export default CategoryProgress;
