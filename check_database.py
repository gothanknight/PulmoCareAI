import psycopg2
import json
import os

def check_database_contents():
    """Check all data stored in PostgreSQL database"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host='localhost',
            database='pulmocare_db',
            user='postgres',
            password='collect30',
            port='5432'
        )
        cursor = conn.cursor()
        
        print("🏥 === PULMOCARE DATABASE VERIFICATION ===\n")
        
        # Check Patients
        print("👥 === PATIENT DATA ===")
        cursor.execute('SELECT * FROM patient ORDER BY id;')
        patients = cursor.fetchall()
        print(f"Total Patients: {len(patients)}")
        
        for patient in patients:
            print(f"Patient {patient[0]}: {patient[1]} {patient[2]}")
            print(f"  Age: {patient[3]}, Phone: {patient[4]}")
            print(f"  Created: {patient[5]}")
            print()
        
        # Check Predictions
        print("🔬 === PREDICTION DATA ===")
        cursor.execute('SELECT * FROM prediction ORDER BY id;')
        predictions = cursor.fetchall()
        print(f"Total Predictions: {len(predictions)}")
        
        for pred in predictions:
            print(f"Prediction {pred[0]}:")
            print(f"  Patient ID: {pred[1]}")
            print(f"  Result: {pred[2]}")
            print(f"  Confidence: {pred[3]:.3f}")
            print(f"  Image Path: {pred[4]}")
            print(f"  Has Grad-CAM: {'Yes' if pred[5] else 'No'}")
            print(f"  Original Image Path: {pred[6] if pred[6] else 'Not stored'}")
            print(f"  Created: {pred[7]}")
            
            # Check if image files exist
            if pred[4] and os.path.exists(pred[4]):
                file_size = os.path.getsize(pred[4]) / 1024  # KB
                print(f"  Image File: EXISTS ({file_size:.1f} KB)")
            else:
                print(f"  Image File: MISSING")
            print()
        
        # Check image storage
        print("📁 === IMAGE STORAGE VERIFICATION ===")
        uploads_dir = "uploads"
        if os.path.exists(uploads_dir):
            files = os.listdir(uploads_dir)
            print(f"Files in uploads folder: {len(files)}")
            for file in files[:10]:  # Show first 10 files
                file_path = os.path.join(uploads_dir, file)
                size = os.path.getsize(file_path) / 1024  # KB
                print(f"  {file} ({size:.1f} KB)")
            if len(files) > 10:
                print(f"  ... and {len(files) - 10} more files")
        else:
            print("❌ Uploads folder not found")
        
        cursor.close()
        conn.close()
        print("\n✅ Database verification completed successfully!")
        
    except Exception as e:
        print(f"❌ Database error: {str(e)}")

if __name__ == "__main__":
    check_database_contents()