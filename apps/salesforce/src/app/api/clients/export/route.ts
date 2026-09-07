import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const clients = await prisma.client.findMany({
      where: { firmId: session.user.firmId },
      include: { _count: { select: { matters: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['Client Number', 'Name', 'Type', 'Status', 'Email', 'Phone', 'City', 'State', 'Matters', 'Created']
    const rows = clients.map(c => [
      c.clientNumber,
      c.displayName,
      c.type,
      c.status,
      c.email || '',
      c.phone || '',
      c.city || '',
      c.state || '',
      String(c._count.matters),
      c.createdAt.toISOString().split('T')[0],
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=clients.csv',
      },
    })
  } catch (error) {
    console.error('Export clients error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
