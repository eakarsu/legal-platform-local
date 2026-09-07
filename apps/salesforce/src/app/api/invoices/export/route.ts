import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invoices = await prisma.invoice.findMany({
      where: { firmId: session.user.firmId },
      include: { matter: { include: { client: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['Invoice Number', 'Client', 'Matter', 'Status', 'Issue Date', 'Due Date', 'Total', 'Paid', 'Balance']
    const rows = invoices.map(i => [
      i.invoiceNumber,
      i.matter.client.displayName,
      i.matter.name,
      i.status,
      i.issueDate.toISOString().split('T')[0],
      i.dueDate.toISOString().split('T')[0],
      i.totalAmount.toString(),
      i.paidAmount.toString(),
      i.balanceDue.toString(),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=invoices.csv',
      },
    })
  } catch (error) {
    console.error('Export invoices error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
