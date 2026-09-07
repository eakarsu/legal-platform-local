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
    const days = parseInt(searchParams.get('days') || '30')
    const matterId = searchParams.get('matterId')
    const priority = searchParams.get('priority')
    const assignedToId = searchParams.get('assignedToId')

    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    // Build where clause
    const where: Record<string, unknown> = {
      firmId: session.user.firmId,
      dueDate: {
        gte: now,
        lte: futureDate,
      },
      status: { in: ['PENDING', 'EXTENDED'] },
    }

    if (matterId) where.matterId = matterId
    if (priority) where.priority = priority
    if (assignedToId) where.assignedToId = assignedToId

    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            matterNumber: true,
            client: { select: { displayName: true } },
          },
        },
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Group by urgency
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const overdue = deadlines.filter(d => d.dueDate < today)
    const dueToday = deadlines.filter(d => {
      const due = new Date(d.dueDate)
      due.setHours(0, 0, 0, 0)
      return due.getTime() === today.getTime()
    })
    const dueTomorrow = deadlines.filter(d => {
      const due = new Date(d.dueDate)
      due.setHours(0, 0, 0, 0)
      return due.getTime() === tomorrow.getTime()
    })
    const dueThisWeek = deadlines.filter(d => {
      const due = new Date(d.dueDate)
      due.setHours(0, 0, 0, 0)
      return due > tomorrow && due <= nextWeek
    })
    const dueLater = deadlines.filter(d => {
      const due = new Date(d.dueDate)
      due.setHours(0, 0, 0, 0)
      return due > nextWeek
    })

    // Priority breakdown
    const critical = deadlines.filter(d => d.priority === 'CRITICAL')
    const high = deadlines.filter(d => d.priority === 'HIGH')
    const medium = deadlines.filter(d => d.priority === 'MEDIUM')
    const low = deadlines.filter(d => d.priority === 'LOW')

    return NextResponse.json({
      total: deadlines.length,
      period: {
        start: now.toISOString(),
        end: futureDate.toISOString(),
        days,
      },
      byUrgency: {
        overdue: overdue.length,
        today: dueToday.length,
        tomorrow: dueTomorrow.length,
        thisWeek: dueThisWeek.length,
        later: dueLater.length,
      },
      byPriority: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length,
      },
      deadlines: {
        overdue,
        today: dueToday,
        tomorrow: dueTomorrow,
        thisWeek: dueThisWeek,
        later: dueLater,
      },
    })
  } catch (error) {
    console.error('Upcoming deadlines error:', error)
    return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 })
  }
}
