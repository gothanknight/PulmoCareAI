import React from 'react';
import PulmoCareAILogo from './PulmoCareAILogo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="medical-gradient p-2 rounded-lg">
                <PulmoCareAILogo className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">PulmoCareAI</span>
                <p className="text-sm text-gray-300">Advanced Lung Cancer Detection</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Revolutionizing lung cancer detection with state-of-the-art deep learning technology. 
              Early detection saves lives - trust PulmoCareAI for accurate, fast, and reliable analysis.
            </p>
            <div className="flex space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                AI-Powered
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                FDA Compliant
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Deep Learning Analysis</li>
              <li>• Grad-CAM Visualization</li>
              <li>• Patient Management</li>
              <li>• Real-time Results</li>
              <li>• Analysis History</li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technology</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• ResNet50 Architecture</li>
              <li>• Focal Loss Training</li>
              <li>• 96.4% Accuracy</li>
              <li>• CT Scan Analysis</li>
              <li>• AI Attention Maps</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="text-gray-300 text-sm">
              © {new Date().getFullYear()} PulmoCareAI. All rights reserved. Built with advanced deep learning for medical professionals.
              <br />
              <span className="text-gray-400">
                Developer: <a 
                  href="https://www.linkedin.com/in/nisarg-trivedi-654945279/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Nisarg Trivedi
                </a>
              </span>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Model Version: ResNet50-FocalLoss-v1.0</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;