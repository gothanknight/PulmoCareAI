import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { HeartIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated, logout, networkError, retryAuthCheck } = useAuth();
  const [authError, setAuthError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Only show auth error if there's a persistent network error and we're not loading
    if (networkError && !loading) {
      // Don't immediately show error, wait a bit to see if it resolves
      const timer = setTimeout(() => {
        setAuthError(true);
      }, 5000); // Wait 5 seconds before showing error
      
      return () => clearTimeout(timer);
    } else {
      setAuthError(false);
    }
  }, [networkError, loading]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const success = await retryAuthCheck();
      if (success) {
        setAuthError(false);
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthError(false);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4">
            <HeartIcon className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading PulmoCareAI...</p>
          <p className="text-gray-500 text-sm mt-2">Verifying medical credentials</p>
        </motion.div>
      </div>
    );
  }

  // Show authentication error with retry options (only if persistent)
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-xl p-8 shadow-xl border border-yellow-200">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Issue</h2>
            <p className="text-gray-600 mb-6">
              We're having trouble connecting to the server. This might be due to a network issue or the server being temporarily unavailable.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout & Start Fresh
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user account is active
  if (user && !user.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-xl p-8 shadow-xl border border-red-200">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HeartIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Deactivated</h2>
            <p className="text-gray-600 mb-6">
              Your medical staff account has been deactivated. Please contact your system administrator for assistance.
            </p>
            <button
              onClick={() => {
                logout();
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;