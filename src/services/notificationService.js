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

export const notificationService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.read != null) params.append('read', String(filters.read));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.page) params.append('page', String(filters.page));
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/notifications${query ? `?${query}` : ''}`);
    return json;
  },

  async unreadCount() {
    const json = await fetchWithAuth(`${API_URL}/notifications/unread-count`);
    return json;
  },

  async markRead(id) {
    const json = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
    return json;
  },

  async markAllRead() {
    const json = await fetchWithAuth(`${API_URL}/notifications/read-all`, { method: 'PATCH' });
    return json;
  },

  async activity(filters = {}) {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.before) params.append('before', filters.before);
    if (filters.type) params.append('type', filters.type);
    const query = params.toString();
    const json = await fetchWithAuth(`${API_URL}/notifications/activity${query ? `?${query}` : ''}`);
    return json.data || [];
  },
};
