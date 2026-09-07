import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET - List all versions of a document
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          include: {
            uploadedBy: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { versionNumber: 'desc' },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      documentId: document.id,
      documentName: document.name,
      currentVersion: document.version,
      versions: document.versions,
    })
  } catch (error) {
    console.error('Get document versions error:', error)
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
  }
}

// POST - Upload a new version
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const comment = formData.get('comment') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Get the existing document
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Calculate new version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: params.id },
      orderBy: { versionNumber: 'desc' },
    })

    const newVersionNumber = (latestVersion?.versionNumber || document.version || 1) + 1

    // Save file to uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents', params.id)
    await mkdir(uploadsDir, { recursive: true })

    const ext = path.extname(file.name)
    const fileName = `v${newVersionNumber}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create version record
    const version = await prisma.documentVersion.create({
      data: {
        documentId: params.id,
        versionNumber: newVersionNumber,
        filePath: filePath,
        fileSize: file.size,
        uploadedById: session.user.id,
        comment: comment || null,
      },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    // Update main document version number
    await prisma.document.update({
      where: { id: params.id },
      data: {
        version: newVersionNumber,
        fileSize: file.size,
        filePath: filePath,
        updatedAt: new Date(),
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'DOCUMENT_VERSION',
        description: `Uploaded version ${newVersionNumber} of ${document.name}`,
        entityType: 'DOCUMENT',
        entityId: params.id,
        metadata: {
          versionNumber: newVersionNumber,
          comment: comment,
          fileSize: file.size,
        },
      },
    })

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Upload document version error:', error)
    return NextResponse.json({ error: 'Failed to upload version' }, { status: 500 })
  }
}

// PUT - Restore a specific version
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { versionNumber } = body

    if (!versionNumber) {
      return NextResponse.json({ error: 'Version number required' }, { status: 400 })
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const version = await prisma.documentVersion.findFirst({
      where: {
        documentId: params.id,
        versionNumber: versionNumber,
      },
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Create a new version based on the old one (restoration)
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: params.id },
      orderBy: { versionNumber: 'desc' },
    })

    const newVersionNumber = (latestVersion?.versionNumber || 1) + 1

    // Create restoration version record
    await prisma.documentVersion.create({
      data: {
        documentId: params.id,
        versionNumber: newVersionNumber,
        filePath: version.filePath,
        fileSize: version.fileSize,
        uploadedById: session.user.id,
        comment: `Restored from version ${versionNumber}`,
      },
    })

    // Update main document
    await prisma.document.update({
      where: { id: params.id },
      data: {
        version: newVersionNumber,
        filePath: version.filePath,
        fileSize: version.fileSize,
        updatedAt: new Date(),
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'DOCUMENT_RESTORED',
        description: `Restored ${document.name} to version ${versionNumber}`,
        entityType: 'DOCUMENT',
        entityId: params.id,
        metadata: {
          restoredFromVersion: versionNumber,
          newVersion: newVersionNumber,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Document restored to version ${versionNumber}`,
      newVersion: newVersionNumber,
    })
  } catch (error) {
    console.error('Restore document version error:', error)
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 })
  }
}
