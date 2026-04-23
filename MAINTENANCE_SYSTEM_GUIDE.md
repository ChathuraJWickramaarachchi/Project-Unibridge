# 🔧 Maintenance Notification System - Complete Setup Guide

## ✅ Implementation Complete!

Your UniBridge application now has a complete maintenance notification and management system with **email notifications** and **maintenance mode** capabilities.

---

## 🎯 Features Implemented

### 1. **Email Notifications (Option 3)**
- ✅ Send beautifully formatted HTML emails to all users
- ✅ Target specific user types (students, employers, or all)
- ✅ Track email delivery status
- ✅ Schedule emails in advance
- ✅ Severity-based email subjects and styling

### 2. **Maintenance Mode (Option 4)**
- ✅ Full system lockdown during maintenance
- ✅ Blocks all non-admin users
- ✅ Beautiful maintenance page with countdown timer
- ✅ Admins can still access the system
- ✅ Auto-deactivate at scheduled time

### 3. **Admin Dashboard**
- ✅ Create maintenance notifications
- ✅ Schedule start/end times
- ✅ Set severity levels (Low, Medium, High, Critical)
- ✅ Activate/deactivate maintenance mode with one click
- ✅ Send email notifications manually
- ✅ View maintenance history and statistics

### 4. **User-Facing Features**
- ✅ Maintenance banner shows on all pages
- ✅ Color-coded by severity
- ✅ Dismissible but reappears on page refresh
- ✅ Countdown to maintenance start
- ✅ Real-time status updates

---

## 📁 Files Created

### Backend:
```
✅ models/Maintenance.js                    - Database schema
✅ controllers/maintenanceController.js     - All CRUD operations
✅ middleware/maintenance.js                - Maintenance mode blocker
✅ routes/maintenance.js                    - API endpoints
✅ config/email.js                          - Email notification function (updated)
✅ server.js                                - Routes integrated (updated)
```

### Frontend:
```
✅ pages/Admin/Maintenance.tsx              - Admin dashboard
✅ components/MaintenanceBanner.tsx         - Banner for all pages
✅ pages/MaintenancePage.tsx                - Full maintenance mode page
✅ components/Layout.tsx                    - Banner integrated (updated)
✅ App.tsx                                  - Routes added (updated)
```

---

## 🚀 How to Use

### **For Admins:**

#### 1. **Access Maintenance Dashboard**
- Login as admin
- Navigate to: `http://localhost:8080/admin/maintenance`
- You'll see statistics and maintenance history

#### 2. **Schedule Maintenance**
1. Click "+ Schedule Maintenance"
2. Fill in the form:
   - **Title**: "Database Upgrade" 
   - **Description**: "We'll be upgrading our database servers..."
   - **Type**: Scheduled / Urgent / Emergency
   - **Severity**: Low / Medium / High / Critical
   - **Start Time**: When maintenance begins
   - **End Time**: When maintenance ends
   - **Affected Users**: All / Students / Employers
   - **Send Email Now**: Check to send emails immediately

3. Click "Create Maintenance"

#### 3. **Send Email Notifications**
- If you didn't send emails during creation:
  - Find the maintenance in the list
  - Click "Send Emails" button
  - System sends to all targeted users

#### 4. **Activate Maintenance Mode**
When ready to start maintenance:
1. Find the scheduled maintenance
2. Click "🔴 Activate Mode"
3. **All non-admin users will now see the maintenance page**
4. Admins can still access everything

#### 5. **Deactivate Maintenance Mode**
When maintenance is complete:
1. Click "✅ Deactivate Mode"
2. System returns to normal
3. Users can access the app again

---

## 📊 API Endpoints

### Public Endpoints:
```http
GET    /api/maintenance/check          - Check if maintenance mode is active
GET    /api/maintenance/active         - Get current active maintenance
GET    /api/maintenance/upcoming       - Get upcoming scheduled maintenance
```

### Admin Endpoints (Requires Authentication):
```http
POST   /api/maintenance                    - Create maintenance
GET    /api/maintenance                    - Get all maintenance
GET    /api/maintenance/stats              - Get statistics
PUT    /api/maintenance/:id/activate       - Activate maintenance mode
PUT    /api/maintenance/:id/deactivate     - Deactivate maintenance mode
PUT    /api/maintenance/:id/cancel         - Cancel maintenance
POST   /api/maintenance/:id/send-emails    - Send email notifications
```

---

## 🎨 User Experience Flow

### **Scenario 1: Scheduled Maintenance (Before)**
```
1. Admin schedules maintenance 24h in advance
2. System sends emails to all users
3. Banner appears on all pages: "⚠️ Scheduled maintenance on [date]"
4. Users can dismiss, but it reappears
5. Countdown shows time until maintenance
```

### **Scenario 2: During Maintenance**
```
1. Admin clicks "Activate Mode"
2. All non-admin users see full maintenance page
3. Shows:
   - Maintenance title & description
   - Estimated completion time
   - Countdown timer
   - Contact information
4. Admins can still access dashboard
```

### **Scenario 3: After Maintenance**
```
1. Admin clicks "Deactivate Mode"
2. System returns to normal
3. Users can access everything
4. Banner disappears
```

---

## 📧 Email Template

Emails sent to users include:
- ✅ Beautiful gradient header
- ✅ Maintenance title and description
- ✅ Start and end times
- ✅ Severity level indicator
- ✅ What to expect during maintenance
- ✅ Contact information
- ✅ Professional footer

---

## 🎯 Severity Levels

| Severity | Color | Use Case |
|----------|-------|----------|
| **Low** | 🔵 Blue | Minor updates, brief downtime |
| **Medium** | 🟡 Yellow | Scheduled maintenance, 1-2 hours |
| **High** | 🟠 Orange | Major updates, 2-4 hours |
| **Critical** | 🔴 Red | Emergency fixes, system down |

---

## 🧪 Testing Guide

### Test 1: Create Maintenance
```bash
1. Login as admin
2. Go to /admin/maintenance
3. Create a test maintenance
4. Verify it appears in the list
```

### Test 2: Send Emails
```bash
1. Click "Send Emails" on a scheduled maintenance
2. Check email inbox
3. Verify email format and content
```

### Test 3: Activate Maintenance Mode
```bash
1. Open normal user account in another browser
2. As admin, activate maintenance mode
3. Normal user should see maintenance page
4. Admin should still have full access
```

### Test 4: Banner Display
```bash
1. Schedule maintenance for future
2. Banner should appear on all pages
3. Dismiss it
4. Refresh page - should reappear
```

### Test 5: Deactivate Mode
```bash
1. As admin, deactivate maintenance mode
2. Normal users should regain access
3. Banner should disappear
```

---

## 🔧 Configuration

### Environment Variables (already set):
```env
EMAIL_USER=dasanayakadushan@gmail.com
EMAIL_PASS=your-app-password
```

### Email Settings:
- Uses your existing Gmail configuration
- Sends from: `UniBridge <dasanayakadushan@gmail.com>`
- HTML formatted emails
- Severity-based subject lines

---

## 📱 Banner Customization

The maintenance banner is fully customizable in `MaintenanceBanner.tsx`:

```typescript
// Change colors
const colors = {
  low: "bg-blue-100 ...",
  medium: "bg-yellow-100 ...",
  high: "bg-orange-100 ...",
  critical: "bg-red-100 ...",
};

// Auto-refresh interval
const interval = setInterval(fetchActiveMaintenance, 5 * 60 * 1000); // 5 minutes
```

---

## 🛡️ Security Features

1. **Admin-Only Access**: Only admins can create/manage maintenance
2. **Middleware Protection**: Maintenance mode enforced at API level
3. **Graceful Degradation**: If DB fails, allows access (fail-safe)
4. **IP Whitelisting Ready**: Can add admin IP whitelist if needed

---

## 📈 Statistics Dashboard

Admin dashboard shows:
- Total maintenance notifications
- Scheduled count
- Active count
- Completed count
- Next 24 hours count
- Maintenance mode status

---

## 🎨 UI Components

### Admin Dashboard Features:
- 📊 Statistics cards
- 📝 Create form with validation
- 📋 Maintenance list with status badges
- ⚡ Quick action buttons
- 📧 Email status indicators
- 🎨 Color-coded severity

### User-Facing Components:
- 🎯 Dismissible banner
- ⏰ Countdown timer
- 📅 Date/time display
- 🔴 Active maintenance indicator
- 📱 Responsive design
- 🌙 Dark mode support

---

## 🚨 Emergency Maintenance

For urgent situations:
1. Go to `/admin/maintenance`
2. Click "+ Schedule Maintenance"
3. Set type to "Emergency"
4. Set severity to "Critical"
5. Set start time to now
6. Check "Send Email Now"
7. Click "Activate Mode"

This will:
- ✅ Send immediate emails
- ✅ Show critical banner
- ✅ Block user access
- ✅ Display emergency page

---

## 💡 Best Practices

1. **Schedule in Advance**: Give users 24-48 hours notice
2. **Use Appropriate Severity**: Don't cry wolf - match severity to impact
3. **Clear Descriptions**: Explain what's happening and why
4. **Realistic Timeframes**: Add buffer time to estimates
5. **Test Emails First**: Send to yourself before mass email
6. **Monitor Active Mode**: Don't forget to deactivate
7. **Communicate Completion**: Consider sending completion email

---

## 🔮 Future Enhancements

Possible additions:
- [ ] WebSocket real-time updates
- [ ] Push notifications
- [ ] SMS alerts for critical maintenance
- [ ] Maintenance templates
- [ ] Recurring maintenance schedules
- [ ] User notification preferences
- [ ] Maintenance calendar view
- [ ] Automated status page

---

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Verify email configuration
3. Check database connection
4. Review browser console for frontend errors

---

## ✅ Quick Start Checklist

- [x] Backend models created
- [x] API endpoints implemented
- [x] Email service configured
- [x] Frontend components built
- [x] Routes added
- [x] Banner integrated
- [x] Admin dashboard ready
- [x] Maintenance mode working

**You're all set! 🎉**

---

**Last Updated**: 2025-04-21
**Version**: 1.0.0
**Status**: ✅ Production Ready
