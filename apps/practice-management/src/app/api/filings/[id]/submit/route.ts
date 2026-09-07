import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the filing
    const filing = await prisma.courtFiling.findUnique({
      where: { id },
      include: {
        matter: {
          select: {
            id: true,
            name: true,
            matterNumber: true
          }
        }
      }
    })

    if (!filing) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 })
    }

    // Check if filing is in a valid state to submit
    if (!['DRAFT', 'READY', 'REJECTED'].includes(filing.status)) {
      return NextResponse.json({
        error: `Cannot submit filing with status: ${filing.status}`
      }, { status: 400 })
    }

    // Generate a mock e-filing ID (in real app, this would come from court e-filing system)
    const eFilingId = `EF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Update filing status to SUBMITTED
    const updatedFiling = await prisma.courtFiling.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        eFilingId: eFilingId,
        eFilingStatus: 'PENDING_REVIEW',
        filingDate: new Date()
      }
    })

    // In a real application, you would:
    // 1. Connect to the court's e-filing system API
    // 2. Upload the document
    // 3. Submit the filing
    // 4. Store the confirmation/receipt

    return NextResponse.json({
      success: true,
      filing: updatedFiling,
      eFilingId: eFilingId,
      message: `Filing submitted successfully. E-Filing ID: ${eFilingId}`
    })
  } catch (error) {
    console.error('E-Filing submit error:', error)
    return NextResponse.json({ error: 'Failed to submit e-filing' }, { status: 500 })
  }
}
