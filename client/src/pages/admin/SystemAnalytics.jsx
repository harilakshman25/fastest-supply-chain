// client/src/pages/admin/SystemAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSystemAnalytics } from '../../redux/slices/adminSlice';
import { Line } from 'react-chartjs-2';

const SystemAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector(state => state.admin);
  
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('orders');
  
  useEffect(() => {
    dispatch(getSystemAnalytics(timeRange));
  }, [dispatch, timeRange]);
  
  const handleTimeRangeChange = e => {
    setTimeRange(e.target.value);
  };
  
  const handleChartTypeChange = e => {
    setChartType(e.target.value);
  };
  
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
        <h2>System Analytics</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>

      <Line data={{
  labels: analytics.orderTrends.map(t => t.date),
  datasets: [{ label: 'Orders', data: analytics.orderTrends.map(t => t.count) }]
}} />
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{analytics?.totalOrders || 0}</h1>
              <p className="text-muted mb-0">Total Orders</p>
              <small className={`text-${analytics?.orderGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.orderGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.orderGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}</h1>
              <p className="text-muted mb-0">Total Revenue</p>
              <small className={`text-${analytics?.revenueGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.revenueGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.revenueGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{analytics?.activeUsers || 0}</h1>
              <p className="text-muted mb-0">Active Users</p>
              <small className={`text-${analytics?.userGrowth >= 0 ? 'success' : 'danger'}`}>
                <i className={`fas fa-arrow-${analytics?.userGrowth >= 0 ? 'up' : 'down'}`}></i>
                {' '}{Math.abs(analytics?.userGrowth || 0)}% from previous period
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Performance Trends</h5>
            <div className="d-flex">
              <select 
                className="form-select me-2" 
                style={{ width: 'auto' }}
                value={timeRange}
                onChange={handleTimeRangeChange}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <select 
                className="form-select" 
                style={{ width: 'auto' }}
                value={chartType}
                onChange={handleChartTypeChange}
              >
                <option value="orders">Orders</option>
                <option value="revenue">Revenue</option>
                <option value="users">User Activity</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            {chartType === 'orders' && analytics?.orderTrends ? (
              <div>
                <h6 className="text-center mb-4">Order Volume Over Time</h6>
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">
                    Chart visualization would render here with {analytics.orderTrends.length} data points
                  </p>
                </div>
                {/* In a real app, implement Chart.js or another charting library here */}
              </div>
            ) : chartType === 'revenue' && analytics?.revenueTrends ? (
              <div>
                <h6 className="text-center mb-4">Revenue Over Time</h6>
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">
                    Chart visualization would render here with {analytics.revenueTrends.length} data points
                  </p>
                </div>
              </div>
            ) : chartType === 'users' && analytics?.userActivity ? (
              <div>
                <h6 className="text-center mb-4">User Activity by Time</h6>
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">
                    Chart visualization would render here with {analytics.userActivity.length} data points
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No data available for the selected time range</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Selling Products</h5>
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
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Store Performance</h5>
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
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body text-center">
              {analytics?.orderStatusDistribution ? (
                <div>
                  <div className="chart-container mb-3" style={{ height: '200px' }}>
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <p className="text-muted">
                        Pie chart visualization would render here
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => (
                      <div key={status} className="col-6 mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{status.replace('_', ' ').toUpperCase()}</span>
                          <span>{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted mb-0">No order status data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Delivery Performance</h5>
            </div>
            <div className="card-body">
              {analytics?.deliveryPerformance ? (
                <div>
                  <div className="mb-4">
                    <h6>Average Delivery Time</h6>
                    <div className="progress" style={{ height: '25px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ width: `${Math.min(100, (analytics.avgDeliveryTime / 60) * 100)}%` }}
                        aria-valuenow={analytics.avgDeliveryTime} 
                        aria-valuemin="0" 
                        aria-valuemax="60"
                      >
                        {analytics.avgDeliveryTime} min
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h6>On-Time Delivery Rate</h6>
                    <div className="progress" style={{ height: '25px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        role="progressbar" 
                        style={{ width: `${analytics.deliveryPerformance.onTimeRate}%` }}
                        aria-valuenow={analytics.deliveryPerformance.onTimeRate} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {analytics.deliveryPerformance.onTimeRate}%
                      </div>
                    </div>
                  </div>
                  <div>
                    <h6>Average Delivery Rating</h6>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <i 
                            key={star}
                            className={`fas fa-star ${star <= analytics.deliveryPerformance.avgRating ? 'text-warning' : 'text-muted'}`}
                          ></i>
                        ))}
                      </div>
                      <div>
                        {analytics.deliveryPerformance.avgRating.toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted mb-0">No delivery performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">User Activity by Hour</h5>
            </div>
            <div className="card-body">
              {analytics?.userActivity && analytics.userActivity.length > 0 ? (
                <div className="chart-container" style={{ height: '250px' }}>
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">
                      Bar chart visualization would render here with {analytics.userActivity.length} data points
                    </p>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted mb-0">No user activity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">System Metrics</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Total Stores</h6>
                <h3>{analytics?.systemMetrics?.totalStores || 0}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Total Products</h6>
                <h3>{analytics?.systemMetrics?.totalProducts || 0}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Delivery Personnel</h6>
                <h3>{analytics?.systemMetrics?.deliveryPersonnel || 0}</h3>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Active Customers</h6>
                <h3>{analytics?.systemMetrics?.activeCustomers || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
