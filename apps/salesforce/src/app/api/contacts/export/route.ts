import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contacts = await prisma.contact.findMany({
      where: { firmId: session.user.firmId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['First Name', 'Last Name', 'Type', 'Company', 'Title', 'Email', 'Phone', 'City', 'State']
    const rows = contacts.map(c => [
      c.firstName,
      c.lastName,
      c.type,
      c.company || '',
      c.title || '',
      c.email || '',
      c.phone || '',
      c.city || '',
      c.state || '',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=contacts.csv',
      },
    })
  } catch (error) {
    console.error('Export contacts error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
