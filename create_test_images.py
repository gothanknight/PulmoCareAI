import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os

def create_test_lung_images():
    """Create sample lung CT images for testing"""
    
    # Create test images directory
    test_dir = "test_lung_images"
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
    
    print("🔬 Creating test lung CT images...")
    
    # 1. Normal lung (should detect as non-cancerous)
    normal_lung = Image.new('RGB', (224, 224), color='black')
    draw = ImageDraw.Draw(normal_lung)
    
    # Draw lung outline (light gray)
    draw.ellipse([30, 40, 100, 180], fill=(60, 60, 60))  # Left lung
    draw.ellipse([124, 40, 194, 180], fill=(60, 60, 60))  # Right lung
    
    # Add some normal lung texture
    for i in range(50):
        x = np.random.randint(35, 95)
        y = np.random.randint(45, 175)
        draw.point((x, y), fill=(80, 80, 80))
        
    for i in range(50):
        x = np.random.randint(129, 189)
        y = np.random.randint(45, 175)
        draw.point((x, y), fill=(80, 80, 80))
    
    normal_lung = normal_lung.filter(ImageFilter.GaussianBlur(1))
    normal_lung.save(f"{test_dir}/normal_lung.png")
    print("✅ Created: normal_lung.png (should detect as NON-CANCEROUS)")
    
    # 2. Suspicious lung with dark spots (should detect as cancerous)
    suspicious_lung = Image.new('RGB', (224, 224), color='black')
    draw = ImageDraw.Draw(suspicious_lung)
    
    # Draw lung outline
    draw.ellipse([30, 40, 100, 180], fill=(40, 40, 40))  # Darker left lung
    draw.ellipse([124, 40, 194, 180], fill=(40, 40, 40))  # Darker right lung
    
    # Add suspicious dark spots (potential tumors)
    draw.ellipse([55, 80, 75, 100], fill=(20, 20, 20))  # Dark spot in left lung
    draw.ellipse([150, 120, 170, 140], fill=(15, 15, 15))  # Darker spot in right lung
    draw.ellipse([70, 140, 85, 155], fill=(25, 25, 25))  # Another spot
    
    # Add irregular texture
    for i in range(100):
        x = np.random.randint(35, 95)
        y = np.random.randint(45, 175)
        intensity = np.random.randint(10, 50)
        draw.point((x, y), fill=(intensity, intensity, intensity))
        
    for i in range(100):
        x = np.random.randint(129, 189)
        y = np.random.randint(45, 175)
        intensity = np.random.randint(10, 50)
        draw.point((x, y), fill=(intensity, intensity, intensity))
    
    suspicious_lung = suspicious_lung.filter(ImageFilter.GaussianBlur(0.5))
    suspicious_lung.save(f"{test_dir}/suspicious_lung.png")
    print("✅ Created: suspicious_lung.png (should detect as CANCEROUS)")
    
    # 3. High contrast abnormal lung (should detect as cancerous)
    abnormal_lung = Image.new('RGB', (224, 224), color='black')
    draw = ImageDraw.Draw(abnormal_lung)
    
    # Draw irregular lung shapes
    draw.ellipse([25, 35, 105, 185], fill=(30, 30, 30))  # Left lung
    draw.ellipse([119, 35, 199, 185], fill=(30, 30, 30))  # Right lung
    
    # Add high contrast abnormalities
    draw.ellipse([45, 70, 85, 110], fill=(5, 5, 5))  # Very dark mass
    draw.rectangle([140, 100, 180, 140], fill=(10, 10, 10))  # Dark rectangular area
    
    # Add lots of variation (high std deviation)
    for i in range(200):
        x = np.random.randint(30, 200)
        y = np.random.randint(40, 180)
        intensity = np.random.choice([5, 15, 25, 35, 45, 55])  # High variation
        draw.point((x, y), fill=(intensity, intensity, intensity))
    
    abnormal_lung.save(f"{test_dir}/abnormal_lung.png")
    print("✅ Created: abnormal_lung.png (should detect as CANCEROUS)")
    
    # 4. Borderline case (could go either way)
    borderline_lung = Image.new('RGB', (224, 224), color='black')
    draw = ImageDraw.Draw(borderline_lung)
    
    # Draw normal-ish lungs
    draw.ellipse([30, 40, 100, 180], fill=(50, 50, 50))
    draw.ellipse([124, 40, 194, 180], fill=(50, 50, 50))
    
    # Add some concerning but not definitive features
    draw.ellipse([60, 100, 80, 120], fill=(35, 35, 35))  # Mild abnormality
    
    # Moderate texture variation
    for i in range(75):
        x = np.random.randint(35, 189)
        y = np.random.randint(45, 175)
        intensity = np.random.randint(30, 70)
        draw.point((x, y), fill=(intensity, intensity, intensity))
    
    borderline_lung = borderline_lung.filter(ImageFilter.GaussianBlur(1.5))
    borderline_lung.save(f"{test_dir}/borderline_lung.png")
    print("✅ Created: borderline_lung.png (could be EITHER)")
    
    print(f"\n📁 Test images saved in: {test_dir}/")
    print("\n🎯 Testing Instructions:")
    print("1. Upload 'normal_lung.png' → Should detect NON-CANCEROUS")
    print("2. Upload 'suspicious_lung.png' → Should detect CANCEROUS") 
    print("3. Upload 'abnormal_lung.png' → Should detect CANCEROUS")
    print("4. Upload 'borderline_lung.png' → Could be either")
    
    return test_dir

if __name__ == "__main__":
    create_test_lung_images()