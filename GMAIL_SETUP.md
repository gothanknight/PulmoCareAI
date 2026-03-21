# 📧 Gmail Setup for Password Reset Emails

## **🔧 How to Configure Gmail for Password Reset**

### **Step 1: Enable 2-Factor Authentication**
1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable "2-Step Verification"

### **Step 2: Generate App Password**
1. Go to Google Account settings
2. Navigate to "Security" → "2-Step Verification"
3. Click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "PulmoCareAI" as the name
6. Click "Generate"
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Set Environment Variables**

**Option A: Create `.env` file**
```bash
# Create .env file in project root
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Option B: Set system environment variables**
```bash
# Windows
set EMAIL_USERNAME=your-email@gmail.com
set EMAIL_PASSWORD=your-16-character-app-password

# Linux/Mac
export EMAIL_USERNAME=your-email@gmail.com
export EMAIL_PASSWORD=your-16-character-app-password
```

### **Step 4: Test Email Configuration**

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Test forgot password:**
   - Go to `/forgot-password`
   - Enter your email
   - Check console for email content (development mode)
   - Check your email inbox (production mode)

### **Step 5: Production Deployment**

**For production, update the reset URL in `app.py`:**
```python
# Change from localhost to your domain
reset_url = f"https://yourdomain.com/reset-password?token={token}"
```

## **🔒 Security Best Practices**

1. **Never commit email credentials to Git**
2. **Use environment variables for sensitive data**
3. **Enable 2FA on your Gmail account**
4. **Use app passwords, not your main password**
5. **Regularly rotate app passwords**

## **🚨 Troubleshooting**

### **Common Issues:**

**1. "Authentication failed"**
- Check if 2FA is enabled
- Verify app password is correct
- Ensure email is correct

**2. "Connection refused"**
- Check internet connection
- Verify Gmail SMTP settings
- Try different port (587 or 465)

**3. "Email not received"**
- Check spam folder
- Verify email address
- Check console for errors

### **Testing Commands:**

```bash
# Test email configuration
python -c "
import os
from flask import Flask
from flask_mail import Mail, Message

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')

mail = Mail(app)

with app.app_context():
    try:
        msg = Message('Test Email', recipients=['your-email@gmail.com'])
        msg.body = 'This is a test email from PulmoCareAI'
        mail.send(msg)
        print('✅ Email sent successfully!')
    except Exception as e:
        print(f'❌ Email error: {e}')
"
```

## **📋 Complete Setup Checklist**

- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Generate App Password
- [ ] Set EMAIL_USERNAME environment variable
- [ ] Set EMAIL_PASSWORD environment variable
- [ ] Test email sending
- [ ] Verify password reset flow works
- [ ] Update reset URL for production

## **🎯 Quick Start**

1. **Enable 2FA on Gmail**
2. **Generate app password**
3. **Set environment variables:**
   ```bash
   export EMAIL_USERNAME=your-email@gmail.com
   export EMAIL_PASSWORD=your-app-password
   ```
4. **Restart Flask server**
5. **Test forgot password feature**

The system will now send actual emails instead of just printing to console! 🚀