import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User, HappinessEntry, Media, Vote, View } from '@/lib/models'
import { getUserIdFromRequest } from '@/lib/auth'

// GET /api/contestants - Get all approved contestants
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build query for approved contestants
    const query: any = {
      registrationStatus: 'approved',
    }
    if (category) {
      query.category = category.toLowerCase().replace(/[' ]/g, '-')
    }

    if (search) {
      // Escape user-provided search to avoid ReDoS / injection
      const esc = escapeRegex(search)
      query.$or = [
        { name: { $regex: esc, $options: 'i' } },
        { bio: { $regex: esc, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    // Get current user ID (if authenticated)
    const currentUserId = await getUserIdFromRequest(request)

    const [contestants, total] = await Promise.all([
      User.find(query)
        .select('name email category profileImage bio registrationStatus happinessPassportCount verifiedEntriesCount createdAt')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ])

    // Get real stats for each contestant
    const contestantsWithStats = await Promise.all(
      contestants.map(async (user) => {
        const userIdStr = user._id.toString()

        // Get real counts from database
        const [entries, mediaCount, likeCount, viewCount] = await Promise.all([
          HappinessEntry.countDocuments({ userId: user._id, verified: true }),
          Media.countDocuments({ userId: user._id, verified: true }),
          Vote.countDocuments({ resourceType: 'contestant', resourceId: userIdStr }),
          View.countDocuments({ resourceType: 'contestant', resourceId: userIdStr }),
        ])

        // Check if current user has liked
        let userHasVoted = false
        if (currentUserId) {
          const vote = await Vote.findOne({
            userId: currentUserId,
            resourceType: 'contestant',
            resourceId: userIdStr,
          })
          userHasVoted = !!vote
        }

        return {
          id: user._id.toString(),
          userId: userIdStr,
          userName: user.name,
          slug: user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: getCategoryDisplayName(user.category || ''),
          shortBio: user.bio || '',
          profileImage: user.profileImage || '/placeholder-user.jpg',
          verifiedHappinessEntries: entries,
          galleryItemsCount: mediaCount,
          likes: likeCount,
          views: viewCount,
          userHasVoted,
          createdAt: user.createdAt,
        }
      })
    )

    return NextResponse.json({
      contestants: contestantsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get contestants error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get display name for category
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

// Simple escape for user input when building regexes
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

