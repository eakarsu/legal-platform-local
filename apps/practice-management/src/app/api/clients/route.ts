import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateClientNumber } from '@/lib/utils'
import { getPaginationParams, paginationMeta } from '@/lib/pagination'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'createdAt' })

    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { clientNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) where.status = status
    if (type) where.type = type

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      clientNumber: { clientNumber: sortOrder },
      firstName: { firstName: sortOrder },
      lastName: { lastName: sortOrder },
      companyName: { companyName: sortOrder },
      email: { email: sortOrder },
      status: { status: sortOrder },
      type: { type: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { matters: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ])

    return NextResponse.json({
      clients,
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
    const {
      type, firstName, lastName, middleName, companyName, email, phone, mobile, fax,
      address, city, state, zipCode, country, billingRate, billingMethod, portalEnabled
    } = body

    const client = await prisma.client.create({
      data: {
        clientNumber: generateClientNumber(),
        type: type || 'INDIVIDUAL',
        firstName, lastName, middleName, companyName, email, phone, mobile, fax,
        address, city, state, zipCode, country,
        billingRate: billingRate ? parseFloat(billingRate) : null,
        billingMethod: billingMethod || 'HOURLY',
        portalEnabled: portalEnabled || false,
        createdById: user.id
      }
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
