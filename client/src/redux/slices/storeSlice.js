// client/src/redux/slices/storeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  stores: [],
  store: null,
  stats: null,
  loadingStates: {
    getStores: false,
    getStoreById: false,
    getStoreByManager: false,
    getNearbyStores: false,
    getStoreStats: false
  },
  error: null
};

// Helper function to clear store state
const clearStoreState = () => ({
  stores: [],
  store: null,
  stats: null,
  loadingStates: {
    getStores: false,
    getStoreById: false,
    getStoreByManager: false,
    getNearbyStores: false,
    getStoreStats: false
  },
  error: null
});

// Get all stores
export const getStores = createAsyncThunk(
  'store/getStores',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/stores');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load stores');
    }
  }
);

// Get store by ID
export const getStoreById = createAsyncThunk(
  'store/getStoreById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/stores/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load store');
    }
  }
);

// Get store by manager ID
export const getStoreByManager = createAsyncThunk(
  'store/getStoreByManager',
  async (managerId, { rejectWithValue }) => {
    try {
      console.log('Calling getStoreByManager with ID:', managerId);
      console.log('Token in storage:', localStorage.getItem('token'));
      console.log('User in storage:', localStorage.getItem('user'));
      
      const res = await axios.get(`/api/stores/manager/${managerId}`);
      console.log('getStoreByManager response:', res.data);
      return res.data;
    } catch (err) {
      console.error('getStoreByManager error details:', err);
      console.error('getStoreByManager error response:', err.response?.data);
      console.error('getStoreByManager error status:', err.response?.status);
      const errorMessage = err.response?.data?.msg || 'Failed to load store';
      console.error('getStoreByManager error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get nearby stores
export const getNearbyStores = createAsyncThunk(
  'store/getNearbyStores',
  async ({ lat, lng, maxDistance }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/stores/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance || 5}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load nearby stores');
    }
  }
);

export const getStoreStats = createAsyncThunk(
  'store/getStoreStats',
  async (storeId, { rejectWithValue, getState }) => {
    const timeRange = getState().store.timeRange || 'week';
    try {
      const res = await axios.get(`/api/stores/${storeId}/stats?timeRange=${timeRange}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load store statistics');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    clearStoreErrors: (state) => {
      state.error = null;
    },
    resetStoreState: () => clearStoreState(),
    clearLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach(key => {
        state.loadingStates[key] = false;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all stores
      .addCase(getStores.pending, (state) => {
        state.loadingStates.getStores = true;
        state.error = null;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loadingStates.getStores = false;
        state.stores = action.payload;
        state.error = null;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loadingStates.getStores = false;
        state.error = action.payload;
      })
      
      // Get store by ID
      .addCase(getStoreById.pending, (state) => {
        state.loadingStates.getStoreById = true;
        state.error = null;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.loadingStates.getStoreById = false;
        state.store = action.payload;
        state.error = null;
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.loadingStates.getStoreById = false;
        state.error = action.payload;
      })
      
      // Get store by manager ID
      .addCase(getStoreByManager.pending, (state) => {
        state.loadingStates.getStoreByManager = true;
        state.error = null;
      })
      .addCase(getStoreByManager.fulfilled, (state, action) => {
        state.loadingStates.getStoreByManager = false;
        state.store = action.payload;
        state.error = null;
      })
      .addCase(getStoreByManager.rejected, (state, action) => {
        state.loadingStates.getStoreByManager = false;
        state.error = action.payload;
        state.store = null;
      })
      
      // Get nearby stores
      .addCase(getNearbyStores.pending, (state) => {
        state.loadingStates.getNearbyStores = true;
        state.error = null;
      })
      .addCase(getNearbyStores.fulfilled, (state, action) => {
        state.loadingStates.getNearbyStores = false;
        state.stores = action.payload;
        state.error = null;
      })
      .addCase(getNearbyStores.rejected, (state, action) => {
        state.loadingStates.getNearbyStores = false;
        state.error = action.payload;
      })
      
      // Get store stats
      .addCase(getStoreStats.pending, (state) => {
        state.loadingStates.getStoreStats = true;
        state.error = null;
      })
      .addCase(getStoreStats.fulfilled, (state, action) => {
        state.loadingStates.getStoreStats = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getStoreStats.rejected, (state, action) => {
        state.loadingStates.getStoreStats = false;
        state.error = action.payload;
      });
  }
});

export const { clearStoreErrors, resetStoreState, clearLoadingStates } = storeSlice.actions;

export default storeSlice.reducer;
