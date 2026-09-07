import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Client Portal Self-Service — upload documents, request updates, approve bills, sign electronically.
// Validates the portal token issued by /api/clients/[id]/portal-token.
// TODO: configure credentials — DOCUSIGN_INTEGRATION_KEY, STRIPE_SECRET_KEY.

async function resolveClient(request: Request) {
  const token = request.headers.get('x-portal-token') || (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token || token.length < 32) return null
  try {
    const client = await (prisma as any).client.findUnique({
      where: { portalToken: token },
      select: { id: true, name: true, email: true },
    })
    return client
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const client = await resolveClient(request)
  if (!client) return NextResponse.json({ error: 'invalid portal token' }, { status: 401 })

  return NextResponse.json({
    clientId: client.id,
    clientName: client.name,
    selfServiceActions: ['upload_document', 'request_update', 'approve_invoice', 'esign_request'],
    integrations: {
      esign: !!process.env.DOCUSIGN_INTEGRATION_KEY,
      payments: !!process.env.STRIPE_SECRET_KEY,
    },
  })
}

export async function POST(request: Request) {
  const client = await resolveClient(request)
  if (!client) return NextResponse.json({ error: 'invalid portal token' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    action?: 'upload_document' | 'request_update' | 'approve_invoice' | 'esign_request'
    payload?: Record<string, unknown>
  }
  if (!body.action) return NextResponse.json({ error: 'action required' }, { status: 400 })

  if (body.action === 'esign_request' && !process.env.DOCUSIGN_INTEGRATION_KEY) {
    return NextResponse.json(
      { error: 'DOCUSIGN_INTEGRATION_KEY not configured', message: 'TODO: configure credentials.' },
      { status: 503 },
    )
  }
  if (body.action === 'approve_invoice' && !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured', message: 'TODO: configure credentials.' },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    action: body.action,
    clientId: client.id,
    queuedAt: new Date().toISOString(),
    payload: body.payload || {},
  })
}
