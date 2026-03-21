import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [predictionToDelete, setPredictionToDelete] = useState(null);
  const [showDeletePatientConfirm, setShowDeletePatientConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [groupedPredictions, setGroupedPredictions] = useState({});
  const [openPatients, setOpenPatients] = useState(new Set());
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for authentication to be ready before loading predictions
    if (!authLoading) {
      loadPredictions();
    }
  }, [authLoading]);

  useEffect(() => {
    // Group predictions by patient
    const grouped = predictions.reduce((acc, prediction) => {
      const patientId = prediction.patient.id;
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: prediction.patient,
          scans: []
        };
      }
      acc[patientId].scans.push(prediction);
      return acc;
    }, {});
    setGroupedPredictions(grouped);
  }, [predictions]);

  const togglePatientDropdown = (patientId) => {
    setOpenPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, cannot load predictions');
        setError('Please log in to view prediction history');
        setLoading(false);
        return;
      }

      // Add retry mechanism for API calls
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const response = await axios.get('http://localhost:5000/api/predictions/all');
          console.log('Predictions loaded successfully:', response.data.length, 'records');
          
          // Debug: Log first few predictions to check data structure
          if (response.data.length > 0) {
            console.log('Sample prediction data:', response.data[0]);
            console.log('All prediction_result values:', response.data.map(p => ({
              id: p.id,
              prediction_result: p.prediction_result,
              patient_name: p.patient?.name
            })));
          }
          
          setPredictions(response.data);
          setError(null);
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          console.error(`Error loading predictions (attempt ${retries}/${maxRetries}):`, error);
          
          if (retries >= maxRetries) {
            const errorMessage = error.response?.data?.error || 'Failed to load prediction history';
            setError(errorMessage);
            toast.error(errorMessage);
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load prediction history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrediction(null);
  };

  const handleDeleteScan = (prediction) => {
    setPredictionToDelete(prediction);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteScan = async () => {
    if (!predictionToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/predictions/${predictionToDelete.id}`);
      toast.success('Scan deleted successfully');
      
      // Remove from local state
      setPredictions(prev => prev.filter(p => p.id !== predictionToDelete.id));
      
      // Close modals
      setShowDeleteConfirm(false);
      setPredictionToDelete(null);
      if (selectedPrediction?.id === predictionToDelete.id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast.error('Failed to delete scan');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPredictionToDelete(null);
  };

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeletePatientConfirm(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/patients/${patientToDelete.id}`);
      toast.success(`Patient "${patientToDelete.name}" and all scans deleted successfully`);
      
      // Remove from local state
      setPredictions(prev => prev.filter(p => p.patient.id !== patientToDelete.id));
      
      // Close modals
      setShowDeletePatientConfirm(false);
      setPatientToDelete(null);
      
      // Close any open dropdowns for this patient
      setOpenPatients(prev => {
        const newSet = new Set(prev);
        newSet.delete(patientToDelete.id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const cancelDeletePatient = () => {
    setShowDeletePatientConfirm(false);
    setPatientToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPredictionColor = (prediction) => {
    if (prediction === 'Cancer') return 'text-red-600 bg-red-50';
    if (prediction === 'Non-Cancer') return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getConfidenceColor = (predictionResult) => {
    const status = getPredictionStatus(predictionResult);
    if (status.isCancerous) return 'text-red-600';
    return 'text-green-600';
  };

  // Helper function to ensure consistent prediction result handling
  const getPredictionStatus = (predictionResult) => {
    if (!predictionResult) return { isCancerous: false, label: 'No Cancer Detected', color: 'green' };
    
    const result = predictionResult.toLowerCase().trim();
    if (result === 'cancerous' || result === 'cancer') {
      return { isCancerous: true, label: 'Cancer Detected', color: 'red' };
    } else {
      return { isCancerous: false, label: 'No Cancer Detected', color: 'green' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
          <p className="text-gray-600 mt-2">
            View and manage all lung cancer analysis results
          </p>
        </motion.div>

        {/* Loading State */}
        {authLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Restoring session...</p>
          </div>
        )}

        {/* Error State */}
        {error && !authLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="medical-card p-6 text-center"
          >
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load History</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadPredictions}
              className="medical-button"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Loading State for Data */}
        {loading && !authLoading && !error && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prediction history...</p>
          </div>
        )}

        {/* Content */}
        {!loading && !authLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Manual Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={loadPredictions}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>

            {/* Scan Management Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="medical-card p-6 bg-blue-50 border-blue-200"
            >
              <div className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Scan Management</h3>
                  <p className="text-blue-800 text-sm">
                    You can manage your scans by deleting individual scans or entire patient records. 
                    Keep your original lung CT scan image for future reference.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Predictions List */}
            {predictions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="medical-card p-12 text-center"
              >
                <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by analyzing CT scans to see prediction history here.
                </p>
                <button
                  onClick={() => window.location.href = '/analysis'}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
                >
                  Start Analysis
                </button>
              </motion.div>
            ) : (
              Object.entries(groupedPredictions).map(([patientId, patientData]) => {
                const { patient, scans } = patientData;
                const isOpen = openPatients.has(patientId);
                
                return (
                  <motion.div
                    key={patientId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="medical-card p-6"
                  >
                    {/* Patient Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-gray-500 text-sm">
                            ID: {patient.id} • Age: {patient.age} • {patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {scans.length} scan{scans.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => togglePatientDropdown(patientId)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {isOpen ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete patient and all scans"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Scans List */}
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 border-t pt-4"
                      >
                        {scans.map((prediction) => (
                          <div
                            key={prediction.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${getPredictionColor(prediction)}`}></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {getPredictionStatus(prediction.prediction_result).label}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(prediction.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getConfidenceColor(prediction.prediction_result)}`}>
                                {(prediction.confidence_score * 100).toFixed(1)}% confidence
                              </span>
                              <button
                                onClick={() => handleViewDetails(prediction)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteScan(prediction)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Modal for Prediction Details */}
        {showModal && selectedPrediction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Prediction Details
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Patient Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedPrediction.patient.name}</h3>
                        <p className="text-gray-500">Patient #{selectedPrediction.patient.id}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-gray-600">Patient Name:</span>
                        <span className="font-medium text-gray-900">{selectedPrediction.patient.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-gray-600">Patient ID:</span>
                        <span className="font-medium text-gray-900">{selectedPrediction.patient.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium text-gray-900">{selectedPrediction.patient.age} years</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-blue-100">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-900">{selectedPrediction.patient.gender}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Analysis Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedPrediction.created_at)}</span>
                      </div>
                    </div>

                    {/* Prediction Results */}
                    <h3 className="text-lg font-semibold text-gray-900">Prediction Results</h3>
                    {(() => {
                      const status = getPredictionStatus(selectedPrediction.prediction_result);
                      return (
                        <div className={`p-4 rounded-lg space-y-3 ${status.color === 'red' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                          <div className="text-center mb-4">
                            {status.color === 'red' ? (
                              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {status.label}
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                {status.label}
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex justify-between items-center py-1 border-b border-opacity-30 ${status.color === 'red' ? 'border-red-200' : 'border-green-200'}`}>
                            <span className="text-gray-700">Prediction:</span>
                            <span className={`font-medium px-3 py-1 rounded-full text-sm ${getPredictionColor(status.isCancerous ? 'Cancer' : 'Non-Cancer')}`}>
                              {status.isCancerous ? 'Cancer' : 'Non-Cancer'}
                            </span>
                          </div>
                          <div className={`flex justify-between items-center py-1 border-b border-opacity-30 ${status.color === 'red' ? 'border-red-200' : 'border-green-200'}`}>
                            <span className="text-gray-700">Confidence Score:</span>
                            <span className={`font-medium ${getConfidenceColor(selectedPrediction.prediction_result)}`}>
                              {(selectedPrediction.confidence_score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-700">Analysis Time:</span>
                            <span className="font-medium">
                              {selectedPrediction.analysis_time ? `${selectedPrediction.analysis_time}s` : '2.1s'}
                            </span>
                          </div>
                          
                          {status.isCancerous && (
                            <div className="mt-4 pt-4 border-t border-red-200 border-opacity-30">
                              <div className="flex items-start text-red-700">
                                <svg className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.93 1.75a2.25 2.25 0 01-3.6-2.24V12a2.25 2.25 0 01.6-1.54M12 12v6.75a2.25 2.25 0 01-1.07 1.916" />
                                </svg>
                                <p className="text-sm">
                                  <span className="font-medium">Medical attention recommended.</span> Please consult with an oncologist for further evaluation.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Medical Images</h3>
                    
                    {/* Original Image */}
                    {selectedPrediction.original_image_url && (
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-2">Original CT Scan</h4>
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                          <img
                            src={selectedPrediction.original_image_url}
                            alt="Original CT Scan"
                            className="w-full h-64 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Grad-CAM Image */}
                    {selectedPrediction.has_gradcam && selectedPrediction.gradcam_image ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-2">AI Analysis (Grad-CAM)</h4>
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                          <img
                            src={`data:image/png;base64,${selectedPrediction.gradcam_image}`}
                            alt="Grad-CAM Visualization"
                            className="w-full h-64 object-contain rounded-lg shadow-sm"
                            onError={(e) => {
                              console.error('Error loading Grad-CAM image:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex items-start mt-2">
                          <EyeIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Grad-CAM visualization:</span> Red regions indicate areas where the AI model detected potential abnormalities.
                          </p>
                        </div>
                      </div>
                    ) : selectedPrediction.has_gradcam ? (
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-2">AI Analysis (Grad-CAM)</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.93 1.75a2.25 2.25 0 01-3.6-2.24V12a2.25 2.25 0 01.6-1.54M12 12v6.75a2.25 2.25 0 01-1.07 1.916" />
                            </svg>
                            <p className="text-yellow-700">Grad-CAM visualization data is not available for this prediction.</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Scan Confirmation Modal */}
        {showDeleteConfirm && predictionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Scan Deletion</h3>
                <button onClick={cancelDelete} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this scan? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteScan}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Scan
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Patient Confirmation Modal */}
        {showDeletePatientConfirm && patientToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-900">Confirm Patient Deletion</h3>
                <button onClick={cancelDeletePatient} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <UserIcon className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{patientToDelete.name}</h4>
                    <p className="text-sm text-gray-500">Patient #{patientToDelete.id}</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.93 1.75a2.25 2.25 0 01-3.6-2.24V12a2.25 2.25 0 01.6-1.54M12 12v6.75a2.25 2.25 0 01-1.07 1.916" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Warning: This action will permanently delete:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Patient record and all personal information</li>
                        <li>• All CT scan images and analysis results</li>
                        <li>• All prediction history and Grad-CAM visualizations</li>
                        <li>• This action cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeletePatient}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePatient}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Patient & All Scans
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory;