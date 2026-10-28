import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatCards from './components/StatCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionFilters from './components/TransactionFilters';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import NotificationToast from './components/NotificationToast';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [currency, setCurrency] = useState('$');
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
  });

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await api.checkHealth();
      const online = health.status === 'healthy';
      setIsOnline(online);

      if (online) {
        const [sumData, catData, txData] = await Promise.all([
          api.getSummary(),
          api.getCategories(),
          api.getTransactions(filters),
        ]);
        setSummary(sumData);
        setCategories(catData);
        setTransactions(txData);
      } else {
        // Fallback demo state if backend is booting or not running
        setSummary({
          total_income: 4250.0,
          total_expenses: 1684.75,
          net_balance: 2565.25,
          savings_rate: 60.4,
          total_transactions: 8,
          category_breakdown: [
            { category: 'Housing & Rent', total: 1200.0, percentage: 71.2, color: '#ef4444' },
            { category: 'Food & Dining', total: 259.75, percentage: 15.4, color: '#f97316' },
            { category: 'Utilities & Bills', total: 120.0, percentage: 7.1, color: '#3b82f6' },
            { category: 'Transportation', total: 60.0, percentage: 3.6, color: '#f59e0b' },
            { category: 'Education', total: 45.0, percentage: 2.7, color: '#6366f1' },
          ],
          monthly_trend: [
            { month: '2026-08', income: 3800, expense: 1520, balance: 2280 },
            { month: '2026-09', income: 4100, expense: 1610, balance: 2490 },
            { month: '2026-10', income: 4250, expense: 1684, balance: 2565 },
          ],
        });
        setCategories([
          { name: 'Salary', type: 'income', color: '#10b981' },
          { name: 'Freelance', type: 'income', color: '#06b6d4' },
          { name: 'Housing & Rent', type: 'expense', color: '#ef4444' },
          { name: 'Food & Dining', type: 'expense', color: '#f97316' },
          { name: 'Transportation', type: 'expense', color: '#f59e0b' },
          { name: 'Utilities & Bills', type: 'expense', color: '#3b82f6' },
          { name: 'Education', type: 'expense', color: '#6366f1' },
        ]);
        setTransactions([
          { id: 1, title: 'Monthly Salary', amount: 3500.0, type: 'income', category: 'Salary', date: '2026-10-01', notes: 'Main direct deposit' },
          { id: 2, title: 'Freelance Web Design', amount: 750.0, type: 'income', category: 'Freelance', date: '2026-10-15', notes: 'Client invoice' },
          { id: 3, title: 'Apartment Rent', amount: 1200.0, type: 'expense', category: 'Housing & Rent', date: '2026-10-02', notes: 'October rent' },
          { id: 4, title: 'Grocery Supermarket', amount: 185.5, type: 'expense', category: 'Food & Dining', date: '2026-10-05', notes: 'Weekly groceries' },
          { id: 5, title: 'Electricity & Internet', amount: 120.0, type: 'expense', category: 'Utilities & Bills', date: '2026-10-10', notes: 'Utilities' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal triggers
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Save (Add or Update)
  const handleSubmitTransaction = async (formData) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, formData);
      showToast('Transaction updated successfully!');
    } else {
      await api.createTransaction(formData);
      showToast('Transaction created successfully!');
    }
    fetchData();
  };

  // Delete
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      await api.deleteTransaction(id);
      showToast('Transaction deleted successfully!');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!transactions.length) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ExpenseEase_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Transactions exported to CSV!');
  };

  return (
    <div className="app-layout">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        isOnline={isOnline}
        onOpenModal={handleOpenAddModal}
        onRefresh={fetchData}
        loading={loading}
      />

      <main className="main-content">
        {/* Offline Banner if Flask isn't started yet */}
        {!isOnline && (
          <div className="offline-banner">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="banner-text">
              <strong>Flask Backend Not Detected:</strong> Displaying offline preview mode.
              Run <code>python backend/app.py</code> in a terminal to connect the live SQLite database!
            </div>
            <button onClick={fetchData} className="btn-banner-retry">
              Check Connection
            </button>
          </div>
        )}

        {/* Top Metric Stat Cards */}
        <StatCards summary={summary} currency={currency} />

        {/* Analytics & Monthly Chart */}
        <AnalyticsCharts summary={summary} currency={currency} />

        {/* Filter Controls & Search */}
        <TransactionFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          onExportCsv={handleExportCsv}
        />

        {/* Transactions Table */}
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTransaction}
        />
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTransaction}
        transaction={editingTransaction}
        categories={categories}
        currency={currency}
      />

      {/* Toast feedback */}
      <NotificationToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
