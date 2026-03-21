# PulmoCareAI Setup Guide

This comprehensive guide will help you set up PulmoCareAI on your system. Follow the steps carefully for a successful installation.

## 🚀 Quick Start (Recommended)

### Option 1: Automated Setup Script
```bash
python run_setup.py
```

This script will automatically:
- Check prerequisites
- Set up Python virtual environment
- Install all dependencies
- Create configuration files
- Generate startup scripts

### Option 2: Docker Setup (Easiest)
```bash
# Clone the repository
git clone <your-repo-url>
cd pulmocare-ai

# Place your model files in the correct directory
# Copy trained models to: PulmoCareAI Deep Learning Project/

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5000
# PgAdmin: http://localhost:8080
```

## 📋 Manual Setup (Step by Step)

### Prerequisites

Ensure you have the following installed:

1. **Python 3.8+**
   ```bash
   python --version  # Should show 3.8 or higher
   ```

2. **Node.js 16+**
   ```bash
   node --version    # Should show 16.0 or higher
   npm --version     # Should show 8.0 or higher
   ```

3. **PostgreSQL 12+**
   ```bash
   psql --version    # Should show 12.0 or higher
   ```

4. **Git**
   ```bash
   git --version
   ```

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd pulmocare-ai
```

### Step 2: Backend Setup

#### Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Frontend Setup

#### Install Node.js Dependencies
```bash
npm install
```

### Step 4: Database Setup

#### Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`

#### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user and database
CREATE USER pulmocare_user WITH PASSWORD 'your_password';
CREATE DATABASE pulmocare_db OWNER pulmocare_user;
GRANT ALL PRIVILEGES ON DATABASE pulmocare_db TO pulmocare_user;
\q
```

#### Update Database Configuration
Edit `app.py` and update the database URL:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://pulmocare_user:your_password@localhost/pulmocare_db'
```

#### Initialize Database Tables
```bash
python database_setup.py
```

### Step 5: Model Files Setup

Copy your trained model files to the project directory:

```
PulmoCareAI Deep Learning Project/
├── PulmoCareAI_FocalLoss_Final.h5
├── lung_cancer_model_metadata.json
└── (other model files)
```

**Required Files:**
- `PulmoCareAI_FocalLoss_Final.h5` - Main trained model
- `lung_cancer_model_metadata.json` - Model metadata

### Step 6: Environment Configuration

Create a `.env` file in the root directory:
```bash
# Database Configuration
DATABASE_URL=postgresql://pulmocare_user:your_password@localhost/pulmocare_db

# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# React Configuration
REACT_APP_API_URL=http://localhost:5000
```

### Step 7: Start the Application

#### Terminal 1: Start Backend
```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start Flask server
python app.py
```

#### Terminal 2: Start Frontend
```bash
# Start React development server
npm start
```

### Step 8: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 Configuration Options

### Database Configuration

#### PostgreSQL Settings
```python
# In app.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@host:port/database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

#### Alternative Database (SQLite for Development)
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pulmocare.db'
```

### Model Configuration

#### Custom Model Path
```python
# In app.py, update ModelLoader class
model_files = [
    'path/to/your/model.h5',
    'path/to/backup/model.h5'
]
```

### Frontend Configuration

#### API URL Configuration
```bash
# In .env
REACT_APP_API_URL=http://your-backend-url:port
```

## 🐳 Docker Deployment

### Development with Docker
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production with Docker
```bash
# Use production profile
docker-compose --profile production up -d

# This includes Nginx reverse proxy
```

### Docker Environment Variables
```yaml
# In docker-compose.yml
environment:
  - DATABASE_URL=postgresql://user:pass@database:5432/db
  - FLASK_ENV=production
  - SECRET_KEY=your-production-secret
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Model Loading Errors
```bash
# Check if model files exist
ls -la "PulmoCareAI Deep Learning Project/"

# Check file permissions
chmod 644 "PulmoCareAI Deep Learning Project/"*.h5
```

#### 2. Database Connection Errors
```bash
# Test PostgreSQL connection
psql -h localhost -U pulmocare_user -d pulmocare_db

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

#### 3. Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### 4. Permission Errors
```bash
# Fix Python virtual environment permissions
chmod -R 755 venv/

# Fix upload directory permissions
mkdir -p uploads
chmod 755 uploads
```

#### 5. Node.js Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

#### 1. Model Loading Optimization
```python
# In app.py, add model caching
import functools

@functools.lru_cache(maxsize=1)
def load_model():
    # Model loading code here
    pass
```

#### 2. Database Connection Pooling
```python
# In app.py
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 20,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

#### 3. Frontend Build Optimization
```bash
# Create optimized production build
npm run build

# Serve static build (optional)
npm install -g serve
serve -s build -l 3000
```

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 4 cores, 2.0 GHz
- **RAM**: 8 GB
- **Storage**: 10 GB free space
- **GPU**: Optional (CUDA-compatible for faster inference)

### Recommended Requirements
- **CPU**: 8 cores, 3.0 GHz
- **RAM**: 16 GB
- **Storage**: 50 GB SSD
- **GPU**: NVIDIA GPU with 4GB+ VRAM

## 🔐 Security Configuration

### Production Security Settings

#### 1. Environment Variables
```bash
# Never commit these to version control
export SECRET_KEY="your-very-secure-secret-key"
export DATABASE_URL="postgresql://user:pass@host/db"
export FLASK_ENV="production"
```

#### 2. Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

#### 3. File Upload Security
```python
# In app.py
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'dcm'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
```

## 📈 Monitoring & Logging

### Application Monitoring
```python
# Add logging configuration
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Database Monitoring
```bash
# Monitor PostgreSQL performance
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_database;
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**:
   - Backend: Check terminal output or `app.log`
   - Frontend: Check browser console
   - Database: Check PostgreSQL logs

2. **Verify configuration**:
   - Database connection string
   - Model file paths
   - Environment variables

3. **Test components individually**:
   - Database connection: `python database_setup.py`
   - Model loading: Check `/api/health` endpoint
   - Frontend: Check if React app starts

4. **Create an issue** on GitHub with:
   - Error messages
   - System information
   - Steps to reproduce

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TensorFlow Documentation](https://www.tensorflow.org/guide)
- [Docker Documentation](https://docs.docker.com/)

---

**Need help?** Create an issue on GitHub or contact the development team.