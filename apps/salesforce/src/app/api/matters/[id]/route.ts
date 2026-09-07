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
      include: {
        client: true,
        practiceArea: true,
        assignments: {
          include: { user: { select: { id: true, firstName: true, lastName: true, role: true, hourlyRate: true } } },
        },
        timeEntries: {
          include: { user: { select: { firstName: true, lastName: true } }, activityCode: true },
          orderBy: { date: 'desc' },
          take: 20,
        },
        expenses: {
          include: { expenseCode: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
        documents: {
          include: { uploadedBy: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        deadlines: {
          orderBy: { dueDate: 'asc' },
          where: { status: 'PENDING' },
        },
        tasks: {
          include: { assignedTo: { select: { firstName: true, lastName: true } } },
          orderBy: { dueDate: 'asc' },
          where: { status: { not: 'COMPLETED' } },
        },
        events: {
          orderBy: { startTime: 'asc' },
          where: { startTime: { gte: new Date() } },
          take: 5,
        },
        matterNotes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { timeEntries: true, documents: true, invoices: true, deadlines: true },
        },
      },
    })

    if (!matter || matter.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Calculate totals
    const unbilledTime = await prisma.timeEntry.aggregate({
      where: { matterId: params.id, billable: true, billed: false },
      _sum: { hours: true, amount: true },
    })

    const billedAmount = await prisma.invoice.aggregate({
      where: { matterId: params.id, status: { in: ['SENT', 'PARTIAL', 'PAID'] } },
      _sum: { totalAmount: true, paidAmount: true },
    })

    return NextResponse.json({
      ...matter,
      totals: {
        unbilledHours: Number(unbilledTime._sum.hours) || 0,
        unbilledAmount: Number(unbilledTime._sum.amount) || 0,
        billedAmount: Number(billedAmount._sum.totalAmount) || 0,
        paidAmount: Number(billedAmount._sum.paidAmount) || 0,
      },
    })
  } catch (error) {
    console.error('Get matter error:', error)
    return NextResponse.json({ error: 'Failed to fetch matter' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const existing = await prisma.matter.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    const matter = await prisma.matter.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        practiceAreaId: body.practiceAreaId,
        billingType: body.billingType,
        flatFee: body.flatFee ? parseFloat(body.flatFee) : null,
        contingencyPct: body.contingencyPct ? parseFloat(body.contingencyPct) : null,
        retainerAmount: body.retainerAmount ? parseFloat(body.retainerAmount) : null,
        budgetAmount: body.budgetAmount ? parseFloat(body.budgetAmount) : null,
        courtName: body.courtName,
        caseNumber: body.caseNumber,
        judgeName: body.judgeName,
        jurisdiction: body.jurisdiction,
        notes: body.notes,
        closeDate: body.status === 'CLOSED' ? new Date() : null,
      },
    })

    return NextResponse.json(matter)
  } catch (error) {
    console.error('Update matter error:', error)
    return NextResponse.json({ error: 'Failed to update matter' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.matter.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    await prisma.matter.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete matter error:', error)
    return NextResponse.json({ error: 'Failed to delete matter' }, { status: 500 })
  }
}
