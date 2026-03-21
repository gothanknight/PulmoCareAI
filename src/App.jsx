import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Analysis from './pages/Analysis';
import PredictionHistory from './pages/PredictionHistory';
import MedicalStatistics from './pages/MedicalStatistics';
import About from './pages/About';
import NeuralNetworkPage from './pages/NeuralNetworkPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundaryWrapper } from './components/ErrorBoundary';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundaryWrapper>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <NetworkStatusIndicator />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Home />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Dashboard />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/patients" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Patients />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Analysis />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <PredictionHistory />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/medical-statistics" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <MedicalStatistics />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <About />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/neural-network" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <NeuralNetworkPage />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="pt-16">
                    <Profile />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ErrorBoundaryWrapper>
    </AuthProvider>
  );
}

export default App;