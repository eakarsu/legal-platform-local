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
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const matterId = searchParams.get('matterId') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'dueDate', sortOrder: 'asc' })

    const where: any = {}

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (matterId) where.matterId = matterId

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      title: { title: sortOrder },
      status: { status: sortOrder },
      priority: { priority: sortOrder },
      dueDate: { dueDate: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { dueDate: 'asc' }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          matter: { select: { id: true, name: true, matterNumber: true } },
          createdBy: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.task.count({ where })
    ])

    return NextResponse.json({
      tasks,
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

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        matterId: body.matterId || null,
        createdById: user.id,
        assigneeId: body.assigneeId || null,
        priority: body.priority || 'MEDIUM',
        status: body.status || 'TODO',
        dueDate: body.dueDate ? new Date(body.dueDate) : null
      }
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
