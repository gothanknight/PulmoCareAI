import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import NeuralNetworkVisualization from '../components/NeuralNetworkVisualization';

const About = () => {
  const features = [
    {
      icon: CpuChipIcon,
      title: 'Advanced Deep Learning',
      description: 'Powered by ResNet50 architecture with Focal Loss training for superior accuracy in lung cancer detection.'
    },
    {
      icon: ChartBarIcon,
      title: 'Grad-CAM Visualization',
      description: 'Interactive heatmaps that show exactly where the AI detected suspicious regions in CT scans.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Medical Grade Security',
      description: 'HIPAA compliant data handling with enterprise-grade security protocols for patient privacy.'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Analysis',
      description: 'Get results in seconds, not hours. Fast processing enables immediate clinical decision-making.'
    },
    {
      icon: UserGroupIcon,
      title: 'Patient Management',
      description: 'Comprehensive patient records with history tracking and prediction management system.'
    },
    {
      icon: LightBulbIcon,
      title: 'AI Insights',
      description: 'Detailed analysis reports with confidence scores and region-specific recommendations.'
    }
  ];

  const specifications = [
    { label: 'Model Architecture', value: 'ResNet50 + Focal Loss' },
    { label: 'Training Dataset', value: '999 CT Scans' },
    { label: 'Validation Accuracy', value: '86.9%' },
    { label: 'ROC AUC Score', value: '0.9956' },
    { label: 'Analysis Time', value: '<2 seconds' },
    { label: 'Input Resolution', value: '224×224 pixels' },
    { label: 'Training Epochs', value: '20 epochs' },
    { label: 'Class Balance', value: 'Focal Loss Optimized' }
  ];

  const advantages = [
    'Early detection saves lives and improves treatment outcomes',
    'Reduces diagnostic time by 90% compared to traditional methods',
    'Assists radiologists with AI-powered insights and recommendations',
    'Provides detailed region analysis with interactive visualizations',
    'Tracks patient progress and history over time',
    'Generates comprehensive medical reports for documentation',
    'Available 24/7 for emergency and routine screenings',
    'Continuously learning and improving with new data'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="medical-gradient p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <HeartIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">About PulmoCareAI</h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Revolutionary lung cancer detection system powered by state-of-the-art deep learning technology. 
            Our AI model combines the power of ResNet50 architecture with Focal Loss training to deliver 
            unparalleled accuracy and speed in medical diagnosis.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="medical-card p-6 mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            To democratize access to advanced lung cancer detection technology, enabling early diagnosis 
            and improving patient outcomes worldwide. We believe that cutting-edge AI should be accessible 
            to every medical professional, regardless of location or resources.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Advanced Features & Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="medical-card p-6 text-center hover:transform hover:scale-105"
                >
                  <div className="medical-gradient p-2 rounded-full w-11 h-11 mx-auto mb-3 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="medical-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <CpuChipIcon className="h-6 w-6 mr-2 text-blue-600" />
              Technical Specifications
            </h2>
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">{spec.label}</span>
                  <span className="text-gray-900 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="medical-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-3 text-green-600" />
              Performance Metrics
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Validation Accuracy</span>
                  <span className="font-semibold text-green-600">86.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '86.9%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">ROC AUC Score</span>
                  <span className="font-semibold text-blue-600">99.56%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '99.56%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Processing Speed</span>
                  <span className="font-semibold text-purple-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '98%'}}></div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Performance metrics are based on validation dataset of 160 CT scans 
                  with balanced class distribution and rigorous testing protocols.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Choose PulmoCareAI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-base text-gray-700 leading-relaxed">{advantage}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Neural Network Architecture Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16 py-8"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Interactive Model Architecture Visualization
            </h2>
            <p className="text-base text-gray-600 text-center mb-6 max-w-4xl mx-auto">
              Explore our ResNet50 + Focal Loss neural network architecture. This interactive visualization 
              shows exactly how your AI processes lung CT scans to detect cancer with 86.87% accuracy and 99.56% AUC score.
            </p>
            
            {/* Full-screen viewing message */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                If you can't see the proper neural network design, 
                <Link 
                  to="/neural-network" 
                  className="text-blue-600 hover:text-blue-800 font-semibold underline ml-2"
                >
                  click here to view in full screen
                </Link>
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl overflow-x-auto">
              <div className="min-w-[1500px]">
                <NeuralNetworkVisualization />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="medical-card p-6 mb-10"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-blue-100 p-4 rounded-lg mb-3">
                <CpuChipIcon className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Deep Learning</h3>
              <p className="text-base text-gray-600">TensorFlow & Keras</p>
            </div>
            <div>
              <div className="bg-green-100 p-4 rounded-lg mb-3">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Backend</h3>
              <p className="text-base text-gray-600">Python Flask</p>
            </div>
            <div>
              <div className="bg-purple-100 p-4 rounded-lg mb-3">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
              <p className="text-base text-gray-600">React.js</p>
            </div>
            <div>
              <div className="bg-orange-100 p-4 rounded-lg mb-3">
                <UserGroupIcon className="h-8 w-8 text-orange-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
              <p className="text-base text-gray-600">PostgreSQL</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="medical-gradient text-white rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-3">
            Advanced AI-Powered Lung Cancer Detection
          </h2>
          <p className="text-lg text-blue-100 mb-6 max-w-3xl mx-auto">
            Trusted by medical professionals for accurate, fast, and reliable lung cancer detection. 
            Empowering healthcare providers with cutting-edge AI technology for better patient outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/patients'}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
            >
              Patient Records
            </button>
            <button 
              onClick={() => window.location.href = '/history'}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all duration-200"
            >
              Analysis History
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;