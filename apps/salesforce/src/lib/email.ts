import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export function generateInvoiceEmailHtml(invoice: {
  invoiceNumber: string
  clientName: string
  matterName: string
  totalAmount: number
  dueDate: Date
  firmName: string
}): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(invoice.totalAmount)

  const formattedDueDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(invoice.dueDate)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563EB; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #2563EB; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${invoice.firmName}</h1>
        </div>
        <div class="content">
          <p>Dear ${invoice.clientName},</p>
          <p>Please find attached your invoice for legal services rendered.</p>

          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Matter:</strong> ${invoice.matterName}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${formattedAmount}</span></p>
            <p><strong>Due Date:</strong> ${formattedDueDate}</p>
          </div>

          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>

          <p>Thank you for your business.</p>

          <p>Best regards,<br>${invoice.firmName}</p>
        </div>
        <div class="footer">
          <p>This email was sent from ${invoice.firmName}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
