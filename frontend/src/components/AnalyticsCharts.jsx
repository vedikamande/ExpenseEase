import React from 'react';

export default function AnalyticsCharts({ summary, currency }) {
  const { category_breakdown = [], monthly_trend = [] } = summary || {};

  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Find max value in monthly trend for scaling SVG chart
  const maxMonthlyVal = Math.max(
    ...monthly_trend.map((m) => Math.max(m.income || 0, m.expense || 0)),
    100
  );

  return (
    <div className="analytics-grid">
      {/* Category Breakdown Card */}
      <div className="analytics-card">
        <div className="card-heading">
          <div className="card-title-group">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <h3>Expenses by Category</h3>
          </div>
          <span className="card-sub">{category_breakdown.length} active categories</span>
        </div>

        {category_breakdown.length === 0 ? (
          <div className="empty-chart-placeholder">
            <p>No expense data logged yet.</p>
          </div>
        ) : (
          <div className="category-bars-list">
            {category_breakdown.slice(0, 5).map((item) => (
              <div key={item.category} className="category-row">
                <div className="category-header">
                  <div className="category-name-group">
                    <span
                      className="category-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="category-name">{item.category}</span>
                  </div>
                  <div className="category-amounts">
                    <span className="category-val">
                      {currency}{formatAmount(item.total)}
                    </span>
                    <span className="category-pct">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="category-progress-track">
                  <div
                    className="category-progress-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Trends SVG Chart */}
      <div className="analytics-card">
        <div className="card-heading">
          <div className="card-title-group">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h3>Monthly Cashflow Trends</h3>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color legend-income" /> Income
            </span>
            <span className="legend-item">
              <span className="legend-color legend-expense" /> Expense
            </span>
          </div>
        </div>

        {monthly_trend.length === 0 ? (
          <div className="empty-chart-placeholder">
            <p>Log transactions across months to visualize trends.</p>
          </div>
        ) : (
          <div className="chart-svg-container">
            <svg viewBox="0 0 400 180" className="trend-svg" preserveAspectRatio="none">
              {/* Horizontal grid lines */}
              <line x1="30" y1="30" x2="390" y2="30" stroke="#334155" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="390" y2="80" stroke="#334155" strokeDasharray="3 3" />
              <line x1="30" y1="130" x2="390" y2="130" stroke="#334155" strokeDasharray="3 3" />

              {/* Bars per month */}
              {monthly_trend.map((m, idx) => {
                const totalMonths = monthly_trend.length;
                const slotWidth = (360) / totalMonths;
                const startX = 35 + idx * slotWidth;
                const barWidth = Math.min(22, slotWidth / 2.6);

                const incomeHeight = ((m.income || 0) / maxMonthlyVal) * 110;
                const expenseHeight = ((m.expense || 0) / maxMonthlyVal) * 110;

                const incomeY = 140 - incomeHeight;
                const expenseY = 140 - expenseHeight;

                return (
                  <g key={m.month || idx}>
                    {/* Income Bar */}
                    <rect
                      x={startX}
                      y={incomeY}
                      width={barWidth}
                      height={Math.max(incomeHeight, 2)}
                      rx="3"
                      fill="#10b981"
                      className="chart-bar"
                    >
                      <title>{`Income: ${currency}${m.income}`}</title>
                    </rect>

                    {/* Expense Bar */}
                    <rect
                      x={startX + barWidth + 4}
                      y={expenseY}
                      width={barWidth}
                      height={Math.max(expenseHeight, 2)}
                      rx="3"
                      fill="#ef4444"
                      className="chart-bar"
                    >
                      <title>{`Expense: ${currency}${m.expense}`}</title>
                    </rect>

                    {/* Month Label */}
                    <text
                      x={startX + barWidth}
                      y="160"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="11"
                    >
                      {m.month ? m.month.slice(5) : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

