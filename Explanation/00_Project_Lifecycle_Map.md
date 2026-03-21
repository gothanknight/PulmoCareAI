# PulmoCareAI — Project Lifecycle Map

---

## My Project Lifecycle: Start to End

**Starts at:** Jupyter Notebook (`PulmoCareAI_Deep_Learning_Project.ipynb`) — trains a ResNet50 model on lung CT images and exports `.h5` weight files + `lung_cancer_model_metadata.json`

**Ends at:** React frontend displays the prediction result (cancerous / non_cancerous), confidence score, and Grad-CAM heatmap overlay to the logged-in medical staff user

**Total Stages Found:** 14

---

| # | Lifecycle Stage | File(s) | Input | Output | Next Stage |
|---|---|---|---|---|---|
| 1 | Model Training & Export | `PulmoCareAI_Deep_Learning_Project.ipynb` | Raw lung CT image dataset (999 images) | Trained `.h5` model files + `lung_cancer_model_metadata.json` | 2 |
| 2 | Model Compatibility Fixing | `model_converter.py` | Original `.h5` file with `batch_shape` keys | Fixed `.h5` file with `input_shape` keys (e.g. `_fixed.h5`) | 3 |
| 3 | Environment & Dependency Setup | `run_setup.py`, `requirements.txt`, `package.json`, `.env.template`, `generate_secrets.py` | Raw project directory | Installed Python venv, Node modules, `.env` config, startup scripts | 4 |
| 4 | Database Initialization | `database_setup.py`, `simple_db_setup.py`, `check_data.sql` | PostgreSQL server credentials | `pulmocare_db` with `user`, `patient`, `prediction` tables + sample patients | 5 |
| 5 | Flask App Initialization & Model Loading | `app.py` (lines 1–437), `config.py` | `.h5` model files, metadata JSON, DB connection string | Running Flask server with loaded model, initialized DB, JWT/CORS/Mail extensions | 6 |
| 6 | Model Loading Fallback Chain | `model_reconstructor.py`, `custom_model_loader.py` | `.h5` file that fails standard Keras load | A usable model object (reconstructed TF model or lightweight heuristic model) | 7 |
| 7 | User Authentication | `app.py` (auth routes), `AuthContext.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | Username + password via React login form | JWT access token stored in `localStorage`, user session established | 8 |
| 8 | Patient Management | `app.py` (`/api/patients`), `Patients.jsx` | Patient name, age, gender, medical history via React form | Patient record persisted to `patient` table, patient list rendered in UI | 9 |
| 9 | CT Image Upload & Preprocessing | `app.py` (`preprocess_image`), `Analysis.jsx` | Uploaded lung CT image file + selected patient ID | 224×224 RGB NumPy array normalized to [0,1], saved to `uploads/` folder | 10 |
| 10 | Model Prediction | `app.py` (`/api/predict`), `LightweightModel.predict`, `CustomModelLoader.predict` | Preprocessed 224×224×3 image array | Cancer probability float, result label (`cancerous` / `non_cancerous`), confidence score | 11 |
| 11 | Grad-CAM Heatmap Generation | `app.py` (`GradCAMGenerator`, `analyze_gradcam_regions`) | Image array + loaded model + prediction result | Heatmap NumPy array, base64-encoded overlay image, region severity list | 12 |
| 12 | Result Persistence & API Response | `app.py` (Prediction model, `/api/predict` response) | Prediction result, confidence, Grad-CAM data, analysis time | `prediction` row in database + JSON response to frontend | 13 |
| 13 | Frontend Result Display | `Analysis.jsx`, `PredictionHistory.jsx`, `Dashboard.jsx`, `MedicalStatistics.jsx` | JSON prediction response from `/api/predict` | Rendered result card with confidence, Grad-CAM overlay, severity regions, charts | 14 |
| 14 | Deployment & Production Serving | `Dockerfile`, `docker-compose.yml`, `nginx.conf` | Built React app + Flask backend + PostgreSQL + model files | Containerized multi-service application served via Nginx reverse proxy | — |

---

## File Index

| File Name | Stage # | One Line Purpose |
|---|---|---|
| `PulmoCareAI_Deep_Learning_Project.ipynb` | 1 | Trains ResNet50 + Focal Loss model on lung CT images and exports `.h5` weights |
| `PulmoCareAI_FocalLoss_Final.h5` | 1 | Primary trained model weights file (ResNet50-based, ~92 MB) |
| `PulmoCareAI_FocalLoss_Final_fixed.h5` | 2 | Compatibility-fixed version of the primary model |
| `PulmoCareAI_ResNet50_FocalLoss_20250731_194001.h5` | 1 | Timestamped backup of the trained model |
| `focal_loss_model.h5` | 1 | Alternative focal loss trained model |
| `best_lung_cancer_model.h5` | 1 | Earlier best model checkpoint |
| `best_lung_cancer_model_v2.h5` | 1 | Version 2 of earlier best model checkpoint |
| `aggressive_lung_cancer_model.h5` | 1 | Model trained with aggressive parameters |
| `balanced_lung_cancer_model.h5` | 1 | Model trained with balanced class weights |
| `lung_cancer_model_metadata.json` | 1 | Stores accuracy, AUC, class indices, training config for the exported model |
| `model_converter.py` | 2 | Fixes `batch_shape` → `input_shape` in H5 configs for Keras compatibility |
| `run_setup.py` | 3 | Automated full-project setup: venv, npm, env file, startup scripts |
| `requirements.txt` | 3 | Lists Python dependencies (Flask, TensorFlow, OpenCV, etc.) |
| `package.json` | 3 | Lists Node.js dependencies (React, Axios, Chart.js, TailwindCSS, etc.) |
| `.env.template` | 3 | Template for production environment variables |
| `generate_secrets.py` | 3 | Generates cryptographic secrets for production deployment |
| `database_setup.py` | 4 | Creates PostgreSQL database and tables via SQLAlchemy, inserts sample patients |
| `simple_db_setup.py` | 4 | Creates database and tables using raw SQL without importing `app.py` |
| `check_data.sql` | 4 | SQL queries to manually verify database contents |
| `config.py` | 5 | Defines Flask config classes (development/production) with DB URIs and secrets |
| `app.py` | 5, 7–12 | Main Flask backend: model loading, auth, patient/prediction APIs, Grad-CAM |
| `model_reconstructor.py` | 6 | Reconstructs ResNet50 architecture from H5 metadata and loads ImageNet weights |
| `custom_model_loader.py` | 6 | Lightweight model loader using image statistics when TensorFlow is unavailable |
| `simple_app.py` | 5, 9–12 | Simplified Flask backend without auth — used for lighter testing |
| `index.js` | 13 | React entry point — renders `<App />` into the DOM root |
| `index.css` | 13 | Global CSS styles and Tailwind directives |
| `App.jsx` | 13 | Root React component — sets up routing, auth provider, error boundary |
| `AuthContext.jsx` | 7 | React context providing login/register/logout state and JWT token management |
| `api.js` | 13 | Axios instance with base URL, auth interceptor, and API helper functions |
| `constants.js` | 13 | Shared UI constants (colors, labels, configuration values) |
| `helpers.js` | 13 | Shared utility functions for formatting, validation, and data processing |
| `Login.jsx` | 7 | Login page — collects username/password and calls `/api/auth/login` |
| `Register.jsx` | 7 | Registration page — collects medical staff details and calls `/api/auth/register` |
| `ForgotPassword.jsx` | 7 | Forgot password page — sends reset email via `/api/auth/forgot-password` |
| `ResetPassword.jsx` | 7 | Reset password page — validates token and sets new password |
| `Home.jsx` | 13 | Landing/home page shown after login |
| `Dashboard.jsx` | 13 | Dashboard page — displays stats, charts, and recent predictions summary |
| `Patients.jsx` | 8 | Patient management page — CRUD operations for patient records |
| `Analysis.jsx` | 9, 13 | CT scan upload page — sends image to `/api/predict` and shows result |
| `PredictionHistory.jsx` | 13 | Lists all past predictions with Grad-CAM images and filtering |
| `MedicalStatistics.jsx` | 13 | Comprehensive statistics page with confidence distribution, ROC, trends |
| `NeuralNetworkPage.jsx` | 13 | Interactive ResNet50 architecture visualization page |
| `About.jsx` | 13 | About page — project description and technology overview |
| `Profile.jsx` | 7 | User profile page — update details and change password |
| `Navbar.jsx` | 13 | Top navigation bar with links to all pages |
| `Footer.jsx` | 13 | Page footer component |
| `ProtectedRoute.jsx` | 7 | Route guard — redirects unauthenticated users to login |
| `ErrorBoundary.jsx` | 13 | React error boundary — catches and displays runtime errors gracefully |
| `NetworkStatusIndicator.jsx` | 13 | Shows connection status notification when backend is unreachable |
| `NeuralNetworkVisualization.jsx` | 13 | D3.js-powered interactive neural network layer visualization |
| `PulmoCareAILogo.jsx` | 13 | SVG logo component used across the app |
| `Dockerfile` | 14 | Multi-stage Docker build — compiles React, installs Python deps, runs Flask |
| `docker-compose.yml` | 14 | Orchestrates PostgreSQL, Redis, PgAdmin, Flask app, and Nginx containers |
| `nginx.conf` | 14 | Nginx reverse proxy config — routes frontend and API traffic |
| `SETUP_GUIDE.md` | 3 | Detailed step-by-step setup documentation |
| `SECURITY_SETUP.md` | 3 | Security configuration guide (secrets, HTTPS, CORS) |
| `GMAIL_SETUP.md` | 3 | Gmail app password setup guide for email features |
| `DATABASE_STORAGE_SUMMARY.md` | 4 | Documents database schema and storage approach |
| `README.md` | 3 | Project overview, features, architecture, and quick-start guide |
| `postcss.config.js` | 3 | PostCSS configuration for TailwindCSS processing |
| `tailwind.config.js` | 3 | TailwindCSS theme and content configuration |
| `check_model.py` | 6 | Diagnostic script — inspects H5 model files for structure and metadata |
| `check_database.py` | 4 | Diagnostic script — lists all patients and predictions in the database |
| `check_db_simple.py` | 4 | Quick diagnostic — counts patients and predictions |
| `test_model_load.py` | 6 | Tests TensorFlow import and model loading |
| `test_tensorflow_model.py` | 6 | Tests TensorFlow model loading and prediction output |
| `test_email_config.py` | 7 | Tests Gmail SMTP connection and email sending |
| `create_test_images.py` | 9 | Generates synthetic lung CT test images (normal, suspicious, abnormal) |
| `presentation_setup.py` | 14 | Starts both servers and prints demo instructions for presentations |
| `PulmoCareAI_Activity_Diagram.txt` | 3 | Text-based UML activity diagram of the system workflow |
| `PulmoCareAI_Component_Diagram.txt` | 3 | Text-based UML component diagram of the system architecture |
| `PulmoCareAI System Working Process.pdf` | 3 | PDF document describing the system's working process |
| `neural_network_design.png` | 3 | Visual diagram of the neural network architecture |
| `ppt_format.pptx` | 3 | PowerPoint presentation template for the project |
| `public/index.html` | 13 | HTML shell that hosts the React single-page application |
| `build/index.html` | 14 | Production-built HTML entry point served in deployment |
| `build/asset-manifest.json` | 14 | Maps logical asset names to hashed production filenames |
