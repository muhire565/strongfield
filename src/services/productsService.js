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
    throw err;
  }
  return json;
}

export const productsService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString();
    const url = `${API_URL}/products${query ? `?${query}` : ''}`;
    const json = await fetchWithAuth(url);
    return json.data || [];
  },

  async getOne(id) {
    const json = await fetchWithAuth(`${API_URL}/products/${id}`);
    return json.data;
  },

  async create(data) {
    const json = await fetchWithAuth(`${API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async update(id, data) {
    const json = await fetchWithAuth(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return json.data;
  },

  async delete(id) {
    const json = await fetchWithAuth(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return json;
  },

  async export(productId, payload) {
    const json = await fetchWithAuth(`${API_URL}/products/${productId}/export`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return json;
  },

  async listExports() {
    const json = await fetchWithAuth(`${API_URL}/products/exports/all`);
    return json.data || [];
  },
};
