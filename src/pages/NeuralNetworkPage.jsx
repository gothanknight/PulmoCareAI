import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import NeuralNetworkVisualization from '../components/NeuralNetworkVisualization';

const NeuralNetworkPage = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="w-full">
        {/* Navigation Links with zero gap */}
        <div className="flex items-center justify-between px-4">
          <Link
            to="/about"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to About
          </Link>
          <button
            onClick={toggleFullscreen}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        {/* Full-Screen Neural Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center p-6"
        >
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-4 shadow-xl">
            <NeuralNetworkVisualization />
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 px-4"
        >
          <div className="bg-white rounded-lg p-4 shadow-lg">
        
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            How to Interact with the Neural Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hover</h3>
              <p className="text-gray-600">
                Hover over any neuron to see detailed information about its activation level, 
                layer type, and function in the network.
              </p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Click</h3>
              <p className="text-gray-600">
                Click on neurons to trigger activation waves and see how information 
                flows through the network layers.
              </p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👁️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Watch</h3>
              <p className="text-gray-600">
                Observe the automatic activation patterns that demonstrate how the AI 
                processes CT scan images for cancer detection.
              </p>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 px-4"
        >
          <div className="bg-white rounded-lg p-4 shadow-lg">
        
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Architecture Details
          </h2>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
             <div>
               <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center lg:text-left">Model Specifications</h3>
               <ul className="space-y-3 text-lg text-gray-700 text-left">
                 <li><strong>Base Architecture:</strong> ResNet50 (Residual Neural Network)</li>
                 <li><strong>Loss Function:</strong> Focal Loss with class weighting (8:1)</li>
                 <li><strong>Input Resolution:</strong> 224×224×3 (RGB CT Scans)</li>
                 <li><strong>Output Classes:</strong> Cancerous vs Non-cancerous</li>
                 <li><strong>Total Parameters:</strong> ~25.6 million trainable parameters</li>
                 <li><strong>Training Data:</strong> Balanced dataset with data augmentation</li>
               </ul>
             </div>
                           <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Performance Metrics</h3>
                                 <ul className="space-y-3 text-lg text-gray-700 text-center lg:text-left lg:ml-16">
                  <li><strong>Overall Accuracy:</strong> 86.87%</li>
                  <li><strong>AUC Score:</strong> 99.56%</li>
                  <li><strong>Average Analysis Time:</strong> 2.3 seconds</li>
                  <li><strong>Sensitivity:</strong> High cancer detection rate</li>
                  <li><strong>Specificity:</strong> Low false positive rate</li>
                  <li><strong>Validation Dataset:</strong> 160 CT scans with balanced classes</li>
                </ul>
              </div>
           </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NeuralNetworkPage;