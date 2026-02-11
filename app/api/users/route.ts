import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { User, HappinessEntry, Media, Payment } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string; roles?: string[] }

    // Check if admin
    if (!payload.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: any = {}
    if (status) {
      query.registrationStatus = status
    }

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/users/profile - Get current user's profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { name, phone, bio, profileImage } = await request.json()

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/users/[id]/passport-entries - Get user's passport entries
export async function GET_passport(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string; roles?: string[] }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || payload.userId

    // Non-admin can only access their own entries
    if (userId !== payload.userId && !payload.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const entries = await HappinessEntry.find({ userId }).sort({ date: -1 })

    return NextResponse.json(entries)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Get passport entries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

