// Apply pass 5 — multi-jurisdiction compliance monitor.
// ENV: OPENROUTER_API_KEY (returns 503 with code AI_NOT_CONFIGURED when missing).
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkMultiJurisdictionCompliance } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      matterDescription,
      primaryJurisdiction,
      additionalJurisdictions,
      practiceArea,
      clientLocations,
      servicesOffered,
    } = body

    if (!matterDescription || typeof matterDescription !== 'string') {
      return NextResponse.json(
        { error: 'matterDescription (string) is required' },
        { status: 400 }
      )
    }
    if (!primaryJurisdiction || typeof primaryJurisdiction !== 'string') {
      return NextResponse.json(
        { error: 'primaryJurisdiction (string) is required' },
        { status: 400 }
      )
    }
    if (!Array.isArray(additionalJurisdictions)) {
      return NextResponse.json(
        { error: 'additionalJurisdictions (array of strings) is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI multi-jurisdiction compliance is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set.'
        },
        { status: 503 }
      )
    }

    const result = await checkMultiJurisdictionCompliance({
      matterDescription,
      primaryJurisdiction,
      additionalJurisdictions,
      practiceArea,
      clientLocations,
      servicesOffered,
    })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Multi-jurisdiction compliance route error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to run multi-jurisdiction compliance check' }, { status: 500 })
  }
}
