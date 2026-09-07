import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateClientNumber } from '@/lib/utils'
import { rateLimiter } from '@/lib/rate-limit'
import { encryptField } from '@/lib/encryption'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success } = rateLimiter(`clients-${session.user.id}`, 100)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: Record<string, unknown> = {
      firmId: session.user.firmId,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { clientNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (type && type !== 'all') {
      where.type = type
    }

    const allowedSortFields = ['createdAt', 'displayName', 'clientNumber', 'status', 'type', 'email']
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: { select: { matters: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Clients API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate displayName based on client type
    const displayName = body.displayName ||
      (body.type === 'BUSINESS' || body.type === 'NONPROFIT'
        ? body.companyName
        : `${body.firstName || ''} ${body.lastName || ''}`.trim()) || 'Unknown Client'

    // Encrypt sensitive fields before storage
    const encryptedSSN = process.env.ENCRYPTION_KEY ? encryptField(body.ssn) : null
    const encryptedEIN = process.env.ENCRYPTION_KEY ? encryptField(body.ein) : null

    const client = await prisma.client.create({
      data: {
        clientNumber: generateClientNumber(),
        type: body.type || 'INDIVIDUAL',
        status: body.status || 'ACTIVE',
        displayName,
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
        firmId: session.user.firmId,
        ...(encryptedSSN !== undefined && { ssn: encryptedSSN }),
        ...(encryptedEIN !== undefined && { ein: encryptedEIN }),
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
