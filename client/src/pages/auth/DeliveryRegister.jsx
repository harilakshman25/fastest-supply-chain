// client/src/pages/auth/DeliveryRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerDelivery } from '../../redux/slices/authSlice';
import {toast} from 'react-toastify';

const DeliveryRegister = () => {
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
    drivingLicense: '',
    qualification: ''
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
    try {
      await dispatch(registerDelivery(formData)).unwrap();
      navigate('/register/success', { state: { role: 'delivery' } });
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
              <h2 className="card-title text-center mb-4">Register as Delivery Person</h2>
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
                
                <h4 className="mb-3 mt-4">Delivery Qualification</h4>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Driving License Number"
                    name="drivingLicense"
                    value={formData.drivingLicense}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Qualifications or Previous Experience"
                    name="qualification"
                    value={formData.qualification}
                    onChange={onChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-100">Register as Delivery Person</button>
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

export default DeliveryRegister;
