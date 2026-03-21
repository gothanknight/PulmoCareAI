import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        database='pulmocare_db', 
        user='postgres',
        password='collect30',
        port='5432'
    )
    cursor = conn.cursor()
    
    print("=== PATIENT DATA ===")
    cursor.execute('SELECT COUNT(*) FROM patient;')
    patient_count = cursor.fetchone()[0]
    print(f"Total Patients: {patient_count}")
    
    cursor.execute('SELECT * FROM patient LIMIT 5;')
    patients = cursor.fetchall()
    for i, patient in enumerate(patients, 1):
        print(f"Patient {i}: {patient}")
    
    print("\n=== PREDICTION DATA ===")
    cursor.execute('SELECT COUNT(*) FROM prediction;')
    pred_count = cursor.fetchone()[0]
    print(f"Total Predictions: {pred_count}")
    
    cursor.execute('SELECT * FROM prediction LIMIT 5;')
    predictions = cursor.fetchall()
    for i, pred in enumerate(predictions, 1):
        print(f"Prediction {i}: {pred}")
    
    cursor.close()
    conn.close()
    print("\n✅ Database check completed!")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")