import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientPredictions, setPatientPredictions] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    medical_history: ''
  });
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const patientsCacheRef = useRef(null);
  const cacheTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Check if we have cached data and it's recent (less than 30 seconds old)
        if (patientsCacheRef.current && (Date.now() - patientsCacheRef.current.timestamp) < 30000) {
          setPatients(patientsCacheRef.current.data);
          setError(null);
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/patients');
        
        // Cache the data
        patientsCacheRef.current = {
          data: response.data,
          timestamp: Date.now()
        };
        
        setPatients(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const loadPatients = async () => {
    if (isLoadingPatients) return; // Prevent duplicate calls
    
    try {
      setIsLoadingPatients(true);
      const response = await axios.get('http://localhost:5000/api/patients');
      
      // Update cache
      patientsCacheRef.current = {
        data: response.data,
        timestamp: Date.now()
      };
      
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadPatientPredictions = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/predictions/${patientId}`);
      setPatientPredictions(response.data);
    } catch (error) {
      console.error('Error loading patient predictions:', error);
      setPatientPredictions([]);
    }
  };

  const createPatient = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients', newPatient);
      setPatients([...patients, response.data]);
      
      // Update cache
      if (patientsCacheRef.current) {
        patientsCacheRef.current.data = [...patients, response.data];
        patientsCacheRef.current.timestamp = Date.now();
      }
      
      setNewPatient({ name: '', age: '', gender: '', medical_history: '' });
      setShowAddModal(false);
      toast.success('Patient created successfully!');
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Failed to create patient');
    }
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    loadPatientPredictions(patient.id);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const getResultIcon = (result) => {
    return result === 'cancerous' ? (
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
    ) : (
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    );
  };

  const getResultColor = (result) => {
    return result === 'cancerous' ? 'text-red-600' : 'text-green-600';
  };

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600 mt-1">
              Manage patient records and view analysis history
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="medical-button flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Patient</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="medical-card p-6"
            >
              {/* Search */}
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-4">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedPatient?.id === patient.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => viewPatientDetails(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                            <p className="text-gray-500 text-sm">
                              ID: {patient.id} • Age: {patient.age} • {patient.gender}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Registered: {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <ChartBarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {patient.prediction_count || 0} scans
                            </span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      {searchTerm ? 'No patients found' : 'No patients yet'}
                    </h3>
                    <p className="text-gray-400">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Add your first patient to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="medical-card p-6 sticky top-8"
            >
              {selectedPatient ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-2xl">
                        {selectedPatient.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-gray-500">Patient ID: {selectedPatient.id}</p>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Age & Gender</p>
                        <p className="font-medium">{selectedPatient.age} years, {selectedPatient.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Registered</p>
                        <p className="font-medium">
                          {new Date(selectedPatient.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total Scans</p>
                        <p className="font-medium">{selectedPatient.prediction_count || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  {selectedPatient.medical_history && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {selectedPatient.medical_history}
                      </p>
                    </div>
                  )}

                  {/* Recent Predictions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                      Recent Analysis
                    </h4>
                    {patientPredictions.length > 0 ? (
                      <div className="space-y-3">
                        {patientPredictions.slice(0, 3).map((prediction) => (
                          <div key={prediction.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getResultIcon(prediction.result)}
                                <span className={`font-medium text-sm ${getResultColor(prediction.result)}`}>
                                  {prediction.result === 'cancerous' ? 'Cancer Detected' : 'No Cancer'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(prediction.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Confidence: {(prediction.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))}
                        {patientPredictions.length > 3 && (
                          <p className="text-center text-sm text-gray-500">
                            +{patientPredictions.length - 3} more analyses
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No analyses yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Select a Patient
                  </h3>
                  <p className="text-gray-400">
                    Choose a patient from the list to view their details and analysis history
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Patient</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    className="medical-input"
                    placeholder="Enter patient's full name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                      className="medical-input"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="medical-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    value={newPatient.medical_history}
                    onChange={(e) => setNewPatient({...newPatient, medical_history: e.target.value})}
                    className="medical-input"
                    rows="3"
                    placeholder="Enter relevant medical history (optional)"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createPatient}
                  disabled={!newPatient.name || !newPatient.age || !newPatient.gender}
                  className="flex-1 medical-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Patient
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;