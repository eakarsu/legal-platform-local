import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { performLegalResearch } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, jurisdiction, practiceArea, additionalContext } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Check if AI is configured before attempting
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI legal research is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set. Legal research requires an active AI connection. Please configure the API key or consult an external legal database such as Westlaw, LexisNexis, or Fastcase.'
        },
        { status: 503 }
      )
    }

    try {
      const results = await performLegalResearch({
        query,
        jurisdiction,
        practiceArea,
      })
      return NextResponse.json(results)
    } catch (aiError: any) {
      console.error('AI legal research failed:', aiError.message)
      // Return a structured error — no fake citations
      return NextResponse.json(
        {
          error: 'AI legal research service is temporarily unavailable',
          code: 'AI_SERVICE_ERROR',
          message: 'The AI legal research service encountered an error. Please try again or consult an external legal database such as Westlaw, LexisNexis, or Fastcase for authoritative case law.',
          details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Legal research API error:', error)
    return NextResponse.json({ error: 'Failed to perform research' }, { status: 500 })
  }
}
