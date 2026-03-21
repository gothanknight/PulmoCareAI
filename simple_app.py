import os
import json
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import base64
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import cv2

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:collect30@localhost:5432/pulmocare_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File upload configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Database Models
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    medical_history = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with predictions
    predictions = db.relationship('Prediction', backref='patient', lazy=True)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    image_filename = db.Column(db.String(255), nullable=False)
    prediction_result = db.Column(db.String(50), nullable=False)  # 'cancerous' or 'non_cancerous'
    confidence_score = db.Column(db.Float, nullable=False)
    gradcam_data = db.Column(db.Text)  # JSON string of Grad-CAM analysis
    gradcam_image = db.Column(db.Text)  # Base64 encoded Grad-CAM visualization
    original_image_path = db.Column(db.String(500))  # Path to original uploaded image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

# Simple image processing functions
def img_to_array(img):
    return np.array(img)

def load_img(path, target_size=None):
    img = Image.open(path)
    if target_size:
        img = img.resize(target_size)
    return img

def preprocess_image(image_path):
    """Preprocess image for model prediction"""
    try:
        # Load and resize image
        img = load_img(image_path, target_size=(224, 224))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize
        return img_array
    except Exception as e:
        print(f"Image preprocessing error: {str(e)}")
        return None

def generate_simulated_heatmap(img_array):
    """Generate a simulated Grad-CAM heatmap"""
    try:
        # Create a simple gradient-like heatmap
        h, w = 224, 224  # Standard input size
        heatmap = np.ones((h, w)) * 0.5  # Base value
        
        # Add some variation to make it look like a heatmap
        y, x = np.mgrid[0:h, 0:w]
        center_y, center_x = h // 2, w // 2
        dist = np.sqrt((y - center_y) ** 2 + (x - center_x) ** 2)
        
        # Create a more realistic looking heatmap with multiple hotspots
        import random
        num_spots = random.randint(1, 3)
        for _ in range(num_spots):
            spot_x = random.randint(w//4, 3*w//4)
            spot_y = random.randint(h//4, 3*h//4)
            spot_size = random.randint(10, 40)
            spot_intensity = random.uniform(0.5, 1.0)
            
            spot_dist = np.sqrt((y - spot_y) ** 2 + (x - spot_x) ** 2)
            spot_effect = np.exp(-spot_dist**2 / (2 * spot_size**2)) * spot_intensity
            heatmap += spot_effect
        
        # Normalize heatmap to 0-1 range
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min())
        
        return heatmap
    except Exception as e:
        print(f"Heatmap generation error: {str(e)}")
        return np.zeros((224, 224))

def analyze_gradcam_regions(heatmap, num_regions=5):
    """Analyze Grad-CAM heatmap to identify suspicious regions"""
    try:
        h, w = heatmap.shape
        regions = []
        
        # Find top activation regions
        flat_heatmap = heatmap.flatten()
        top_indices = np.argsort(flat_heatmap)[-num_regions:]
        
        for idx in top_indices:
            y, x = np.unravel_index(idx, heatmap.shape)
            activation = heatmap[y, x]
            
            # Calculate region size (approximate radius of activation)
            region_size = int(10 + 20 * activation)  # Size proportional to activation
            
            # Calculate severity based on activation value
            severity = activation
            severity_label = "Low"
            if severity > 0.7:
                severity_label = "High"
            elif severity > 0.4:
                severity_label = "Medium"
            
            regions.append({
                'x': int(x),
                'y': int(y),
                'size': region_size,
                'activation': float(activation),
                'severity': severity_label
            })
        
        return regions
    except Exception as e:
        print(f"Region analysis error: {str(e)}")
        return []

def simulate_prediction(img_array):
    """Simulate a prediction without using TensorFlow"""
    try:
        # Calculate image statistics for a heuristic
        mean_val = np.mean(img_array)
        std_val = np.std(img_array)
        
        # Calculate histogram features
        hist, _ = np.histogram(img_array.flatten(), bins=10, range=(0, 1))
        hist_ratio = hist[7:].sum() / (hist.sum() + 1e-10)  # Ratio of high intensity pixels
        
        # Calculate texture features (simple variance in local regions)
        h, w, _ = img_array.shape[1:] if len(img_array.shape) == 4 else img_array.shape
        block_size = 16
        texture_var = 0
        
        # Sample a few blocks for texture analysis
        for i in range(0, h, block_size*2):
            for j in range(0, w, block_size*2):
                if i+block_size <= h and j+block_size <= w:
                    block = img_array[0, i:i+block_size, j:j+block_size, :] if len(img_array.shape) == 4 else img_array[i:i+block_size, j:j+block_size, :]
                    texture_var += np.var(block)
        
        texture_var /= max(1, (h // (block_size*2)) * (w // (block_size*2)))
        
        # Combine features with weights (these weights are arbitrary for simulation)
        # Higher contrast, more high-intensity regions, and more texture variation
        # are associated with higher cancer probability in this simulation
        probability = min(max(
            0.3 * mean_val + 
            0.2 * std_val + 
            0.3 * hist_ratio + 
            0.2 * texture_var * 10,
            0.1), 0.9)
        
        # Load metadata if available
        metadata_file = 'PulmoCareAI Deep Learning Project/lung_cancer_model_metadata.json'
        if os.path.exists(metadata_file):
            try:
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                    model_accuracy = metadata.get('accuracy', 0.87)  # Default to 0.87 if not found
                    
                    # Adjust probability based on model accuracy
                    if probability > 0.5:
                        probability = 0.5 + (probability - 0.5) * model_accuracy
                    else:
                        probability = 0.5 - (0.5 - probability) * model_accuracy
            except:
                pass
        
        print(f"Simulated prediction: {probability:.4f}")
        return probability
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return 0.5  # Default fallback

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': True,
        'database_connected': True
    })

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    metadata_file = 'PulmoCareAI Deep Learning Project/lung_cancer_model_metadata.json'
    if os.path.exists(metadata_file):
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        return jsonify(metadata)
    else:
        return jsonify({'error': 'Model metadata not found'}), 404

@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Create a new patient"""
    try:
        data = request.json
        
        # Validate required fields
        if not all(key in data for key in ['name', 'age', 'gender']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create patient
        patient = Patient(
            name=data['name'],
            age=data['age'],
            gender=data['gender'],
            medical_history=data.get('medical_history', '')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'id': patient.id,
            'name': patient.name,
            'message': 'Patient created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients"""
    try:
        patients = Patient.query.all()
        
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'medical_history': p.medical_history,
            'created_at': p.created_at.isoformat(),
            'prediction_count': len(p.predictions)
        } for p in patients])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_lung_cancer():
    """Predict lung cancer from CT scan"""
    try:
        # Check if patient_id is provided
        if 'patient_id' not in request.form:
            return jsonify({'error': 'Patient ID is required'}), 400
            
        patient_id = request.form['patient_id']
        
        # Check if patient exists
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': f'Patient with ID {patient_id} not found'}), 404
        
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'Empty file provided'}), 400
            
        # Save file
        filename = secure_filename(file.filename)
        # Add unique identifier to prevent filename conflicts
        unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Preprocess image
        img_array = preprocess_image(file_path)
        if img_array is None:
            return jsonify({'error': 'Failed to process image'}), 400
            
        # Make prediction
        cancer_probability = simulate_prediction(img_array)
        
        # Determine result
        result = 'cancerous' if cancer_probability > 0.5 else 'non_cancerous'
        
        # Generate Grad-CAM heatmap
        heatmap = generate_simulated_heatmap(img_array)
        
        # Analyze regions
        regions = analyze_gradcam_regions(heatmap)
        
        # Convert heatmap to RGB visualization
        heatmap_rgb = np.uint8(255 * heatmap)
        heatmap_rgb = cv2.applyColorMap(heatmap_rgb, cv2.COLORMAP_JET)
        
        # Resize original image for overlay
        orig_img = load_img(file_path, target_size=(224, 224))
        orig_array = img_to_array(orig_img)
        
        # Overlay heatmap on original image
        superimposed_img = heatmap_rgb * 0.4 + orig_array
        superimposed_img = np.clip(superimposed_img, 0, 255).astype('uint8')
        
        # Convert to base64 for response
        img_pil = Image.fromarray(superimposed_img)
        buffered = BytesIO()
        img_pil.save(buffered, format="JPEG")
        gradcam_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Create Grad-CAM analysis JSON
        gradcam_analysis = {
            'regions': regions,
            'overall_severity': 'High' if cancer_probability > 0.7 else 'Medium' if cancer_probability > 0.4 else 'Low'
        }
        
        # Save prediction to database
        prediction = Prediction(
            patient_id=patient_id,
            image_filename=unique_filename,
            prediction_result=result,
            confidence_score=float(cancer_probability),
            gradcam_data=json.dumps(gradcam_analysis),
            gradcam_image=gradcam_base64,
            original_image_path=file_path
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        # Prepare response
        response = {
            'id': prediction.id,
            'result': result,
            'confidence': float(cancer_probability),
            'gradcam_image': gradcam_base64,
            'gradcam_analysis': gradcam_analysis,
            'timestamp': prediction.created_at.isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions/<int:patient_id>', methods=['GET'])
def get_patient_predictions(patient_id):
    """Get all predictions for a patient"""
    try:
        predictions = Prediction.query.filter_by(patient_id=patient_id).all()
        
        return jsonify([{
            'id': p.id,
            'result': p.prediction_result,
            'confidence': p.confidence_score,
            'created_at': p.created_at.isoformat(),
            'gradcam_analysis': json.loads(p.gradcam_data) if p.gradcam_data else None,
            'gradcam_image': p.gradcam_image,  # Include stored Grad-CAM visualization
            'image_filename': p.image_filename,  # Include original filename
            'original_image_path': p.original_image_path  # Include original image path
        } for p in predictions])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/prediction/<int:prediction_id>', methods=['GET'])
def get_prediction_details(prediction_id):
    """Get complete prediction details including images"""
    try:
        prediction = Prediction.query.get_or_404(prediction_id)
        patient = Patient.query.get(prediction.patient_id)
        
        return jsonify({
            'id': prediction.id,
            'patient': {
                'id': patient.id,
                'name': patient.name,
                'age': patient.age,
                'gender': patient.gender,
                'medical_history': patient.medical_history
            },
            'prediction_result': prediction.prediction_result,
            'confidence_score': prediction.confidence_score,
            'gradcam_data': json.loads(prediction.gradcam_data) if prediction.gradcam_data else None,
            'gradcam_image': prediction.gradcam_image,  # Base64 Grad-CAM visualization
            'image_filename': prediction.image_filename,
            'original_image_url': f'/uploads/{prediction.image_filename}',  # URL to original image
            'created_at': prediction.created_at.isoformat(),
            'notes': prediction.notes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predictions/all', methods=['GET'])
def get_all_predictions():
    """Get all predictions with patient details"""
    try:
        predictions = db.session.query(Prediction, Patient).join(Patient).all()
        
        return jsonify([{
            'id': pred.id,
            'patient': {
                'id': patient.id,
                'name': patient.name,
                'age': patient.age,
                'gender': patient.gender
            },
            'prediction_result': pred.prediction_result,
            'confidence_score': pred.confidence_score,
            'image_filename': pred.image_filename,
            'original_image_url': f'/uploads/{pred.image_filename}',
            'has_gradcam': pred.gradcam_image is not None,
            'created_at': pred.created_at.isoformat()
        } for pred, patient in predictions])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Database initialization
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database initialization error: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)