import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds timeout for image uploads
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// API functions
export const healthCheck = () => api.get('/api/health');

export const getModelInfo = () => api.get('/api/model/info');

export const getPatients = () => api.get('/api/patients');

export const createPatient = (patientData) => api.post('/api/patients', patientData);

export const predictLungCancer = (formData) => {
  return api.post('/api/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getPatientPredictions = (patientId) => api.get(`/api/predictions/${patientId}`);

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.data?.message || 'Server error occurred';
    return { error: message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { error: 'Network error - please check your connection', status: 0 };
  } else {
    // Something else happened
    return { error: error.message || 'Unknown error occurred', status: -1 };
  }
};

export default api;