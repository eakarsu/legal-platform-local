import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
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
    const category = searchParams.get('category') || ''
    const matterId = searchParams.get('matterId') || ''
    const clientId = searchParams.get('clientId') || ''
    const { page, limit, sortBy, sortOrder, skip } = getPaginationParams(request, { sortBy: 'createdAt' })

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) where.category = category
    if (matterId) where.matterId = matterId
    if (clientId) where.clientId = clientId

    const allowedSortFields: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      name: { name: sortOrder },
      category: { category: sortOrder },
      fileSize: { fileSize: sortOrder },
      fileType: { fileType: sortOrder },
    }

    const orderBy = allowedSortFields[sortBy] || { createdAt: 'desc' }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          matter: { select: { id: true, name: true, matterNumber: true } },
          client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
          uploadedBy: { select: { id: true, name: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.document.count({ where })
    ])

    return NextResponse.json({
      documents,
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const matterId = formData.get('matterId') as string
    const clientId = formData.get('clientId') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: name || file.name,
        description,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${uniqueFileName}`,
        category: category as any || 'OTHER',
        matterId: matterId || null,
        clientId: clientId || null,
        uploadedById: user.id
      }
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
