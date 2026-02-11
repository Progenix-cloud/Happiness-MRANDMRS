import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { Vote } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/votes - Get votes for a resource
export async function GET(request: NextRequest) {
  try {
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

    // Get vote count
    const voteCount = await Vote.countDocuments({
      resourceType,
      resourceId,
    })

    // Check if current user has voted
    const authHeader = request.headers.get('authorization')
    let userHasVoted = false

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }
        const existingVote = await Vote.findOne({
          userId: payload.userId,
          resourceType,
          resourceId,
        })
        userHasVoted = !!existingVote
      } catch {
        // Invalid token, ignore
      }
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
    await connectDB()

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { resourceType, resourceId } = await request.json()

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
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
      userId: payload.userId,
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

      console.log(`✅ Vote removed: ${payload.userId} from ${resourceType}:${resourceId}`)

      return NextResponse.json({
        success: true,
        action: 'removed',
        count: newCount,
        userHasVoted: false,
      })
    }

    // Create new vote
    await Vote.create({
      userId: payload.userId,
      resourceType,
      resourceId,
    })

    // Get updated count
    const newCount = await Vote.countDocuments({
      resourceType,
      resourceId,
    })

    console.log(`✅ Vote added: ${payload.userId} to ${resourceType}:${resourceId}`)

    return NextResponse.json({
      success: true,
      action: 'added',
      count: newCount,
      userHasVoted: true,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
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
    await connectDB()

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
    }

    // Find and delete vote
    const vote = await Vote.findOneAndDelete({
      userId: payload.userId,
      resourceType,
      resourceId,
    })

    if (!vote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Vote deleted: ${payload.userId} from ${resourceType}:${resourceId}`)

    return NextResponse.json({
      success: true,
      message: 'Vote removed',
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

