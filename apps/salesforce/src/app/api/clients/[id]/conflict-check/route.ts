import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface ConflictResult {
  hasConflict: boolean
  conflicts: Array<{
    type: 'client' | 'matter' | 'contact'
    id: string
    name: string
    relationship: string
    matchedOn: string
  }>
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { checkAgainst } = body // 'all', 'clients', 'matters', 'contacts'

    // Get the client being checked
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        contacts: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const conflicts: ConflictResult['conflicts'] = []

    // Check against other clients
    if (checkAgainst === 'all' || checkAgainst === 'clients') {
      const otherClients = await prisma.client.findMany({
        where: {
          firmId: session.user.firmId,
          id: { not: params.id },
          OR: [
            { displayName: { contains: client.displayName, mode: 'insensitive' } },
            { email: client.email ? { equals: client.email, mode: 'insensitive' } : undefined },
            { taxId: client.taxId ? { equals: client.taxId } : undefined },
          ],
        },
      })

      for (const otherClient of otherClients) {
        let matchedOn = ''
        if (otherClient.displayName.toLowerCase().includes(client.displayName.toLowerCase())) {
          matchedOn = 'Name'
        } else if (client.email && otherClient.email?.toLowerCase() === client.email.toLowerCase()) {
          matchedOn = 'Email'
        } else if (client.taxId && otherClient.taxId === client.taxId) {
          matchedOn = 'Tax ID'
        }

        conflicts.push({
          type: 'client',
          id: otherClient.id,
          name: otherClient.displayName,
          relationship: 'Existing Client',
          matchedOn,
        })
      }
    }

    // Check against matters (opposing parties, etc.)
    if (checkAgainst === 'all' || checkAgainst === 'matters') {
      const matters = await prisma.matter.findMany({
        where: {
          firmId: session.user.firmId,
          clientId: { not: params.id },
          OR: [
            { opposingParty: { contains: client.displayName, mode: 'insensitive' } },
            { opposingCounsel: { contains: client.displayName, mode: 'insensitive' } },
          ],
        },
        include: {
          client: true,
        },
      })

      for (const matter of matters) {
        let matchedOn = ''
        if (matter.opposingParty?.toLowerCase().includes(client.displayName.toLowerCase())) {
          matchedOn = 'Opposing Party'
        } else if (matter.opposingCounsel?.toLowerCase().includes(client.displayName.toLowerCase())) {
          matchedOn = 'Opposing Counsel'
        }

        conflicts.push({
          type: 'matter',
          id: matter.id,
          name: `${matter.title} (${matter.client.displayName})`,
          relationship: matchedOn,
          matchedOn,
        })
      }
    }

    // Check against contacts
    if (checkAgainst === 'all' || checkAgainst === 'contacts') {
      const contacts = await prisma.contact.findMany({
        where: {
          firmId: session.user.firmId,
          clientId: { not: params.id },
          OR: [
            { firstName: { contains: client.displayName.split(' ')[0], mode: 'insensitive' } },
            { lastName: { contains: client.displayName.split(' ').slice(-1)[0], mode: 'insensitive' } },
            { email: client.email ? { equals: client.email, mode: 'insensitive' } : undefined },
          ],
        },
        include: {
          client: true,
        },
      })

      for (const contact of contacts) {
        const fullName = `${contact.firstName} ${contact.lastName}`
        let matchedOn = ''
        if (fullName.toLowerCase().includes(client.displayName.toLowerCase()) ||
            client.displayName.toLowerCase().includes(fullName.toLowerCase())) {
          matchedOn = 'Name'
        } else if (client.email && contact.email?.toLowerCase() === client.email.toLowerCase()) {
          matchedOn = 'Email'
        }

        conflicts.push({
          type: 'contact',
          id: contact.id,
          name: `${fullName} (Contact for ${contact.client?.displayName || 'Unknown'})`,
          relationship: contact.role || 'Contact',
          matchedOn,
        })
      }
    }

    // Log the conflict check
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'CONFLICT_CHECK',
        description: `Ran conflict check for ${client.displayName}`,
        entityType: 'CLIENT',
        entityId: client.id,
        metadata: {
          clientName: client.displayName,
          conflictsFound: conflicts.length,
        },
      },
    })

    const result: ConflictResult = {
      hasConflict: conflicts.length > 0,
      conflicts,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Conflict check error:', error)
    return NextResponse.json({ error: 'Failed to run conflict check' }, { status: 500 })
  }
}
