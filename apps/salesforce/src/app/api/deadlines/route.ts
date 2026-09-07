import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { applyDeadlineRules } from '@/lib/deadline-rules'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    const where: any = {
      matter: { firmId: session.user.firmId },
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (priority && priority !== 'all') {
      where.priority = priority
    }

    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(deadlines)
  } catch (error) {
    console.error('Deadlines API error:', error)
    return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const deadline = await prisma.deadline.create({
      data: {
        firmId: session.user.firmId,
        matterId: body.matterId,
        title: body.title,
        description: body.description,
        type: body.type || 'FILING',
        priority: body.priority || 'MEDIUM',
        dueDate: new Date(body.dueDate),
        status: 'PENDING',
        // Rule-engine fields
        ...(body.triggerEvent && { triggerEvent: body.triggerEvent }),
        ...(body.triggerDate && { triggerDate: new Date(body.triggerDate) }),
        ...(body.daysFromTrigger != null && { daysFromTrigger: Number(body.daysFromTrigger) }),
        ...(body.businessDays != null && { businessDays: Boolean(body.businessDays) }),
        ...(body.assignedToId && { assignedToId: body.assignedToId }),
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
      },
    })

    // Run the deadline rule engine to auto-create CalendarEvents
    let ruleEngineResult = null
    if (body.triggerEvent && body.triggerDate) {
      try {
        ruleEngineResult = await applyDeadlineRules(deadline.id, session.user.id)
      } catch (ruleErr) {
        console.error('Deadline rule engine error:', ruleErr)
        // Non-fatal: deadline created successfully even if calendar events fail
      }
    }

    return NextResponse.json(
      {
        ...deadline,
        calendarEventsCreated: ruleEngineResult?.eventsCreated ?? 0,
        ruleEngineResult: ruleEngineResult
          ? {
              rulesApplied: ruleEngineResult.rulesApplied,
              eventsCreated: ruleEngineResult.eventsCreated,
              events: ruleEngineResult.events,
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create deadline error:', error)
    return NextResponse.json({ error: 'Failed to create deadline' }, { status: 500 })
  }
}
