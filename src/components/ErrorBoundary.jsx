import React from 'react';
import { useAuth } from '../contexts/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the error for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: true 
    });
    
    // Force a page reload to clear any corrupted state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  handleLogout = () => {
    this.props.onLogout();
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-red-200 p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. This might be due to a network issue or corrupted session data.
              </p>

              {this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-700 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRecovering}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {this.state.isRecovering ? 'Recovering...' : 'Try Again'}
                </button>
                
                <button
                  onClick={this.handleLogout}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout & Start Fresh
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>If the problem persists, try:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refreshing the page</li>
                  <li>Clearing your browser cache</li>
                  <li>Checking your internet connection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide auth context to ErrorBoundary
export const ErrorBoundaryWrapper = ({ children }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigate to login page using window.location instead of useNavigate
    window.location.href = '/login';
  };

  return (
    <ErrorBoundary onLogout={handleLogout}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary; 