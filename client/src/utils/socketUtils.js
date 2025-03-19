// client/src/utils/socketUtils.js
import io from 'socket.io-client';

let socket;

// Initialize socket connection
export const initSocket = (token) => {
  socket = io('/', {
    auth: {
      token
    }
  });
  
  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket() first.');
  }
  return socket;
};

// Clean up socket connection
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Join a room/channel
export const joinRoom = (room) => {
  if (socket) {
    socket.emit('join_room', room);
  }
};

// Leave a room/channel
export const leaveRoom = (room) => {
  if (socket) {
    socket.emit('leave_room', room);
  }
};

// Listen for an event
export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

// Stop listening for an event
export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// Emit an event
export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};
