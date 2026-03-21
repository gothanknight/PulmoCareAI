import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const NetworkStatusIndicator = () => {
  const { networkError, retryAuthCheck, logout } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (networkError) {
      // Don't show banner immediately, wait a bit to see if it resolves
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // Wait 3 seconds before showing banner
      
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [networkError]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const success = await retryAuthCheck();
      if (success) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Navigate to login page using window.location instead of useNavigate
    window.location.href = '/login';
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-yellow-800">
                Network connectivity issue detected
              </span>
              <WifiIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 transition-colors"
            >
              Logout
            </button>
            
            <button
              onClick={() => setShowBanner(false)}
              className="inline-flex items-center p-1.5 text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusIndicator; 