# 🔧 OTP Email Setup Guide

## Issue Fixed:
✅ **OTP emails are now being sent during user registration**

---

## 📋 What Was Changed:

### **1. Fixed ES6 Module Import**
- **File:** `Backend/config/email.js`
- **Changed:** `require('nodemailer')` → `import nodemailer from 'nodemailer'`
- **Reason:** Backend uses ES6 modules (`"type": "module"` in package.json)

### **2. Added Email Sending to Registration**
- **File:** `Backend/controllers/authController.js`
- **Added:** Import and call to `sendVerificationOTPEmail()`
- **Now:** OTP email is sent automatically when user registers

### **3. Added Email Configuration to .env**
- **File:** `Backend/.env`
- **Added:** `EMAIL_USER` and `EMAIL_PASS` variables

---

## 🚀 How to Enable Email Sending:

### **Step 1: Get Gmail App Password**

1. **Go to Google Account:**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - Under "How you sign in to Google"
   - Click "2-Step Verification"
   - Follow the setup steps (if not already enabled)

3. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Name it: "UniBridge"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### **Step 2: Update .env File**

Open `/Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend/.env`

Replace these lines:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

With your actual credentials:
```env
EMAIL_USER=youractual@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**IMPORTANT:**
- ✅ Remove spaces from app password
- ✅ Use the 16-character password Google gives you
- ❌ DO NOT use your regular Gmail password

### **Step 3: Restart Backend Server**

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd /Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend
npm run dev
```

You should see:
```
✅ Email transporter is ready
```

---

## 🧪 Testing:

### **Test 1: Register New User**

1. Go to: http://localhost:8080/auth
2. Click "Sign Up"
3. Fill in the form
4. Click "Create Account"
5. **Check your email inbox** (and spam folder)
6. You should receive a beautiful welcome email with OTP code

### **Test 2: Check Backend Logs**

After registration, you should see in terminal:
```
✅ Verification OTP email sent to: user@example.com
=== OTP VERIFICATION ===
OTP for user@example.com : 123456
OTP expires in 10 minutes
=========================
```

---

## 🎨 Email Features:

The OTP email includes:
- ✅ Beautiful HTML design with UniBridge branding
- ✅ Green gradient header
- ✅ Large, clear OTP code display
- ✅ 10-minute expiration notice
- ✅ Security warnings
- ✅ Feature list preview
- ✅ Mobile responsive design

---

## ⚠️ Troubleshooting:

### **Problem: "Email transporter verification failed"**
**Solution:**
1. Check EMAIL_USER is a valid Gmail address
2. Check EMAIL_PASS is an App Password (not regular password)
3. Make sure 2-Step Verification is enabled on Gmail
4. Try regenerating the App Password

### **Problem: Email not received**
**Solution:**
1. Check spam/junk folder
2. Check backend logs for error messages
3. Verify email address is correct
4. Wait 1-2 minutes (sometimes delayed)

### **Problem: "Failed to send OTP email"**
**Solution:**
1. The registration will still work - OTP is logged to console
2. You can use the console OTP for testing
3. Fix email credentials and try again

---

## 📝 Development Mode:

Even if email is not configured, the system still works:
- ✅ OTP is generated and saved to database
- ✅ OTP is logged to console (for testing)
- ✅ User can verify using console OTP
- ✅ Registration doesn't fail if email sending fails

This allows development without email setup!

---

## 🔐 Security Notes:

- ✅ App Passwords are more secure than regular passwords
- ✅ You can revoke App Passwords anytime
- ✅ Each app can have its own password
- ✅ Never commit .env file to Git
- ✅ Use different App Passwords for production

---

## 🎯 Current Status:

- ✅ Email module converted to ES6 imports
- ✅ Registration controller calls email function
- ✅ Email configuration added to .env
- ✅ Fallback to console logging if email fails
- ✅ Beautiful HTML email template ready

**All you need to do is add your Gmail credentials to .env!** 📧
