// client/src/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  products: [],
  product: null,
  loadingStates: {
    getAllProducts: false,
    getProductById: false,
    getStoreProducts: false,
    createProduct: false,
    updateProduct: false,
    deleteProduct: false,
    updateProductQuantity: false
  },
  error: null
};

// Helper function to clear product state
const clearProductState = () => ({
  products: [],
  product: null,
  loadingStates: {
    getAllProducts: false,
    getProductById: false,
    getStoreProducts: false,
    createProduct: false,
    updateProduct: false,
    deleteProduct: false,
    updateProductQuantity: false
  },
  error: null
});

// Get all products
export const getAllProducts = createAsyncThunk(
  'product/getAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/products');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load products');
    }
  }
);

// Get product by ID
export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load product');
    }
  }
);

// Get products for a store
export const getStoreProducts = createAsyncThunk(
  'product/getStoreProducts',
  async (storeId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/store/${storeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to load store products');
    }
  }
);

// Create a new product
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/products', productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to create product');
    }
  }
);

// Update a product
export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/products/${id}`, productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update product');
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete product');
    }
  }
);

// Update product quantity
export const updateProductQuantity = createAsyncThunk(
  'product/updateProductQuantity',
  async ({ productId, storeId, quantity }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/products/${productId}/inventory`, { storeId, quantity });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update inventory');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.product = null;
    },
    resetProductState: () => clearProductState(),
    clearLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach(key => {
        state.loadingStates[key] = false;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.loadingStates.getAllProducts = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loadingStates.getAllProducts = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loadingStates.getAllProducts = false;
        state.error = action.payload;
      })
      
      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.loadingStates.getProductById = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loadingStates.getProductById = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loadingStates.getProductById = false;
        state.error = action.payload;
      })
      
      // Get store products
      .addCase(getStoreProducts.pending, (state) => {
        state.loadingStates.getStoreProducts = true;
        state.error = null;
      })
      .addCase(getStoreProducts.fulfilled, (state, action) => {
        state.loadingStates.getStoreProducts = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(getStoreProducts.rejected, (state, action) => {
        state.loadingStates.getStoreProducts = false;
        state.error = action.payload;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loadingStates.createProduct = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loadingStates.createProduct = false;
        state.products.push(action.payload);
        state.product = action.payload;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loadingStates.createProduct = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loadingStates.updateProduct = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loadingStates.updateProduct = false;
        state.products = state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        );
        state.product = action.payload;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loadingStates.updateProduct = false;
        state.error = action.payload;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loadingStates.deleteProduct = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loadingStates.deleteProduct = false;
        state.products = state.products.filter(product => product._id !== action.payload);
        if (state.product && state.product._id === action.payload) {
          state.product = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loadingStates.deleteProduct = false;
        state.error = action.payload;
      })
      
      // Update product quantity
      .addCase(updateProductQuantity.pending, (state) => {
        state.loadingStates.updateProductQuantity = true;
        state.error = null;
      })
      .addCase(updateProductQuantity.fulfilled, (state, action) => {
        state.loadingStates.updateProductQuantity = false;
        state.products = state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        );
        if (state.product && state.product._id === action.payload._id) {
          state.product = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProductQuantity.rejected, (state, action) => {
        state.loadingStates.updateProductQuantity = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductErrors, clearCurrentProduct, resetProductState, clearLoadingStates } = productSlice.actions;

export default productSlice.reducer;
