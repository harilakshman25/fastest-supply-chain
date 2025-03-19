// client/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSystemAnalytics } from '../../redux/slices/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading ,error} = useSelector(state => state.admin);
  const [timeRange, setTimeRange] = useState('week');
  
  useEffect(() => {
    dispatch(getSystemAnalytics(timeRange))
      .unwrap()
      .catch(error => {
        console.error('Failed to load analytics:', error);
      });
  }, [dispatch, timeRange]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
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
          <Link to="/admin/analytics" className="btn btn-primary">
            Detailed Analytics
          </Link>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{analytics?.totalOrders || 0}</h1>
              <p className="text-muted mb-0">Orders</p>
              <small className={`text-${analytics?.orderGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.orderGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.orderGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}</h1>
              <p className="text-muted mb-0">Revenue</p>
              <small className={`text-${analytics?.revenueGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.revenueGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.revenueGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{analytics?.activeUsers || 0}</h1>
              <p className="text-muted mb-0">Users</p>
              <small className={`text-${analytics?.userGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.userGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.userGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{analytics?.avgDeliveryTime || 0}</h1>
              <p className="text-muted mb-0">Avg. Delivery Time (min)</p>
              <small className={`text-${analytics?.deliveryTimeChange <= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.deliveryTimeChange <= 0 ? 'down' : 'up'}`}></i>
                {' '}{Math.abs(analytics?.deliveryTimeChange || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Trends</h5>
            </div>
            <div className="card-body">
              {analytics?.orderTrends ? (
                <div className="chart-container" style={{ height: '300px' }}>
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">
                      Chart would render here with data for {timeRange}
                    </p>
                  </div>
                  {/* In a real app, implement Chart.js or another charting library here */}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No order trend data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Approval Requests</h5>
            </div>
            <div className="card-body">
              {analytics?.pendingRequests && analytics.pendingRequests.length > 0 ? (
                <div>
                  <p className="mb-3">
                    You have <strong>{analytics.pendingRequests.length}</strong> pending approval requests.
                  </p>
                  <ul className="list-group">
                    {analytics.pendingRequests.slice(0, 3).map(request => (
                      <li key={request._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span>{request.name}</span>
                          <small className="d-block text-muted">
                            {request.role === 'store_manager' ? 'Store Manager' : 'Delivery Person'}
                          </small>
                        </div>
                        <span className="badge bg-warning">Pending</span>
                      </li>
                    ))}
                  </ul>
                  {analytics.pendingRequests.length > 3 && (
                    <div className="text-center mt-3">
                      <Link to="/admin/requests" className="btn btn-sm btn-outline-primary">
                        View All ({analytics.pendingRequests.length})
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No pending approval requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Stores</h5>
              <Link to="/admin/stores" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {analytics?.storePerformance && analytics.storePerformance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.storePerformance.map((store, index) => (
                        <tr key={index}>
                          <td>{store.name}</td>
                          <td>{store.orders}</td>
                          <td>₹{store.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No store performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Products</h5>
              <Link to="/admin/analytics" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.sales}</td>
                          <td>₹{product.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No product data available</p>
                </div>
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
              <Link to="/admin/stores" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-store fa-2x mb-3"></i>
                <div>Manage Stores</div>
              </Link>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <Link to="/admin/users" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-users fa-2x mb-3"></i>
                <div>Manage Users</div>
              </Link>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <Link to="/admin/requests" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-user-check fa-2x mb-3"></i>
                <div>Approval Requests</div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/admin/analytics" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-chart-bar fa-2x mb-3"></i>
                <div>System Analytics</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
