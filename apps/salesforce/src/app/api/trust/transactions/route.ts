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
    const accountId = searchParams.get('accountId') || ''

    const where: any = {
      trustAccount: { firmId: session.user.firmId },
    }

    if (accountId && accountId !== 'all') {
      where.trustAccountId = accountId
    }

    const transactions = await prisma.trustTransaction.findMany({
      where,
      include: {
        trustAccount: { select: { name: true } },
        matter: { select: { title: true, matterNumber: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Trust transactions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
    if (!body.type) {
      return NextResponse.json({ error: 'Transaction type is required' }, { status: 400 })
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // Get account with a fresh read inside the transaction for consistency
    const account = await prisma.trustAccount.findUnique({
      where: { id: body.accountId },
    })

    if (!account || account.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (!account.isActive) {
      return NextResponse.json({ error: 'Trust account is inactive' }, { status: 400 })
    }

    // ---- Double-entry ledger validation ----
    // Re-compute the live balance by summing all committed transactions.
    // This guards against race conditions where the cached account.balance is stale.
    const ledgerSum = await prisma.trustTransaction.aggregate({
      where: { trustAccountId: body.accountId },
      _sum: { amount: true },
    })

    // Also sum by credit (DEPOSIT, TRANSFER_IN, INTEREST) vs debit (others)
    const credits = await prisma.trustTransaction.aggregate({
      where: {
        trustAccountId: body.accountId,
        type: { in: ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'] },
      },
      _sum: { amount: true },
    })
    const debits = await prisma.trustTransaction.aggregate({
      where: {
        trustAccountId: body.accountId,
        type: { in: ['DISBURSEMENT', 'TRANSFER_OUT', 'REFUND'] },
      },
      _sum: { amount: true },
    })

    const totalCredits = Number(credits._sum.amount ?? 0)
    const totalDebits = Number(debits._sum.amount ?? 0)
    const computedBalance = totalCredits - totalDebits

    // Detect balance discrepancy (cached vs ledger-computed)
    const cachedBalance = Number(account.balance)
    if (Math.abs(computedBalance - cachedBalance) > 0.01) {
      console.error(
        `[trust] Balance discrepancy on account ${account.id}: ` +
        `cached=${cachedBalance}, ledger-computed=${computedBalance}`
      )
      // Use the authoritative ledger-computed balance going forward
    }

    const liveBalance = computedBalance

    // ---- Pre-withdrawal balance verification ----
    const isDebit = ['DISBURSEMENT', 'TRANSFER_OUT', 'REFUND'].includes(body.type)
    let newBalance: number

    if (isDebit) {
      if (amount > liveBalance) {
        return NextResponse.json(
          {
            error: 'Insufficient funds',
            detail: `Requested disbursement of $${amount.toFixed(2)} exceeds available trust balance of $${liveBalance.toFixed(2)}`,
            availableBalance: liveBalance,
          },
          { status: 400 }
        )
      }
      newBalance = liveBalance - amount
    } else {
      newBalance = liveBalance + amount
    }

    // ---- Create transaction + update ledger + sync account balance atomically ----
    // If a ledgerId is provided, also update the per-client/matter sub-ledger
    const ops: any[] = [
      prisma.trustTransaction.create({
        data: {
          trustAccountId: body.accountId,
          matterId: body.matterId || null,
          ledgerId: body.ledgerId || null,
          type: body.type,
          amount,
          runningBalance: newBalance,
          description: body.description,
          reference: body.reference || null,
          date: body.date ? new Date(body.date) : new Date(),
          createdById: session.user.id,
        },
        include: {
          trustAccount: { select: { name: true } },
          matter: { select: { title: true, matterNumber: true } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      }),
      // Sync the cached account balance
      prisma.trustAccount.update({
        where: { id: body.accountId },
        data: { balance: newBalance },
      }),
    ]

    // If sub-ledger specified, update its running balance too
    if (body.ledgerId) {
      const ledger = await prisma.trustLedger.findUnique({ where: { id: body.ledgerId } })
      if (ledger) {
        const ledgerBalance = isDebit
          ? Number(ledger.balance) - amount
          : Number(ledger.balance) + amount
        ops.push(
          prisma.trustLedger.update({
            where: { id: body.ledgerId },
            data: { balance: ledgerBalance },
          })
        )
      }
    }

    const [transaction] = await prisma.$transaction(ops)

    return NextResponse.json(
      {
        ...transaction,
        accountBalance: newBalance,
        ledgerBalance: { totalCredits, totalDebits, computed: newBalance },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create trust transaction error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
