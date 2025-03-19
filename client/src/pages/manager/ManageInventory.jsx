// client/src/pages/manager/ManageInventory.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStoreByManager } from '../../redux/slices/storeSlice';
import { getStoreProducts, updateProductInventory } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';

const ManageInventory = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { store } = useSelector(state => state.store);
  const { products, loading } = useSelector(state => state.product);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [quantityUpdate, setQuantityUpdate] = useState({});
  
  useEffect(() => {
    if (user && user._id) {
      dispatch(getStoreByManager(user._id));
    }
  }, [dispatch, user]);
  
  useEffect(() => {
    if (store && store._id) {
      dispatch(getStoreProducts(store._id));
    }
  }, [dispatch, store]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleEdit = (productId, currentQuantity) => {
    setEditingProduct(productId);
    setQuantityUpdate({
      ...quantityUpdate,
      [productId]: currentQuantity
    });
  };
  
  const handleQuantityChange = (productId, value) => {
    setQuantityUpdate({
      ...quantityUpdate,
      [productId]: parseInt(value)
    });
  };
  
  const handleSave = async (productId) => {
    if (store && store._id) {
      try {
        await dispatch(updateProductInventory({
          productId,
          storeId: store._id,
          quantity: quantityUpdate[productId]
        })).unwrap();
        setEditingProduct(null);
        toast.success('Inventory updated successfully');
      } catch (error) {
        toast.error(error || 'Failed to update inventory');
      }
    }
  };
  
  const handleCancel = (productId) => {
    setEditingProduct(null);
    
    // Reset the quantity update
    const product = products.find(p => p._id === productId);
    if (product) {
      const inventoryItem = product.inventory.find(inv => inv.store === store._id);
      if (inventoryItem) {
        setQuantityUpdate({
          ...quantityUpdate,
          [productId]: inventoryItem.quantity
        });
      }
    }
  };
  
  const getQuantityForProduct = (product) => {
    if (!product || !product.inventory) return 0;
    
    const inventoryItem = product.inventory.find(
      inv => inv.store._id === store._id || inv.store === store._id
    );
    
    return inventoryItem ? inventoryItem.quantity : 0;
  };

  const handleBulkZero = () => {
    if (window.confirm('Set all quantities to zero?')) {
      filteredProducts.forEach(product => {
        dispatch(updateProductInventory({ productId: product._id, storeId: store._id, quantity: 0 }));
      });
      toast.success('All quantities set to zero');
    }
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
                            <div>{product.name}</div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>₹{product.price.toFixed(2)}</td>
                        <td>
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '80px' }}
                              min="0"
                              value={quantityUpdate[product._id] || 0}
                              onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                            />
                          ) : (
                            getQuantityForProduct(product)
                          )}
                        </td>
                        <td>
                          {editingProduct === product._id ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => handleSave(product._id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleCancel(product._id)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEdit(product._id, getQuantityForProduct(product))}
                            >
                              Update
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No products found. 
                        <Link to="/manager/products" className="ms-2">Add some products</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Bulk Actions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <button className="btn btn-outline-primary d-block w-100">
                Import Inventory
              </button>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <button className="btn btn-outline-primary d-block w-100">
                Export Inventory
              </button>
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-danger d-block w-100">
                Set All to Zero
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
