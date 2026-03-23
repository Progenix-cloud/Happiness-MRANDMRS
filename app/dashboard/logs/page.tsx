'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'

interface LogItem {
  _id: string
  actor: string
  action: string
  resourceType: string
  message?: string
  createdAt: string
}

export default function AdminLogsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<LogItem[]>([])
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

      fetchLogs()
    }
  }, [user, isLoading, router])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/logs?limit=100', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch logs')
      }
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return <p className="p-10 text-center">Loading logs...</p>
  }

  if (error) {
    return <p className="p-10 text-center text-red-500">{error}</p>
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Activity Logs</h1>
      <p className="mb-6">Recent admin actions and audit trail.</p>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">No logs available yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log._id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">Resource: {log.resourceType}</p>
                    <p className="text-xs text-muted-foreground">Actor: {log.actor}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                  {log.message && <p className="text-sm text-muted-foreground">{log.message}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
