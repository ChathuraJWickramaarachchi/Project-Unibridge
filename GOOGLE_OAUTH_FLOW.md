# Google OAuth Flow Diagram

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER CLICKS                              │
│                  "Sign in with Google"                          │
│                   (Frontend - Port 8080)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              REDIRECT TO GOOGLE OAUTH                           │
│         Backend Route: /api/auth/google                         │
│              (Passport Strategy Triggers)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE LOGIN PAGE                            │
│              (User enters credentials)                          │
│                    (google.com)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER GRANTS PERMISSIONS                            │
│              (Email, Profile Access)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE CALLBACK URL                                │
│     http://localhost:5001/api/auth/google/callback              │
│              (Backend receives profile data)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND PROCESSES USER                             │
│                                                                 │
│  1. Check if user exists (by googleId)                         │
│  2. If not, check by email                                     │
│  3. Create or update user record                               │
│  4. Generate JWT token                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              REDIRECT TO FRONTEND                               │
│     http://localhost:8080/auth/callback?token=JWT               │
│              (With authentication token)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND PROCESSES TOKEN                           │
│                                                                 │
│  1. Extract token from URL                                     │
│  2. Store in localStorage                                      │
│  3. Fetch user profile from /api/auth/me                       │
│  4. Update auth context                                        │
│  5. Redirect to home page                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ✅ SUCCESS!                                   │
│              User is logged in and                              │
│              redirected to dashboard                            │
└─────────────────────────────────────────────────────────────────┘
```

## User Scenarios

### Scenario 1: New User (First Time Google Login)
```
User clicks Google Login
    ↓
Google authenticates user
    ↓
Backend receives profile
    ↓
User not found in database
    ↓
Create new user account
    ↓
Set isVerified = true
    ↓
Generate JWT token
    ↓
Redirect to frontend with token
    ↓
User logged in ✅
```

### Scenario 2: Existing User (Already has account with email)
```
User clicks Google Login
    ↓
Google authenticates user
    ↓
Backend receives profile
    ↓
User found by email
    ↓
Link Google ID to account
    ↓
Update authProvider = 'google'
    ↓
Generate JWT token
    ↓
Redirect to frontend with token
    ↓
User logged in ✅
```

### Scenario 3: Returning Google User
```
User clicks Google Login
    ↓
Google authenticates user
    ↓
Backend receives profile
    ↓
User found by googleId
    ↓
Use existing account
    ↓
Generate JWT token
    ↓
Redirect to frontend with token
    ↓
User logged in ✅
```

## File Flow

```
Frontend (Auth.tsx)
    │
    ├─ User clicks "Sign in with Google"
    │
    ▼
Backend (routes/auth.js)
    │
    ├─ GET /api/auth/google
    │   └─ Passport.authenticate('google')
    │       └─ Redirects to Google
    │
    ▼
Google OAuth Server
    │
    ├─ User authenticates
    │
    ▼
Backend (routes/auth.js)
    │
    ├─ GET /api/auth/google/callback
    │   └─ Passport.authenticate('google')
    │       └─ Calls strategy callback
    │
    ▼
Backend (config/passport.js)
    │
    ├─ GoogleStrategy callback
    │   ├─ Find or create user
    │   └─ Return user object
    │
    ▼
Backend (controllers/googleAuthController.js)
    │
    ├─ googleCallback function
    │   ├─ Generate JWT token
    │   └─ Redirect to frontend
    │
    ▼
Frontend (AuthCallback.tsx)
    │
    ├─ Extract token from URL
    ├─ Store in localStorage
    ├─ Fetch user profile
    └─ Redirect to home
```

## Database Operations

```
User Collection Schema:
{
  firstName: String,
  lastName: String,
  email: String (unique),
  googleId: String (unique, sparse),
  authProvider: 'local' | 'google',
  isVerified: Boolean,
  role: 'student' | 'admin' | 'employer',
  profile: {
    avatar: String,
    ...
  }
}

Operations:
1. findOne({ googleId: profile.id })
   ├─ Found → Return user
   └─ Not found → Continue
   
2. findOne({ email: profile.emails[0].value })
   ├─ Found → Link Google ID, return user
   └─ Not found → Create new user
   
3. create({ ...userData })
   └─ New user created with googleId
```

## Security Flow

```
1. User initiates OAuth
   └─ No sensitive data exposed
   
2. Google authenticates
   └─ Secure HTTPS connection
   
3. Backend receives callback
   ├─ Verify state parameter (CSRF protection)
   └─ Exchange code for tokens
   
4. JWT token generation
   ├─ Signed with JWT_SECRET
   ├─ Contains: { id, role }
   └─ Expires in 30 days
   
5. Token sent to frontend
   └─ Via URL parameter (then stored in localStorage)
   
6. Subsequent requests
   └─ Bearer token in Authorization header
```

## Error Handling Flow

```
Error at any step
    ↓
Catch error in callback
    ↓
Log error with details
    ↓
Redirect to: 
  /auth?error=google_auth_failed
    ↓
Frontend shows error toast
    ↓
User can try again
```

---

**Note**: All redirects use HTTPS in production, HTTP in development.
