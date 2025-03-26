// client/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAuthToken } from '../../utils/setAuthToken';


const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !! localStorage.getItem('token'),
  loading: !localStorage.getItem('token'),
  user: null,
  error: null
};

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    let endpoint = '/api/auth/register';
    
    const response = await axios.post(endpoint, userData);
    const { token } = response.data;
    setAuthToken(token);
    return { token, user: response.data.user };
  } catch (error) {
    console.error('Registration Error:', error.response?.data);
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});


export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    console.log('Login response:', response.data);
    const { token } = response.data;
    setAuthToken(token);
    return { token, user: response.data.user };
  } catch (error) {
    console.error('Login error:', error.response?.data);
    return rejectWithValue(error.response?.data?.msg || 'Login failed');
  }
});

// Register store manager
export const registerManager = createAsyncThunk(
  'auth/registerManager',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register/manager', formData);
      return res.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.response.data.msg || 'Registration failed');
    }
  }
);

// Register delivery person
export const registerDelivery = createAsyncThunk(
  'auth/registerDelivery',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register/delivery', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Registration failed');
    }
  }
);



// Load user
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  if (token) {
    setAuthToken(token);
  } else {
    console.log('No token found, skipping request');
    return rejectWithValue('No token available');
  }
  try {
    const res = await axios.get('/api/auth/me');
    console.log('User data loaded:', res.data);
    return res.data;
  } catch (err) {
    console.error('Load user error:', err.response?.status, err.response?.data);
    return rejectWithValue(err.response?.data?.msg || 'User load failed');
  }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('token');
    setAuthToken(null);
    return null;
  } catch (err) {
    return rejectWithValue(err.response.data.msg || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(register.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error=null;
      })
      .addCase(register.rejected, (state, action) => {
        localStorage.removeItem('token');
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.error.message;
      })
      .addCase(registerManager.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(registerManager.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        state.loading = false;
        state.error=null;
        state.token=action.payload.token;
      })
      .addCase(registerManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Manager registration failed';
      })
      .addCase(registerDelivery.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(registerDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.error=null;
        // Delivery registration requires approval, no token returned
      })
      .addCase(registerDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("login fullfilled",action.payload);
        localStorage.setItem('token', action.payload.token);
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error=null;
      })
      .addCase(login.rejected, (state, action) => {
        console.login("login rejected",action.payload);
        localStorage.removeItem('token');
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        console.error('loadUser failed:', action.payload);
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
        if (action.payload === 'Token is not valid') {
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          state.token = null;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error=null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearErrors } = authSlice.actions;

export default authSlice.reducer;
