import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeOpponent } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { opposingCounselName, opposingFirm, jurisdiction, practiceArea, matterType, knownCases, additionalContext } = body

    if (!opposingCounselName || typeof opposingCounselName !== 'string') {
      return NextResponse.json(
        { error: 'opposingCounselName (string) is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI opponent analysis is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set.'
        },
        { status: 503 }
      )
    }

    const result = await analyzeOpponent({
      opposingCounselName,
      opposingFirm,
      jurisdiction,
      practiceArea,
      matterType,
      knownCases,
      additionalContext,
    })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Opponent analysis route error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to analyze opposing counsel' }, { status: 500 })
  }
}
