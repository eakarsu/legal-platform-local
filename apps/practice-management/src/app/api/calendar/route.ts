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
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'startTime', sortOrder: 'asc' })

    const where: any = {}

    if (start && end) {
      where.startTime = {
        gte: new Date(start),
        lte: new Date(end)
      }
    }

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      startTime: { startTime: sortOrder },
      endTime: { endTime: sortOrder },
      title: { title: sortOrder },
      eventType: { eventType: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { startTime: 'asc' }

    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        include: {
          matter: { select: { id: true, name: true, matterNumber: true } },
          user: { select: { id: true, name: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.calendarEvent.count({ where })
    ])

    // Also get deadlines
    const deadlines = await prisma.deadline.findMany({
      where: {
        status: 'PENDING',
        dueDate: start && end ? {
          gte: new Date(start),
          lte: new Date(end)
        } : undefined
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json({
      events,
      deadlines,
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

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description,
        matterId: body.matterId || null,
        userId: user.id,
        eventType: body.eventType || 'MEETING',
        location: body.location,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        allDay: body.allDay || false,
        reminderMinutes: body.reminderMinutes
      }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
