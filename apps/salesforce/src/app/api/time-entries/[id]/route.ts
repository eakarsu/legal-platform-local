import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        user: { select: { firstName: true, lastName: true } },
        activityCode: { select: { code: true, name: true } },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Get time entry error:', error)
    return NextResponse.json({ error: 'Failed to fetch time entry' }, { status: 500 })
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

    // Get user's hourly rate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hourlyRate: true },
    })

    const hours = parseFloat(body.hours)
    const rate = Number(user?.hourlyRate) || 0
    const amount = hours * rate

    const entry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: {
        matterId: body.matterId,
        date: new Date(body.date),
        hours,
        rate,
        amount,
        description: body.description,
        activityCodeId: body.activityCodeId || null,
        billable: body.billable ?? true,
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        user: { select: { firstName: true, lastName: true } },
        activityCode: { select: { code: true, name: true } },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Update time entry error:', error)
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 })
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

    await prisma.timeEntry.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete time entry error:', error)
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 })
  }
}
