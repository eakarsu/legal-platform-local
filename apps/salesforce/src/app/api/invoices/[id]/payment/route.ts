import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List payments for an invoice
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId: params.id },
      include: {
        recordedBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST - Record a payment
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
    const { amount, paymentMethod, paymentDate, reference, notes, applyFromTrust } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    // Get the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        matter: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (amount > invoice.balanceDue) {
      return NextResponse.json({ error: 'Payment amount exceeds balance due' }, { status: 400 })
    }

    // If applying from trust, check trust account balance
    if (applyFromTrust) {
      const trustAccount = await prisma.trustAccount.findFirst({
        where: {
          clientId: invoice.matter.clientId,
          firmId: session.user.firmId,
        },
      })

      if (!trustAccount || trustAccount.balance < amount) {
        return NextResponse.json({
          error: 'Insufficient trust account balance'
        }, { status: 400 })
      }

      // Create trust disbursement
      await prisma.trustTransaction.create({
        data: {
          trustAccountId: trustAccount.id,
          type: 'DISBURSEMENT',
          amount: -amount,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          reference: `INV-${invoice.invoiceNumber}`,
          matterId: invoice.matterId,
          invoiceId: invoice.id,
          createdById: session.user.id,
          status: 'COMPLETED',
        },
      })

      // Update trust account balance
      await prisma.trustAccount.update({
        where: { id: trustAccount.id },
        data: {
          balance: { decrement: amount },
        },
      })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        firmId: session.user.firmId,
        invoiceId: params.id,
        amount: amount,
        paymentMethod: paymentMethod || 'CHECK',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        reference: reference || null,
        notes: notes || null,
        fromTrust: applyFromTrust || false,
        recordedById: session.user.id,
        status: 'COMPLETED',
      },
    })

    // Update invoice
    const newPaidAmount = Number(invoice.paidAmount) + amount
    const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount
    const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIAL'

    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'PAYMENT_RECEIVED',
        description: `Received $${amount.toFixed(2)} payment for Invoice ${invoice.invoiceNumber}`,
        entityType: 'INVOICE',
        entityId: params.id,
        metadata: {
          amount,
          paymentMethod,
          fromTrust: applyFromTrust || false,
          newStatus,
          newBalance: newBalanceDue,
        },
      },
    })

    return NextResponse.json({
      success: true,
      payment,
      invoice: {
        id: invoice.id,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Record payment error:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}

// DELETE - Void a payment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.invoiceId !== params.id) {
      return NextResponse.json({ error: 'Payment does not belong to this invoice' }, { status: 400 })
    }

    // Update payment status to voided
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'VOIDED' },
    })

    // Recalculate invoice amounts (excluding voided payments)
    const validPayments = await prisma.payment.findMany({
      where: {
        invoiceId: params.id,
        status: 'COMPLETED',
      },
    })

    const newPaidAmount = validPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const newBalanceDue = Number(payment.invoice.totalAmount) - newPaidAmount
    const newStatus = newBalanceDue >= Number(payment.invoice.totalAmount) ? 'SENT' :
                      newBalanceDue <= 0 ? 'PAID' : 'PARTIAL'

    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'PAYMENT_VOIDED',
        description: `Voided $${payment.amount.toFixed(2)} payment for Invoice ${payment.invoice.invoiceNumber}`,
        entityType: 'INVOICE',
        entityId: params.id,
        metadata: {
          paymentId,
          amount: payment.amount,
          newStatus,
          newBalance: newBalanceDue,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment voided successfully',
      invoice: {
        id: params.id,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    })
  } catch (error) {
    console.error('Void payment error:', error)
    return NextResponse.json({ error: 'Failed to void payment' }, { status: 500 })
  }
}
