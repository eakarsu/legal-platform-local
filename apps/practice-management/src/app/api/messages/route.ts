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

    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'createdAt' })

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      subject: { subject: sortOrder },
      type: { type: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' }

    const where: any = {}

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true } },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ])

    return NextResponse.json({
      messages,
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

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        clientId: body.clientId,
        type: body.type || 'EMAIL',
        subject: body.subject,
        content: body.content,
        toEmail: body.toEmail,
        isSecure: true
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
