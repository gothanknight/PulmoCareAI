# PulmoCareAI

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**What does this system do?**  
PulmoCareAI is a web application designed to help hospital staff identify lung cancer from patient CT scans. A doctor simply uploads a patient's scan into the system, and the AI instantly analyzes the image to predict whether it shows signs of cancer. To ensure the medical team can trust the result, the system also highlights the exact areas of the lung that look suspicious, providing a clear, visual "second opinion" within a secure patient dashboard.

---

A full-stack medical AI system for lung cancer detection.

Built from scratch as an independent, self-funded student project, PulmoCareAI represents a complete deep learning deployment lifecycle. Rather than stopping at a trained model in a Google Colab, this system implements an explicit 14-stage pipeline that takes raw CT data, trains a neural network, and serves it through a resilient backend to a clinical-grade React interface.

The project is designed to answer the practical question of ML engineering: how do we reliably get a trained model into the hands of a user while providing interpretability, session security, and state management?

## The Dataset
- **Name**: IQ-OTH/NCCD Lung Cancer Dataset
- **Source**: Iraq-Oncology Teaching Hospital / National Center for Cancer Diseases (2019)
- **Size**: 999 CT scan images
- **Classes**: Malignant, Benign, Normal
- **Verification**: Annotated by specialized oncologists and radiologists
- **Link**: [IQ-OTH/NCCD on Kaggle](https://www.kaggle.com/datasets/adityamahimkar/iqothnccd-lung-cancer-dataset)

## Why This Matters
In healthcare, a simple "yes or no" prediction from an AI is never enough; doctors need to know *why* the AI made its decision. By generating a Grad-CAM heatmap alongside every prediction, PulmoCareAI opens up the "black box" of the neural network. It explicitly shows clinical staff which regions of the CT scan influenced the cancer prediction, allowing doctors to visually verify the AI's reasoning rather than blindly trusting a metric.

## System Architecture

The pipeline moves incrementally from deep learning to data persistence and UI rendering, breaking down the complexities of production ML.

### 1. Core Model & Training
- **Architecture**: ResNet50 paired with Focal Loss to handle severe dataset class imbalances.
- **Data & Training**: Trained on 999 lung CT images (`PulmoCareAI_Deep_Learning_Project.ipynb`).
- **Artifacts**: Exports `.h5` model weights (`PulmoCareAI_FocalLoss_Final.h5`, ~92 MB) alongside a configuration metadata dictionary (`lung_cancer_model_metadata.json`) containing AUC, accuracy, and training states.
- **Performance**: 86.87% training accuracy, 0.9956 AUC — trained with Focal Loss using extreme class weights (8:1) to handle severe class imbalance across 999 CT images.

### 2. Resilient Model Serving (Fallback Chain)
Model loading in production is notoriously brittle. To ensure the prediction API remains online, the backend implements a multi-tier fallback sequence:
1. **Standard Load**: Attempts to construct the Keras model directly via `app.py`.
2. **Compatibility Patch**: If standard loading fails (e.g., older `batch_shape` vs newer `input_shape` layer conflicts), `model_converter.py` applies a structural patch.
3. **Manual Reconstruction**: If patching fails, `model_reconstructor.py` reads the H5 metadata, manually rebuilds the ResNet50 graph, and injects ImageNet weights.
4. **Heuristic Fallback**: If TensorFlow is entirely unavailable on the host environment, `custom_model_loader.py` falls back to a lightweight statistical heuristic loader to keep the application responsive.

### 3. Interpretability with Grad-CAM
Building trust requires transparency. When a 224x224 RGB CT scan is evaluated by the `/api/predict` endpoint, `app.py` doesn't just return a probability score. 

The `GradCAMGenerator` simultaneously computes a class activation heatmap—highlighting the exact regions of the lung that heavily influenced the neural network's decision. This heatmap is combined with a regional severity list and sent as a base64 overlay to the frontend, giving clinical staff visual proof of the model's reasoning.

### 4. Security & Patient Management
The system is built to mimic real-world medical data handling:
- **Authentication**: A complete JWT-based authentication flow (`AuthContext.jsx`, `Login.jsx`, `Register.jsx`) with password resets via email and secured route guards.
- **Persistence**: Relational structure built on PostgreSQL via SQLAlchemy (`database_setup.py`), managing isolated `user`, `patient`, and `prediction` tables.
- **Data Association**: Uploaded scans and prediction results (along with analysis time and Grad-CAM data) are permanently linked to specific patient records rather than sitting in temporary file structures.

### 5. Frontend Interface
A React single-page application focused on data visualization and clinical usability:
- **Clinical Dashboard**: `Dashboard.jsx` and `MedicalStatistics.jsx` utilize Chart.js to report on prediction confidence distribution, ROC bounds, and time-series analysis of past diagnoses.
- **Interactive Diagnostics**: `NeuralNetworkVisualization.jsx` uses D3.js to render an interactive map of the neural network's architecture directly in the browser.
- **Patient History**: `PredictionHistory.jsx` allows filtering and reviewing previous Grad-CAM overlays alongside their original CT inputs.

## Technology Stack

- **Machine Learning**: TensorFlow / Keras, OpenCV, NumPy
- **Backend API**: Python, Flask, SQLAlchemy, JWT, PostgreSQL
- **Frontend**: React.js, Axios, TailwindCSS, Chart.js, D3.js
- **Environment Automation**: Custom Python setup routines (`run_setup.py`, `generate_secrets.py`)
- **Deployment**: Docker, Docker Compose, Nginx (`Dockerfile`, `docker-compose.yml`, `nginx.conf`) — *Note: Containerized deployment configuration is currently planned/in progress and pending comprehensive testing.*

## Getting Started

To minimize dependency friction, environment setup and secret generation have been fully automated. 

1. **Run the Initialization Script:**
   ```bash
   python run_setup.py
   ```
   This handles Python virtual environment creation, installs dependencies from `requirements.txt` and `package.json`, and generates cryptographic keys via `generate_secrets.py`.

2. **Initialize the Database:**
   With a local PostgreSQL server running, instantiate the schema and sample data:
   ```bash
   python database_setup.py
   ```

3. **Start the Application:**
   Start the Flask backend (`app.py`) and the React frontend (`npm start`). Detailed instructions for starting the services are available in `SETUP_GUIDE.md` and `presentation_setup.py` (which launches both servers simultaneously for demos).

## Author

**Nisarg Trivedi**  
B.Tech CSE, Silver Oak University, Gujarat, India  
- [GitHub](#) <!-- Add your GitHub link here -->
- [LinkedIn](#) <!-- Add your LinkedIn link here -->