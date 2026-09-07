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

    const result = await prisma.contact.deleteMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
    })

    return NextResponse.json({ count: result.count, message: `${result.count} contacts deleted` })
  } catch (error) {
    console.error('Bulk delete contacts error:', error)
    return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 })
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

    const allowedFields = ['type']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }

    const result = await prisma.contact.updateMany({
      where: { id: { in: ids }, firmId: session.user.firmId },
      data: updateData,
    })

    return NextResponse.json({ count: result.count, message: `${result.count} contacts updated` })
  } catch (error) {
    console.error('Bulk update contacts error:', error)
    return NextResponse.json({ error: 'Failed to update contacts' }, { status: 500 })
  }
}
