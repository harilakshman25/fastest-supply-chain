// client/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';

// Helper function to clear auth state
const clearAuthState = () => ({
  token: null,
  isAuthenticated: false,
  user: null,
  loadingStates: {
    login: false,
    register: false,
    loadUser: false,
  },
  error: null
});

// Get stored auth state from localStorage
export const getStoredAuthState = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    return clearAuthState();
  }

  console.log('getStoredAuthState user object:', user);
  console.log('User ID property:', user.id);
  
  return {
    token,
    isAuthenticated: true,
    user,
    loadingStates: {
      login: false,
      register: false,
      loadUser: false,
    },
    error: null
  };
};

const initialState = getStoredAuthState();

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
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token available');
    }

    try {
      setAuthToken(token);
      const res = await axios.get('/api/auth/me');
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue('Token is invalid');
      }
      return rejectWithValue(err.response?.data?.msg || 'Failed to load user');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // First try to call the server logout endpoint
    await axios.post('/api/auth/logout');
  } catch (err) {
    console.error('Server logout failed:', err);
    // Even if server logout fails, we should still clear local state
  } finally {
    // Always clear local state regardless of server response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    return null;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach(key => {
        state.loadingStates[key] = false;
      });
    },
    clearAuth: () => clearAuthState(),
    restoreAuthState: () => getStoredAuthState()
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loadingStates.register = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loadingStates.register = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loadingStates.register = false;
        state.error = action.error.message;
      })
      .addCase(registerManager.pending, (state) => {
        state.loadingStates.register = true;
        state.error=null;
      })
      .addCase(registerManager.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        state.loadingStates.register = false;
        state.error=null;
        state.token=action.payload.token;
      })
      .addCase(registerManager.rejected, (state, action) => {
        state.loadingStates.register = false;
        state.error = action.payload || 'Manager registration failed';
      })
      .addCase(registerDelivery.pending, (state) => {
        state.loadingStates.register = true;
        state.error=null;
      })
      .addCase(registerDelivery.fulfilled, (state, action) => {
        state.loadingStates.register = false;
        state.error=null;
        // Delivery registration requires approval, no token returned
      })
      .addCase(registerDelivery.rejected, (state, action) => {
        state.loadingStates.register = false;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.loadingStates.loadUser = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loadingStates.loadUser = false;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        if (action.payload === 'Token is invalid') {
          return clearAuthState();
        }
        state.loadingStates.loadUser = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loadingStates.login = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loadingStates.login = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        return {
          ...clearAuthState(),
          error: action.payload
        };
      })
      .addCase(logout.pending, (state) => {
        state.loadingStates.auth = true;
      })
      .addCase(logout.fulfilled, () => clearAuthState())
      .addCase(logout.rejected, () => clearAuthState());
  }
});

export const { clearErrors, clearLoadingStates, clearAuth, restoreAuthState } = authSlice.actions;

export default authSlice.reducer;
