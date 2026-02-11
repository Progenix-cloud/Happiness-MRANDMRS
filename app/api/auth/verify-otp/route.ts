import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { OTP, User } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

function ensureSecret() {
  if (!NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set')
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
}

// POST /api/auth/verify-otp - Verify OTP and complete email verification
export async function POST(request: NextRequest) {
  try {
    ensureSecret()
    await connectDB()

    let body: any
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { email, otp, type = 'email_verification' } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, { used: true })

    if (type === 'email_verification') {
      // Verify user email
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { emailVerified: true }
      )

      // Generate full JWT token
      const user = await User.findOne({ email: email.toLowerCase() })
      if (user) {
        ensureSecret()
        const token = jwt.sign(
          { userId: user._id, email: user.email, roles: user.roles },
          NEXTAUTH_SECRET,
          { expiresIn: '7d' }
        )

        const { password: _, ...userWithoutPassword } = user.toObject()

        console.log(`✅ Email verified: ${email}`)

        return NextResponse.json({
          success: true,
          message: 'Email verified successfully',
          user: userWithoutPassword,
          token,
        })
      }
    } else if (type === 'password_reset') {
      // For password reset, return a reset token
      ensureSecret()
      const resetToken = jwt.sign(
        { email: email.toLowerCase(), type: 'password_reset' },
        NEXTAUTH_SECRET,
        { expiresIn: '15m' }
      )

      console.log(`✅ OTP verified for password reset: ${email}`)

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        resetToken,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

