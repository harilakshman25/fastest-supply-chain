import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <div className={`alert alert-danger ${className}`}>
      <i className="fas fa-exclamation-circle me-2"></i>
      {typeof error === 'string' ? error : 'An error occurred. Please try again.'}
    </div>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string
};

ErrorMessage.defaultProps = {
  className: ''
};

export default ErrorMessage;
