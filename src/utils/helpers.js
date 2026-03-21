// Utility helper functions

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date in a readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', options);
};

/**
 * Format date for display (short format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format confidence score as percentage
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Formatted percentage
 */
export const formatConfidence = (confidence) => {
  return `${(confidence * 100).toFixed(1)}%`;
};

/**
 * Get severity color classes based on severity level
 * @param {string} severity - Severity level
 * @returns {object} Color classes
 */
export const getSeverityColors = (severity) => {
  const colors = {
    'HIGHLY SUSPICIOUS': {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      icon: 'text-red-500'
    },
    'SUSPICIOUS': {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    'CONCERNING': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    },
    'MILD CONCERN': {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: 'text-green-500'
    }
  };
  
  return colors[severity] || colors['MILD CONCERN'];
};

/**
 * Get result color classes based on prediction result
 * @param {string} result - Prediction result
 * @returns {object} Color classes
 */
export const getResultColors = (result) => {
  return result === 'cancerous' ? {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: 'text-red-500'
  } : {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    icon: 'text-green-500'
  };
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @returns {object} Validation result
 */
export const validateFile = (file) => {
  const maxSize = 16 * 1024 * 1024; // 16MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 16MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (PNG, JPG, JPEG)' };
  }
  
  return { valid: true };
};

/**
 * Validate patient data
 * @param {object} patient - Patient data to validate
 * @returns {object} Validation result
 */
export const validatePatient = (patient) => {
  const errors = {};
  
  if (!patient.name || patient.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (!patient.age || patient.age < 1 || patient.age > 120) {
    errors.age = 'Age must be between 1 and 120';
  }
  
  if (!patient.gender) {
    errors.gender = 'Gender is required';
  }
  
  const namePattern = /^[a-zA-Z\s]+$/;
  if (patient.name && !namePattern.test(patient.name)) {
    errors.name = 'Name can only contain letters and spaces';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Download data as JSON file
 * @param {object} data - Data to download
 * @param {string} filename - File name
 */
export const downloadJSON = (data, filename) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = filename || 'data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get time ago string
 * @param {string|Date} date - Date to compare
 * @returns {string} Time ago string
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export default {
  formatFileSize,
  formatDate,
  formatDateShort,
  formatConfidence,
  getSeverityColors,
  getResultColors,
  validateFile,
  validatePatient,
  generateId,
  debounce,
  throttle,
  downloadJSON,
  copyToClipboard,
  calculateAge,
  getTimeAgo
};