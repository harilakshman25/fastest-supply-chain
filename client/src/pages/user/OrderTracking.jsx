// client/src/pages/user/OrderTracking.jsx
// Updated OrderTracking.jsx with Socket.IO
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getOrderById, rateOrder } from '../../redux/slices/orderSlice';
import { 
  joinOrderRoom, 
  leaveOrderRoom,
  subscribeToOrderUpdates,
  subscribeToLocationUpdates,
  unsubscribeFromOrderUpdates,
  unsubscribeFromLocationUpdates
} from '../../utils/socket';
import { toast } from 'react-toastify';
import { getCurrentLocation, formatDistance, calculateDistance} from '../../utils/locationUtils';
import { formatStatus } from '../../utils/orderUtils';



const OrderTracking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector(state => state.order);
  
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  
  useEffect(() => {
    dispatch(getOrderById(id));
    
    // Join Socket.IO room for this order
    joinOrderRoom(id);
    
    // Subscribe to order updates
    subscribeToOrderUpdates((updatedOrder) => {
      // Update Redux store with the latest order data
      if (updatedOrder._id === id) {
        dispatch(getOrderById(id));
        toast.info(`Order status updated to ${updatedOrder.status.replace('_', ' ').toUpperCase()}`);
      }
    });
    
    // Subscribe to location updates
    subscribeToLocationUpdates((data) => {
      if (data.orderId === id) {
        setDeliveryLocation(data.location);
      }
    });
    
    // Cleanup function
    return () => {
      leaveOrderRoom(id);
      unsubscribeFromOrderUpdates();
      unsubscribeFromLocationUpdates();
    };
  }, [id]);

  useEffect(() => {
    if (order.status === 'in_transit') {
      getCurrentLocation()
        .then(userLocation => {
          const distance = calculateDistance([userLocation.lng, userLocation.lat], deliveryLocation);
          toast.info(`Delivery is ${formatDistance(distance)} away`);
        })
        .catch(err => toast.error(err.message));
    }
  }, [order.status, deliveryLocation]);
  

  const [ratingModal, setRatingModal] = useState(false);
  const [ratings, setRatings] = useState({
    storeRating: 0,
    deliveryRating: 0,
    storeComment: '',
    deliveryComment: ''
  });
  
  const getOrderStatusStep = () => {
    switch(order?.status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'picked_up': 
      case 'in_transit': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };
  
  const handleRatingChange = (e) => {
    setRatings({
      ...ratings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmitRating = () => {
    dispatch(rateOrder({ orderId: id, ratings }))
      .unwrap()
      .then(() => {
        setRatingModal(false);
        toast.success('Rating submitted!');
      })
      .catch(error => toast.error(error || 'Rating failed'));
  };
  
  if (loading || !order) {
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
      <h2 className="mb-4">Track Order</h2>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Order #{order._id.substring(0, 8)}</h5>
              <p className="text-muted">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h5>
                Status: <span className={`badge ${order.status === 'delivered' ? 'bg-success' : 'bg-primary'}`}>
                {formatStatus(order.status)}
                </span>
              </h5>
              <p className="text-muted">
                {order.status === 'delivered' 
                  ? `Delivered on ${new Date(order.actualDeliveryTime).toLocaleString()}`
                  : `Estimated delivery: ${new Date(order.estimatedDeliveryTime).toLocaleString()}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">Order Progress</h5>
          
          <div className="row bs-stepper">
            <div className="col-md-3 text-center">
              <div className={`bs-stepper-circle ${getOrderStatusStep() >= 0 ? 'bg-primary' : 'bg-secondary'}`}>1</div>
              <div className="mt-2">Order Placed</div>
            </div>
            <div className="col-md-3 text-center">
              <div className={`bs-stepper-circle ${getOrderStatusStep() >= 1 ? 'bg-primary' : 'bg-secondary'}`}>2</div>
              <div className="mt-2">Processing</div>
            </div>
            <div className="col-md-3 text-center">
              <div className={`bs-stepper-circle ${getOrderStatusStep() >= 2 ? 'bg-primary' : 'bg-secondary'}`}>3</div>
              <div className="mt-2">Out for Delivery</div>
            </div>
            <div className="col-md-3 text-center">
              <div className={`bs-stepper-circle ${getOrderStatusStep() >= 3 ? 'bg-primary' : 'bg-secondary'}`}>4</div>
              <div className="mt-2">Delivered</div>
            </div>
          </div>
          
          {order.status === 'delivered' && !order.ratings && (
            <div className="text-center mt-4">
              <button 
                className="btn btn-primary"
                onClick={() => setRatingModal(true)}
              >
                Rate Your Experience
              </button>
            </div>
          )}
        </div>
      </div>
      
      {(order.status === 'picked_up' || order.status === 'in_transit') && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-4">Live Tracking</h5>
            
            {/* In a real app, implement MapBox GL JS or Google Maps here */}
            <div 
              className="bg-light rounded mb-3" 
              style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="text-center">
                <i className="fas fa-map-marker-alt fa-3x text-danger mb-3"></i>
                <p>Map view would appear here in production.</p>
                <p className="mb-0">Delivery person is on the way!</p>
              </div>
            </div>
            
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Your delivery person is about {Math.floor(Math.random() * 10) + 1} minutes away.
            </div>
          </div>
        </div>
      )}
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">Order Details</h5>
          
          <div className="mb-4">
            <h6>Items:</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item._id}>
                      <td>{item.product.name}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <h6>Delivery Address:</h6>
                <address>
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </address>
              </div>
              
              <div className="mb-4">
                <h6>Payment Information:</h6>
                <p className="mb-0">
                  Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}<br />
                  Status: <span className={`badge ${order.paymentStatus === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">Order Summary</h6>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>₹40.00</span>
                  </div>
                  
                  <hr />
                  
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
      
      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rate Your Experience</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setRatingModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label">Rate the Store:</label>
                  <div className="mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star}
                        className={`fas fa-star me-1 ${ratings.storeRating >= star ? 'text-warning' : 'text-muted'}`}
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                        onClick={() => setRatings({ ...ratings, storeRating: star })}
                      ></i>
                    ))}
                  </div>
                  <textarea
                    className="form-control"
                    placeholder="Comments about the store (optional)"
                    name="storeComment"
                    value={ratings.storeComment}
                    onChange={handleRatingChange}
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Rate the Delivery:</label>
                  <div className="mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star}
                        className={`fas fa-star me-1 ${ratings.deliveryRating >= star ? 'text-warning' : 'text-muted'}`}
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                        onClick={() => setRatings({ ...ratings, deliveryRating: star })}
                      ></i>
                    ))}
                  </div>
                  <textarea
                    className="form-control"
                    placeholder="Comments about the delivery (optional)"
                    name="deliveryComment"
                    value={ratings.deliveryComment}
                    onChange={handleRatingChange}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setRatingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmitRating}
                >
                  Submit Rating
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

export default OrderTracking;
