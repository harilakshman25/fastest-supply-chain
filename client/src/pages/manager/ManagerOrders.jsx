// client/src/pages/manager/ManagerOrders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStoreByManager } from '../../redux/slices/storeSlice';
import { getStoreOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import { getStatusBadgeClass, getNextStatuses } from '../../utils/orderUtils';

const ManagerOrders = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { store } = useSelector(state => state.store);
  const { orders, loading } = useSelector(state => state.order);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  
  useEffect(() => {
    if (user && user._id) {
      dispatch(getStoreByManager(user._id));
    }
  }, [dispatch, user]);
  
  useEffect(() => {
    if (store && store._id) {
      dispatch(getStoreOrders(store._id));
    }
  }, [dispatch, store]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = e => {
    setStatusFilter(e.target.value);
  };
  
  const handleDateChange = e => {
    setDateFilter(e.target.value);
  };
  
  const handleStatusUpdate = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }))
      .unwrap()
      .then(() => {
        toast.success(`Order status updated to ${status.replace('_', ' ')}`);
        setViewOrder(null);
      })
      .catch(error => {
        toast.error(error || 'Failed to update order status');
      });
  };
  
  const handleViewOrder = (order) => {
    setViewOrder(order);
  };
  
  const getStatusBadgeClass = status => {
    switch(status) {
      case 'pending':
        return 'bg-warning';
      case 'processing':
        return 'bg-info';
      case 'picked_up':
      case 'in_transit':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
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
  const filteredOrders = (() => {
    let filtered = orders;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.includes(searchTerm) || 
        order.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter) {
      const { start, end } = getDateRange();
      if (start && end) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
        });
      }
    }
    
    return filtered;
  })();
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Orders</h2>
        
        <Link to="/manager/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search order ID or customer..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-4">
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
          ) : filteredOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(0, 8)}</td>
                      <td>{order.user.name}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items.reduce((total, item) => total + item.quantity, 0)}</td>
                      <td>₹{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
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
              <p className="mb-0">No orders found matching your criteria.</p>
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
                    <h6>Customer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {viewOrder.user.name}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {viewOrder.user.email}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {viewOrder.user.phoneNumber}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Details</h6>
                    <p className="mb-1">
                      <strong>Order Date:</strong> {formatDate(viewOrder.createdAt)}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {viewOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Status:</strong>{' '}
                      <span className={`badge ${viewOrder.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                        {viewOrder.paymentStatus.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-12">
                    <h6>Delivery Address</h6>
                    <p className="mb-0">
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
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product.name}</td>
                              <td>₹{item.price.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                            <td>₹{viewOrder.totalAmount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end"><strong>Delivery Fee:</strong></td>
                            <td>₹40.00</td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                            <td><strong>₹{(viewOrder.totalAmount + 40).toFixed(2)}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-12">
                    <h6>Order Status</h6>
                    <div className="d-flex align-items-center mb-3">
                      <span className={`badge ${getStatusBadgeClass(viewOrder.status)} me-2`}>
                        {viewOrder.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {getNextStatuses(viewOrder.status).map(status => (
                        <button
                          key={status}
                          className="btn btn-sm btn-primary ms-2"
                          onClick={() => handleStatusUpdate(viewOrder._id, status)}
                        >
                          Mark as {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    
                    {viewOrder.status === 'pending' && (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        This order needs to be processed. Once processed, the order will be ready for pickup by the delivery person.
                      </div>
                    )}
                  </div>
                </div>
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
                  Print Order
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

export default ManagerOrders;
