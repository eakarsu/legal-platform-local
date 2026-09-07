/**
 * POST /api/clients/:id/portal-token
 * Authenticated (admin/attorney only). Generates or regenerates a portal token for the client.
 * Returns the token so the firm can share the portal URL with the client.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN, PARTNER, or ATTORNEY roles can issue portal tokens
    const allowedRoles = ['ADMIN', 'PARTNER', 'ATTORNEY']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 })
    }

    // Confirm client belongs to the firm
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firmId: true,
        displayName: true,
        email: true,
        portalToken: true,
        portalEnabled: true,
      },
    })

    if (!client || client.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const regenerate = body.regenerate === true

    // If a token already exists and we're not regenerating, return existing
    if (client.portalToken && !regenerate) {
      const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${client.portalToken}`
      return NextResponse.json({
        token: client.portalToken,
        portalUrl,
        enabled: client.portalEnabled,
        message: 'Existing token returned. Pass { "regenerate": true } to rotate.',
      })
    }

    // Generate a cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex')

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        portalToken: token,
        portalEnabled: true,
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        portalToken: true,
        portalEnabled: true,
      },
    })

    const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${token}`

    return NextResponse.json({
      token: updated.portalToken,
      portalUrl,
      enabled: updated.portalEnabled,
      clientId: updated.id,
      clientName: updated.displayName,
      message: regenerate ? 'Portal token regenerated.' : 'Portal token created.',
    })
  } catch (error) {
    console.error('Portal token error:', error)
    return NextResponse.json({ error: 'Failed to generate portal token' }, { status: 500 })
  }
}

/**
 * DELETE /api/clients/:id/portal-token
 * Revoke portal access for the client.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowedRoles = ['ADMIN', 'PARTNER', 'ATTORNEY']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: { firmId: true },
    })

    if (!client || client.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await prisma.client.update({
      where: { id: params.id },
      data: { portalToken: null, portalEnabled: false },
    })

    return NextResponse.json({ message: 'Portal access revoked.' })
  } catch (error) {
    console.error('Revoke portal token error:', error)
    return NextResponse.json({ error: 'Failed to revoke portal token' }, { status: 500 })
  }
}
