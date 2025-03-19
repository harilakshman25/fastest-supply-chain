// client/src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/slices/authSlice';
import userReducer from './redux/slices/userSlice';
import storeReducer from './redux/slices/storeSlice';
import productReducer from './redux/slices/productSlice';
import cartReducer from './redux/slices/cartSlice';
import orderReducer from './redux/slices/orderSlice';
import deliveryReducer from './redux/slices/deliverySlice';
import adminReducer from './redux/slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    store: storeReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    delivery: deliveryReducer,
    admin: adminReducer
  }
});

export default store;
