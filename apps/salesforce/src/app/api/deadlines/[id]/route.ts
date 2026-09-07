import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    const existing = await prisma.deadline.findUnique({
      where: { id: params.id },
      include: { matter: true },
    })

    if (!existing || existing.matter.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    const deadline = await prisma.deadline.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        type: body.type ?? existing.type,
        priority: body.priority ?? existing.priority,
        status: body.status ?? existing.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
      },
    })

    return NextResponse.json(deadline)
  } catch (error) {
    console.error('Update deadline error:', error)
    return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 })
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

    const existing = await prisma.deadline.findUnique({
      where: { id: params.id },
      include: { matter: true },
    })

    if (!existing || existing.matter.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    await prisma.deadline.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete deadline error:', error)
    return NextResponse.json({ error: 'Failed to delete deadline' }, { status: 500 })
  }
}
