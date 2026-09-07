import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ledgers = await prisma.trustLedger.findMany({
      where: { trustAccountId: params.id },
      include: {
        client: { select: { id: true, displayName: true, clientNumber: true } },
        matter: { select: { id: true, title: true, matterNumber: true } },
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(ledgers)
  } catch (error) {
    console.error('Get trust ledgers error:', error)
    return NextResponse.json({ error: 'Failed to fetch ledgers' }, { status: 500 })
  }
}
