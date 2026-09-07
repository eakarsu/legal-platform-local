import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, matterId, amount, description, reference, date } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }

    // Get trust account
    const trustAccount = await prisma.trustAccount.findUnique({
      where: { id: params.id },
    })

    if (!trustAccount) {
      return NextResponse.json({ error: 'Trust account not found' }, { status: 404 })
    }

    // Find or create ledger
    let ledger = await prisma.trustLedger.findFirst({
      where: {
        trustAccountId: params.id,
        clientId,
        matterId: matterId || null,
      },
    })

    if (!ledger) {
      ledger = await prisma.trustLedger.create({
        data: {
          trustAccountId: params.id,
          clientId,
          matterId: matterId || null,
          balance: 0,
        },
      })
    }

    const newLedgerBalance = Number(ledger.balance) + amount
    const newAccountBalance = Number(trustAccount.balance) + amount

    // Create transaction
    const transaction = await prisma.trustTransaction.create({
      data: {
        trustAccountId: params.id,
        ledgerId: ledger.id,
        type: 'DEPOSIT',
        amount: amount,
        runningBalance: newLedgerBalance,
        description: description || 'Client deposit',
        reference: reference || null,
        date: date ? new Date(date) : new Date(),
        matterId: matterId || null,
        createdById: session.user.id,
      },
    })

    // Update ledger balance
    await prisma.trustLedger.update({
      where: { id: ledger.id },
      data: { balance: newLedgerBalance },
    })

    // Update account balance
    await prisma.trustAccount.update({
      where: { id: params.id },
      data: { balance: newAccountBalance },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'TRUST_DEPOSIT',
        description: `Deposited $${amount.toFixed(2)} to trust account`,
        entityType: 'TRUST_ACCOUNT',
        entityId: params.id,
        metadata: {
          amount,
          clientId,
          matterId,
          reference,
          newBalance: newAccountBalance,
        },
      },
    })

    return NextResponse.json({
      success: true,
      transaction,
      ledgerBalance: newLedgerBalance,
      accountBalance: newAccountBalance,
    }, { status: 201 })
  } catch (error) {
    console.error('Trust deposit error:', error)
    return NextResponse.json({ error: 'Failed to record deposit' }, { status: 500 })
  }
}
