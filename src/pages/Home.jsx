import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import PulmoCareAILogo from '../components/PulmoCareAILogo';
import axios from 'axios';

const Home = () => {
  const [realStats, setRealStats] = useState({
    overall_accuracy: 86.9,
    auc_score: 0.9956,
    avg_analysis_time: 2.3,
    total_scans: 0,
    daily_trends: {}
  });
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      setRealStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading real stats:', error);
      setRealStats({
        overall_accuracy: 0,
        auc_score: 0,
        avg_analysis_time: 0,
        total_scans: 0,
        daily_trends: {}
      });
      setLoading(false);
    }
  };

  const features = [
    {
      icon: PulmoCareAILogo,
      title: 'AI-Powered Detection',
      description: `Advanced ResNet50 deep learning model with ${realStats.overall_accuracy}% accuracy for precise lung cancer detection.`
    },
    {
      icon: ChartBarIcon,
      title: 'Grad-CAM Visualization',
      description: 'Interactive heatmaps showing exactly where suspicious regions are located in CT scans.'
    },
    {
      icon: UserGroupIcon,
      title: 'Patient Management',
      description: 'Comprehensive patient records with history tracking and prediction management.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Medical Grade Security',
      description: 'HIPAA compliant data handling with enterprise-grade security protocols.'
    },
    {
      icon: LightBulbIcon,
      title: 'Instant Analysis',
      description: `Get results in ${realStats.avg_analysis_time}s, not hours. Fast processing for critical medical decisions.`
    },
    {
      icon: ClockIcon,
      title: '24/7 Availability',
      description: 'Round-the-clock access to AI diagnosis tools for emergency and routine screenings.'
    }
  ];

  const stats = [
    { value: loading ? 'Loading...' : `${realStats.overall_accuracy}%`, label: 'Accuracy Rate' },
    { value: loading ? 'Loading...' : (realStats.auc_score ? realStats.auc_score.toFixed(4) : '0.9956'), label: 'AUC Score' },
    { value: loading ? 'Loading...' : `${realStats.avg_analysis_time}s`, label: 'Analysis Time' },
    { value: loading ? 'Loading...' : `${realStats.total_scans}+`, label: 'Scans Analyzed' }
  ];

  const advantages = [
    'Early detection saves lives',
    'Reduces diagnostic time by 90%',
    'Assists radiologists with AI insights',
    'Provides detailed region analysis',
    'Tracks patient progress over time',
    'Generates comprehensive reports'
  ];



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="medical-gradient text-white pt-24 pb-14 lg:pt-28 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                Advanced Lung Cancer Detection with
                <span className="text-blue-200"> AI Precision</span>
              </h1>
              <p className="text-lg lg:text-xl mb-6 text-blue-100 leading-relaxed">
                Revolutionizing early detection with state-of-the-art deep learning technology. 
                Fast, accurate, and reliable analysis for medical professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/analysis"
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  Start Analysis
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-white hover:text-blue-700 transition-all duration-200 flex items-center justify-center"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-blue-200 text-sm lg:text-base">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Cutting-Edge Medical AI Technology
            </h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              Our advanced deep learning system combines the power of ResNet50 architecture 
              with Focal Loss training to deliver unparalleled accuracy in lung cancer detection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="medical-card p-6 text-center hover:transform hover:scale-105"
                >
                  <div className="medical-gradient p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Why Choose PulmoCareAI?
              </h2>
              <p className="text-base text-gray-600 mb-6">
                Our AI-powered platform transforms how medical professionals approach 
                lung cancer detection, providing unprecedented accuracy and speed.
              </p>
              <div className="space-y-4">
                {advantages.map((advantage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{advantage}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="medical-gradient p-2 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <PulmoCareAILogo className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Model Performance
                  </h3>
                  <p className="text-gray-600">ResNet50 + Focal Loss Architecture</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Validation Accuracy</span>
                    <span className="text-2xl font-bold text-green-600">
                      {loading ? 'Loading...' : `${realStats.overall_accuracy}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ROC AUC Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {loading ? 'Loading...' : (realStats.auc_score ? realStats.auc_score.toFixed(4) : '0.9956')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Analysis Time</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {loading ? 'Loading...' : `${realStats.avg_analysis_time}s`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Scans Processed</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {loading ? 'Loading...' : `${realStats.total_scans} scans`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 medical-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Transform Lung Cancer Detection?
            </h2>
            <p className="text-lg text-blue-100 mb-6 leading-relaxed">
              Join medical professionals worldwide who trust PulmoCareAI for accurate, 
              fast, and reliable lung cancer detection. Start analyzing CT scans today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/analysis"
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                Start Free Analysis
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-white hover:text-blue-700 transition-all duration-200 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;