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

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        matter: {
          select: { id: true, name: true, matterNumber: true }
        }
      }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Expense GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
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

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        matterId: body.matterId,
        date: body.date ? new Date(body.date) : undefined,
        description: body.description,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        category: body.category,
        vendor: body.vendor,
        billableStatus: body.billableStatus,
        receiptPath: body.receiptPath
      }
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Expense PUT error:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
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

    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expense DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
