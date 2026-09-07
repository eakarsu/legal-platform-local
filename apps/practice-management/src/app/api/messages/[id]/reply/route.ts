import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
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

    // Get the existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Format the reply with timestamp and sender info
    const timestamp = new Date().toLocaleString()
    const replyContent = `\n\n---\n**Reply from ${user.name}** (${timestamp}):\n${body.content}`

    // Append reply to existing content
    const updatedContent = existingMessage.content + replyContent

    // Update the message
    const message = await prisma.message.update({
      where: { id },
      data: {
        content: updatedContent,
        updatedAt: new Date()
      },
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
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Message reply error:', error)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}
