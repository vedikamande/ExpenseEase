// API Client for ExpenseEase Flask Backend
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP Error: ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
      else if (data.errors && Array.isArray(data.errors)) errorMsg = data.errors.join(', ');
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
      return await handleResponse(res);
    } catch (err) {
      return { status: 'unreachable', error: err.message };
    }
  },

  async getSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    return handleResponse(res);
  },

  async getCategories(type = '') {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await fetch(`${API_BASE}/categories${query}`);
    return handleResponse(res);
  },

  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/transactions${qs}`);
    return handleResponse(res);
  },

  async createTransaction(transaction) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    return handleResponse(res);
  },

  async updateTransaction(id, transaction) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    return handleResponse(res);
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

