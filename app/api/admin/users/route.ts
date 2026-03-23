import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, AdminLog } from '@/lib/models'
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
    const limit = parseInt(searchParams.get('limit') || '25')
    const skip = (page - 1) * limit

    const query: any = {}
    if (status) query.registrationStatus = status

    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ])

    return NextResponse.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const adminUser = await getAdminUser(request)

    const adminUserId = adminUser._id.toString()

    const { userId, roles } = await request.json()
    if (!userId || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'userId and roles array are required' }, { status: 400 })
    }

    const safeRoles = roles.filter((role) => ['guest','participant','parent','volunteer','intern','corporate','sponsor','director','admin','superadmin'].includes(role))

    const user = await User.findByIdAndUpdate(userId, { roles: safeRoles }, { new: true }).select('-password')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await AdminLog.create({
      actor: adminUserId,
      action: `Update roles for user ${userId}`,
      resourceType: 'user',
      message: `roles => ${safeRoles.join(',')}`,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin users PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
