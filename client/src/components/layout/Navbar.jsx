import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user} = useSelector(state => state.auth);
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => navigate('/'))
      .catch(err => console.error('Logout failed:', err));
  };

  const authLinks = (
    <ul className="navbar-nav">
      { user?.role === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link>
        </li>
      )}
      { user?.role === 'store_manager' && (
        <li className="nav-item">
          <Link className="nav-link" to="/manager/dashboard">Store Dashboard</Link>
        </li>
      )}
      {user?.role === 'delivery' && (
        <li className="nav-item">
          <Link className="nav-link" to="/delivery/dashboard">Delivery Dashboard</Link>
        </li>
      )}
      <li className="nav-item">
        <Link className="nav-link" to="/profile">Profile</Link>
      </li>
      <li className="nav-item">
        <a onClick={onLogout} className="nav-link" href="#!">Logout</a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav">
      <li className="nav-item">
        <Link className="nav-link" to="/login">Login</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">Register</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Fastest Delivery</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {isAuthenticated && user?.role === 'user' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">My Orders</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    <i className="fas fa-shopping-cart"></i> Cart
                    {cartItems?.length > 0 && (
                      <span className="badge bg-secondary ms-1">{cartItems?.length}</span>
                    )}

                  </Link>
                </li>
              </>
            )}
          </ul>
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;