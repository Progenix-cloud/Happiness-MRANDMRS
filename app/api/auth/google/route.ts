import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from '@/lib/email'
import { hash } from 'bcryptjs'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

// POST /api/auth/google - handle google id_token from client
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    // Verify token with Google's tokeninfo endpoint
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
    }

    const payload = await res.json()

    // Verify audience
    if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })
    }

    const email = (payload.email || '').toLowerCase()
    const name = payload.name || ''
    const picture = payload.picture || ''

    if (!email) {
      return NextResponse.json({ error: 'Email not available from Google' }, { status: 400 })
    }

    // Find or create user
    let user = await User.findOne({ email })
    if (!user) {
      // Generate a random password for OAuth users and hash it to satisfy schema
      const randomPassword = Math.random().toString(36).slice(-12)
      const hashedPassword = await hash(randomPassword, 12)

      user = await User.create({
        email,
        name,
        phone: null,
        password: hashedPassword,
        roles: ['participant'],
        registrationStatus: 'pending',
        happinessPassportCount: 0,
        verifiedEntriesCount: 0,
        profileImage: picture,
        // mark email verified for OAuth users
        emailVerified: true,
      })

      // Send welcome email (best-effort)
      try { await sendWelcomeEmail(email, name || email) } catch (e) { /* noop */ }
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
