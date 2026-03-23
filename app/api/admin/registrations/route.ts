import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Registration, User, AdminLog } from '@/lib/models'
import { getUserIdFromRequest } from '@/lib/auth'

async function getAdminUser(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) {
    throw new Error('Unauthorized')
  }
  const user = await User.findById(userId)
  if (!user || !user.roles?.includes('admin')) {
    throw new Error('Admin access required')
  }
  return user
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    await getAdminUser(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const query: any = {}
    if (status) query.status = status

    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .populate('userId', '-password -__v')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments(query),
    ])

    return NextResponse.json({ registrations, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin registrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const adminUser = await getAdminUser(request)

    // for log entries, explicit admin user fetched from DB
    const adminUserId = adminUser._id.toString()

    const { registrationId, status } = await request.json()
    if (!registrationId || !status) {
      return NextResponse.json({ error: 'registrationId and status are required' }, { status: 400 })
    }

    const registration = await Registration.findByIdAndUpdate(registrationId, { status }, { new: true })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    await User.findByIdAndUpdate(registration.userId, {
      registrationStatus: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
    })

    await AdminLog.create({
      actor: adminUserId,
      action: `Set registration ${registrationId} to ${status}`,
      resourceType: 'registration',
      message: `Registration status changed to ${status}`,
    })

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin update registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
