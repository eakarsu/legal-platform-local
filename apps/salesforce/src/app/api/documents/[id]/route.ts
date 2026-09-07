import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { unlink, readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    })

    if (!document || document.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // If download requested, return the file
    if (download) {
      try {
        const filePath = path.join(process.cwd(), 'public', document.filePath)
        const fileBuffer = await readFile(filePath)

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': document.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${document.name}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        })
      } catch (fileError) {
        console.error('File read error:', fileError)
        return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
      }
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

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

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document || document.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        matterId: body.matterId && body.matterId !== 'none' ? body.matterId : null,
        clientId: body.clientId && body.clientId !== 'none' ? body.clientId : null,
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(
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
    })

    if (!document || document.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete file from disk
    try {
      const filePathStr = path.join(process.cwd(), 'public', document.filePath)
      await unlink(filePathStr)
    } catch (err) {
      console.error('Failed to delete file from disk:', err)
    }

    // Delete database record
    await prisma.document.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
