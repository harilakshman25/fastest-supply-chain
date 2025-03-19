// client/src/redux/slices/deliverySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  activeDeliveries: [],
  deliveryHistory: [],
  stats: null,
  loading: false,
  error: null
};

// Get active deliveries
export const getActiveDeliveries = createAsyncThunk(
  'delivery/getActiveDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/delivery/active');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load active deliveries');
    }
  }
);

// Get delivery history
export const getDeliveryHistory = createAsyncThunk(
  'delivery/getDeliveryHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/delivery/history');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load delivery history');
    }
  }
);

// Get delivery statistics
export const getDeliveryStats = createAsyncThunk(
  'delivery/getDeliveryStats',
  async (timeRange = 'week', { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/delivery/stats?timeRange=${timeRange}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load delivery statistics');
    }
  }
);

// Update order status (by delivery person)
export const updateOrderStatus = createAsyncThunk(
  'delivery/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/delivery/orders/${orderId}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update order status');
    }
  }
);

// Update delivery location
export const updateLocation = createAsyncThunk(
  'delivery/updateLocation',
  async ({ coordinates, orderId }, { rejectWithValue }) => {
    try {
      const res = await axios.put('/api/delivery/location', { coordinates, orderId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update location');
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearDeliveryErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get active deliveries
      .addCase(getActiveDeliveries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.activeDeliveries = action.payload;
      })
      .addCase(getActiveDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get delivery history
      .addCase(getDeliveryHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDeliveryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryHistory = action.payload;
      })
      .addCase(getDeliveryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get delivery stats
      .addCase(getDeliveryStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDeliveryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getDeliveryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update order status in active deliveries
        state.activeDeliveries = state.activeDeliveries.map(delivery => 
          delivery._id === action.payload._id ? action.payload : delivery
        );
        
        // If status is 'delivered', move to history and remove from active
        if (action.payload.status === 'delivered') {
          state.deliveryHistory = [action.payload, ...state.deliveryHistory];
          state.activeDeliveries = state.activeDeliveries.filter(
            delivery => delivery._id !== action.payload._id
          );
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update location
      .addCase(updateLocation.pending, (state) => {
        state.loading = false; // Don't show loading for location updates
      })
      .addCase(updateLocation.fulfilled, (state) => {
        state.loading = false;
        // No state update needed, server handles real-time updates via socket.io
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDeliveryErrors } = deliverySlice.actions;

export default deliverySlice.reducer;
