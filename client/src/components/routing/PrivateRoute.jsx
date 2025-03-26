import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // If we have both isAuthenticated and user, render the element
  if (isAuthenticated && user) {
    return element;
  }

  // If not authenticated, redirect to login
  return <Navigate to="/login" />;
};

export default PrivateRoute;