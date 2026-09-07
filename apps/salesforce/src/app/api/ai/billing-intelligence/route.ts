// Apply pass 5 — billing intelligence analyzer.
// ENV: OPENROUTER_API_KEY (returns 503 with code AI_NOT_CONFIGURED when missing).
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeBillingIntelligence } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI billing intelligence is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set.'
        },
        { status: 503 }
      )
    }

    const result = await analyzeBillingIntelligence(body || {})
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Billing intelligence route error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to analyze billing intelligence' }, { status: 500 })
  }
}
