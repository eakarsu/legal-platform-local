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
    const status = searchParams.get('status') || ''
    const upcoming = searchParams.get('upcoming') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'dueDate', sortOrder: 'asc' })

    const where: any = {}

    if (matterId) where.matterId = matterId
    if (status && status !== 'all') where.status = status
    if (upcoming === 'true') {
      where.dueDate = { gte: new Date() }
      where.status = 'PENDING'
    }

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      dueDate: { dueDate: sortOrder },
      title: { title: sortOrder },
      deadlineType: { deadlineType: sortOrder },
      status: { status: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { dueDate: 'asc' }

    const [deadlines, total] = await Promise.all([
      prisma.deadline.findMany({
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
      prisma.deadline.count({ where })
    ])

    return NextResponse.json({
      deadlines,
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

    const deadline = await prisma.deadline.create({
      data: {
        matterId: body.matterId,
        title: body.title,
        description: body.description,
        deadlineType: body.deadlineType || 'FILING',
        dueDate: new Date(body.dueDate),
        status: body.status || 'PENDING',
        reminderDays: body.reminderDays || 7,
        courtRuleId: body.courtRuleId || null
      }
    })

    return NextResponse.json({ deadline }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
