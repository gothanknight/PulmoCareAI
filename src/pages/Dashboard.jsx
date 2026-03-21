import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import axios from 'axios';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    cancerDetected: 0,
    nonCancerDetected: 0,
    overallAccuracy: 0,
    aucScore: 0,
    avgAnalysisTime: 0,
    cancerDetectionRate: 0,
    dailyTrends: {},
    recentAnalyses: []
  });
  const [modelInfo, setModelInfo] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    let statsResponse = null;
    let patientsResponse = null;
    let modelResponse = null;
    let healthResponse = null;
    
    try {
      // Load all data in parallel but handle state updates properly
      [statsResponse, patientsResponse, modelResponse, healthResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats').catch(err => ({ data: null, error: err })),
        axios.get('http://localhost:5000/api/patients').catch(err => ({ data: [], error: err })),
        axios.get('http://localhost:5000/api/model/info').catch(err => ({ data: null, error: err })),
        axios.get('http://localhost:5000/api/health').catch(err => ({ data: { status: 'error', model_loaded: false }, error: err }))
      ]);

      // Process dashboard stats
      if (statsResponse.data) {
        const dashboardStats = statsResponse.data;
        setStats({
          totalPatients: dashboardStats.total_patients || 0,
          totalScans: dashboardStats.total_scans || 0,
          cancerDetected: dashboardStats.cancer_detected || 0,
          nonCancerDetected: dashboardStats.non_cancer_detected || 0,
          overallAccuracy: dashboardStats.overall_accuracy || 0,
          aucScore: dashboardStats.auc_score || 0,
          avgAnalysisTime: dashboardStats.avg_analysis_time || 0,
          cancerDetectionRate: dashboardStats.cancer_detection_rate || 0,
          dailyTrends: dashboardStats.daily_trends || {},
          recentAnalyses: (patientsResponse.data || []).slice(0, 5) // Show recent 5 patients
        });
      }

      // Set model info
      if (modelResponse.data) {
        setModelInfo(modelResponse.data);
      }

      // Set system health
      setSystemHealth(healthResponse.data);

      // Small delay to ensure all state updates are complete
      setTimeout(() => {
        setDataReady(true);
      }, 100);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data.');
      
      // No fallback data - only real data or error
      setStats({
        totalPatients: 0,
        totalScans: 0,
        cancerDetected: 0,
        nonCancerDetected: 0,
        overallAccuracy: 0,
        aucScore: 0,
        avgAnalysisTime: 0,
        cancerDetectionRate: 0,
        dailyTrends: {},
        recentAnalyses: []
      });
      
      setModelInfo(null);
      setSystemHealth(null);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations using real data with fallbacks
  const getTrendData = () => {
    if (!stats.dailyTrends || Object.keys(stats.dailyTrends).length === 0) {
      // Provide fallback data to prevent chart errors
      return {
        labels: ['Loading...'],
        datasets: [
          {
            label: 'Scans Analyzed',
            data: [0],
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(37, 99, 235)',
            pointBorderColor: '#fff',
            fill: false,
          },
          {
            label: 'Cancer Detected',
            data: [0],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(239, 68, 68)',
            pointBorderColor: '#fff',
            fill: false,
          },
        ],
      };
    }
    
    const dates = Object.keys(stats.dailyTrends || {}).sort();
    const labels = dates.length > 0 ? dates.slice(-7) : ['No Data']; // Last 7 days
    const scansData = labels.map(date => (stats.dailyTrends && stats.dailyTrends[date]) ? stats.dailyTrends[date].total || 0 : 0);
    const cancerData = labels.map(date => (stats.dailyTrends && stats.dailyTrends[date]) ? stats.dailyTrends[date].cancer || 0 : 0);
    
    return {
      labels: labels.map(date => {
        if (date === 'No Data') return date;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Scans Analyzed',
          data: scansData,
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(37, 99, 235)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Cancer Detected',
          data: cancerData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.4,
        }
      ],
    };
  };

  const getAccuracyData = () => {
    const totalScans = stats.totalScans;
    const cancerDetected = stats.cancerDetected;
    const nonCancerDetected = stats.nonCancerDetected;
    
    if (totalScans === 0) {
      return {
        labels: ['No Data Available'],
        datasets: [{
          data: [100],
          backgroundColor: ['rgba(156, 163, 175, 0.8)'],
          borderColor: ['rgba(156, 163, 175, 1)'],
          borderWidth: 2,
        }],
      };
    }
    
    return {
      labels: ['Cancer Detected', 'Non-Cancer', 'Accuracy Rate'],
      datasets: [
        {
          data: [cancerDetected, nonCancerDetected, stats.overallAccuracy],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(37, 99, 235, 0.8)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(37, 99, 235, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getModelMetrics = () => {
    return {
      labels: ['Overall Accuracy', 'AUC Score', 'Avg Analysis Time', 'Detection Rate'],
      datasets: [
        {
          label: 'Model Performance',
          data: [
            stats.overallAccuracy,
            stats.aucScore * 100, // Convert to percentage
            stats.avgAnalysisTime,
            stats.cancerDetectionRate
          ],
          backgroundColor: 'rgba(37, 99, 235, 0.6)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  // Memoize chart data to prevent unnecessary re-renders and flickering
  const performanceData = useMemo(() => getTrendData(), [stats.dailyTrends]);
  const accuracyData = useMemo(() => getAccuracyData(), [stats.totalScans, stats.cancerDetected, stats.nonCancerDetected, stats.overallAccuracy]);
  const modelMetrics = useMemo(() => getModelMetrics(), [stats.overallAccuracy, stats.aucScore, stats.avgAnalysisTime, stats.cancerDetectionRate]);

  // Memoize chart options to prevent recreation on every render
  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Analysis Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Scans'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
  }), []);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Model Performance Metrics'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Metrics'
        }
      }
    },
  }), []);

  const StatCard = React.memo(({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = useMemo(() => ({
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600'
    }), []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="medical-card p-5"
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  });

  // Show loading screen to prevent blinking
  if (loading || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4">
              <HeartIcon className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">Preparing your medical analytics...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading data...</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto"
          >
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAllData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div key={`dashboard-${dataReady}`} className="min-h-screen bg-gray-50 pt-24 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time insights and analytics for PulmoCareAI system
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {systemHealth?.status === 'healthy' ? 'System Online' : 'System Offline'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatCard
            icon={UserGroupIcon}
            title="Total Patients"
            value={stats.totalPatients}
            subtitle="Registered in system"
            color="blue"
          />
          <StatCard
            icon={ChartBarIcon}
            title="Scans Analyzed"
            value={stats.totalScans}
            subtitle="Total CT scans processed"
            color="green"
          />
          <StatCard
            icon={ExclamationTriangleIcon}
            title="Cancer Detected"
            value={stats.cancerDetected}
            subtitle={`${stats.cancerDetectionRate}% detection rate`}
            color="red"
          />
          <StatCard
            icon={ArrowTrendingUpIcon}
            title="Model Accuracy"
            value={`${stats.overallAccuracy}%`}
            subtitle="Average confidence score"
            color="yellow"
          />
          <StatCard
            icon={ClockIcon}
            title="AUC Score"
            value={stats.aucScore.toFixed(3)}
            subtitle={`${stats.avgAnalysisTime}s analysis time`}
            color="blue"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="medical-card p-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Trends
            </h3>
            <div className="h-80">
              {dataReady && performanceData ? (
                <Line data={performanceData} options={lineChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Model Accuracy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="medical-card p-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prediction Accuracy
            </h3>
            {dataReady && accuracyData ? (
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[280px] h-[280px]">
                  <Doughnut data={accuracyData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Model Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="medical-card p-5 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Model Performance Metrics
          </h3>
          <div className="h-80">
            {dataReady && modelMetrics ? (
              <Bar data={modelMetrics} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </motion.div>

        {/* System Information and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="medical-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-blue-600" />
              System Information
            </h3>
            
            {modelInfo && (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Model Version</span>
                  <span className="font-medium">{modelInfo.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Architecture</span>
                  <span className="font-medium">{modelInfo.model_architecture}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Training Date</span>
                  <span className="font-medium">
                    {new Date(modelInfo.training_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">ROC AUC Score</span>
                  <span className="font-medium text-green-600">{stats.aucScore.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Avg Analysis Time</span>
                  <span className="font-medium">{stats.avgAnalysisTime}s per scan</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Training Samples</span>
                  <span className="font-medium">{modelInfo?.dataset_info?.training_samples || 'N/A'}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="medical-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Recent Patients
            </h3>
            
            <div className="space-y-3">
              {stats.recentAnalyses.length > 0 ? (
                stats.recentAnalyses.map((patient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          Age {patient.age} • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Patients will appear here after analysis</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 medical-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {systemHealth?.model_loaded ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">AI Model</p>
                <p className="text-sm text-gray-500">
                  {systemHealth?.model_loaded ? 'Loaded & Ready' : 'Not Available'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-500">Connected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">API Services</p>
                <p className="text-sm text-gray-500">Operational</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;