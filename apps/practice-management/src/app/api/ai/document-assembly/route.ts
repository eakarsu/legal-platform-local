import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Document Assembly Agent — auto-generate discovery requests, motions, pleadings from matter context.
async function llm(messages: Array<{ role: 'system' | 'user'; content: string }>, maxTokens = 2500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 })
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'SmallLawFirm DocAssembly' },
    body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku', messages, max_tokens: maxTokens }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || 'LLM error')
  return data.choices?.[0]?.message?.content || ''
}

type DocumentKind = 'discovery_request' | 'motion' | 'pleading' | 'engagement_letter' | 'demand_letter'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { matterId, kind, extraInstructions } = (await request.json()) as {
      matterId?: string
      kind?: DocumentKind
      extraInstructions?: string
    }
    if (!kind) return NextResponse.json({ error: 'kind required' }, { status: 400 })

    let matter: any = null
    if (matterId) {
      try {
        matter = await (prisma as any).matter.findUnique({
          where: { id: matterId },
          select: { id: true, title: true, practiceArea: true, status: true, client: { select: { name: true } } },
        })
      } catch {
        // schema drift
      }
    }

    const sys = `You are a paralegal document drafter. Generate a complete ${kind.replace(/_/g, ' ')} suitable for filing/sending. Use standard headings, numbered paragraphs where appropriate, and placeholders for missing data. Return markdown.`
    const userMsg = `Matter: ${JSON.stringify(matter || { matterId, hint: 'matter not found in DB; rely on inferred context' })}\nExtra instructions: ${extraInstructions || 'none'}`
    const raw = await llm([{ role: 'system', content: sys }, { role: 'user', content: userMsg }], 2500)
    return NextResponse.json({ kind, document: raw, matterId: matter?.id || matterId || null })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return NextResponse.json({ error: e?.message || 'failed' }, { status: e?.status || 500 })
  }
}
