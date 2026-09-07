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
          select: {
            id: true,
            name: true,
            matterNumber: true,
            client: true,
          },
        },
        timeEntries: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            activityCode: true,
          },
        },
        expenses: {
          include: { expenseCode: true },
        },
        payments: true,
      },
    })

    if (!invoice || invoice.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Get invoice error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
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

    const existing = await prisma.invoice.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: body.status ?? existing.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
        notes: body.notes ?? existing.notes,
        paidAmount: body.paidAmount ?? existing.paidAmount,
      },
      include: {
        matter: {
          select: {
            id: true,
            name: true,
            matterNumber: true,
            client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
          },
        },
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Update invoice error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
