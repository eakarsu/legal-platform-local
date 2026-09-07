"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"

interface OpponentResult {
  attorneyProfile?: { background?: string; reputation?: string; areasOfFocus?: string[] }
  litigationStyle?: string
  knownTactics?: string[]
  strengths?: string[]
  weaknesses?: string[]
  notableCases?: Array<{ name?: string; outcome?: string; relevance?: string }>
  strategicRecommendations?: string[]
  watchpoints?: string[]
  notes?: string
}

export default function OpponentAnalysisPage() {
  const [opposingCounselName, setOpposingCounselName] = useState("")
  const [opposingFirm, setOpposingFirm] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [practiceArea, setPracticeArea] = useState("")
  const [matterType, setMatterType] = useState("")
  const [knownCases, setKnownCases] = useState("")
  const [additionalContext, setAdditionalContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OpponentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/ai/opponent-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opposingCounselName,
          opposingFirm,
          jurisdiction,
          practiceArea,
          matterType,
          knownCases,
          additionalContext,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) {
          throw new Error(data.message || data.error || "AI is not configured")
        }
        throw new Error(data.error || data.message || "Request failed")
      }
      setResults(data)
    } catch (err: any) {
      setError(err.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="h-7 w-7 text-primary" />
          Opposing Counsel Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate a preliminary opposing-counsel briefing for litigation prep.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opposing Counsel Details</CardTitle>
          <CardDescription>Provide what you know — the AI will produce strategic context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="opposingCounselName">Opposing Counsel Name</Label>
              <Input
                id="opposingCounselName"
                value={opposingCounselName}
                onChange={(e) => setOpposingCounselName(e.target.value)}
                placeholder="e.g., Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="opposingFirm">Firm</Label>
              <Input
                id="opposingFirm"
                value={opposingFirm}
                onChange={(e) => setOpposingFirm(e.target.value)}
                placeholder="e.g., Smith & Partners LLP"
              />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g., S.D.N.Y."
              />
            </div>
            <div>
              <Label htmlFor="practiceArea">Practice Area</Label>
              <Input
                id="practiceArea"
                value={practiceArea}
                onChange={(e) => setPracticeArea(e.target.value)}
                placeholder="e.g., commercial litigation"
              />
            </div>
            <div>
              <Label htmlFor="matterType">Matter Type</Label>
              <Input
                id="matterType"
                value={matterType}
                onChange={(e) => setMatterType(e.target.value)}
                placeholder="e.g., breach of contract"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="knownCases">Known Cases (optional)</Label>
            <Textarea
              id="knownCases"
              value={knownCases}
              onChange={(e) => setKnownCases(e.target.value)}
              placeholder="List any prior cases you have on this attorney"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="additionalContext">Additional Context (optional)</Label>
            <Textarea
              id="additionalContext"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Posture, settlement history, etc."
              rows={3}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading || !opposingCounselName}>
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Run Opponent Analysis</>
            )}
          </Button>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Briefing
              {results.litigationStyle && <Badge variant="outline">{results.litigationStyle}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {results.attorneyProfile && (
              <div className="space-y-2">
                <Label>Attorney Profile</Label>
                {results.attorneyProfile.background && <p><strong>Background:</strong> {results.attorneyProfile.background}</p>}
                {results.attorneyProfile.reputation && <p><strong>Reputation:</strong> {results.attorneyProfile.reputation}</p>}
                {Array.isArray(results.attorneyProfile.areasOfFocus) && results.attorneyProfile.areasOfFocus.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {results.attorneyProfile.areasOfFocus.map((a, i) => (
                      <Badge key={i} variant="outline">{a}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {Array.isArray(results.knownTactics) && results.knownTactics.length > 0 && (
              <div>
                <Label>Known Tactics</Label>
                <ul className="list-disc list-inside">{results.knownTactics.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.strengths) && results.strengths.length > 0 && (
              <div>
                <Label>Strengths</Label>
                <ul className="list-disc list-inside">{results.strengths.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.weaknesses) && results.weaknesses.length > 0 && (
              <div>
                <Label>Weaknesses</Label>
                <ul className="list-disc list-inside">{results.weaknesses.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.notableCases) && results.notableCases.length > 0 && (
              <div>
                <Label>Notable Cases</Label>
                <ul className="space-y-2 mt-2">
                  {results.notableCases.map((c, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="font-medium">{c.name || `Case ${i + 1}`}</div>
                      {c.outcome && <div className="text-muted-foreground mt-1"><strong>Outcome:</strong> {c.outcome}</div>}
                      {c.relevance && <div className="text-muted-foreground"><strong>Relevance:</strong> {c.relevance}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.strategicRecommendations) && results.strategicRecommendations.length > 0 && (
              <div>
                <Label>Strategic Recommendations</Label>
                <ul className="list-disc list-inside">{results.strategicRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.watchpoints) && results.watchpoints.length > 0 && (
              <div>
                <Label>Watchpoints</Label>
                <ul className="list-disc list-inside">{results.watchpoints.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {results.notes && (
              <div>
                <Label>Notes</Label>
                <p>{results.notes}</p>
              </div>
            )}
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground">Show raw response</summary>
              <pre className="mt-2 bg-muted p-3 rounded text-xs whitespace-pre-wrap overflow-auto max-h-[300px]">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
