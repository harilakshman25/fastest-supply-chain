// client/src/pages/user/OrderSuccess.jsx
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../../redux/slices/orderSlice';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch=useDispatch();
  const [order,loading]=useSelector(state=>state.order);
  
  // Get order info from state or navigate to orders page
  const orderData = location.state?.orderData;
  
  useEffect(() => {
    if (!orderData && isAuthenticated && location.state?.orderId) {
      dispatch(getOrderById(location.state.orderId));
    }
  }, [orderData, isAuthenticated, navigate, dispatch, location.state]);

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  if (!orderData) return null;
  
  return (
    <div className="container mt-5">
      <div className="card shadow-sm mb-5">
        <div className="card-body text-center p-5">
          <div className="mb-4">
            <i className="fas fa-check-circle text-success fa-5x"></i>
          </div>
          
          <h2 className="mb-4">Order Placed Successfully!</h2>
          
          <p className="lead mb-4">
            Thank you for your order. Your order has been received and is now being processed.
          </p>
          
          <div className="alert alert-info mb-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>Order ID:</strong>
              <span>{orderData._id}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <strong>Total Amount:</strong>
              <span>₹{orderData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Estimated Delivery:</strong>
              <span>{orderData.estimatedDeliveryTime ? new Date(orderData.estimatedDeliveryTime).toLocaleString() : 'TBD'}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Link to={`/order/${orderData._id}/track`} className="btn btn-primary me-3">
              Track Order
            </Link>
            <Link to="/orders" className="btn btn-outline-primary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-5">
        <Link to="/" className="btn btn-outline-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
