// client/src/pages/admin/RegistrationRequests.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getPendingApprovals, approveUser, rejectUser } from '../../redux/slices/adminSlice';
import { toast } from 'react-toastify';

const RegistrationRequests = () => {
  const dispatch = useDispatch();
  const { pendingApprovals, loading } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewUser, setViewUser] = useState(null);
  
  useEffect(() => {
    dispatch(getPendingApprovals());
  }, [dispatch]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleRoleFilter = e => {
    setRoleFilter(e.target.value);
  };
  
  const handleViewUser = user => {
    setViewUser(user);
  };
  
  const handleApprove = userId => {
    dispatch(approveUser(userId))
      .unwrap()
      .then(() => {
        toast.success('User approved successfully');
        setViewUser(null);
      })
      .catch(error => toast.error(error));
  };
  
  const handleReject = userId => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      dispatch(rejectUser(userId))
        .unwrap()
        .then(() => {
          toast.success('User rejected successfully');
          setViewUser(null);
        })
        .catch(error => toast.error(error));
    }
  };
  
  // Format role for display
  const formatRole = role => {
    return role === 'store_manager' ? 'Store Manager' : 'Delivery Person';
  };
  
  // Filter registration requests
  const filteredRequests = (() => {
    let filtered = pendingApprovals;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm))
      );
    }
    
    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    return filtered;
  })();
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registration Requests</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={roleFilter}
                onChange={handleRoleFilter}
              >
                <option value="">All Roles</option>
                <option value="store_manager">Store Managers</option>
                <option value="delivery">Delivery Personnel</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>{formatRole(user.role)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-1"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleApprove(user._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(user._id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
              <h5>No Pending Requests</h5>
              <p className="text-muted mb-0">There are no pending registration requests at this time.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* User Details Modal */}
      {viewUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registration Request Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setViewUser(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Personal Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {viewUser.name}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {viewUser.email}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {viewUser.phoneNumber || 'Not provided'}
                    </p>
                    <p className="mb-1">
                      <strong>Role:</strong> {formatRole(viewUser.role)}
                    </p>
                    <p className="mb-1">
                      <strong>Requested:</strong> {new Date(viewUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Address</h6>
                    {viewUser.address?.street ? (
                      <address>
                        {viewUser.address.street}<br />
                        {viewUser.address.city}, {viewUser.address.state} {viewUser.address.zipCode}
                      </address>
                    ) : (
                      <p className="text-muted">No address provided</p>
                    )}
                  </div>
                </div>
                
                {viewUser.role === 'store_manager' && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6>Store Information</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="mb-1">
                            <strong>Store Name:</strong> {viewUser.metadata?.storeName || 'Not provided'}
                          </p>
                          <p className="mb-1">
                            <strong>Store Address:</strong>{' '}
                            {viewUser.metadata?.storeAddress ? (
                              <>
                                {viewUser.metadata.storeAddress.street},{' '}
                                {viewUser.metadata.storeAddress.city},{' '}
                                {viewUser.metadata.storeAddress.state}{' '}
                                {viewUser.metadata.storeAddress.zipCode}
                              </>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                          {viewUser.metadata?.salesHistory && (
                            <div>
                              <strong>Sales History:</strong>
                              <p className="mb-0">{viewUser.metadata.salesHistory}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {viewUser.role === 'delivery' && viewUser.metadata && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6>Delivery Person Details</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="mb-1">
                            <strong>Driving License:</strong> {viewUser.metadata.drivingLicense || 'Not provided'}
                          </p>
                          {viewUser.metadata.qualification && (
                            <div>
                              <strong>Qualification/Experience:</strong>
                              <p className="mb-0">{viewUser.metadata.qualification}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setViewUser(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleReject(viewUser._id)}
                >
                  Reject
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleApprove(viewUser._id)}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRequests;
