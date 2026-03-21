#!/usr/bin/env python3
"""
Database setup script for PulmoCareAI
Creates PostgreSQL database and tables
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app import app, db

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    
    # Database connection parameters
    db_params = {
        'host': 'localhost',
        'user': 'postgres',  # Change this to your PostgreSQL username
        'password': 'password',  # Change this to your PostgreSQL password
        'port': 5432
    }
    
    database_name = 'pulmocare_db'
    
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (database_name,))
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(f'CREATE DATABASE {database_name}')
            print(f"✅ Database '{database_name}' created successfully")
        else:
            print(f"✅ Database '{database_name}' already exists")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

def create_tables():
    """Create application tables using SQLAlchemy"""
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Print table information
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📋 Created tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

def setup_sample_data():
    """Insert sample data for testing"""
    try:
        from app import Patient, Prediction
        
        with app.app_context():
            # Check if sample data already exists
            if Patient.query.first():
                print("✅ Sample data already exists")
                return
            
            # Create sample patients
            sample_patients = [
                {
                    'name': 'John Doe',
                    'age': 65,
                    'gender': 'Male',
                    'medical_history': 'Former smoker, 30 pack-year history. Family history of lung cancer.'
                },
                {
                    'name': 'Jane Smith',
                    'age': 58,
                    'gender': 'Female',
                    'medical_history': 'Non-smoker. Exposed to asbestos in workplace for 15 years.'
                },
                {
                    'name': 'Robert Johnson',
                    'age': 72,
                    'gender': 'Male',
                    'medical_history': 'Current smoker, 40 pack-year history. COPD diagnosis.'
                }
            ]
            
            for patient_data in sample_patients:
                patient = Patient(**patient_data)
                db.session.add(patient)
            
            db.session.commit()
            print("✅ Sample patient data created successfully")
            
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")

def main():
    """Main setup function"""
    print("🏥 PulmoCareAI Database Setup")
    print("=" * 40)
    
    # Step 1: Create database
    print("\n1. Creating PostgreSQL database...")
    create_database()
    
    # Step 2: Create tables
    print("\n2. Creating application tables...")
    create_tables()
    
    # Step 3: Setup sample data
    print("\n3. Setting up sample data...")
    setup_sample_data()
    
    print("\n✅ Database setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update the database connection string in app.py")
    print("2. Install required dependencies: pip install -r requirements.txt")
    print("3. Place your trained model files in the 'PulmoCareAI Deep Learning Project' folder")
    print("4. Run the Flask application: python app.py")
    print("5. Start the React frontend: npm start")

if __name__ == "__main__":
    main()