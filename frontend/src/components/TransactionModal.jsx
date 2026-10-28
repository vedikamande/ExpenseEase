import React, { useState, useEffect } from 'react';

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories,
  currency,
}) {
  const isEditMode = !!transaction;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        notes: transaction.notes || '',
      });
    } else {
      // Default to first expense category
      const defaultCat = categories.find((c) => c.type === 'expense')?.name || 'Food & Dining';
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: defaultCat,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setFormError('');
  }, [transaction, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  const handleTypeSwitch = (newType) => {
    const defaultForType = categories.find((c) => c.type === newType)?.name || '';
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultForType,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter a transaction title.');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter an amount greater than 0.');
      return;
    }

    if (!formData.category) {
      setFormError('Please select a category.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        amount: numAmount,
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            ×
          </button>
        </div>

        {formError && (
          <div className="modal-error-alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Type Toggle: Income vs Expense */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="modal-type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleTypeSwitch('expense')}
              >
                Expense (Cash Out)
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${formData.type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleTypeSwitch('income')}
              >
                Income (Cash In)
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title / Description *</label>
            <input
              type="text"
              placeholder="e.g. Grocery Supermarket, Freelance project"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-input"
                required
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input select-input"
              required
            >
              {filteredCategories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Additional details or payment method (e.g. credit card, cash)..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input textarea-input"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

