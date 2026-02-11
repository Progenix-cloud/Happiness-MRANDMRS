import { v2 as cloudinary } from 'cloudinary'

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Allowed formats
const ALLOWED_PHOTO_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const ALLOWED_VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'quicktime']
const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  duration?: number
  format: string
}

// Generate upload signature for client-side uploads
export function generateUploadSignature(folder: string, userId: string): {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
} {
  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    timestamp,
    folder: `${folder}/${userId}`,
    upload_preset: 'mr-miss-happiness',
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || ''
  )

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    folder: `${folder}/${userId}`,
  }
}

// Upload file to Cloudinary (server-side)
export async function uploadToCloudinary(
  file: Buffer,
  options: {
    userId: string
    type: 'photo' | 'video'
    folder?: string
  }
): Promise<UploadResult | null> {
  try {
    const { userId, type, folder = type === 'photo' ? 'photos' : 'videos' } = options

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === 'video' ? 'video' : 'image',
          folder: `${folder}/${userId}`,
          transformation: type === 'photo' ? [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
          ] : [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(file)
    })

    console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`)
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error)
    return null
  }
}

// Upload from base64 data
export async function uploadBase64ToCloudinary(
  base64Data: string,
  userId: string,
  type: 'photo' | 'video'
): Promise<UploadResult | null> {
  try {
    const folder = type === 'photo' ? 'photos' : 'videos'
    
    const result = await cloudinary.uploader.upload(
      base64Data,
      {
        resource_type: type === 'video' ? 'video' : 'image',
        folder: `${folder}/${userId}`,
        transformation: type === 'photo' ? [
          { quality: 'auto:best' },
          { fetch_format: 'auto' },
        ] : [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      }
    )

    console.log(`✅ Base64 file uploaded to Cloudinary: ${result.secure_url}`)
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      duration: result.duration,
      format: result.format,
    }
  } catch (error) {
    console.error('❌ Cloudinary base64 upload error:', error)
    return null
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    console.log(`✅ File deleted from Cloudinary: ${publicId}`)
    return true
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error)
    return false
  }
}

// Get optimized URL with transformations
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
    resourceType?: 'image' | 'video'
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    resourceType = 'image',
  } = options

  const transformation: any = {
    quality,
    fetch_format: format,
  }

  if (width) transformation.width = width
  if (height) {
    transformation.height = height
    transformation.crop = crop
  }

  return cloudinary.url(publicId, {
    transformation: [transformation],
    resource_type: resourceType,
    secure: true,
  })
}

// Get video thumbnail
export function getVideoThumbnail(publicId: string, options: { width?: number; height?: number } = {}): string {
  const { width = 400, height = 300 } = options
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { width, height, crop: 'fill' },
      { format: 'jpg', start_offset: '0' },
    ],
    secure: true,
  })
}

// Upload multiple files
export async function uploadMultipleToCloudinary(
  files: Buffer[],
  userId: string,
  type: 'photo' | 'video'
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => 
    uploadToCloudinary(file, { userId, type, folder: type === 'photo' ? 'photos' : 'videos' })
      .then(result => result!)
  )
  
  const results = await Promise.all(uploadPromises)
  return results.filter((r): r is UploadResult => r !== null)
}

// Verify Cloudinary configuration
export async function verifyCloudinaryConfig(): Promise<boolean> {
  try {
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary is connected:', result)
    return true
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error)
    return false
  }
}

// Get cloud storage stats
export async function getStorageStats(userId: string): Promise<{
  photoCount: number
  videoCount: number
  totalSize: number
}> {
  try {
    const [photos, videos] = await Promise.all([
      cloudinary.api.resources({
        type: 'upload',
        prefix: `photos/${userId}`,
        resource_type: 'image',
      }),
      cloudinary.api.resources({
        type: 'upload',
        prefix: `videos/${userId}`,
        resource_type: 'video',
      }),
    ])

    const photoCount = photos.resources?.length || 0
    const videoCount = videos.resources?.length || 0
    const totalSize = [...(photos.resources || []), ...(videos.resources || [])]
      .reduce((sum: number, r: any) => sum + (r.bytes || 0), 0)

    return { photoCount, videoCount, totalSize }
  } catch (error) {
    console.error('❌ Error getting storage stats:', error)
    return { photoCount: 0, videoCount: 0, totalSize: 0 }
  }
}

export default {
  cloudinary,
  uploadToCloudinary,
  uploadBase64ToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  getVideoThumbnail,
  uploadMultipleToCloudinary,
  generateUploadSignature,
  verifyCloudinaryConfig,
  getStorageStats,
}

