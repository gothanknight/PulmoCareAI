import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Add request interceptor to prevent duplicate calls
const pendingRequests = new Map();

axios.interceptors.request.use(
  (config) => {
    const requestKey = `${config.method}:${config.url}`;
    
    if (pendingRequests.has(requestKey)) {
      console.log(`🚫 Preventing duplicate request: ${requestKey}`);
      return Promise.reject(new Error('Duplicate request cancelled'));
    }
    
    pendingRequests.set(requestKey, true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    // Only logout on actual authentication failures (401), not on network errors
    if (error.response?.status === 401) {
      console.error('Authentication failed, logging out');
      // Clear invalid session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
    
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const authCheckRef = useRef(false);
  const loginInProgressRef = useRef(false);
  const networkCheckIntervalRef = useRef(null);

  const setupNetworkMonitoring = useCallback(() => {
    // Check network connectivity every 60 seconds (less frequent)
    networkCheckIntervalRef.current = setInterval(async () => {
      if (isAuthenticated()) {
        try {
          await axios.get('http://localhost:5000/api/health', { timeout: 10000 });
          setNetworkError(false);
        } catch (error) {
          console.warn('Network connectivity issue detected');
          setNetworkError(true);
          // Don't logout on network errors, just set the flag
        }
      }
    }, 60000); // Check every minute instead of 30 seconds
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (isCheckingAuth) return; // Prevent duplicate calls
    
    try {
      setIsCheckingAuth(true);
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('Checking auth status:', { hasToken: !!storedToken, hasUser: !!storedUser });

      if (storedToken && storedUser) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          // Verify token is still valid by making a request to profile endpoint
          const response = await axios.get('http://localhost:5000/api/auth/profile', { timeout: 15000 });
          
          if (response.data.user) {
            setToken(storedToken);
            setUser(response.data.user);
            setNetworkError(false);
            console.log('Auth status: Authenticated as', response.data.user.username);
          } else {
            console.log('Auth status: Invalid response, logging out');
            logout();
          }
        } catch (apiError) {
          // Only logout if it's an authentication error (401), not network errors
          if (apiError.response?.status === 401) {
            console.log('Auth status: Authentication failed, logging out');
            logout();
          } else {
            console.log('Auth status: Network error, keeping session');
            // Keep the session alive on network errors
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } else {
        console.log('Auth status: No stored credentials');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only logout on actual auth errors, not network issues
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    // Check if user is logged in on app start (only once)
    if (!authCheckRef.current) {
      authCheckRef.current = true;
      checkAuthStatus();
    }

    // Set up network monitoring (less aggressive)
    setupNetworkMonitoring();

    // Cleanup on unmount
    return () => {
      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
      }
    };
  }, [checkAuthStatus, setupNetworkMonitoring]);

  // Add a retry mechanism for authentication
  const retryAuthCheck = async (maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await checkAuthStatus();
        if (isAuthenticated()) {
          console.log('Authentication restored successfully');
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      } catch (error) {
        console.error(`Auth retry ${i + 1} failed:`, error);
      }
    }
    console.log('Authentication retry failed after', maxRetries, 'attempts');
    return false;
  };

  const login = async (username, password) => {
    if (loginInProgressRef.current) {
      console.log('Login already in progress, ignoring duplicate request');
      return { success: false, error: 'Login already in progress' };
    }

    try {
      loginInProgressRef.current = true;
      setNetworkError(false);
      
      // Clear any existing session first
      logout();
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      }, { timeout: 15000 });

      const { access_token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Update state immediately
      setToken(access_token);
      setUser(userData);
      
      console.log('Login successful:', { access_token: access_token.substring(0, 20) + '...', user: userData.username });

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        setNetworkError(true);
        return { success: false, error: 'Network error. Please check your connection.' };
      } else if (error.response?.status === 401) {
        return { success: false, error: 'Invalid username or password' };
      } else if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Request timeout. Please try again.' };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      loginInProgressRef.current = false;
    }
  };

  const register = async (userData) => {
    try {
      setNetworkError(false);
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, { timeout: 15000 });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        setNetworkError(true);
        return { success: false, error: 'Network error. Please check your connection.' };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];

    // Clear state
    setToken(null);
    setUser(null);
    setNetworkError(false);
    authCheckRef.current = false; // Reset auth check flag
    loginInProgressRef.current = false; // Reset login flag
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    const hasToken = !!token;
    const hasUser = !!user;
    const hasStoredToken = !!localStorage.getItem('token');
    const hasStoredUser = !!localStorage.getItem('user');
    
    return (hasToken && hasUser) || (hasStoredToken && hasStoredUser);
  };

  const value = {
    user,
    token,
    loading,
    networkError,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    checkAuthStatus,
    retryAuthCheck
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};