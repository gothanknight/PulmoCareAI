// Application constants

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.dcm']
};

// Model information
export const MODEL_INFO = {
  ARCHITECTURE: 'ResNet50 + Focal Loss',
  INPUT_SIZE: [224, 224, 3],
  CLASSES: ['cancerous', 'non_cancerous'],
  THRESHOLD: 0.5
};

// UI Constants
export const SEVERITY_LEVELS = {
  'HIGHLY SUSPICIOUS': {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200'
  },
  'SUSPICIOUS': {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200'
  },
  'CONCERNING': {
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200'
  },
  'MILD CONCERN': {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  'NORMAL': {
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  }
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: 'rgba(37, 99, 235, 0.8)',
  SUCCESS: 'rgba(34, 197, 94, 0.8)',
  WARNING: 'rgba(251, 191, 36, 0.8)',
  DANGER: 'rgba(239, 68, 68, 0.8)',
  INFO: 'rgba(59, 130, 246, 0.8)'
};

// Navigation items
export const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: 'HomeIcon' },
  { name: 'Dashboard', path: '/dashboard', icon: 'ChartBarIcon' },
  { name: 'Patients', path: '/patients', icon: 'UserGroupIcon' },
  { name: 'Analysis', path: '/analysis', icon: 'HeartIcon' },
  { name: 'About', path: '/about', icon: 'InformationCircleIcon' }
];

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  MODEL_INFO: '/api/model/info',
  PATIENTS: '/api/patients',
  PREDICT: '/api/predict',
  PREDICTIONS: '/api/predictions'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  RECENT_PATIENTS: 'recentPatients'
};

// Validation patterns
export const VALIDATION = {
  NAME_PATTERN: /^[a-zA-Z\s]+$/,
  AGE_MIN: 1,
  AGE_MAX: 120,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/
};

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size must be less than 16MB',
  INVALID_FILE_TYPE: 'Please upload a valid image file (PNG, JPG, JPEG)',
  NETWORK_ERROR: 'Network error - please check your connection',
  SERVER_ERROR: 'Server error - please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  MODEL_NOT_LOADED: 'AI model is not available - please contact support'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'Patient created successfully!',
  ANALYSIS_COMPLETE: 'Analysis completed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  DATA_SAVED: 'Data saved successfully!'
};

// Medical terminology
export const MEDICAL_TERMS = {
  CANCER_TYPES: [
    'Adenocarcinoma',
    'Squamous Cell Carcinoma',
    'Large Cell Carcinoma',
    'Small Cell Lung Cancer'
  ],
  RECOMMENDATIONS: {
    'HIGHLY SUSPICIOUS': 'Urgent biopsy recommended',
    'SUSPICIOUS': 'Further imaging needed',
    'CONCERNING': 'Close monitoring required',
    'MILD CONCERN': 'Routine follow-up',
    'NORMAL': 'No immediate action required'
  }
};

export default {
  FILE_CONSTRAINTS,
  MODEL_INFO,
  SEVERITY_LEVELS,
  CHART_COLORS,
  NAV_ITEMS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MEDICAL_TERMS
};