// client/src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  loading: false,
  error: null
};

// Get user profile
export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/users/profile');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load profile');
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.put('/api/users/profile', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update profile');
    }
  }
);

// Get user addresses
export const getUserAddress = createAsyncThunk(
  'user/getAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/users/address');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load addresses');
    }
  }
);

// Add new address
export const addUserAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/users/address', addressData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to add address');
    }
  }
);

// Update address
export const updateUserAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/users/address/${id}`, addressData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update address');
    }
  }
);

// Delete address
export const deleteUserAddress = createAsyncThunk(
  'user/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/users/address/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to delete address');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user addresses
      .addCase(getUserAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, address: action.payload };
      })
      .addCase(getUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add user address
      .addCase(addUserAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, address: action.payload };
      })
      .addCase(addUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user address
      .addCase(updateUserAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, address: action.payload };
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user address
      .addCase(deleteUserAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserAddress.fulfilled, (state) => {
        state.loading = false;
        state.user = { ...state.user, address: {} };
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserErrors } = userSlice.actions;

export default userSlice.reducer;
