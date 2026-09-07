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

    const practiceAreas = await prisma.practiceArea.findMany({
      where: { firmId: session.user.firmId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(practiceAreas)
  } catch (error) {
    console.error('Practice areas API error:', error)
    return NextResponse.json({ error: 'Failed to fetch practice areas' }, { status: 500 })
  }
}
