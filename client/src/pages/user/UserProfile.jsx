// client/src/pages/user/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, getUserProfile } from '../../redux/slices/userSlice';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.user);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);
  
  const onChange = e => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        toast.success('Profile updated!');
      })
      .catch(error => toast.error(error || 'Update failed'));
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
  
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              <h4>{user?.name}</h4>
              <p className="text-muted mb-1">{user?.email}</p>
              <p className="text-muted">Account Type: {user?.role?.replace('_', ' ').charAt(0).toUpperCase() + user?.role?.slice(1).replace('_', ' ')}</p>
              
              <button 
                className="btn btn-outline-primary mt-3"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="card-title">Account Information</h5>
              <div className="mb-2">
                <small className="text-muted">Member Since</small>
                <div>{new Date(user?.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">Phone Number</small>
                <div>{user?.phoneNumber || 'Not provided'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="card-title mb-4">{isEditing ? 'Edit Profile' : 'Profile Information'}</h4>
              
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      required
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={onChange}
                      required
                    />
                  </div>
                  
                  <h5 className="mb-3 mt-4">Address</h5>
                  
                  <div className="mb-3">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address.street"
                      value={formData.address.street}
                      onChange={onChange}
                      required
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.city"
                        value={formData.address.city}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.state"
                        value={formData.address.state}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h5>Personal Information</h5>
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>Name</td>
                            <td>{user?.name}</td>
                          </tr>
                          <tr>
                            <td>Email</td>
                            <td>{user?.email}</td>
                          </tr>
                          <tr>
                            <td>Phone</td>
                            <td>{user?.phoneNumber || 'Not provided'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="col-md-6">
                      <h5>Address</h5>
                      {user?.address?.street ? (
                        <address>
                          {user.address.street}<br />
                          {user.address.city}, {user.address.state} {user.address.zipCode}
                        </address>
                      ) : (
                        <p className="text-muted">No address provided</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
