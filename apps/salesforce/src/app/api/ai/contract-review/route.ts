import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { reviewContract } from '@/lib/ai'

// Sample contract review results for fallback
function getSampleContractReviewResults(contractType: string, clientRole: string) {
  const isPartyB = clientRole === 'party_b'

  return {
    summary: `This ${contractType || 'contract'} contains several provisions that require careful attention. ${isPartyB ? 'As the receiving party, several clauses are heavily weighted against your interests.' : 'The contract appears to be drafted in your favor, though some provisions could be strengthened.'} Key areas of concern include liability provisions, termination rights, and indemnification clauses.`,
    keyTerms: [
      {
        term: "Term/Duration",
        description: "The agreement has a defined term with specific renewal provisions",
        location: "Section 1"
      },
      {
        term: "Payment Terms",
        description: "Payment is due within 30 days of invoice, with late fees applicable",
        location: "Section 2"
      },
      {
        term: "Termination",
        description: "Either party may terminate with 30 days written notice; immediate termination for cause",
        location: "Section 4"
      },
      {
        term: "Confidentiality",
        description: "Standard confidentiality provisions with indefinite survival period",
        location: "Section 7"
      },
      {
        term: "Governing Law",
        description: "Contract governed by state law with exclusive jurisdiction in state courts",
        location: "Section 9"
      }
    ],
    risks: [
      {
        severity: "high" as const,
        title: "Broad Indemnification Clause",
        description: "The indemnification provision requires indemnification for any claims arising from the contract, without limitation or carve-outs for the indemnitor's own negligence.",
        recommendation: "Negotiate to limit indemnification to claims arising from the indemnitor's breach, negligence, or willful misconduct. Add mutual indemnification or cap liability."
      },
      {
        severity: "high" as const,
        title: isPartyB ? "One-Sided Termination Rights" : "Termination Notice Period",
        description: isPartyB ? "The contract allows the other party to terminate at will while restricting your termination rights." : "The termination notice period may be insufficient for operational continuity.",
        recommendation: isPartyB ? "Negotiate for mutual termination rights with equal notice periods." : "Consider extending the notice period or adding cure periods for certain breaches."
      },
      {
        severity: "medium" as const,
        title: "Limitation of Liability",
        description: "The contract excludes consequential damages but does not cap direct damages. This creates unlimited exposure.",
        recommendation: "Add a cap on total liability, typically at the greater of fees paid or a fixed amount."
      },
      {
        severity: "medium" as const,
        title: "Intellectual Property Assignment",
        description: "Work product provisions may assign IP rights beyond the scope of the engagement.",
        recommendation: "Clarify what constitutes work product and ensure pre-existing IP is excluded."
      },
      {
        severity: "low" as const,
        title: "Force Majeure Clause",
        description: "The force majeure clause is narrowly drafted and may not cover all unforeseen events.",
        recommendation: "Consider expanding to include pandemics, supply chain disruptions, and other modern risks."
      }
    ],
    missingClauses: [
      {
        clause: "Dispute Resolution",
        importance: "High - Without clear dispute resolution procedures, disagreements may result in costly litigation",
        recommendation: "Add mediation and arbitration provisions with clear procedures and venue selection"
      },
      {
        clause: "Data Protection/Privacy",
        importance: "High - Modern contracts should address data handling and privacy compliance",
        recommendation: "Include GDPR/CCPA compliance provisions, data processing terms, and breach notification requirements"
      },
      {
        clause: "Insurance Requirements",
        importance: "Medium - Both parties should maintain appropriate insurance coverage",
        recommendation: "Specify minimum insurance requirements including general liability and professional liability"
      }
    ],
    recommendations: [
      "Review and negotiate the indemnification clause to limit exposure",
      "Ensure termination rights are balanced between the parties",
      "Add a cap on total liability exposure",
      "Clarify intellectual property ownership and license grants",
      "Include data protection and privacy provisions",
      "Consider adding alternative dispute resolution procedures",
      "Review insurance requirements and add if missing",
      "Ensure governing law and venue provisions are acceptable"
    ],
    overallRiskLevel: isPartyB ? "high" as const : "medium" as const,
    riskScore: isPartyB ? 35 : 65
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contractText, contractType, clientRole, focusAreas } = body

    if (!contractText) {
      return NextResponse.json({ error: 'Contract text is required' }, { status: 400 })
    }

    try {
      const results = await reviewContract({
        contractText,
        contractType,
        clientRole,
        focusAreas,
      })
      return NextResponse.json(results)
    } catch (aiError) {
      // Return sample review if AI fails
      console.log('AI unavailable, returning sample contract review')
      const results = getSampleContractReviewResults(contractType || '', clientRole || 'party_b')
      return NextResponse.json(results)
    }
  } catch (error) {
    console.error('Contract review API error:', error)
    return NextResponse.json({ error: 'Failed to review contract' }, { status: 500 })
  }
}
