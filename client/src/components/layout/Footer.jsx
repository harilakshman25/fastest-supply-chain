import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Fastest Delivery System</h5>
            <p className="text-muted">
              Get your items delivered fast and reliably with our network of stores and delivery personnel.
            </p>
          </div>
          <div className="col-md-2 mb-3 mb-md-0">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li><Link to="/login" className="text-decoration-none text-muted">Login</Link></li>
              <li><Link to="/register" className="text-decoration-none text-muted">Register</Link></li>
            </ul>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <h5>Partner With Us</h5>
            <ul className="list-unstyled">
              <li><Link to="/register/manager" className="text-decoration-none text-muted">Register as Store Manager</Link></li>
              <li><Link to="/register/delivery" className="text-decoration-none text-muted">Register as Delivery Person</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Contact</h5>
            <ul className="list-unstyled text-muted">
              <li><i className="fas fa-envelope me-2"></i> contact@fastestdelivery.com</li>
              <li><i className="fas fa-phone me-2"></i> +91 1234567890</li>
              <li><i className="fas fa-map-marker-alt me-2"></i> Bengaluru, India</li>
            </ul>
          </div>
        </div>
        <hr className="mt-4 mb-3" />
        <div className="text-center text-muted">
          <small>&copy; {new Date().getFullYear()} Fastest Delivery System. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
