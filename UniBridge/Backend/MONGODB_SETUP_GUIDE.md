# MongoDB Atlas Connection Setup Guide

## Problem
You're getting the error: 
```
Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

This means MongoDB Atlas is blocking your connection because your IP address is not on the whitelist.

## Solution: Whitelist Your IP Address

### Step 1: Log in to MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Sign in with your credentials

### Step 2: Navigate to Network Access
1. Select your project (UniBridge)
2. In the left sidebar, click on **"Network Access"** (under "Security")

### Step 3: Add Your IP Address

**Option A: Add Your Current IP (Recommended)**
1. Click the **"+ ADD IP ADDRESS"** button
2. Click **"ADD CURRENT IP ADDRESS"**
3. Give it a description (e.g., "Home Office" or "Development Machine")
4. Click **"Confirm"**

**Option B: Allow All IPs (Development Only)**
1. Click the **"+ ADD IP ADDRESS"** button
2. Click **"ALLOW ACCESS FROM ANYWHERE"**
3. This adds `0.0.0.0/0` to the whitelist
4. Click **"Confirm"**

⚠️ **WARNING:** Only use Option B for development/testing. For production, always whitelist specific IPs!

### Step 4: Wait for Changes
- Changes may take **2-5 minutes** to take effect
- You'll see a green checkmark when the IP is active

### Step 5: Test Connection
Run the diagnostic tool:
```bash
node test-mongodb.js
```

If successful, you should see:
```
✅ CONNECTION SUCCESSFUL!
```

## Troubleshooting

### Still Can't Connect?

1. **Check if you added the correct IP**
   - Visit https://whatismyipaddress.com/ to see your current IP
   - Compare with what you added in Atlas

2. **Restart your backend server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm start
   ```

3. **Verify your connection string**
   - Check `.env` file has correct `MONGODB_URI`
   - Ensure password doesn't have unescaped special characters
   - Special characters like `@`, `#`, `$`, `%` must be URL-encoded

4. **Test with MongoDB Compass**
   - Download MongoDB Compass: https://www.mongodb.com/products/compass
   - Try connecting using your connection string
   - If Compass works but your app doesn't, check your code configuration

5. **Check MongoDB Atlas Cluster Status**
   - Make sure your cluster is **running** (not paused)
   - Check for any service alerts in Atlas

### Common Password Encoding Issues

If your password contains special characters, they must be URL-encoded:

| Character | Encode As |
|-----------|-----------|
| @         | %40       |
| #         | %23       |
| $         | %24       |
| %         | %25       |
| &         | %26       |
| =         | %3D       |
| +         | %2B       |
| /         | %2F       |

Example:
- Original: `MyP@ssw0rd!`
- Encoded: `MyP%40ssw0rd!`

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** for sensitive data
3. **Restrict IP whitelist** in production
4. **Use strong passwords** for database users
5. **Enable 2FA** on your MongoDB Atlas account
6. **Regularly audit** access logs in Atlas

## Quick Reference

- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Network Access**: Security → Network Access
- **Connection String**: Found in Database → Connect → Drivers
- **Documentation**: https://www.mongodb.com/docs/atlas/security/ip-access-list/
