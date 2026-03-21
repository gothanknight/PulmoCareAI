import os
import sys
import numpy as np
from PIL import Image

print("Testing model loading...")

# Check if model files exist
model_files = [
    'PulmoCareAI Deep Learning Project/PulmoCareAI_FocalLoss_Final.h5',
    'PulmoCareAI Deep Learning Project/focal_loss_model.h5',
    'PulmoCareAI Deep Learning Project/PulmoCareAI_ResNet50_FocalLoss_20250731_194001.h5',
    'PulmoCareAI Deep Learning Project/best_lung_cancer_model.h5'
]

for model_file in model_files:
    if os.path.exists(model_file):
        print(f"✅ Found model file: {model_file}")
    else:
        print(f"❌ Model file not found: {model_file}")

print("\nTrying to import TensorFlow...")
try:
    import tensorflow as tf
    print(f"✅ TensorFlow imported successfully (version: {tf.__version__})")
    
    print("\nTrying to load a model...")
    for model_file in model_files:
        if os.path.exists(model_file):
            try:
                print(f"Loading model: {model_file}")
                model = tf.keras.models.load_model(model_file, compile=False)
                print(f"✅ Model loaded successfully: {model_file}")
                print(f"Model summary:")
                model.summary()
                break
            except Exception as e:
                print(f"❌ Error loading model {model_file}: {str(e)}")
                continue
    
except ImportError as e:
    print(f"❌ TensorFlow import failed: {str(e)}")
    
    print("\nTrying to create a simple model loader...")
    class SimpleModelLoader:
        def __init__(self, model_path):
            print(f"Initializing simple model loader for: {model_path}")
            self.model_path = model_path
            self.file_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
            print(f"Model file size: {self.file_size:.2f} MB")
            
            # Try to read the first few bytes to verify file access
            with open(model_path, 'rb') as f:
                header = f.read(8)
                print(f"File header (hex): {header.hex()}")
                
            print("✅ Simple model loader initialized")
    
    # Try to load a model with the simple loader
    for model_file in model_files:
        if os.path.exists(model_file):
            try:
                loader = SimpleModelLoader(model_file)
                print(f"✅ Simple model loader created for: {model_file}")
                break
            except Exception as e:
                print(f"❌ Error with simple loader for {model_file}: {str(e)}")
                continue