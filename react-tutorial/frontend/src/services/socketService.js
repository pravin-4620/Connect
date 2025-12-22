import io from 'socket.io-client';

let socket = null;

// Initialize WebSocket connection
export const initializeSocket = (role) => {
  if (socket && socket.connected) {
    console.log('✅ WebSocket already connected');
    return socket;
  }

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log(`📡 Connected to WebSocket: ${socket.id}`);
    if (role) {
      socket.emit('join-role', role);
    }
  });

  socket.on('disconnect', () => {
    console.log('📡 Disconnected from WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn('⚠️  WebSocket not connected');
  }
  return socket;
};

// Listen for events
export const on = (event, callback) => {
  if (!socket) {
    console.warn('⚠️  WebSocket not initialized');
    return;
  }
  socket.on(event, callback);
};

// Listen for events once
export const once = (event, callback) => {
  if (!socket) {
    console.warn('⚠️  WebSocket not initialized');
    return;
  }
  socket.once(event, callback);
};

// Remove event listener
export const off = (event, callback) => {
  if (!socket) return;
  socket.off(event, callback);
};

// Emit event
export const emit = (event, data) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️  WebSocket not connected');
    return;
  }
  socket.emit(event, data);
};

// Disconnect
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const socketService = {
  initializeSocket,
  getSocket,
  on,
  once,
  off,
  emit,
  disconnect
};

export default socketService;
