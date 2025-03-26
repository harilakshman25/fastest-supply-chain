import io from 'socket.io-client';
import store from '../store';
import { logout } from '../redux/slices/authSlice';

let socket = null;

export const initializeSocket = () => {
  const { token } = store.getState().auth;
  
  if (!token) {
    console.log('No token available, skipping socket initialization');
    return null;
  }

  if (socket) {
    console.log('Socket already initialized');
    return socket;
  }

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (error.message === 'Invalid token') {
      store.dispatch(logout());
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Keep existing functions (joinOrderRoom, etc.)
export const joinOrderRoom = (orderId) => {
  if (socket) {
    socket.emit('join_order_room', orderId);
  }
};

export const leaveOrderRoom = (orderId) => {
  if (socket) {
    socket.emit('leave_order_room', orderId);
  }
};

export const subscribeToOrderUpdates = (callback) => {
  if (socket) {
    socket.on('order_updated', callback);
  }
};

export const subscribeToLocationUpdates = (callback) => {
  if (socket) {
    socket.on('location_updated', callback);
  }
};

export const unsubscribeFromOrderUpdates = () => {
  if (socket) {
    socket.off('order_updated');
  }
};

export const unsubscribeFromLocationUpdates = () => {
  if (socket) {
    socket.off('location_updated');
  }
};

export default {
  initializeSocket,
  joinOrderRoom,
  leaveOrderRoom,
  subscribeToOrderUpdates,
  subscribeToLocationUpdates,
  unsubscribeFromOrderUpdates,
  unsubscribeFromLocationUpdates,
  disconnectSocket
};
