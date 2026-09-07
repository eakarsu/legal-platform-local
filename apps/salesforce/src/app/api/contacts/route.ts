import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { rateLimiter } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success } = rateLimiter(`contacts-${session.user.id}`, 100)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
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
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type && type !== 'all') {
      where.type = type
    }

    const allowedSortFields = ['createdAt', 'firstName', 'lastName', 'type', 'company', 'email']
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Contacts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const contact = await prisma.contact.create({
      data: {
        firmId: session.user.firmId,
        type: body.type,
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company || null,
        title: body.title || null,
        email: body.email || null,
        phone: body.phone || null,
        notes: body.notes || null,
        clientId: body.clientId || null,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
