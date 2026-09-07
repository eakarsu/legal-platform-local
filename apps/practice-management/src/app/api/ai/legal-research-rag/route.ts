import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// AI Legal Research & Briefing — query law DB; summarize relevant cases; apply to matter.
async function llm(messages: Array<{ role: 'system' | 'user'; content: string }>, maxTokens = 2000): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 })
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'SmallLawFirm Research' },
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

    const { question, jurisdiction, matterContext, lawPassages = [] } = (await request.json()) as {
      question?: string
      jurisdiction?: string
      matterContext?: string
      lawPassages?: Array<{ id?: string; citation?: string; text: string }>
    }
    if (!question) return NextResponse.json({ error: 'question required' }, { status: 400 })

    const sys = 'You are a legal research assistant. Answer ONLY from the provided lawPassages; cite each claim by passage id or citation. If passages do not cover the question, say so explicitly. Output JSON: { answer, citations: [{ id|citation, excerpt }], confidence: 0-1, openIssues: [...] }. Do not invent case law.'
    const ctx = (lawPassages || []).slice(0, 12).map((p, i) => `[${p.id || `p${i + 1}`}] ${(p.citation || '').slice(0, 200)}: ${(p.text || '').slice(0, 1500)}`).join('\n\n')
    const userMsg = `Jurisdiction: ${jurisdiction || 'unspecified'}\nMatter context: ${(matterContext || '').slice(0, 2000)}\nQuestion: ${question}\n\nPassages:\n${ctx}`
    const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], 2000)
    return NextResponse.json({ raw, sources: lawPassages.length })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return NextResponse.json({ error: e?.message || 'failed' }, { status: e?.status || 500 })
  }
}
