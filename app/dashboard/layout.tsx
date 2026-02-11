'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Parse name into first and last name
  const nameParts = user.name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

  const navigationItems = {
    participant: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'My Registration', href: '/dashboard/registration' },
      { label: 'Happiness Passport', href: '/dashboard/passport' },
      { label: 'Media Gallery', href: '/dashboard/gallery' },
      { label: 'Payment', href: '/dashboard/payment' },
    ],
    admin: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Submissions Queue', href: '/dashboard/submissions' },
      { label: 'Users', href: '/dashboard/users' },
      { label: 'Evidence Review', href: '/dashboard/evidence' },
      { label: 'Form Lock Controls', href: '/dashboard/form-locks' },
      { label: 'Audit Log', href: '/dashboard/logs' },
    ],
    volunteer: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'My Tasks', href: '/dashboard/tasks' },
      { label: 'Availability', href: '/dashboard/availability' },
      { label: 'Events', href: '/dashboard/events' },
    ],
    sponsor: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'My Sponsorships', href: '/dashboard/sponsorships' },
      { label: 'Reports', href: '/dashboard/reports' },
    ],
    director: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'My Applications', href: '/dashboard/applications' },
      { label: 'Resources', href: '/dashboard/resources' },
    ],
  }

  // Get navigation items based on user's first role
  const userRole = user.roles?.[0] || 'participant'
  const navItems = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.participant

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-primary">
              Mr. &amp; Mrs Happiness
            </Link>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{firstName} {lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={item.href === '/dashboard' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Info Section */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Your Progress</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Entries: {user.happinessPassportCount || 0}/80</p>
              <p>Verified: {user.verifiedEntriesCount || 0}</p>
              <p>Status: <span className="capitalize">{user.registrationStatus}</span></p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-50">
          <nav className="flex overflow-x-auto">
            {navItems.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button variant="ghost" className="w-full text-xs py-3">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:mb-0 mb-20">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

