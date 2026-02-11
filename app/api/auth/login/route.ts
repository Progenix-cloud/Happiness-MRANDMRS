import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, roles: user.roles },
      NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    )

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user.toObject()

    console.log(`✅ User logged in: ${email}`)

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

