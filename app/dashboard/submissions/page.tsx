'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface RegistrationItem {
  _id: string
  userId: { _id: string; name: string; email: string }
  category: string
  status: string
  submittedAt: string
}

export default function SubmissionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<RegistrationItem[]>([])
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

      fetchSubmissions()
    }
  }, [user, isLoading, router])

  const fetchSubmissions = async () => {
    setLoading(true)
    setError(null)

    try {
      const resp = await fetch('/api/admin/registrations?status=submitted&limit=100', {
        credentials: 'include',
      })
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'Failed to load submissions')
      }

      const data = await resp.json()
      setSubmissions(data.registrations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    try {
      const resp = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId, status }),
      })
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'Failed to update status')
      }
      await fetchSubmissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (isLoading || loading) {
    return <p className="p-10 text-center">Loading submissions...</p>
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">{error}</p>
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Submissions Queue</h1>
      <p className="mb-6">Review and approve/reject participant registration submissions.</p>

      {submissions.length === 0 ? (
        <Card className="p-6">
          <CardContent>No pending submissions found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((item) => (
            <Card key={item._id} className="p-4">
              <CardContent>
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">{item.userId.name}</h2>
                    <p className="text-sm text-muted-foreground">{item.userId.email}</p>
                    <p className="text-sm mt-1">Category: {item.category}</p>
                    <p className="text-sm">Submitted: {new Date(item.submittedAt).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => updateStatus(item._id, 'approved')} className="bg-green-600 text-white hover:bg-green-700">Approve</Button>
                    <Button variant="outline" onClick={() => updateStatus(item._id, 'rejected')} className="text-red-600 border-red-300">Reject</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
