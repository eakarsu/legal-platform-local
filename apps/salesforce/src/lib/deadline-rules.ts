/**
 * Deadline Rule Engine
 * When a case milestone (triggerEvent + triggerDate) is set on a Deadline,
 * this engine finds matching DeadlineRules and auto-creates CalendarEvent records.
 */
import prisma from './prisma'

/** US federal holidays as MM-DD strings (add more as needed) */
const FEDERAL_HOLIDAYS = new Set([
  '01-01', // New Year's Day
  '01-15', // MLK (approx)
  '02-19', // Presidents' Day (approx)
  '05-27', // Memorial Day (approx)
  '06-19', // Juneteenth
  '07-04', // Independence Day
  '09-02', // Labor Day (approx)
  '11-11', // Veterans Day
  '11-28', // Thanksgiving (approx)
  '12-25', // Christmas
])

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isHoliday(date: Date): boolean {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return FEDERAL_HOLIDAYS.has(`${mm}-${dd}`)
}

/**
 * Add calendar days (or business days) to a date.
 */
export function addDaysToDate(
  start: Date,
  days: number,
  options: { businessDaysOnly?: boolean; excludeHolidays?: boolean } = {}
): Date {
  const { businessDaysOnly = false, excludeHolidays = false } = options
  let result = new Date(start)

  if (!businessDaysOnly) {
    result.setDate(result.getDate() + days)
    return result
  }

  // Business day counting
  let remaining = Math.abs(days)
  const direction = days >= 0 ? 1 : -1

  while (remaining > 0) {
    result.setDate(result.getDate() + direction)
    const skip = isWeekend(result) || (excludeHolidays && isHoliday(result))
    if (!skip) remaining--
  }

  return result
}

export interface RuleEngineResult {
  rulesApplied: number
  eventsCreated: number
  events: Array<{ id: string; title: string; startTime: Date }>
  errors: string[]
}

/**
 * Given a deadline with a triggerEvent + triggerDate, find all matching
 * DeadlineRule templates for the firm and auto-create CalendarEvent records.
 *
 * @param deadlineId  The newly created/updated Deadline id
 * @param actorUserId The user id to attach as the event owner
 */
export async function applyDeadlineRules(
  deadlineId: string,
  actorUserId: string
): Promise<RuleEngineResult> {
  const result: RuleEngineResult = {
    rulesApplied: 0,
    eventsCreated: 0,
    events: [],
    errors: [],
  }

  // Load the deadline with its matter
  const deadline = await prisma.deadline.findUnique({
    where: { id: deadlineId },
    include: {
      matter: {
        include: { practiceArea: true },
      },
    },
  })

  if (!deadline) {
    result.errors.push(`Deadline ${deadlineId} not found`)
    return result
  }

  if (!deadline.triggerEvent || !deadline.triggerDate) {
    // No trigger set — nothing to apply
    return result
  }

  // Find matching active DeadlineRules for this firm
  const rules = await prisma.deadlineRule.findMany({
    where: {
      firmId: deadline.firmId,
      isActive: true,
      triggerEvent: deadline.triggerEvent,
    },
  })

  if (rules.length === 0) return result

  for (const rule of rules) {
    result.rulesApplied++

    try {
      const dueDate = addDaysToDate(deadline.triggerDate, rule.daysToAdd, {
        businessDaysOnly: rule.businessDaysOnly,
        excludeHolidays: rule.excludeHolidays,
      })

      const title = `[Deadline] ${rule.name} — ${deadline.matter.title}`
      const description = [
        rule.description,
        `Triggered by: ${deadline.triggerEvent} on ${deadline.triggerDate.toLocaleDateString()}`,
        `Matter: ${deadline.matter.matterNumber} — ${deadline.matter.title}`,
        `Rule: +${rule.daysToAdd} ${rule.businessDaysOnly ? 'business ' : 'calendar '}days`,
      ]
        .filter(Boolean)
        .join('\n')

      // Avoid duplicates: check if a CalendarEvent for the same rule+deadline already exists
      const existing = await prisma.calendarEvent.findFirst({
        where: {
          matterId: deadline.matterId,
          firmId: deadline.firmId,
          title,
          startTime: dueDate,
        },
      })

      if (existing) {
        result.errors.push(`Skipped duplicate event for rule "${rule.name}"`)
        continue
      }

      const event = await prisma.calendarEvent.create({
        data: {
          firmId: deadline.firmId,
          matterId: deadline.matterId,
          userId: actorUserId,
          title,
          description,
          type: 'DEADLINE',
          startTime: dueDate,
          endTime: new Date(dueDate.getTime() + 30 * 60 * 1000), // 30-minute block
          allDay: false,
          reminderMinutes: [1440, 60], // 24h and 1h before
        },
      })

      result.eventsCreated++
      result.events.push({ id: event.id, title: event.title, startTime: event.startTime })
    } catch (err: any) {
      result.errors.push(`Rule "${rule.name}": ${err.message}`)
    }
  }

  return result
}
