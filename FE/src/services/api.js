const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

export const accountsApi = {
  list: () => request('/api/admin/accounts'),
  create: (data) =>
    request('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/api/admin/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    request(`/api/admin/accounts/${id}`, { method: 'DELETE' })
};

export const partnersApi = {
  list: () => request('/api/admin/partners'),
  getMe: () => request('/api/partners/me'),
  create: (data) =>
    request('/api/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/api/admin/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    request(`/api/admin/partners/${id}`, { method: 'DELETE' }),
  updateStatus: (id, status) =>
    request('/api/admin/partners/update-status', {
      method: 'PUT',
      body: JSON.stringify({ id, status })
    })
};
