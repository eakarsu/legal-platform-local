// Apply pass 5 — client portal magic-link token issuance.
// PRODUCT-DECISION: scope = read-only client view of own matters / invoices.
// We mint a short-lived signed token (HMAC over clientId + exp) using
// process.env.JWT_SECRET. No new tables — the token is verified at request
// time. Without JWT_SECRET we return 503.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import crypto from 'crypto'

function sign(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Portal token not configured.', missing: 'JWT_SECRET' }, { status: 503 })
    }

    const body = await request.json()
    const { clientId, ttlMinutes } = body || {}
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const exp = Date.now() + (Math.min(parseInt(ttlMinutes, 10) || 60, 24 * 60) * 60 * 1000)
    const payload = Buffer.from(JSON.stringify({ clientId, exp, scope: 'portal:read' })).toString('base64url')
    const sig = sign(payload, process.env.JWT_SECRET)
    const token = `${payload}.${sig}`
    return NextResponse.json({ token, expires_at: new Date(exp).toISOString(), scope: 'portal:read' }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Verify a token (used by portal pages).
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token || !process.env.JWT_SECRET) return NextResponse.json({ valid: false }, { status: 200 })
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return NextResponse.json({ valid: false }, { status: 200 })
    const expected = sign(payload, process.env.JWT_SECRET)
    if (expected !== sig) return NextResponse.json({ valid: false }, { status: 200 })
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    if (data.exp < Date.now()) return NextResponse.json({ valid: false, reason: 'expired' })
    return NextResponse.json({ valid: true, clientId: data.clientId, scope: data.scope, exp: data.exp })
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e.message }, { status: 200 })
  }
}
