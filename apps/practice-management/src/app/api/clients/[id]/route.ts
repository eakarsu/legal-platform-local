import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        matters: {
          include: {
            leadAttorney: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        contacts: true,
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        messages: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const client = await prisma.client.update({
      where: { id },
      data: {
        type: body.type,
        status: body.status,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        companyName: body.companyName,
        email: body.email,
        phone: body.phone,
        mobile: body.mobile,
        fax: body.fax,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        billingRate: body.billingRate ? parseFloat(body.billingRate) : null,
        billingMethod: body.billingMethod,
        portalEnabled: body.portalEnabled
      }
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client PUT error:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.client.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
