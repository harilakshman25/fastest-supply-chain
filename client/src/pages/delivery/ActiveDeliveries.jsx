// client/src/pages/delivery/ActiveDeliveries.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveDeliveries, updateOrderStatus, updateLocation } from '../../redux/slices/deliverySlice';
import { toast } from 'react-toastify';
import { getStatusBadgeClass } from '../../utils/orderUtils';
import { initializeSocket, subscribeToOrderUpdates, unsubscribeFromOrderUpdates } from '../../utils/socket';

const ActiveDeliveries = () => {
  const dispatch = useDispatch();
  const { activeDeliveries, loading } = useSelector(state => state.delivery);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationUpdateEnabled, setLocationUpdateEnabled] = useState(false);
  
  useEffect(() => {
    const socket = initializeSocket();
    dispatch(getActiveDeliveries());
  
    subscribeToOrderUpdates(updatedOrder => {
      dispatch({ type: 'delivery/updateOrder', payload: updatedOrder });
    });
  
    const intervalId = setInterval(() => dispatch(getActiveDeliveries()), 30000);
    return () => {
      unsubscribeFromOrderUpdates();
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  useEffect(() => {
    // Location tracking when enabled
    let locationTrackingId;
    
    if (locationUpdateEnabled && selectedOrder) {
      // Get initial location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            sendLocationUpdate(position.coords.latitude, position.coords.longitude);
          },
          error => {
            console.error('Error getting location:', error);
            toast.error('Unable to access your location. Please check your settings.');
            setLocationUpdateEnabled(false);
          }
        );
        
        // Set up tracking
        locationTrackingId = navigator.geolocation.watchPosition(
          position => {
            sendLocationUpdate(position.coords.latitude, position.coords.longitude);
          },
          error => {
            console.error('Error tracking location:', error);
            toast.error('Location tracking error. Disabling tracking.');
            setLocationUpdateEnabled(false);
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser');
        setLocationUpdateEnabled(false);
      }
    }
    
    return () => {
      if (locationTrackingId) {
        navigator.geolocation.clearWatch(locationTrackingId);
      }
    };
  }, [locationUpdateEnabled, selectedOrder]);
  
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
      if (status === 'delivered') setLocationUpdateEnabled(false);
      toast.success(`Order status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      toast.error(error || 'Failed to update status');
    }
  };
  
  const sendLocationUpdate = async (lat, lng) => {
    if (selectedOrder) {
      try {
        await dispatch(updateLocation({ orderId: selectedOrder._id, coordinates: [lng, lat] })).unwrap();
      } catch (error) {
        console.error('Location update failed:', error);
      }
    }
  };
  
  const handleToggleLocationTracking = () => {
    setLocationUpdateEnabled(!locationUpdateEnabled);
    
    if (!locationUpdateEnabled) {
      toast.info('Location tracking enabled. Your location will be shared with the customer.');
    } else {
      toast.info('Location tracking disabled.');
    }
  };
  
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    
    // Reset location tracking when selecting a new order
    if (locationUpdateEnabled) {
      setLocationUpdateEnabled(false);
    }
  };
  
  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };
  
  const calculateEstimatedDeliveryTime = (order) => {
    const createdTime = new Date(order.createdAt).getTime();
    const estimatedTime = new Date(order.estimatedDeliveryTime).getTime();
    const now = new Date().getTime();
    
    // Calculate remaining time in minutes
    const remainingTime = Math.max(0, Math.round((estimatedTime - now) / (1000 * 60)));
    
    if (remainingTime <= 0) {
      return 'Due now';
    } else if (remainingTime < 60) {
      return `${remainingTime} minutes`;
    } else {
      const hours = Math.floor(remainingTime / 60);
      const minutes = remainingTime % 60;
      return `${hours}h ${minutes}m`;
    }
  };
  
  if (loading && !activeDeliveries.length) {
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
        <h2>Active Deliveries</h2>
        <Link to="/delivery/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
      {activeDeliveries.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <i className="fas fa-check-circle fa-4x mb-3 text-muted"></i>
            <h3>No Active Deliveries</h3>
            <p className="mb-4">You don't have any active deliveries at the moment.</p>
            <Link to="/delivery/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Your Deliveries</h5>
              </div>
              <div className="list-group list-group-flush">
                {activeDeliveries.map(order => (
                  <button
                    key={order._id}
                    className={`list-group-item list-group-item-action ${selectedOrder?._id === order._id ? 'active' : ''}`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>#{order._id.substring(0, 8)}</span>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <small>
                        <i className="fas fa-store me-1"></i>
                        {order.store.name}
                      </small>
                    </div>
                    <div>
                      <small>
                        <i className="fas fa-clock me-1"></i>
                        ETA: {calculateEstimatedDeliveryTime(order)}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            {selectedOrder ? (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Delivery Details</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6>Order Information</h6>
                      <p className="mb-1">
                        <strong>Order ID:</strong> #{selectedOrder._id.substring(0, 8)}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        <span className={`badge ${selectedOrder.status === 'picked_up' ? 'bg-warning' : 'bg-primary'}`}>
                          {selectedOrder.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Items:</strong> {selectedOrder.items.reduce((total, item) => total + item.quantity, 0)}
                      </p>
                      <p className="mb-1">
                        <strong>Total:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}
                      </p>
                      <p className="mb-1">
                        <strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                      {selectedOrder.paymentMethod === 'cod' && (
                        <p className="mb-1">
                          <strong>Collect Amount:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6>Customer Information</h6>
                      <p className="mb-1">
                        <strong>Name:</strong> {selectedOrder.user.name}
                      </p>
                      <p className="mb-1">
                        <strong>Phone:</strong> {selectedOrder.user.phoneNumber}
                      </p>
                      <p className="mb-1">
                        <strong>Delivery Address:</strong><br />
                        {formatAddress(selectedOrder.deliveryAddress)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6>Pickup From</h6>
                      <p className="mb-0">
                        <strong>{selectedOrder.store.name}</strong><br />
                        {formatAddress(selectedOrder.store.address)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6>Estimated Delivery Time</h6>
                      <p className="mb-0">
                        {new Date(selectedOrder.estimatedDeliveryTime).toLocaleString()}
                        <div className="text-muted mt-1">
                          {calculateEstimatedDeliveryTime(selectedOrder)} remaining
                        </div>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h6>Order Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product.name}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6>Location Tracking</h6>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="locationTrackingSwitch"
                          checked={locationUpdateEnabled}
                          onChange={handleToggleLocationTracking}
                        />
                        <label className="form-check-label" htmlFor="locationTrackingSwitch">
                          Share my location with customer
                        </label>
                      </div>
                      <div className="bg-light rounded p-3">
                        <p className="mb-0">
                          <i className="fas fa-info-circle me-2"></i>
                          When enabled, your location will be shared with the customer in real-time to track their delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      <h6>Update Status</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedOrder.status === 'processing' && (
                          <button
                            className="btn btn-warning"
                            onClick={() => handleStatusUpdate(selectedOrder._id, 'picked_up')}
                          >
                            Mark as Picked Up
                          </button>
                        )}
                        
                        {selectedOrder.status === 'picked_up' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStatusUpdate(selectedOrder._id, 'in_transit')}
                          >
                            Mark as In Transit
                          </button>
                        )}
                        
                        {(selectedOrder.status === 'picked_up' || selectedOrder.status === 'in_transit') && (
                          <button
                            className="btn btn-success"
                            onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')}
                          >
                            Mark as Delivered
                          </button>
                        )}
                        
                        <button className="btn btn-outline-secondary">
                          Contact Customer
                        </button>
                        
                        <button className="btn btn-outline-danger">
                          Report Issue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body text-center p-5">
                  <i className="fas fa-hand-point-left fa-4x mb-3 text-muted"></i>
                  <h3>Select a Delivery</h3>
                  <p className="mb-0">Select a delivery from the list to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveDeliveries;
