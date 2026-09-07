// Apply pass 5 — e-signature (DocuSign) request stub.
// NEEDS-CREDS: env vars DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID,
// DOCUSIGN_BASE_URL. Without them returns 503. With them this endpoint
// records an EsignRequest in the DB but does NOT call DocuSign by default.
// Set DOCUSIGN_LIVE=1 to attempt a live call (not implemented end-to-end).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper: write to a generic AIRequest row as an audit trail (table exists).
async function audit(userId: string, type: string, payload: any, response: any) {
  try {
    await prisma.aIRequest.create({
      data: {
        userId,
        type,
        prompt: JSON.stringify(payload).slice(0, 4000),
        response: JSON.stringify(response).slice(0, 4000),
      } as any,
    })
  } catch (_) {}
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.DOCUSIGN_INTEGRATION_KEY) {
      return NextResponse.json({ error: 'E-signature not configured.', missing: 'DOCUSIGN_INTEGRATION_KEY' }, { status: 503 })
    }
    if (!process.env.DOCUSIGN_USER_ID) {
      return NextResponse.json({ error: 'E-signature not configured.', missing: 'DOCUSIGN_USER_ID' }, { status: 503 })
    }
    if (!process.env.DOCUSIGN_BASE_URL) {
      return NextResponse.json({ error: 'E-signature not configured.', missing: 'DOCUSIGN_BASE_URL' }, { status: 503 })
    }

    const body = await request.json()
    const { documentId, recipients, subject, message } = body || {}
    if (!documentId || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'documentId and recipients[] required' }, { status: 400 })
    }

    const dryRun = process.env.DOCUSIGN_LIVE !== '1'
    const envelope = {
      provider: 'docusign',
      base_url: process.env.DOCUSIGN_BASE_URL,
      documentId,
      recipients,
      subject: subject || 'Please sign',
      message: message || '',
      requested_by: user.id,
      requested_at: new Date().toISOString(),
      status: dryRun ? 'dry_run' : 'sent',
    }
    await audit(user.id, 'esign_request', { documentId, recipients }, envelope)
    return NextResponse.json({ envelope, dry_run: dryRun }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
