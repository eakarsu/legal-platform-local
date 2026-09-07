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

    const filing = await prisma.courtFiling.findUnique({
      where: { id },
      include: {
        matter: {
          select: {
            id: true,
            name: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true
              }
            }
          }
        }
      }
    })

    if (!filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    return NextResponse.json({ filing })
  } catch (error) {
    console.error('Filing GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch filing' }, { status: 500 })
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

    const filing = await prisma.courtFiling.update({
      where: { id },
      data: {
        documentName: body.documentName,
        documentType: body.documentType,
        filingType: body.filingType,
        courtName: body.courtName,
        caseNumber: body.caseNumber,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        filingDate: body.filingDate ? new Date(body.filingDate) : null,
        status: body.status,
        filingFee: body.filingFee ? parseFloat(body.filingFee) : null,
        feePaid: body.feePaid,
        serviceRequired: body.serviceRequired,
        serviceStatus: body.serviceStatus
      }
    })

    return NextResponse.json({ filing })
  } catch (error) {
    console.error('Filing PUT error:', error)
    return NextResponse.json({ error: 'Failed to update filing' }, { status: 500 })
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

    await prisma.courtFiling.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Filing DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete filing' }, { status: 500 })
  }
}
