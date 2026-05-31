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

export const posService = {
  // Clients
  async listClients(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/pos/clients${query ? `?${query}` : ''}`);
    return json.data || [];
  },

  async getClient(id) {
    const json = await fetchWithAuth(`${API_URL}/pos/clients/${id}`);
    return json.data;
  },

  async createClient(data) {
    const json = await fetchWithAuth(`${API_URL}/pos/clients`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async updateClient(id, data) {
    const json = await fetchWithAuth(`${API_URL}/pos/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  // Sales
  async listSales(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/pos/sales${query ? `?${query}` : ''}`);
    return json.data || [];
  },

  async getSale(id) {
    const json = await fetchWithAuth(`${API_URL}/pos/sales/${id}`);
    return json.data;
  },

  async createSale(data) {
    const json = await fetchWithAuth(`${API_URL}/pos/sales`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async voidSale(id, reason) {
    const json = await fetchWithAuth(`${API_URL}/pos/sales/${id}/void`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return json.data;
  },

  // Payments
  async recordPayment(saleId, data) {
    const json = await fetchWithAuth(`${API_URL}/pos/sales/${saleId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async getSalePayments(saleId) {
    const json = await fetchWithAuth(`${API_URL}/pos/sales/${saleId}/payments`);
    return json.data || [];
  },

  async getPaymentsByMode(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/pos/payments/by-mode${query ? `?${query}` : ''}`);
    return json.data || [];
  },

  // Quotations
  async listQuotations(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/pos/quotations${query ? `?${query}` : ''}`);
    return json.data || [];
  },

  async getQuotation(id) {
    const json = await fetchWithAuth(`${API_URL}/pos/quotations/${id}`);
    return json.data;
  },

  async createQuotation(data) {
    const json = await fetchWithAuth(`${API_URL}/pos/quotations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async updateQuotation(id, data) {
    const json = await fetchWithAuth(`${API_URL}/pos/quotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async convertQuotation(id, data) {
    const json = await fetchWithAuth(`${API_URL}/pos/quotations/${id}/convert`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async cancelQuotation(id) {
    const json = await fetchWithAuth(`${API_URL}/pos/quotations/${id}/cancel`, { method: 'PATCH' });
    return json.data;
  },

  // Reports
  async getSummary() {
    const json = await fetchWithAuth(`${API_URL}/pos/summary`);
    return json.data;
  }
};
