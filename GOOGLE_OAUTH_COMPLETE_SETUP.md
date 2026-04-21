# Google OAuth 2.0 Setup Guide for UniBridge

This guide will walk you through setting up Google Authentication from scratch.

## Prerequisites

- Google Account
- UniBridge project running locally

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `UniBridge`
5. Click **CREATE**
6. Wait for project creation, then select it

---

## Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for `Google+ API`
3. Click on it
4. Click **Enable**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Click **CREATE**

### Fill in App Information:
- **App name**: `UniBridge`
- **User support email**: Select your email
- **App logo**: (Optional) Upload your logo
- **Application home page**: `http://localhost:8080`
- **Authorized domains**: Leave blank for development
- **Developer contact information**: Enter your email

4. Click **SAVE AND CONTINUE**

### Scopes:
1. Click **ADD OR REMOVE SCOPES**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **UPDATE**
4. Click **SAVE AND CONTINUE**

### Test Users:
1. Click **ADD USERS**
2. Add your Google email address (the one you'll use to test)
3. Click **SAVE AND CONTINUE**
4. Click **BACK TO DASHBOARD**

---

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**

### Configure OAuth Client:
- **Application type**: `Web application`
- **Name**: `UniBridge Web Client`

### Authorized JavaScript Origins:
Click **+ ADD URI** and add:
```
http://localhost:8080
http://localhost:5001
```

### Authorized Redirect URIs:
Click **+ ADD URI** and add:
```
http://localhost:5001/api/auth/google/callback
```

4. Click **CREATE**

### Save Your Credentials:
A popup will show your credentials:
- **Client ID**: `XXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`
- **Client Secret**: `XXXXXXXXXXXXXXXXXXXXXXXX`

⚠️ **Copy these values - you'll need them in the next step!**

---

## Step 5: Update Backend .env File

Open `/UniBridge/Backend/.env` and add/update these lines:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

Replace `your-client-id-here` and `your-client-secret-here` with the actual values from Google Cloud Console.

---

## Step 6: Install Required Packages

```bash
cd /Users/dushanchamuditha/Desktop/Project-Unibridge/UniBridge/Backend
npm install passport passport-google-oauth20
```

---

## Step 7: Verify Setup

Your `.env` file should look like this:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
BACKEND_URL=http://localhost:5001

# Google OAuth Configuration
GOOGLE_CLIENT_ID=570696172201-7a4ld5qsm841bfe5lm9kauceds3udvah.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Frontend URL for redirects
FRONTEND_URL=http://localhost:8080
```

---

## Step 8: Test Your Setup

1. Start backend server:
   ```bash
   cd UniBridge/Backend
   npm start
   ```

2. Look for this in console:
   ```
   ✅ Google OAuth strategy configured
   ```

3. Start frontend:
   ```bash
   cd UniBridge/Frontend
   npm run dev
   ```

4. Go to `http://localhost:8080/auth`
5. Click "Sign in with Google"
6. You should be redirected to Google's sign-in page

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
http://localhost:5001/api/auth/google/callback
```

### Error: "access_denied"
**Solution**: Add your Google email as a test user in OAuth consent screen

### Error: "Unknown authentication strategy"
**Solution**: Restart your backend server after adding credentials to .env

### Google Sign-in Button Not Showing
**Solution**: Check browser console for errors and verify frontend is running on port 8080

---

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to version control
- Keep `GOOGLE_CLIENT_SECRET` private
- In production, use environment variables from your hosting provider
- The `.env` file is already in `.gitignore`

---

## Next Steps

After setup is complete, I'll help you implement the Google OAuth code in your backend and frontend.
