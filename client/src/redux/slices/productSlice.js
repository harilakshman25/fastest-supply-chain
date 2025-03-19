// client/src/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null
};

// Get all products
export const getProducts = createAsyncThunk(
  'product/getProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { sort, category, store, search } = params;
      let url = '/api/products';
      
      // Build query string
      const queryParams = [];
      if (sort) queryParams.push(`sort=${sort}`);
      if (category) queryParams.push(`category=${category}`);
      if (store) queryParams.push(`store=${store}`);
      if (search) queryParams.push(`search=${search}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load products');
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
      return rejectWithValue(err.response.data.msg || 'Failed to load product');
    }
  }
);

// Get store products
export const getStoreProducts = createAsyncThunk(
    'product/getStoreProducts',
    async (storeId, { rejectWithValue }) => {
      try {
        const res = await axios.get(`/api/stores/${storeId}/products`);
        return res.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.msg || 
                            'Failed to load store products';
        return rejectWithValue(errorMessage);
      }
    }
  );

// Get products by category
export const getProductsByCategory = createAsyncThunk(
  'product/getProductsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/category/${category}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to load products');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async (term, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/products/search/${term}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to search products');
    }
  }
);

// Create a product
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/products', productData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to create product');
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
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.msg || 
                            'Failed to update product';
        return rejectWithValue(errorMessage);
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
      return rejectWithValue(err.response.data.msg || 'Failed to delete product');
    }
  }
);

// Update product inventory
export const updateProductInventory = createAsyncThunk(
  'product/updateInventory',
  async ({ productId, storeId, quantity }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/products/${productId}/inventory`, {
        storeId,
        quantity
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.msg || 'Failed to update inventory');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get store products
      .addCase(getStoreProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getStoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get products by category
      .addCase(getProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = [...state.products, action.payload];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(product => 
          product._id === action.payload._id ? action.payload : product
        );
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product inventory
      .addCase(updateProductInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(product => 
          product._id === action.payload._id ? action.payload : product
        );
        state.product = action.payload;
      })
      .addCase(updateProductInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductErrors } = productSlice.actions;

export default productSlice.reducer;
