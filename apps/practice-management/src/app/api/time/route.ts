import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPaginationParams, paginationMeta } from '@/lib/pagination'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const matterId = searchParams.get('matterId') || ''
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'date' })

    const where: any = {}

    if (matterId) where.matterId = matterId
    if (userId) where.userId = userId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      date: { date: sortOrder },
      hours: { hours: sortOrder },
      rate: { rate: sortOrder },
      amount: { amount: sortOrder },
      billableStatus: { billableStatus: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { date: 'desc' }

    const [timeEntries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        include: {
          matter: { select: { id: true, name: true, matterNumber: true } },
          user: { select: { id: true, name: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.timeEntry.count({ where })
    ])

    // Calculate totals
    const totals = timeEntries.reduce(
      (acc, entry) => {
        acc.hours += Number(entry.hours)
        acc.amount += Number(entry.amount)
        if (entry.billableStatus === 'BILLABLE') {
          acc.billableHours += Number(entry.hours)
          acc.billableAmount += Number(entry.amount)
        }
        return acc
      },
      { hours: 0, amount: 0, billableHours: 0, billableAmount: 0 }
    )

    return NextResponse.json({
      timeEntries,
      totals,
      pagination: paginationMeta(total, page, limit)
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get user's hourly rate
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { hourlyRate: true }
    })

    const hours = parseFloat(body.hours)
    const rate = body.rate ? parseFloat(body.rate) : (Number(dbUser?.hourlyRate) || 0)

    // Validate inputs to prevent overflow
    if (isNaN(hours) || hours <= 0 || hours > 999999) {
      return NextResponse.json({ error: 'Invalid hours value' }, { status: 400 })
    }
    if (isNaN(rate) || rate < 0 || rate > 99999999) {
      return NextResponse.json({ error: 'Invalid rate value' }, { status: 400 })
    }

    const amount = hours * rate

    // Validate calculated amount
    if (amount > 999999999999) {
      return NextResponse.json({ error: 'Calculated amount exceeds maximum allowed value' }, { status: 400 })
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        matterId: body.matterId,
        userId: user.id,
        date: new Date(body.date),
        hours,
        description: body.description,
        activityCode: body.activityCode,
        billableStatus: body.billableStatus || 'BILLABLE',
        rate,
        amount
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } }
      }
    })

    return NextResponse.json({ timeEntry }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
