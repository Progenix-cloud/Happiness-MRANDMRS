import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Session } from '@/lib/models'

// POST /api/auth/logout - clear auth cookies and session from DB
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Delete session from DB if session_id exists
    const sessionCookie = request.cookies.get('session_id')
    if (sessionCookie) {
      await Session.deleteOne({ sessionId: sessionCookie.value })
    }
  } catch (error) {
    console.error('Logout session cleanup error:', error)
    // Continue despite error to clear cookies
  }

  const res = NextResponse.json({ success: true })
  // Clear auth_token
  res.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  // Clear session_id
  res.cookies.set({
    name: 'session_id',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
