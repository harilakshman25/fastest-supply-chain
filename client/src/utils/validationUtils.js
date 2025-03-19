// client/src/utils/validationUtils.js

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate phone number format (Indian)
  export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  // Validate password strength
  export const getPasswordStrength = (password) => {
    // Create variables to track password strength
    let strength = 0;
    
    // If password is 8+ characters, increase strength
    if (password.length >= 8) {
      strength += 1;
    }
    
    // If password contains lowercase and uppercase, increase strength
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      strength += 1;
    }
    
    // If password has numbers, increase strength
    if (password.match(/([0-9])/)) {
      strength += 1;
    }
    
    // If password has special characters, increase strength
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      strength += 1;
    }
    
    // Return strength value (0-4)
    return strength;
  };
  
  // Validate zip code format (Indian PIN code)
  export const isValidZipCode = (zipCode) => {
    const zipRegex = /^[1-9][0-9]{5}$/;
    return zipRegex.test(zipCode);
  };
  
  // Validate if a string is empty or blank
  export const isEmptyOrBlank = (value) => {
    return !value || value.trim() === '';
  };

  export const isValidAddress = (address) => {
    return (
      !isEmptyOrBlank(address.street) &&
      !isEmptyOrBlank(address.city) &&
      !isEmptyOrBlank(address.state) &&
      isValidZipCode(address.zipCode)
    );
  };
  