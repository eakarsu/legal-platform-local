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

    const matter = await prisma.matter.findUnique({
      where: { id: params.id },
    })

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Fetch all related activities for this matter
    const [timeEntries, documents, deadlines, activities, invoices] = await Promise.all([
      // Time entries
      prisma.timeEntry.findMany({
        where: { matterId: params.id },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { date: 'desc' },
      }),
      // Documents
      prisma.document.findMany({
        where: { matterId: params.id },
        include: { uploadedBy: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      // Deadlines
      prisma.deadline.findMany({
        where: { matterId: params.id },
        include: { assignedTo: { select: { firstName: true, lastName: true } } },
        orderBy: { dueDate: 'desc' },
      }),
      // Activities
      prisma.activity.findMany({
        where: {
          entityType: 'MATTER',
          entityId: params.id,
        },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      // Invoices
      prisma.invoice.findMany({
        where: { matterId: params.id },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Combine all events into a unified timeline
    const timeline: Array<{
      id: string
      type: 'time_entry' | 'document' | 'deadline' | 'activity' | 'invoice' | 'status_change'
      date: Date
      title: string
      description: string
      user?: string
      metadata?: Record<string, unknown>
    }> = []

    // Add time entries
    for (const entry of timeEntries) {
      timeline.push({
        id: entry.id,
        type: 'time_entry',
        date: entry.date,
        title: 'Time Entry',
        description: entry.description,
        user: `${entry.user.firstName} ${entry.user.lastName}`,
        metadata: {
          hours: entry.hours,
          billable: entry.billable,
          amount: entry.amount,
        },
      })
    }

    // Add documents
    for (const doc of documents) {
      timeline.push({
        id: doc.id,
        type: 'document',
        date: doc.createdAt,
        title: 'Document Uploaded',
        description: doc.name,
        user: `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`,
        metadata: {
          category: doc.category,
          fileType: doc.fileType,
        },
      })
    }

    // Add deadlines
    for (const deadline of deadlines) {
      timeline.push({
        id: deadline.id,
        type: 'deadline',
        date: deadline.createdAt,
        title: `Deadline: ${deadline.title}`,
        description: deadline.description || '',
        user: deadline.assignedTo ? `${deadline.assignedTo.firstName} ${deadline.assignedTo.lastName}` : undefined,
        metadata: {
          dueDate: deadline.dueDate,
          priority: deadline.priority,
          status: deadline.status,
        },
      })
    }

    // Add activities
    for (const activity of activities) {
      timeline.push({
        id: activity.id,
        type: 'activity',
        date: activity.createdAt,
        title: activity.type.replace(/_/g, ' '),
        description: activity.description,
        user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : undefined,
        metadata: activity.metadata as Record<string, unknown>,
      })
    }

    // Add invoices
    for (const invoice of invoices) {
      timeline.push({
        id: invoice.id,
        type: 'invoice',
        date: invoice.createdAt,
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `Invoice created - ${invoice.status}`,
        metadata: {
          amount: invoice.totalAmount,
          status: invoice.status,
        },
      })
    }

    // Sort timeline by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      matterId: params.id,
      matterTitle: matter.title,
      timeline,
      summary: {
        totalTimeEntries: timeEntries.length,
        totalDocuments: documents.length,
        totalDeadlines: deadlines.length,
        totalInvoices: invoices.length,
        totalHours: timeEntries.reduce((sum, e) => sum + Number(e.hours), 0),
        totalBilled: invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0),
      },
    })
  } catch (error) {
    console.error('Matter timeline error:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
