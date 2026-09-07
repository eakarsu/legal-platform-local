import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  })
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, matterType, activityCode, hours, context } = body

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const prompt = `You are a legal billing expert helping to enhance time entry descriptions for law firm invoices. The descriptions should be:
1. Professional and suitable for client billing
2. Specific about the work performed
3. Clear about the value provided to the client
4. Compliant with legal billing guidelines

Original description: "${description}"
${matterType ? `Matter type: ${matterType}` : ''}
${activityCode ? `Activity code: ${activityCode}` : ''}
${hours ? `Time spent: ${hours} hours` : ''}
${context ? `Additional context: ${context}` : ''}

Please provide:
1. An enhanced version of this time entry description
2. A brief explanation of the improvements made

Keep the enhanced description concise but detailed enough to justify the time billed.`

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal billing expert. Provide enhanced time entry descriptions that are professional, specific, and justify the time billed. Return responses in JSON format with "enhanced" and "explanation" fields.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Try to parse as JSON, otherwise structure the response
    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      // If not valid JSON, structure it manually
      const lines = responseText.split('\n').filter(l => l.trim())
      result = {
        enhanced: lines[0]?.replace(/^(Enhanced:?\s*)/i, '').trim() || responseText,
        explanation: lines.slice(1).join(' ').trim() || 'Enhanced for billing clarity',
      }
    }

    return NextResponse.json({
      original: description,
      enhanced: result.enhanced,
      explanation: result.explanation,
      suggestions: [
        result.enhanced,
        // Provide alternative versions if needed
      ],
    })
  } catch (error) {
    console.error('Enhance description error:', error)

    // If OpenAI fails, provide a basic enhancement
    const { description } = await request.json().catch(() => ({ description: '' }))

    return NextResponse.json({
      original: description,
      enhanced: description,
      explanation: 'AI enhancement unavailable. Please check API configuration.',
      error: 'AI service temporarily unavailable',
    })
  }
}
