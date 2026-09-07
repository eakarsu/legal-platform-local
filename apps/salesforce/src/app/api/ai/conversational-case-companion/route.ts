import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Conversational Case Companion — multi-turn coach for attorneys working a matter.
async function llm(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, maxTokens = 1800): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    const e: any = new Error('OPENROUTER_API_KEY not configured')
    e.status = 503
    throw e
  }
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'GetFirmFlow Companion' },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
      messages,
      max_tokens: maxTokens,
    }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

interface Turn {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { matterContext, transcript = [], lastUserMessage } = (await request.json()) as {
      matterContext?: { matterId?: string; practiceArea?: string; clientName?: string; factsSummary?: string }
      transcript?: Turn[]
      lastUserMessage?: string
    }
    if (!lastUserMessage) return NextResponse.json({ error: 'lastUserMessage required' }, { status: 400 })

    const sys = `You are a senior partner mentor available to an attorney 24/7. Use the matter context to answer questions about strategy, next steps, deadlines, and client communication. If the question requires verified case law, instruct to verify in Westlaw / LexisNexis. Be concise.`
    const ctx = `Matter: ${JSON.stringify(matterContext || {})}`
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: `${sys}\n${ctx}` },
      ...transcript.slice(-10).map((t) => ({ role: t.role as 'user' | 'assistant', content: t.content })),
      { role: 'user', content: lastUserMessage },
    ]
    const reply = await llm(messages, 1200)
    return NextResponse.json({ reply, matterId: matterContext?.matterId || null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'companion failed' }, { status: err?.status || 500 })
  }
}
