import React from 'react'; // No need for useEffect here
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import setAuthToken from './utils/setAuthToken';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ManagerRegister from './pages/auth/ManagerRegister';
import DeliveryRegister from './pages/auth/DeliveryRegister';

// User Pages
import Home from './pages/user/Home';
import StoreView from './pages/user/StoreView';
import ProductDetails from './pages/user/ProductDetails';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import OrderSuccess from './pages/user/OrderSuccess';
import UserProfile from './pages/user/UserProfile';
import UserOrders from './pages/user/UserOrders';
import OrderTracking from './pages/user/OrderTracking';

// Store Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManageInventory from './pages/manager/ManageInventory';
import ManageProducts from './pages/manager/ManageProducts';
import ManagerOrders from './pages/manager/ManagerOrders';

// Delivery Person Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ActiveDeliveries from './pages/delivery/ActiveDeliveries';
import DeliveryHistory from './pages/delivery/DeliveryHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStores from './pages/admin/ManageStores';
import ManageUsers from './pages/admin/ManageUsers';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// New child component for Redux logic
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { loadUser } from './redux/slices/authSlice';
import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Child component that uses Redux hooks
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    dispatch(loadUser());
    const { initializeSocket, disconnectSocket } = require('./utils/socket');
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/manager" element={<ManagerRegister />} />
          <Route path="/register/delivery" element={<DeliveryRegister />} />
          <Route path="/store/:id" element={<StoreView />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* User Routes */}
          <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
          <Route path="/checkout" element={<PrivateRoute element={<Checkout />} />} />
          <Route path="/order/success" element={<PrivateRoute element={<OrderSuccess />} />} />
          <Route path="/profile" element={<PrivateRoute element={<UserProfile />} />} />
          <Route path="/orders" element={<PrivateRoute element={<UserOrders />} />} />
          <Route path="/order/:id/track" element={<PrivateRoute element={<OrderTracking />} />} />

          {/* Store Manager Routes */}
          <Route path="/manager/products" element={<PrivateRoute element={<ManageProducts />} roles={['store_manager']} />} />
          <Route path="/manager/inventory" element={<PrivateRoute element={<ManageInventory />} roles={['store_manager']} />} />
          <Route path="/manager/dashboard" element={<PrivateRoute element={<ManagerDashboard />} roles={['store_manager']} />} />
          <Route path="/manager/orders" element={<PrivateRoute element={<ManagerOrders />} roles={['store_manager']} />} />

          {/* Delivery Person Routes */}
          <Route path="/delivery/active" element={<PrivateRoute element={<ActiveDeliveries />} roles={['delivery']} />} />
          <Route path="/delivery/dashboard" element={<PrivateRoute element={<DeliveryDashboard />} roles={['delivery']} />} />
          <Route path="/delivery/history" element={<PrivateRoute element={<DeliveryHistory />} roles={['delivery']} />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={<RoleRoute role="admin" element={<AdminDashboard />} />}
          />
          <Route
            path="/admin/stores"
            element={<RoleRoute role="admin" element={<ManageStores />} />}
          />
          <Route
            path="/admin/users"
            element={<RoleRoute role="admin" element={<ManageUsers />} />}
          />
          <Route
            path="/admin/requests"
            element={<RoleRoute role="admin" element={<RegistrationRequests />} />}
          />
          <Route
            path="/admin/analytics"
            element={<RoleRoute role="admin" element={<SystemAnalytics />} />}
          />
          <Route path="/checkout" element={<PrivateRoute element={<Checkout />} />} />
          <Route path="/order/success" element={<PrivateRoute element={<OrderSuccess />} />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

// Main App component
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;