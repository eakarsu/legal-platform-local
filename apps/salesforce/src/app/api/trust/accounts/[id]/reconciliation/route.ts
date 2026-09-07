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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get trust account
    const trustAccount = await prisma.trustAccount.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        matter: true,
      },
    })

    if (!trustAccount) {
      return NextResponse.json({ error: 'Trust account not found' }, { status: 404 })
    }

    // Date range for reconciliation
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)) // First of current month
    const end = endDate ? new Date(endDate) : new Date()

    // Get all transactions in the period
    const transactions = await prisma.trustTransaction.findMany({
      where: {
        trustAccountId: params.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        matter: {
          select: { title: true, matterNumber: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate opening balance (sum of all transactions before start date)
    const priorTransactions = await prisma.trustTransaction.aggregate({
      where: {
        trustAccountId: params.id,
        createdAt: { lt: start },
      },
      _sum: { amount: true },
    })

    const openingBalance = Number(priorTransactions._sum.amount) || 0

    // Group transactions by type
    const deposits = transactions.filter(t => t.type === 'DEPOSIT')
    const disbursements = transactions.filter(t => t.type === 'DISBURSEMENT')
    const transfersIn = transactions.filter(t => t.type === 'TRANSFER_IN')
    const transfersOut = transactions.filter(t => t.type === 'TRANSFER_OUT')
    const interest = transactions.filter(t => t.type === 'INTEREST')

    // Calculate totals
    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalDisbursements = Math.abs(disbursements.reduce((sum, t) => sum + Number(t.amount), 0))
    const totalTransfersIn = transfersIn.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalTransfersOut = Math.abs(transfersOut.reduce((sum, t) => sum + Number(t.amount), 0))
    const totalInterest = interest.reduce((sum, t) => sum + Number(t.amount), 0)

    const netChange = totalDeposits - totalDisbursements + totalTransfersIn - totalTransfersOut + totalInterest
    const closingBalance = openingBalance + netChange

    // Check for discrepancies
    const expectedBalance = closingBalance
    const actualBalance = Number(trustAccount.balance)
    const discrepancy = actualBalance - expectedBalance

    // Get matter-level breakdown
    const matterBreakdown = await prisma.trustTransaction.groupBy({
      by: ['matterId'],
      where: {
        trustAccountId: params.id,
      },
      _sum: { amount: true },
    })

    const matterDetails = await Promise.all(
      matterBreakdown.map(async (mb) => {
        if (!mb.matterId) return null
        const matter = await prisma.matter.findUnique({
          where: { id: mb.matterId },
          select: { id: true, title: true, matterNumber: true },
        })
        return {
          matter,
          balance: mb._sum.amount || 0,
        }
      })
    )

    // Generate reconciliation report
    const reconciliation = {
      trustAccountId: trustAccount.id,
      accountNumber: trustAccount.accountNumber,
      clientName: trustAccount.client?.displayName,
      matterTitle: trustAccount.matter?.title,

      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },

      summary: {
        openingBalance,
        deposits: totalDeposits,
        disbursements: totalDisbursements,
        transfersIn: totalTransfersIn,
        transfersOut: totalTransfersOut,
        interest: totalInterest,
        netChange,
        closingBalance,
        actualBalance,
        discrepancy,
        isReconciled: Math.abs(discrepancy) < 0.01, // Allow for rounding
      },

      transactions: {
        deposits: deposits.map(t => ({
          id: t.id,
          date: t.createdAt,
          description: t.description,
          reference: t.reference,
          amount: Number(t.amount),
          matter: t.matter,
          recordedBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : null,
        })),
        disbursements: disbursements.map(t => ({
          id: t.id,
          date: t.createdAt,
          description: t.description,
          reference: t.reference,
          amount: Math.abs(Number(t.amount)),
          matter: t.matter,
          recordedBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : null,
        })),
        transfersIn: transfersIn.map(t => ({
          id: t.id,
          date: t.createdAt,
          description: t.description,
          reference: t.reference,
          amount: Number(t.amount),
          matter: t.matter,
          recordedBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : null,
        })),
        transfersOut: transfersOut.map(t => ({
          id: t.id,
          date: t.createdAt,
          description: t.description,
          reference: t.reference,
          amount: Math.abs(Number(t.amount)),
          matter: t.matter,
          recordedBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : null,
        })),
        interest: interest.map(t => ({
          id: t.id,
          date: t.createdAt,
          description: t.description,
          reference: t.reference,
          amount: Number(t.amount),
          matter: t.matter,
          recordedBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : null,
        })),
      },

      matterBreakdown: matterDetails.filter(Boolean),

      generatedAt: new Date().toISOString(),
      generatedBy: `${session.user.firstName} ${session.user.lastName}`,
    }

    return NextResponse.json(reconciliation)
  } catch (error) {
    console.error('Trust reconciliation error:', error)
    return NextResponse.json({ error: 'Failed to generate reconciliation' }, { status: 500 })
  }
}

// POST - Mark account as reconciled
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
    const { bankBalance, reconciliationDate, notes } = body

    if (bankBalance === undefined) {
      return NextResponse.json({ error: 'Bank balance is required' }, { status: 400 })
    }

    const trustAccount = await prisma.trustAccount.findUnique({
      where: { id: params.id },
    })

    if (!trustAccount) {
      return NextResponse.json({ error: 'Trust account not found' }, { status: 404 })
    }

    const discrepancy = bankBalance - Number(trustAccount.balance)

    // Create reconciliation record
    const reconciliation = await prisma.trustReconciliation.create({
      data: {
        trustAccountId: params.id,
        firmId: session.user.firmId,
        reconciliationDate: reconciliationDate ? new Date(reconciliationDate) : new Date(),
        bookBalance: trustAccount.balance,
        bankBalance: bankBalance,
        discrepancy: discrepancy,
        notes: notes || null,
        reconciledById: session.user.id,
        status: Math.abs(discrepancy) < 0.01 ? 'RECONCILED' : 'DISCREPANCY',
      },
    })

    // Update trust account last reconciled date
    await prisma.trustAccount.update({
      where: { id: params.id },
      data: {
        lastReconciledAt: new Date(),
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'TRUST_RECONCILED',
        description: `Reconciled trust account ${trustAccount.accountNumber}`,
        entityType: 'TRUST_ACCOUNT',
        entityId: params.id,
        metadata: {
          bookBalance: trustAccount.balance,
          bankBalance,
          discrepancy,
          status: reconciliation.status,
        },
      },
    })

    return NextResponse.json({
      success: true,
      reconciliation,
    }, { status: 201 })
  } catch (error) {
    console.error('Create reconciliation error:', error)
    return NextResponse.json({ error: 'Failed to create reconciliation' }, { status: 500 })
  }
}
