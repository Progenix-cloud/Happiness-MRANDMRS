import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { User, HappinessEntry, Media, Registration, Vote, View } from '@/lib/models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/contestants/[slug] - Get single contestant by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params

    // Find user by slug (derived from name)
    const user = await User.findOne({
      slug: slug,
      registrationStatus: 'approved',
    })

    if (!user) {
      // Try finding by name directly (for backward compatibility)
      const nameFromSlug = slug.replace(/-/g, ' ')
      const userByName = await User.findOne({
        name: { $regex: new RegExp(`^${nameFromSlug}$`, 'i') },
        registrationStatus: 'approved',
      })

      if (!userByName) {
        return NextResponse.json({ error: 'Contestant not found' }, { status: 404 })
      }
    }

    const targetUser = user || await User.findOne({
      name: { $regex: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') },
      registrationStatus: 'approved',
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 })
    }

    const targetUserIdStr = targetUser._id.toString()

    // Get current user ID (if authenticated)
    let currentUserId: string | null = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }
        currentUserId = payload.userId
      } catch {
        // Invalid token, continue without user
      }
    }

    // Track view (for analytics)
    try {
      await View.create({
        resourceType: 'contestant',
        resourceId: targetUserIdStr,
        userId: currentUserId || undefined,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
    } catch (error) {
      // Silently fail view tracking
      console.log('View tracking failed (non-critical)')
    }

    // Get registration data
    const registration = await Registration.findOne({ userId: targetUser._id })

    // Get verified happiness entries with real like counts
    const entries = await HappinessEntry.find({
      userId: targetUser._id,
      verified: true,
    }).sort({ date: -1 }).limit(20)

    // Get gallery media
    const galleryItems = await Media.find({
      userId: targetUser._id,
      verified: true,
    }).sort({ createdAt: -1 }).limit(12)

    // Get real like and view counts from database
    const [likeCount, viewCount] = await Promise.all([
      Vote.countDocuments({ resourceType: 'contestant', resourceId: targetUserIdStr }),
      View.countDocuments({ resourceType: 'contestant', resourceId: targetUserIdStr }),
    ])

    // Check if current user has liked
    let userHasVoted = false
    if (currentUserId) {
      const vote = await Vote.findOne({
        userId: currentUserId,
        resourceType: 'contestant',
        resourceId: targetUserIdStr,
      })
      userHasVoted = !!vote
    }

    // Get entries with like counts
    const entriesWithLikes = await Promise.all(
      entries.map(async (entry) => {
        const entryIdStr = entry._id.toString()
        const entryLikes = await Vote.countDocuments({
          resourceType: 'entry',
          resourceId: entryIdStr,
        })
        
        let userHasLikedEntry = false
        if (currentUserId) {
          const entryVote = await Vote.findOne({
            userId: currentUserId,
            resourceType: 'entry',
            resourceId: entryIdStr,
          })
          userHasLikedEntry = !!entryVote
        }

        return {
          id: entryIdStr,
          date: entry.date,
          entry: entry.entry,
          mediaUrls: entry.mediaUrls,
          verified: entry.verified,
          likes: entryLikes,
          userHasLiked: userHasLikedEntry,
          createdAt: entry.createdAt,
        }
      })
    )

    const contestantProfile = {
      id: targetUserIdStr,
      userId: targetUserIdStr,
      userName: targetUser.name,
      slug: targetUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: getCategoryDisplayName(targetUser.category || ''),
      shortBio: targetUser.bio || registration?.formData?.shortBio || '',
      profileImage: targetUser.profileImage || '/placeholder-user.jpg',
      verifiedHappinessEntries: entries.length,
      happinessPassportCount: targetUser.happinessPassportCount,
      verifiedEntriesCount: targetUser.verifiedEntriesCount,
      likes: likeCount,
      views: viewCount,
      userHasVoted,
      galleryItems: galleryItems.map((item) => ({
        id: item._id.toString(),
        type: item.type,
        url: item.url,
        caption: item.caption,
        createdAt: item.createdAt,
      })),
      entries: entriesWithLikes,
      registrationData: registration ? {
        city: registration.formData?.city,
        state: registration.formData?.state,
        instagramHandle: registration.formData?.instagramHandle,
        facebookHandle: registration.formData?.facebookHandle,
      } : null,
      createdAt: targetUser.createdAt,
    }

    return NextResponse.json(contestantProfile)
  } catch (error) {
    console.error('Get contestant error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function
function getCategoryDisplayName(category: string): string {
  const categories: Record<string, string> = {
    'junior-joy': 'Junior Joy',
    'teenager-triumph': 'Teenager Triumph',
    'youth-radiance': 'Youth Radiance',
    'emerging-adult': 'Emerging Adult',
    'prime-happiness': 'Prime Happiness',
    'seenagers-gleam': "Seenager's Gleam",
  }
  return categories[category] || category || 'Youth Radiance'
}

