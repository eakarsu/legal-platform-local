import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { amount, paymentMethod = 'CHECK', referenceNumber, notes } = body

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 })
    }

    // Get the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const paymentAmount = parseFloat(amount)
    const currentPaid = Number(invoice.paidAmount) || 0
    const total = Number(invoice.total)
    const newPaidAmount = currentPaid + paymentAmount

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        clientId: invoice.clientId,
        invoiceId: id,
        amount: paymentAmount,
        paymentDate: new Date(),
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || null,
        notes: notes || null
      }
    })

    // Determine new status
    let newStatus = invoice.status
    if (newPaidAmount >= total) {
      newStatus = 'PAID'
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL'
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        paidDate: newPaidAmount >= total ? new Date() : null,
        status: newStatus
      }
    })

    return NextResponse.json({
      success: true,
      payment,
      invoice: updatedInvoice
    })
  } catch (error) {
    console.error('Payment recording error:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const payments = await prisma.payment.findMany({
      where: { invoiceId: id },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
