import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Vote } from '@/lib/models'
import { getUserIdFromRequest, ensureSecret } from '@/lib/auth'

const RESOURCE_TYPE_VALUES = ['contestant', 'entry'] as const
const RESOURCE_ID_RE = /^[A-Za-z0-9_-]{1,100}$/

// GET /api/votes - Get votes for a resource
export async function GET(request: NextRequest) {
  try {
    ensureSecret()
    await connectDB()

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType') // 'contestant' | 'entry'
    const resourceId = searchParams.get('resourceId')

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
    }

    if (!RESOURCE_TYPE_VALUES.includes(resourceType as any)) {
      return NextResponse.json({ error: 'Invalid resourceType' }, { status: 400 })
    }

    if (!RESOURCE_ID_RE.test(resourceId)) {
      return NextResponse.json({ error: 'Invalid resourceId format' }, { status: 400 })
    }

    // Get vote count
    const voteCount = await Vote.countDocuments({
      resourceType,
      resourceId,
    })

    // Check if current user has voted (support cookie-based auth)
    let userHasVoted = false
    const currentUserId = await getUserIdFromRequest(request)
    if (currentUserId) {
      const existingVote = await Vote.findOne({
        userId: currentUserId,
        resourceType,
        resourceId,
      })
      userHasVoted = !!existingVote
    }

    return NextResponse.json({
      resourceType,
      resourceId,
      count: voteCount,
      userHasVoted,
    })
  } catch (error) {
    console.error('Get votes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/votes - Create a vote
export async function POST(request: NextRequest) {
  try {
    ensureSecret()
    await connectDB()

    // Verify authentication (support cookie-based auth)
    ensureSecret()
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { resourceType, resourceId } = body

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
    }

    if (!RESOURCE_TYPE_VALUES.includes(resourceType)) {
      return NextResponse.json({ error: 'Invalid resourceType' }, { status: 400 })
    }

    if (!RESOURCE_ID_RE.test(resourceId)) {
      return NextResponse.json({ error: 'Invalid resourceId format' }, { status: 400 })
    }

    // Check if resourceType is valid
    if (!['contestant', 'entry'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resourceType' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      userId,
      resourceType,
      resourceId,
    })

    if (existingVote) {
      // Unlike (remove vote)
      await Vote.findByIdAndDelete(existingVote._id)

      // Get updated count
      const newCount = await Vote.countDocuments({
        resourceType,
        resourceId,
      })

      console.log(`✅ Vote removed: ${userId} from ${resourceType}:${resourceId}`)

      return NextResponse.json({
        success: true,
        action: 'removed',
        count: newCount,
        userHasVoted: false,
      })
    }

    // Create new vote
    await Vote.create({
      userId,
      resourceType,
      resourceId,
    })

    // Get updated count
    const newCount = await Vote.countDocuments({
      resourceType,
      resourceId,
    })

    console.log(`✅ Vote added: ${userId} to ${resourceType}:${resourceId}`)

    return NextResponse.json({
      success: true,
      action: 'added',
      count: newCount,
      userHasVoted: true,
    })
  } catch (error) {
    console.error('Create vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/votes - Remove a vote
export async function DELETE(request: NextRequest) {
  try {
    ensureSecret()
    await connectDB()

    // Verify authentication (support cookie-based auth)
    ensureSecret()
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
    }

    if (!RESOURCE_TYPE_VALUES.includes(resourceType as any)) {
      return NextResponse.json({ error: 'Invalid resourceType' }, { status: 400 })
    }

    if (!RESOURCE_ID_RE.test(resourceId)) {
      return NextResponse.json({ error: 'Invalid resourceId format' }, { status: 400 })
    }

    // Find and delete vote
    const vote = await Vote.findOneAndDelete({
      userId,
      resourceType,
      resourceId,
    })

    if (!vote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Vote deleted: ${userId} from ${resourceType}:${resourceId}`)

    return NextResponse.json({
      success: true,
      message: 'Vote removed',
    })
  } catch (error) {
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

