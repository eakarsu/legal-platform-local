import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DocumentType } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const matterId = searchParams.get('matterId') || ''

    const where: any = {
      firmId: session.user.firmId,
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (matterId && matterId !== 'all') {
      where.matterId = matterId
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const matterId = formData.get('matterId') as string
    const clientId = formData.get('clientId') as string
    const category = formData.get('category') as string || 'GENERAL'

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.user.firmId)
    await mkdir(uploadDir, { recursive: true })

    const createdDocs = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}-${safeName}`
      const filePath = path.join(uploadDir, fileName)

      // Save file to disk
      await writeFile(filePath, buffer)

      // Validate DocumentType - use OTHER if invalid
      const validTypes = Object.values(DocumentType)
      const docType = validTypes.includes(category as DocumentType) ? (category as DocumentType) : DocumentType.OTHER

      // Create database record
      const doc = await prisma.document.create({
        data: {
          firmId: session.user.firmId,
          name: file.name,
          type: docType,
          mimeType: file.type,
          fileSize: file.size,
          filePath: `/uploads/${session.user.firmId}/${fileName}`,
          category: docType,
          matterId: matterId || null,
          clientId: clientId || null,
          uploadedById: session.user.id,
        },
        include: {
          matter: { select: { id: true, name: true, matterNumber: true } },
          client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
          uploadedBy: { select: { firstName: true, lastName: true } },
        },
      })

      createdDocs.push(doc)
    }

    return NextResponse.json(createdDocs, { status: 201 })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ error: 'Failed to upload documents' }, { status: 500 })
  }
}
