'use client'

import { useState, useEffect, useCallback } from 'react'
import { CardContent, Card } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/glass-card'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { ArrowLeft, Upload, Heart, Eye, CheckCircle2, Trash2, Edit2, Image, Video, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MediaItem {
  _id: string
  type: 'photo' | 'video'
  url: string
  caption?: string
  verified: boolean
  createdAt: string
}

export default function DashboardGalleryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch media from API
  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchMedia()
    }
  }, [user, fetchMedia])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !caption) {
      alert('Please select a file and add a caption')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('type', selectedFile.type.startsWith('video') ? 'video' : 'photo')
    formData.append('caption', caption)

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setMediaItems(prev => [data.media, ...prev])
        setSelectedFile(null)
        setCaption('')
        alert('Media uploaded successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== id))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const verifiedCount = mediaItems.filter(m => m.verified).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover-lift">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gradient">My Gallery</h1>
              <p className="text-sm text-foreground/60">Manage your happiness entries</p>
            </div>
          </div>
          <Link href="/gallery">
            <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
              View Public Gallery
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <GlassCard className="mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 hover-lift" animated>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-foreground mb-2">Upload New Entry</h2>
              <p className="text-foreground/60 text-sm">Share your happiness moment with the community</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="space-y-2 flex-1">
                <Label htmlFor="file">Choose Photo or Video</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your moment..."
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !caption}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <GlassCard className="hover-lift" animated>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mediaItems.length}</p>
                <p className="text-sm text-foreground/60">Total Media</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="hover-lift" animated>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
                <p className="text-sm text-foreground/60">Verified</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="hover-lift" animated>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mediaItems.length * 15}</p>
                <p className="text-sm text-foreground/60">Total Likes</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="hover-lift" animated>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mediaItems.length * 45}</p>
                <p className="text-sm text-foreground/60">Total Views</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Media Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Image className="w-6 h-6 text-primary" />
            My Entries
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : mediaItems.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No media uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload your first happiness moment above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {mediaItems.map((item, i) => (
                <GlassCard
                  key={item._id}
                  className="group overflow-hidden hover-lift cursor-pointer"
                  animated
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-lg mb-4 aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover"
                        poster="/placeholder.svg?height=300&width=400"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || 'Gallery image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg?height=300&width=400'
                        }}
                      />
                    )}
                    {item.verified && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 rounded-full text-xs font-semibold text-green-600 backdrop-blur flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 rounded-full text-xs font-semibold text-white backdrop-blur">
                      {item.type === 'video' ? '🎥' : '📷'} {item.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground line-clamp-1">{item.caption}</p>
                      <p className="text-xs text-foreground/60 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button variant="outline" size="sm" className="flex-1 glass hover:backdrop-blur-xl bg-transparent">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass hover:backdrop-blur-xl bg-transparent text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Pending Verification */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-amber-500" />
            Pending Verification
          </h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {mediaItems.filter(m => !m.verified).length} pending submissions
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our team will verify your submissions shortly
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

