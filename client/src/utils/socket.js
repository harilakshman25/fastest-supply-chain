import io from 'socket.io-client';
import store from '../store';

let socket;

export const initializeSocket = () => {
  const { token } = store.getState().auth;
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: { token },
    reconnectionAttempts: 5
  });

  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('connect_error', error => console.error('Socket error:', error));
  socket.on('disconnect', reason => console.log('Socket disconnected:', reason));

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not initialized');
  return socket;
};

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

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
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
