// client/src/pages/user/StoreView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStoreById } from '../../redux/slices/storeSlice';
import { getStoreProducts } from '../../redux/slices/productSlice';

const StoreView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { store, loading: storeLoading } = useSelector(state => state.store);
  const { products, loading: productsLoading } = useSelector(state => state.product);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    dispatch(getStoreById(id));
    dispatch(getStoreProducts(id));
  }, [dispatch, id]);
  
  const handleSearch = e => {
    e.preventDefault();
    dispatch(getStoreProducts(id, { search: searchTerm, category: selectedCategory }));
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

  const loading = storeLoading || productsLoading;

  if(loading) return 
  
  const filteredProducts = searchTerm 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : products;
  
  const categoryFilteredProducts = selectedCategory 
    ? filteredProducts.filter(product => product.category === selectedCategory)
    : filteredProducts;
  
  if (storeLoading || !store) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="card-title">{store.name}</h1>
              <p className="card-text">
                <i className="fas fa-map-marker-alt me-2"></i>
                {store.address.street}, {store.address.city}, {store.address.state} {store.address.zipCode}
              </p>
            </div>
            <div className="text-end">
              <div className="mb-2">
                <span className="badge bg-primary p-2">
                  <i className="fas fa-star me-1"></i>
                  {store.rating?.average || 'N/A'} ({store.rating?.count || 0} ratings)
                </span>
              </div>
              <small className="text-muted">
                <i className="fas fa-clock me-1"></i>
                Hours: {store.operatingHours?.open || '9:00'} - {store.operatingHours?.close || '21:00'}
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search products in this store..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-search"></i>
            </button>
          </form>
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
      
      <div className="row">
        {productsLoading ? (
          <div className="col-12 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : categoryFilteredProducts.length > 0 ? (
          categoryFilteredProducts.map(product => (
            <div key={product._id} className="col-md-3 mb-4">
              <div className="card h-100">
                {product.image && (
                  <img src={product.image} alt={product.name} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description?.substring(0, 60)}...</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-primary">₹{product.price.toFixed(2)}</span>
                    <Link to={`/product/${product._id}`} className="btn btn-sm btn-primary">View Details</Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreView;
