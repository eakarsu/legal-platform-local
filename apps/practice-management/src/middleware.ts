import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limit for middleware
const rateLimitStore = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.reset) {
    rateLimitStore.set(ip, { count: 1, reset: now + windowMs })
    return true
  }

  entry.count++
  return entry.count <= limit
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // ---- Security Headers (Helmet-equivalent) ----
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // ---- Rate Limiting ----
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Stricter rate limit for auth endpoints
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth/')
    const limit = isAuthRoute ? 10 : 100
    const windowMs = isAuthRoute ? 15 * 60 * 1000 : 60 * 1000

    if (!rateLimit(ip, limit, windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            ...Object.fromEntries(response.headers.entries())
          }
        }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
