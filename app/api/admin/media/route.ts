import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, Media, AdminLog } from '@/lib/models'
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
    const verified = searchParams.get('verified')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    const query: any = {}
    if (verified !== null) query.verified = verified === 'true'

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Media.countDocuments(query),
    ])

    return NextResponse.json({ media, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const adminUser = await getAdminUser(request)

    const adminUserId = adminUser._id.toString()

    const { mediaId, verified } = await request.json()
    if (!mediaId || typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'mediaId and verified boolean are required' }, { status: 400 })
    }

    const media = await Media.findByIdAndUpdate(mediaId, { verified }, { new: true })
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    await AdminLog.create({
      actor: adminUserId,
      action: `Verify media ${mediaId} = ${verified}`,
      resourceType: 'media',
      message: `Media verification toggled`,
    })

    return NextResponse.json({ success: true, media })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin verify media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
