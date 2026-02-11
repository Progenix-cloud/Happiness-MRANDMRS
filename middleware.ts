import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic in-memory rate limiter for development. For production, use Redis or an external store.
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Per-route rate limits (requests per minute)
const routeLimits: Record<string, number> = {
  '/api/auth/send-otp': 3, // Strict: 3 OTP requests per minute
  '/api/auth/verify-otp': 5, // Strict: 5 verify attempts per minute
  '/api/auth/login': 10, // Medium: 10 login attempts per minute
  '/api/auth/register': 10, // Medium: 10 registrations per minute
  '/api/votes': 30, // Moderate: 30 votes per minute
  '/api/auth/logout': 50, // High: logout is quick
}

type Entry = { count: number; firstRequest: number }
const ipMap = new Map<string, Map<string, Entry>>() // ip -> route -> entry

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  try {
    // NextRequest has no direct ip in Edge runtime; fallback to unknown
    return 'unknown'
  } catch (e) {
    return 'unknown'
  }
}

function getRouteLimit(pathname: string): number | null {
  // Check exact and prefix matches
  for (const [route, limit] of Object.entries(routeLimits)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return limit
    }
  }
  return null
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Add common security headers on every response
  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=()')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // CSP tuned for Cloudinary and external analytics
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' data: https: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloudinary.com https://cdn.jsdelivr.net https://cdn.jsdelivr.net/npm/; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com wss:; " +
    "frame-src 'self' https://cloudinary.com; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests;"
  )

  // Apply rate-limiting by route
  const limit = getRouteLimit(pathname)
  if (limit !== null) {
    const ip = getClientIp(req)
    const now = Date.now()

    if (!ipMap.has(ip)) {
      ipMap.set(ip, new Map())
    }
    const routeMap = ipMap.get(ip)!
    const entry = routeMap.get(pathname)

    if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW) {
      routeMap.set(pathname, { count: 1, firstRequest: now })
    } else {
      entry.count += 1
      routeMap.set(pathname, entry)
      if (entry.count > limit) {
        const tooMany = new NextResponse(JSON.stringify({ error: 'Too many requests', retryAfter: Math.ceil((entry.firstRequest + RATE_LIMIT_WINDOW - now) / 1000) }), {
          status: 429,
          headers: { 'content-type': 'application/json', 'Retry-After': Math.ceil((entry.firstRequest + RATE_LIMIT_WINDOW - now) / 1000).toString() },
        })
        // Reuse security headers on the 429 response
        tooMany.headers.set('X-Frame-Options', 'DENY')
        tooMany.headers.set('X-Content-Type-Options', 'nosniff')
        tooMany.headers.set('Referrer-Policy', 'no-referrer')
        tooMany.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
        tooMany.headers.set(
          'Content-Security-Policy',
          "default-src 'self'; frame-ancestors 'none';"
        )
        return tooMany
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/api/:path*'],
}
