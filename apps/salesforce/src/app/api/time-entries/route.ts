import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const matterId = searchParams.get('matterId') || ''
    const date = searchParams.get('date') || ''

    const where: any = {
      matter: { firmId: session.user.firmId },
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' }
    }

    if (matterId && matterId !== 'all') {
      where.matterId = matterId
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.date = { gte: startDate, lt: endDate }
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
        user: { select: { firstName: true, lastName: true } },
        activityCode: { select: { code: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Time entries API error:', error)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const hours = Math.min(Math.max(parseFloat(body.hours) || 0, 0), 24) // Cap at 24 hours
    const rate = Math.min(Number(user?.hourlyRate) || 0, 9999) // Cap rate at 9999
    const amount = Math.round(hours * rate * 100) / 100 // Round to 2 decimal places

    const entry = await prisma.timeEntry.create({
      data: {
        firmId: session.user.firmId,
        matterId: body.matterId,
        userId: session.user.id,
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

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Create time entry error:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}
