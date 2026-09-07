import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateMatterNumber } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const practiceAreaId = searchParams.get('practiceAreaId') || ''
    const clientId = searchParams.get('clientId') || ''

    const where: Record<string, unknown> = {
      firmId: session.user.firmId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { matterNumber: { contains: search, mode: 'insensitive' } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'all') where.status = status
    if (practiceAreaId && practiceAreaId !== 'all') where.practiceAreaId = practiceAreaId
    if (clientId && clientId !== 'all') where.clientId = clientId

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const allowedSortFields = ['createdAt', 'name', 'matterNumber', 'status', 'billingType']
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

    const [matters, total] = await Promise.all([
      prisma.matter.findMany({
        where,
        include: {
          client: true,
          practiceArea: true,
          assignments: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          _count: { select: { timeEntries: true, documents: true, deadlines: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.matter.count({ where }),
    ])

    return NextResponse.json({
      data: matters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Matters API error:', error)
    return NextResponse.json({ error: 'Failed to fetch matters' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const matter = await prisma.matter.create({
      data: {
        matterNumber: generateMatterNumber(),
        title: body.name,
        name: body.name,
        description: body.description,
        status: body.status || 'OPEN',
        practiceAreaId: body.practiceAreaId,
        billingType: body.billingType || 'HOURLY',
        flatFee: body.flatFee ? parseFloat(body.flatFee) : null,
        contingencyPct: body.contingencyPct ? parseFloat(body.contingencyPct) : null,
        retainerAmount: body.retainerAmount ? parseFloat(body.retainerAmount) : null,
        budgetAmount: body.budgetAmount ? parseFloat(body.budgetAmount) : null,
        courtName: body.courtName,
        caseNumber: body.caseNumber,
        judgeName: body.judgeName,
        jurisdiction: body.jurisdiction,
        notes: body.notes,
        clientId: body.clientId,
        firmId: session.user.firmId,
      },
      include: {
        client: true,
        practiceArea: true,
      },
    })

    // Add current user as lead attorney
    await prisma.matterAssignment.create({
      data: {
        matterId: matter.id,
        userId: session.user.id,
        role: 'Lead Attorney',
      },
    })

    return NextResponse.json(matter)
  } catch (error) {
    console.error('Create matter error:', error)
    return NextResponse.json({ error: 'Failed to create matter' }, { status: 500 })
  }
}
