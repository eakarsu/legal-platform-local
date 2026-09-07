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

    const accounts = await prisma.trustAccount.findMany({
      where: { firmId: session.user.firmId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Trust accounts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch trust accounts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const account = await prisma.trustAccount.create({
      data: {
        firmId: session.user.firmId,
        name: body.name,
        accountNumber: body.accountNumber,
        bankName: body.bankName,
        routingNumber: body.routingNumber || null,
        balance: 0,
        isActive: true,
        isIOLTA: body.isIOLTA ?? true,
        clientId: body.clientId || null,
        matterId: body.matterId || null,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Create trust account error:', error)
    return NextResponse.json({ error: 'Failed to create trust account' }, { status: 500 })
  }
}
