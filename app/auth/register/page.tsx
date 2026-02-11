"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/glass-card'
import { Mail, User, Phone, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      // token saved for verification step
      localStorage.setItem('auth_token', data.token)
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Google sign-in flow
  const handleGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      alert('Google Client ID not configured')
      return
    }

    const redirectUri = `${window.location.origin}/google-oauth-callback.html`
    const nonce = Math.random().toString(36).substring(2)
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      prompt: 'select_account',
      nonce,
    })

    const width = 500, height = 650
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      'google_oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    function messageListener(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'google_oauth' && e.data.id_token) {
        // send id_token to backend
        fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: e.data.id_token }),
        }).then(async (res) => {
          const json = await res.json()
          if (res.ok) {
            localStorage.setItem('auth_token', json.token)
            router.push('/dashboard')
          } else {
            alert(json.error || 'Google sign-in failed')
          }
        })
      }
      window.removeEventListener('message', messageListener)
    }

    window.addEventListener('message', messageListener)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard animated className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-muted-foreground">Sign up to start your happiness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-destructive text-sm">{error}</div>}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign up'}
            </Button>
          </form>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              Sign up with Google
            </Button>
          </div>

          <p className="mt-4 text-center text-sm">
            Already have an account? <Link href="/auth/login" className="text-primary">Sign in</Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
