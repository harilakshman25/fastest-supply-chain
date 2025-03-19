// client/src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  users: [],
  stores: [],
  pendingApprovals: [],
  orders: [],
  analytics: null,
  loading: false,
  error: null
};

// Get all users
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/admin/users');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load users');
    }
  }
);

// Get all stores
export const getAllStores = createAsyncThunk(
  'admin/getAllStores',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/admin/stores');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load stores');
    }
  }
);

// Get pending approvals
export const getPendingApprovals = createAsyncThunk(
  'admin/getPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/admin/pending-approvals');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load pending approvals');
    }
  }
);

// Get system analytics
export const getSystemAnalytics = createAsyncThunk(
  'admin/getSystemAnalytics',
  async (timeRange = 'week', { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load system analytics');
    }
  }
);

// Get all orders
export const getAllOrders = createAsyncThunk(
  'admin/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/admin/orders');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load orders');
    }
  }
);

// Approve user
export const approveUser = createAsyncThunk(
  'admin/approveUser',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admin/approve/${userId}`);
      return { userId, message: res.data.msg };
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to approve user');
    }
  }
);

// Reject user
export const rejectUser = createAsyncThunk(
  'admin/rejectUser',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admin/reject/${userId}`);
      return { userId, message: res.data.msg };
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to reject user');
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}`, userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update user');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to delete user');
    }
  }
);

// Update store
export const updateStore = createAsyncThunk(
  'admin/updateStore',
  async ({ storeId, storeData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/admin/stores/${storeId}`, storeData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update store');
    }
  }
);

// Delete store
export const deleteStore = createAsyncThunk(
  'admin/deleteStore',
  async (storeId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/stores/${storeId}`);
      return storeId;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to delete store');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all stores
      .addCase(getAllStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get pending approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = action.payload;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get system analytics
      .addCase(getSystemAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSystemAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getSystemAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Approve user
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          user => user._id !== action.payload.userId
        );
        // Update user in users list
        state.users = state.users.map(user => 
          user._id === action.payload.userId ? { ...user, isApproved: true } : user
        );
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reject user
      .addCase(rejectUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          user => user._id !== action.payload.userId
        );
        // Remove from users list
        state.users = state.users.filter(user => user._id !== action.payload.userId);
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = state.stores.map(store => 
          store._id === action.payload._id ? action.payload : store
        );
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete store
      .addCase(deleteStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = state.stores.filter(store => store._id !== action.payload);
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearAdminErrors } = adminSlice.actions;

export default adminSlice.reducer;
