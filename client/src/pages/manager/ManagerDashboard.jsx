// client/src/pages/manager/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStoreByManager, getStoreStats } from '../../redux/slices/storeSlice';
import { getStoreOrders } from '../../redux/slices/orderSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { store, stats, loadingStates, error } = useSelector(state => state.store);
  const { orders } = useSelector(state => state.order);
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    if (user && user.id) {
      console.log('ManagerDashboard - dispatching getStoreByManager with user:', user);
      console.log('ManagerDashboard - user.id:', user.id);
      dispatch(getStoreByManager(user.id));
    } else {
      console.log('ManagerDashboard - no user.id:', user);
      if (!user) {
        navigate('/login');
      }
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  useEffect(() => {
    if (store && store._id) {
      dispatch(getStoreStats(store._id, timeRange));
      dispatch(getStoreOrders(store._id));
    }
  }, [dispatch, store, timeRange]);

  // If we have an error with a 401 status, it means our token is invalid
  // We should redirect to login
  useEffect(() => {
    if (error === 'Not authorized') {
      console.log('Authorization error detected, redirecting to login');
      navigate('/login');
    }
  }, [error, navigate]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <div className="container mt-5 text-center text-danger">Please log in to access the dashboard.</div>;
  }

  // Show loading spinner only during initial store load
  if (loadingStates.getStoreByManager) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please try refreshing the page. If the problem persists, contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">No Store Found</h4>
          <p>No store has been assigned to your account yet.</p>
          <p>User ID: {user?.id}</p>
          <p>User Email: {user?.email}</p>
          <p>User Role: {user?.role}</p>
          <hr />
          <p>Error details: {error}</p>
          <p className="mb-0">
            If you believe this is an error, please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const getPendingOrdersCount = () => {
    return orders?.filter(order => order.status === 'pending').length || 0;
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Store Dashboard</h2>
        <div className="d-flex">
          <select 
            className="form-select me-2" 
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Link to={`/manager/inventory`} className="btn btn-primary">
            Manage Inventory
          </Link>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h4>{store.name}</h4>
              <p className="text-muted mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                {store.address.street}, {store.address.city}, {store.address.state} {store.address.zipCode}
              </p>
              <p className="mb-0">
                <i className="fas fa-phone me-2"></i>
                {store.contactNumber}
              </p>
              <p>
                <i className="fas fa-envelope me-2"></i>
                {store.email}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="mb-2">
                <span className="badge bg-primary p-2">
                  <i className="fas fa-star me-1"></i>
                  {store.rating?.average || 'N/A'} ({store.rating?.count || 0} ratings)
                </span>
              </div>
              <p className="text-muted mb-0">
                <i className="fas fa-clock me-1"></i>
                Operating Hours: {store.operatingHours?.open || '9:00'} - {store.operatingHours?.close || '21:00'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{stats?.totalOrders || 0}</h1>
              <p className="text-muted mb-0">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
            <h1 className="display-4">{formatCurrency(stats?.totalRevenue || 0)}</h1>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{stats?.totalProducts || 0}</h1>
              <p className="text-muted mb-0">Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{getPendingOrdersCount()}</h1>
              <p className="text-muted mb-0">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/manager/orders" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {orders && orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.substring(0, 8)}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${order.status === 'pending' ? 'bg-warning' : order.status === 'delivered' ? 'bg-success' : 'bg-info'}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>₹{order.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted my-4">No recent orders</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Products</h5>
              <Link to="/manager/products" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {stats && stats.topProducts && stats.topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.slice(0, 5).map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.quantity}</td>
                          <td>₹{product.revenue?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted my-4">No products data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3 mb-md-0">
              <Link to="/manager/inventory" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-boxes fa-2x mb-3"></i>
                <div>Manage Inventory</div>
              </Link>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <Link to="/manager/products" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-tag fa-2x mb-3"></i>
                <div>Manage Products</div>
              </Link>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <Link to="/manager/orders" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-shopping-bag fa-2x mb-3"></i>
                <div>View Orders</div>
              </Link>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-chart-line fa-2x mb-3"></i>
                <div>Analytics</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
