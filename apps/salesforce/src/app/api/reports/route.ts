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
    const start = searchParams.get('start') || new Date(new Date().getFullYear(), 0, 1).toISOString()
    const end = searchParams.get('end') || new Date().toISOString()

    const firmId = session.user.firmId

    // Get total revenue (from paid invoices)
    const revenueResult = await prisma.invoice.aggregate({
      where: {
        firmId,
        status: { in: ['PAID', 'PARTIAL'] },
        issueDate: { gte: new Date(start), lte: new Date(end) },
      },
      _sum: { paidAmount: true },
    })

    // Get total hours
    const hoursResult = await prisma.timeEntry.aggregate({
      where: {
        matter: { firmId },
        date: { gte: new Date(start), lte: new Date(end) },
        billable: true,
      },
      _sum: { hours: true },
    })

    // Get active matters count
    const mattersCount = await prisma.matter.count({
      where: { firmId, status: { in: ['OPEN', 'PENDING'] } },
    })

    // Get active clients count
    const clientsCount = await prisma.client.count({
      where: { firmId, status: 'ACTIVE' },
    })

    // Get revenue by practice area
    const practiceAreas = await prisma.practiceArea.findMany({
      where: { firmId },
      include: {
        matters: {
          include: {
            invoices: {
              where: {
                status: { in: ['PAID', 'PARTIAL'] },
                issueDate: { gte: new Date(start), lte: new Date(end) },
              },
            },
          },
        },
      },
    })

    const revenueByPracticeArea = practiceAreas.map((pa) => ({
      name: pa.name,
      color: pa.color || '#64748B',
      value: pa.matters.reduce(
        (sum, m) => sum + m.invoices.reduce((s, i) => s + Number(i.paidAmount), 0),
        0
      ),
    })).filter((pa) => pa.value > 0)

    // Get hours by attorney
    const users = await prisma.user.findMany({
      where: { firmId, role: { in: ['ADMIN', 'PARTNER', 'ATTORNEY', 'PARALEGAL'] } },
      include: {
        timeEntries: {
          where: {
            date: { gte: new Date(start), lte: new Date(end) },
          },
        },
      },
    })

    const hoursByAttorney = users.map((u) => ({
      name: `${u.firstName} ${u.lastName}`,
      hours: u.timeEntries.reduce((sum, e) => sum + Number(e.hours), 0),
      billable: u.timeEntries.filter((e) => e.billable).reduce((sum, e) => sum + Number(e.hours), 0),
    })).filter((u) => u.hours > 0)

    // Get matters by status
    const mattersByStatus = await prisma.matter.groupBy({
      by: ['status'],
      where: { firmId },
      _count: true,
    })

    // Get AR aging
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        firmId,
        status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
      },
    })

    const arAgingReport = [
      {
        period: 'Current (0-30 days)',
        amount: outstandingInvoices
          .filter((i) => i.dueDate >= thirtyDaysAgo)
          .reduce((sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
      },
      {
        period: '31-60 days',
        amount: outstandingInvoices
          .filter((i) => i.dueDate < thirtyDaysAgo && i.dueDate >= sixtyDaysAgo)
          .reduce((sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
      },
      {
        period: '61-90 days',
        amount: outstandingInvoices
          .filter((i) => i.dueDate < sixtyDaysAgo && i.dueDate >= ninetyDaysAgo)
          .reduce((sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
      },
      {
        period: 'Over 90 days',
        amount: outstandingInvoices
          .filter((i) => i.dueDate < ninetyDaysAgo)
          .reduce((sum, i) => sum + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
      },
    ]

    return NextResponse.json({
      totalRevenue: Number(revenueResult._sum.paidAmount) || 0,
      totalHours: Number(hoursResult._sum.hours) || 0,
      totalMatters: mattersCount,
      totalClients: clientsCount,
      revenueByPracticeArea,
      hoursByAttorney,
      mattersByStatus: mattersByStatus.map((m) => ({
        status: m.status,
        count: m._count,
      })),
      arAgingReport,
      monthlyRevenue: [], // Would need more complex query
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
