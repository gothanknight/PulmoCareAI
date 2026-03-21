import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    medical_history: ''
  });

  // Load patients on component mount
  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const createNewPatient = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients', newPatient);
      setPatients([...patients, response.data]);
      setSelectedPatient(response.data.id.toString());
      setShowNewPatientForm(false);
      setNewPatient({ name: '', age: '', gender: '', medical_history: '' });
      toast.success('Patient created successfully!');
    } catch (error) {
      toast.error('Error creating patient');
      console.error('Error creating patient:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        toast.error('File size must be less than 16MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setSelectedFile(file);
      toast.success('CT scan uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.dcm']
    },
    multiple: false
  });

  const analyzeImage = async () => {
    if (!selectedFile || !selectedPatient) {
      toast.error('Please select both a CT scan and a patient');
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('patient_id', selectedPatient);

    try {
      const response = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysisResult(response.data);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      toast.error('Error during analysis. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setSelectedPatient('');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGHLY SUSPICIOUS':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'SUSPICIOUS':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CONCERNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Lung Cancer Analysis
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            Upload a CT scan to get instant AI-powered analysis with detailed Grad-CAM visualization 
            showing exactly where suspicious regions are located.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Patient Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Patient Selection */}
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="medical-input"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age}, {patient.gender})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowNewPatientForm(!showNewPatientForm)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Add New Patient
                </button>

                {showNewPatientForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t pt-4 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                        className="medical-input text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                        className="medical-input text-sm"
                      />
                    </div>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="medical-input text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <textarea
                      placeholder="Medical History (optional)"
                      value={newPatient.medical_history}
                      onChange={(e) => setNewPatient({...newPatient, medical_history: e.target.value})}
                      className="medical-input text-sm"
                      rows="2"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={createNewPatient}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Create Patient
                      </button>
                      <button
                        onClick={() => setShowNewPatientForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2 text-blue-600" />
                CT Scan Upload
              </h3>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input {...getInputProps()} />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-green-700 font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 font-medium">
                        {isDragActive ? 'Drop the CT scan here' : 'Upload CT Scan'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag & drop or click to select (PNG, JPG, DICOM)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="CT Scan Preview"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Analysis Button */}
            <button
              onClick={analyzeImage}
              disabled={!selectedFile || !selectedPatient || isAnalyzing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                !selectedFile || !selectedPatient || isAnalyzing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'medical-button'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-5 w-5" />
                  <span>Analyze CT Scan</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {analysisResult ? (
              <>
                {/* Main Result */}
                <div className="medical-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analysis Result
                    </h3>
                    <button
                      onClick={resetAnalysis}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      New Analysis
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    {analysisResult.result === 'cancerous' ? (
                      <div className="space-y-3">
                        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">Cancer Detected</p>
                          <p className="text-red-500">
                            Confidence: {(analysisResult.cancer_probability * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">No Cancer Detected</p>
                          <p className="text-green-500">
                            Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {analysisResult.result === 'cancerous' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 font-medium">Immediate Medical Attention Required</p>
                          <p className="text-red-700 text-sm mt-1">
                            Please consult with an oncologist immediately for further evaluation and treatment planning.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grad-CAM Visualization */}
                {analysisResult.gradcam_image && (
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Grad-CAM Visualization
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <img
                        src={`data:image/png;base64,${analysisResult.gradcam_image}`}
                        alt="Grad-CAM Analysis"
                        className="w-full rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Red/yellow regions indicate areas of high AI attention that contributed to the diagnosis.
                    </p>
                  </div>
                )}

                {/* Region Analysis */}
                {analysisResult.gradcam_analysis && analysisResult.gradcam_analysis.regions && (
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detailed Region Analysis
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.gradcam_analysis.regions.slice(0, 3).map((region, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${getSeverityColor(region.severity)}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Region {index + 1}</p>
                              <p className="text-sm opacity-75">
                                Position: ({region.x}, {region.y})
                              </p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white">
                              {region.severity}
                            </span>
                          </div>
                          <p className="text-sm">
                            <strong>Activation:</strong> {(region.activation * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm">
                            <strong>Recommendation:</strong> {region.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="medical-card p-12 text-center">
                <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-gray-400">
                  Upload a CT scan and select a patient to begin AI-powered analysis
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;