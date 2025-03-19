// client/src/pages/delivery/DeliveryDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getDeliveryStats } from '../../redux/slices/deliverySlice';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const DeliveryDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, loading,error } = useSelector(state => state.delivery);
  const [timeRange, setTimeRange] = useState('week');
  
  useEffect(() => {
    if (user && user._id) {
      dispatch(getDeliveryStats(timeRange));
    }
  }, [dispatch, user, timeRange]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  const getRating = () => {
    if (!stats || !stats.rating) return { average: 'N/A', count: 0 };
    return stats.rating;
  };
  
  const getEarnings = () => {
    if (!stats || !stats.totalEarnings) return '0.00';
    return stats.totalEarnings.toFixed(2);
  };

  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border" /></div>;
if (error) return <div className="container mt-5 text-center text-danger">Error: {error}</div>;
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Delivery Dashboard</h2>
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
          <Link to="/delivery/active" className="btn btn-primary">
            Active Deliveries
          </Link>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h4>Welcome, {user?.name}</h4>
              <p className="text-muted mb-0">
                <i className="fas fa-user me-2"></i>
                Delivery Professional
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="mb-2">
                <span className="badge bg-primary p-2">
                  <i className="fas fa-star me-1"></i>
                  {stats?.rating?.average || 'N/A'} ({stats?.rating?.count || 0} ratings)
                </span>
              </div>
              <p className="text-muted mb-0">
                <i className="fas fa-clock me-1"></i>
                Member since: {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{stats?.totalDeliveries || 0}</h1>
              <p className="text-muted mb-0">Total Deliveries</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{stats?.todayDeliveries || 0}</h1>
              <p className="text-muted mb-0">Today's Deliveries</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{stats?.activeDeliveries || 0}</h1>
              <p className="text-muted mb-0">Active Deliveries</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h1 className="display-4">{formatCurrency(stats?.totalEarnings || 0)}</h1>
              <p className="text-muted mb-0">Total Earnings</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Deliveries</h5>
              <Link to="/delivery/history" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {stats?.recentDeliveries && stats.recentDeliveries.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Store</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentDeliveries.slice(0, 5).map(delivery => (
                        <tr key={delivery._id}>
                          <td>#{delivery._id.substring(0, 8)}</td>
                          <td>{formatDate(user?.createdAt, false)}</td>
                          <td>{delivery.store.name}</td>
                          <td>
                            <span className={`badge ${delivery.status === 'delivered' ? 'bg-success' : 'bg-primary'}`}>
                              {delivery.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted my-4">No recent deliveries</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Delivery Performance</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6>Average Rating</h6>
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: `${(stats?.rating?.average / 5) * 100}%` }}
                    aria-valuenow={stats?.rating?.average} 
                    aria-valuemin="0" 
                    aria-valuemax="5"
                  >
                    {stats?.rating?.average || 'N/A'} / 5
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h6>On-Time Delivery Rate</h6>
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${stats?.onTimeRate || 0}%` }}
                    aria-valuenow={stats?.onTimeRate} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {stats?.onTimeRate || 0}%
                  </div>
                </div>
              </div>
              
              <div>
                <h6>Acceptance Rate</h6>
                <div className="progress" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${stats?.acceptanceRate || 0}%` }}
                    aria-valuenow={stats?.acceptanceRate} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {stats?.acceptanceRate || 0}%
                  </div>
                </div>
              </div>
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
            <div className="col-md-4 mb-3 mb-md-0">
              <Link to="/delivery/active" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-motorcycle fa-2x mb-3"></i>
                <div>Active Deliveries</div>
              </Link>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <Link to="/delivery/history" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-history fa-2x mb-3"></i>
                <div>Delivery History</div>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/profile" className="btn btn-outline-primary d-block h-100 p-4 text-center">
                <i className="fas fa-user-cog fa-2x mb-3"></i>
                <div>Update Profile</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
