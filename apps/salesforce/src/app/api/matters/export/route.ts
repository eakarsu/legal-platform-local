import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const matters = await prisma.matter.findMany({
      where: { firmId: session.user.firmId },
      include: {
        client: true,
        practiceArea: true,
        _count: { select: { timeEntries: true, documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['Matter Number', 'Name', 'Client', 'Practice Area', 'Status', 'Billing Type', 'Time Entries', 'Documents', 'Open Date']
    const rows = matters.map(m => [
      m.matterNumber,
      m.name,
      m.client.displayName,
      m.practiceArea.name,
      m.status,
      m.billingType,
      String(m._count.timeEntries),
      String(m._count.documents),
      m.openDate.toISOString().split('T')[0],
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=matters.csv',
      },
    })
  } catch (error) {
    console.error('Export matters error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
