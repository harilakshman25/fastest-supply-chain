// client/src/pages/manager/ManageProducts.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStoreByManager } from '../../redux/slices/storeSlice';
import { 
  getStoreProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';
import { isEmptyOrBlank } from '../../utils/validationUtils';

const ManageProducts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { store } = useSelector(state => state.store);
  const { products, loading } = useSelector(state => state.product);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    quantity: '0'
  });
  
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
  
  useEffect(() => {
    if (user && user.id) {
      dispatch(getStoreByManager(user.id));
    }
  }, [dispatch, user]);
  
  useEffect(() => {
    if (store && store._id) {
      dispatch(getStoreProducts(store._id));
    }
  }, [dispatch, store]);
  
  useEffect(() => {
    if (editingProduct) {
      const product = products.find(p => p._id === editingProduct);
      if (product) {
        const quantity = product.inventory.find(
          inv => inv.store._id === store._id || inv.store === store._id
        )?.quantity || 0;
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price.toString() || '',
          category: product.category || '',
          image: product.image || '',
          quantity: quantity.toString()
        });
        
        setShowForm(true);
      }
    }
  }, [editingProduct, products, store]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    if (isEmptyOrBlank(formData.name) || isEmptyOrBlank(formData.category) || formData.price <= 0) {
      toast.error('Please fill all required fields with valid data');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      inventory: [{ store: store._id, quantity: parseInt(formData.quantity) }]
    };

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ productId: editingProduct, productData })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success('Product added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };
  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
      toast.success('Product deleted successfully');
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      quantity: '0'
    });
    setEditingProduct(null);
    setShowForm(false);
  };
  
  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Products</h2>
        
        <div className="d-flex">
          <Link to="/manager/dashboard" className="btn btn-outline-primary me-2">
            Dashboard
          </Link>
          <Link to="/manager/inventory" className="btn btn-outline-primary me-2">
            Inventory
          </Link>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <span className="me-2">Store: </span>
              <span className="badge bg-primary p-2">{store?.name}</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <tr key={product._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="me-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div>{product.name}</div>
                              <small className="text-muted">{product.description?.substring(0, 30)}{product.description?.length > 30 ? '...' : ''}</small>
                            </div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>₹{product.price.toFixed(2)}</td>
                        <td>
                          {product.inventory.find(
                            inv => inv.store._id === store._id || inv.store === store._id
                          )?.quantity || 0}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => setEditingProduct(product._id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No products found. {!showForm && (
                          <button className="btn btn-link" onClick={() => setShowForm(true)}>
                            Add your first product
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
