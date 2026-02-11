import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import { User, Session } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

function ensureSecret() {
  if (!NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set')
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
}

// POST /api/auth/login - User login
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

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token and create a persistent session; set HttpOnly cookies
    ensureSecret()
    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    )

    // Create long-lived session_id token to persist login across browser restarts (30 days)
    const sessionId = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await Session.create({
      sessionId,
      userId: user._id,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      expiresAt,
    })

    // Return user without sensitive data, set cookies
    const { password: _, ...userWithoutPassword } = user.toObject()

    const res = NextResponse.json({ user: userWithoutPassword })
    // Short-lived JWT (compatibility)
    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    // Persistent session id
    res.cookies.set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })

    console.log(`✅ User logged in: ${email}`)
    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

