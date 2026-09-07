import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
      },
    })

    if (!contact || contact.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Get contact error:', error)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.contact.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const body = await request.json()

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        type: body.type,
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company || null,
        title: body.title || null,
        email: body.email || null,
        phone: body.phone || null,
        notes: body.notes || null,
        clientId: body.clientId || null,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, type: true } },
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.contact.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.firmId !== session.user.firmId) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    await prisma.contact.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
