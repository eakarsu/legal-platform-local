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
    const matterId = searchParams.get('matterId') || ''
    const search = searchParams.get('search') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'createdAt' })

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (matterId) where.matterId = matterId
    if (search) {
      where.OR = [
        { documentName: { contains: search, mode: 'insensitive' } },
        { courtName: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { matter: { name: { contains: search, mode: 'insensitive' } } },
        { matter: { matterNumber: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      documentName: { documentName: sortOrder },
      filingType: { filingType: sortOrder },
      courtName: { courtName: sortOrder },
      dueDate: { dueDate: sortOrder },
      status: { status: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' }

    const [filings, total] = await Promise.all([
      prisma.courtFiling.findMany({
        where,
        include: {
          matter: {
            select: { id: true, name: true, matterNumber: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.courtFiling.count({ where })
    ])

    return NextResponse.json({
      filings,
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

    const filing = await prisma.courtFiling.create({
      data: {
        matterId: body.matterId,
        documentName: body.documentName,
        documentType: body.documentType || 'PLEADING',
        filingType: body.filingType || 'MOTION',
        courtName: body.courtName,
        caseNumber: body.caseNumber,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        filingFee: body.filingFee ? parseFloat(body.filingFee) : null,
        serviceRequired: body.serviceRequired || false,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ filing }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
