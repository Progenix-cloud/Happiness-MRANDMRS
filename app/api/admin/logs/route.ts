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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      AdminLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AdminLog.countDocuments(),
    ])

    return NextResponse.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
