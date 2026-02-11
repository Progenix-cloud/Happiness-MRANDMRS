'use client'

import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart, Trophy, Calendar, CheckCircle2, ArrowLeft, Eye, Share2, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import { useAuth } from '@/lib/auth-context'

interface ContestantProfile {
  id: string
  userId: string
  userName: string
  category: string
  shortBio: string
  profileImage: string
  verifiedHappinessEntries: number
  happinessPassportCount: number
  likes: number
  views: number
  userHasVoted: boolean
  galleryItems: Array<{
    id: string
    type: string
    url: string
    caption?: string
    createdAt: Date
  }>
  entries: Array<{
    id: string
    date: Date
    entry: string
    mediaUrls: string[]
    verified: boolean
    likes: number
    userHasLiked: boolean
    createdAt: Date
  }>
  registrationData: {
    city?: string
    state?: string
    instagramHandle?: string
    facebookHandle?: string
  } | null
  slug: string
}

interface HappinessEntry {
  id: string
  date: Date
  entry: string
  mediaUrls: string[]
  verified: boolean
  likes: number
  userHasLiked: boolean
  createdAt: Date
}

export default function ContestantPage() {
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const slug = params?.slug as string
  const [contestant, setContestant] = useState<ContestantProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchContestant()
    }
  }, [slug])

  const fetchContestant = async () => {
    try {
      const response = await fetch(`/api/contestants/${slug}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setContestant(data)
      }
    } catch (error) {
      console.error('Failed to fetch contestant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !contestant) return

    setIsLiking(true)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: 'contestant',
          resourceId: contestant.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setContestant(prev => prev ? {
          ...prev,
          likes: data.count,
          userHasVoted: data.userHasVoted,
        } : null)
      }
    } catch (error) {
      console.error('Like failed:', error)
    } finally {
      setIsLiking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!contestant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60">Contestant not found</p>
          <Link href="/gallery">
            <Button className="mt-4">Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="sm" className="hover-lift">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Gallery
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 hover-lift">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90 hover-lift">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <GlassCard className="mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 hover-lift" animated>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-br from-primary/20 to-secondary/20">
                <img
                  src={contestant.profileImage}
                  alt={contestant.userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-background">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-foreground mb-2">{contestant.userName}</h1>
              <p className="text-xl text-primary mb-4">{contestant.category}</p>
              <p className="text-foreground/70 max-w-2xl">{contestant.shortBio}</p>
              
              {contestant.registrationData && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-foreground/60">
                  {contestant.registrationData.city && (
                    <span>📍 {contestant.registrationData.city}{contestant.registrationData.state && `, ${contestant.registrationData.state}`}</span>
                  )}
                  {contestant.registrationData.instagramHandle && (
                    <span>📷 @{contestant.registrationData.instagramHandle}</span>
                  )}
                </div>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{contestant.verifiedHappinessEntries}</div>
                  <div className="text-sm text-foreground/60">Verified Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{contestant.happinessPassportCount}</div>
                  <div className="text-sm text-foreground/60">Total Entries</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button 
                className={`bg-gradient-to-r from-primary to-secondary hover:shadow-lg ${contestant.userHasVoted ? 'ring-2 ring-red-500' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                {isLiking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Heart className={`w-4 h-4 mr-2 ${contestant.userHasVoted ? 'fill-red-500 text-red-500' : ''}`} />
                    {contestant.userHasVoted ? 'Liked' : 'Like Profile'}
                  </>
                )}
              </Button>
              <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <GlassCard className="bg-gradient-to-br from-green-400 to-transparent/20 hover-lift" animated>
            <CheckCircle2 className="w-8 h-8 mb-3 text-green-500" />
            <p className="text-sm text-foreground/70 mb-1">Verified Entries</p>
            <p className="text-3xl font-bold text-foreground">{contestant.verifiedHappinessEntries}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-red-400 to-transparent/20 hover-lift" animated>
            <Heart className="w-8 h-8 mb-3 text-red-500" />
            <p className="text-sm text-foreground/70 mb-1">Total Likes</p>
            <p className="text-3xl font-bold text-foreground">{contestant.likes}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-blue-400 to-transparent/20 hover-lift" animated>
            <Eye className="w-8 h-8 mb-3 text-blue-500" />
            <p className="text-sm text-foreground/70 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-foreground">{contestant.views}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-purple-400 to-transparent/20 hover-lift" animated>
            <Calendar className="w-8 h-8 mb-3 text-purple-500" />
            <p className="text-sm text-foreground/70 mb-1">Days Active</p>
            <p className="text-3xl font-bold text-foreground">{contestant.happinessPassportCount}</p>
          </GlassCard>
        </div>

        {/* Happiness Journey */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Happiness Journey
          </h2>
          
          {contestant.entries.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No entries yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {contestant.entries.map((entry, i) => (
                <GlassCard
                  key={entry.id}
                  className="group hover-lift cursor-pointer"
                  animated
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground/80">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {entry.verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-foreground/70 line-clamp-3">{entry.entry}</p>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {entry.likes}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Gallery Section */}
        {contestant.galleryItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Gallery
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {contestant.galleryItems.slice(0, 8).map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.url}
                    alt={item.caption || 'Gallery item'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Join Section */}
        <section className="mt-12">
          <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary/10" animated>
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Join the Happiness Movement</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto mb-6">
                Be part of a community that celebrates joy, spreads positivity, and makes a difference in people's lives.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/login">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
                    Register Now
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
                    View More Contestants
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Mr. & Mrs Happiness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

