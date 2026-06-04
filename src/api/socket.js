import { io } from 'socket.io-client';

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl, window.location.origin);
      return `${u.protocol}//${u.host}`;
    } catch {}
  }
  // Fall back to same origin — relies on Vite proxy or same-origin deployment
  return window.location.origin;
};

const SOCKET_URL = resolveSocketUrl();

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected && socket.auth?.token === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
