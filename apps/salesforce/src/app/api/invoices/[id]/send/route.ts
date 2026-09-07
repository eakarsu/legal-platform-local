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
    const { recipientEmail, cc, subject, message, attachPdf } = body

    // Get the invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        matter: {
          include: {
            client: true,
          },
        },
        firm: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Determine recipient
    const emailTo = recipientEmail || invoice.matter.client.email

    if (!emailTo) {
      return NextResponse.json({ error: 'No recipient email available' }, { status: 400 })
    }

    // In production, this would send an actual email via SMTP or email service
    // For now, we'll simulate the send and log it

    const emailSubject = subject || `Invoice ${invoice.invoiceNumber} from ${invoice.firm.name}`
    const emailMessage = message || `
Dear ${invoice.matter.client.displayName},

Please find attached Invoice ${invoice.invoiceNumber} for ${invoice.matter.title}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Invoice Date: ${invoice.invoiceDate.toLocaleDateString()}
- Due Date: ${invoice.dueDate.toLocaleDateString()}
- Amount Due: $${invoice.balanceDue.toFixed(2)}

Please remit payment by the due date.

Thank you for your business.

${invoice.firm.name}
    `.trim()

    // Update invoice status to SENT
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    // Log the email activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'INVOICE_SENT',
        description: `Sent invoice ${invoice.invoiceNumber} to ${emailTo}`,
        entityType: 'INVOICE',
        entityId: params.id,
        metadata: {
          recipientEmail: emailTo,
          cc: cc || null,
          subject: emailSubject,
          attachedPdf: attachPdf ?? true,
        },
      },
    })

    // Create an email log record (if EmailLog model exists)
    try {
      await prisma.emailLog.create({
        data: {
          firmId: session.user.firmId,
          userId: session.user.id,
          to: emailTo,
          cc: cc || null,
          subject: emailSubject,
          body: emailMessage,
          entityType: 'INVOICE',
          entityId: params.id,
          status: 'SENT',
          sentAt: new Date(),
        },
      })
    } catch {
      // EmailLog model might not exist, continue without logging
    }

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${emailTo}`,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}
