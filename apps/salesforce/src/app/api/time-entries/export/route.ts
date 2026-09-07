import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const entries = await prisma.timeEntry.findMany({
      where: { firmId: session.user.firmId },
      include: { matter: true, user: true, activityCode: true },
      orderBy: { date: 'desc' },
    })

    const headers = ['Date', 'Matter', 'Attorney', 'Activity', 'Description', 'Hours', 'Rate', 'Amount', 'Billable', 'Billed']
    const rows = entries.map(e => [
      e.date.toISOString().split('T')[0],
      e.matter.name,
      `${e.user.firstName} ${e.user.lastName}`,
      e.activityCode?.name || '',
      e.description,
      e.hours.toString(),
      e.rate.toString(),
      e.amount.toString(),
      e.billable ? 'Yes' : 'No',
      e.billed ? 'Yes' : 'No',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=time-entries.csv',
      },
    })
  } catch (error) {
    console.error('Export time entries error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
