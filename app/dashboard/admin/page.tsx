'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { CheckCircle2, Clock, AlertCircle, Users, FileText, Lock, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'reports'>('submissions')
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      type: 'registration',
      userName: 'Aisha Patel',
      category: 'Youth Radiance',
      status: 'pending',
      entries: 12,
      submittedAt: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      type: 'passport',
      userName: 'Raj Kumar',
      category: 'Emerging Adult',
      status: 'pending',
      entries: 8,
      submittedAt: '2024-01-15T09:15:00',
    },
    {
      id: 3,
      type: 'media',
      userName: 'Priya Sharma',
      category: 'Prime Happiness',
      status: 'under_review',
      entries: 5,
      submittedAt: '2024-01-14T16:45:00',
    },
  ])

  const handleApprove = (id: number) => {
    setSubmissions(submissions.map((s) => (s.id === id ? { ...s, status: 'approved' } : s)))
  }

  const handleReject = (id: number) => {
    setSubmissions(submissions.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-yellow-400'
      case 'under_review':
        return 'from-blue-400'
      case 'approved':
        return 'from-green-400'
      case 'rejected':
        return 'from-red-400'
      default:
        return 'from-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'under_review':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-foreground/60 mt-1">Manage submissions, verify entries, and moderate content</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass hover:backdrop-blur-xl bg-transparent">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Clock, label: 'Pending Review', value: '12', color: 'from-yellow-400' },
            { icon: Users, label: 'Total Participants', value: '1,234', color: 'from-blue-400' },
            { icon: CheckCircle2, label: 'Verified', value: '890', color: 'from-green-400' },
            { icon: BarChart3, label: 'Pass Rate', value: '72%', color: 'from-purple-400' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <GlassCard
                key={i}
                className={`bg-gradient-to-br ${stat.color} to-transparent/20 hover-lift`}
                animated
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Icon className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-foreground/70 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </GlassCard>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border/40">
          {['submissions', 'users', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {tab === 'submissions' && '📋 Submissions'}
              {tab === 'users' && '👥 Users'}
              {tab === 'reports' && '📊 Reports'}
            </button>
          ))}
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pending Submissions</h2>
            {submissions.map((submission, i) => (
              <GlassCard
                key={submission.id}
                className="hover-lift"
                animated
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{submission.userName}</h3>
                      <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-foreground/70">{submission.category}</span>
                      <span className="text-sm px-3 py-1 bg-white/10 rounded-full text-foreground/70 capitalize">
                        {submission.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-foreground/60 text-sm mb-3">
                      {submission.entries} entries • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
                    {getStatusIcon(submission.status)}
                    <span className="text-sm font-semibold text-foreground capitalize">{submission.status.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {submission.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => handleApprove(submission.id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white border-0 hover-lift"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(submission.id)}
                      variant="outline"
                      className="flex-1 glass hover:backdrop-blur-xl text-red-600 hover:text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button variant="outline" className="flex-1 glass hover:backdrop-blur-xl bg-transparent">
                      View Details
                    </Button>
                  </div>
                )}

                {submission.status === 'approved' && (
                  <div className="pt-4 border-t border-white/10">
                    <span className="inline-block px-4 py-2 bg-green-500/20 text-green-600 rounded-lg text-sm font-semibold">
                      ✓ Approved on Jan 15, 2024
                    </span>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Active Users</h2>
            <GlassCard className="p-8 text-center hover-lift" animated>
              <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
              <p className="text-lg text-foreground/70">User management features coming soon</p>
            </GlassCard>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Reports & Analytics</h2>
            <GlassCard className="p-8 text-center hover-lift" animated>
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
              <p className="text-lg text-foreground/70">Detailed analytics and reports coming soon</p>
            </GlassCard>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white border-0 hover-lift">
            <Lock className="w-4 h-4 mr-2" /> Lock Submission Period
          </Button>
        </div>
      </div>
    </div>
  )
}
