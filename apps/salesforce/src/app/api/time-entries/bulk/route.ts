import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface BulkTimeEntry {
  matterId: string
  date: string
  hours: number
  description: string
  activityCodeId?: string
  billable?: boolean
  rate?: number
}

// POST - Bulk create time entries
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entries, action } = body as { entries: BulkTimeEntry[]; action: 'create' | 'update' | 'delete' }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'Entries array is required' }, { status: 400 })
    }

    if (entries.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 entries per request' }, { status: 400 })
    }

    // Get user's hourly rate for default
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hourlyRate: true },
    })

    const results: Array<{ index: number; success: boolean; id?: string; error?: string }> = []

    if (action === 'create' || !action) {
      // Bulk create
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        try {
          const hours = Math.min(Math.max(entry.hours || 0, 0), 24) // Cap at 24 hours
          const rate = Math.min(entry.rate || Number(user?.hourlyRate) || 0, 9999) // Cap rate
          const amount = Math.round(hours * rate * 100) / 100

          const created = await prisma.timeEntry.create({
            data: {
              firmId: session.user.firmId,
              userId: session.user.id,
              matterId: entry.matterId,
              date: new Date(entry.date),
              hours: hours,
              description: entry.description,
              activityCodeId: entry.activityCodeId || null,
              billable: entry.billable ?? true,
              rate: rate,
              amount: amount,
              status: 'DRAFT',
            },
          })

          results.push({ index: i, success: true, id: created.id })
        } catch (error) {
          results.push({ index: i, success: false, error: (error as Error).message })
        }
      }
    } else if (action === 'delete') {
      // Bulk delete - entries should have id field
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i] as unknown as { id: string }
        try {
          await prisma.timeEntry.delete({
            where: { id: entry.id },
          })
          results.push({ index: i, success: true, id: entry.id })
        } catch (error) {
          results.push({ index: i, success: false, error: (error as Error).message })
        }
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'BULK_TIME_ENTRY',
        description: `Bulk ${action || 'create'}: ${successCount} succeeded, ${failureCount} failed`,
        entityType: 'TIME_ENTRY',
        entityId: 'bulk',
        metadata: {
          action: action || 'create',
          totalEntries: entries.length,
          successCount,
          failureCount,
        },
      },
    })

    return NextResponse.json({
      success: failureCount === 0,
      totalProcessed: entries.length,
      successCount,
      failureCount,
      results,
    })
  } catch (error) {
    console.error('Bulk time entries error:', error)
    return NextResponse.json({ error: 'Failed to process bulk entries' }, { status: 500 })
  }
}

// PUT - Bulk update time entries
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, updates } = body as {
      ids: string[]
      updates: {
        status?: string
        billable?: boolean
        rate?: number
        activityCodeId?: string
      }
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Updates object is required' }, { status: 400 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (updates.status) updateData.status = updates.status
    if (updates.billable !== undefined) updateData.billable = updates.billable
    if (updates.activityCodeId) updateData.activityCodeId = updates.activityCodeId

    // If rate is updated, recalculate amounts
    if (updates.rate !== undefined) {
      updateData.rate = updates.rate
      // We'll need to update each entry individually to recalculate amount
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = []

    for (const id of ids) {
      try {
        if (updates.rate !== undefined) {
          // Get the entry to calculate new amount
          const entry = await prisma.timeEntry.findUnique({ where: { id } })
          if (entry) {
            await prisma.timeEntry.update({
              where: { id },
              data: {
                ...updateData,
                amount: Number(entry.hours) * updates.rate,
              },
            })
          }
        } else {
          await prisma.timeEntry.update({
            where: { id },
            data: updateData,
          })
        }
        results.push({ id, success: true })
      } catch (error) {
        results.push({ id, success: false, error: (error as Error).message })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Log activity
    await prisma.activity.create({
      data: {
        firmId: session.user.firmId,
        userId: session.user.id,
        type: 'BULK_TIME_ENTRY_UPDATE',
        description: `Bulk update: ${successCount} succeeded, ${failureCount} failed`,
        entityType: 'TIME_ENTRY',
        entityId: 'bulk',
        metadata: {
          updatedFields: Object.keys(updates),
          totalEntries: ids.length,
          successCount,
          failureCount,
        },
      },
    })

    return NextResponse.json({
      success: failureCount === 0,
      totalProcessed: ids.length,
      successCount,
      failureCount,
      results,
    })
  } catch (error) {
    console.error('Bulk update time entries error:', error)
    return NextResponse.json({ error: 'Failed to bulk update entries' }, { status: 500 })
  }
}
