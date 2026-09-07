import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update user settings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user || user.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        hourlyRate: body.hourlyRate ?? user.hourlyRate,
        role: body.role ?? user.role,
        status: body.status ?? user.status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hourlyRate: true,
        status: true,
      },
    })

    return NextResponse.json({ ...updated, hourlyRate: Number(updated.hourlyRate) })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
