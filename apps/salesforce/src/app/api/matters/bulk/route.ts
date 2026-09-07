import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const result = await prisma.matter.updateMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ count: result.count, message: `${result.count} matters archived` })
  } catch (error) {
    console.error('Bulk delete matters error:', error)
    return NextResponse.json({ error: 'Failed to archive matters' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids, data } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const allowedFields = ['status']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }

    const result = await prisma.matter.updateMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
      data: updateData,
    })

    return NextResponse.json({ count: result.count, message: `${result.count} matters updated` })
  } catch (error) {
    console.error('Bulk update matters error:', error)
    return NextResponse.json({ error: 'Failed to update matters' }, { status: 500 })
  }
}
