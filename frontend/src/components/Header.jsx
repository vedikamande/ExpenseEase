import React from 'react';

export default function Header({
  currency,
  onCurrencyChange,
  isOnline,
  onOpenModal,
  onRefresh,
  loading
}) {
  const currencies = [
    { code: '$', label: 'USD ($)' },
    { code: '₹', label: 'INR (₹)' },
    { code: '€', label: 'EUR (€)' },
    { code: '£', label: 'GBP (£)' },
  ];

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
            <circle cx="16" cy="15" r="1.5" />
          </svg>
        </div>
        <div>
          <h1 className="brand-title">ExpenseEase</h1>
          <p className="brand-subtitle">Personal Expense & Income Tracker</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Connection status */}
        <div className={`status-pill ${isOnline ? 'status-online' : 'status-offline'}`} title={isOnline ? 'Connected to Flask Backend' : 'Backend not reachable - Check if Flask server is running'}>
          <span className="status-dot"></span>
          <span>{isOnline ? 'Flask API Connected' : 'API Offline'}</span>
        </div>

        {/* Currency Switcher */}
        <div className="currency-selector">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="select-input"
            aria-label="Select Currency"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="btn-icon"
          title="Refresh Data"
          disabled={loading}
          aria-label="Refresh"
        >
          <svg className={loading ? 'spin' : ''} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={() => onOpenModal()}
          className="btn-primary"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}

