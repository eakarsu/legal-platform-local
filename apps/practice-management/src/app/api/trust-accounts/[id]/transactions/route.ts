// Apply pass 5 — record trust transactions (DEPOSIT/WITHDRAWAL/etc).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const txs = await prisma.trustTransaction.findMany({
      where: { trustAccountId: id },
      orderBy: { transactionDate: 'desc' },
      take: 200,
    })
    return NextResponse.json({ data: txs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const { type, amount, description, referenceNumber, transactionDate } = body || {}
    if (!type || !amount || !description) {
      return NextResponse.json({ error: 'type, amount, description required' }, { status: 400 })
    }
    const allowed = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INTEREST', 'FEE']
    if (!allowed.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    const account = await prisma.trustAccount.findUnique({ where: { id } })
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    const tx = await prisma.trustTransaction.create({
      data: {
        trustAccountId: id,
        type,
        amount,
        description,
        referenceNumber: referenceNumber || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
    })
    // Update running balance
    const delta = (type === 'DEPOSIT' || type === 'INTEREST') ? Number(amount) : -Number(amount)
    await prisma.trustAccount.update({
      where: { id },
      data: { balance: { increment: delta } as any },
    })
    return NextResponse.json(tx, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
