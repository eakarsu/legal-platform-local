import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List all assignments for a matter
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.matterAssignment.findMany({
      where: { matterId: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            hourlyRate: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

// POST - Add a team member to a matter
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
    const { userId, role, hourlyRate } = body

    // Check if matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: params.id },
    })

    if (!matter) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.matterAssignment.findFirst({
      where: {
        matterId: params.id,
        userId: userId,
      },
    })

    if (existingAssignment) {
      return NextResponse.json({ error: 'User already assigned to this matter' }, { status: 400 })
    }

    // Create assignment
    const assignment = await prisma.matterAssignment.create({
      data: {
        matterId: params.id,
        userId: userId,
        role: role || 'TEAM_MEMBER',
        hourlyRate: hourlyRate || user.hourlyRate,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            hourlyRate: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'TEAM_ASSIGNED',
        description: `Added ${user.firstName} ${user.lastName} to matter`,
        entityType: 'MATTER',
        entityId: params.id,
        metadata: {
          assignedUserId: userId,
          assignedUserName: `${user.firstName} ${user.lastName}`,
          role: role,
        },
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}

// DELETE - Remove a team member from a matter
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const assignment = await prisma.matterAssignment.findFirst({
      where: {
        matterId: params.id,
        userId: userId,
      },
      include: {
        user: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    await prisma.matterAssignment.delete({
      where: { id: assignment.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'TEAM_REMOVED',
        description: `Removed ${assignment.user.firstName} ${assignment.user.lastName} from matter`,
        entityType: 'MATTER',
        entityId: params.id,
        metadata: {
          removedUserId: userId,
          removedUserName: `${assignment.user.firstName} ${assignment.user.lastName}`,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete assignment error:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}
