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

    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        user: { select: { id: true, name: true, hourlyRate: true } }
      }
    })

    if (!timeEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    return NextResponse.json({ timeEntry })
  } catch (error) {
    console.error('Time entry GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch time entry' }, { status: 500 })
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

    if (body.matterId !== undefined) updateData.matterId = body.matterId
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.hours !== undefined) updateData.hours = parseFloat(body.hours)
    if (body.description !== undefined) updateData.description = body.description
    if (body.activityCode !== undefined) updateData.activityCode = body.activityCode
    if (body.billableStatus !== undefined) updateData.billableStatus = body.billableStatus
    if (body.rate !== undefined) updateData.rate = parseFloat(body.rate)

    // Recalculate amount if hours or rate changed
    if (body.hours !== undefined || body.rate !== undefined) {
      const existingEntry = await prisma.timeEntry.findUnique({ where: { id } })
      const hours = body.hours !== undefined ? parseFloat(body.hours) : Number(existingEntry?.hours) || 0
      const rate = body.rate !== undefined ? parseFloat(body.rate) : Number(existingEntry?.rate) || 0
      updateData.amount = hours * rate
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ timeEntry })
  } catch (error) {
    console.error('Time entry PUT error:', error)
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 })
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

    await prisma.timeEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Time entry DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 })
  }
}
