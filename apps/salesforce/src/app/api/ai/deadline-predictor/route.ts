import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { predictDeadlines } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { matterType, jurisdiction, filingDate, caseDetails } = body

    if (!matterType) {
      return NextResponse.json({ error: 'matterType is required' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI deadline prediction is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set.'
        },
        { status: 503 }
      )
    }

    const result = await predictDeadlines({ matterType, jurisdiction, filingDate, caseDetails })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Deadline predictor route error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to predict deadlines' }, { status: 500 })
  }
}
