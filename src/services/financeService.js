import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

function getToken() {
  return useAuthStore.getState().session?.access_token;
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error || 'Something went wrong');
    err.status = res.status;
    err.response = { data: json };
    throw err;
  }
  return json;
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  return qs.toString();
}

export const financeService = {
  getBalances: () => fetchWithAuth(`${API_URL}/finance/balances`),

  listCapital: (params = {}) => fetchWithAuth(`${API_URL}/finance/capital?${buildQuery(params)}`),
  injectCapital: (body) => fetchWithAuth(`${API_URL}/finance/capital`, { method: 'POST', body: JSON.stringify(body) }),

  listExpenses: (params = {}) => fetchWithAuth(`${API_URL}/finance/expenses?${buildQuery(params)}`),
  recordExpense: (body) => fetchWithAuth(`${API_URL}/finance/expenses`, { method: 'POST', body: JSON.stringify(body) }),
  getExpense: (id) => fetchWithAuth(`${API_URL}/finance/expenses/${id}`),

  listWithdrawals: (params = {}) => fetchWithAuth(`${API_URL}/finance/withdrawals?${buildQuery(params)}`),
  recordWithdrawal: (body) => fetchWithAuth(`${API_URL}/finance/withdrawals`, { method: 'POST', body: JSON.stringify(body) }),
  getWithdrawal: (id) => fetchWithAuth(`${API_URL}/finance/withdrawals/${id}`),

  listPurchases: (params = {}) => fetchWithAuth(`${API_URL}/finance/purchases?${buildQuery(params)}`),
  recordPurchase: (body) => fetchWithAuth(`${API_URL}/finance/purchases`, { method: 'POST', body: JSON.stringify(body) }),
  getPurchase: (id) => fetchWithAuth(`${API_URL}/finance/purchases/${id}`),

  listSuppliers: (params = {}) => fetchWithAuth(`${API_URL}/finance/suppliers?${buildQuery(params)}`),
  createSupplier: (body) => fetchWithAuth(`${API_URL}/finance/suppliers`, { method: 'POST', body: JSON.stringify(body) }),
  getSupplier: (id) => fetchWithAuth(`${API_URL}/finance/suppliers/${id}`),
  supplierPayment: (id, body) => fetchWithAuth(`${API_URL}/finance/suppliers/${id}/payments`, { method: 'POST', body: JSON.stringify(body) }),

  listTransactions: (params = {}) => fetchWithAuth(`${API_URL}/finance/transactions?${buildQuery(params)}`),
  getTransaction: (id) => fetchWithAuth(`${API_URL}/finance/transactions/${id}`),

  getSummary: (params = {}) => fetchWithAuth(`${API_URL}/finance/summary?${buildQuery(params)}`),
  getCashflow: (params = {}) => fetchWithAuth(`${API_URL}/finance/cashflow?${buildQuery(params)}`),
};
