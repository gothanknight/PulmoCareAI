#!/usr/bin/env python3
"""
Presentation Setup Script for PulmoCareAI
This script prepares the system for presentation mode by:
1. Starting the backend server
2. Setting up demo data
3. Providing presentation instructions
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_banner():
    print("=" * 60)
    print("🎯 PULMOCAREAI PRESENTATION SETUP")
    print("=" * 60)
    print()

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    try:
        import flask
        print("✅ Flask is installed")
    except ImportError:
        print("❌ Flask not found. Install with: pip install flask")
        return False
    
    try:
        import flask_sqlalchemy
        print("✅ Flask-SQLAlchemy is installed")
    except ImportError:
        print("❌ Flask-SQLAlchemy not found. Install with: pip install flask-sqlalchemy")
        return False
    
    try:
        import flask_cors
        print("✅ Flask-CORS is installed")
    except ImportError:
        print("❌ Flask-CORS not found. Install with: pip install flask-cors")
        return False
    
    return True

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting backend server...")
    
    try:
        # Start the Flask app
        process = subprocess.Popen([
            sys.executable, "app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if server is running
        import requests
        try:
            response = requests.get("http://localhost:5000/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is running on http://localhost:5000")
                return True
        except:
            pass
        
        print("⚠️ Backend server may not be fully started. Check manually.")
        return True
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def start_frontend():
    """Start the React frontend"""
    print("🌐 Starting frontend...")
    
    try:
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print("📦 Installing dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        # Start React development server
        print("🚀 Starting React development server...")
        subprocess.Popen([
            "npm", "start"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        time.sleep(5)
        
        # Try to open browser
        try:
            webbrowser.open("http://localhost:3000")
            print("✅ Frontend should open in your browser")
        except:
            print("🌐 Frontend should be available at http://localhost:3000")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return False

def print_presentation_instructions():
    """Print presentation instructions"""
    print("\n" + "=" * 60)
    print("📋 PRESENTATION INSTRUCTIONS")
    print("=" * 60)
    print()
    print("🎯 DEMO MODE SETUP:")
    print("1. Open the application in your browser")
    print("2. Click the '🔗 Live Mode' button in the bottom-right corner")
    print("3. It will switch to '🎯 Demo Mode' and reload the page")
    print("4. Now all data will be demo data for reliable presentation")
    print()
    print("📊 DEMO FEATURES:")
    print("• Dashboard: Shows demo statistics and charts")
    print("• Patients: Displays sample patient data")
    print("• Analysis: Can upload CT scans for demo predictions")
    print("• History: Shows demo prediction history with Grad-CAM")
    print("• Statistics: Displays comprehensive medical statistics")
    print("• Neural Network: Interactive ResNet50 visualization")
    print()
    print("🔧 TROUBLESHOOTING:")
    print("• If backend fails: Check if port 5000 is available")
    print("• If frontend fails: Check if port 3000 is available")
    print("• If data doesn't load: Use Demo Mode toggle")
    print("• If authentication fails: Use test account (testdoctor/password123)")
    print()
    print("📱 PRESENTATION TIPS:")
    print("• Keep Demo Mode enabled during presentation")
    print("• Have backup screenshots ready")
    print("• Test all features before presentation")
    print("• Have the test account ready for login")
    print()

def main():
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Please install missing dependencies and try again.")
        return
    
    print()
    
    # Start backend
    if not start_backend():
        print("❌ Failed to start backend. Please check the error above.")
        return
    
    print()
    
    # Start frontend
    if not start_frontend():
        print("❌ Failed to start frontend. Please check the error above.")
        return
    
    print()
    
    # Print instructions
    print_presentation_instructions()
    
    print("🎉 Setup complete! Your PulmoCareAI application should be ready for presentation.")
    print("Press Ctrl+C to stop the servers when done.")

if __name__ == "__main__":
    try:
        main()
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down presentation setup...")
        print("Remember to stop the servers manually if needed.") 