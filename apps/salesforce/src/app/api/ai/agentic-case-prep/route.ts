import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Agentic Case Preparation — multi-step: research opponent, case law, draft brief, settle ranges.
async function llm(systemPrompt: string, userPrompt: string, maxTokens = 2500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    const e: any = new Error('OPENROUTER_API_KEY not configured')
    e.status = 503
    throw e
  }
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'GetFirmFlow AgenticCasePrep' },
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

    const { matterId, caseFacts, opponentName, jurisdiction, knownPrecedents = [] } = await request.json()
    if (!caseFacts) return NextResponse.json({ error: 'caseFacts required' }, { status: 400 })

    // Step 1 — opponent profile
    const profile = await llm(
      'You are an opposing-party research analyst. Build a brief profile of the opponent based on public-style information. Output JSON: { background, knownStrategies, litigationHistory, reputation }.',
      `Opponent: ${opponentName || 'unspecified'}\nJurisdiction: ${jurisdiction || 'unspecified'}\nCase facts: ${caseFacts.slice(0, 4000)}`,
      1200,
    )

    // Step 2 — case-law analysis
    const caselaw = await llm(
      'You are a legal researcher. From provided precedents, surface the 3 most relevant and apply them to current facts. Mark any inferred case law as "inferred — verify in Westlaw/LexisNexis". Output JSON.',
      `Precedents: ${JSON.stringify(knownPrecedents).slice(0, 4000)}\nCase facts: ${caseFacts.slice(0, 4000)}`,
      1500,
    )

    // Step 3 — motion brief draft
    const brief = await llm(
      'You are a senior litigator. Draft a motion brief with proper headings (Intro, Statement of Facts, Argument, Conclusion). Return markdown.',
      `Case facts: ${caseFacts.slice(0, 6000)}\nKey precedents from prior step: ${caselaw.slice(0, 2000)}`,
      2500,
    )

    // Step 4 — settlement range
    const settlement = await llm(
      'You are a settlement strategist. Propose low / mid / high settlement ranges (USD) with rationale. Output JSON.',
      `Case facts + opponent profile + caselaw analysis:\n${(profile + '\n' + caselaw).slice(0, 6000)}`,
      900,
    )

    return NextResponse.json({ matterId: matterId || null, opponentProfile: profile, caselawAnalysis: caselaw, briefDraft: brief, settlementRange: settlement })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'agentic-case-prep failed' }, { status: err?.status || 500 })
  }
}
