import { openRouterFetch } from '../../../../../../packages/ai-client/index.cjs';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const systemPrompts: Record<string, string> = {
  document_draft: `You are an expert legal document drafter. Generate professional legal documents based on the user's requirements. Include proper legal formatting, citations where appropriate, and ensure the document follows standard legal conventions.`,
  contract_review: `You are an expert contract review attorney. Analyze the provided contract and identify:
1. Key terms and obligations
2. Potential risks or issues
3. Missing or unclear provisions
4. Recommendations for changes
Format your response clearly with sections for each finding.`,
  legal_research: `You are an expert legal researcher. Provide comprehensive research on the legal question asked. Include:
1. Relevant legal principles
2. Key case law references
3. Statutory provisions
4. Practical implications
Note: This is for reference only and should be verified with proper legal research tools.`,
  deposition_summary: `You are an expert at summarizing legal depositions. Analyze the transcript and provide:
1. Key admissions or statements
2. Important timeline events
3. Contradictions or inconsistencies
4. Notable quotes
5. Summary of witness credibility indicators`,
  conflict_check: `You are an expert at conflict of interest analysis. Review the provided party names and identify any potential conflicts. Consider:
1. Direct adverse relationships
2. Business relationships
3. Personal relationships
4. Former representations
Note: This is a preliminary check and should be verified against the firm's conflict database.`,
  time_entry: `You are an expert at converting activity descriptions into billable time entries. For each activity, provide:
1. Task description (professional and specific)
2. Suggested time (in hours)
3. LEDES activity code if applicable
Format as structured entries that can be imported into a billing system.`,
  email_draft: `You are an expert legal professional drafting professional correspondence. Write clear, professional emails that are:
1. Appropriately formal
2. Clear and concise
3. Legally appropriate
4. Action-oriented when needed`,
  document_summary: `You are an expert at summarizing legal documents. Provide a comprehensive summary including:
1. Document type and purpose
2. Key parties and their obligations
3. Important dates and deadlines
4. Critical clauses or provisions
5. Overall assessment`,
  case_outcome: `You are an expert legal analyst specializing in case outcome prediction. Based on the provided case details, analyze:
1. Strength of legal arguments for each side
2. Relevant precedent and how courts have ruled in similar cases
3. Key factors that could influence the outcome
4. Probability assessment (favorable, neutral, unfavorable)
5. Recommended strategy adjustments
Note: This is a predictive analysis tool and not a guarantee of outcome.`,
  patent_analysis: `You are an expert patent attorney and analyst. Review the provided patent document or description and analyze:
1. Novelty assessment - how unique is the invention
2. Prior art concerns
3. Claim scope and strength
4. Potential infringement issues
5. Patentability opinion
6. Recommendations for strengthening the patent application`,
  trademark_check: `You are an expert trademark attorney. Analyze the provided trademark information and assess:
1. Distinctiveness of the mark (generic, descriptive, suggestive, arbitrary, fanciful)
2. Likelihood of confusion with existing marks
3. Potential opposition or cancellation risks
4. Registration class recommendations
5. Geographic scope considerations
6. Recommendations for strengthening the trademark position`,
  billing_optimizer: `You are an expert legal billing consultant. Review the provided billing data or practices and provide:
1. Analysis of billing efficiency and patterns
2. Identification of under-billed or over-billed items
3. Recommendations for rate optimization
4. LEDES code compliance review
5. Client-specific billing guideline adherence
6. Revenue optimization strategies`,
  court_date_tracker: `You are an expert legal calendar and deadline management specialist. Analyze the provided court dates and case information to:
1. Identify all critical deadlines and their dependencies
2. Calculate response and filing deadlines based on court rules
3. Flag potential scheduling conflicts
4. Recommend preparation timelines for each event
5. Identify any missed or approaching statute of limitations`,
  immigration_form: `You are an expert immigration attorney and form preparation specialist. Based on the provided information, assist with:
1. Identifying the correct form(s) to file
2. Eligibility assessment for the requested benefit
3. Required supporting documentation checklist
4. Common pitfalls and errors to avoid
5. Timeline expectations for processing
6. Step-by-step form completion guidance`,
  client_intake: `You are an expert at processing client intake information for law firms. Analyze the provided intake data and:
1. Summarize key client information and legal needs
2. Identify the area of law and potential case type
3. Flag any conflicts of interest concerns
4. Assess case viability and potential value
5. Recommend next steps and required documentation
6. Generate a preliminary case assessment`
}

async function callOpenRouter(systemPrompt: string, userMessage: string): Promise<{ content: string; tokensUsed?: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

  const response = await openRouterFetch({
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'LegalFlow AI Platform'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 10000
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('OpenRouter API error:', errorData)
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  let content = data.choices?.[0]?.message?.content || 'No response generated.'
  // Strip markdown code block wrappers (```...```) from AI responses
  content = content.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim()
  const tokensUsed = data.usage?.total_tokens

  return { content, tokensUsed }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, prompt, documentType, documentText } = body

    const systemPrompt = systemPrompts[type] || systemPrompts.document_draft

    let userMessage = ''

    switch (type) {
      case 'document_draft':
        userMessage = `Document Type: ${documentType}\n\nInstructions: ${prompt}`
        break
      case 'contract_review':
      case 'document_summary':
      case 'deposition_summary':
        userMessage = `Document to analyze:\n\n${documentText}\n\n${prompt ? `Additional focus areas: ${prompt}` : ''}`
        break
      case 'patent_analysis':
        userMessage = `Patent document/description to analyze:\n\n${documentText}\n\n${prompt ? `Specific focus: ${prompt}` : ''}`
        break
      case 'billing_optimizer':
        userMessage = `Billing data to optimize:\n\n${documentText}\n\n${prompt ? `Focus areas: ${prompt}` : ''}`
        break
      case 'court_date_tracker':
        userMessage = `Court dates and case information:\n\n${documentText}\n\n${prompt ? `Additional context: ${prompt}` : ''}`
        break
      case 'immigration_form':
        userMessage = `Immigration case information:\n\n${documentText}\n\n${prompt ? `Specific question: ${prompt}` : ''}`
        break
      default:
        userMessage = prompt
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      // Return a mock response for demo purposes
      const mockResponse = getMockResponse(type, userMessage)

      // Save AI request to database
      await prisma.aIRequest.create({
        data: {
          userId: user.id,
          type: type.toUpperCase().replace('_', '_') as any,
          prompt: userMessage,
          response: mockResponse,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      return NextResponse.json({ response: mockResponse })
    }

    const { content: response, tokensUsed } = await callOpenRouter(systemPrompt, userMessage)

    // Save AI request to database
    await prisma.aIRequest.create({
      data: {
        userId: user.id,
        type: type.toUpperCase().replace('_', '_') as any,
        prompt: userMessage,
        response,
        status: 'COMPLETED',
        tokensUsed,
        completedAt: new Date()
      }
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI POST error:', error)
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 })
  }
}

function getMockResponse(type: string, prompt: string): string {
  const responses: Record<string, string> = {
    document_draft: `[DEMO MODE - OpenRouter API key not configured]

MOTION FOR SUMMARY JUDGMENT

I. INTRODUCTION

This motion is submitted on behalf of the Plaintiff in the above-captioned matter. Based on the undisputed material facts and applicable law, Plaintiff respectfully requests that this Court grant summary judgment in their favor.

II. STATEMENT OF FACTS

[The facts would be generated based on your specific input]

III. LEGAL ARGUMENT

A. Standard of Review
Summary judgment is appropriate when there is no genuine dispute as to any material fact and the moving party is entitled to judgment as a matter of law.

B. Application
[Legal arguments would be tailored to your case]

IV. CONCLUSION

For the foregoing reasons, Plaintiff respectfully requests that this Court grant summary judgment in their favor.

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    contract_review: `[DEMO MODE - OpenRouter API key not configured]

CONTRACT REVIEW ANALYSIS

DOCUMENT OVERVIEW:
- Type: Service Agreement
- Parties Identified: [Based on document]

KEY FINDINGS:

1. FAVORABLE TERMS:
   - Payment terms appear standard
   - Liability limitations present

2. AREAS OF CONCERN:
   - Indemnification clause may be overly broad
   - Termination provisions need clarification
   - Dispute resolution clause missing venue specification

3. MISSING PROVISIONS:
   - Force majeure clause
   - Data protection provisions
   - Confidentiality terms

RECOMMENDATIONS:
1. Negotiate indemnification scope
2. Add specific termination procedures
3. Include data protection clause

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    legal_research: `[DEMO MODE - OpenRouter API key not configured]

LEGAL RESEARCH MEMORANDUM

QUESTION PRESENTED:
[Your research question]

BRIEF ANSWER:
Based on preliminary research, the following legal principles apply...

RELEVANT AUTHORITY:

1. Statutory Framework:
   - Applicable statutes would be listed here

2. Case Law:
   - Leading cases would be analyzed

3. Secondary Sources:
   - Treatises and law reviews

ANALYSIS:
[Detailed legal analysis]

CONCLUSION:
[Summary of findings]

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    time_entry: `[DEMO MODE - OpenRouter API key not configured]

SUGGESTED TIME ENTRIES:

1. Review and analysis of client documents
   Time: 1.5 hours
   Activity Code: A101

2. Legal research on applicable issues
   Time: 2.0 hours
   Activity Code: A102

3. Draft correspondence to opposing counsel
   Time: 0.5 hours
   Activity Code: A105

4. Client telephone conference
   Time: 0.3 hours
   Activity Code: A106

TOTAL: 4.3 hours

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    email_draft: `[DEMO MODE - OpenRouter API key not configured]

Subject: [Your Subject Here]

Dear [Recipient],

I am writing on behalf of [Client Name] regarding [Matter].

[Body of email would be generated based on your input]

Please do not hesitate to contact me if you have any questions or require additional information.

Best regards,

[Your Name]
[Title]
[Firm Name]
[Contact Information]

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    case_outcome: `[DEMO MODE - OpenRouter API key not configured]

CASE OUTCOME PREDICTION ANALYSIS

CASE OVERVIEW:
Based on the provided case details, this analysis evaluates likely outcomes.

STRENGTH ASSESSMENT:

1. PLAINTIFF'S POSITION: Moderate-Strong
   - Clear documentary evidence of agreement terms
   - Demonstrable damages with financial records
   - Favorable jurisdiction precedent

2. DEFENDANT'S POSITION: Moderate
   - Potential affirmative defenses available
   - Some ambiguity in contract language
   - Statute of limitations concerns for plaintiff

KEY FACTORS:
- Witness credibility will be critical
- Documentary evidence strongly favors plaintiff
- Judge's prior rulings suggest moderate approach

PROBABILITY ASSESSMENT:
- Favorable outcome for plaintiff: 65-70%
- Settlement likelihood: 75%
- Estimated range: $150,000 - $300,000

STRATEGIC RECOMMENDATIONS:
1. Pursue early mediation to leverage strong position
2. Strengthen witness preparation
3. Consider partial summary judgment on liability

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    patent_analysis: `[DEMO MODE - OpenRouter API key not configured]

PATENT ANALYSIS REPORT

INVENTION OVERVIEW:
Analysis of the provided patent application/description.

NOVELTY ASSESSMENT:
- The core invention appears to have moderate novelty
- Key differentiator: [specific technical feature]
- No directly overlapping prior art identified in preliminary search

PRIOR ART CONCERNS:
1. US Patent 10,XXX,XXX - Related but distinguishable (different mechanism)
2. US Patent 9,XXX,XXX - Overlapping in scope but different application
3. Published application 2024/XXXXXXX - Potential concern for claim 3

CLAIM ANALYSIS:
- Independent Claim 1: Strong - well-defined scope
- Dependent Claims 2-5: Moderate - could be strengthened
- Independent Claim 6: Needs narrowing to avoid prior art

PATENTABILITY OPINION:
Overall patentability likelihood: Moderate-High (70%)

RECOMMENDATIONS:
1. Narrow Claim 6 to distinguish from prior art
2. Add dependent claims covering specific embodiments
3. Consider filing continuation for broader protection
4. International filing recommended within 12-month priority window

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    trademark_check: `[DEMO MODE - OpenRouter API key not configured]

TRADEMARK ANALYSIS REPORT

MARK ASSESSMENT:

1. DISTINCTIVENESS CLASSIFICATION:
   - Mark type: Suggestive
   - Distinctiveness level: Moderate-Strong
   - Inherent registrability: Likely registrable

2. LIKELIHOOD OF CONFUSION ANALYSIS:
   - Similar marks found: 3
   - Direct conflicts: 0
   - Potential conflicts: 1 (different class of goods)

3. SEARCH RESULTS:
   - USPTO database: No identical marks in same class
   - State registrations: Clear
   - Common law usage: Minor similar usage found in unrelated industry

4. REGISTRATION RECOMMENDATIONS:
   - Primary class: Class 45 (Legal Services)
   - Consider additional classes: 42, 35
   - Filing basis: Use in commerce (Section 1(a))

5. RISK ASSESSMENT:
   - Opposition risk: Low (15%)
   - Cancellation risk: Very Low (5%)
   - Infringement exposure: Low

RECOMMENDATIONS:
1. Proceed with filing in primary class
2. Consider intent-to-use filing for additional classes
3. Monitor similar marks for potential conflicts
4. Register domain name variations

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    billing_optimizer: `[DEMO MODE - OpenRouter API key not configured]

BILLING OPTIMIZATION REPORT

ANALYSIS SUMMARY:

1. BILLING EFFICIENCY:
   - Current utilization rate: 72%
   - Industry benchmark: 85%
   - Potential revenue increase: $45,000/quarter

2. IDENTIFIED ISSUES:
   - 15% of time entries lack sufficient detail
   - Block billing detected in 23% of entries
   - Inconsistent LEDES coding across attorneys

3. UNDER-BILLED ITEMS:
   - Travel time consistently under-reported
   - Document review time under-captured by ~20%
   - Administrative tasks billable but not recorded

4. RATE OPTIMIZATION:
   - Senior associate rates below market by 8%
   - Paralegal rates could increase 5-10%
   - Consider value-based billing for routine matters

5. COMPLIANCE CONCERNS:
   - 3 entries exceed client billing guidelines
   - 7 entries missing required task codes
   - 2 matters approaching budget caps

RECOMMENDATIONS:
1. Implement daily time entry requirement
2. Update rate schedule to match market rates
3. Provide LEDES coding training for all timekeepers
4. Set up automated budget alerts at 75% and 90%
5. Review and update client billing guidelines quarterly

PROJECTED IMPACT: +18% revenue with recommended changes

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    court_date_tracker: `[DEMO MODE - OpenRouter API key not configured]

COURT DATE & DEADLINE ANALYSIS

UPCOMING DEADLINES (by priority):

CRITICAL (within 7 days):
1. Motion Response Due - March 5, 2026
   - Rule: FRCP 12(b) - 21 days from service
   - Status: 3 days remaining
   - Preparation needed: Opposition brief + supporting declarations

2. Discovery Responses Due - March 7, 2026
   - Rule: FRCP 33 - 30 days from service
   - Status: 5 days remaining
   - Preparation needed: Review and finalize interrogatory answers

IMPORTANT (within 30 days):
3. Pretrial Conference - March 20, 2026
   - Judge: Hon. Smith, Courtroom 4B
   - Preparation: Joint pretrial statement due 5 days before
   - Joint statement deadline: March 15, 2026

4. Expert Report Deadline - March 28, 2026
   - Rule: FRCP 26(a)(2)(D)
   - Status: Expert retained, report in progress

UPCOMING (30-90 days):
5. Mediation Session - April 15, 2026
   - Location: ADR Center, Suite 300
   - Mediation brief due: April 8, 2026

SCHEDULING CONFLICTS:
- March 20: Pretrial conference conflicts with deposition in Case #2026-CV-5678
  Recommendation: Request continuance on deposition

STATUTE OF LIMITATIONS ALERTS:
- None approaching within 90 days

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    immigration_form: `[DEMO MODE - OpenRouter API key not configured]

IMMIGRATION FORM ANALYSIS

RECOMMENDED FORMS:

1. PRIMARY FORM: I-130 (Petition for Alien Relative)
   - Filing fee: $535
   - Processing time: 12-24 months
   - Priority date implications: Immediate relative category

2. CONCURRENT FILING: I-485 (Adjustment of Status)
   - Filing fee: $1,140 + $85 biometrics
   - Eligibility: Available if priority date is current
   - Benefits: Work authorization and travel document included

REQUIRED SUPPORTING DOCUMENTS:
□ Petitioner's proof of US citizenship/residency
□ Marriage certificate (if spouse petition)
□ Birth certificates for both parties
□ Passport copies
□ 2 passport-style photos each
□ Financial evidence (I-864 Affidavit of Support)
□ Tax returns (3 most recent years)
□ Employment verification letter

COMMON PITFALLS TO AVOID:
1. Incomplete forms leading to RFE (Request for Evidence)
2. Insufficient financial sponsorship documentation
3. Missing translations of foreign language documents
4. Inconsistent dates across applications
5. Filing without current immigration status documentation

ELIGIBILITY ASSESSMENT:
Based on the provided information, the case appears to meet basic eligibility requirements.

TIMELINE EXPECTATIONS:
- Form preparation: 2-3 weeks
- USCIS receipt: 2-4 weeks after filing
- Biometrics appointment: 4-8 weeks after receipt
- Interview (if required): 8-14 months after filing
- Decision: 12-24 months total

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`,

    client_intake: `[DEMO MODE - OpenRouter API key not configured]

CLIENT INTAKE PROCESSING SUMMARY

CLIENT INFORMATION:
- Type: Individual/Corporate (based on intake data)
- Contact verified: Yes
- Conflict check: Preliminary - No conflicts identified

LEGAL MATTER ASSESSMENT:

1. AREA OF LAW: [Identified from intake]
2. CASE TYPE: [Categorized based on description]
3. URGENCY: Medium-High

CASE VIABILITY:
- Merit assessment: Appears viable based on initial facts
- Statute of limitations: Within filing period
- Potential case value: Moderate

KEY ISSUES IDENTIFIED:
1. Primary legal issue clearly defined
2. Supporting documentation partially available
3. Witness information needs development
4. Opposing party identified

RECOMMENDED NEXT STEPS:
1. Schedule initial consultation (within 5 business days)
2. Request additional documentation:
   □ Relevant contracts or agreements
   □ Correspondence with opposing party
   □ Financial records related to damages
   □ Photos or physical evidence
3. Run full conflict check against firm database
4. Assign to appropriate practice group
5. Send engagement letter and fee agreement

INTAKE NOTES:
- Client was referred by [source]
- Preferred communication: Email
- Budget considerations discussed
- Retainer amount recommended: $5,000

---
Note: This is a demonstration. Configure your OPENROUTER_API_KEY in .env for full AI capabilities.`
  }

  return responses[type] || `[DEMO MODE] AI response for ${type} request.\n\nConfigure your OPENROUTER_API_KEY in .env for full AI capabilities.`
}
