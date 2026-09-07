import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface DeadlineRule {
  name: string
  description: string
  triggerEvent: string
  daysToAdd: number
  businessDaysOnly: boolean
  excludeHolidays: boolean
  courtType?: string
  jurisdiction?: string
}

// Common legal deadline rules
const DEADLINE_RULES: DeadlineRule[] = [
  {
    name: 'Answer to Complaint',
    description: 'Deadline to file answer to complaint',
    triggerEvent: 'COMPLAINT_SERVED',
    daysToAdd: 21,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
  {
    name: 'Motion Response',
    description: 'Deadline to respond to motion',
    triggerEvent: 'MOTION_FILED',
    daysToAdd: 14,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
  {
    name: 'Discovery Response',
    description: 'Deadline to respond to discovery requests',
    triggerEvent: 'DISCOVERY_SERVED',
    daysToAdd: 30,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
  {
    name: 'Deposition Notice',
    description: 'Minimum notice for deposition',
    triggerEvent: 'DEPOSITION_SCHEDULED',
    daysToAdd: 10,
    businessDaysOnly: true,
    excludeHolidays: true,
  },
  {
    name: 'Appeal Filing',
    description: 'Deadline to file notice of appeal',
    triggerEvent: 'JUDGMENT_ENTERED',
    daysToAdd: 30,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
  {
    name: 'Motion for Reconsideration',
    description: 'Deadline to file motion for reconsideration',
    triggerEvent: 'ORDER_ENTERED',
    daysToAdd: 10,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
  {
    name: 'Pre-Trial Brief',
    description: 'Deadline to file pre-trial brief',
    triggerEvent: 'TRIAL_DATE_SET',
    daysToAdd: -14,
    businessDaysOnly: true,
    excludeHolidays: true,
  },
  {
    name: 'Expert Disclosure',
    description: 'Deadline for expert witness disclosure',
    triggerEvent: 'DISCOVERY_CUTOFF',
    daysToAdd: -30,
    businessDaysOnly: false,
    excludeHolidays: false,
  },
]

// Federal holidays (simplified - would need to be more comprehensive in production)
const FEDERAL_HOLIDAYS_2024 = [
  '2024-01-01', // New Year's Day
  '2024-01-15', // MLK Day
  '2024-02-19', // Presidents Day
  '2024-05-27', // Memorial Day
  '2024-06-19', // Juneteenth
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-10-14', // Columbus Day
  '2024-11-11', // Veterans Day
  '2024-11-28', // Thanksgiving
  '2024-12-25', // Christmas
]

const FEDERAL_HOLIDAYS_2025 = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents Day
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
]

function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0]
  return [...FEDERAL_HOLIDAYS_2024, ...FEDERAL_HOLIDAYS_2025].includes(dateStr)
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function addDays(date: Date, days: number, businessDaysOnly: boolean, excludeHolidays: boolean): Date {
  const result = new Date(date)

  if (!businessDaysOnly && !excludeHolidays) {
    result.setDate(result.getDate() + days)
    return result
  }

  let daysToAdd = Math.abs(days)
  const direction = days >= 0 ? 1 : -1

  while (daysToAdd > 0) {
    result.setDate(result.getDate() + direction)

    const skipDay = (businessDaysOnly && isWeekend(result)) ||
                    (excludeHolidays && isHoliday(result))

    if (!skipDay) {
      daysToAdd--
    }
  }

  // If landing on a weekend/holiday, move to next valid day
  while ((businessDaysOnly && isWeekend(result)) || (excludeHolidays && isHoliday(result))) {
    result.setDate(result.getDate() + direction)
  }

  return result
}

// GET - List available deadline rules
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get custom rules for the firm
    const customRules = await prisma.deadlineRule.findMany({
      where: { firmId: session.user.firmId },
    })

    return NextResponse.json({
      standardRules: DEADLINE_RULES,
      customRules,
    })
  } catch (error) {
    console.error('Get deadline rules error:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

// POST - Calculate deadlines from trigger date
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      triggerDate,
      triggerEvent,
      matterId,
      jurisdiction,
      courtType,
      createDeadlines, // If true, create actual deadline records
      customRules, // Optional array of custom rule overrides
    } = body

    if (!triggerDate || !triggerEvent) {
      return NextResponse.json({
        error: 'Trigger date and event are required'
      }, { status: 400 })
    }

    const startDate = new Date(triggerDate)

    // Find applicable rules
    let applicableRules = DEADLINE_RULES.filter(rule =>
      rule.triggerEvent === triggerEvent &&
      (!rule.jurisdiction || rule.jurisdiction === jurisdiction) &&
      (!rule.courtType || rule.courtType === courtType)
    )

    // Add any custom rules
    if (customRules && Array.isArray(customRules)) {
      applicableRules = [...applicableRules, ...customRules]
    }

    // Calculate deadlines
    const calculatedDeadlines = applicableRules.map(rule => {
      const dueDate = addDays(startDate, rule.daysToAdd, rule.businessDaysOnly, rule.excludeHolidays)

      return {
        rule: rule.name,
        description: rule.description,
        triggerEvent: rule.triggerEvent,
        triggerDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        daysFromTrigger: rule.daysToAdd,
        businessDaysOnly: rule.businessDaysOnly,
        excludeHolidays: rule.excludeHolidays,
      }
    })

    // Sort by due date
    calculatedDeadlines.sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )

    // Create actual deadline records if requested
    let createdDeadlines = []
    if (createDeadlines && matterId) {
      const matter = await prisma.matter.findUnique({
        where: { id: matterId },
      })

      if (!matter) {
        return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
      }

      for (const deadline of calculatedDeadlines) {
        const created = await prisma.deadline.create({
          data: {
            firmId: session.user.firmId,
            matterId: matterId,
            title: deadline.rule,
            description: `${deadline.description}\n\nTriggered by: ${triggerEvent} on ${new Date(deadline.triggerDate).toLocaleDateString()}`,
            dueDate: new Date(deadline.dueDate),
            priority: 'HIGH',
            status: 'PENDING',
            category: 'COURT',
            createdById: session.user.id,
          },
        })
        createdDeadlines.push(created)
      }

      // Log activity
      await prisma.activity.create({
        data: {
          firmId: session.user.firmId,
          userId: session.user.id,
          type: 'DEADLINES_CALCULATED',
          description: `Calculated ${calculatedDeadlines.length} deadlines for ${matter.title}`,
          entityType: 'MATTER',
          entityId: matterId,
          metadata: {
            triggerEvent,
            triggerDate,
            deadlinesCreated: calculatedDeadlines.length,
          },
        },
      })
    }

    return NextResponse.json({
      triggerEvent,
      triggerDate: startDate.toISOString(),
      jurisdiction,
      courtType,
      deadlines: calculatedDeadlines,
      created: createDeadlines ? createdDeadlines : undefined,
    })
  } catch (error) {
    console.error('Calculate deadlines error:', error)
    return NextResponse.json({ error: 'Failed to calculate deadlines' }, { status: 500 })
  }
}
