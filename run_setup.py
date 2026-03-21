#!/usr/bin/env python3
"""
Complete setup script for PulmoCareAI
This script sets up the entire application environment
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def run_command(command, description, check=True):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        return False

def check_prerequisites():
    """Check if all prerequisites are installed"""
    print_header("CHECKING PREREQUISITES")
    
    prerequisites = [
        ("python", "Python 3.8+"),
        ("node", "Node.js 16+"),
        ("npm", "NPM"),
        ("psql", "PostgreSQL")
    ]
    
    missing = []
    for cmd, name in prerequisites:
        if not run_command(f"which {cmd}", f"Checking {name}", check=False):
            missing.append(name)
    
    if missing:
        print(f"\n❌ Missing prerequisites: {', '.join(missing)}")
        print("Please install the missing software and run this script again.")
        return False
    
    print("\n✅ All prerequisites are installed!")
    return True

def setup_backend():
    """Setup Python backend"""
    print_header("SETTING UP PYTHON BACKEND")
    
    # Create virtual environment
    if not os.path.exists('venv'):
        if not run_command("python -m venv venv", "Creating virtual environment"):
            return False
    
    # Activate virtual environment and install dependencies
    if sys.platform.startswith('win'):
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    return True

def setup_frontend():
    """Setup React frontend"""
    print_header("SETTING UP REACT FRONTEND")
    
    if not run_command("npm install", "Installing Node.js dependencies"):
        return False
    
    return True

def setup_database():
    """Setup PostgreSQL database"""
    print_header("SETTING UP DATABASE")
    
    print("⚠️  Database setup requires manual configuration:")
    print("1. Ensure PostgreSQL is running")
    print("2. Create a database user with appropriate permissions")
    print("3. Update the database connection string in app.py")
    print("4. Run: python database_setup.py")
    
    response = input("\nHave you completed the database setup? (y/n): ")
    return response.lower() == 'y'

def check_model_files():
    """Check if model files are present"""
    print_header("CHECKING MODEL FILES")
    
    model_dir = Path("PulmoCareAI Deep Learning Project")
    required_files = [
        "PulmoCareAI_FocalLoss_Final.h5",
        "lung_cancer_model_metadata.json"
    ]
    
    missing_files = []
    for file in required_files:
        file_path = model_dir / file
        if not file_path.exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing model files: {', '.join(missing_files)}")
        print(f"Please place the model files in the '{model_dir}' directory")
        return False
    
    print("✅ All model files are present!")
    return True

def create_env_file():
    """Create environment configuration file"""
    print_header("CREATING ENVIRONMENT CONFIGURATION")
    
    env_content = """# PulmoCareAI Environment Configuration
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/pulmocare_db
DEV_DATABASE_URL=postgresql://username:password@localhost/pulmocare_dev

# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# React Configuration
REACT_APP_API_URL=http://localhost:5000
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Environment file created (.env)")
    print("⚠️  Please update the database credentials in .env file")
    return True

def create_startup_scripts():
    """Create startup scripts for easy development"""
    print_header("CREATING STARTUP SCRIPTS")
    
    # Backend startup script
    if sys.platform.startswith('win'):
        backend_script = """@echo off
echo Starting PulmoCareAI Backend...
call venv\\Scripts\\activate
python app.py
"""
        with open('start_backend.bat', 'w') as f:
            f.write(backend_script)
        
        frontend_script = """@echo off
echo Starting PulmoCareAI Frontend...
npm start
"""
        with open('start_frontend.bat', 'w') as f:
            f.write(frontend_script)
        
        print("✅ Created startup scripts: start_backend.bat, start_frontend.bat")
    else:
        backend_script = """#!/bin/bash
echo "Starting PulmoCareAI Backend..."
source venv/bin/activate
python app.py
"""
        with open('start_backend.sh', 'w') as f:
            f.write(backend_script)
        os.chmod('start_backend.sh', 0o755)
        
        frontend_script = """#!/bin/bash
echo "Starting PulmoCareAI Frontend..."
npm start
"""
        with open('start_frontend.sh', 'w') as f:
            f.write(frontend_script)
        os.chmod('start_frontend.sh', 0o755)
        
        print("✅ Created startup scripts: start_backend.sh, start_frontend.sh")
    
    return True

def final_instructions():
    """Print final setup instructions"""
    print_header("SETUP COMPLETE!")
    
    print("🎉 PulmoCareAI has been set up successfully!")
    print("\n📋 Next Steps:")
    print("1. Update database credentials in .env file")
    print("2. Run database setup: python database_setup.py")
    print("3. Place your trained model files in 'PulmoCareAI Deep Learning Project' folder")
    print("4. Start the backend server:")
    if sys.platform.startswith('win'):
        print("   - Windows: start_backend.bat")
    else:
        print("   - Linux/Mac: ./start_backend.sh")
    print("5. Start the frontend server (in a new terminal):")
    if sys.platform.startswith('win'):
        print("   - Windows: start_frontend.bat")
    else:
        print("   - Linux/Mac: ./start_frontend.sh")
    print("\n🌐 Access the application at:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend API: http://localhost:5000")
    print("\n📚 Documentation: README.md")
    print("🆘 Support: Create an issue on GitHub")

def main():
    """Main setup function"""
    print("🏥 PulmoCareAI Setup Script")
    print("This script will set up the complete PulmoCareAI environment")
    
    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    # Create environment file
    create_env_file()
    
    # Create startup scripts
    create_startup_scripts()
    
    # Check model files
    check_model_files()
    
    # Setup database (manual step)
    setup_database()
    
    # Final instructions
    final_instructions()

if __name__ == "__main__":
    main()