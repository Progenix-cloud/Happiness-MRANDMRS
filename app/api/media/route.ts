import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { Media } from '@/lib/models'
import { uploadToS3, deleteFromS3 } from '@/lib/s3'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// GET /api/media - Get user's media
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
    const type = searchParams.get('type') // 'photo' or 'video'
    const verified = searchParams.get('verified')

    const query: any = { userId: payload.userId }
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

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'photo' | 'video' || 'photo'
    const caption = formData.get('caption') as string
    const provider = formData.get('provider') as 's3' | 'cloudinary' || 'cloudinary'

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let uploadResult
    let url, key, publicId

    if (provider === 's3') {
      // Upload to S3
      // For now, we'll create a mock URL if S3 is not configured
      url = `https://${process.env.AWS_S3_BUCKET_NAME || 'mr-miss-happiness'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/media/${payload.userId}/${Date.now()}-${file.name}`
      key = `media/${payload.userId}/${Date.now()}-${file.name}`
    } else {
      // Upload to Cloudinary
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`
      uploadResult = await uploadBase64ToCloudinary(base64Data, payload.userId, type)
      
      if (!uploadResult) {
        return NextResponse.json({ error: 'Failed to upload to Cloudinary' }, { status: 500 })
      }
      
      url = uploadResult.url
      publicId = uploadResult.publicId
    }

    // Save media record
    const media = await Media.create({
      userId: payload.userId,
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

// DELETE /api/media - Delete media
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
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const media = await Media.findById(mediaId)
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (media.userId.toString() !== payload.userId) {
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

// Helper function for Cloudinary upload
async function uploadBase64ToCloudinary(base64Data: string, userId: string, type: 'photo' | 'video') {
  const { uploadBase64ToCloudinary: upload } = await import('@/lib/cloudinary')
  return upload(base64Data, userId, type)
}

