import axios from 'axios';

const setAuthToken = (token) => {
  if (!token) {
    console.log('Removing auth token from headers');
    delete axios.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return;
  }

  console.log('Setting auth token in headers:', token.substring(0, 15) + '...');
  axios.defaults.headers.common['x-auth-token'] = token;
  localStorage.setItem('token', token);
};

export default setAuthToken;