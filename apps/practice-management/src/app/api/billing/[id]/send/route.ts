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

    // Get the invoice with client info
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update invoice status to SENT
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT'
      }
    })

    // In a real application, you would send an email here
    // For now, we just update the status

    // Create a message record for the client
    if (invoice.client?.id) {
      await prisma.message.create({
        data: {
          senderId: user.id,
          clientId: invoice.client.id,
          type: 'EMAIL',
          subject: `Invoice ${invoice.invoiceNumber}`,
          content: `Your invoice ${invoice.invoiceNumber} has been sent. Total amount: $${invoice.total}. Due date: ${invoice.dueDate.toLocaleDateString()}.`,
          toEmail: invoice.client.email,
          isSecure: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice sent successfully'
    })
  } catch (error) {
    console.error('Invoice send error:', error)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}
