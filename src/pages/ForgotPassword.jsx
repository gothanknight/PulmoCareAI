import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,

  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import PulmoCareAILogo from '../components/PulmoCareAILogo';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.trim()
      });

      setSuccess(true);

    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-3"
          >
            <PulmoCareAILogo className="h-6 w-6 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
          <div className="flex items-center justify-center mt-2 space-x-2 text-xs text-blue-600">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Secure • Professional • HIPAA Compliant</span>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white py-5 px-5 shadow-xl rounded-xl border border-gray-100"
        >
          {!success ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <EnvelopeIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Password Reset Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Enter the email address associated with your medical staff account</li>
                      <li>Check your email for a secure reset link</li>
                      <li>The link will expire in 1 hour for security</li>
                      <li>Contact IT support if you don't receive the email</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <EnvelopeIcon className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                  )}
                </span>
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </motion.button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Reset Link Sent!
                </h3>
                <p className="text-gray-600">
                  If your email is registered with PulmoCareAI, you will receive a password reset link shortly.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ClockIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Next Steps:</p>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the secure reset link in the email</li>
                      <li>Create a new strong password</li>
                      <li>The link expires in 1 hour for security</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Development Token Display */}
              {/* The resetToken state and display are removed as per the edit hint. */}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Send Another Reset Link
                </button>
                
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center space-x-2 w-full text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 space-y-1"
        >
          <p>🔒 Password reset links are secure and expire automatically</p>
          <p>⚕️ For authorized medical personnel only</p>
          <p>📧 Contact IT support if you don't receive the email</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;