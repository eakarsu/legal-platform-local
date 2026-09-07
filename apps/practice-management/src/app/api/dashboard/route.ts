import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get stats
    const [
      totalClients,
      activeMatters,
      pendingTasks,
      unbilledTimeEntries,
      upcomingDeadlinesCount,
      paidInvoices
    ] = await Promise.all([
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.matter.count({ where: { status: 'OPEN' } }),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
      prisma.timeEntry.aggregate({
        where: { billableStatus: 'BILLABLE' },
        _sum: { hours: true }
      }),
      prisma.deadline.count({
        where: {
          status: 'PENDING',
          dueDate: { lte: thirtyDaysFromNow }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidDate: { gte: startOfMonth }
        },
        _sum: { paidAmount: true }
      })
    ])

    // Get upcoming deadlines
    const upcomingDeadlines = await prisma.deadline.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lte: thirtyDaysFromNow }
      },
      include: {
        matter: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    })

    // Get recent activity (combining multiple entity types)
    const recentMatters = await prisma.matter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { client: true }
    })

    const recentDocuments = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    const recentActivity = [
      ...recentMatters.map(m => ({
        id: m.id,
        type: 'matter',
        title: `New Matter: ${m.name}`,
        description: `Created for ${m.client.companyName || `${m.client.firstName} ${m.client.lastName}`}`,
        createdAt: m.createdAt.toISOString()
      })),
      ...recentDocuments.map(d => ({
        id: d.id,
        type: 'document',
        title: `Document Uploaded: ${d.name}`,
        description: `${d.category} - ${d.fileType}`,
        createdAt: d.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalClients,
        activeMatters,
        pendingTasks,
        unbilledHours: Number(unbilledTimeEntries._sum.hours) || 0,
        upcomingDeadlines: upcomingDeadlinesCount,
        totalRevenue: Number(paidInvoices._sum.paidAmount) || 0
      },
      upcomingDeadlines: upcomingDeadlines.map(d => ({
        id: d.id,
        title: d.title,
        matterName: d.matter.name,
        dueDate: d.dueDate.toISOString(),
        type: d.deadlineType
      })),
      recentActivity
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
