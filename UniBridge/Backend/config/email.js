const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password (not regular password)
    },
  });
};

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    return false;
  }
};

// Send OTP email (for password reset)
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"UniBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - UniBridge',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 10px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">UniBridge</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Password Reset Verification</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello!</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your UniBridge account. 
                        Please use the OTP code below to verify your identity and reset your password.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; text-align: center; border-radius: 5px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                        <div style="font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                        <p style="margin: 15px 0 0 0; color: #999999; font-size: 13px;">This code will expire in 10 minutes</p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
                      </p>
                      
                      <!-- Security Notice -->
                      <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                          <strong>⚠️ Security Notice:</strong> Never share this OTP code with anyone. Our team will never ask for your OTP.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                        This is an automated message, please do not reply to this email.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 13px;">
                        © ${new Date().getFullYear()} UniBridge. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        UniBridge - Password Reset OTP
        
        Your OTP code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request a password reset, please ignore this email.
        
        © ${new Date().getFullYear()} UniBridge. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset OTP email:', error);
    throw new Error(`Failed to send password reset OTP email: ${error.message}`);
  }
};

// Send Account Verification OTP email (for new registration)
const sendVerificationOTPEmail = async (email, otp, firstName = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"UniBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to UniBridge - Verify Your Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verification OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 10px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">UniBridge</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Welcome Aboard! 🎉</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello${firstName ? ' ' + firstName : ''}!</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Welcome to UniBridge! We're excited to have you join our community. 
                        To complete your registration and activate your account, please use the verification code below.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 25px; margin: 30px 0; text-align: center; border-radius: 5px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                        <div style="font-size: 42px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                        <p style="margin: 15px 0 0 0; color: #999999; font-size: 13px;">This code will expire in 10 minutes</p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Once verified, you'll have full access to all UniBridge features including:
                      </p>
                      
                      <!-- Features List -->
                      <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 2;">
                          <li>Access to university resources</li>
                          <li>Exam and assessment tools</li>
                          <li>Job opportunities and applications</li>
                          <li>Department information and updates</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        If you didn't create an account on UniBridge, please ignore this email or contact our support team.
                      </p>
                      
                      <!-- Security Notice -->
                      <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                          <strong>⚠️ Security Notice:</strong> Never share this verification code with anyone. Our team will never ask for your code.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                        This is an automated message, please do not reply to this email.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 13px;">
                        © ${new Date().getFullYear()} UniBridge. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        UniBridge - Account Verification
        
        Welcome to UniBridge!
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account, please ignore this email.
        
        © ${new Date().getFullYear()} UniBridge. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Account verification OTP email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification OTP email:', error);
    throw new Error(`Failed to send verification OTP email: ${error.message}`);
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationOTPEmail,
  verifyTransporter,
};
