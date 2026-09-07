import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { readFile } from 'fs/promises'
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
    const versionNumber = searchParams.get('version')

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        versions: versionNumber ? {
          where: { versionNumber: parseInt(versionNumber) },
        } : undefined,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get file path - use version if specified, otherwise use main document
    let filePath = document.filePath
    if (versionNumber && document.versions && document.versions.length > 0) {
      filePath = document.versions[0].filePath
    }

    try {
      const fileBuffer = await readFile(filePath)

      // Determine content type
      const ext = path.extname(document.name).toLowerCase()
      const contentTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
      }

      const contentType = contentTypes[ext] || document.mimeType || 'application/octet-stream'

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${document.name}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}
