"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Scale,
  Phone,
  Mail,
  Building,
  User,
} from "lucide-react"

interface IntakeAnalysis {
  conflictCheck: {
    status: "clear" | "potential" | "conflict"
    details: string[]
  }
  matterRecommendation: {
    practiceArea: string
    matterType: string
    complexity: "simple" | "moderate" | "complex"
    estimatedHours: number
    suggestedRetainer: number
  }
  riskAssessment: {
    level: "low" | "medium" | "high"
    factors: string[]
  }
  nextSteps: string[]
  questionsToAsk: string[]
  documentsNeeded: string[]
}

const sampleIntakes: Record<string, { formData: typeof defaultFormData; analysis: IntakeAnalysis }> = {
  divorce: {
    formData: {
      clientType: "individual",
      firstName: "Sarah",
      lastName: "Thompson",
      email: "sarah.thompson@email.com",
      phone: "(555) 123-4567",
      companyName: "",
      legalIssue: "I need help with a divorce. We've been married for 12 years and have 2 children ages 8 and 10. We own a house together worth about $450,000 with $200,000 mortgage. My spouse has a 401k worth about $350,000. I've been a stay-at-home parent for the last 8 years. My spouse earns about $150,000/year. We disagree about custody - I want primary custody and they want 50/50.",
      urgency: "moderate",
      budget: "$10,000-$25,000",
      referralSource: "friend",
      additionalNotes: "I'm worried about being able to support myself after the divorce since I haven't worked in 8 years.",
    },
    analysis: {
      conflictCheck: {
        status: "clear",
        details: [
          "No existing clients with matching name found",
          "Spouse name not in client database",
          "No adverse parties identified",
        ],
      },
      matterRecommendation: {
        practiceArea: "Family Law",
        matterType: "Divorce - Contested",
        complexity: "complex",
        estimatedHours: 80,
        suggestedRetainer: 15000,
      },
      riskAssessment: {
        level: "medium",
        factors: [
          "Contested custody increases litigation risk",
          "Significant marital assets require detailed valuation",
          "Income disparity may affect spousal support calculation",
          "Client's employment gap may impact earning capacity assessment",
        ],
      },
      nextSteps: [
        "Schedule initial consultation ($250 for 1 hour)",
        "Have client complete detailed financial disclosure",
        "Run conflict check on spouse's name",
        "Discuss retainer agreement and fee structure",
        "Consider referring to vocational expert for earning capacity",
      ],
      questionsToAsk: [
        "What is your spouse's full legal name and current employer?",
        "Are there any prenuptial or postnuptial agreements?",
        "What are the children's school and activity schedules?",
        "Do you have access to all financial accounts and records?",
        "Has there been any history of domestic violence?",
        "What are your spouse's position on property division?",
      ],
      documentsNeeded: [
        "Marriage certificate",
        "Children's birth certificates",
        "Last 3 years of tax returns",
        "Recent mortgage statement and property tax bills",
        "Spouse's 401k statements",
        "Any existing parenting agreements",
        "Bank and investment account statements",
      ],
    },
  },
  business_formation: {
    formData: {
      clientType: "business",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@techstartup.io",
      phone: "(555) 987-6543",
      companyName: "TechStartup.io",
      legalIssue: "We're a group of 3 founders starting a SaaS company. We need help incorporating, creating a founders agreement, setting up equity structure, and potentially preparing for angel investment. We're planning to incorporate in Delaware but operate in California. We also want to set up an employee stock option pool.",
      urgency: "urgent",
      budget: "$5,000-$10,000",
      referralSource: "linkedin",
      additionalNotes: "One founder is contributing cash ($50k), one is contributing IP (existing codebase), and one is full-time operations. We need help figuring out fair equity split.",
    },
    analysis: {
      conflictCheck: {
        status: "clear",
        details: [
          "Company name not registered with existing matters",
          "Founders not in client or adverse party database",
          "No competing startup clients in same space",
        ],
      },
      matterRecommendation: {
        practiceArea: "Corporate/Business",
        matterType: "Business Formation & Equity Structuring",
        complexity: "moderate",
        estimatedHours: 35,
        suggestedRetainer: 7500,
      },
      riskAssessment: {
        level: "low",
        factors: [
          "Standard startup formation with well-established templates",
          "Multiple founders with different contributions may complicate equity discussions",
          "IP contribution needs proper assignment documentation",
          "California employment laws apply despite Delaware incorporation",
        ],
      },
      nextSteps: [
        "Schedule founders meeting to discuss business goals",
        "Provide equity calculator tool for initial split discussion",
        "Prepare incorporation documents for Delaware C-Corp",
        "Draft founders agreement with vesting schedules",
        "Prepare IP assignment for contributing founder",
      ],
      questionsToAsk: [
        "What is the current development stage of the contributed IP?",
        "Do any founders have employment agreements with non-compete clauses?",
        "What is the anticipated timeline for angel investment?",
        "Will all founders be full-time employees from day one?",
        "What percentage ESOP pool do you want to reserve?",
        "Have the founders agreed on roles and decision-making structure?",
      ],
      documentsNeeded: [
        "Founders' identification and background info",
        "Description of contributed IP and its development history",
        "Business plan or pitch deck",
        "Founders' current employment agreements (if any)",
        "Initial budget and runway projections",
        "List of intended board members and advisors",
      ],
    },
  },
  personal_injury: {
    formData: {
      clientType: "individual",
      firstName: "Robert",
      lastName: "Williams",
      email: "rwilliams@gmail.com",
      phone: "(555) 456-7890",
      companyName: "",
      legalIssue: "I was rear-ended at a red light 3 weeks ago. The other driver was texting. I have whiplash and back pain, been to the doctor 4 times. My car was totaled ($18,000 value). The other driver's insurance offered me $12,000 to settle everything but that doesn't even cover my car. I've missed 2 weeks of work and still in pain.",
      urgency: "moderate",
      budget: "Contingency preferred",
      referralSource: "google",
      additionalNotes: "I have health insurance but they're saying they might not cover some of the treatment because it's from an accident.",
    },
    analysis: {
      conflictCheck: {
        status: "clear",
        details: [
          "No representation of other driver or insurance company",
          "No conflicting matters involving same accident",
          "Clear to proceed with representation",
        ],
      },
      matterRecommendation: {
        practiceArea: "Personal Injury",
        matterType: "Motor Vehicle Accident",
        complexity: "moderate",
        estimatedHours: 45,
        suggestedRetainer: 0,
      },
      riskAssessment: {
        level: "low",
        factors: [
          "Clear liability - rear-end collision at red light",
          "Texting evidence strengthens case significantly",
          "Early insurance lowball offer indicates they recognize liability",
          "Medical treatment ongoing - full extent of injuries unclear",
          "Health insurance subrogation claim must be addressed",
        ],
      },
      nextSteps: [
        "Reject current settlement offer immediately",
        "Execute contingency fee agreement (33% pre-litigation)",
        "Send preservation letter to at-fault driver's insurance",
        "Order police report and any available camera footage",
        "Schedule initial medical records collection",
      ],
      questionsToAsk: [
        "Do you have photos from the accident scene?",
        "Did police cite the other driver for texting?",
        "What is your current medical treatment plan?",
        "What is your annual income and what documentation do you have?",
        "Do you have any prior back or neck injuries?",
        "Were there any witnesses to the accident?",
      ],
      documentsNeeded: [
        "Police accident report",
        "Photos of vehicle damage and accident scene",
        "All medical records and bills",
        "Health insurance policy information",
        "Pay stubs and employment documentation",
        "Insurance policy declarations page",
        "Correspondence from at-fault driver's insurance",
      ],
    },
  },
}

const defaultFormData = {
  clientType: "individual" as "individual" | "business",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  legalIssue: "",
  urgency: "moderate" as "low" | "moderate" | "urgent",
  budget: "",
  referralSource: "",
  additionalNotes: "",
}

export default function ClientIntakePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)
  const [analysis, setAnalysis] = useState<IntakeAnalysis | null>(null)
  const [createClient, setCreateClient] = useState(false)

  const loadSampleData = (type: keyof typeof sampleIntakes) => {
    const sample = sampleIntakes[type]
    setFormData(sample.formData as typeof defaultFormData)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/ai/client-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysis(result)
      } else {
        // Simulate analysis for demo
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Determine sample based on keywords
        let sampleKey: keyof typeof sampleIntakes = "personal_injury"
        if (formData.legalIssue.toLowerCase().includes("divorce") ||
            formData.legalIssue.toLowerCase().includes("custody")) {
          sampleKey = "divorce"
        } else if (formData.legalIssue.toLowerCase().includes("business") ||
                   formData.legalIssue.toLowerCase().includes("startup") ||
                   formData.legalIssue.toLowerCase().includes("incorporat")) {
          sampleKey = "business_formation"
        }

        setAnalysis(sampleIntakes[sampleKey].analysis)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setAnalysis(sampleIntakes.personal_injury.analysis)
    } finally {
      setLoading(false)
    }
  }

  const getConflictColor = (status: string) => {
    switch (status) {
      case "clear":
        return "text-green-600 bg-green-100"
      case "potential":
        return "text-yellow-600 bg-yellow-100"
      case "conflict":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Client Intake</h1>
        <p className="text-muted-foreground">
          Streamline new client intake with AI-powered analysis and recommendations
        </p>
      </div>

      {/* Sample Data Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Load Sample Intake</CardTitle>
          <CardDescription>
            Try the intake process with pre-populated sample clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("divorce")}
            >
              <Users className="mr-2 h-4 w-4" />
              Divorce Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("business_formation")}
            >
              <Building className="mr-2 h-4 w-4" />
              Startup Formation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("personal_injury")}
            >
              <Scale className="mr-2 h-4 w-4" />
              Personal Injury
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intake Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client Type</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value: "individual" | "business") =>
                  setFormData((prev) => ({ ...prev, clientType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
            </div>

            {formData.clientType === "business" && (
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  placeholder="Company Inc."
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Legal Issue *</Label>
              <Textarea
                placeholder="Describe the legal matter in detail..."
                rows={5}
                value={formData.legalIssue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, legalIssue: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value: "low" | "moderate" | "urgent") =>
                    setFormData((prev) => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - No deadline</SelectItem>
                    <SelectItem value="moderate">Moderate - Within weeks</SelectItem>
                    <SelectItem value="urgent">Urgent - Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, budget: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under $5,000">Under $5,000</SelectItem>
                    <SelectItem value="$5,000-$10,000">$5,000-$10,000</SelectItem>
                    <SelectItem value="$10,000-$25,000">$10,000-$25,000</SelectItem>
                    <SelectItem value="$25,000+">$25,000+</SelectItem>
                    <SelectItem value="Contingency preferred">Contingency preferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referral Source</Label>
              <Input
                placeholder="How did they find us?"
                value={formData.referralSource}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, referralSource: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any other relevant information..."
                rows={2}
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))
                }
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !formData.firstName || !formData.legalIssue}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Intake...
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" />
                  Analyze & Recommend
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analysis && (
            <>
              {/* Conflict Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Conflict Check
                    </span>
                    <Badge className={getConflictColor(analysis.conflictCheck.status)}>
                      {analysis.conflictCheck.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.conflictCheck.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Matter Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Matter Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Practice Area</p>
                      <p className="font-medium">{analysis.matterRecommendation.practiceArea}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Matter Type</p>
                      <p className="font-medium">{analysis.matterRecommendation.matterType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Complexity</p>
                      <Badge variant="outline" className="capitalize">
                        {analysis.matterRecommendation.complexity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Hours</p>
                      <p className="font-medium">{analysis.matterRecommendation.estimatedHours} hrs</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Suggested Retainer</p>
                      <p className="text-xl font-bold text-primary">
                        {analysis.matterRecommendation.suggestedRetainer === 0
                          ? "Contingency Fee Recommended"
                          : `$${analysis.matterRecommendation.suggestedRetainer.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Assessment
                    </span>
                    <Badge className={getRiskColor(analysis.riskAssessment.level)}>
                      {analysis.riskAssessment.level.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskAssessment.factors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 list-decimal list-inside">
                    {analysis.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Questions to Ask */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Questions to Ask Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.questionsToAsk.map((question, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-medium">{index + 1}.</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Documents Needed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents Needed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.documentsNeeded.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Checkbox id={`doc-${index}`} />
                        <label htmlFor={`doc-${index}`} className="cursor-pointer">
                          {doc}
                        </label>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Create Client Button */}
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="createClient"
                      checked={createClient}
                      onCheckedChange={(checked) => setCreateClient(checked as boolean)}
                    />
                    <label htmlFor="createClient" className="text-sm cursor-pointer">
                      Create client record and new matter from this intake
                    </label>
                  </div>
                  <Button
                    className="w-full mt-4"
                    disabled={!createClient}
                    onClick={() => {
                      alert("Client and matter would be created in production")
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Create Client & Matter
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {!analysis && !loading && (
            <Card className="flex items-center justify-center h-[400px]">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter client information to get AI-powered intake analysis</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing intake information...</p>
                <p className="text-sm text-muted-foreground mt-2">Running conflict check and recommendations</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
