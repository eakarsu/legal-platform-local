import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error-handler'

// POST /api/bulk - Bulk delete or update records
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, entity, ids, data } = await request.json()

    if (!action || !entity || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'action, entity, and ids array are required' },
        { status: 400 }
      )
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per bulk operation' },
        { status: 400 }
      )
    }

    const modelMap: Record<string, any> = {
      clients: prisma.client,
      matters: prisma.matter,
      tasks: prisma.task,
      documents: prisma.document,
      timeEntries: prisma.timeEntry,
      expenses: prisma.expense,
      invoices: prisma.invoice,
      messages: prisma.message,
      filings: prisma.courtFiling,
      deadlines: prisma.deadline,
      calendarEvents: prisma.calendarEvent,
      notifications: prisma.notification,
    }

    const model = modelMap[entity]
    if (!model) {
      return NextResponse.json(
        { error: `Unknown entity: ${entity}` },
        { status: 400 }
      )
    }

    let result: any

    if (action === 'delete') {
      result = await model.deleteMany({
        where: { id: { in: ids } }
      })
      return NextResponse.json({
        message: `Successfully deleted ${result.count} ${entity}`,
        count: result.count
      })
    }

    if (action === 'update') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { error: 'data object is required for update action' },
          { status: 400 }
        )
      }

      result = await model.updateMany({
        where: { id: { in: ids } },
        data
      })
      return NextResponse.json({
        message: `Successfully updated ${result.count} ${entity}`,
        count: result.count
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "delete" or "update".' }, { status: 400 })
  } catch (error) {
    return handleApiError(error)
  }
}
