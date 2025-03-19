// client/src/pages/delivery/DeliveryHistory.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getDeliveryHistory } from '../../redux/slices/deliverySlice';
import { formatDate } from '../../utils/formatDate';
import {toast} from 'react-toastify';

const DeliveryHistory = () => {
  const dispatch = useDispatch();
  const { deliveryHistory, loading } = useSelector(state => state.delivery);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  
  useEffect(() => {
    dispatch(getDeliveryHistory())
      .unwrap()
      .catch(error => toast.error(error || 'Failed to load history'));
  }, [dispatch]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleDateChange = e => {
    setDateFilter(e.target.value);
  };
  
  const handleViewOrder = (order) => {
    setViewOrder(order);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate date range for filtering
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    switch(dateFilter) {
      case 'today':
        return { start: today, end: new Date() };
      case 'yesterday':
        return { start: yesterday, end: today };
      case 'last7days':
        return { start: lastWeekStart, end: new Date() };
      case 'last30days':
        return { start: lastMonthStart, end: new Date() };
      default:
        return { start: null, end: null };
    }
  };
  
  // Filter orders
  const filteredHistory = (() => {
    let filtered = deliveryHistory;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.includes(searchTerm) || 
        order.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.store.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Date filter
    if (dateFilter) {
      const { start, end } = getDateRange();
      if (start && end) {
        filtered = filtered.filter(order => {
          const deliveryDate = new Date(order.actualDeliveryTime || order.createdAt);
          return deliveryDate >= start && deliveryDate <= end;
        });
      }
    }
    
    return filtered;
  })();
  
  const calculateEarnings = (order) => {
    // Example calculation - could be based on distance, order value, etc.
    const baseRate = 40; // Base delivery rate
    const orderPercent = order.totalAmount * 0.02; // 2% of order value
    return baseRate + orderPercent;
  };
  
  if (loading && !deliveryHistory.length) {
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
        <h2>Delivery History</h2>
        <Link to="/delivery/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by order ID, customer, or store..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={dateFilter}
                onChange={handleDateChange}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : deliveryHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Store</th>
                    <th>Customer</th>
                    <th>Earnings</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(0, 8)}</td>
                      <td>{formatDate(order.actualDeliveryTime || order.createdAt)}</td>
                      <td>{order.store.name}</td>
                      <td>{order.user.name}</td>
                      <td>₹{calculateEarnings(order).toFixed(2)}</td>
                      <td>
                        {order.ratings?.delivery?.rating ? (
                          <div className="d-flex align-items-center">
                            <span className="me-1">{order.ratings.delivery.rating}</span>
                            <i className="fas fa-star text-warning"></i>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="mb-0">No delivery history found.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Details Modal */}
      {viewOrder && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order #{viewOrder._id.substring(0, 8)}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setViewOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p className="mb-1">
                      <strong>Order Date:</strong> {formatDate(viewOrder.createdAt)}
                    </p>
                    <p className="mb-1">
                      <strong>Delivery Date:</strong> {formatDate(viewOrder.actualDeliveryTime || viewOrder.createdAt)}
                    </p>
                    <p className="mb-1">
                      <strong>Store:</strong> {viewOrder.store.name}
                    </p>
                    <p className="mb-1">
                      <strong>Total Amount:</strong> ₹{viewOrder.totalAmount.toFixed(2)}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {viewOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                    <p className="mb-1">
                      <strong>Your Earnings:</strong> ₹{calculateEarnings(viewOrder).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {viewOrder.user.name}
                    </p>
                    <p className="mb-1">
                      <strong>Delivery Address:</strong><br />
                      {viewOrder.deliveryAddress.street},<br />
                      {viewOrder.deliveryAddress.city}, {viewOrder.deliveryAddress.state} {viewOrder.deliveryAddress.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-12">
                    <h6>Order Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product.name}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price.toFixed(2)}</td>
                              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {viewOrder.ratings?.delivery && (
                  <div className="row">
                    <div className="col-12">
                      <h6>Customer Rating</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="mb-2">
                            <strong>Rating: </strong>
                            {[1, 2, 3, 4, 5].map(star => (
                              <i 
                                key={star}
                                className={`fas fa-star ${star <= viewOrder.ratings.delivery.rating ? 'text-warning' : 'text-muted'}`}
                              ></i>
                            ))}
                            <span className="ms-2">({viewOrder.ratings.delivery.rating}/5)</span>
                          </div>
                          
                          {viewOrder.ratings.delivery.comment && (
                            <div>
                              <strong>Comment: </strong>
                              <p className="mb-0">{viewOrder.ratings.delivery.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setViewOrder(null)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Print Details
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;
