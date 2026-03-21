#!/usr/bin/env python3
"""
Simple Database setup script for PulmoCareAI
Creates PostgreSQL database and tables without importing app.py
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    
    # Database connection parameters
    db_params = {
        'host': 'localhost',
        'user': 'postgres',  # Change this to your PostgreSQL username
        'password': 'collect30',  # Change this to your PostgreSQL password
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
        print("💡 Make sure to update the password in this script!")
        sys.exit(1)

def create_tables():
    """Create application tables using raw SQL"""
    try:
        # Connect to the specific database
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='collect30',  # Change this
            database='pulmocare_db',
            port=5432
        )
        cursor = conn.cursor()
        
        # Create users table for authentication
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(128) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                department VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'medical_staff',
                medical_license VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                password_reset_token VARCHAR(255),
                password_reset_at TIMESTAMP
            )
        """)
        
        # Create patients table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patient (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INTEGER NOT NULL,
                gender VARCHAR(10) NOT NULL,
                medical_history TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create predictions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prediction (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patient(id),
                image_filename VARCHAR(255) NOT NULL,
                prediction_result VARCHAR(50) NOT NULL,
                confidence_score FLOAT NOT NULL,
                gradcam_data TEXT,
                gradcam_image TEXT,
                original_image_path VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Database tables created successfully")
        print("📋 Created tables: user, patient, prediction")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

def setup_sample_data():
    """Insert sample data for testing"""
    try:
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='collect30',  # Change this
            database='pulmocare_db',
            port=5432
        )
        cursor = conn.cursor()
        
        # Check if sample data already exists
        cursor.execute("SELECT COUNT(*) FROM patient")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print("✅ Sample data already exists")
            return
        
        # Create sample patients
        sample_patients = [
            ('John Doe', 65, 'Male', 'Former smoker, 30 pack-year history. Family history of lung cancer.'),
            ('Jane Smith', 58, 'Female', 'Non-smoker. Exposed to asbestos in workplace for 15 years.'),
            ('Robert Johnson', 72, 'Male', 'Current smoker, 40 pack-year history. COPD diagnosis.')
        ]
        
        for patient_data in sample_patients:
            cursor.execute("""
                INSERT INTO patient (name, age, gender, medical_history)
                VALUES (%s, %s, %s, %s)
            """, patient_data)
        
        conn.commit()
        cursor.close()
        conn.close()
        
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
    print("2. Run the Flask application: python app.py")
    print("3. Start the React frontend: npm start")

if __name__ == "__main__":
    main() 