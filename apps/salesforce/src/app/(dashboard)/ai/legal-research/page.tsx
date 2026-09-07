"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Sparkles,
  Search,
  BookOpen,
  Scale,
  RefreshCw,
  Database,
  Copy,
  CheckCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Download,
} from "lucide-react"

interface ResearchResult {
  summary: string
  cases: Array<{
    name: string
    citation: string
    year: string
    summary: string
    relevance: string
  }>
  statutes: Array<{
    title: string
    citation: string
    summary: string
  }>
  analysis: string
  recommendations: string[]
}

const sampleQueries = {
  negligence: {
    query: "What are the elements required to prove negligence in a personal injury case in New York?",
    jurisdiction: "New York",
    practiceArea: "personal_injury",
    additionalContext: "Client was injured when a retail store's automatic door malfunctioned and struck them. They suffered a broken arm and required surgery. The store claims they had regular maintenance on the doors. Client seeks to understand what they need to prove to recover damages.",
  },
  nonCompete: {
    query: "Are non-compete agreements enforceable in California and what are the exceptions?",
    jurisdiction: "California",
    practiceArea: "employment",
    additionalContext: "Client is a software engineer who wants to leave their current employer for a competitor. They signed a 2-year non-compete agreement that restricts them from working for any competitor within a 50-mile radius. Client wants to know if this is enforceable.",
  },
  custody: {
    query: "What factors do courts consider in determining child custody arrangements in contested cases?",
    jurisdiction: "New York",
    practiceArea: "family",
    additionalContext: "Parents are divorcing and cannot agree on custody of their 8-year-old child. Father works remotely and has flexible hours. Mother has traditional 9-5 job. Child has expressed preference to live primarily with father. Need to understand what factors the court will consider.",
  },
}

export default function LegalResearchPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResearchResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    query: "",
    jurisdiction: "",
    practiceArea: "",
    additionalContext: "",
  })

  const practiceAreas = [
    { value: "civil_litigation", label: "Civil Litigation" },
    { value: "criminal", label: "Criminal Law" },
    { value: "family", label: "Family Law" },
    { value: "corporate", label: "Corporate Law" },
    { value: "real_estate", label: "Real Estate" },
    { value: "employment", label: "Employment Law" },
    { value: "intellectual_property", label: "Intellectual Property" },
    { value: "immigration", label: "Immigration" },
    { value: "bankruptcy", label: "Bankruptcy" },
    { value: "tax", label: "Tax Law" },
    { value: "personal_injury", label: "Personal Injury" },
    { value: "estate_planning", label: "Estate Planning" },
  ]

  const loadSampleData = (type: keyof typeof sampleQueries) => {
    setFormData(sampleQueries[type])
    setResults(null)
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/legal-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Failed to perform research:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!results) return
    const text = `LEGAL RESEARCH MEMO\n${'='.repeat(50)}\n\nQuery: ${formData.query}\nJurisdiction: ${formData.jurisdiction}\nPractice Area: ${practiceAreas.find(p => p.value === formData.practiceArea)?.label || 'General'}\n\nSUMMARY\n-------\n${results.summary}\n\nRELEVANT CASES\n--------------\n${results.cases.map((c, i) => `${i + 1}. ${c.name}, ${c.citation} (${c.year})\n   ${c.summary}\n   Relevance: ${c.relevance}`).join('\n\n')}\n\nRELEVANT STATUTES\n-----------------\n${results.statutes.map((s, i) => `${i + 1}. ${s.title} (${s.citation})\n   ${s.summary}`).join('\n\n')}\n\nANALYSIS\n--------\n${results.analysis}\n\nRECOMMENDATIONS\n---------------\n${results.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    if (!results) return
    const blob = new Blob([`LEGAL RESEARCH MEMO\n${'='.repeat(50)}\n\nQuery: ${formData.query}\nJurisdiction: ${formData.jurisdiction}\nPractice Area: ${practiceAreas.find(p => p.value === formData.practiceArea)?.label || 'General'}\n\nSUMMARY\n-------\n${results.summary}\n\nANALYSIS\n--------\n${results.analysis}\n\nRECOMMENDATIONS\n---------------\n${results.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'legal-research-memo.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Legal Research</h1>
          <p className="text-muted-foreground">
            AI-powered legal research to find relevant cases and statutes
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Sample Data Buttons */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-indigo-700">
              <Database className="h-5 w-5" />
              <span className="font-medium">Load Sample Query:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("negligence")}
              className="bg-white hover:bg-indigo-50"
            >
              <Scale className="h-4 w-4 mr-1" />
              Negligence Elements
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("nonCompete")}
              className="bg-white hover:bg-indigo-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Non-Compete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSampleData("custody")}
              className="bg-white hover:bg-indigo-50"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Child Custody
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-500" />
              Research Query
            </CardTitle>
            <CardDescription>
              Describe your legal question or issue for comprehensive research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Legal Question *</Label>
              <Textarea
                value={formData.query}
                onChange={(e) => setFormData((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="e.g., What are the elements required to prove negligence in a slip and fall case?"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jurisdiction</Label>
                <Input
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                  placeholder="e.g., New York, Federal"
                />
              </div>
              <div className="space-y-2">
                <Label>Practice Area</Label>
                <Select
                  value={formData.practiceArea}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, practiceArea: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Context</Label>
              <Textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalContext: e.target.value }))}
                placeholder="Provide any specific facts, circumstances, or focus areas..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !formData.query}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Research
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Summary */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      Research Summary
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{results.summary}</p>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Accordion type="multiple" defaultValue={["cases"]} className="space-y-4">
                {/* Relevant Cases */}
                {results.cases && results.cases.length > 0 && (
                  <AccordionItem value="cases" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Relevant Cases</span>
                        <Badge variant="secondary">{results.cases.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {results.cases.map((c, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-semibold text-blue-900">{c.name}</h4>
                            <p className="text-sm text-blue-700">{c.citation} ({c.year})</p>
                            <p className="text-sm mt-2">{c.summary}</p>
                            <div className="flex items-start gap-2 text-sm bg-white/50 rounded p-2 mt-2">
                              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <span><strong>Relevance:</strong> {c.relevance}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Relevant Statutes */}
                {results.statutes && results.statutes.length > 0 && (
                  <AccordionItem value="statutes" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Relevant Statutes</span>
                        <Badge variant="secondary">{results.statutes.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {results.statutes.map((s, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-green-50">
                            <h4 className="font-semibold text-green-900">{s.title}</h4>
                            <p className="text-sm text-green-700">{s.citation}</p>
                            <p className="text-sm text-green-800 mt-1">{s.summary}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Analysis */}
                {results.analysis && (
                  <AccordionItem value="analysis" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold">Legal Analysis</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 p-3 bg-purple-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{results.analysis}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <AccordionItem value="recommendations" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">Recommendations</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                            <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
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
            <Card className="border-dashed h-full min-h-[400px]">
              <CardContent className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-6 mb-4">
                  <BookOpen className="h-12 w-12 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Your Research</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Enter your legal question above to get AI-powered research results including cases, statutes, and analysis
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Case Law</Badge>
                  <Badge variant="secondary">Statutes</Badge>
                  <Badge variant="secondary">Analysis</Badge>
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
                AI research results are for reference only. Always verify citations in official legal
                databases (Westlaw, LexisNexis, etc.) and conduct independent research. AI may not
                have access to the most recent case law or local rules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
