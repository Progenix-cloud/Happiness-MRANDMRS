'use client'

import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Search, Filter, Share2, Eye, ArrowRight, User, Loader2 } from 'lucide-react'
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
  galleryItemsCount: number
  likes: number
  views: number
  userHasVoted: boolean
  slug: string
}

export default function GalleryPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [contestants, setContestants] = useState<ContestantProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContestants()
  }, [])

  const fetchContestants = async () => {
    try {
      const headers: Record<string, string> = {}
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/contestants', { headers })
      if (response.ok) {
        const data = await response.json()
        setContestants(data.contestants || [])
      }
    } catch (error) {
      console.error('Failed to fetch contestants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = contestants.filter((item) => {
    const matchesSearch = item.shortBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover-lift">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
              ❤️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Gallery</h1>
              <p className="text-xs text-foreground/60">Happiness Stories</p>
            </div>
          </Link>
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
        {/* Hero Section */}
        <GlassCard className="mb-12 bg-gradient-to-br from-primary/20 to-secondary/20 hover-lift" animated>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">Happiness Gallery</h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Explore verified moments of joy, community impact, and personal growth from our happiness ambassadors
            </p>
          </div>
        </GlassCard>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search stories, contestants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-foreground/40"
              />
          </div>
          <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {[null, 'Junior Joy', 'Teenage Triumph', 'Youth Radiance', 'Emerging Adult', 'Prime Happiness', "Seenager's Gleam"].map((cat) => (
            <button
              key={cat || 'all'}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold transition hover-lift ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'glass text-foreground/70 hover:text-foreground'
              }`}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>

        {/* Contestants Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Featured Contestants
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <User className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No contestants found matching your criteria.</p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4 bg-transparent"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredItems.map((profile, i) => (
                <Link key={profile.id} href={`/contestants/${profile.slug}`}>
                  <GlassCard
                    className="group overflow-hidden hover-lift cursor-pointer h-full"
                    animated
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Profile Image */}
                    <div className="relative overflow-hidden rounded-lg mb-4 aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <img
                        src={profile.profileImage}
                        alt={profile.userName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-user.jpg'
                        }}
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white backdrop-blur">
                        {profile.category}
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                          {profile.userName}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {profile.shortBio}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/50 p-2 rounded text-center">
                          <div className="text-lg font-bold text-primary">
                            {profile.verifiedHappinessEntries}
                          </div>
                          <div className="text-xs text-muted-foreground">Verified</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-center">
                          <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                            <Heart className="w-3 h-3" />
                            {profile.likes}
                          </div>
                          <div className="text-xs text-muted-foreground">Likes</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-center">
                          <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" />
                            {profile.views}
                          </div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                      </div>

                      {/* CTA */}
                      <Button className="w-full mt-2 group-hover:shadow-lg transition-shadow">
                        View Profile <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="mt-16">
          <GlassCard className="bg-gradient-to-br from-primary/10 to-secondary/10" animated>
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">How Happiness Gallery Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold">1. Register</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign up and choose your category based on your age group
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-semibold">2. Share Joy</h3>
                  <p className="text-sm text-muted-foreground">
                    Document and share your happiness moments every day
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="font-semibold">3. Get Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team verifies your entries to build credibility
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Mr. &amp; Mrs Happiness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

