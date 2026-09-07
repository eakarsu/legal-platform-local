import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { encryptField, decryptField, maskSSN, maskEIN } from '@/lib/encryption'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        matters: {
          include: {
            practiceArea: true,
            _count: { select: { timeEntries: true, documents: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        contacts: true,
        trustLedgers: {
          include: {
            trustAccount: true,
          },
        },
        _count: {
          select: { matters: true, documents: true },
        },
      },
    })

    if (!client || client.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Decrypt sensitive fields before returning; mask for non-admin roles
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'PARTNER'
    const decryptedClient = {
      ...client,
      ssn: client.ssn
        ? (isAdmin ? decryptField(client.ssn) : maskSSN(decryptField(client.ssn)))
        : null,
      ein: client.ein
        ? (isAdmin ? decryptField(client.ein) : maskEIN(decryptField(client.ein)))
        : null,
    }

    return NextResponse.json(decryptedClient)
  } catch (error) {
    console.error('Get client error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify client belongs to firm
    const existing = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Encrypt sensitive fields when provided
    const ssnToStore = body.ssn !== undefined
      ? (process.env.ENCRYPTION_KEY ? encryptField(body.ssn) : body.ssn)
      : undefined
    const einToStore = body.ein !== undefined
      ? (process.env.ENCRYPTION_KEY ? encryptField(body.ein) : body.ein)
      : undefined

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        type: body.type,
        status: body.status,
        firstName: body.firstName,
        lastName: body.lastName,
        companyName: body.companyName,
        email: body.email,
        phone: body.phone,
        mobile: body.mobile,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        referralSource: body.referralSource,
        referredBy: body.referredBy,
        notes: body.notes,
        ...(ssnToStore !== undefined && { ssn: ssnToStore }),
        ...(einToStore !== undefined && { ein: einToStore }),
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify client belongs to firm
    const existing = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Soft delete by setting status to ARCHIVED
    await prisma.client.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
