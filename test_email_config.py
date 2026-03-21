#!/usr/bin/env python3
"""
Email Configuration Test Script for PulmoCareAI
Tests Gmail SMTP connection and email sending functionality
"""

import os
import sys
from flask import Flask
from flask_mail import Mail, Message

def test_email_configuration():
    """Test email configuration and sending"""
    
    print("🔧 Testing Email Configuration for PulmoCareAI")
    print("=" * 50)
    
    # Check environment variables
    email_username = os.getenv('EMAIL_USERNAME')
    email_password = os.getenv('EMAIL_PASSWORD')
    
    if not email_username or email_password:
        print("❌ Environment variables not set!")
        print("Please set EMAIL_USERNAME and EMAIL_PASSWORD")
        print("\nExample:")
        print("export EMAIL_USERNAME=your-email@gmail.com")
        print("export EMAIL_PASSWORD=your-app-password")
        return False
    
    print(f"✅ Email username: {email_username}")
    print(f"✅ Email password: {'*' * len(email_password)} (hidden)")
    
    # Create Flask app for testing
    app = Flask(__name__)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = email_username
    app.config['MAIL_PASSWORD'] = email_password
    app.config['MAIL_DEFAULT_SENDER'] = email_username
    
    mail = Mail(app)
    
    # Test email sending
    with app.app_context():
        try:
            print("\n📧 Testing email sending...")
            
            msg = Message(
                subject='PulmoCareAI - Email Configuration Test',
                recipients=[email_username],
                html="""
                <h2>✅ Email Configuration Successful!</h2>
                <p>Your PulmoCareAI email system is properly configured.</p>
                <p><strong>Features now working:</strong></p>
                <ul>
                    <li>Password reset emails</li>
                    <li>Login activity alerts</li>
                    <li>Registration verification</li>
                    <li>Security notifications</li>
                </ul>
                <p>🎉 Your medical system is ready for production!</p>
                """
            )
            
            mail.send(msg)
            print("✅ Email sent successfully!")
            print("📬 Check your inbox for the test email")
            return True
            
        except Exception as e:
            print(f"❌ Email sending failed: {str(e)}")
            print("\n🔧 Troubleshooting tips:")
            print("1. Ensure 2FA is enabled on Gmail")
            print("2. Verify app password is correct")
            print("3. Check internet connection")
            print("4. Try different port (465 for SSL)")
            return False

def test_smtp_connection():
    """Test basic SMTP connection"""
    
    print("\n🔌 Testing SMTP connection...")
    
    try:
        import smtplib
        
        email_username = os.getenv('EMAIL_USERNAME')
        email_password = os.getenv('EMAIL_PASSWORD')
        
        if not email_username or email_password:
            print("❌ Environment variables not set")
            return False
        
        # Test SMTP connection
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_username, email_password)
        server.quit()
        
        print("✅ SMTP connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ SMTP connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🏥 PulmoCareAI Email Configuration Test")
    print("=" * 40)
    
    # Test SMTP connection first
    smtp_success = test_smtp_connection()
    
    if smtp_success:
        # Test full email sending
        email_success = test_email_configuration()
        
        if email_success:
            print("\n🎉 All tests passed! Email system is ready.")
            print("You can now use the forgot password feature.")
        else:
            print("\n❌ Email sending test failed.")
            sys.exit(1)
    else:
        print("\n❌ SMTP connection test failed.")
        sys.exit(1) 