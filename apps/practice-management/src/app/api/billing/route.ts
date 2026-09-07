import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateInvoiceNumber } from '@/lib/utils'
import { getPaginationParams, paginationMeta } from '@/lib/pagination'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const clientId = searchParams.get('clientId') || ''
    const search = searchParams.get('search') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'createdAt' })

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (clientId) where.clientId = clientId
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { matter: { name: { contains: search, mode: 'insensitive' } } },
        { matter: { matterNumber: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      invoiceNumber: { invoiceNumber: sortOrder },
      issueDate: { issueDate: sortOrder },
      dueDate: { dueDate: sortOrder },
      total: { total: sortOrder },
      status: { status: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              type: true
            }
          },
          matter: {
            select: { id: true, name: true, matterNumber: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ])

    // Calculate stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const outstanding = invoices
      .filter(i => ['SENT', 'PARTIAL', 'OVERDUE'].includes(i.status))
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.paidAmount)), 0)

    const paidThisMonth = invoices
      .filter(i => i.paidDate && new Date(i.paidDate) >= startOfMonth)
      .reduce((sum, i) => sum + Number(i.paidAmount), 0)

    const overdue = invoices
      .filter(i => i.status === 'OVERDUE')
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.paidAmount)), 0)

    return NextResponse.json({
      invoices,
      stats: {
        totalOutstanding: outstanding,
        totalPaid: paidThisMonth,
        overdueAmount: overdue,
        invoiceCount: invoices.filter(i => !['PAID', 'CANCELLED'].includes(i.status)).length
      },
      pagination: paginationMeta(total, page, limit)
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        clientId: body.clientId,
        matterId: body.matterId,
        issueDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
        subtotal: parseFloat(body.subtotal),
        taxRate: body.taxRate ? parseFloat(body.taxRate) : null,
        taxAmount: body.taxAmount ? parseFloat(body.taxAmount) : null,
        total: parseFloat(body.total),
        notes: body.notes,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
