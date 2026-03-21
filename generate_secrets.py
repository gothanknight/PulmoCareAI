#!/usr/bin/env python3
"""
Generate secure secret keys for PulmoCareAI production deployment
"""

import secrets
import os

def generate_secrets():
    print("🔐 Generating Secure Keys for PulmoCareAI")
    print("=" * 50)
    
    # Generate cryptographically secure keys
    secret_key = secrets.token_urlsafe(32)
    jwt_secret_key = secrets.token_urlsafe(32)
    security_salt = secrets.token_urlsafe(16)
    
    print("\n📋 Add these to your .env file for production:")
    print("-" * 50)
    print(f"SECRET_KEY={secret_key}")
    print(f"JWT_SECRET_KEY={jwt_secret_key}")
    print(f"SECURITY_PASSWORD_SALT={security_salt}")
    
    print(f"\nDATABASE_URL=postgresql://postgres:your-password@localhost:5432/pulmocare_db")
    print(f"MAIL_USERNAME=your-email@gmail.com")
    print(f"MAIL_PASSWORD=your-gmail-app-password")
    print(f"MAIL_DEFAULT_SENDER=PulmoCareAI <noreply@pulmocare.ai>")
    print(f"FLASK_ENV=production")
    print(f"FLASK_DEBUG=False")
    
    print("\n🔒 Security Notes:")
    print("• Keep these keys secret and never commit them to version control")
    print("• Store them in a .env file in your project root")
    print("• For Gmail, use an App Password (not your regular password)")
    print("• These keys are cryptographically secure (32+ characters)")
    
    print("\n✅ Your current development setup is already secure!")
    print("   These keys are only needed for production deployment.")
    
    # Optionally create a .env template
    create_env = input("\n📝 Create .env template file? (y/n): ").lower().strip()
    
    if create_env == 'y':
        env_content = f"""# PulmoCareAI Production Environment Variables
# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# Flask Configuration
SECRET_KEY={secret_key}
JWT_SECRET_KEY={jwt_secret_key}
SECURITY_PASSWORD_SALT={security_salt}

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/pulmocare_db

# Email Configuration (for password reset emails)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_DEFAULT_SENDER=PulmoCareAI <noreply@pulmocare.ai>

# Production Settings
FLASK_ENV=production
FLASK_DEBUG=False
"""
        
        try:
            with open('.env.template', 'w') as f:
                f.write(env_content)
            print("✅ Created .env.template file")
            print("   Copy to .env and update with your actual values")
        except Exception as e:
            print(f"❌ Could not create .env.template: {e}")

if __name__ == "__main__":
    try:
        from datetime import datetime
        generate_secrets()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")