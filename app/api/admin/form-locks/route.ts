import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, FormLock, AdminLog } from '@/lib/models'
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

    const locks = await FormLock.find().sort({ updatedAt: -1 })
    return NextResponse.json({ locks })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin form-locks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const adminUser = await getAdminUser(request)
    const adminUserId = adminUser._id.toString()

    const { key, name, description } = await request.json()
    if (!key || !name) {
      return NextResponse.json({ error: 'key and name are required' }, { status: 400 })
    }

    const lock = await FormLock.findOneAndUpdate(
      { key },
      {
        name,
        description,
        locked: false,
        updatedBy: adminUser._id,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    )

    await AdminLog.create({
      actor: adminUserId,
      action: `Create/update form lock ${key}`,
      resourceType: 'formLock',
      message: `Form lock ${key} saved`,
    })

    return NextResponse.json({ success: true, lock })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin form-locks POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const adminUser = await getAdminUser(request)
    const adminUserId = adminUser._id.toString()

    const { key, locked } = await request.json()
    if (!key || typeof locked !== 'boolean') {
      return NextResponse.json({ error: 'key and locked boolean are required' }, { status: 400 })
    }

    const lock = await FormLock.findOneAndUpdate(
      { key },
      { locked, updatedBy: adminUserId, updatedAt: new Date() },
      { new: true }
    )

    if (!lock) {
      return NextResponse.json({ error: 'Form lock not found' }, { status: 404 })
    }

    await AdminLog.create({
      actor: adminUserId,
      action: `Form lock ${key} set ${locked}`,
      resourceType: 'formLock',
      message: `Form lock ${key} ${locked ? 'locked' : 'unlocked'}`,
    })

    return NextResponse.json({ success: true, lock })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin form-locks PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
