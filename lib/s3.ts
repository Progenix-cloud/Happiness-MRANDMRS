import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

// AWS S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'mr-miss-happiness'

// Create S3 client
const s3Client = new S3Client(s3Config)

// Allowed file types
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// Generate unique file key
function generateFileKey(folder: string, fileName: string, userId: string): string {
  const ext = fileName.split('.').pop()
  const uniqueId = uuidv4()
  return `${folder}/${userId}/${uniqueId}.${ext}`
}

// Validate file
function validateFile(file: File, type: 'photo' | 'video'): { valid: boolean; error?: string } {
  if (type === 'photo') {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid photo format. Allowed: JPEG, PNG, WebP, GIF' }
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { valid: false, error: 'Photo size must be less than 10MB' }
    }
  } else {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid video format. Allowed: MP4, WebM, QuickTime' }
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Video size must be less than 100MB' }
    }
  }
  return { valid: true }
}

// Upload file to S3
export async function uploadToS3(
  file: File,
  userId: string,
  type: 'photo' | 'video'
): Promise<{ url: string; key: string } | null> {
  try {
    // Validate file
    const validation = validateFile(file, type)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const folder = type === 'photo' ? 'photos' : 'videos'
    const key = generateFileKey(folder, file.name, userId)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use multipart upload for large files
    if (file.size > 5 * 1024 * 1024) {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read',
        },
        queueSize: 4,
      })

      await upload.done()
    } else {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read',
      })

      await s3Client.send(command)
    }

    const url = `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${key}`

    console.log(`✅ File uploaded to S3: ${url}`)
    return { url, key }
  } catch (error) {
    console.error('❌ S3 upload error:', error)
    return null
  }
}

// Upload from base64 data
export async function uploadBase64ToS3(
  base64Data: string,
  userId: string,
  type: 'photo' | 'video',
  mimeType: string
): Promise<{ url: string; key: string } | null> {
  try {
    const folder = type === 'photo' ? 'photos' : 'videos'
    const ext = mimeType.split('/')[1]
    const uniqueId = uuidv4()
    const key = `${folder}/${userId}/${uniqueId}.${ext}`

    // Remove base64 prefix if present
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Content, 'base64')

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    })

    await s3Client.send(command)

    const url = `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${key}`

    console.log(`✅ Base64 file uploaded to S3: ${url}`)
    return { url, key }
  } catch (error) {
    console.error('❌ S3 base64 upload error:', error)
    return null
  }
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    console.log(`✅ File deleted from S3: ${key}`)
    return true
  } catch (error) {
    console.error('❌ S3 delete error:', error)
    return false
  }
}

// Get signed URL for private files
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    // Note: You would use @aws-sdk/s3-request-presigner for signed URLs
    // For now, return public URL
    return `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${key}`
  } catch (error) {
    console.error('❌ S3 signed URL error:', error)
    return null
  }
}

// Upload multiple files
export async function uploadMultipleToS3(
  files: File[],
  userId: string,
  type: 'photo' | 'video'
): Promise<Array<{ url: string; key: string } | null>> {
  const uploadPromises = files.map(file => uploadToS3(file, userId, type))
  return Promise.all(uploadPromises)
}

export default {
  uploadToS3,
  uploadBase64ToS3,
  deleteFromS3,
  getSignedUrl,
  uploadMultipleToS3,
}

