// client/src/pages/user/UserOrders.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserOrders } from '../../redux/slices/orderSlice';
import { formatDate } from '../../utils/formatDate';

const UserOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.order);
  
  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);
  
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
  
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loading || !orders) return <div className="container mt-5 text-center">Loading...</div>;
  
  if (orders?.length === 0) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <i className="fas fa-shopping-bag fa-4x mb-3 text-muted"></i>
            <h3>No orders yet</h3>
            <p className="mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Orders</h2>
      
      {orders?.map(order => (
        <div key={order._id} className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <div className="row align-items-center">
              <div className="col">
                <span className="text-muted">Order Placed:</span>
                <strong className="ms-2">
                {formatDate(order.createdAt, false)}
                </strong>
              </div>
              <div className="col text-center">
                <span className="text-muted">Total:</span>
                <strong className="ms-2">₹{order.totalAmount.toFixed(2)}</strong>
              </div>
              <div className="col text-end">
                <span className="text-muted">Order #:</span>
                <strong className="ms-2">{order._id.substring(0, 8)}</strong>
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <div className="row align-items-center mb-4">
              <div className="col-md-8">
                <h5>Order Status</h5>
                <div className="d-flex align-items-center">
                  <span className={`badge ${getStatusBadgeClass(order.status)} me-2`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="ms-3">
                      <div>Estimated Delivery:</div>
                      <strong>
                        {new Date(order.estimatedDeliveryTime).toLocaleString()}
                      </strong>
                    </div>
                  )}
                  
                  {order.status === 'delivered' && (
                    <div className="ms-3">
                      <div>Delivered On:</div>
                      <strong>
                        {new Date(order.actualDeliveryTime).toLocaleString()}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <Link to={`/order/${order._id}/track`} className="btn btn-primary me-2">
                  Track Order
                </Link>
                
                {/* Add other action buttons based on status */}
                {order.status === 'delivered' && !order.ratings && (
                  <button className="btn btn-outline-primary">Rate Order</button>
                )}
                
                {order.status === 'delivered' && !order.ratings && (
                  <Link to={`/order/${order._id}/track#rate`} className="btn btn-outline-primary">
                    Rate Order
                  </Link>
                 )}

                {(order.status === 'delivered' || order.status === 'cancelled') && (
                  <button className="btn btn-outline-secondary mt-2 mt-md-0 ms-md-2">
                    View Invoice
                  </button>
                )}
              </div>
            </div>
            
            <h5 className="mb-3">Items</h5>
            {order.items.map(item => (
              <div key={item._id} className="row mb-2 pb-2 border-bottom">
                <div className="col-md-8">
                  <div className="d-flex">
                    {item.product.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="me-3" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                      />
                    )}
                    <div>
                      <h6 className="mb-0">{item.product.name}</h6>
                      <small className="text-muted">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                  <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              </div>
            ))}
            
            <div className="row mt-4">
              <div className="col-md-8">
                <h6>Delivery Address:</h6>
                <address className="mb-0">
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </address>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Delivery Fee:</span>
                      <span>₹40.00</span>
                    </div>
                    <hr className="my-1" />
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong>₹{(order.totalAmount + 40).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
