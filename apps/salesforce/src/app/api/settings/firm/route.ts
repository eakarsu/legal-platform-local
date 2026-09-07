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

    const firm = await prisma.firm.findUnique({
      where: { id: session.user.firmId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        website: true,
      },
    })

    return NextResponse.json(firm)
  } catch (error) {
    console.error('Settings firm API error:', error)
    return NextResponse.json({ error: 'Failed to fetch firm' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update firm settings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const firm = await prisma.firm.update({
      where: { id: session.user.firmId },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        website: body.website,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        website: true,
      },
    })

    return NextResponse.json(firm)
  } catch (error) {
    console.error('Update firm error:', error)
    return NextResponse.json({ error: 'Failed to update firm' }, { status: 500 })
  }
}
