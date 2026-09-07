import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: any = {
      firmId: session.user.firmId,
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { matter: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const allowedSortFields = ['createdAt', 'invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status']
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
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
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Invoices API error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get matter details
    const matter = await prisma.matter.findUnique({
      where: { id: body.matterId },
      include: { client: true },
    })

    if (!matter || matter.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Use provided amount or calculate from unbilled entries
    let totalAmount = parseFloat(body.amount) || 0
    let timeEntries: any[] = []
    let expenses: any[] = []

    if (!body.amount) {
      // Get unbilled time entries for this matter
      timeEntries = await prisma.timeEntry.findMany({
        where: { matterId: body.matterId, billable: true, billed: false },
      })

      // Get unbilled expenses for this matter
      expenses = await prisma.expense.findMany({
        where: { matterId: body.matterId, billable: true, billed: false },
      })

      // Calculate totals
      const timeTotal = timeEntries.reduce((sum, entry) => sum + Number(entry.amount), 0)
      const expenseTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
      totalAmount = timeTotal + expenseTotal
    }

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { firmId: session.user.firmId },
      orderBy: { createdAt: 'desc' },
    })
    const lastNum = lastInvoice?.invoiceNumber?.match(/\d+$/)?.[0] || '0'
    const newNum = (parseInt(lastNum) + 1).toString().padStart(5, '0')
    const invoiceNumber = `INV-${newNum}`

    const invoice = await prisma.invoice.create({
      data: {
        firmId: session.user.firmId,
        matterId: body.matterId,
        invoiceNumber,
        status: body.status || 'DRAFT',
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        dueDate: new Date(body.dueDate),
        subtotal: totalAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        notes: body.notes,
        createdById: session.user.id,
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

    // Mark time entries as billed (only if we calculated from entries)
    if (!body.amount && timeEntries.length > 0) {
      await prisma.timeEntry.updateMany({
        where: { id: { in: timeEntries.map((e) => e.id) } },
        data: { billed: true, invoiceId: invoice.id },
      })
    }

    // Mark expenses as billed (only if we calculated from entries)
    if (!body.amount && expenses.length > 0) {
      await prisma.expense.updateMany({
        where: { id: { in: expenses.map((e) => e.id) } },
        data: { billed: true, invoiceId: invoice.id },
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
