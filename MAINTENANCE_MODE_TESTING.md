# 🔧 Maintenance Mode Testing Guide

## ✅ What's Been Fixed

### **Issue:** Users could still access the system during maintenance mode

### **Root Cause:**
1. Maintenance middleware was created but not applied to routes
2. Middleware couldn't access `req.user` because it ran before authentication
3. Frontend wasn't checking or responding to maintenance mode

### **Solutions Implemented:**

#### **Backend Fixes:**
1. ✅ Applied `checkMaintenanceMode` middleware to ALL user routes
2. ✅ Updated middleware to extract and verify JWT token independently
3. ✅ Middleware now sets `req.user` for downstream routes
4. ✅ Admin users bypass maintenance mode completely
5. ✅ Non-admin users get 503 error with maintenance details

#### **Frontend Fixes:**
1. ✅ Added maintenance mode check in `ProtectedRoute` component
2. ✅ Auto-redirects to `/maintenance` page when mode is active
3. ✅ Checks every 2 minutes for mode changes
4. ✅ Created `maintenanceHelper.js` utility for API calls
5. ✅ Admin users are never redirected

---

## 🧪 Complete Testing Procedure

### **Test 1: Verify Maintenance Mode Blocks Users**

#### **Setup:**
1. **Open 2 browsers** (or 1 regular + 1 incognito)
   - Browser 1: Login as **Admin**
   - Browser 2: Login as **Regular User** (student or employer)

2. **As Admin**, go to: `http://localhost:8080/admin/maintenance`

#### **Steps:**
1. Create a new maintenance:
   - Title: "Test Maintenance"
   - Description: "Testing maintenance mode blocking"
   - Set start/end times (can be past times for testing)
   - Click "Create"

2. **Activate Maintenance Mode:**
   - Find the maintenance in the list
   - Click "🔴 Activate Mode"

3. **Check Regular User Browser:**
   - Try to navigate to any page
   - Should automatically redirect to `/maintenance` page
   - Should see maintenance information
   - Cannot access any features

4. **Check Admin Browser:**
   - Can still access everything normally
   - Can access admin dashboard
   - Can deactivate maintenance mode

#### **Expected Results:**
- ✅ Regular user: Redirected to maintenance page
- ✅ Admin: Full access maintained
- ✅ Backend console shows: `🚫 User blocked during maintenance mode: user@email.com`
- ✅ Backend console shows: `✅ Admin access granted during maintenance mode`

---

### **Test 2: Verify Deactivation Works**

#### **Steps:**
1. **As Admin**, click "✅ Deactivate Mode"

2. **Check Regular User Browser:**
   - Refresh the page
   - Should return to normal
   - Can access all features again

#### **Expected Results:**
- ✅ User regains access immediately
- ✅ Maintenance page disappears
- ✅ All routes accessible

---

### **Test 3: Verify API Blocking**

#### **Steps:**
1. **Activate maintenance mode** (as admin)

2. **Try to access API directly** (as regular user):
   ```bash
   # Get user token from browser localStorage
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5001/api/users/profile
   ```

3. **Check response:**
   ```json
   {
     "success": false,
     "error": "System Maintenance",
     "message": "Test Maintenance",
     "description": "Testing maintenance mode blocking",
     "estimatedCompletion": "2025-04-22T10:00:00.000Z",
     "maintenanceId": "..."
   }
   ```

#### **Expected Results:**
- ✅ All API calls return 503 status
- ✅ Response includes maintenance details
- ✅ No user data is accessible

---

### **Test 4: Verify Email + Banner + Mode Together**

#### **Complete Flow Test:**

1. **Create Maintenance with Email:**
   ```
   Title: "Database Upgrade"
   Description: "Scheduled database maintenance"
   Start Time: Tomorrow
   End Time: Tomorrow + 2 hours
   Severity: High
   ✅ Check "Send email notifications now"
   ```

2. **Verify Emails Sent:**
   - Check backend console for email logs
   - Check user email inboxes
   - Should receive beautifully formatted HTML email

3. **Verify Banner Appears:**
   - Login as regular user
   - Should see maintenance banner at top
   - Shows title, description, and time
   - Can dismiss but reappears on refresh

4. **Activate Maintenance Mode:**
   - As admin, click "Activate Mode"

5. **Verify User Blocked:**
   - User automatically redirected to maintenance page
   - Cannot access any features
   - Sees countdown timer and details

6. **Deactivate Mode:**
   - As admin, click "Deactivate Mode"

7. **Verify User Restored:**
   - User can access system again
   - Banner still shows (until maintenance time passes)

---

## 📊 Backend Console Logs to Watch For

### **When Maintenance Mode Activates:**
```
✅ Admin access granted during maintenance mode
🚫 User blocked during maintenance mode: student@email.com
🚫 User blocked during maintenance mode: employer@email.com
```

### **When API Calls are Blocked:**
```
🚫 User blocked during maintenance mode: user@email.com
```

### **When Emails are Sent:**
```
📧 Attempting to send maintenance email to: user@email.com
📋 Maintenance details: { title: '...', severity: 'high', ... }
📤 Sending email with options: { from: '...', to: '...', subject: '...' }
✅ Maintenance notification email sent successfully to: user@email.com
📬 Message ID: <message-id>
✅ Maintenance emails sent: 10/10
```

---

## 🔍 Troubleshooting

### **Issue: Users can still access system during maintenance**

**Check:**
1. **Backend console** - Do you see blocking logs?
2. **API response** - Use browser DevTools Network tab
3. **Middleware applied** - Check server.js has middleware on routes
4. **Maintenance status** - Verify `isMaintenanceMode: true` in database

**Debug Commands:**
```javascript
// In MongoDB, check maintenance status:
db.maintenances.find({ isMaintenanceMode: true })

// Should return the active maintenance record
```

---

### **Issue: Admin also gets blocked**

**Check:**
1. **User role** - Verify admin user has `role: 'admin'`
2. **Token validity** - Check if token is valid
3. **Console logs** - Look for admin access messages

**Fix:**
```javascript
// Verify admin role in database:
db.users.findOne({ email: 'admin@email.com' }, { role: 1 })
// Should return: { role: 'admin' }
```

---

### **Issue: Maintenance page doesn't show**

**Check:**
1. **Route exists** - Verify `/maintenance` route in App.tsx
2. **Component exists** - Check MaintenancePage.tsx file
3. **Navigation works** - Try navigating manually to `/maintenance`

---

### **Issue: Banner doesn't appear**

**Check:**
1. **Layout integration** - Verify MaintenanceBanner in Layout.tsx
2. **API response** - Check `/api/maintenance/active` returns data
3. **Console errors** - Look for JavaScript errors

**Debug:**
```javascript
// Check if active maintenance exists:
fetch('http://localhost:5001/api/maintenance/active')
  .then(r => r.json())
  .then(console.log)
```

---

## 📋 Routes That Are Protected

All these routes will be blocked during maintenance mode for non-admin users:

```
/api/users/*           - User profile and operations
/api/admin/*           - Admin operations (except maintenance)
/api/feedback/*        - Feedback submissions
/api/departments/*     - Department data
/api/jobs/*            - Job listings
/api/applications/*    - Applications
/api/notifications/*   - Notifications
/api/exams/*           - Exam operations
/api/payments/*        - Payment processing
/api/2fa/*             - Two-factor auth
/api/results/*         - Exam results
```

**Not Blocked:**
```
/api/auth/*            - Login/Register (always accessible)
/api/maintenance/*     - Maintenance endpoints (always accessible)
```

---

## 🎯 Quick Test Checklist

- [ ] Admin can create maintenance
- [ ] Email notifications send correctly
- [ ] Banner appears on all pages
- [ ] Admin can activate maintenance mode
- [ ] Regular users get redirected to maintenance page
- [ ] Admin retains full access during maintenance
- [ ] API calls return 503 for regular users
- [ ] API calls work for admin users
- [ ] Admin can deactivate maintenance mode
- [ ] Users regain access after deactivation
- [ ] Banner disappears after maintenance ends
- [ ] Console logs show proper blocking messages

---

## 🚀 Testing Commands

### **Start Backend:**
```bash
cd /Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend
npm start
```

### **Start Frontend:**
```bash
cd /Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Frontend
npm run dev
```

### **Test Maintenance Emails:**
```bash
cd /Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend
node test-maintenance-emails.js
```

### **Check Database:**
```bash
mongosh
use unibridge
db.maintenances.find().pretty()
db.users.find({ role: 'admin' }).pretty()
```

---

## ✅ Success Criteria

Your maintenance system is working correctly if:

1. ✅ Emails are sent when creating maintenance
2. ✅ Banner shows scheduled maintenance to all users
3. ✅ Activating mode blocks all non-admin users
4. ✅ Users see maintenance page with details
5. ✅ Admin can still access everything
6. ✅ API returns 503 for blocked users
7. ✅ Deactivating mode restores access immediately
8. ✅ All console logs appear correctly

---

**Last Updated:** 2025-04-21
**Status:** ✅ Ready for Testing
