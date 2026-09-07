"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Globe, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"

interface ComplianceResult {
  jurisdictionalIssues?: Array<{ jurisdiction?: string; issue?: string; severity?: string; rule?: string }>
  rulesOfProfessionalConductFlags?: Array<{ jurisdiction?: string; rule?: string; concern?: string }>
  unauthorizedPracticeOfLawRisks?: string[]
  conflictsAcrossJurisdictions?: string[]
  recommendedSteps?: string[]
  proHacViceConsiderations?: string[]
  notes?: string
}

export default function MultiJurisdictionCompliancePage() {
  const [matterDescription, setMatterDescription] = useState("")
  const [primaryJurisdiction, setPrimaryJurisdiction] = useState("")
  const [additionalJurisdictionsRaw, setAdditionalJurisdictionsRaw] = useState("")
  const [practiceArea, setPracticeArea] = useState("")
  const [clientLocationsRaw, setClientLocationsRaw] = useState("")
  const [servicesOfferedRaw, setServicesOfferedRaw] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean)

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/ai/multi-jurisdiction-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterDescription,
          primaryJurisdiction,
          additionalJurisdictions: splitCsv(additionalJurisdictionsRaw),
          practiceArea,
          clientLocations: splitCsv(clientLocationsRaw),
          servicesOffered: splitCsv(servicesOfferedRaw),
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
          <Globe className="h-7 w-7 text-primary" />
          Multi-Jurisdiction Compliance
        </h1>
        <p className="text-muted-foreground mt-1">
          Preliminary review of multi-jurisdictional practice issues for a matter. Not a substitute for ethics counsel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matter Inputs</CardTitle>
          <CardDescription>Describe the matter and the jurisdictions implicated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="matterDescription">Matter Description</Label>
            <Textarea
              id="matterDescription"
              value={matterDescription}
              onChange={(e) => setMatterDescription(e.target.value)}
              placeholder="Brief description of the matter, parties, and venue"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryJurisdiction">Primary Jurisdiction</Label>
              <Input
                id="primaryJurisdiction"
                value={primaryJurisdiction}
                onChange={(e) => setPrimaryJurisdiction(e.target.value)}
                placeholder="e.g., New York"
              />
            </div>
            <div>
              <Label htmlFor="additionalJurisdictions">Additional Jurisdictions (comma-separated)</Label>
              <Input
                id="additionalJurisdictions"
                value={additionalJurisdictionsRaw}
                onChange={(e) => setAdditionalJurisdictionsRaw(e.target.value)}
                placeholder="e.g., New Jersey, Connecticut"
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
              <Label htmlFor="clientLocations">Client Locations (comma-separated)</Label>
              <Input
                id="clientLocations"
                value={clientLocationsRaw}
                onChange={(e) => setClientLocationsRaw(e.target.value)}
                placeholder="e.g., NY, CA"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="servicesOffered">Services Offered (comma-separated)</Label>
            <Input
              id="servicesOffered"
              value={servicesOfferedRaw}
              onChange={(e) => setServicesOfferedRaw(e.target.value)}
              placeholder="e.g., advice, court appearances, transactional"
            />
          </div>
          <Button onClick={handleRun} disabled={loading || !matterDescription || !primaryJurisdiction}>
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Run Compliance Check</>
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
            <CardTitle>Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {Array.isArray(results.jurisdictionalIssues) && results.jurisdictionalIssues.length > 0 && (
              <div>
                <Label>Jurisdictional Issues</Label>
                <ul className="space-y-2 mt-2">
                  {results.jurisdictionalIssues.map((it, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{it.jurisdiction || 'unknown'}</Badge>
                        {it.severity && <Badge variant={it.severity === 'high' ? 'destructive' : 'outline'}>{it.severity}</Badge>}
                      </div>
                      {it.issue && <div className="mt-1">{it.issue}</div>}
                      {it.rule && <div className="text-muted-foreground text-xs mt-1">Rule: {it.rule}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.rulesOfProfessionalConductFlags) && results.rulesOfProfessionalConductFlags.length > 0 && (
              <div>
                <Label>Rules of Professional Conduct Flags</Label>
                <ul className="space-y-2 mt-2">
                  {results.rulesOfProfessionalConductFlags.map((f, i) => (
                    <li key={i} className="border rounded p-3">
                      <div><Badge variant="outline">{f.jurisdiction || 'unknown'}</Badge> {f.rule}</div>
                      {f.concern && <div className="mt-1">{f.concern}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.unauthorizedPracticeOfLawRisks) && results.unauthorizedPracticeOfLawRisks.length > 0 && (
              <div>
                <Label>UPL Risks</Label>
                <ul className="list-disc list-inside">{results.unauthorizedPracticeOfLawRisks.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.conflictsAcrossJurisdictions) && results.conflictsAcrossJurisdictions.length > 0 && (
              <div>
                <Label>Cross-Jurisdiction Conflicts</Label>
                <ul className="list-disc list-inside">{results.conflictsAcrossJurisdictions.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.recommendedSteps) && results.recommendedSteps.length > 0 && (
              <div>
                <Label>Recommended Steps</Label>
                <ul className="list-disc list-inside">{results.recommendedSteps.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.proHacViceConsiderations) && results.proHacViceConsiderations.length > 0 && (
              <div>
                <Label>Pro Hac Vice Considerations</Label>
                <ul className="list-disc list-inside">{results.proHacViceConsiderations.map((t, i) => <li key={i}>{t}</li>)}</ul>
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
