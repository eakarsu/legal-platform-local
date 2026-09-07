import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id: params.id },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        attendees: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    if (!event || event.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
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

    const existing = await prisma.calendarEvent.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await request.json()

    const event = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || 'MEETING',
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location || null,
        matterId: body.matterId || null,
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

    return NextResponse.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
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

    const existing = await prisma.calendarEvent.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete attendees first
    await prisma.eventAttendee.deleteMany({
      where: { eventId: params.id },
    })

    // Delete the event
    await prisma.calendarEvent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
