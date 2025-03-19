// client/src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  cartItems: [],
  store: null,
  loading: false,
  error: null
};

// Get cart items
export const getCartItems = createAsyncThunk(
  'cart/getCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/cart');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load cart');
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (cartItem, { rejectWithValue }) => {
      try {
        const { productId, quantity, storeId } = cartItem;
        const res = await axios.post('/api/cart', { productId, quantity, storeId });
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.msg || 'Failed to add to cart');
      }
    }
  );

// Update cart item quantity
export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/cart/${productId}`, { quantity });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update cart');
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/cart/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to remove from cart');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete('/api/cart');
      return {};
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get cart items
      .addCase(getCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.items;
        state.store = action.payload.store;
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add item to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.items;
        state.store = action.payload.store;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update cart item quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.items;
        state.store = action.payload.store;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove item from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(item => item.product._id !== action.payload);
        // If cart is empty, store becomes null
        if (state.cartItems.length === 0) {
          state.store = null;
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.store = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCartErrors } = cartSlice.actions;

export default cartSlice.reducer;
