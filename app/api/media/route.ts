import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { Media } from '@/lib/models'
import { uploadToS3, deleteFromS3 } from '@/lib/s3'
import { uploadToCloudinary, uploadBase64ToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'
import { getUserIdFromRequest } from '@/lib/auth'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

function ensureSecret() {
  if (!NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set')
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
}

// GET /api/media - Get user's media
export async function GET(request: NextRequest) {
  try {
    ensureSecret()
    await connectDB()

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'photo' or 'video'
    const verified = searchParams.get('verified')

    const query: any = { userId }
    if (type) query.type = type
    if (verified !== null) query.verified = verified === 'true'

    const media = await Media.find(query).sort({ createdAt: -1 })

    return NextResponse.json(media)
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Get media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/media - Upload media (with Cloudinary/S3 for large files)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) === 'video' ? 'video' : 'photo'
    const caption = (formData.get('caption') as string) || ''
    const provider = (formData.get('provider') as string) === 's3' ? 's3' : 'cloudinary'

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let uploadResult
    let url: string | undefined
    let key: string | undefined
    let publicId: string | undefined

    if (provider === 's3') {
      // Upload to S3
      url = `https://${process.env.AWS_S3_BUCKET_NAME || 'mr-miss-happiness'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/media/${userId}/${Date.now()}-${file.name}`
      key = `media/${userId}/${Date.now()}-${file.name}`

      if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_REGION) {
        uploadResult = await uploadToS3(buffer, key)
        if (!uploadResult) {
          return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 })
        }
      }
    } else {
      // Upload to Cloudinary
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`
      uploadResult = await uploadBase64ToCloudinary(base64Data, userId, type)

      if (!uploadResult) {
        return NextResponse.json({ error: 'Failed to upload to Cloudinary' }, { status: 500 })
      }

      url = uploadResult.url
      publicId = uploadResult.publicId
    }

    if (!url) {
      return NextResponse.json({ error: 'Upload failed: no URL returned' }, { status: 500 })
    }

    // Save media record
    const media = await Media.create({
      userId,
      type,
      url,
      key: key || undefined,
      publicId: publicId || undefined,
      provider,
      caption: caption || null,
      verified: false,
    })

    console.log(`✅ Media uploaded: ${media._id}`)

    return NextResponse.json({
      success: true,
      media,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Upload media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/media - Verify/unverify media (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let payload: { userId: string; roles?: string[] }
    try {
      payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string; roles?: string[] }
    } catch (err) {
      console.warn('Invalid JWT in PUT /api/media:', err?.message || err)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { mediaId, verified } = await request.json()

    if (!mediaId || typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'mediaId and verified boolean are required' }, { status: 400 })
    }

    const isAdmin = payload.roles?.includes('admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const media = await Media.findById(mediaId)
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    media.verified = verified
    await media.save()

    console.log(`✅ Media ${verified ? 'verified' : 'unverified'}: ${mediaId}`)

    return NextResponse.json({ success: true, media })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Verify media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/media - Delete media
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const media = await Media.findById(mediaId)
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (media.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from storage
    if (media.provider === 's3' && media.key) {
      await deleteFromS3(media.key)
    } else if (media.provider === 'cloudinary' && media.publicId) {
      await deleteFromCloudinary(media.publicId, media.type === 'video' ? 'video' : 'image')
    }

    await Media.findByIdAndDelete(mediaId)

    console.log(`✅ Media deleted: ${mediaId}`)

    return NextResponse.json({ success: true, message: 'Media deleted' })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


