import { openRouterFetch } from '../../../../../../packages/ai-client/index.cjs';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Public Markdown Website Generator — build firm website from CRM data (partners, practice areas, testimonials).
async function llm(systemPrompt: string, userPrompt: string, maxTokens = 2500): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    const e: any = new Error('OPENROUTER_API_KEY not configured')
    e.status = 503
    throw e
  }
  const r = await openRouterFetch({
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'GetFirmFlow Website' },
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

    const { firmName, tagline, brandTone = 'modern', includePages = ['home', 'practice-areas', 'team', 'contact'] } = await request.json()
    if (!firmName) return NextResponse.json({ error: 'firmName required' }, { status: 400 })

    let practiceAreas: any[] = []
    let users: any[] = []
    try {
      practiceAreas = await (prisma as any).practiceArea.findMany({ take: 12, select: { name: true, slug: true, description: true } })
    } catch {}
    try {
      users = await (prisma as any).user.findMany({ take: 12, select: { name: true, email: true, role: true } })
    } catch {}

    const sys = `You are a firm-marketing website generator. Produce one markdown document per requested page. Brand tone: ${brandTone}. Include CTAs and schema-friendly headings. Output JSON: { pages: [{ slug, markdown }], navigation: [...], suggestedSeo }.`
    const user = `Firm: ${firmName}\nTagline: ${tagline || ''}\nPracticeAreas: ${JSON.stringify(practiceAreas)}\nTeam: ${JSON.stringify(users)}\nPages to generate: ${includePages.join(',')}`
    const raw = await llm(sys, user)
    return NextResponse.json({ raw, dataPulledFromDb: { practiceAreas: practiceAreas.length, team: users.length } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'firm-website-gen failed' }, { status: err?.status || 500 })
  }
}
