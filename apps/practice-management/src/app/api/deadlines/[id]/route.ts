import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

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

    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: {
        matter: {
          select: { id: true, name: true, matterNumber: true }
        }
      }
    })

    if (!deadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    return NextResponse.json({ deadline })
  } catch (error) {
    console.error('Deadline GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch deadline' }, { status: 500 })
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

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.deadlineType !== undefined) updateData.deadlineType = body.deadlineType
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate)
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }
    if (body.reminderDays !== undefined) updateData.reminderDays = body.reminderDays

    const deadline = await prisma.deadline.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ deadline })
  } catch (error) {
    console.error('Deadline PUT error:', error)
    return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 })
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

    await prisma.deadline.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deadline DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete deadline' }, { status: 500 })
  }
}
