'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MediaItem {
  _id: string
  type: 'photo' | 'video'
  url: string
  caption?: string
  verified: boolean
  createdAt: string
  userId: { name: string; email: string }
}

export default function EvidenceReviewPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/auth/login')
        return
      }
      if (!user.roles?.includes('admin')) {
        router.replace('/dashboard')
        return
      }
      fetchMedia()
    }
  }, [user, isLoading, router])

  const fetchMedia = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/media?verified=false&limit=50', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch media')
      }
      const data = await res.json()
      setMediaItems(data.media || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const toggleVerify = async (mediaId: string, currentVerified: boolean) => {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, verified: !currentVerified }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Could not update media status')
      }
      await fetchMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (isLoading || loading) {
    return <p className="p-10 text-center">Loading evidence reviews...</p>
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">{error}</p>
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Evidence Review</h1>
      <p className="mb-6">Verify uploaded media before it appears in public gallery.</p>
      {mediaItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">No unverified media at this time.</CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mediaItems.map((item) => (
            <Card key={item._id}>
              <CardContent>
                <div className="relative overflow-hidden rounded-lg mb-4 bg-muted">
                  {item.type === 'video' ? (
                    <video src={item.url} controls className="w-full aspect-video" />
                  ) : (
                    <img src={item.url} alt={item.caption || 'submission'} className="w-full object-cover aspect-video" />
                  )}
                </div>
                <div className="mb-2">
                  <p className="font-medium">Uploader: {item.userId?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{item.userId?.email || ''}</p>
                  <p className="text-sm">Caption: {item.caption || 'N/A'}</p>
                  <p className="text-sm">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => toggleVerify(item._id, item.verified)} className="bg-green-600 hover:bg-green-700 text-white">{item.verified ? 'Unverify' : 'Verify'}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
