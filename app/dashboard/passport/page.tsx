'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { Heart, Upload, Check, Clock, AlertCircle, Calendar, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HappinessEntry {
  _id: string
  date: Date
  entry: string
  mediaUrls: string[]
  verified: boolean
  createdAt: Date
}

export default function PassportPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<HappinessEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEntry, setNewEntry] = useState({ date: '', entry: '' })

  // Fetch entries from API
  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/passport', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.date || !newEntry.entry) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/passport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          date: newEntry.date,
          entry: newEntry.entry,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(prev => [data.entry, ...prev])
        setNewEntry({ date: '', entry: '' })
        alert('Entry added successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add entry')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to add entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifiedCount = entries.filter(e => e.verified).length
  const pendingCount = entries.length - verifiedCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">Happiness Passport</h1>
          </div>
          <p className="text-foreground/60">Track your daily joy journey with evidence</p>
          </div>
        </div>

        {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="bg-gradient-to-br from-blue-400 to-transparent/20 hover-lift" animated>
            <FileText className="w-6 h-6 text-primary mb-2" />
            <p className="text-sm text-foreground/70 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-foreground">{entries.length}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-green-400 to-transparent/20 hover-lift" animated>
            <Check className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm text-foreground/70 mb-1">Verified</p>
            <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-yellow-400 to-transparent/20 hover-lift" animated>
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <p className="text-sm text-foreground/70 mb-1">Pending</p>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-purple-400 to-transparent/20 hover-lift" animated>
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm text-foreground/70 mb-1">Days Logged</p>
            <p className="text-2xl font-bold text-foreground">{Math.round((entries.length / 80) * 100)}%</p>
          </GlassCard>
        </div>

        {/* Add New Entry Card */}
        <GlassCard className="mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 hover-lift" animated>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Add Today's Entry</h2>
              <p className="text-foreground/60">Share your happiness moment with evidence</p>
            </div>
            <Heart className="w-8 h-8 text-primary animate-float" />
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
              className="glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What made you happy today?"
                value={newEntry.entry}
                onChange={(e) => setNewEntry(prev => ({ ...prev, entry: e.target.value }))}
                className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-foreground/40"
                required
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white border-0 hover-lift"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Entries Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Journey</h2>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <GlassCard animated>
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No entries yet</p>
                <p className="text-sm text-muted-foreground">Add your first happiness entry above!</p>
              </div>
            </GlassCard>
          )}

          {!isLoading && entries.length > 0 && entries.map((entry, i) => (
            <GlassCard
              key={entry._id}
              className="hover-lift group"
              animated
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-foreground/80 mb-3">{entry.entry}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                      <span className="text-sm text-foreground/60 px-3 py-1 bg-white/10 rounded-full">
                        {entry.mediaUrls.length} media file{entry.mediaUrls.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-sm text-foreground/60 px-3 py-1 bg-white/10 rounded-full">
                      Day {Math.floor(Math.random() * 80) + 1} of 80
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {entry.verified ? (
                    <div className="flex flex-col items-end gap-2">
                      <Check className="w-6 h-6 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">Verified</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <Clock className="w-6 h-6 text-yellow-600" />
                      <span className="text-xs font-semibold text-yellow-600">Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link href="/dashboard">
            <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
    </div>
  </div>
  )
}
