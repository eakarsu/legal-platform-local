import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        matter: {
          select: { id: true, name: true, matterNumber: true }
        },
        client: {
          select: { id: true, firstName: true, lastName: true, companyName: true }
        },
        uploadedBy: {
          select: { id: true, name: true }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Document GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const document = await prisma.document.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        status: body.status
      }
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Document PUT error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get document to find file path
    const document = await prisma.document.findUnique({
      where: { id },
      select: { filePath: true }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from database
    await prisma.document.delete({
      where: { id }
    })

    // Try to delete file from disk
    if (document.filePath) {
      try {
        const fullPath = join(process.cwd(), document.filePath)
        await unlink(fullPath)
      } catch (fileError) {
        console.error('Failed to delete file:', fileError)
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
