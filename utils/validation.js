// utils/validation.js
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    return password && password.length >= 6;
  };
  
  const validateInventoryItem = (itemData) => {
    const errors = [];
    
    if (!itemData.name) {
      errors.push('Item name is required');
    }
    
    if (!itemData.sku) {
      errors.push('SKU is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
    validateInventoryItem
  };
  