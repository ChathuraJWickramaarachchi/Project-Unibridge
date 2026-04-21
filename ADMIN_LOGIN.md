# Admin Login Credentials

## 🎯 Quick Login

**Admin Dashboard URL:** http://localhost:8081/admin

### Login Credentials:
- **Email:** `admin@unibridge.com`
- **Password:** `admin123`

## 📋 How to Login

1. **Go to Login Page:** http://localhost:8081/auth
2. **Enter Credentials:**
   - Email: admin@unibridge.com
   - Password: admin123
3. **Click Login** - Admin users skip OTP verification
4. **Access Admin Dashboard:** Navigate to http://localhost:8081/admin

## 🔐 Admin Features

Once logged in, you can access:
- **Dashboard Overview** (`/admin`) - View platform statistics
- **User Management** (`/admin/users`) - Manage all users
- **Employer Management** (`/admin/employers`) - Manage employers
- **Feedback** (`/admin/feedback`) - View user feedback
- **Analytics** (`/admin/analytics`) - Platform analytics
- **Settings** (`/admin/settings`) - Admin settings
- **Exam Management** (`/admin/exams/view`) - Create and manage exams
- **Question Management** (`/admin/exams/questions/view`) - Manage exam questions

## ⚠️ Security Notes

- Admin users bypass OTP verification during login
- Admin accounts are auto-verified on first login
- **Important:** Change the default password after first login
- Only users with `role: "admin"` can access the admin dashboard

## 🛠️ Creating Additional Admin Users

To create another admin user, run:
```bash
cd Backend
node seed-admin.js
```

Or manually through the database or API.
