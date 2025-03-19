// client/src/pages/user/Cart.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCartItems, removeFromCart, updateCartQuantity } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, loading, store } = useSelector(state => state.cart);
  
  useEffect(() => {
    dispatch(getCartItems());
  }, [dispatch]);
  
  const handleQuantityChange = (productId, quantity) => {
    dispatch(updateCartQuantity(productId, quantity));
  };
  
  const handleRemoveItem = productId => {
    dispatch(removeFromCart(productId));
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
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
  
  if (!cartItems) {
    return (
      <div className="container mt-5">
        <div className="card shadow">
          <div className="card-body text-center p-5">
            <i className="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
            <h3>Your cart is empty</h3>
            <p className="mb-4">Add items to your cart to continue shopping.</p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Shopping Cart</h2>
      
      {store && (
        <div className="alert alert-info mb-4">
          <i className="fas fa-store me-2"></i>
          Items from: <strong>{store.name}</strong>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.product._id}>
                        <td>
                          <div className="d-flex align-items-center">
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
                              <small className="text-muted">{item.product.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td style={{ width: '120px' }}>
                          <div className="input-group">
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              className="form-control form-control-sm text-center" 
                              value={item.quantity}
                              readOnly
                            />
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button 
                            className="btn btn-sm text-danger"
                            onClick={() => handleRemoveItem(item.product._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mb-5">
            <Link to="/" className="btn btn-outline-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Continue Shopping
            </Link>
            
            <button 
              className="btn btn-outline-secondary"
              onClick={() => dispatch(getCartItems())}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Update Cart
            </button>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
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
              
              <button
                className="btn btn-primary w-100"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-3 text-center">
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

export default Cart;


// // Update Cart.jsx for better checkout integration
// import React, { useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { getCartItems, updateCartQuantity, removeFromCart } from '../../redux/slices/cartSlice';
// import { toast } from 'react-toastify';

// const Cart = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { cartItems, store, loading } = useSelector(state => state.cart);
  
//   useEffect(() => {
//     dispatch(getCartItems());
//   }, [dispatch]);
  
//   const handleQuantityChange = (productId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     dispatch(updateCartQuantity({ productId, quantity: newQuantity }))
//       .unwrap()
//       .catch(error => {
//         toast.error(error || 'Failed to update quantity');
//       });
//   };
  
//   const handleRemoveItem = (productId) => {
//     dispatch(removeFromCart(productId))
//       .unwrap()
//       .then(() => {
//         toast.success('Item removed from cart');
//       })
//       .catch(error => {
//         toast.error(error || 'Failed to remove item');
//       });
//   };
  
//   const calculateTotal = () => {
//     return cartItems.reduce((total, item) => {
//       return total + (item.price * item.quantity);
//     }, 0);
//   };
  
//   const handleCheckout = () => {
//     if (cartItems.length === 0) {
//       toast.error('Your cart is empty');
//       return;
//     }
    
//     navigate('/checkout');
//   };
  
//   if (loading) {
//     return (
//       <div className="container mt-5 text-center">
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }
  
//   if (cartItems.length === 0) {
//     return (
//       <div className="container mt-5">
//         <div className="card shadow-sm">
//           <div className="card-body text-center p-5">
//             <i className="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
//             <h3>Your Cart is Empty</h3>
//             <p className="mb-4">Add items to your cart to see them here.</p>
//             <Link to="/" className="btn btn-primary">
//               Start Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   // JSX rendering with proper cart items display and total calculation
// };
