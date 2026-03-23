'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface FormLockItem {
  _id: string
  key: string
  name: string
  description?: string
  locked: boolean
  updatedAt: string
}

export default function FormLocksPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [locks, setLocks] = useState<FormLockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchLocks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/form-locks', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch form locks')
      }
      const data = await res.json()
      setLocks(data.locks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

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

      fetchLocks()
    }
  }, [user, isLoading, router])

  const handleCreate = async () => {
    if (!key || !name) {
      setError('Key and name are required')
      return
    }
    try {
      const res = await fetch('/api/admin/form-locks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, name, description }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create lock')
      }
      setKey(''); setName(''); setDescription('')
      await fetchLocks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const toggleLock = async (lockKey: string, locked: boolean) => {
    try {
      const res = await fetch('/api/admin/form-locks', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: lockKey, locked: !locked }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update lock')
      }
      await fetchLocks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (isLoading || loading) {
    return <p className="p-10 text-center">Loading form locks...</p>
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">{error}</p>
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Form Lock Controls</h1>
      <p className="mb-6">Lock or unlock public submission forms with centralized control.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="space-y-3">
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Lock key (e.g., registration)" />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <Button onClick={handleCreate} className="bg-primary text-white">Create/Update Lock</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-semibold mb-3">Current Locks</h3>
            <div className="space-y-2">
              {locks.map((lock) => (
                <div key={lock._id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{lock.name} ({lock.key})</p>
                    <p className="text-sm text-muted-foreground">{lock.description || 'No description'}</p>
                    <p className="text-xs text-muted-foreground">Last Updated: {new Date(lock.updatedAt).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => toggleLock(lock.key, lock.locked)} className={lock.locked ? 'bg-green-600' : 'bg-red-500'}>
                    {lock.locked ? 'Unlock' : 'Lock'}
                  </Button>
                </div>
              ))}
              {locks.length === 0 && <p className="text-sm text-muted-foreground">No locks configured yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
