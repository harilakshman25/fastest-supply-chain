// Updated Home.jsx with fixed product rendering
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../../redux/slices/productSlice';
import { getStores } from '../../redux/slices/storeSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading: productsLoading, error: productsError } = useSelector(state => state.product);
  const { stores, loading: storesLoading, error: storesError } = useSelector(state => state.store);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getStores());
  }, [dispatch]);
  
  const handleSearch = e => {
    e.preventDefault();
    dispatch(getProducts({ search: searchTerm, category: selectedCategory }));
  };
  
  const categories = [
    'Groceries',
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Bakery',
    'Beverages',
    'Snacks',
    'Personal Care',
    'Household'
  ];

  if (productsError) return <div className="container mt-4"><div className="alert alert-danger">{productsError}</div></div>;
  if (storesError) return <div className="container mt-4"><div className="alert alert-danger">{storesError}</div></div>;
  
  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row">
              <div className="col-md-8">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <h2 className="mb-4">Featured Products</h2>
      
      {productsLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="row">
          {products.map(product => (
            <div key={product._id} className="col-md-3 mb-4">
              <div className="card h-100">
                {product.image && (
                  <img src={product.image} alt={product.name} className="card-img-top" style={{ height: '180px', objectFit: 'cover' }} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted">{product.category}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-primary fw-bold">₹{product.price.toFixed(2)}</span>
                    <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary">View Details</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">No products found. Try a different search.</div>
      )}
      
      <h2 className="mb-4 mt-5">Nearby Stores</h2>
      
      {storesLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : stores.length > 0 ? (
        <div className="row">
          {stores.slice(0, 4).map(store => (
            <div key={store._id} className="col-md-3 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{store.name}</h5>
                  <p className="card-text">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {store.address.city}, {store.address.state}
                  </p>
                  <div className="mb-2">
                    {store.rating && (
                      <span className="badge bg-warning text-dark me-2">
                        <i className="fas fa-star me-1"></i>
                        {store.rating.average || 'N/A'}
                      </span>
                    )}
                    <small className="text-muted">
                      {store.operatingHours ? `${store.operatingHours.open} - ${store.operatingHours.close}` : 'Hours not available'}
                    </small>
                  </div>
                  <Link to={`/store/${store._id}`} className="btn btn-sm btn-primary">View Store</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">No stores found nearby.</div>
      )}
    </div>
  );
};

export default Home;
