import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Deadline Management — AI flags critical dates (SoL, trial date); team notification.
async function llm(messages: Array<{ role: 'system' | 'user'; content: string }>, maxTokens = 1500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 })
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'SmallLawFirm Deadlines' },
    body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku', messages, max_tokens: maxTokens }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { matterId, calendarEvents = [], jurisdiction } = (await request.json()) as {
      matterId?: string
      calendarEvents?: Array<{ title: string; start: string; end?: string }>
      jurisdiction?: string
    }

    let deadlines: any[] = []
    if (matterId) {
      try {
        deadlines = await (prisma as any).deadline.findMany({
          where: { matterId },
          select: { id: true, name: true, dueDate: true, priority: true, status: true },
          take: 50,
        })
      } catch {
        // schema variance
      }
    }

    const sys = 'You are a legal deadlines monitor. From upcoming deadlines + calendar events, identify critical ones (statute of limitations, filing deadlines, trial date), compute days remaining, and recommend team actions / notifications. Output JSON: { critical: [{ id, name, dueDate, daysRemaining, severity, recommendedAction }], notifications: [...] }.'
    const userMsg = `Jurisdiction: ${jurisdiction || 'unspecified'}\nMatter: ${matterId || 'unspecified'}\nDeadlines: ${JSON.stringify(deadlines)}\nCalendarEvents: ${JSON.stringify(calendarEvents).slice(0, 3000)}`
    const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], 1500)
    return NextResponse.json({ raw, deadlinesEvaluated: deadlines.length })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return NextResponse.json({ error: e?.message || 'failed' }, { status: e?.status || 500 })
  }
}
