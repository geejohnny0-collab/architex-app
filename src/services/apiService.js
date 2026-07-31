// src/services/apiService.js
// Centralized API client for Architex.
// All requests are made through this module so auth headers, base URL,
// and error handling are consistent across every component.

const BASE_URL = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api');

function getToken() {
  return localStorage.getItem('authToken');
}

/**
 * Core fetch wrapper – attaches Authorization header and parses JSON.
 * Throws an Error with a human-readable message on non-2xx responses.
 */
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // No content
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

/**
 * Upload a file to Cloudinary via the backend /api/upload endpoint.
 * @param {File} file – the File object from an <input type="file">
 * @param {'avatar'|'cover'|'post'|'resume'|'proposal'|'logo'} purpose
 */
async function uploadFile(file, purpose = 'post') {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data; // { url, publicId, resourceType, format, bytes }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  loginWithGoogle: (idToken) => request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }),
  me: () => request('/auth/me'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
const users = {
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/users?${qs}`);
  },
  getById: (id) => request(`/users/${id}`),
  updateMe: (data) => request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  follow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),
  getFollowers: (id) => request(`/users/${id}/followers`),
  getFollowing: (id) => request(`/users/${id}/following`),
  getPostsById: (id) => request(`/users/${id}/posts`),
  checkOnline: (id) => request(`/users/${id}/online`),
};

// ─── Posts ────────────────────────────────────────────────────────────────────
const posts = {
  getFeed: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/posts?${qs}`);
  },
  create: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  toggleLike: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
const comments = {
  getForPost: (postId) => request(`/posts/${postId}/comments`),
  create: (postId, data) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Conversations & Messages ─────────────────────────────────────────────────
const conversations = {
  list: () => request('/conversations'),
  start: (userId) => request('/conversations', { method: 'POST', body: JSON.stringify({ userId }) }),
  getMessages: (convId) => request(`/conversations/${convId}/messages`),
  sendMessage: (convId, data) =>
    request(`/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
const notifications = {
  list: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  clearAll: () => request('/notifications', { method: 'DELETE' }),
};

// ─── Uploads ──────────────────────────────────────────────────────────────────
const uploads = { uploadFile };

// ─── Stripe ───────────────────────────────────────────────────────────────────
const stripe = {
  checkout: (data) => request('/stripe/checkout', { method: 'POST', body: JSON.stringify(data) }),
  webhook: (data) => request('/stripe/webhook', { method: 'POST', body: JSON.stringify(data) })
};

const credits = {
  spend: (data) => request('/credits/spend', { method: 'POST', body: JSON.stringify(data) })
};

const patch = (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) });
const get = (path) => request(path, { method: 'GET' });
const search = (query) => request(`/search?q=${encodeURIComponent(query)}`);

export default { auth, users, posts, comments, conversations, notifications, uploads, uploadFile, stripe, credits, patch, request, get, search };
export { auth, users, posts, comments, conversations, notifications, uploads, stripe, credits, patch, request, get, search };
