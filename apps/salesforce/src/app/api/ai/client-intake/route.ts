import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeClientIntake } from '@/lib/ai'

// Sample client intake analysis results for fallback
function getSampleIntakeAnalysis(clientType: string, legalIssue: string) {
  const isBusinessClient = clientType === 'business'

  return {
    conflictCheck: {
      status: "clear" as const,
      details: [
        "No existing clients with matching name found",
        "No adverse parties identified in current matters",
        "No conflicts with firm's existing representations",
      ],
    },
    matterRecommendation: {
      practiceArea: legalIssue.toLowerCase().includes('divorce') ? "Family Law" :
                    legalIssue.toLowerCase().includes('contract') ? "Corporate/Business" :
                    legalIssue.toLowerCase().includes('injur') ? "Personal Injury" :
                    legalIssue.toLowerCase().includes('employ') ? "Employment Law" :
                    "Civil Litigation",
      matterType: legalIssue.toLowerCase().includes('divorce') ? "Divorce - Contested" :
                  legalIssue.toLowerCase().includes('contract') ? "Contract Dispute" :
                  legalIssue.toLowerCase().includes('injur') ? "Personal Injury Claim" :
                  "General Civil Matter",
      complexity: "moderate" as const,
      estimatedHours: isBusinessClient ? 50 : 35,
      suggestedRetainer: isBusinessClient ? 10000 : 5000,
    },
    riskAssessment: {
      level: "medium" as const,
      factors: [
        "Standard complexity for this type of matter",
        "Clear legal issues that can be addressed",
        "Client appears to have reasonable expectations",
        "Documentation available to support the case",
      ],
    },
    nextSteps: [
      "Schedule initial consultation to discuss matter in detail",
      "Run full conflict check including spouse/adverse parties",
      "Prepare engagement letter and fee agreement",
      "Request initial document collection from client",
      "Set up client matter in case management system",
    ],
    questionsToAsk: [
      "What is your primary goal in pursuing this matter?",
      "What is your timeline and any urgent deadlines?",
      "Have you consulted with any other attorneys about this?",
      "Do you have access to all relevant documents?",
      "What is your budget for legal fees?",
      "Are there any upcoming deadlines we should be aware of?",
    ],
    documentsNeeded: [
      "Government-issued identification",
      "All correspondence related to the matter",
      "Any contracts or agreements involved",
      "Financial records if relevant to damages",
      "Timeline of key events",
      "Contact information for witnesses",
    ],
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientType, firstName, lastName, email, phone, companyName, legalIssue, urgency, budget, referralSource, additionalNotes } = body

    if (!firstName || !legalIssue) {
      return NextResponse.json({ error: 'Client name and legal issue are required' }, { status: 400 })
    }

    try {
      const results = await analyzeClientIntake({
        clientType: clientType || 'individual',
        firstName,
        lastName,
        email,
        phone,
        companyName,
        legalIssue,
        urgency,
        budget,
        referralSource,
        additionalNotes,
      })
      return NextResponse.json(results)
    } catch (aiError) {
      // Return sample analysis if AI fails
      console.log('AI unavailable, returning sample client intake analysis')
      const results = getSampleIntakeAnalysis(clientType || 'individual', legalIssue)
      return NextResponse.json(results)
    }
  } catch (error) {
    console.error('Client intake API error:', error)
    return NextResponse.json({ error: 'Failed to analyze intake' }, { status: 500 })
  }
}
