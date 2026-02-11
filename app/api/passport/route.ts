import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { HappinessEntry, User } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/passport - Get user's passport entries
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const verified = searchParams.get('verified')

    const query: any = { userId: payload.userId }
    if (verified !== null) {
      query.verified = verified === 'true'
    }

    const entries = await HappinessEntry.find(query).sort({ date: -1 })

    return NextResponse.json(entries)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Get passport entries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/passport - Create new entry
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { date, entry, mediaUrls } = await request.json()

    if (!date || !entry) {
      return NextResponse.json({ error: 'Date and entry are required' }, { status: 400 })
    }

    // Create entry
    const newEntry = await HappinessEntry.create({
      userId: payload.userId,
      date: new Date(date),
      entry,
      mediaUrls: mediaUrls || [],
      verified: false,
    })

    // Update user's happiness passport count
    await User.findByIdAndUpdate(payload.userId, {
      $inc: { happinessPassportCount: 1 },
    })

    console.log(`✅ Passport entry created: ${newEntry._id}`)

    return NextResponse.json({
      success: true,
      entry: newEntry,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Create passport entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/passport - Update entry (admin or owner)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string; roles?: string[] }

    const { entryId, entry, mediaUrls, verified, adminNotes } = await request.json()

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const existingEntry = await HappinessEntry.findById(entryId)
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Check ownership or admin
    const isOwner = existingEntry.userId.toString() === payload.userId
    const isAdmin = payload.roles?.includes('admin')

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only admins can verify entries
    const updateData: any = {}
    if (isAdmin) {
      if (verified !== undefined) {
        updateData.verified = verified
        // Update verified count
        await User.findByIdAndUpdate(existingEntry.userId, {
          $inc: { verifiedEntriesCount: verified ? 1 : -1 },
        })
      }
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    }

    // Owner can update entry and media
    if (isOwner) {
      if (entry !== undefined) updateData.entry = entry
      if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls
    }

    const updatedEntry = await HappinessEntry.findByIdAndUpdate(entryId, updateData, { new: true })

    console.log(`✅ Passport entry updated: ${entryId}`)

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Update passport entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/passport - Delete entry
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const entry = await HappinessEntry.findById(entryId)
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (entry.userId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await HappinessEntry.findByIdAndDelete(entryId)

    // Update user's count
    await User.findByIdAndUpdate(payload.userId, {
      $inc: { happinessPassportCount: -1 },
    })

    console.log(`✅ Passport entry deleted: ${entryId}`)

    return NextResponse.json({ success: true, message: 'Entry deleted' })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Delete passport entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

