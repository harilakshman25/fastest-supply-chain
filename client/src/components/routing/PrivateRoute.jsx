import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  if (loading) return <div className="container mt-5 text-center">Loading...</div>;
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;