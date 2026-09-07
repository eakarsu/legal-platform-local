import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPaginationParams, paginationMeta } from '@/lib/pagination'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const matterId = searchParams.get('matterId') || ''
    const category = searchParams.get('category') || ''
    const billableStatus = searchParams.get('billableStatus') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'date' })

    const where: any = {}

    if (matterId) where.matterId = matterId
    if (category && category !== 'all') where.category = category
    if (billableStatus && billableStatus !== 'all') where.billableStatus = billableStatus

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      date: { date: sortOrder },
      amount: { amount: sortOrder },
      category: { category: sortOrder },
      vendor: { vendor: sortOrder },
      billableStatus: { billableStatus: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { date: 'desc' }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          matter: {
            select: {
              id: true,
              name: true,
              matterNumber: true,
              client: {
                select: { id: true, firstName: true, lastName: true, companyName: true }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    return NextResponse.json({
      expenses,
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

    const expense = await prisma.expense.create({
      data: {
        matterId: body.matterId,
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description,
        amount: parseFloat(body.amount),
        category: body.category || 'OTHER',
        vendor: body.vendor,
        receiptPath: body.receiptPath,
        billableStatus: body.billableStatus || 'BILLABLE'
      }
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
