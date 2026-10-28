import React from 'react';

export default function TransactionFilters({
  filters,
  onFilterChange,
  categories,
  onExportCsv
}) {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by title or notes..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="search-input"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="clear-search-btn"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* Type Filter Pills */}
        <div className="type-toggle-group">
          {['all', 'income', 'expense'].map((t) => (
            <button
              key={t}
              onClick={() => onFilterChange({ ...filters, type: t })}
              className={`type-pill ${filters.type === t ? 'active' : ''}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="select-input"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>

        {/* Export CSV Button */}
        <button
          onClick={onExportCsv}
          className="btn-secondary"
          title="Export transactions to CSV spreadsheet"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}

