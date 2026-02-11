import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { OTP, User } from '@/lib/models'
import { generateOTP, sendOTPEmail } from '@/lib/email'

// POST /api/auth/send-otp - Send OTP for verification
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, type = 'email_verification' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists (for password reset)
    if (type === 'password_reset') {
      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        return NextResponse.json(
          { error: 'User with this email does not exist' },
          { status: 404 }
        )
      }
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate previous OTPs for this email
    await OTP.updateMany(
      { email: email.toLowerCase(), used: false },
      { used: true }
    )

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      type,
    })

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, type)
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      )
    }

    console.log(`✅ OTP sent to ${email}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

