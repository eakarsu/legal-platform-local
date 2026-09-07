import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Contract AI Assistant — drafting + obligations tracking + deadlines alerts.
async function llm(messages: Array<{ role: 'system' | 'user'; content: string }>, maxTokens = 2000): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 })
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'SmallLawFirm Contract AI' },
    body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku', messages, max_tokens: maxTokens }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

interface Obligation {
  party: string
  description: string
  dueDate?: string
  type: 'payment' | 'delivery' | 'notice' | 'reporting' | 'other'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { mode = 'draft', templateName, fields = {}, contractText } = (await request.json()) as {
      mode?: 'draft' | 'extract_obligations'
      templateName?: string
      fields?: Record<string, string>
      contractText?: string
    }

    if (mode === 'draft') {
      if (!templateName) return NextResponse.json({ error: 'templateName required for draft mode' }, { status: 400 })
      const sys = 'You are a senior transactional attorney. Draft a complete contract per the template name. Use standard structure (Recitals, Definitions, Terms, Reps & Warranties, Termination, Governing Law, Signatures). Use placeholders for missing fields. Return markdown.'
      const userMsg = `Template: ${templateName}\nFields: ${JSON.stringify(fields)}`
      const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], 2500)
      return NextResponse.json({ mode, draft: raw })
    }

    if (mode === 'extract_obligations') {
      if (!contractText) return NextResponse.json({ error: 'contractText required for extract mode' }, { status: 400 })
      const sys = 'You are a contract obligations extractor. Identify all obligations with party, description, due date (ISO if inferable), and type. Output JSON: { obligations: [{ party, description, dueDate, type }], openItems: [...] }.'
      const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: contractText.slice(0, 12000) }], 2000)
      return NextResponse.json({ mode, raw })
    }

    return NextResponse.json({ error: 'mode must be draft or extract_obligations' }, { status: 400 })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return NextResponse.json({ error: e?.message || 'failed' }, { status: e?.status || 500 })
  }
}
