// client/src/redux/slices/storeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  stores: [],
  store: null,
  stats: null,
  loading: false,
  error: null
};

// Get all stores
export const getStores = createAsyncThunk(
  'store/getStores',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/stores');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load stores');
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
      return rejectWithValue(err.response.data.msg || 'Failed to load store');
    }
  }
);

// Get store by manager ID
export const getStoreByManager = createAsyncThunk(
  'store/getStoreByManager',
  async (managerId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/stores/manager/${managerId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load store');
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
      return rejectWithValue(err.response.data.msg || 'Failed to load nearby stores');
    }
  }
);

export const getStoreStats = createAsyncThunk(
    'store/getStoreStats',
    async (storeId,{ rejectWithValue, getState }) => {
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all stores
      .addCase(getStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get store by ID
      .addCase(getStoreById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get store by manager ID
      .addCase(getStoreByManager.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(getStoreByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get nearby stores
      .addCase(getNearbyStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNearbyStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getNearbyStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get store stats
      .addCase(getStoreStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getStoreStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearStoreErrors } = storeSlice.actions;

export default storeSlice.reducer;
