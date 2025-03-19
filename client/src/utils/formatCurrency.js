// client/src/utils/formatCurrency.js

// Format currency with the given locale and currency code
export const formatCurrency = (amount, locale = 'en-IN', currency = 'INR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format number with commas
  export const formatNumber = (number, locale = 'en-IN') => {
    return new Intl.NumberFormat(locale).format(number);
  };
  