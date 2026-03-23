import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { Registration, User } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const cookieToken = request.cookies.get('auth_token')
  return cookieToken ? cookieToken.value : null
}

async function getAdminUser(request: NextRequest) {
  const payload = getJwtPayload(request)
  const user = await User.findById(payload.userId)
  if (!user || !user.roles?.includes('admin')) {
    throw new Error('Admin access required')
  }
  return user
}

function getJwtPayload(request: NextRequest): { userId: string; roles?: string[] } {
  const token = getTokenFromRequest(request)
  if (!token) {
    throw new Error('Unauthorized')
  }
  return jwt.verify(token, NEXTAUTH_SECRET) as { userId: string; roles?: string[] }
}

// GET /api/registration - Get user's registration
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const payload = getJwtPayload(request)

    const registration = await Registration.findOne({ userId: payload.userId })
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Get registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/registration - Create/update registration
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const payload = getJwtPayload(request)

    const { category, formData, submit = false } = await request.json()

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Check if registration exists
    let registration = await Registration.findOne({ userId: payload.userId })

    if (registration) {
      // Update existing registration
      registration.category = category
      registration.formData = { ...registration.formData, ...formData }
      if (submit) {
        registration.status = 'submitted'
        registration.submittedAt = new Date()
      }
      await registration.save()
    } else {
      // Create new registration
      registration = await Registration.create({
        userId: payload.userId,
        category,
        formData: formData || {},
        status: submit ? 'submitted' : 'draft',
        ...(submit && { submittedAt: new Date() }),
      })
    }

    // Update user's category
    await User.findByIdAndUpdate(payload.userId, { category })

    console.log(`✅ Registration ${submit ? 'submitted' : 'saved'}: ${payload.userId}`)

    return NextResponse.json({
      success: true,
      registration,
      status: submit ? 'submitted' : 'draft',
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Create registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/registration - Update registration status (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    await getAdminUser(request)

    const { registrationId, status } = await request.json()

    if (!registrationId || !status) {
      return NextResponse.json({ error: 'Registration ID and status are required' }, { status: 400 })
    }

    const registration = await Registration.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true }
    )

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Update user's registration status
    await User.findByIdAndUpdate(registration.userId, {
      registrationStatus: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
    })

    console.log(`✅ Registration ${status}: ${registrationId}`)

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Update registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

