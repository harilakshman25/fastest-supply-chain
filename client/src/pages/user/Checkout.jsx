// client/src/pages/user/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCartItems } from '../../redux/slices/cartSlice';
import { createOrder } from '../../redux/slices/orderSlice';
import {toast} from 'react-toastify';
import { isValidAddress ,isValidPhoneNumber } from '../../utils/validationUtils';


const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, store } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { loading: orderLoading } = useSelector(state => state.order);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || ''
    },
    paymentMethod: 'cod'
  });
  
  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);
  
  const onChange = e => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const calculateSubtotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal
  };

  const calculateTotal =()=>{
     return calculateSubtotal+40;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderData = {
      items: cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      storeId: store._id,
      deliveryAddress: formData.address,
      paymentMethod: formData.paymentMethod,
      totalAmount: calculateTotal()
    };

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      toast.error('Invalid phone number');
      return;
    }
    if (!isValidAddress(formData.address)) {
      toast.error('Invalid address');
      return;
    }

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      navigate('/order/success', { state: { orderData: result } });
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error || 'Failed to place order');
    }
  };
  
  


  if (cartLoading || orderLoading) return <div className="container mt-5 text-center">Loading...</div>;
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Checkout</h2>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Shipping Information</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address.street"
                    value={formData.address.street}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address.city"
                      value={formData.address.city}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address.state"
                      value={formData.address.state}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                
                <h5 className="card-title mb-4 mt-5">Payment Method</h5>
                
                <div className="mb-3">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="cod">
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="online"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="online">
                      Online Payment
                    </label>
                  </div>
                </div>
                
                {formData.paymentMethod === 'online' && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Online payment will be processed after order confirmation.
                  </div>
                )}
                
                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary">
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              
              {store && (
                <div className="mb-3">
                  <small className="text-muted">Store</small>
                  <div>{store.name}</div>
                </div>
              )}
              
              <hr />
              
              <div className="mb-3">
                {cartItems.map(item => (
                  <div key={item.product._id} className="d-flex justify-content-between mb-2">
                    <div>
                      <span>{item.product.name}</span>
                      <small className="text-muted d-block">Qty: {item.quantity}</small>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span>₹40.00</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong>₹{(calculateSubtotal() + 40).toFixed(2)}</strong>
              </div>
              
              <div className="text-center">
                <small className="text-muted">
                  <i className="fas fa-lock me-1"></i>
                  Secure Checkout
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;





// // Update Checkout.jsx for proper order creation
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { getCartItems } from '../../redux/slices/cartSlice';
// import { createOrder } from '../../redux/slices/orderSlice';
// import { toast } from 'react-toastify';

// const Checkout = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { cartItems, store, loading: cartLoading } = useSelector(state => state.cart);
//   const { user } = useSelector(state => state.auth);
//   const { loading: orderLoading } = useSelector(state => state.order);
  
//   const [deliveryAddress, setDeliveryAddress] = useState({
//     street: user?.address?.street || '',
//     city: user?.address?.city || '',
//     state: user?.address?.state || '',
//     zipCode: user?.address?.zipCode || ''
//   });
  
//   const [paymentMethod, setPaymentMethod] = useState('cod');
  
//   useEffect(() => {
//     dispatch(getCartItems());
//   }, [dispatch]);
  
//   useEffect(() => {
//     if (user?.address) {
//       setDeliveryAddress({
//         street: user.address.street || '',
//         city: user.address.city || '',
//         state: user.address.state || '',
//         zipCode: user.address.zipCode || ''
//       });
//     }
//   }, [user]);
  
//   const handleAddressChange = e => {
//     const { name, value } = e.target;
//     setDeliveryAddress({
//       ...deliveryAddress,
//       [name]: value
//     });
//   };
  
//   const handlePaymentChange = e => {
//     setPaymentMethod(e.target.value);
//   };
  
//   const handleSubmit = async e => {
//     e.preventDefault();
    
//     // Validate the address fields
//     if (!deliveryAddress.street || !deliveryAddress.city || 
//         !deliveryAddress.state || !deliveryAddress.zipCode) {
//       toast.error('Please complete all address fields');
//       return;
//     }
    
//     // Calculate total amount
//     const totalAmount = cartItems.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);
    
//     // Prepare order data
//     const orderData = {
//       items: cartItems.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//         price: item.price
//       })),
//       deliveryAddress,
//       store: store._id,
//       paymentMethod,
//       totalAmount
//     };
    
//     try {
//       const result = await dispatch(createOrder(orderData)).unwrap();
//       navigate('/order/success', { state: { orderData: result } });
//     } catch (error) {
//       toast.error(error || 'Failed to create order');
//     }
//   };
  
//   // JSX rendering with proper cart item display and form validation
// };
