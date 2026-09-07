import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'GetFirmFlow',
    },
  })
}

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

// Helper function to extract JSON from AI response
function extractJSON(content: string): string {
  let cleaned = content.trim()
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim()
  }
  if (!cleaned.startsWith('[') && !cleaned.startsWith('{')) {
    const jsonStart = cleaned.indexOf('[')
    const jsonEnd = cleaned.lastIndexOf(']')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
    }
  }
  return cleaned
}

// Generate AI-powered time entry suggestions
async function generateAISuggestions(startDate: string, endDate: string) {
  const systemPrompt = `You are a legal time tracking assistant. Generate realistic time entry suggestions for a law firm attorney based on typical daily activities.
You MUST respond in valid JSON format only. No other text.`

  const userPrompt = `Generate 5-7 realistic time entry suggestions for a law firm attorney for the date range ${startDate} to ${endDate}.

Include a mix of activities from different sources:
- calendar (meetings, court appearances, depositions)
- email (correspondence with clients, opposing counsel, court)
- phone (client calls, conference calls)
- video (video conferences, remote hearings)

Respond with a JSON array in this exact format:
[
  {
    "id": "unique-id-1",
    "source": "calendar|email|phone|video",
    "sourceIcon": "calendar|email|phone|video",
    "date": "ISO date string within the range",
    "hours": 0.5,
    "description": "Professional detailed description of the legal work performed",
    "matterName": "Client Name - Matter Type",
    "confidence": 75-98
  }
]

Make the descriptions detailed and professional, suitable for client billing. Include realistic matter names.
Respond ONLY with valid JSON array, no additional text.`

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || '[]'
    try {
      const cleanedContent = extractJSON(content)
      const parsed = JSON.parse(cleanedContent)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return getFallbackSuggestions()
    }
  } catch (error) {
    console.error('AI time capture error:', error)
    return getFallbackSuggestions()
  }
}

// Fallback suggestions if AI fails
function getFallbackSuggestions() {
  const now = new Date()
  return [
    {
      id: "demo-1",
      source: "calendar",
      sourceIcon: "calendar",
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 1.5,
      description: "Client meeting to discuss case strategy and review documents. Prepared summary of key issues and timeline.",
      matterName: "Anderson v. Smith - Contract Dispute",
      confidence: 95,
    },
    {
      id: "demo-2",
      source: "email",
      sourceIcon: "email",
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 0.5,
      description: "Email correspondence with opposing counsel regarding settlement proposal and discovery timeline.",
      matterName: "Anderson v. Smith - Contract Dispute",
      confidence: 85,
    },
    {
      id: "demo-3",
      source: "video",
      sourceIcon: "video",
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 2.0,
      description: "Video conference to review financing documents and discuss term sheet revisions with client.",
      matterName: "Tech Innovations Inc. - Series A Financing",
      confidence: 92,
    },
    {
      id: "demo-4",
      source: "phone",
      sourceIcon: "phone",
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 0.75,
      description: "Phone call with client regarding case status update and medical records review.",
      matterName: "Wilson v. Metro Transit - Personal Injury",
      confidence: 78,
    },
    {
      id: "demo-5",
      source: "calendar",
      sourceIcon: "calendar",
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      hours: 3.0,
      description: "Court appearance for motion hearing. Presented arguments on motion to dismiss and responded to opposing counsel's objections.",
      matterName: "Wilson v. Metro Transit - Personal Injury",
      confidence: 98,
    },
  ]
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { start, end } = body

    // Get calendar events in the date range
    const events = await prisma.calendarEvent.findMany({
      where: {
        firmId: session.user.firmId,
        startTime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        matter: { select: { id: true, name: true, matterNumber: true } },
      },
    })

    // Generate suggestions from calendar events
    let suggestions = events.map((event) => {
      const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60)

      return {
        id: `cal-${event.id}`,
        source: 'calendar',
        sourceIcon: 'calendar',
        date: event.startTime.toISOString(),
        hours: Math.round(duration * 10) / 10,
        description: `${event.title}${event.description ? ` - ${event.description}` : ''}`,
        matterId: event.matterId || undefined,
        matterName: event.matter?.name,
        confidence: event.matterId ? 90 : 60,
      }
    })

    // If no real events found, use AI to generate suggestions
    if (suggestions.length === 0) {
      suggestions = await generateAISuggestions(start, end)
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Time capture API error:', error)
    return NextResponse.json({ error: 'Failed to analyze activity' }, { status: 500 })
  }
}
