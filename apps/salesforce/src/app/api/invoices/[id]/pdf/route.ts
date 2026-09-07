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

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        matter: {
          include: {
            client: true,
          },
        },
        timeEntries: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            activityCode: { select: { code: true, name: true } },
          },
        },
        expenses: {
          include: {
            expenseCode: { select: { code: true, name: true } },
          },
        },
        payments: true,
      },
    })

    if (!invoice || invoice.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Get firm info
    const firm = await prisma.firm.findUnique({
      where: { id: session.user.firmId },
    })

    const client = invoice.matter?.client
    const clientName = client?.type === 'BUSINESS' || client?.type === 'NONPROFIT'
      ? client?.companyName
      : `${client?.firstName || ''} ${client?.lastName || ''}`.trim()

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    }

    const timeTotal = invoice.timeEntries.reduce((sum, e) => sum + Number(e.amount), 0)
    const expenseTotal = invoice.expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .firm-info { text-align: right; }
    .firm-name { font-size: 24px; font-weight: bold; color: #1a365d; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #1a365d; margin-bottom: 20px; }
    .invoice-meta { margin-bottom: 30px; }
    .invoice-meta p { margin: 5px 0; }
    .bill-to { margin-bottom: 30px; }
    .bill-to h3 { margin-bottom: 10px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .totals { width: 300px; margin-left: auto; }
    .totals td { padding: 8px 12px; }
    .totals .total-row { font-size: 18px; font-weight: bold; background: #f0f0f0; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Date:</strong> ${formatDate(invoice.issueDate)}</p>
        <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
        <p><strong>Matter:</strong> ${invoice.matter?.name || 'N/A'} (${invoice.matter?.matterNumber || 'N/A'})</p>
      </div>
    </div>
    <div class="firm-info">
      <div class="firm-name">${firm?.name || 'Law Firm'}</div>
      <p>${firm?.address || ''}</p>
      <p>${firm?.city || ''}, ${firm?.state || ''} ${firm?.zip || ''}</p>
      <p>${firm?.phone || ''}</p>
      <p>${firm?.email || ''}</p>
    </div>
  </div>

  <div class="bill-to">
    <h3>Bill To:</h3>
    <p><strong>${clientName || 'Client'}</strong></p>
    <p>${client?.address || ''}</p>
    <p>${client?.city || ''}, ${client?.state || ''} ${client?.zip || ''}</p>
    <p>${client?.email || ''}</p>
  </div>

  ${invoice.timeEntries.length > 0 ? `
  <h3>Professional Services</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Attorney</th>
        <th class="text-right">Hours</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.timeEntries.map(entry => `
        <tr>
          <td>${formatDate(entry.date)}</td>
          <td>${entry.description}</td>
          <td>${entry.user.firstName} ${entry.user.lastName}</td>
          <td class="text-right">${Number(entry.hours).toFixed(1)}</td>
          <td class="text-right">${formatCurrency(Number(entry.rate))}</td>
          <td class="text-right">${formatCurrency(Number(entry.amount))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${invoice.expenses.length > 0 ? `
  <h3>Expenses</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Code</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.expenses.map(expense => `
        <tr>
          <td>${formatDate(expense.date)}</td>
          <td>${expense.description}</td>
          <td>${expense.expenseCode?.code || '-'}</td>
          <td class="text-right">${formatCurrency(Number(expense.amount))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <table class="totals">
    <tr>
      <td>Professional Services:</td>
      <td class="text-right">${formatCurrency(timeTotal)}</td>
    </tr>
    <tr>
      <td>Expenses:</td>
      <td class="text-right">${formatCurrency(expenseTotal)}</td>
    </tr>
    <tr>
      <td><strong>Subtotal:</strong></td>
      <td class="text-right"><strong>${formatCurrency(Number(invoice.totalAmount))}</strong></td>
    </tr>
    ${Number(invoice.paidAmount) > 0 ? `
    <tr>
      <td>Payments Received:</td>
      <td class="text-right">-${formatCurrency(Number(invoice.paidAmount))}</td>
    </tr>
    ` : ''}
    <tr class="total-row">
      <td>Balance Due:</td>
      <td class="text-right">${formatCurrency(Number(invoice.balanceDue))}</td>
    </tr>
  </table>

  ${invoice.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
    <strong>Notes:</strong>
    <p>${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Payment is due within ${client?.paymentTerms || 30} days of invoice date.</p>
  </div>
</body>
</html>
`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Generate PDF error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
