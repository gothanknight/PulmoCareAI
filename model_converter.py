import h5py
import json
import tempfile
import os
import tensorflow as tf
import keras

def fix_model_config(model_path, output_path=None):
    """
    Fix the model configuration to be compatible with newer TensorFlow/Keras versions
    by converting batch_shape to input_shape
    """
    if output_path is None:
        output_path = model_path.replace('.h5', '_fixed.h5')
    
    print(f"Converting model: {model_path}")
    
    # Read the original model file
    with h5py.File(model_path, 'r') as original_file:
        # Get the model config
        if 'model_config' in original_file.attrs:
            try:
                config_str = original_file.attrs['model_config']
                if isinstance(config_str, bytes):
                    config_str = config_str.decode('utf-8')
                
                config = json.loads(config_str)
                print("✅ Original config loaded")
                
                # Fix the config by replacing batch_shape with input_shape
                def fix_layer_config(layer_config):
                    if 'config' in layer_config:
                        layer_cfg = layer_config['config']
                        if 'batch_shape' in layer_cfg:
                            batch_shape = layer_cfg['batch_shape']
                            if batch_shape and len(batch_shape) > 1:
                                # Convert batch_shape to input_shape (remove the batch dimension)
                                layer_cfg['input_shape'] = batch_shape[1:]
                                del layer_cfg['batch_shape']
                                print(f"Fixed layer {layer_cfg.get('name', 'unknown')}: batch_shape -> input_shape")
                    return layer_config
                
                # Fix all layers in the config
                if 'config' in config and 'layers' in config['config']:
                    for layer in config['config']['layers']:
                        fix_layer_config(layer)
                
                # Save the fixed config back
                fixed_config_str = json.dumps(config)
                
                # Create a new model file with the fixed config
                with h5py.File(output_path, 'w') as new_file:
                    # Copy all groups and datasets from original file
                    def copy_item(name, obj):
                        if isinstance(obj, h5py.Group):
                            new_file.create_group(name)
                            for key, value in obj.items():
                                copy_item(f"{name}/{key}", value)
                            # Copy attributes
                            for attr_name, attr_value in obj.attrs.items():
                                new_file[name].attrs[attr_name] = attr_value
                        elif isinstance(obj, h5py.Dataset):
                            new_file.create_dataset(name, data=obj[:])
                            # Copy attributes
                            for attr_name, attr_value in obj.attrs.items():
                                new_file[name].attrs[attr_name] = attr_value
                    
                    # Copy all items
                    for key, value in original_file.items():
                        copy_item(key, value)
                    
                    # Copy all root attributes except model_config
                    for attr_name, attr_value in original_file.attrs.items():
                        if attr_name != 'model_config':
                            new_file.attrs[attr_name] = attr_value
                    
                    # Set the fixed model config
                    new_file.attrs['model_config'] = fixed_config_str.encode('utf-8')
                
                print(f"✅ Fixed model saved to: {output_path}")
                return output_path
                
            except Exception as e:
                print(f"❌ Error fixing config: {str(e)}")
                return None
        else:
            print("⚠️ No model_config found in file")
            return None

def load_fixed_model(model_path):
    """
    Load a model, fixing compatibility issues if needed
    """
    try:
        # First, try to load the model directly
        model = keras.models.load_model(model_path, compile=False)
        print(f"✅ Model loaded directly: {model_path}")
        return model
    except Exception as e:
        if 'batch_shape' in str(e):
            print(f"⚠️ Compatibility issue detected: {str(e)}")
            # Try to fix the model
            fixed_path = fix_model_config(model_path)
            if fixed_path and os.path.exists(fixed_path):
                try:
                    model = keras.models.load_model(fixed_path, compile=False)
                    print(f"✅ Fixed model loaded successfully: {fixed_path}")
                    return model
                except Exception as e2:
                    print(f"❌ Fixed model still failed: {str(e2)}")
                    return None
            else:
                print("❌ Could not create fixed model")
                return None
        else:
            print(f"❌ Different error: {str(e)}")
            return None

if __name__ == "__main__":
    # Test the converter
    model_path = "PulmoCareAI Deep Learning Project/PulmoCareAI_FocalLoss_Final.h5"
    if os.path.exists(model_path):
        model = load_fixed_model(model_path)
        if model:
            print(f"Model type: {type(model)}")
            print(f"Model layers: {len(model.layers)}")
            try:
                print("Model summary:")
                model.summary()
            except:
                print("Could not display summary")
    else:
        print(f"Model file not found: {model_path}")