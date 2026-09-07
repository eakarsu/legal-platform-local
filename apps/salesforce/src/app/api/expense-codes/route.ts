import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenseCodes = await prisma.expenseCode.findMany({
      where: { firmId: session.user.firmId },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(expenseCodes)
  } catch (error) {
    console.error('Expense codes API error:', error)
    return NextResponse.json({ error: 'Failed to fetch expense codes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const expenseCode = await prisma.expenseCode.create({
      data: {
        firmId: session.user.firmId,
        code: body.code,
        name: body.name,
        description: body.description || null,
      },
    })

    return NextResponse.json(expenseCode, { status: 201 })
  } catch (error) {
    console.error('Create expense code error:', error)
    return NextResponse.json({ error: 'Failed to create expense code' }, { status: 500 })
  }
}
