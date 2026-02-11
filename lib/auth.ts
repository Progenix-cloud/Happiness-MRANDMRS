import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from './mongodb'
import { Session } from './models'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

export function ensureSecret() {
  if (!NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not set')
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
}

// Extract userId from Authorization header (Bearer) or HttpOnly cookie `auth_token`
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    ensureSecret()
  } catch (e) {
    return null
  }

  const authHeader = request.headers.get('authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    try {
      const cookieToken = request.cookies.get('auth_token')
      if (cookieToken) token = cookieToken.value
    } catch (e) {
      // ignore
    }
  }

  if (!token) return null

  try {
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId?: string }
    return payload.userId || null
  } catch (err) {
    // If JWT verification fails, attempt to validate session_id cookie against DB
    try {
      // ensure DB connection for session lookup
      connectDB()
        const sessionCookie = request.cookies.get('session_id')
        if (!sessionCookie) return null
        const session = await Session.findOne({ sessionId: sessionCookie.value, expiresAt: { $gt: new Date() } })
      if (session) {
        // update lastSeen asynchronously
        session.lastSeen = new Date()
        session.save().catch(() => {})
        return session.userId.toString()
      }
      return null
    } catch (e) {
      return null
    }
  }
}

export default { ensureSecret, getUserIdFromRequest }
