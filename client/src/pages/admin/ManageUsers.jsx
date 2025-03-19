// client/src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllUsers, updateUser, deleteUser } from '../../redux/slices/adminSlice';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [viewUser, setViewUser] = useState(null);
  
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);
  
  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };
  
  const handleRoleFilter = e => {
    setRoleFilter(e.target.value);
  };
  
  const handleApprovalFilter = e => {
    setApprovalFilter(e.target.value);
  };
  
  const handleViewUser = user => {
    setViewUser(user);
  };
  
  const handleUpdateUser = (userId, approvalStatus) => {
    dispatch(updateUser({ userId, userData: { isApproved: approvalStatus } }))
      .unwrap()
      .then(() => {
        toast.success(`User ${approvalStatus ? 'approved' : 'rejected'} successfully`);
        setViewUser(null);
      })
      .catch(error => toast.error(error));
  };
  
  const handleDeleteUser = userId => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(userId));
      toast.success('User deleted successfully');
      
      if (viewUser && viewUser._id === userId) {
        setViewUser(null);
      }
    }
  };
  
  // Format user roles for display
  const formatRole = role => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Filter users
  const filteredUsers = (() => {
    let filtered = users;
    
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
    
    // Approval filter
    if (approvalFilter) {
      filtered = filtered.filter(user => 
        (approvalFilter === 'approved' && user.isApproved) || 
        (approvalFilter === 'pending' && !user.isApproved)
      );
    }
    
    return filtered;
  })();
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-primary">
          Dashboard
        </Link>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
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
                <option value="user">Customer</option>
                <option value="store_manager">Store Manager</option>
                <option value="delivery">Delivery Person</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={approvalFilter}
                onChange={handleApprovalFilter}
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{formatRole(user.role)}</td>
                      <td>
                        <span className={`badge ${user.isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
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
              <p className="mb-0">No users found matching your criteria.</p>
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
                <h5 className="modal-title">User Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setViewUser(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Basic Information</h6>
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
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${viewUser.isApproved ? 'bg-success' : 'bg-warning'}`}>
                        {viewUser.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Joined:</strong> {new Date(viewUser.createdAt).toLocaleString()}
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
                    
                    {viewUser.role === 'delivery' && viewUser.metadata && (
                      <div className="mt-4">
                        <h6>Delivery Person Details</h6>
                        <p className="mb-1">
                          <strong>Driving License:</strong> {viewUser.metadata.drivingLicense || 'Not provided'}
                        </p>
                        <p className="mb-0">
                          <strong>Qualification:</strong> {viewUser.metadata.qualification || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {!viewUser.isApproved && (viewUser.role === 'store_manager' || viewUser.role === 'delivery') && (
                  <div className="alert alert-warning">
                    <h6>Pending Approval</h6>
                    <p className="mb-0">
                      This user has registered as a {viewUser.role === 'store_manager' ? 'Store Manager' : 'Delivery Person'} and is waiting for your approval.
                    </p>
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
                
                {!viewUser.isApproved && (viewUser.role === 'store_manager' || viewUser.role === 'delivery') && (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => handleUpdateUser(viewUser._id, false)}
                    >
                      Reject
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={() => handleUpdateUser(viewUser._id, true)}
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
