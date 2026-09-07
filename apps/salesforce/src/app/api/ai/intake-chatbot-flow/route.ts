import { openRouterFetch } from '../../../../../../../packages/ai-client/index.cjs';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Intake Chatbot + Document Assembly — conversational client intake + auto-fill engagement letter + retainer.
async function llm(systemPrompt: string, userPrompt: string, maxTokens = 1500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    const e: any = new Error('OPENROUTER_API_KEY not configured')
    e.status = 503
    throw e
  }
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'GetFirmFlow Intake' },
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

interface IntakeTurn {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { transcript = [], practiceArea, generateDocsWhenReady = false } = (await request.json()) as {
      transcript?: IntakeTurn[]
      practiceArea?: string
      generateDocsWhenReady?: boolean
    }
    if (!transcript.length) return NextResponse.json({ error: 'transcript[] required' }, { status: 400 })

    // Step A: figure out next question or determine intake is complete.
    const intakeSys = `You are a friendly legal intake assistant for a ${practiceArea || 'general practice'} firm. From the conversation so far, decide either to ask one targeted next question OR return "intake_complete: true" with structured client + matter fields. Output JSON: { intake_complete: boolean, nextQuestion?: string, captured?: { clientName, clientEmail, conflictPartyNames, factsSummary, retainerComfortUSD, jurisdiction } }.`
    const intakeUser = `Transcript:\n${transcript.map((t) => `${t.role}: ${t.content}`).join('\n')}`
    const intakeRaw = await llm(intakeSys, intakeUser, 1500)

    let docs: { engagementLetter?: string; retainerAgreement?: string } | null = null
    if (generateDocsWhenReady) {
      // Best-effort: try to assemble docs from accumulated transcript even if intake_complete signal is ambiguous.
      const docsSys = 'You are a paralegal drafter. Produce two documents in markdown: (1) Engagement Letter, (2) Retainer Agreement. Use placeholders for any missing fields.'
      const docsUser = `Practice area: ${practiceArea || 'general'}\nIntake transcript: ${intakeUser.slice(0, 6000)}`
      const out = await llm(docsSys, docsUser, 2500)
      docs = { engagementLetter: out, retainerAgreement: out }
    }

    return NextResponse.json({ intakeDecision: intakeRaw, docs })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'intake-chatbot-flow failed' }, { status: err?.status || 500 })
  }
}
