// Apply pass 5 — IMAP email archive stub.
// NEEDS-CREDS: env vars IMAP_HOST, IMAP_USER, IMAP_PASSWORD. Without them
// returns 503. We never connect to IMAP from this stub — implementing IMAP
// would require a new heavy dep. Instead we record an archive request that
// a future job runner can pick up.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.IMAP_HOST) return NextResponse.json({ error: 'IMAP not configured.', missing: 'IMAP_HOST' }, { status: 503 })
    if (!process.env.IMAP_USER) return NextResponse.json({ error: 'IMAP not configured.', missing: 'IMAP_USER' }, { status: 503 })
    if (!process.env.IMAP_PASSWORD) return NextResponse.json({ error: 'IMAP not configured.', missing: 'IMAP_PASSWORD' }, { status: 503 })

    const body = await request.json()
    const { mailbox, since, until, matterId } = body || {}

    // Audit via existing AIRequest table so we don't introduce new tables.
    const audit = await prisma.aIRequest.create({
      data: {
        userId: user.id,
        type: 'imap_archive_request',
        prompt: JSON.stringify({ mailbox, since, until, matterId }).slice(0, 4000),
        response: 'queued',
      } as any,
    })
    return NextResponse.json({ queued: true, request_id: audit.id, host: process.env.IMAP_HOST, mailbox: mailbox || 'INBOX' }, { status: 202 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
