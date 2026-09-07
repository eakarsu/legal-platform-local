import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Bulk delete
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const result = await prisma.client.updateMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ count: result.count, message: `${result.count} clients archived` })
  } catch (error) {
    console.error('Bulk delete clients error:', error)
    return NextResponse.json({ error: 'Failed to archive clients' }, { status: 500 })
  }
}

// Bulk update
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids, data } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const allowedFields = ['status', 'type']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }

    const result = await prisma.client.updateMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
      data: updateData,
    })

    return NextResponse.json({ count: result.count, message: `${result.count} clients updated` })
  } catch (error) {
    console.error('Bulk update clients error:', error)
    return NextResponse.json({ error: 'Failed to update clients' }, { status: 500 })
  }
}
