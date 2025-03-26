// client/src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  orders: [],
  order: null,
  loadingStates: {
    createOrder: false,
    getUserOrders: false,
    getOrderById: false,
    getStoreOrders: false,
    updateOrderStatus: false,
    rateOrder: false,
    requestReturn: false
  },
  error: null
};

// Helper function to clear order state
const clearOrderState = () => ({
  orders: [],
  order: null,
  loadingStates: {
    createOrder: false,
    getUserOrders: false,
    getOrderById: false,
    getStoreOrders: false,
    updateOrderStatus: false,
    rateOrder: false,
    requestReturn: false
  },
  error: null
});

// Create order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/orders', orderData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to create order');
    }
  }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/orders/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load orders');
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load order');
    }
  }
);

// Get store orders
export const getStoreOrders = createAsyncThunk(
  'order/getStoreOrders',
  async (storeId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/store/${storeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load store orders');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update order status');
    }
  }
);

// Rate an order
export const rateOrder = createAsyncThunk(
  'order/rateOrder',
  async ({ orderId, ratings }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/orders/${orderId}/rate`, ratings);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to rate order');
    }
  }
);

// Request return for an order
export const requestReturn = createAsyncThunk(
  'order/requestReturn',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/orders/${orderId}/return`, { reason });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to request return');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderErrors: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.order = null;
    },
    resetOrderState: () => clearOrderState(),
    clearLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach(key => {
        state.loadingStates[key] = false;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loadingStates.createOrder = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loadingStates.createOrder = false;
        state.order = action.payload;
        state.orders = [action.payload, ...state.orders];
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loadingStates.createOrder = false;
        state.error = action.payload;
      })
      
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loadingStates.getUserOrders = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loadingStates.getUserOrders = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loadingStates.getUserOrders = false;
        state.error = action.payload;
      })
      
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loadingStates.getOrderById = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loadingStates.getOrderById = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loadingStates.getOrderById = false;
        state.error = action.payload;
      })
      
      // Get store orders
      .addCase(getStoreOrders.pending, (state) => {
        state.loadingStates.getStoreOrders = true;
        state.error = null;
      })
      .addCase(getStoreOrders.fulfilled, (state, action) => {
        state.loadingStates.getStoreOrders = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(getStoreOrders.rejected, (state, action) => {
        state.loadingStates.getStoreOrders = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loadingStates.updateOrderStatus = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loadingStates.updateOrderStatus = false;
        state.order = action.payload;
        state.orders = state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loadingStates.updateOrderStatus = false;
        state.error = action.payload;
      })
      
      // Rate order
      .addCase(rateOrder.pending, (state) => {
        state.loadingStates.rateOrder = true;
        state.error = null;
      })
      .addCase(rateOrder.fulfilled, (state, action) => {
        state.loadingStates.rateOrder = false;
        
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders array
        state.orders = state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
        state.error = null;
      })
      .addCase(rateOrder.rejected, (state, action) => {
        state.loadingStates.rateOrder = false;
        state.error = action.payload;
      })
      
      // Request return
      .addCase(requestReturn.pending, (state) => {
        state.loadingStates.requestReturn = true;
        state.error = null;
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.loadingStates.requestReturn = false;
        
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders array
        state.orders = state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
        state.error = null;
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.loadingStates.requestReturn = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderErrors, clearCurrentOrder, resetOrderState, clearLoadingStates } = orderSlice.actions;

export default orderSlice.reducer;
