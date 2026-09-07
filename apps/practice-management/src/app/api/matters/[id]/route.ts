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

    const matter = await prisma.matter.findUnique({
      where: { id },
      include: {
        client: true,
        leadAttorney: { select: { id: true, name: true, email: true } },
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } }
        },
        tasks: { orderBy: { createdAt: 'desc' } },
        calendarEvents: { orderBy: { startTime: 'asc' } },
        deadlines: { orderBy: { dueDate: 'asc' } },
        courtFilings: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } }
      }
    })

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    return NextResponse.json({ matter })
  } catch (error) {
    console.error('Matter GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch matter' }, { status: 500 })
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

    const matter = await prisma.matter.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        clientId: body.clientId,
        leadAttorneyId: body.leadAttorneyId,
        caseType: body.caseType,
        status: body.status,
        priority: body.priority,
        courtName: body.courtName,
        caseNumber: body.caseNumber,
        judge: body.judge,
        courtroom: body.courtroom,
        statuteOfLimitations: body.statuteOfLimitations ? new Date(body.statuteOfLimitations) : null,
        closeDate: body.closeDate ? new Date(body.closeDate) : null,
        billingMethod: body.billingMethod,
        flatFeeAmount: body.flatFeeAmount ? parseFloat(body.flatFeeAmount) : null,
        contingencyPercent: body.contingencyPercent ? parseFloat(body.contingencyPercent) : null,
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : null
      }
    })

    return NextResponse.json({ matter })
  } catch (error) {
    console.error('Matter PUT error:', error)
    return NextResponse.json({ error: 'Failed to update matter' }, { status: 500 })
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

    await prisma.matter.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Matter DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete matter' }, { status: 500 })
  }
}
