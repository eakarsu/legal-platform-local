"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  FileText,
  Search,
  Clock,
  Mail,
  Scale,
  Users,
  Loader2,
  Sparkles,
  MessageSquare,
  BookOpen,
  Target,
  Lightbulb,
  Copyright,
  DollarSign,
  CalendarCheck,
  Globe,
  ClipboardList
} from 'lucide-react'

const sampleData: Record<string, { prompt?: string; documentType?: string; documentText?: string }> = {
  document_draft: {
    documentType: 'motion',
    prompt: 'Draft a Motion to Compel Discovery in the case of Smith v. Johnson Industries. The defendant has failed to respond to our first set of interrogatories served on January 15, 2026. We sent a meet-and-confer letter on February 1 with no response. Jurisdiction is the Southern District of New York.'
  },
  contract_review: {
    documentText: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of February 1, 2026, by and between TechCorp Inc., a Delaware corporation ("Provider"), and Acme Legal LLC, a New York limited liability company ("Client").

1. SERVICES. Provider shall deliver cloud-based document management services as described in Exhibit A.

2. TERM. This Agreement shall commence on the Effective Date and continue for a period of 36 months, automatically renewing for successive 12-month periods unless either party provides 90 days written notice.

3. FEES. Client shall pay Provider $5,000 per month, due within 30 days of invoice. Late payments accrue interest at 1.5% per month.

4. INDEMNIFICATION. Client shall indemnify, defend, and hold harmless Provider from any and all claims, damages, losses, and expenses arising from Client's use of the Services.

5. LIMITATION OF LIABILITY. In no event shall Provider's total liability exceed the fees paid in the prior 3-month period.

6. TERMINATION. Either party may terminate for cause upon 30 days written notice of material breach, provided the breaching party fails to cure within such period.

7. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Delaware.`,
    prompt: 'Focus on indemnification balance and liability caps'
  },
  legal_research: {
    prompt: 'What are the legal standards for establishing personal jurisdiction over an out-of-state defendant in a breach of contract case in New York? Include analysis of both general and specific jurisdiction under the long-arm statute (CPLR 302).'
  },
  deposition_summary: {
    documentText: `DEPOSITION OF JANE DOE
Case No. 2026-CV-1234
Date: January 20, 2026

Q: Please state your name for the record.
A: Jane Doe.

Q: What is your position at Johnson Industries?
A: I am the Director of Operations. I've held that position since March 2023.

Q: Were you involved in the contract negotiations with Smith Corp?
A: Yes, I was the primary negotiator on our side.

Q: When did negotiations begin?
A: Around June 2025, I believe. We had initial discussions at a trade conference.

Q: Did you make any representations about delivery timelines?
A: We discussed general timelines, but I always made clear these were estimates, not guarantees.

Q: Do you recall telling Mr. Smith that delivery would be completed by October 2025?
A: I may have said that was our target, but I don't recall guaranteeing it.

Q: I'm showing you Exhibit 4, an email from you dated July 15, 2025. Does this refresh your recollection?
A: [Reviews document] This email says we "will deliver by October 15." I suppose I did write that.

Q: So you did guarantee the delivery date?
A: The email says what it says, but the overall context of our discussions was that timelines were estimates.

Q: Were there any internal concerns about meeting the October deadline?
A: There were some discussions about resource constraints, yes.

Q: When did those concerns first arise?
A: Probably August 2025. Our engineering team flagged some potential delays.

Q: Did you communicate those concerns to Smith Corp?
A: I... I don't recall specifically whether we did at that time.`
  },
  conflict_check: {
    prompt: `New matter parties to check:

Plaintiff: Robert Martinez (individual)
Defendant: Greenfield Development Corp.
Related entities:
- Greenfield Holdings LLC (parent company)
- Maria Greenfield (CEO, individual)
- First National Bank (lender)
- Martinez Construction Co. (plaintiff's business)

Existing firm clients for reference:
- Greenfield Holdings LLC (represented in 2024 real estate matter)
- First National Bank (ongoing banking counsel)`
  },
  time_entry: {
    prompt: `Today's activities for the Smith v. Johnson case:

- Spent the morning reviewing the defendant's motion to dismiss and researching case law on personal jurisdiction, found 3 relevant cases
- Had a 45-minute call with client to discuss strategy and next steps
- Drafted a 12-page opposition brief to the motion to dismiss
- Exchanged emails with opposing counsel about scheduling the upcoming deposition
- Reviewed and organized 50 pages of discovery documents received yesterday
- Quick 15-minute call with co-counsel at partner firm to coordinate expert witness`
  },
  email_draft: {
    prompt: 'Draft a professional email to opposing counsel (Attorney Sarah Chen at Wilson & Associates) regarding the Smith v. Johnson case. We need to request a 2-week extension on the discovery deadline due to the volume of documents involved. The current deadline is March 1, 2026, and we are requesting an extension to March 15, 2026. Tone should be professional but firm, noting that we have been diligent in our review process.'
  },
  document_summary: {
    documentText: `COMMERCIAL LEASE AGREEMENT

This Lease Agreement is made as of January 1, 2026, between Skyline Properties LLC ("Landlord") and Baker & Associates Law Firm ("Tenant").

PREMISES: Suite 400, 123 Main Street, New York, NY 10001, comprising approximately 3,500 square feet of office space.

TERM: Five (5) years, commencing March 1, 2026 through February 28, 2031, with two (2) options to renew for additional five-year terms.

BASE RENT: Year 1: $8,750/month ($30/sq ft annually). Annual increases of 3%.

SECURITY DEPOSIT: $26,250 (three months' rent).

PERMITTED USE: Law office and related professional services only.

TENANT IMPROVEMENTS: Landlord shall provide a $50,000 tenant improvement allowance. Any costs exceeding this amount shall be Tenant's responsibility.

MAINTENANCE: Landlord responsible for structural repairs, HVAC, common areas. Tenant responsible for interior maintenance and janitorial services.

INSURANCE: Tenant shall maintain commercial general liability insurance of not less than $2,000,000 per occurrence.

ASSIGNMENT: Tenant may not assign or sublease without Landlord's prior written consent, which shall not be unreasonably withheld.

DEFAULT: Failure to pay rent within 10 days of due date constitutes default. Landlord may terminate with 30 days written notice if default is not cured.

EARLY TERMINATION: Tenant may terminate after Year 3 with 6 months' written notice and payment of early termination fee equal to 4 months' rent.`
  },
  case_outcome: {
    prompt: `Case: Martinez v. Greenfield Development Corp.
Type: Breach of Contract / Construction Defect
Jurisdiction: Superior Court of California, Los Angeles County

Facts:
- Plaintiff hired defendant to build a custom home for $1.2M
- Contract specified completion by June 2025
- Defendant missed deadline by 4 months, completing in October 2025
- Multiple construction defects discovered: foundation cracks, faulty plumbing, incorrect electrical wiring
- Plaintiff spent $185,000 on repairs from third-party contractor
- Defendant claims delays were due to supply chain issues and permit delays from the city
- Plaintiff sent formal demand letter; defendant offered $50,000 settlement
- Plaintiff has expert witness reports documenting all defects
- Defendant has some documentation of supply chain delays but no force majeure clause in contract`
  },
  patent_analysis: {
    documentText: `PATENT APPLICATION - PROVISIONAL

Title: AI-Powered Legal Document Analysis System Using Multi-Modal Neural Networks

Abstract: A system and method for analyzing legal documents using a multi-modal neural network architecture that processes text, images, and structured data simultaneously. The system employs a novel attention mechanism specifically designed for legal language understanding, incorporating jurisdiction-aware embeddings and precedent-linking capabilities.

Claims:
1. A computer-implemented method for analyzing legal documents comprising:
   a) Receiving a legal document in one or more formats
   b) Processing the document through a multi-modal neural network
   c) Generating a structured analysis including risk assessment, key terms extraction, and precedent matching
   d) Outputting recommendations based on jurisdiction-specific legal frameworks

2. The method of claim 1, wherein the neural network includes jurisdiction-aware embedding layers trained on case law from multiple jurisdictions.

3. A system for automated legal document review comprising a processing unit, memory, and the multi-modal neural network of claim 1.

Prior Art Considered:
- US Patent 10,832,456 - General NLP document analysis
- US Patent 11,234,567 - Legal text classification system
- Published Application 2024/0123456 - AI contract review tool`,
    prompt: 'Focus on novelty of the multi-modal approach and jurisdiction-aware embeddings'
  },
  trademark_check: {
    prompt: `Mark to analyze: "LEGALFLOW AI"

Proposed use: AI-powered legal practice management software and services

Description: We want to register "LEGALFLOW AI" as a trademark for our legal technology platform that provides AI-driven case management, document automation, billing optimization, and practice management tools for law firms and legal departments.

Current use:
- Domain registered: legalflow.ai
- Software in use since January 2026
- Marketing materials distributed at legal tech conferences
- Approximately 50 law firm subscribers

Known similar marks:
- "LegalFlow" (possibly registered for legal consulting)
- "FlowLaw" (seen in online advertising for legal services)
- "AI Legal" (common descriptive term)
- "LegalAI Pro" (competitor product name)`
  },
  billing_optimizer: {
    documentText: `BILLING SUMMARY - Q4 2025
Baker & Associates Law Firm

ATTORNEY BILLING DATA:

Partner - James Baker (Rate: $450/hr)
- Total hours billed: 380
- Realization rate: 88%
- Top matters: Corporate M&A (45%), Litigation (35%), Advisory (20%)
- Average entries per day: 4.2
- Block billing percentage: 35%

Senior Associate - Lisa Chen (Rate: $325/hr)
- Total hours billed: 520
- Realization rate: 92%
- Top matters: Litigation (60%), Corporate (25%), IP (15%)
- Average entries per day: 6.1
- Block billing percentage: 12%

Junior Associate - Mark Davis (Rate: $225/hr)
- Total hours billed: 440
- Realization rate: 78%
- Top matters: Research (40%), Document Review (35%), Litigation Support (25%)
- Average entries per day: 5.8
- Block billing percentage: 28%

Paralegal - Sarah Kim (Rate: $150/hr)
- Total hours billed: 490
- Realization rate: 95%
- Top matters: Document Management (50%), Filing (30%), Research (20%)

WRITE-OFFS THIS QUARTER: $32,500
ACCOUNTS RECEIVABLE >90 DAYS: $78,000
CLIENT BILLING GUIDELINE VIOLATIONS: 14 instances`,
    prompt: 'Focus on improving realization rates and reducing write-offs'
  },
  court_date_tracker: {
    documentText: `CASE: Smith v. Johnson Industries
Case No.: 2026-CV-1234
Court: U.S. District Court, Southern District of New York
Judge: Hon. Patricia Williams
Filed: January 5, 2026

KEY DATES AND EVENTS:

1. Complaint Filed: January 5, 2026
2. Summons Issued: January 6, 2026
3. Service Completed: January 20, 2026
4. Answer Due: February 10, 2026 (filed on time)
5. Rule 26(f) Conference: February 25, 2026 (completed)
6. Initial Pretrial Conference: March 15, 2026 (upcoming)
7. Discovery Opens: March 1, 2026
8. Written Discovery Due: May 15, 2026
9. Depositions Complete By: July 31, 2026
10. Expert Reports Due: August 30, 2026
11. Rebuttal Expert Reports: September 30, 2026
12. Discovery Closes: October 15, 2026
13. Dispositive Motions Due: November 15, 2026
14. Pretrial Conference: January 15, 2027
15. Trial Date: February 10, 2027

PENDING MOTIONS:
- Defendant's Motion to Dismiss (Count III) - Filed Feb 5, 2026
- Opposition due: February 26, 2026
- Reply due: March 5, 2026`,
    prompt: 'We are currently in early March 2026. Focus on immediate deadlines and preparation needs.'
  },
  immigration_form: {
    documentText: `CLIENT IMMIGRATION PROFILE:

Petitioner: John Smith (US Citizen)
- DOB: March 15, 1985
- Naturalized citizen since 2015
- Employed as Software Engineer, annual income: $145,000

Beneficiary: Maria Garcia (Mexican national)
- DOB: July 22, 1990
- Current status: B-2 visitor visa, entered US September 1, 2025
- B-2 status expires: March 1, 2026
- No prior immigration violations
- Bachelor's degree in Business Administration
- Married to petitioner on December 15, 2025 in New York

Relationship Details:
- Met in 2023 through mutual friends
- Long-distance relationship for 18 months
- Photos, travel records, and communication logs available
- Joint bank account opened January 2026
- Shared apartment lease since January 2026

Goals:
- Obtain permanent residence (green card) for Maria
- Obtain work authorization as soon as possible`,
    prompt: 'What forms need to be filed and can we do concurrent filing since her B-2 is about to expire?'
  },
  client_intake: {
    prompt: `NEW CLIENT INTAKE FORM SUBMISSION:

Date: February 10, 2026
Source: Website contact form

Personal Information:
- Name: David Thompson
- Phone: (555) 234-5678
- Email: david.thompson@email.com
- Address: 456 Oak Avenue, Brooklyn, NY 11201
- Preferred contact method: Email
- Best time to reach: Evenings after 6 PM

Legal Matter:
- Type: Employment Law - Wrongful Termination
- Description: I was fired from my position as Marketing Director at TechStart Inc. after 5 years of employment. I believe the termination was in retaliation for reporting safety violations to HR. I filed an internal complaint on January 5, 2026 about inadequate fire safety measures in our office building. Two weeks later, on January 19, I was called into a meeting and told my position was being "eliminated." However, I discovered they posted the same position online the following week.

- Opposing party: TechStart Inc., 789 Innovation Blvd, Manhattan, NY
- Has an attorney been consulted: No
- Urgency: High - need to file EEOC complaint before deadline
- Budget: Willing to discuss contingency arrangement

Documents Available:
- Employment contract
- Termination letter
- Internal safety complaint (email copy)
- Job posting screenshot
- Performance reviews (all "exceeds expectations")
- Witness: Colleague who also noticed the retaliation pattern`
  }
}

const aiFeatures = [
  {
    id: 'document_draft',
    name: 'Document Drafting',
    description: 'Generate legal documents from templates',
    icon: FileText
  },
  {
    id: 'contract_review',
    name: 'Contract Review',
    description: 'Analyze contracts for issues and risks',
    icon: Search
  },
  {
    id: 'legal_research',
    name: 'Legal Research',
    description: 'Research case law and legal precedents',
    icon: BookOpen
  },
  {
    id: 'deposition_summary',
    name: 'Deposition Summary',
    description: 'Summarize deposition transcripts',
    icon: MessageSquare
  },
  {
    id: 'conflict_check',
    name: 'Conflict Checker',
    description: 'Automated conflict of interest detection',
    icon: Users
  },
  {
    id: 'time_entry',
    name: 'Time Entry Assistant',
    description: 'Capture billable time from activities',
    icon: Clock
  },
  {
    id: 'email_draft',
    name: 'Email Drafter',
    description: 'Draft professional correspondence',
    icon: Mail
  },
  {
    id: 'document_summary',
    name: 'Document Summarizer',
    description: 'Summarize lengthy legal documents',
    icon: FileText
  },
  {
    id: 'case_outcome',
    name: 'Case Outcome Predictor',
    description: 'Predict likely case outcomes based on facts',
    icon: Target
  },
  {
    id: 'patent_analysis',
    name: 'Patent Analyzer',
    description: 'Analyze patent applications and prior art',
    icon: Lightbulb
  },
  {
    id: 'trademark_check',
    name: 'Trademark Checker',
    description: 'Check trademark availability and risks',
    icon: Copyright
  },
  {
    id: 'billing_optimizer',
    name: 'Billing Optimizer',
    description: 'Optimize billing practices and rates',
    icon: DollarSign
  },
  {
    id: 'court_date_tracker',
    name: 'Court Date Tracker',
    description: 'Track and manage court deadlines',
    icon: CalendarCheck
  },
  {
    id: 'immigration_form',
    name: 'Immigration Form Helper',
    description: 'Assist with immigration form preparation',
    icon: Globe
  },
  {
    id: 'client_intake',
    name: 'Client Intake Processor',
    description: 'Process and analyze client intake forms',
    icon: ClipboardList
  }
]

export default function AIAssistantPage() {
  const [selectedFeature, setSelectedFeature] = useState('document_draft')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [documentText, setDocumentText] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedFeature,
          prompt,
          documentType,
          documentText
        })
      })

      const data = await res.json()

      if (res.ok) {
        setResponse(data.response)
      } else {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setResponse('Failed to process request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    const sample = sampleData[selectedFeature]
    if (!sample) return
    if (sample.prompt) setPrompt(sample.prompt)
    if (sample.documentType) setDocumentType(sample.documentType)
    if (sample.documentText) setDocumentText(sample.documentText)
  }

  const currentFeature = aiFeatures.find(f => f.id === selectedFeature)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-500">Powered by advanced AI for legal workflows</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Feature Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Features</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {aiFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setSelectedFeature(feature.id)
                      setPrompt('')
                      setDocumentText('')
                      setDocumentType('')
                      setResponse('')
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedFeature === feature.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className={`w-5 h-5 ${
                        selectedFeature === feature.id ? 'text-gray-900' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          selectedFeature === feature.id ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {feature.name}
                        </p>
                        <p className="text-xs text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentFeature && <currentFeature.icon className="w-6 h-6 text-gray-900" />}
                <div>
                  <CardTitle>{currentFeature?.name}</CardTitle>
                  <CardDescription>{currentFeature?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFeature === 'document_draft' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motion">Motion</SelectItem>
                        <SelectItem value="brief">Legal Brief</SelectItem>
                        <SelectItem value="letter">Demand Letter</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="answer">Answer</SelectItem>
                        <SelectItem value="discovery">Discovery Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the document you need. Include relevant facts, parties involved, and key points to address..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {(selectedFeature === 'contract_review' || selectedFeature === 'document_summary' || selectedFeature === 'deposition_summary') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paste Document Text</Label>
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste the document text here for analysis..."
                      rows={10}
                    />
                  </div>
                  {selectedFeature === 'contract_review' && (
                    <div className="space-y-2">
                      <Label>Focus Areas (Optional)</Label>
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., liability clauses, termination terms, payment terms..."
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedFeature === 'legal_research' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Research Query</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your legal research question. Include jurisdiction, relevant facts, and specific legal issues..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'conflict_check' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Party Names</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter names of all parties to check for conflicts (one per line)..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'time_entry' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Activity Description</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your activities today. The AI will help format them into billable time entries..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'email_draft' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Purpose</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the email you need to write. Include recipient type, purpose, and key points..."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'case_outcome' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Case Details</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the case facts, parties, jurisdiction, and key legal issues for outcome prediction..."
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'patent_analysis' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patent Document</Label>
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste the patent application, claims, or description here..."
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Analysis Focus (Optional)</Label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., novelty assessment, prior art concerns, claim scope..."
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'trademark_check' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trademark Information</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter the trademark to check, proposed use, goods/services description, and any known similar marks..."
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'billing_optimizer' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Billing Data</Label>
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste billing summaries, time entries, rate information, or billing practices to analyze..."
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Focus Areas (Optional)</Label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., realization rates, write-offs, rate optimization..."
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'court_date_tracker' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Court Dates & Case Information</Label>
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste case schedule, court dates, filing deadlines, and hearing information..."
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Context (Optional)</Label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., current date context, specific deadline concerns..."
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'immigration_form' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Immigration Case Information</Label>
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste client immigration profile, visa status, family information, and immigration goals..."
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Specific Question (Optional)</Label>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., which forms to file, eligibility questions, timeline concerns..."
                    />
                  </div>
                </div>
              )}

              {selectedFeature === 'client_intake' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client Intake Information</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Paste client intake form data, consultation notes, or new client information to process..."
                      rows={8}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadSampleData}
                disabled={loading}
                className="flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Sample Data
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || (!prompt && !documentText)}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{response}</pre>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(response)}>
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline">Save as Document</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
