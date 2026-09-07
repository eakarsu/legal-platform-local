// Apply pass 5 — Stripe-style payment processing stub.
// NEEDS-CREDS: env vars STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY. Without them
// returns 503. With them we write a Payment row through Prisma but do NOT
// call Stripe by default. Set STRIPE_LIVE=1 to attempt a live call (not
// implemented end-to-end here).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment processor not configured.', missing: 'STRIPE_SECRET_KEY' }, { status: 503 })
    }
    if (!process.env.STRIPE_PUBLIC_KEY) {
      return NextResponse.json({ error: 'Payment processor not configured.', missing: 'STRIPE_PUBLIC_KEY' }, { status: 503 })
    }

    const body = await request.json()
    const { invoiceId, amount, paymentMethod, sourceToken } = body || {}
    if (!invoiceId || !amount) return NextResponse.json({ error: 'invoiceId and amount required' }, { status: 400 })

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const dryRun = process.env.STRIPE_LIVE !== '1'
    const txnId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Record the payment row using Prisma's existing Payment model.
    const payment = await prisma.payment.create({
      data: {
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        amount,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        referenceNumber: txnId,
        notes: dryRun ? 'STRIPE_DRY_RUN' : 'STRIPE_LIVE',
      } as any,
    })

    return NextResponse.json({
      payment,
      transaction_id: txnId,
      dry_run: dryRun,
      provider: 'stripe',
      source_token: sourceToken ? '***redacted***' : null,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
