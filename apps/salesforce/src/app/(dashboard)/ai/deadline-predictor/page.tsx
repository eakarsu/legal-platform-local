"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"

interface PredictorResult {
  filingDeadline?: string
  statuteOfLimitations?: string
  criticalDates?: Array<{ date: string; description: string; priority?: string }>
  warnings?: string[]
  recommendations?: string[]
  notes?: string
  raw?: string
}

export default function DeadlinePredictorPage() {
  const [matterType, setMatterType] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [incidentDate, setIncidentDate] = useState("")
  const [keyEvents, setKeyEvents] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PredictorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/ai/deadline-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterType, jurisdiction, incidentDate, keyEvents }),
      })
      const data = await res.json()
      if (!res.ok) {
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
          <CalendarClock className="h-7 w-7 text-primary" />
          Deadline Predictor
        </h1>
        <p className="text-muted-foreground mt-1">
          Predict filing deadlines, statutes of limitations, and critical dates for a matter.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matter Details</CardTitle>
          <CardDescription>Provide the matter type, jurisdiction, and incident details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matterType">Matter Type</Label>
              <Input
                id="matterType"
                value={matterType}
                onChange={(e) => setMatterType(e.target.value)}
                placeholder="e.g., personal injury, breach of contract, employment"
              />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g., California, Federal, NY"
              />
            </div>
            <div>
              <Label htmlFor="incidentDate">Incident / Trigger Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="keyEvents">Key Events / Procedural Posture</Label>
            <Textarea
              id="keyEvents"
              value={keyEvents}
              onChange={(e) => setKeyEvents(e.target.value)}
              placeholder="e.g., complaint filed 2026-03-15, motion to dismiss pending, discovery cutoff..."
              rows={5}
            />
          </div>
          <Button onClick={handlePredict} disabled={loading || !matterType || !jurisdiction || !incidentDate}>
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Predicting...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Predict Deadlines</>
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
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {results.statuteOfLimitations && (
              <div>
                <Label>Statute of Limitations</Label>
                <div className="font-medium">{results.statuteOfLimitations}</div>
              </div>
            )}
            {results.filingDeadline && (
              <div>
                <Label>Filing Deadline</Label>
                <div className="font-medium">{results.filingDeadline}</div>
              </div>
            )}
            {Array.isArray(results.criticalDates) && results.criticalDates.length > 0 && (
              <div>
                <Label>Critical Dates</Label>
                <ul className="space-y-2 mt-2">
                  {results.criticalDates.map((d, i) => (
                    <li key={i} className="border rounded p-3 flex items-start gap-2">
                      <CalendarClock className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <div className="font-medium">{d.date}</div>
                        <div className="text-muted-foreground">{d.description}</div>
                        {d.priority && <Badge variant="outline" className="mt-1">{d.priority}</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.warnings) && results.warnings.length > 0 && (
              <div>
                <Label>Warnings</Label>
                <ul className="list-disc list-inside text-amber-700">
                  {results.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(results.recommendations) && results.recommendations.length > 0 && (
              <div>
                <Label>Recommendations</Label>
                <ul className="list-disc list-inside">
                  {results.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
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
