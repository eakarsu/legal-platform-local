import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'

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
      select: {
        fileName: true,
        fileType: true,
        filePath: true,
        name: true
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!document.filePath) {
      return NextResponse.json({ error: 'File path not found' }, { status: 404 })
    }

    // Handle both formats: /uploads/file.pdf and uploads/file.pdf
    const relativePath = document.filePath.startsWith('/')
      ? document.filePath.slice(1)
      : document.filePath
    const fullPath = join(process.cwd(), relativePath)

    // Check if file exists
    try {
      await access(fullPath, constants.R_OK)
    } catch {
      // File doesn't exist on disk - create a placeholder text file for demo
      const placeholderContent = `Document: ${document.name || document.fileName}\n\nThis is a placeholder file. The original file was not found on disk.\n\nFile details:\n- Original filename: ${document.fileName}\n- File type: ${document.fileType}\n- File path: ${document.filePath}`

      // Sanitize filename for HTTP header
      const safeBaseName = document.fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^\x00-\x7F]/g, '_')
        .replace(/[<>:"/\\|?*]/g, '_')

      return new NextResponse(placeholderContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${safeBaseName}_placeholder.txt"`,
        },
      })
    }

    // Read file from disk
    const fileBuffer = await readFile(fullPath)

    // Sanitize filename for HTTP header (remove/replace non-ASCII characters)
    const safeFileName = document.fileName
      .replace(/[^\x00-\x7F]/g, '_')  // Replace non-ASCII with underscore
      .replace(/[<>:"/\\|?*]/g, '_')   // Replace invalid filename chars

    // Return file as response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
      },
    })
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}
