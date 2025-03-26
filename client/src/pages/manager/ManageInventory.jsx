// client/src/pages/manager/ManageInventory.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStoreByManager } from '../../redux/slices/storeSlice';
import { getStoreProducts, updateProductQuantity } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';

const ManageInventory = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { store, loadingStates: storeLoadingStates, error: storeError } = useSelector(state => state.store);
  const { products, loadingStates: productLoadingStates, error: productError } = useSelector(state => state.product);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState({});
  
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
    if (products && products.length > 0) {
      const initialInventory = {};
      products.forEach(product => {
        const storeInventory = product.inventory.find(inv => inv.store.toString() === store._id);
        if (storeInventory) {
          initialInventory[product._id] = storeInventory.quantity;
        } else {
          initialInventory[product._id] = 0;
        }
      });
      setInventory(initialInventory);
    }
  }, [products, store]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleQuantityChange = (productId, value) => {
    setInventory({
      ...inventory,
      [productId]: parseInt(value) || 0
    });
  };
  
  const handleUpdateInventory = (productId) => {
    const quantity = inventory[productId];
    
    dispatch(updateProductQuantity({ productId, storeId: store._id, quantity }))
      .unwrap()
      .then(() => {
        toast.success('Inventory updated successfully');
      })
      .catch(error => {
        toast.error(error || 'Failed to update inventory');
      });
  };
  
  const filteredProducts = products
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Show loading state during initial store load
  if (storeLoadingStates?.getStoreByManager) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show store error if any
  if (storeError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading Store</h4>
          <p>{storeError}</p>
          <hr />
          <p className="mb-0">
            Please try refreshing the page. If the problem persists, contact support.
          </p>
        </div>
      </div>
    );
  }

  // Show message if no store is found
  if (!store) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">No Store Found</h4>
          <p>No store has been assigned to your account yet.</p>
          <hr />
          <p className="mb-0">
            If you believe this is an error, please contact the administrator.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Inventory</h2>
        
        <div className="d-flex">
          <Link to="/manager/dashboard" className="btn btn-outline-primary me-2">
            Dashboard
          </Link>
          <Link to="/manager/products" className="btn btn-primary">
            Manage Products
          </Link>
        </div>
      </div>
      
      <div className="card shadow-sm mb-4">
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
          
          {productLoadingStates?.getStoreProducts ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          ) : productError ? (
            <div className="alert alert-danger">
              <h4 className="alert-heading">Error Loading Products</h4>
              <p>{productError}</p>
              <hr />
              <p className="mb-0">
                Please try refreshing the page. If the problem persists, contact support.
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td>
                        <img 
                          src={product.image || 'https://via.placeholder.com/50'} 
                          alt={product.name} 
                          width="50" 
                          height="50"
                          style={{ objectFit: 'cover' }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>₹{product.price.toFixed(2)}</td>
                      <td>{product.category}</td>
                      <td>
                        <div className="input-group input-group-sm" style={{ maxWidth: '150px' }}>
                          <input
                            type="number"
                            className="form-control"
                            value={inventory[product._id] || 0}
                            onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                            min="0"
                          />
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleUpdateInventory(product._id)}
                            disabled={productLoadingStates?.updateProductQuantity}
                          >
                            <i className="fas fa-save"></i>
                          </button>
                        </div>
                      </td>
                      <td>
                        <Link to={`/manager/products/${product._id}`} className="btn btn-sm btn-info me-2">
                          <i className="fas fa-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="mb-0">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
