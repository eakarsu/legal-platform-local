import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Billing Intelligence — predict matter outcomes from history; optimize staffing; flag low-margin work.
async function llm(systemPrompt: string, userPrompt: string, maxTokens = 1800): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    const e: any = new Error('OPENROUTER_API_KEY not configured')
    e.status = 503
    throw e
  }
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'GetFirmFlow MatterOutcome' },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      max_tokens: maxTokens,
    }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { practiceArea, matterContext, historicalMatters = [], proposedStaffing } = await request.json()
    if (!practiceArea || !matterContext) {
      return NextResponse.json({ error: 'practiceArea and matterContext required' }, { status: 400 })
    }

    const sys = 'You are a law firm financial analyst. Predict matter outcome (likely resolution path, estimated total hours, expected realized revenue, gross margin band). Recommend optimal staffing mix and flag if matter is below firm margin floor. Output JSON: { outcomeProbability: { settlement, trial, dismissal }, estimatedHours, estimatedRevenueUSD, marginBand: "above|at|below floor", staffingRecommendation, flags }.'
    const user = `PracticeArea: ${practiceArea}\nMatter: ${typeof matterContext === 'string' ? matterContext.slice(0, 4000) : JSON.stringify(matterContext).slice(0, 4000)}\nHistory (${historicalMatters.length}): ${JSON.stringify(historicalMatters).slice(0, 4000)}\nProposed staffing: ${JSON.stringify(proposedStaffing || {})}`
    const raw = await llm(sys, user)
    return NextResponse.json({ raw, historicalSampleSize: historicalMatters.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'matter-outcome-predict failed' }, { status: err?.status || 500 })
  }
}
