"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  FileText,
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Database,
  XCircle,
  Info,
  Download,
} from "lucide-react"

interface ReviewResult {
  summary: string
  keyTerms: Array<{
    term: string
    description: string
    location: string
  }>
  risks: Array<{
    severity: "low" | "medium" | "high" | "critical"
    title: string
    description: string
    recommendation: string
  }>
  missingClauses: Array<{
    clause: string
    importance: string
    recommendation: string
  }>
  recommendations: string[]
  overallRiskLevel: "low" | "medium" | "high"
  riskScore: number
}

const sampleContracts = {
  employment: {
    contractType: "employment",
    clientRole: "party_b",
    focusAreas: "termination, non-compete, compensation, intellectual property",
    contractText: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of January 1, 2024 by and between TechCorp Industries, Inc., a Delaware corporation ("Employer"), and John Smith ("Employee").

1. POSITION AND DUTIES
Employee is hired as Senior Software Engineer. Employee agrees to devote full business time and efforts to the performance of duties.

2. COMPENSATION
Base Salary: $150,000 annually, paid bi-weekly.
Bonus: Discretionary annual bonus up to 20% of base salary.

3. BENEFITS
Employee eligible for standard company benefits including health insurance, 401(k) with 4% match, and 15 days PTO.

4. TERMINATION
Either party may terminate at-will with 30 days written notice.
Employer may terminate immediately for cause, including but not limited to misconduct, breach of confidentiality, or poor performance.

5. NON-COMPETE
For 2 years after termination, Employee shall not work for any competitor within 100-mile radius.
Employee shall not solicit any clients or employees for 3 years after termination.

6. INTELLECTUAL PROPERTY
All work product, inventions, and intellectual property created during employment belong exclusively to Employer, including work done outside business hours if related to Employer's business.

7. CONFIDENTIALITY
Employee agrees to maintain confidentiality of all proprietary information indefinitely.

8. DISPUTE RESOLUTION
All disputes shall be resolved through binding arbitration in Delaware. Employee waives right to jury trial.

9. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware.

IN WITNESS WHEREOF, the parties have executed this Agreement.`,
  },
  nda: {
    contractType: "nda",
    clientRole: "party_a",
    focusAreas: "scope of confidentiality, exceptions, term, remedies",
    contractText: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of December 1, 2024, by and between:

Party A: Innovative Solutions LLC ("Discloser")
Party B: Strategic Partners Inc. ("Recipient")

1. PURPOSE
The parties wish to explore a potential business relationship and will need to share confidential information.

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any data or information that is proprietary to the Discloser, including but not limited to trade secrets, business plans, customer lists, financial data, and technical specifications.

3. EXCLUSIONS
Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of Recipient
(b) Was rightfully in Recipient's possession before disclosure
(c) Is independently developed by Recipient without use of Confidential Information

4. OBLIGATIONS
Recipient agrees to:
- Hold Confidential Information in strict confidence
- Use information only for the Purpose stated above
- Not disclose to third parties without prior written consent
- Limit access to employees with need to know

5. TERM
This Agreement shall remain in effect for 5 years from the Effective Date. Confidentiality obligations shall survive termination.

6. RETURN OF INFORMATION
Upon termination or request, Recipient shall return or destroy all Confidential Information.

7. NO LICENSE
Nothing in this Agreement grants any rights to intellectual property.

8. REMEDIES
Recipient acknowledges that breach may cause irreparable harm and Discloser shall be entitled to injunctive relief in addition to other remedies.

9. GOVERNING LAW
This Agreement shall be governed by the laws of California.

AGREED:

Innovative Solutions LLC          Strategic Partners Inc.
By: _________________________    By: _________________________`,
  },
  lease: {
    contractType: "lease",
    clientRole: "party_b",
    focusAreas: "rent, security deposit, maintenance, termination, liability",
    contractText: `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement ("Lease") is made between:
Landlord: Prime Properties LLC
Tenant: StartUp Ventures Inc.

PREMISES: Suite 500, 123 Business Center Drive, San Francisco, CA 94102 (5,000 sq ft)

1. TERM
Initial Term: 5 years commencing March 1, 2024
Tenant has no right to terminate early.

2. RENT
Base Rent: $45 per square foot annually ($225,000/year, $18,750/month)
Annual increases: 5% per year
Triple Net (NNN): Tenant pays pro-rata share of property taxes, insurance, and CAM charges (estimated additional $12/sq ft)

3. SECURITY DEPOSIT
$56,250 (3 months' rent) due upon execution. Landlord may retain for any amounts owed.

4. PERMITTED USE
General office purposes only. Any change requires Landlord's prior written consent.

5. MAINTENANCE AND REPAIRS
Tenant responsible for all interior maintenance and repairs.
Landlord responsible for structural and roof repairs only.
HVAC maintenance and replacement: Tenant's responsibility.

6. ALTERATIONS
No alterations without Landlord's written consent. All improvements become Landlord's property.

7. INSURANCE
Tenant shall maintain:
- Commercial General Liability: $2,000,000 per occurrence
- Property Insurance for Tenant's property
- Workers' Compensation as required by law
Tenant shall name Landlord as additional insured.

8. INDEMNIFICATION
Tenant shall indemnify Landlord for all claims arising from Tenant's use of Premises.

9. DEFAULT
If Tenant fails to pay rent within 5 days of due date, Landlord may:
- Charge 10% late fee
- Terminate lease after 10 days' notice
- Recover all future rent as liquidated damages

10. ASSIGNMENT AND SUBLETTING
Not permitted without Landlord's prior written consent, which may be withheld for any reason.

11. PERSONAL GUARANTEE
Principals of Tenant shall personally guarantee all obligations under this Lease.

EXECUTED as of the date first above written.`,
  },
}

export default function ContractReviewPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ReviewResult | null>(null)
  const [contractText, setContractText] = useState("")
  const [fileName, setFileName] = useState("")
  const [formData, setFormData] = useState({
    contractType: "",
    clientRole: "party_a",
    focusAreas: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contractTypes = [
    { value: "employment", label: "Employment Agreement" },
    { value: "nda", label: "Non-Disclosure Agreement" },
    { value: "service", label: "Service Agreement" },
    { value: "lease", label: "Lease Agreement" },
    { value: "sale", label: "Sale Agreement" },
    { value: "partnership", label: "Partnership Agreement" },
    { value: "licensing", label: "Licensing Agreement" },
    { value: "vendor", label: "Vendor Agreement" },
    { value: "consulting", label: "Consulting Agreement" },
    { value: "other", label: "Other" },
  ]

  const loadSampleData = (type: keyof typeof sampleContracts) => {
    const sample = sampleContracts[type]
    setFormData({
      contractType: sample.contractType,
      clientRole: sample.clientRole,
      focusAreas: sample.focusAreas,
    })
    setContractText(sample.contractText)
    setFileName("")
    setResults(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    if (file.type === "text/plain") {
      const text = await file.text()
      setContractText(text)
    } else {
      setContractText("// Upload a .txt file for demo, or paste contract text below")
    }
  }

  const handleReview = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/contract-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contractText,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Failed to review contract:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!results) return
    const report = `
CONTRACT REVIEW REPORT
======================
Generated: ${new Date().toLocaleString()}
Contract Type: ${contractTypes.find(t => t.value === formData.contractType)?.label || 'Unknown'}

OVERALL RISK ASSESSMENT
-----------------------
Risk Level: ${results.overallRiskLevel.toUpperCase()}
Risk Score: ${results.riskScore}/100

SUMMARY
-------
${results.summary}

KEY TERMS IDENTIFIED
--------------------
${results.keyTerms.map((t, i) => `${i + 1}. ${t.term}\n   Location: ${t.location}\n   ${t.description}`).join('\n\n')}

IDENTIFIED RISKS
----------------
${results.risks.map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}\n   ${r.description}\n   Recommendation: ${r.recommendation}`).join('\n\n')}

MISSING/WEAK CLAUSES
--------------------
${results.missingClauses.map((c, i) => `${i + 1}. ${c.clause}\n   Importance: ${c.importance}\n   ${c.recommendation}`).join('\n\n')}

RECOMMENDATIONS
---------------
${results.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract-review-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRiskColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800 border-green-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      critical: "bg-red-100 text-red-800 border-red-300",
    }
    return colors[severity] || colors.medium
  }

  const getRiskIcon = (severity: string) => {
    if (severity === "critical") return <XCircle className="h-4 w-4" />
    if (severity === "high") return <AlertTriangle className="h-4 w-4" />
    if (severity === "medium") return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Contract Review</h1>
          <p className="text-muted-foreground">
            AI-powered contract analysis to identify risks and key terms
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Sample Data Buttons */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-green-700">
              <Database className="h-5 w-5" />
              <span className="font-medium">Load Sample Contract:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("employment")}
              className="bg-white hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Employment Agreement
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("nda")}
              className="bg-white hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              NDA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("lease")}
              className="bg-white hover:bg-green-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Commercial Lease
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Upload Contract
              </CardTitle>
              <CardDescription>
                Upload a contract file or paste the text directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {fileName || "Choose file"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: TXT (PDF parsing coming soon)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Or Paste Contract Text *</Label>
                <Textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Paste the contract text here..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {contractText.length} characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Type</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, contractType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your Client's Role</Label>
                <Select
                  value={formData.clientRole}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="party_a">Party A (Drafter / Stronger Position)</SelectItem>
                    <SelectItem value="party_b">Party B (Recipient / Weaker Position)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Focus Areas</Label>
                <Input
                  value={formData.focusAreas}
                  onChange={(e) => setFormData((prev) => ({ ...prev, focusAreas: e.target.value }))}
                  placeholder="e.g., liability, termination, IP rights, indemnification"
                />
              </div>

              <Button
                onClick={handleReview}
                disabled={loading || !contractText}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Contract...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Contract
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Overall Risk Assessment */}
              <Card className={
                results.overallRiskLevel === "high"
                  ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
                  : results.overallRiskLevel === "medium"
                  ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                  : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
              }>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Overall Risk Assessment
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={handleExportReport}>
                      <Download className="h-4 w-4 mr-1" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`${getRiskColor(results.overallRiskLevel)} text-lg px-4 py-2`}
                      >
                        {results.overallRiskLevel.toUpperCase()} RISK
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Risk Score</span>
                          <span className={`font-bold ${getRiskScoreColor(results.riskScore)}`}>
                            {results.riskScore}/100
                          </span>
                        </div>
                        <Progress
                          value={results.riskScore}
                          className="h-2"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{results.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Accordion for detailed results */}
              <Accordion type="multiple" defaultValue={["risks", "terms"]} className="space-y-4">
                {/* Identified Risks */}
                {results.risks && results.risks.length > 0 && (
                  <AccordionItem value="risks" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold">Identified Risks</span>
                        <Badge variant="secondary">{results.risks.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {results.risks.map((risk, index) => (
                          <div key={index} className={`border rounded-lg p-4 ${getRiskColor(risk.severity)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRiskColor(risk.severity)}>
                                {getRiskIcon(risk.severity)}
                                <span className="ml-1 uppercase">{risk.severity}</span>
                              </Badge>
                              <h4 className="font-semibold">{risk.title}</h4>
                            </div>
                            <p className="text-sm mb-2">{risk.description}</p>
                            <div className="flex items-start gap-2 text-sm bg-white/50 rounded p-2">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span><strong>Recommendation:</strong> {risk.recommendation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Key Terms */}
                {results.keyTerms && results.keyTerms.length > 0 && (
                  <AccordionItem value="terms" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Key Terms Identified</span>
                        <Badge variant="secondary">{results.keyTerms.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {results.keyTerms.map((term, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-blue-50">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-blue-900">{term.term}</h4>
                              <Badge variant="outline" className="text-xs">{term.location}</Badge>
                            </div>
                            <p className="text-sm text-blue-800">{term.description}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Missing Clauses */}
                {results.missingClauses && results.missingClauses.length > 0 && (
                  <AccordionItem value="missing" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">Missing or Weak Clauses</span>
                        <Badge variant="secondary">{results.missingClauses.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {results.missingClauses.map((clause, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-yellow-50">
                            <h4 className="font-semibold text-yellow-900">{clause.clause}</h4>
                            <p className="text-sm text-yellow-800 mb-1">{clause.importance}</p>
                            <p className="text-sm text-yellow-700 italic">{clause.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <AccordionItem value="recommendations" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Recommendations</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </>
          ) : (
            <Card className="border-dashed h-full min-h-[500px]">
              <CardContent className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-6 mb-4">
                  <Shield className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Contract Analysis</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Upload or paste a contract to get comprehensive AI-powered risk analysis and recommendations
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Risk Assessment</Badge>
                  <Badge variant="secondary">Key Terms</Badge>
                  <Badge variant="secondary">Missing Clauses</Badge>
                  <Badge variant="secondary">Recommendations</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Important Disclaimer</p>
              <p className="text-sm text-amber-700 mt-1">
                AI contract analysis is for preliminary review only. It does not constitute legal advice.
                Always have contracts reviewed by a qualified attorney before signing. AI may miss
                context-specific issues or recent legal changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
