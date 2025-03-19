// client/src/pages/user/ProductDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import {toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(state => state.product);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedStore, setSelectedStore] = useState('');

  const { store: cartStore } = useSelector(state => state.cart);
  
  useEffect(() => {
    dispatch(getProductById(id));
  }, [dispatch, id]);
  
  useEffect(() => {
    if (product && product.inventory && product.inventory.length > 0) {
      setSelectedStore(product.inventory[0].store._id);
    }
  }, [product]);
  
  const handleQuantityChange = e => {
    setQuantity(parseInt(e.target.value));
  };
  
  const handleStoreChange = e => {
    setSelectedStore(e.target.value);
  };
  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartStore && cartStore._id !== selectedStore) {
      if (!window.confirm('Adding from a different store will clear your cart. Continue?')) return;
    }
    dispatch(addToCart({ productId: product._id, quantity, storeId: selectedStore }))
      .unwrap()
      .then(() => toast.success('Added to cart!'))
      .catch(error => toast.error(error || 'Failed to add to cart'));
  };
  
  if (loading || !product) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Find current store inventory
  const currentStoreInventory = product.inventory.find(inv => inv.store._id === selectedStore);
  const isInStock = currentStoreInventory && currentStoreInventory.quantity > 0;
  
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-5">
          {product.image ? (
            <img src={product.image} alt={product.name} className="img-fluid rounded" />
          ) : (
            <div className="bg-light rounded d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <span className="text-muted">No image available</span>
            </div>
          )}
        </div>
        <div className="col-md-7">
          <h2>{product.name}</h2>
          <p className="text-muted">{product.category}</p>
          <h3 className="text-primary mb-4">₹{product.price.toFixed(2)}</h3>
          
          <div className="mb-4">
            <h5>Description</h5>
            <p>{product.description || 'No description available.'}</p>
          </div>
          
          <div className="mb-4">
            <h5>Select Store</h5>
            <select 
              className="form-select mb-3"
              value={selectedStore}
              onChange={handleStoreChange}
            >
              {product.inventory.map(inv => (
                <option key={inv.store._id} value={inv.store._id}>
                  {inv.store.name} - {inv.quantity > 0 ? `${inv.quantity} in stock` : 'Out of stock'}
                </option>
              ))}
            </select>
            
            {isInStock ? (
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                In Stock ({currentStoreInventory.quantity} available)
              </div>
            ) : (
              <div className="alert alert-danger">
                <i className="fas fa-times-circle me-2"></i>
                Out of Stock
              </div>
            )}
          </div>
          
          <div className="d-flex align-items-center mb-4">
            <label htmlFor="quantity" className="me-3">Quantity:</label>
            <input 
              type="number" 
              id="quantity"
              className="form-control me-3" 
              style={{ width: '80px' }}
              min="1"
              max={isInStock ? currentStoreInventory.quantity : 1}
              value={quantity}
              onChange={handleQuantityChange}
              disabled={!isInStock}
            />
          </div>
          
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

