// client/src/pages/admin/ManageStores.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllStores, updateStore, deleteStore } from '../../redux/slices/adminSlice';
import { toast } from 'react-toastify';

const ManageStores = () => {
  const dispatch = useDispatch();
  const { stores, loading } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editStore, setEditStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    operatingHours: {
      open: '',
      close: ''
    },
    isActive: true
  });
  
  useEffect(() => {
    dispatch(getAllStores());
  }, [dispatch]);
  
  useEffect(() => {
    if (editStore) {
      const store = stores.find(s => s._id === editStore);
      if (store) {
        setFormData({
          name: store.name || '',
          contactNumber: store.contactNumber || '',
          email: store.email || '',
          address: {
            street: store.address?.street || '',
            city: store.address?.city || '',
            state: store.address?.state || '',
            zipCode: store.address?.zipCode || ''
          },
          operatingHours: {
            open: store.operatingHours?.open || '09:00',
            close: store.operatingHours?.close || '21:00'
          },
          isActive: store.isActive
        });
      }
    }
  }, [editStore, stores]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilter = e => {
    setStatusFilter(e.target.value);
  };
  
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleEditStore = storeId => {
    setEditStore(storeId);
  };
  
  // Update the updateStore function in ManageStores.jsx
const handleSubmit = e => {
    e.preventDefault();
    
    const storeData = {
      name: formData.name,
      contactNumber: formData.contactNumber,
      email: formData.email,
      address: formData.address,
      operatingHours: formData.operatingHours,
      isActive: formData.isActive
    };
    
    dispatch(updateStore({ storeId: editStore, storeData }))
      .unwrap()
      .then(() => {
        toast.success('Store updated successfully');
        resetForm();
      })
      .catch(error => {
        toast.error(error || 'Failed to update store');
      });
  };
  
  
  const handleDeleteStore = storeId => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      dispatch(deleteStore(storeId));
      toast.success('Store deleted successfully');
    }
  };
  
  const resetForm = () => {
    setEditStore(null);
    setFormData({
      name: '',
      contactNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      operatingHours: {
        open: '',
        close: ''
      },
      isActive: true
    });
  };
  
  // Filter stores
  const filteredStores = (() => {
    let filtered = stores;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.manager?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(store => 
        (statusFilter === 'active' && store.isActive) || 
        (statusFilter === 'inactive' && !store.isActive)
      );
    }
    
    return filtered;
  })();
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Stores</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
      {editStore && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-4">Edit Store</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Store Name</label>
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
                  <label className="form-label">Status</label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="storeActiveSwitch"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="storeActiveSwitch">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Zip Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Opening Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="operatingHours.open"
                    value={formData.operatingHours.open}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Closing Time</label>
                  <input
                    type="time"
                    className="form-control"
                    name="operatingHours.close"
                    value={formData.operatingHours.close}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                  Update Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search stores by name, city, or manager..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">All Stores</option>
                <option value="active">Active Stores</option>
                <option value="inactive">Inactive Stores</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Location</th>
                    <th>Manager</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map(store => (
                    <tr key={store._id}>
                      <td>{store.name}</td>
                      <td>{store.address?.city}, {store.address?.state}</td>
                      <td>{store.manager?.name}</td>
                      <td>
                        {store.rating?.average ? (
                          <div className="d-flex align-items-center">
                            <span className="me-1">{store.rating.average}</span>
                            <i className="fas fa-star text-warning"></i>
                            <span className="ms-1 text-muted">({store.rating.count})</span>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${store.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {store.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => handleEditStore(store._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteStore(store._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="mb-0">No stores found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStores;
