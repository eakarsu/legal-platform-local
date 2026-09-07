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

    const activityCodes = await prisma.activityCode.findMany({
      where: { firmId: session.user.firmId },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json(activityCodes)
  } catch (error) {
    console.error('Activity codes API error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity codes' }, { status: 500 })
  }
}
