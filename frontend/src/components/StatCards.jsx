import React from 'react';

export default function StatCards({ summary, currency }) {
  const {
    total_income = 0,
    total_expenses = 0,
    net_balance = 0,
    savings_rate = 0,
    total_transactions = 0
  } = summary || {};

  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isPositiveBalance = net_balance >= 0;

  return (
    <div className="stat-cards-grid">
      {/* Net Balance Card */}
      <div className={`stat-card ${isPositiveBalance ? 'card-balance-positive' : 'card-balance-negative'}`}>
        <div className="stat-card-header">
          <span className="stat-label">Net Balance</span>
          <div className="stat-icon-wrapper balance-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <div className="stat-value">
          {currency}{formatAmount(net_balance)}
        </div>
        <div className="stat-footer">
          <span className={`badge ${isPositiveBalance ? 'badge-success' : 'badge-danger'}`}>
            {isPositiveBalance ? 'Surplus' : 'Deficit'}
          </span>
          <span className="stat-subtitle">{total_transactions} total transactions</span>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Income</span>
          <div className="stat-icon-wrapper income-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
        <div className="stat-value text-income">
          +{currency}{formatAmount(total_income)}
        </div>
        <div className="stat-footer">
          <span className="badge badge-income">Cash In</span>
          <span className="stat-subtitle">All credited income</span>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Expenses</span>
          <div className="stat-icon-wrapper expense-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          </div>
        </div>
        <div className="stat-value text-expense">
          -{currency}{formatAmount(total_expenses)}
        </div>
        <div className="stat-footer">
          <span className="badge badge-expense">Cash Out</span>
          <span className="stat-subtitle">All debited expenses</span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Savings Rate</span>
          <div className="stat-icon-wrapper savings-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        </div>
        <div className="stat-value">
          {savings_rate}%
        </div>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(Math.max(savings_rate, 0), 100)}%` }}
          />
        </div>
        <div className="stat-footer">
          <span className="stat-subtitle">
            {savings_rate >= 20 ? 'Target achieved (≥20%)' : 'Aim for 20% savings'}
          </span>
        </div>
      </div>
    </div>
  );
}

