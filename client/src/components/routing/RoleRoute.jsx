import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ element, role }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return element;
};

export default RoleRoute;
