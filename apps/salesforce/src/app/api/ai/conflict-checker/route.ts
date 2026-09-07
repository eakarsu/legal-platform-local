import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkConflicts } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prospectiveClient, adverseParties, knownRepresentations } = body

    if (!prospectiveClient || !Array.isArray(adverseParties)) {
      return NextResponse.json(
        { error: 'prospectiveClient (object) and adverseParties (array) are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI conflict check is not available',
          code: 'AI_NOT_CONFIGURED',
          message: 'The OPENROUTER_API_KEY environment variable is not set.'
        },
        { status: 503 }
      )
    }

    const result = await checkConflicts({ prospectiveClient, adverseParties, knownRepresentations })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Conflict checker route error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to run conflict check' }, { status: 500 })
  }
}
