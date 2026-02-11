import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration for nodemailer fallback
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}

// Create transporter (nodemailer fallback)
const transporter = nodemailer.createTransport(emailConfig)

// Helper to send email using either SendGrid (if configured) or nodemailer
async function sendMail({ to, from, subject, html }: { to: string; from: string; subject: string; html: string }) {
  const sendgridKey = process.env.SENDGRID_API_KEY
  if (sendgridKey) {
    try {
      const sgMail = await import('@sendgrid/mail')
      sgMail.default.setApiKey(sendgridKey)
      await sgMail.default.send({ to, from, subject, html })
      console.log(`✅ Email sent via SendGrid to ${to}`)
      return true
    } catch (error) {
      console.error('❌ SendGrid send error:', error)
      // fallthrough to nodemailer
    }
  }

  try {
    await transporter.sendMail({ from, to, subject, html })
    console.log(`✅ Email sent via SMTP to ${to}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error)
    return false
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  // Use a cryptographically secure RNG for OTPs
  try {
    const n = crypto.randomInt(100000, 1000000)
    return n.toString()
  } catch (e) {
    // Fallback to Math.random only if crypto is not available (very unlikely in Node)
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<boolean> {
  const subject = type === 'email_verification' ? 'Your OTP for Mr & Miss Happiness' : 'Password Reset OTP'
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { color: #e74c3c; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💜 Mr & Miss Happiness</h1>
        </div>
        <div class="content">
          <h2>${type === 'email_verification' ? 'Verify Your Email' : 'Reset Your Password'}</h2>
          <p>Hello,</p>
          <p>${type === 'email_verification' ? 'Thank you for registering with Mr & Miss Happiness. Please use the OTP below to verify your email address.' : 'You requested to reset your password. Please use the OTP below to proceed.'}</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>
          <p class="warning">⚠️ This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Mr & Miss Happiness. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendMail({
      from: process.env.EMAIL_FROM || 'noreply@mr-miss-happiness.com',
      to: email,
      subject,
      html: htmlContent,
    })
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error)
    return false
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💜 Welcome to Mr & Miss Happiness</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>🎉 Congratulations! Your account has been successfully created. You're now part of our happiness movement!</p>
          
          <div class="feature">
            <strong>📝 Complete Your Profile</strong>
            <p>Fill in your details and select your category</p>
          </div>
          <div class="feature">
            <strong>💰 Pay Registration Fee</strong>
            <p>Secure your spot with our one-time fee</p>
          </div>
          <div class="feature">
            <strong>📸 Start Your Journey</strong>
            <p>Document daily happiness moments</p>
          </div>
          
          <center>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>&copy; 2025 Mr & Miss Happiness. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendMail({
      from: process.env.EMAIL_FROM || 'noreply@mr-miss-happiness.com',
      to: email,
      subject: 'Welcome to Mr & Miss Happiness! 🎉',
      html: htmlContent,
    })
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    return false
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(
  email: string, 
  name: string, 
  amount: number, 
  transactionId: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💜 Payment Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <div class="success-box">
            <p style="font-size: 48px; margin: 0;">✅</p>
            <p style="font-size: 24px; font-weight: bold; color: #155724; margin: 10px 0 0;">Payment Successful!</p>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span>Transaction ID</span>
              <strong>${transactionId}</strong>
            </div>
            <div class="detail-row">
              <span>Amount Paid</span>
              <strong style="color: #155724;">₹${(amount / 100).toLocaleString()}</strong>
            </div>
            <div class="detail-row">
              <span>Status</span>
              <strong style="color: #28a745;">Completed</strong>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span>Date</span>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>
          
          <p>🎉 Your registration is now complete! You can start your happiness journey by logging into your dashboard.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Mr & Miss Happiness. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    return await sendMail({
      from: process.env.EMAIL_FROM || 'noreply@mr-miss-happiness.com',
      to: email,
      subject: 'Payment Confirmed - Mr & Miss Happiness 🎉',
      html: htmlContent,
    })
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error)
    return false
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    // If SendGrid is configured, assume it's ready; otherwise verify SMTP transporter
    if (process.env.SENDGRID_API_KEY) {
      console.log('✅ SendGrid detected')
      return true
    }
    await transporter.verify()
    console.log('✅ Email server is ready')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    return false
  }
}

export default transporter

