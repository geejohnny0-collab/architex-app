// src/services/socketService.js
// Socket.io client wrapper for Architex real-time features.
// Handles connection lifecycle, automatic reconnect, and event dispatch.

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

let socket = null;

/**
 * Connect to the Socket.io server with the user's auth token.
 * Call this once after the user is authenticated.
 */
export function connect(token) {
  if (socket && socket.connected) return socket;

  socket = io(SERVER_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'], // prefer WebSocket, fall back to polling
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Call this on logout.
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Returns the current socket instance (may be null if not connected). */
export function getSocket() {
  return socket;
}

/** Subscribe to an event. Returns an unsubscribe function. */
export function on(event, handler) {
  if (!socket) return () => {};
  socket.on(event, handler);
  return () => socket?.off(event, handler);
}

/** Emit a typed event to the server. */
export function emit(event, data) {
  if (!socket || !socket.connected) {
    console.warn('[Socket] Emit skipped – not connected:', event);
    return;
  }
  socket.emit(event, data);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

/** Join a conversation room (for typing indicators and message events). */
export function joinConversation(conversationId) {
  emit('conversation:join', { conversationId });
}

/** Leave a conversation room. */
export function leaveConversation(conversationId) {
  emit('conversation:leave', { conversationId });
}

/** Emit typing:start */
export function startTyping(conversationId) {
  emit('typing:start', { conversationId });
}

/** Emit typing:stop */
export function stopTyping(conversationId) {
  emit('typing:stop', { conversationId });
}

/** Emit message:read */
export function markMessageRead(conversationId, messageId) {
  emit('message:read', { conversationId, messageId });
}

export default { connect, disconnect, getSocket, on, emit, joinConversation, leaveConversation, startTyping, stopTyping, markMessageRead };
