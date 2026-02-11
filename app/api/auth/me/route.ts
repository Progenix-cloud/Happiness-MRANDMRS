import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    // Find user by ID
    const user = await User.findById(payload.userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/auth/me - Update current user
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    // Get update data
    const { name, phone, bio, profileImage } = await request.json()

    // Find and update user
    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
      },
      { new: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`✅ User updated: ${user.email}`)

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

