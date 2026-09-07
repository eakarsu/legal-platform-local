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

    const users = await prisma.user.findMany({
      where: { firmId: session.user.firmId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hourlyRate: true,
        status: true,
      },
      orderBy: { lastName: 'asc' },
    })

    return NextResponse.json(users.map(u => ({ ...u, hourlyRate: Number(u.hourlyRate) })))
  } catch (error) {
    console.error('Settings users API error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
