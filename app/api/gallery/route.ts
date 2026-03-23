import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Media, User } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const skip = (page - 1) * limit
    const type = searchParams.get('type') // optional filter: 'photo' or 'video'

    const query: any = { verified: true }
    if (type === 'photo' || type === 'video') {
      query.type = type
    }

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name profileImage'),
      Media.countDocuments(query),
    ])

    // Normalize response for client
    const formatted = media.map((item: any) => ({
      id: item._id.toString(),
      url: item.url,
      type: item.type,
      caption: item.caption || '',
      userId: item.userId?._id?.toString() || null,
      userName: item.userId?.name || 'Unknown',
      profileImage: item.userId?.profileImage || '/placeholder-user.jpg',
      createdAt: item.createdAt,
    }))

    return NextResponse.json({ media: formatted, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Get public gallery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
