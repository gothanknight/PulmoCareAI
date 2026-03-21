import os
import sys

print("=== TensorFlow Model Loading Test ===")

# Check if model file exists
model_path = 'PulmoCareAI Deep Learning Project/PulmoCareAI_FocalLoss_Final.h5'
print(f"Model file exists: {os.path.exists(model_path)}")
if os.path.exists(model_path):
    print(f"Model file size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")

# Try to import TensorFlow
print("\n--- Testing TensorFlow Import ---")
try:
    import tensorflow as tf
    print("✅ TensorFlow imported successfully")
    
    # Try to get version
    try:
        version = tf.__version__
        print(f"TensorFlow version: {version}")
    except AttributeError:
        print("⚠️ Could not get TensorFlow version")
    
    # Try to load model
    print("\n--- Testing Model Loading ---")
    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        print(f"Model layers: {len(model.layers)}")
        
        # Try to get model summary
        try:
            model.summary()
        except Exception as e:
            print(f"⚠️ Could not get model summary: {e}")
            
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
except ImportError as e:
    print(f"❌ TensorFlow import failed: {str(e)}")
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
    print(f"Error type: {type(e).__name__}")

print("\n=== Test Complete ===") 