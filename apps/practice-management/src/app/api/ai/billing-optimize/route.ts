import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Billing Optimization — suggest time entries based on calendar/email; flag non-billable.
async function llm(messages: Array<{ role: 'system' | 'user'; content: string }>, maxTokens = 1500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 })
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'SmallLawFirm Billing' },
    body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku', messages, max_tokens: maxTokens }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

interface ActivityItem {
  source: 'calendar' | 'email' | 'document' | 'chat'
  start?: string
  end?: string
  subject?: string
  body?: string
  matterIdHint?: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { activityItems = [], existingTimeEntries = [] } = (await request.json()) as {
      activityItems?: ActivityItem[]
      existingTimeEntries?: Array<{ matterId?: string; durationHours?: number; description?: string; date?: string }>
    }
    if (!activityItems.length) return NextResponse.json({ error: 'activityItems[] required' }, { status: 400 })

    const sys = 'You are a legal billing assistant. From the activity stream, propose time entries (matterId hint, durationHours, description in LEDES style, suggested activity code, isBillable: true|false). Avoid duplicates already present in existingTimeEntries. Output JSON: { suggestedEntries: [...], nonBillableFlags: [...], summary }.'
    const userMsg = `Activities: ${JSON.stringify(activityItems).slice(0, 6000)}\nExistingEntries: ${JSON.stringify(existingTimeEntries).slice(0, 3000)}`
    const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], 1800)
    return NextResponse.json({ raw, sourceItems: activityItems.length })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return NextResponse.json({ error: e?.message || 'failed' }, { status: e?.status || 500 })
  }
}
