import React from 'react';

export default function TransactionList({
  transactions,
  categories,
  currency,
  loading,
  onEdit,
  onDelete
}) {
  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.color : '#6366f1';
  };

  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="table-card">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h4>No transactions found</h4>
          <p>Try clearing your search filters or click "+ Add Transaction" to create a new entry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-card-header">
        <h3>Transactions History</h3>
        <span className="count-badge">{transactions.length} entries</span>
      </div>

      <div className="table-responsive">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const catColor = getCategoryColor(tx.category);

              return (
                <tr key={tx.id} className="transaction-row">
                  <td className="tx-date">{tx.date}</td>
                  <td className="tx-desc">
                    <span className="tx-title">{tx.title}</span>
                    {tx.notes && <span className="tx-notes">{tx.notes}</span>}
                  </td>
                  <td>
                    <span
                      className="category-chip"
                      style={{
                        backgroundColor: `${catColor}1a`,
                        borderColor: `${catColor}4d`,
                        color: catColor,
                      }}
                    >
                      <span className="chip-dot" style={{ backgroundColor: catColor }} />
                      {tx.category}
                    </span>
                  </td>
                  <td>
                    <span className={`type-tag ${isIncome ? 'type-income' : 'type-expense'}`}>
                      {isIncome ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={`text-right tx-amount ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}{currency}{formatAmount(tx.amount)}
                  </td>
                  <td className="text-center tx-actions">
                    <button
                      onClick={() => onEdit(tx)}
                      className="action-btn edit-btn"
                      title="Edit transaction"
                      aria-label="Edit"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="action-btn delete-btn"
                      title="Delete transaction"
                      aria-label="Delete"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

