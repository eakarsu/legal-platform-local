import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const firmId = session.user.firmId

    // Get stats
    const [
      openMatters,
      activeClients,
      unbilledTimeEntries,
      outstandingInvoices,
      upcomingDeadlinesCount,
    ] = await Promise.all([
      prisma.matter.count({
        where: { firmId, status: 'OPEN' },
      }),
      prisma.client.count({
        where: { firmId, status: 'ACTIVE' },
      }),
      prisma.timeEntry.aggregate({
        where: {
          matter: { firmId },
          billable: true,
          billed: false,
        },
        _sum: { hours: true, amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          matter: { firmId },
          status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        },
        _sum: { balanceDue: true },
      }),
      prisma.deadline.count({
        where: {
          matter: { firmId },
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Get upcoming events (next 7 days)
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        user: { firmId },
        startTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        matter: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    })

    // Get upcoming deadlines (next 14 days)
    const upcomingDeadlines = await prisma.deadline.findMany({
      where: {
        matter: { firmId },
        status: 'PENDING',
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        matter: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    })

    // Get recent activity (audit logs or time entries)
    const recentTimeEntries = await prisma.timeEntry.findMany({
      where: {
        matter: { firmId },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        matter: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const recentActivity = recentTimeEntries.map((entry) => ({
      id: entry.id,
      type: 'Time Entry',
      description: `${entry.user.firstName} ${entry.user.lastName} logged ${entry.hours}h on ${entry.matter.name}`,
      createdAt: entry.createdAt.toISOString(),
    }))

    return NextResponse.json({
      stats: {
        openMatters,
        activeClients,
        unbilledHours: Number(unbilledTimeEntries._sum.hours) || 0,
        unbilledAmount: Number(unbilledTimeEntries._sum.amount) || 0,
        outstandingInvoices: Number(outstandingInvoices._sum.balanceDue) || 0,
        upcomingDeadlines: upcomingDeadlinesCount,
      },
      upcomingEvents,
      upcomingDeadlines,
      recentActivity,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
