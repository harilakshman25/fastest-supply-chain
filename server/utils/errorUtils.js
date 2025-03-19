export const getErrorMessage = (error) => {
    // Error from API response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.msg) {
      return error.response.data.msg;
    }
    
    // Specific field validation errors
    if (error.response?.data?.errors) {
      const firstError = error.response.data.errors[0];
      return firstError.msg || 'Validation error';
    }
    
    // Network error
    if (error.message) {
      return error.message;
    }
    
    // Default error message
    return 'An error occurred. Please try again.';
  };
  
  /**
   * Handles API errors with toast notifications
   */
  export const handleApiError = (error, toast) => {
    const message = getErrorMessage(error);
    toast.error(message);
    return message;
  };
  