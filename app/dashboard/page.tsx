'use client'

import { CardContent, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Heart, Trophy, Calendar, Upload, BarChart3, Settings, LogOut, Eye } from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCallback } from 'react'

interface HappinessEntry {
  _id: string
  userId: string
  date: Date
  entry: string
  mediaUrls: string[]
  verified: boolean
  adminNotes?: string
  createdAt: Date
}

interface Registration {
  _id: string
  category: string
  status: string
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [passportEntries, setPassportEntries] = useState<HappinessEntry[]>([])
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch user's passport entries and registration from API
  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      }

      // Fetch passport entries
      const entriesResponse = await fetch('/api/passport', { headers })
      if (entriesResponse.ok) {
        const data = await entriesResponse.json()
        setPassportEntries(data)
      }

      // Fetch registration
      const regResponse = await fetch('/api/registration', { headers })
      if (regResponse.ok) {
        const data = await regResponse.json()
        setRegistration(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, fetchDashboardData])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Calculate journey progress
  const totalDays = 80
  const currentDay = passportEntries.filter(e => e.verified).length
  const progressPercent = Math.round((currentDay / totalDays) * 100)

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Dashboard Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Happiness Dashboard</h1>
            <p className="text-foreground/60 mt-1">Your {totalDays}-day joy journey starts here</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hover-lift">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover-lift text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome & Profile Card */}
        <GlassCard animated className="mb-8 bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}! 🎉</h2>
              <p className="text-foreground/70">You're on day {currentDay} of your happiness journey. Keep sharing your joy!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gradient">{progressPercent}%</div>
              <p className="text-sm text-foreground/60">Journey Complete</p>
            </div>
          </div>
        </GlassCard>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <GlassCard
            className="bg-gradient-to-br from-green-400 to-transparent/20 hover-lift"
            animated
          >
            <Heart className="w-8 h-8 text-green-600 mb-3" />
            <p className="text-sm text-foreground/70 mb-1">Registration</p>
            <p className="text-3xl font-bold text-foreground">
              {user?.registrationStatus === 'approved' ? 'Approved' : 'Pending'}
            </p>
          </GlassCard>
          <GlassCard
            className="bg-gradient-to-br from-red-400 to-transparent/20 hover-lift"
            animated
          >
            <Heart className="w-8 h-8 text-red-600 mb-3" />
            <p className="text-sm text-foreground/70 mb-1">Happiness Entries</p>
            <p className="text-3xl font-bold text-foreground">{passportEntries.length}</p>
          </GlassCard>
          <GlassCard
            className="bg-gradient-to-br from-yellow-400 to-transparent/20 hover-lift"
            animated
          >
            <Trophy className="w-8 h-8 text-yellow-600 mb-3" />
            <p className="text-sm text-foreground/70 mb-1">Verified</p>
            <p className="text-3xl font-bold text-foreground">{currentDay}</p>
          </GlassCard>
          <GlassCard
            className="bg-gradient-to-br from-blue-400 to-transparent/20 hover-lift"
            animated
          >
            <Calendar className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-sm text-foreground/70 mb-1">Days Remaining</p>
            <p className="text-3xl font-bold text-foreground">{Math.max(0, totalDays - currentDay)}</p>
          </GlassCard>
        </div>

        {/* Action Panels */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Happiness Passport */}
          <GlassCard className="hover-lift" animated>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Happiness Passport</h3>
                <p className="text-foreground/60 text-sm">Daily joy tracking & evidence</p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/70">Daily entries</span>
                <span className="font-semibold text-foreground">{passportEntries.length}/{totalDays}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (passportEntries.length / totalDays) * 100)}%` }} 
                />
              </div>
            </div>
            <Link href="/dashboard/passport">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white border-0">
                <Upload className="w-4 h-4 mr-2" /> Add Today's Entry
              </Button>
            </Link>
          </GlassCard>

          {/* Registration & Payment */}
          <GlassCard className="hover-lift" animated style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Registration Status</h3>
                <p className="text-foreground/60 text-sm">Complete your profile</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Form Status</span>
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${
                  user?.registrationStatus === 'approved' 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {user?.registrationStatus === 'approved' ? 'Approved' : 
                   user?.registrationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70">Payment Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-600 text-sm rounded-full font-semibold">
                  {user?.registrationStatus === 'approved' ? '₹5,000 Paid' : 'Pending'}
                </span>
              </div>
            </div>
            <Link href="/dashboard/registration">
              <Button variant="outline" className="w-full mt-6 glass hover:backdrop-blur-xl bg-transparent">
                View Profile & Edit
              </Button>
            </Link>
          </GlassCard>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Entries */}
          <GlassCard animated style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Recent Entries
            </h3>
            {passportEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/60 mb-4">No entries yet</p>
                <Link href="/dashboard/passport">
                  <Button>Add Your First Entry</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {passportEntries.slice(0, 3).map((activity) => (
                  <div key={activity._id} className="border-l-2 border-primary pl-4 py-2 hover:translate-x-1 transition">
                    <p className="text-sm font-semibold text-foreground/80">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-foreground/60 text-sm line-clamp-2">{activity.entry}</p>
                    {activity.verified && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold">Verified</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard animated style={{ animationDelay: '0.3s' }}>
            <h3 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/passport">
                <Button variant="outline" className="w-full glass hover:backdrop-blur-xl justify-start text-foreground hover:text-primary bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Passport Entry
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" className="w-full glass hover:backdrop-blur-xl justify-start text-foreground hover:text-primary bg-transparent">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Gallery
                </Button>
              </Link>
              <Link href="/dashboard/payment">
                <Button variant="outline" className="w-full glass hover:backdrop-blur-xl justify-start text-foreground hover:text-primary bg-transparent">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Payment & Verification
                </Button>
              </Link>
              <Link href={`/contestants/${user?.name?.toLowerCase().replace(/ /g, '-')}`}>
                <Button variant="outline" className="w-full glass hover:backdrop-blur-xl justify-start text-foreground hover:text-primary bg-transparent">
                  <Heart className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Registration Status Message */}
        {user?.registrationStatus === 'approved' ? (
          <GlassCard className="mt-8 bg-green-500/10 border-green-500/20" animated>
            <div className="p-4 rounded-lg">
              <p className="text-foreground mb-4">
                Your registration is complete. Let's add some happiness entries!
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="font-medium">Registration Details</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Category: <span className="capitalize">{user.category || 'Not Set'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entries: {passportEntries.length}/{totalDays}
                  </p>
                </div>
                <div>
                  <Link href="/dashboard/registration">
                    <Button className="w-full">View & Edit Registration</Button>
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="mt-8 bg-yellow-500/10 border-yellow-500/20" animated>
            <div className="p-4 rounded-lg">
              <p className="text-foreground mb-4">
                You haven't completed your registration yet. Let's get you registered!
              </p>
              <Link href="/dashboard/registration">
                <Button>Complete Registration</Button>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* Recent Happiness Entries */}
        {passportEntries.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Happiness Passport Entries</CardTitle>
              <CardDescription>Your verified happiness journey moments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {passportEntries.slice(0, 3).map((entry) => (
                  <div key={entry._id} className="border-l-4 border-primary pl-4 py-2">
                    <p className="font-medium text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {entry.entry}
                    </p>
                    {entry.verified && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600">Verified</span>
                      </div>
                    )}
                  </div>
                ))}
                <Link href="/dashboard/passport">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Entries
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Link href="/dashboard/registration">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Complete Registration
                </Button>
              </Link>
              <Link href="/dashboard/payment">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Complete Payment
                </Button>
              </Link>
              <Link href="/dashboard/passport">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Passport Entry
                </Button>
              </Link>
              <Link href="/dashboard/gallery">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Upload Media
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

