import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

/**
 * Client Portal — self-service matter updates, document uploads, billing/payment.
 * Validates a portal-issued JWT; lean v0 surfaces summary data with simulated paths.
 */

interface PortalContext {
  clientId: string
  matterIds: string[]
}

function extractPortalToken(request: NextRequest): PortalContext | null {
  const token = request.headers.get('x-portal-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const decoded = verifyToken(token) as unknown as PortalContext & { id?: string } | null
  if (!decoded) return null
  return { clientId: decoded.clientId || (decoded as any).id || 'unknown', matterIds: decoded.matterIds || [] }
}

export async function GET(request: NextRequest) {
  const ctx = extractPortalToken(request)
  if (!ctx) return NextResponse.json({ error: 'Invalid portal token' }, { status: 401 })

  return NextResponse.json({
    clientId: ctx.clientId,
    matters: ctx.matterIds.map((id) => ({
      id,
      status: 'in_progress',
      lastUpdate: new Date().toISOString(),
      unreadDocs: 0,
      outstandingInvoiceUSD: 0,
    })),
    actions: [
      { name: 'upload_document', endpoint: '/api/client-portal-self-service' },
      { name: 'pay_invoice', endpoint: '/api/client-portal-self-service' },
      { name: 'message_attorney', endpoint: '/api/client-portal-self-service' },
    ],
  })
}

export async function POST(request: NextRequest) {
  const ctx = extractPortalToken(request)
  if (!ctx) return NextResponse.json({ error: 'Invalid portal token' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    action?: 'upload_document' | 'pay_invoice' | 'message_attorney'
    payload?: Record<string, unknown>
  }
  if (!body.action) return NextResponse.json({ error: 'action required' }, { status: 400 })

  if (body.action === 'upload_document') {
    return NextResponse.json({ ok: true, ack: 'document queued', clientId: ctx.clientId, payload: body.payload || {} })
  }
  if (body.action === 'pay_invoice') {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured', message: 'TODO: configure credentials' }, { status: 503 })
    }
    return NextResponse.json({ ok: true, ack: 'payment intent created', clientId: ctx.clientId })
  }
  if (body.action === 'message_attorney') {
    return NextResponse.json({ ok: true, ack: 'message routed', clientId: ctx.clientId })
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
