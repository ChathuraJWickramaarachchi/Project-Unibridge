# 🔧 Maintenance Mode - Admin Login Fix

## ✅ Issue Fixed!

### **Problem:**
Admin couldn't login during maintenance mode because the **2FA verification route** (`/api/2fa/login-verify`) had maintenance middleware applied, blocking users who don't have a token yet.

### **Root Cause:**
The login flow is:
1. User enters credentials → `/api/auth/login`
2. If 2FA enabled → `/api/2fa/login-verify` ← **BLOCKED HERE!**
3. Get token → Access system

The maintenance middleware was checking for a token on step 2, but the user doesn't get a token until AFTER step 2 completes!

---

## 🔧 Solution

### **What Changed:**

**File:** [server.js](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend/server.js)

**Before:**
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/users', checkMaintenanceMode, userRoutes);
app.use('/api/2fa', checkMaintenanceMode, twoFactorRoutes); // ❌ BLOCKS LOGIN!
```

**After:**
```javascript
// Auth and 2FA routes MUST NOT have maintenance mode checking
app.use('/api/auth', authRoutes);
app.use('/api/2fa', twoFactorRoutes); // ✅ EXEMPT - allows login

// Maintenance check on all OTHER routes
app.use('/api/users', checkMaintenanceMode, userRoutes);
```

---

## 📋 Routes EXEMPT from Maintenance Mode

These routes work ALWAYS, even during maintenance:

```
✅ /api/auth/*          - Login, Register, Password Reset
✅ /api/2fa/*           - 2FA Verification
✅ /api/maintenance/*   - Maintenance endpoints
```

---

## 🚫 Routes BLOCKED During Maintenance

These routes are blocked for affected users:

```
❌ /api/users/*         - User profile operations
❌ /api/admin/*         - Admin dashboard (after login)
❌ /api/exams/*         - Exam operations
❌ /api/jobs/*          - Job listings
❌ /api/applications/*  - Applications
❌ /api/payments/*      - Payments
❌ /api/results/*       - Results
... and all other routes
```

---

## 🎯 Complete Login Flow During Maintenance

### **Scenario: Admin Login with 2FA**

```
1. Admin enters email/password
   ↓
2. POST /api/auth/login
   ✅ ALLOWED (auth route exempt)
   ↓
3. System requests 2FA code
   ↓
4. Admin enters 2FA code
   ↓
5. POST /api/2fa/login-verify
   ✅ ALLOWED (2FA route exempt)
   ↓
6. Admin receives JWT token
   ↓
7. GET /api/admin/dashboard
   ✅ ALLOWED (admin bypass in middleware)
   ↓
8. Admin can access everything! 🎉
```

### **Scenario: Student Login with 2FA**

```
1. Student enters email/password
   ↓
2. POST /api/auth/login
   ✅ ALLOWED (auth route exempt)
   ↓
3. POST /api/2fa/login-verify
   ✅ ALLOWED (2FA route exempt)
   ↓
4. Student receives JWT token
   ↓
5. GET /api/users/profile
   🚫 BLOCKED (503 - Maintenance mode)
   ↓
6. Frontend redirects to /maintenance page
```

---

## ✅ What Works Now

| Action | Admin | Student | Employer |
|--------|-------|---------|----------|
| **Login** | ✅ Yes | ✅ Yes | ✅ Yes |
| **2FA Verify** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Access Dashboard** | ✅ Yes | 🚫 No | 🚫 No* |
| **Access Profile** | ✅ Yes | 🚫 No | 🚫 No* |
| **All Features** | ✅ Yes | 🚫 No | 🚫 No* |

*If maintenance targets "all" or their specific role

---

## 🧪 Test It Now

### **Test 1: Admin Login During Maintenance**

1. **Activate maintenance mode** (as admin)
   - Target: "All Users"
   - Click "Activate Mode"

2. **Logout**

3. **Login as admin**
   - Enter credentials
   - Complete 2FA (if enabled)
   - **Should work!** ✅

4. **Access admin dashboard**
   - Should have full access ✅
   - Can deactivate maintenance mode ✅

### **Test 2: Student Login During Maintenance**

1. **Keep maintenance mode active**

2. **Login as student** (in incognito)
   - Enter credentials
   - Complete 2FA
   - **Login works!** ✅

3. **Try to access profile**
   - Should be redirected to /maintenance 🚫
   - Cannot access any features

---

## 📊 Console Logs You'll See

### **Admin Login (SUCCESS):**
```
=== MAINTENANCE MIDDLEWARE CALLED ===
Request URL: /api/admin/dashboard
Request method: GET
🔧 Maintenance mode is ACTIVE: Test
📋 Affected users: ['all']
👤 User found: admin@email.com Role: admin
✅ ADMIN ACCESS GRANTED - Admin bypass during maintenance mode
=== END MAINTENANCE CHECK ===
```

### **2FA Verification (NO MIDDLEWARE):**
```
(No maintenance logs - route is exempt!)
```

### **Student Access (BLOCKED):**
```
=== MAINTENANCE MIDDLEWARE CALLED ===
Request URL: /api/users/profile
Request method: GET
🔧 Maintenance mode is ACTIVE: Test
📋 Affected users: ['all']
👤 User found: student@email.com Role: student
🚫 User blocked during maintenance mode: student@email.com (Role: student)
=== END MAINTENANCE CHECK ===
```

---

## 🎯 Key Principles

1. **Users can ALWAYS login** - Auth and 2FA routes are never blocked
2. **Admins can ALWAYS access** - Admin bypass works after login
3. **Only POST-login actions are blocked** - Maintenance affects feature access, not authentication
4. **Graceful degradation** - Users get clear maintenance page with info

---

## ✅ Success Checklist

- [ ] Admin can login during maintenance
- [ ] Admin can complete 2FA during maintenance
- [ ] Admin can access admin dashboard during maintenance
- [ ] Admin can deactivate maintenance mode
- [ ] Students can login during maintenance
- [ ] Students can complete 2FA during maintenance
- [ ] Students are blocked from features after login
- [ ] Students see maintenance page
- [ ] Console logs show correct behavior

---

**Status:** ✅ Fixed - Admin login works during maintenance!
**Last Updated:** 2025-04-21
