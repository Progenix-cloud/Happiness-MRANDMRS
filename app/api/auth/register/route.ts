 import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { User, OTP } from '@/lib/models'
import { generateOTP, sendOTPEmail } from '@/lib/email'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

function ensureSecret() {
  if (!NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set')
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
}

// POST /api/auth/register - Register new user
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

    const { email, password, name, phone } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      type: 'email_verification',
    })

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, 'email_verification')
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    // Create user (unverified initially)
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      password: hashedPassword,
      roles: ['participant'],
      registrationStatus: 'pending',
      happinessPassportCount: 0,
      verifiedEntriesCount: 0,
    })

    // Generate temporary JWT token and set as HttpOnly cookie for verification flow
    ensureSecret()
    const token = jwt.sign(
      { userId: user._id, email: user.email, step: 'email_verification' },
      NEXTAUTH_SECRET,
      { expiresIn: '1h' }
    )

    const res = NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      requiresVerification: true,
    })

    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    })

    console.log(`✅ User registered: ${email}`)
    return res
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

