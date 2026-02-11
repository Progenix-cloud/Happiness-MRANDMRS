'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { login } = useAuth()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, otp)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the OTP sent to <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Enter 6-digit OTP
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                disabled={isLoading}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Expires in: <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push('/auth/login')}
              className="text-xs"
            >
              Back to login
            </Button>
          </div>

          {/* Development Note */}
          <div className="mt-6 p-3 bg-muted rounded text-xs text-muted-foreground">
            <p className="font-medium mb-1">Development Mode:</p>
            <p>
              In development, any 6-digit code works. In production, use the code sent to your
              email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
