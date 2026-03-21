import os
import json
import h5py
import numpy as np

def check_model_files():
    print("Checking model files...")
    
    # List of model files to check
    model_files = [
        'PulmoCareAI Deep Learning Project/PulmoCareAI_FocalLoss_Final.h5',
        'PulmoCareAI Deep Learning Project/focal_loss_model.h5',
        'PulmoCareAI Deep Learning Project/PulmoCareAI_ResNet50_FocalLoss_20250731_194001.h5',
        'PulmoCareAI Deep Learning Project/best_lung_cancer_model.h5'
    ]
    
    # Check if files exist
    for model_file in model_files:
        if os.path.exists(model_file):
            print(f"✅ Found model file: {model_file}")
            file_size = os.path.getsize(model_file) / (1024 * 1024)  # Size in MB
            print(f"   - Size: {file_size:.2f} MB")
            
            # Try to read H5 file
            try:
                with h5py.File(model_file, 'r') as f:
                    # Print top-level keys
                    print(f"   - Top-level keys: {list(f.keys())}")
                    
                    # Check for model_config
                    if 'model_config' in f.attrs:
                        print(f"   - Has model_config: Yes")
                        try:
                            # Try different ways to decode the model_config
                            try:
                                model_config = json.loads(f.attrs['model_config'].decode('utf-8'))
                            except AttributeError:
                                # If it's already a string, just load it
                                model_config = json.loads(f.attrs['model_config'])
                            except:
                                # Last resort: try to read it as is
                                model_config = f.attrs['model_config']
                                if isinstance(model_config, dict):
                                    print(f"   - Model config is already a dictionary")
                                else:
                                    print(f"   - Model config type: {type(model_config)}")
                                    print(f"   - Unable to parse model_config")
                                    raise ValueError("Could not parse model_config")
                                
                            model_name = model_config.get('config', {}).get('name', 'Unknown')
                            print(f"   - Model name: {model_name}")
                            
                            # Get layer information
                            layers = model_config.get('config', {}).get('layers', [])
                            print(f"   - Number of layers: {len(layers)}")
                            
                            # Count convolutional layers
                            conv_layers = [layer for layer in layers if 'conv' in layer.get('class_name', '').lower()]
                            print(f"   - Number of conv layers: {len(conv_layers)}")
                            
                            # Print input shape
                            if layers:
                                input_shape = layers[0].get('config', {}).get('batch_input_shape', [None, 224, 224, 3])[1:]
                                print(f"   - Input shape: {input_shape}")
                        except Exception as e:
                            print(f"   - ❌ Error parsing model_config: {str(e)}")
                    else:
                        print(f"   - Has model_config: No")
                    
                    # Check for weights
                    if 'model_weights' in f:
                        print(f"   - Has model_weights: Yes")
                    else:
                        print(f"   - Has model_weights: No")
                        
            except Exception as e:
                print(f"   - ❌ Error reading H5 file: {str(e)}")
        else:
            print(f"❌ Model file not found: {model_file}")
    
    # Check metadata file
    metadata_file = 'PulmoCareAI Deep Learning Project/lung_cancer_model_metadata.json'
    if os.path.exists(metadata_file):
        print(f"\n✅ Found metadata file: {metadata_file}")
        try:
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                print(f"   - Model version: {metadata.get('version', 'Unknown')}")
                print(f"   - Model accuracy: {metadata.get('accuracy', 'Unknown')}")
                print(f"   - AUC score: {metadata.get('auc_score', 'Unknown')}")
                print(f"   - Classes: {metadata.get('classes', 'Unknown')}")
        except Exception as e:
            print(f"   - ❌ Error reading metadata file: {str(e)}")
    else:
        print(f"\n❌ Metadata file not found: {metadata_file}")

if __name__ == "__main__":
    check_model_files()