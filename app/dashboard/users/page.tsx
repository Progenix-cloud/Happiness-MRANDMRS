'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UserItem {
  _id: string
  name: string
  email: string
  roles: string[]
  registrationStatus: string
}

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>([])
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

      fetchUsers()
    }
  }, [user, isLoading, router])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users?limit=100', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load users')
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (id: string, currentRoles: string[]) => {
    const nextRoles = currentRoles.includes('admin') ? currentRoles.filter(x => x !== 'admin') : [...currentRoles, 'admin']
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, roles: nextRoles }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Could not update role')
      }
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (isLoading || loading) {
    return <p className="p-10 text-center">Loading users...</p>
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">{error}</p>
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      <p className="mb-6">View and update user roles for administrative privileges.</p>

      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u._id} className="p-4">
            <CardContent className="flex justify-between items-center gap-4">
              <div>
                <h2 className="font-semibold">{u.name}</h2>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <p className="text-sm">Status: {u.registrationStatus}</p>
                <p className="text-sm">Roles: {u.roles.join(', ')}</p>
              </div>
              <Button
                onClick={() => toggleAdmin(u._id, u.roles)}
                className={u.roles.includes('admin') ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              >
                {u.roles.includes('admin') ? 'Remove Admin' : 'Grant Admin'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
