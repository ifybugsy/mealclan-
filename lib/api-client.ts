// API Client for Express Backend Integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error('[v0] API Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),

  verify: (token?: string) =>
    apiCall('/auth/verify', { token }),

  changePassword: (currentPassword: string, newPassword: string, token?: string) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
    }),
};

// Menu APIs
export const menuAPI = {
  getAll: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return apiCall(`/menu${params}`);
  },

  getById: (id: string) =>
    apiCall(`/menu/${id}`),

  create: (data: any, token?: string) =>
    apiCall('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token?: string) =>
    apiCall(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token?: string) =>
    apiCall(`/menu/${id}`, {
      method: 'DELETE',
      token,
    }),

  getStats: (token?: string) =>
    apiCall('/menu/stats/summary', { token }),
};

// Order APIs
export const orderAPI = {
  getAll: (status?: string, token?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/orders${params}`, { token });
  },

  getById: (id: string) =>
    apiCall(`/orders/${id}`),

  create: (data: any) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string, token?: string) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      token,
    }),

  updatePaymentStatus: (id: string, paymentStatus: string, token?: string) =>
    apiCall(`/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
      token,
    }),

  getStats: (token?: string) =>
    apiCall('/orders/stats/dashboard', { token }),

  delete: (id: string, token?: string) =>
    apiCall(`/orders/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Settings APIs
export const settingsAPI = {
  getAll: () =>
    apiCall('/settings'),

  get: (key: string) =>
    apiCall(`/settings/${key}`),

  set: (key: string, value: any, token?: string) =>
    apiCall(`/settings/${key}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
      token,
    }),

  bulkUpdate: (data: any, token?: string) =>
    apiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  getRestaurantInfo: () =>
    apiCall('/settings/restaurant/info'),

  updateRestaurantInfo: (data: any, token?: string) =>
    apiCall('/settings/restaurant/info', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
};

// Gallery APIs
export const galleryAPI = {
  getAll: () =>
    apiCall('/gallery'),

  getById: (id: string) =>
    apiCall(`/gallery/${id}`),

  create: (data: any, token?: string) =>
    apiCall('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token?: string) =>
    apiCall(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token?: string) =>
    apiCall(`/gallery/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// Contact APIs
export const contactAPI = {
  submit: (data: any) =>
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (token?: string) =>
    apiCall('/contact', { token }),

  getById: (id: string, token?: string) =>
    apiCall(`/contact/${id}`, { token }),

  markAsRead: (id: string, token?: string) =>
    apiCall(`/contact/${id}/read`, {
      method: 'PUT',
      token,
    }),
};

export default apiCall;
