// src/services/authService.js
// Authentication service for Architex.
// Handles signup, login, Google OAuth, session persistence, and server-side verification.

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

const BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:5000') + '/api';

// ─── Token Storage ────────────────────────────────────────────────────────────

function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function apiPost(path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function apiGet(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Verify the stored token with the server.
 * Returns the fresh user object if valid, or null if not.
 * Clears the session on token expiry or invalidity.
 */
async function verifySession() {
  if (!getToken()) return null;
  try {
    const data = await apiGet('/auth/me');
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    clearSession();
    return null;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Sign up a new user.
 */
async function signup(data) {
  const result = await apiPost('/auth/signup', data);
  setSession(result);
  return result;
}

/**
 * Log in with email + password.
 */
async function login(data) {
  const result = await apiPost('/auth/login', data);
  setSession(result);
  return result;
}

/**
 * Log in with a Google ID token.
 */
async function loginWithGoogle(idToken) {
  const result = await apiPost('/auth/google', { idToken });
  setSession(result);
  return result;
}

/**
 * Log out the current user.
 */
function logout() {
  clearSession();
}

/**
 * Update the locally stored user object without a server round-trip.
 */
function updateStoredUser(updatedUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
}

export default {
  signup,
  login,
  loginWithGoogle,
  logout,
  verifySession,
  getCurrentUser,
  getToken,
  updateStoredUser,
};
