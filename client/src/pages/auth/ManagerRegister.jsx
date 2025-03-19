// client/src/pages/auth/ManagerRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerManager} from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const ManagerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    storeName: '',
    storeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    salesHistory: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      storeName: formData.storeName,
      storeAddress: formData.storeAddress,
      salesHistory: formData.salesHistory
    };
    try {
      await dispatch(registerManager(userData)).unwrap();
      navigate('/login', { state: { role: 'store_manager' } });
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Register as Store Manager</h2>
              <form onSubmit={onSubmit}>
                <h4 className="mb-3">Personal Information</h4>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <h5 className="mb-2">Address</h5>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      name="address.city"
                      value={formData.address.city}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      name="address.state"
                      value={formData.address.state}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Zip Code"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                
                <h4 className="mb-3 mt-4">Store Information</h4>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Store Name"
                    name="storeName"
                    value={formData.storeName}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <h5 className="mb-2">Store Address</h5>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street"
                    name="storeAddress.street"
                    value={formData.storeAddress.street}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      name="storeAddress.city"
                      value={formData.storeAddress.city}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      name="storeAddress.state"
                      value={formData.storeAddress.state}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Zip Code"
                      name="storeAddress.zipCode"
                      value={formData.storeAddress.zipCode}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Previous Sales History"
                    name="salesHistory"
                    value={formData.salesHistory}
                    onChange={onChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-100">Register as Store Manager</button>
              </form>
              <p className="mt-3 text-center">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerRegister;
