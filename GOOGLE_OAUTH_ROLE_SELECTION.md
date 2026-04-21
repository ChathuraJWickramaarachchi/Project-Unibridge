# Google OAuth Role Selection - Implementation Summary

## Problem
When users signed up using Google authentication, they were automatically assigned the default role "student" with no option to choose between Student or Employer accounts.

## Solution
Added a role selection step that appears after Google authentication for new users.

---

## 🎯 How It Works

### Flow:
1. **User clicks "Sign in with Google"**
2. **Google authentication completes**
3. **User account created** with:
   - `role: 'student'` (default)
   - `phone: '+1-000-000-0000'` (placeholder)
   - `address: 'To be updated'` (placeholder)
   - `authProvider: 'google'`
4. **AuthCallback detects new Google user** by checking:
   - `authProvider === 'google'`
   - `role === 'student'`
   - `phone === '+1-000-000-0000'` (placeholder value)
5. **Redirects to `/role-selection`** page
6. **User chooses**: Student or Employer
7. **Role is updated** in database
8. **User redirected** to appropriate page:
   - Student → Home page (`/`)
   - Employer → Pending approval page (`/pending-approval`)

---

## 📁 Files Created

### Frontend:
- **[pages/RoleSelection.tsx](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Frontend/src/pages/RoleSelection.tsx)**
  - Beautiful role selection UI
  - Student and Employer options with icons
  - Animated cards with hover effects
  - Calls backend API to update role

---

## 🔧 Files Modified

### Backend:
1. **[controllers/userController.js](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend/controllers/userController.js)**
   - Added `updateRole()` function
   - Validates role (student/employer)
   - Sets approval status for employers

2. **[routes/users.js](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend/routes/users.js)**
   - Added route: `PUT /api/users/update-role`

### Frontend:
1. **[pages/AuthCallback.tsx](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Frontend/src/pages/AuthCallback.tsx)**
   - Detects new Google users
   - Redirects to role selection if needed
   - Skips role selection for returning users

2. **[App.tsx](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Frontend/src/App.tsx)**
   - Added route: `/role-selection`

3. **[contexts/AuthContext.tsx](file:///Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Frontend/src/contexts/AuthContext.tsx)**
   - Added `authProvider` field to User type
   - Added `isApproved` field to User type

---

## 🎨 Role Selection Page Features

### Design:
- ✅ Centered card layout
- ✅ Two large clickable options (Student/Employer)
- ✅ Icons for each role (GraduationCap/Building2)
- ✅ Hover animations
- ✅ Loading state during update
- ✅ Clear descriptions of each role
- ✅ Toast notifications for success/error

### Student Role:
- Direct access to home page
- Can take exams, build CV, apply for jobs

### Employer Role:
- Redirected to pending approval page
- Requires admin approval before accessing company dashboard
- Can post jobs, manage applicants, conduct exams

---

## 🔍 Detection Logic

The system identifies new Google users by checking three conditions:

```typescript
const isNewGoogleUser = 
  user.authProvider === 'google' &&           // Signed up with Google
  user.role === 'student' &&                   // Default role
  user.phone === '+1-000-000-0000';           // Placeholder phone
```

If ALL conditions are true → Show role selection
If ANY condition is false → Skip to home (user already set up)

---

## 🚀 API Endpoint

### Update User Role
```
PUT /api/users/update-role
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "role": "student" | "employer"
}

Response (Success):
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "role": "student" | "employer",
    "isApproved": false,  // Only for employers
    "approvalStatus": "pending",  // Only for employers
    ...
  }
}
```

---

## 🧪 Testing

### Test New Google User Flow:
1. Sign in with a new Google account
2. Should see role selection page
3. Select "Student" → Redirected to home
4. OR select "Employer" → Redirected to pending approval

### Test Returning Google User:
1. Sign in with Google account that already selected role
2. Should skip role selection
3. Directly redirected to home page

### Test Normal Login:
1. Sign in with email/password
2. No role selection shown
3. Directly redirected to home page

---

## 📝 User Experience

### First-Time Google User:
```
Google Sign In → Auth Callback → Role Selection → Home/Pending Approval
```

### Returning Google User:
```
Google Sign In → Auth Callback → Home
```

### Normal User (Email/Password):
```
Email Sign Up → Role Selection (during signup) → Email Verification → Home
```

---

## ✨ Benefits

1. **Better UX**: Google users can now choose their account type
2. **Consistent Flow**: Similar to normal registration
3. **Flexible**: Can be extended to ask for more info later
4. **Safe**: Employers still require admin approval
5. **Smart Detection**: Only shows to new users, not returning ones

---

## 🔮 Future Enhancements

Possible improvements:
- Ask for phone number and address during role selection
- Show different onboarding based on role
- Allow role change later (with restrictions)
- Add more roles (e.g., "Admin", "Instructor")
- Collect additional profile information

---

**Implementation Date**: 2025-04-21
**Status**: ✅ Complete and Ready for Testing
