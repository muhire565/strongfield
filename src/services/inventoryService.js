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

export const inventoryService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const query = params.toString();
    const url = `${API_URL}/inventory${query ? `?${query}` : ''}`;
    const json = await fetchWithAuth(url);
    console.log('inventoryService.list response:', json);
    return json;
  },

  async getOne(id) {
    const json = await fetchWithAuth(`${API_URL}/inventory/${id}`);
    return json.data;
  },

  async getSummary() {
    const json = await fetchWithAuth(`${API_URL}/inventory/summary`);
    return json.data;
  },

  async getMovements(productId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.type) params.append('type', filters.type);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/inventory/${productId}/movements${query ? `?${query}` : ''}`);
    return json.data || [];
  },

  async getAllMovements(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/inventory/movements/all${query ? `?${query}` : ''}`);
    return json;
  },

  async stockIn(productId, data) {
    const json = await fetchWithAuth(`${API_URL}/inventory/${productId}/stock-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json;
  },

  async stockOut(productId, data) {
    const json = await fetchWithAuth(`${API_URL}/inventory/${productId}/stock-out`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json;
  },
};
