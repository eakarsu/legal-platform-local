"use client"

import { useState, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress"
import {
  Briefcase,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Scale,
  FileText,
  Users,
  Clock,
} from "lucide-react"

interface Matter {
  id: string
  name: string
  matterNumber: string
  practiceArea: string
}

interface CaseAnalysis {
  strengthScore: number
  riskLevel: "low" | "medium" | "high"
  keyStrengths: string[]
  keyWeaknesses: string[]
  recommendedActions: string[]
  similarCases: Array<{
    name: string
    outcome: string
    relevance: number
  }>
  estimatedOutcome: string
  strategicRecommendations: string
}

const sampleAnalyses: Record<string, { formData: { caseDescription: string; opposingArguments: string; evidence: string; witnesses: string }; analysis: CaseAnalysis }> = {
  personal_injury: {
    formData: {
      caseDescription: "Client was injured in a car accident when defendant ran a red light. Client suffered whiplash, herniated disc, and emotional distress. Medical bills totaling $45,000. Lost wages of $12,000. Defendant has insurance with $100,000 policy limit.",
      opposingArguments: "Defense claims client was partially at fault for not wearing seatbelt. Defense disputes severity of injuries and suggests pre-existing condition.",
      evidence: "Police report citing defendant at fault, traffic camera footage showing red light violation, medical records, employment records showing missed work",
      witnesses: "Eyewitness at intersection, treating physician, physical therapist, employer HR representative",
    },
    analysis: {
      strengthScore: 78,
      riskLevel: "low",
      keyStrengths: [
        "Clear liability established by police report and traffic camera footage",
        "Documented injuries with extensive medical records",
        "Multiple credible witnesses available",
        "Strong employment records supporting lost wages claim",
      ],
      keyWeaknesses: [
        "Potential comparative negligence for not wearing seatbelt",
        "Defense may argue pre-existing condition contributed to injuries",
        "Medical expenses approach policy limit, may face collection issues",
      ],
      recommendedActions: [
        "Obtain independent medical examination to counter pre-existing condition defense",
        "Research state law on seatbelt defense and its impact on damages",
        "Consider early settlement negotiation given strong evidence",
        "Prepare demand letter with full documentation",
      ],
      similarCases: [
        { name: "Smith v. Johnson (2023)", outcome: "Settlement $85,000", relevance: 92 },
        { name: "Davis v. Metro Transit (2022)", outcome: "Verdict $120,000", relevance: 78 },
        { name: "Wilson v. ABC Insurance (2023)", outcome: "Settlement $67,000", relevance: 85 },
      ],
      estimatedOutcome: "Based on similar cases and case strength, estimated settlement range is $65,000 - $95,000. Trial verdict potential of $100,000 - $140,000 but with litigation risks.",
      strategicRecommendations: "Recommend pursuing settlement negotiations before litigation. The strong evidence supports a favorable settlement within policy limits. Consider mediation if initial negotiations stall. If case proceeds to trial, focus on the clear liability established by traffic camera footage.",
    },
  },
  contract_dispute: {
    formData: {
      caseDescription: "Client entered into a software development contract worth $500,000. Defendant failed to deliver the final product on time and the delivered components have significant bugs. Client seeks full refund plus consequential damages of $200,000 for delayed product launch.",
      opposingArguments: "Defense claims delays were caused by client's changing requirements. Defense disputes bug severity and says acceptance testing was never completed by client.",
      evidence: "Original contract with delivery timeline, email correspondence showing scope changes, bug reports from client testing, project management logs, expert software evaluation",
      witnesses: "Client's CTO, project manager, independent software expert",
    },
    analysis: {
      strengthScore: 65,
      riskLevel: "medium",
      keyStrengths: [
        "Clear contract terms with specific delivery dates",
        "Documented bug reports and failed testing results",
        "Expert testimony available on software defects",
        "Email trail shows defendant acknowledged delays",
      ],
      keyWeaknesses: [
        "Evidence of scope changes may support defense argument",
        "Client did not formally reject deliverables in writing",
        "Consequential damages may be limited by contract terms",
        "No formal acceptance testing protocol was established",
      ],
      recommendedActions: [
        "Review contract for limitation of liability and damages clauses",
        "Compile detailed timeline of scope changes vs. original requirements",
        "Obtain detailed expert report on software defects and remediation costs",
        "Calculate actual damages with supporting documentation",
      ],
      similarCases: [
        { name: "TechCorp v. DevSolutions (2023)", outcome: "Settlement $380,000", relevance: 88 },
        { name: "StartUp Inc v. CodeFactory (2022)", outcome: "Verdict for Defendant", relevance: 72 },
        { name: "Enterprise Systems v. Consultants LLC (2023)", outcome: "Settlement $450,000", relevance: 80 },
      ],
      estimatedOutcome: "Given the mixed evidence, estimated settlement range is $300,000 - $450,000. Trial outcome uncertain due to scope change documentation. Consequential damages recovery is questionable.",
      strategicRecommendations: "Recommend early mediation to resolve dispute. Focus negotiations on direct damages and partial refund. Be prepared to compromise on consequential damages given contract limitations. If proceeding to trial, emphasize defendant's acknowledgment of delays in email correspondence.",
    },
  },
  employment: {
    formData: {
      caseDescription: "Client was terminated after 8 years of employment following a complaint about workplace harassment. Client alleges retaliation under Title VII. Prior to termination, client had consistently positive performance reviews and was recently promoted.",
      opposingArguments: "Employer claims termination was due to budget cuts and restructuring. Employer points to documentation of position elimination.",
      evidence: "Performance reviews, promotion letter, harassment complaint dated 2 weeks before termination, emails from supervisor, HR investigation file, comparative evidence of retained employees",
      witnesses: "Client, HR representative, colleague who witnessed harassment, former supervisor",
    },
    analysis: {
      strengthScore: 72,
      riskLevel: "medium",
      keyStrengths: [
        "Strong temporal proximity between complaint and termination (2 weeks)",
        "Excellent performance history undermines legitimate business reason",
        "Recent promotion suggests employer valued client's work",
        "Witness available to corroborate harassment claim",
      ],
      keyWeaknesses: [
        "Employer has documentation of restructuring plan",
        "Other employees in same department may have been retained",
        "Damages calculation may be limited by mitigation requirement",
        "EEOC charge timeline must be verified",
      ],
      recommendedActions: [
        "Verify EEOC charge filing deadlines and status",
        "Obtain comparative evidence of other employees retained during 'restructuring'",
        "Document client's job search efforts for mitigation defense",
        "Interview witness to harassment before memories fade",
      ],
      similarCases: [
        { name: "Martinez v. Tech Corp (2023)", outcome: "Settlement $185,000", relevance: 85 },
        { name: "Johnson v. Manufacturing Inc (2022)", outcome: "Verdict $250,000 + attorneys fees", relevance: 79 },
        { name: "Williams v. Services LLC (2023)", outcome: "Summary Judgment for Employer", relevance: 68 },
      ],
      estimatedOutcome: "Estimated settlement range is $120,000 - $200,000. Trial verdict potential of $200,000 - $350,000 including front pay and emotional distress. Risk of summary judgment if restructuring defense is well-documented.",
      strategicRecommendations: "File EEOC charge immediately if not already done. Request early mediation through EEOC process. Focus discovery on comparative treatment of other employees and timing of restructuring decision. The temporal proximity is strong evidence of retaliation but must overcome documented business justification.",
    },
  },
}

export default function CaseAnalysisPage() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedMatter, setSelectedMatter] = useState("")
  const [formData, setFormData] = useState({
    caseDescription: "",
    opposingArguments: "",
    evidence: "",
    witnesses: "",
  })
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null)

  useEffect(() => {
    async function fetchMatters() {
      try {
        const res = await fetch("/api/matters")
        if (res.ok) {
          const data = await res.json()
          setMatters(data)
        }
      } catch (error) {
        console.error("Failed to fetch matters:", error)
      }
    }
    fetchMatters()
  }, [])

  const loadSampleData = (type: keyof typeof sampleAnalyses) => {
    const sample = sampleAnalyses[type]
    setFormData(sample.formData)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/ai/case-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterId: selectedMatter,
          ...formData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysis(result)
      } else {
        // Simulate AI response for demo
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Determine which sample to use based on description keywords
        let sampleKey: keyof typeof sampleAnalyses = "personal_injury"
        if (formData.caseDescription.toLowerCase().includes("contract") ||
            formData.caseDescription.toLowerCase().includes("software")) {
          sampleKey = "contract_dispute"
        } else if (formData.caseDescription.toLowerCase().includes("employment") ||
                   formData.caseDescription.toLowerCase().includes("terminated") ||
                   formData.caseDescription.toLowerCase().includes("harassment")) {
          sampleKey = "employment"
        }

        setAnalysis(sampleAnalyses[sampleKey].analysis)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      // Use sample data on error
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setAnalysis(sampleAnalyses.personal_injury.analysis)
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Case Analysis</h1>
        <p className="text-muted-foreground">
          Analyze case strength, identify risks, and get strategic recommendations
        </p>
      </div>

      {/* Sample Data Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Load Sample Case</CardTitle>
          <CardDescription>
            Try the analysis with pre-populated sample cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("personal_injury")}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Personal Injury Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("contract_dispute")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Contract Dispute
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("employment")}
            >
              <Users className="mr-2 h-4 w-4" />
              Employment Retaliation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Related Matter (Optional)</Label>
              <Select value={selectedMatter} onValueChange={setSelectedMatter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a matter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {matters.map((matter) => (
                    <SelectItem key={matter.id} value={matter.id}>
                      {matter.name} ({matter.matterNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Case Description *</Label>
              <Textarea
                placeholder="Describe the case facts, claims, and key issues..."
                rows={5}
                value={formData.caseDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, caseDescription: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Opposing Arguments</Label>
              <Textarea
                placeholder="What arguments is the opposing party making?"
                rows={3}
                value={formData.opposingArguments}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, opposingArguments: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Available Evidence</Label>
              <Textarea
                placeholder="List key documents, records, and other evidence..."
                rows={3}
                value={formData.evidence}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, evidence: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Witnesses</Label>
              <Input
                placeholder="List potential witnesses..."
                value={formData.witnesses}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, witnesses: e.target.value }))
                }
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !formData.caseDescription}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Case...
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Analyze Case
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analysis && (
            <>
              {/* Strength Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Case Strength Score
                    </span>
                    <Badge className={getRiskColor(analysis.riskLevel)}>
                      {analysis.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold">{analysis.strengthScore}%</span>
                      <span className="text-muted-foreground">Overall Strength</span>
                    </div>
                    <Progress
                      value={analysis.strengthScore}
                      className={`h-3 ${getScoreColor(analysis.strengthScore)}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.keyStrengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Key Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.keyWeaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 list-decimal list-inside">
                    {analysis.recommendedActions.map((action, index) => (
                      <li key={index} className="text-sm">
                        {action}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Similar Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Similar Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.similarCases.map((case_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{case_.name}</p>
                          <p className="text-sm text-muted-foreground">{case_.outcome}</p>
                        </div>
                        <Badge variant="outline">{case_.relevance}% relevant</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Outcome */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estimated Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{analysis.estimatedOutcome}</p>
                </CardContent>
              </Card>

              {/* Strategic Recommendations */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Briefcase className="h-5 w-5" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{analysis.strategicRecommendations}</p>
                </CardContent>
              </Card>
            </>
          )}

          {!analysis && !analyzing && (
            <Card className="flex items-center justify-center h-[400px]">
              <div className="text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter case information and click Analyze to get AI-powered insights</p>
              </div>
            </Card>
          )}

          {analyzing && (
            <Card className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing case strength and risks...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
