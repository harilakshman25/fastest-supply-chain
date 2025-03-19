// client/src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null
};

// Create a new order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/orders', orderData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to create order');
    }
  }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/orders');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load orders');
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load order');
    }
  }
);

// Get store orders (for store managers)
export const getStoreOrders = createAsyncThunk(
  'order/getStoreOrders',
  async (storeId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/orders/store/${storeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load store orders');
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
      return rejectWithValue(err.response.data.msg || 'Failed to update order status');
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
      return rejectWithValue(err.response.data.msg || 'Failed to rate order');
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
      return rejectWithValue(err.response.data.msg || 'Failed to request return');
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get store orders
      .addCase(getStoreOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getStoreOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders array
        state.orders = state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Rate order
      .addCase(rateOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(rateOrder.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders array
        state.orders = state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(rateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Request return
      .addCase(requestReturn.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update order in state
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update order in orders array
        state.orders = state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrderErrors, clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;
