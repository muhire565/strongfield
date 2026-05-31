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
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null) q.append(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const reportsService = {
  incomeStatement(from, to) {
    return fetchWithAuth(`${API_URL}/reports/income-statement${buildQuery({ from, to })}`).then(r => r.data);
  },
  balanceSheet(asAt) {
    return fetchWithAuth(`${API_URL}/reports/balance-sheet${buildQuery({ as_at: asAt })}`).then(r => r.data);
  },
  cashFlow(from, to) {
    return fetchWithAuth(`${API_URL}/reports/cash-flow${buildQuery({ from, to })}`).then(r => r.data);
  },
  salesReport(from, to, groupBy) {
    return fetchWithAuth(`${API_URL}/reports/sales${buildQuery({ from, to, group_by: groupBy })}`).then(r => r.data);
  },
  inventoryReport(from, to) {
    return fetchWithAuth(`${API_URL}/reports/inventory${buildQuery({ from, to })}`).then(r => r.data);
  },
  creditReport(from, to) {
    return fetchWithAuth(`${API_URL}/reports/credit${buildQuery({ from, to })}`).then(r => r.data);
  },
  paymentModeReport(from, to) {
    return fetchWithAuth(`${API_URL}/reports/payment-modes${buildQuery({ from, to })}`).then(r => r.data);
  },
  expensesReport(from, to) {
    return fetchWithAuth(`${API_URL}/reports/expenses${buildQuery({ from, to })}`).then(r => r.data);
  },
  ownerEquity(from, to) {
    return fetchWithAuth(`${API_URL}/reports/owner-equity${buildQuery({ from, to })}`).then(r => r.data);
  },
  trialBalance(asAt) {
    return fetchWithAuth(`${API_URL}/reports/trial-balance${buildQuery({ as_at: asAt })}`).then(r => r.data);
  },
  generalLedger(from, to, type) {
    return fetchWithAuth(`${API_URL}/reports/general-ledger${buildQuery({ from, to, type })}`).then(r => r.data);
  },
  comparative(p1From, p1To, p2From, p2To) {
    return fetchWithAuth(`${API_URL}/reports/comparative${buildQuery({ p1_from: p1From, p1_to: p1To, p2_from: p2From, p2_to: p2To })}`).then(r => r.data);
  },
  summary(from, to) {
    return fetchWithAuth(`${API_URL}/reports/summary${buildQuery({ from, to })}`).then(r => r.data);
  },
};
