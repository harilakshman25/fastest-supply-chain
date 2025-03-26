import axios from 'axios';

export const setAuthToken = (token )=> {
  const currentToken = localStorage.getItem('token');
  if (token === currentToken) {
    console.log('Token unchanged, skipping set');
    return;
  }
  console.log('Setting token:', token);
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    console.log('Removing token');
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

export default setAuthToken;