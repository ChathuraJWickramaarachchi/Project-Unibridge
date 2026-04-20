# Email Configuration Guide for Password Reset OTP

This guide will help you set up Gmail to send OTP emails for password reset functionality.

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left menu
3. Under "How you sign in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification (if not already enabled)

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to **Security**
2. Under "How you sign in to Google", click on **App passwords**
   - Direct link: https://myaccount.google.com/apppasswords
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Enter a name like "UniBridge Backend"
6. Click **Generate**
7. Google will show you a 16-character app password (e.g., `abcd efgh ijkl mnop`)
8. **Copy this password** - you won't be able to see it again!

## Step 3: Configure Environment Variables

Open the `.env` file in the Backend folder and update:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcd efgh ijkl mnop` with the 16-character app password you generated
- Remove spaces from the app password if needed (try both formats)

## Step 4: Restart the Backend Server

After updating the `.env` file, restart your backend server:

```bash
cd Backend
npm run dev
```

You should see: `✅ Email transporter is ready`

## Step 5: Test the OTP Email

1. Go to the forgot password page in your frontend
2. Enter an email address that exists in your database
3. Click "Send OTP" or "Forgot Password"
4. Check your email inbox (and spam folder)
5. You should receive a beautifully formatted OTP email

## Troubleshooting

### Error: "Invalid login" or "Authentication failed"
- Double-check that you're using the **App Password**, not your regular Gmail password
- Make sure 2-Step Verification is enabled
- Try regenerating the app password

### Error: "Connection timeout"
- Check your internet connection
- Verify that Gmail's SMTP service is accessible from your network
- Some corporate networks block SMTP ports

### Email not received
- Check spam/junk folder
- Verify the email address exists in your database
- Check backend console for error messages
- Ensure EMAIL_USER and EMAIL_PASS are correctly set in `.env`

### Error: "Email transporter verification failed"
- Run the server and check the console output
- Verify your Gmail credentials in `.env`
- Try sending a test email manually

## Security Best Practices

1. **Never commit `.env` file to Git** - It's already in `.gitignore`
2. **Use App Passwords** - Never use your regular Gmail password
3. **Rotate App Passwords** - Generate new ones periodically
4. **Monitor Usage** - Check your Google Account for unusual activity
5. **Consider Production Email Service** - For production, use services like:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

## Alternative: Using Other Email Providers

If you want to use a different email provider, update the `config/email.js` file:

### For Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### For Custom SMTP:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourprovider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing Without Email (Development Mode)

If you want to test without setting up email, the OTP is logged to the console:

```
=== FORGOT PASSWORD REQUEST ===
OTP generated: 123456
```

You can use this OTP from the console for testing purposes.
