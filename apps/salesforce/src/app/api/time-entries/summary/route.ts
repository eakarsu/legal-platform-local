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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const matterId = searchParams.get('matterId')
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month, user, matter

    // Build date range
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30))
    const end = endDate ? new Date(endDate) : new Date()

    // Build where clause
    const where: Record<string, unknown> = {
      firmId: session.user.firmId,
      date: {
        gte: start,
        lte: end,
      },
    }

    if (userId) where.userId = userId
    if (matterId) where.matterId = matterId

    // Get all time entries in range
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true } },
        matter: { select: { title: true, matterNumber: true } },
        activityCode: { select: { code: true, name: true } },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate overall totals
    const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0)
    const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + Number(e.hours), 0)
    const nonBillableHours = timeEntries.filter(e => !e.billable).reduce((sum, e) => sum + Number(e.hours), 0)
    const totalAmount = timeEntries.reduce((sum, e) => sum + Number(e.amount), 0)
    const billedAmount = timeEntries.filter(e => e.billed).reduce((sum, e) => sum + Number(e.amount), 0)
    const unbilledAmount = timeEntries.filter(e => !e.billed && e.billable).reduce((sum, e) => sum + Number(e.amount), 0)

    // Group entries based on groupBy parameter
    const grouped: Record<string, { hours: number; amount: number; entries: number; billableHours: number }> = {}

    for (const entry of timeEntries) {
      let key: string

      switch (groupBy) {
        case 'user':
          key = `${entry.user.firstName} ${entry.user.lastName}`
          break
        case 'matter':
          key = `${entry.matter.matterNumber} - ${entry.matter.title}`
          break
        case 'week':
          const weekStart = new Date(entry.date)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'day':
        default:
          key = entry.date.toISOString().split('T')[0]
      }

      if (!grouped[key]) {
        grouped[key] = { hours: 0, amount: 0, entries: 0, billableHours: 0 }
      }
      grouped[key].hours += Number(entry.hours)
      grouped[key].amount += Number(entry.amount)
      grouped[key].entries += 1
      if (entry.billable) {
        grouped[key].billableHours += Number(entry.hours)
      }
    }

    // By user breakdown
    const byUser: Record<string, { hours: number; amount: number; entries: number }> = {}
    for (const entry of timeEntries) {
      const userName = `${entry.user.firstName} ${entry.user.lastName}`
      if (!byUser[userName]) {
        byUser[userName] = { hours: 0, amount: 0, entries: 0 }
      }
      byUser[userName].hours += Number(entry.hours)
      byUser[userName].amount += Number(entry.amount)
      byUser[userName].entries += 1
    }

    // By matter breakdown
    const byMatter: Record<string, { hours: number; amount: number; entries: number }> = {}
    for (const entry of timeEntries) {
      const matterKey = entry.matter.matterNumber
      if (!byMatter[matterKey]) {
        byMatter[matterKey] = { hours: 0, amount: 0, entries: 0 }
      }
      byMatter[matterKey].hours += Number(entry.hours)
      byMatter[matterKey].amount += Number(entry.amount)
      byMatter[matterKey].entries += 1
    }

    return NextResponse.json({
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      totals: {
        hours: totalHours,
        billableHours,
        nonBillableHours,
        amount: totalAmount,
        billedAmount,
        unbilledAmount,
        entries: timeEntries.length,
        utilizationRate: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
      },
      grouped: Object.entries(grouped).map(([key, value]) => ({
        period: key,
        ...value,
      })),
      byUser: Object.entries(byUser).map(([name, data]) => ({ name, ...data })),
      byMatter: Object.entries(byMatter).map(([matterNumber, data]) => ({ matterNumber, ...data })),
    })
  } catch (error) {
    console.error('Time entries summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
