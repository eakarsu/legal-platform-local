import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const where: any = {
      firmId: session.user.firmId,
    }

    if (start && end) {
      where.startTime = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        attendees: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const event = await prisma.calendarEvent.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        title: body.title,
        description: body.description,
        type: body.type || 'MEETING',
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location,
        matterId: body.matterId || null,
        attendees: {
          create: {
            email: session.user.email,
            name: `${session.user.name}`,
            userId: session.user.id,
            status: 'ACCEPTED',
          },
        },
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        attendees: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
