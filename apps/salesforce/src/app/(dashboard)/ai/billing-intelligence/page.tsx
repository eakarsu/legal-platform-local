"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"

interface BillingResult {
  realizationRatePercent?: number | null
  collectionRatePercent?: number | null
  trends?: string[]
  riskFlags?: Array<{ flag?: string; severity?: string; recommendation?: string }>
  topOpportunities?: string[]
  matterLevelInsights?: Array<{ matterId?: string; insight?: string }>
  recommendations?: string[]
  summary?: string
}

export default function BillingIntelligencePage() {
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [totalHoursTracked, setTotalHoursTracked] = useState("")
  const [totalHoursBilled, setTotalHoursBilled] = useState("")
  const [totalBilled, setTotalBilled] = useState("")
  const [totalCollected, setTotalCollected] = useState("")
  const [averageHourlyRate, setAverageHourlyRate] = useState("")
  const [outstandingARDays, setOutstandingARDays] = useState("")
  const [byMatterRaw, setByMatterRaw] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BillingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const numOrUndef = (v: string) => (v.trim() === "" ? undefined : Number(v))

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      let byMatter: Array<{ matterId: string; matterName?: string; hours?: number; billed?: number; writeDownPercent?: number }> = []
      if (byMatterRaw.trim()) {
        try {
          const parsed = JSON.parse(byMatterRaw)
          if (Array.isArray(parsed)) byMatter = parsed
        } catch {
          // ignore parse error; backend will still run with empty array
        }
      }

      const res = await fetch("/api/ai/billing-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          totalHoursTracked: numOrUndef(totalHoursTracked),
          totalHoursBilled: numOrUndef(totalHoursBilled),
          totalBilled: numOrUndef(totalBilled),
          totalCollected: numOrUndef(totalCollected),
          averageHourlyRate: numOrUndef(averageHourlyRate),
          outstandingARDays: numOrUndef(outstandingARDays),
          byMatter,
          notes: notes || undefined,
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
          <DollarSign className="h-7 w-7 text-primary" />
          Billing Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">
          Trend, realization, and collection insights from billing data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Inputs</CardTitle>
          <CardDescription>All fields are optional; the more data, the better the insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodStart">Period Start</Label>
              <Input id="periodStart" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="periodEnd">Period End</Label>
              <Input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="totalHoursTracked">Total Hours Tracked</Label>
              <Input id="totalHoursTracked" type="number" value={totalHoursTracked} onChange={(e) => setTotalHoursTracked(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="totalHoursBilled">Total Hours Billed</Label>
              <Input id="totalHoursBilled" type="number" value={totalHoursBilled} onChange={(e) => setTotalHoursBilled(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="totalBilled">Total Billed (USD)</Label>
              <Input id="totalBilled" type="number" value={totalBilled} onChange={(e) => setTotalBilled(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="totalCollected">Total Collected (USD)</Label>
              <Input id="totalCollected" type="number" value={totalCollected} onChange={(e) => setTotalCollected(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="averageHourlyRate">Average Hourly Rate (USD)</Label>
              <Input id="averageHourlyRate" type="number" value={averageHourlyRate} onChange={(e) => setAverageHourlyRate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="outstandingARDays">Outstanding A/R Days</Label>
              <Input id="outstandingARDays" type="number" value={outstandingARDays} onChange={(e) => setOutstandingARDays(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="byMatter">By-Matter Detail (JSON array, optional)</Label>
            <Textarea
              id="byMatter"
              value={byMatterRaw}
              onChange={(e) => setByMatterRaw(e.target.value)}
              placeholder='[{"matterId":"M-001","matterName":"Acme v. Doe","hours":42,"billed":12600,"writeDownPercent":8}]'
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="notes">Context Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything else relevant to interpretation" />
          </div>
          <Button onClick={handleRun} disabled={loading}>
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Run Billing Intelligence</>
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
              Findings
              {results.realizationRatePercent != null && <Badge variant="outline">Realization {results.realizationRatePercent}%</Badge>}
              {results.collectionRatePercent != null && <Badge variant="outline">Collection {results.collectionRatePercent}%</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {results.summary && <p>{results.summary}</p>}
            {Array.isArray(results.trends) && results.trends.length > 0 && (
              <div>
                <Label>Trends</Label>
                <ul className="list-disc list-inside">{results.trends.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.riskFlags) && results.riskFlags.length > 0 && (
              <div>
                <Label>Risk Flags</Label>
                <ul className="space-y-2 mt-2">
                  {results.riskFlags.map((r, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="flex items-center gap-2">
                        {r.severity && <Badge variant={r.severity === 'high' ? 'destructive' : 'outline'}>{r.severity}</Badge>}
                        <span className="font-medium">{r.flag}</span>
                      </div>
                      {r.recommendation && <div className="text-muted-foreground mt-1">{r.recommendation}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.topOpportunities) && results.topOpportunities.length > 0 && (
              <div>
                <Label>Top Opportunities</Label>
                <ul className="list-disc list-inside">{results.topOpportunities.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
            {Array.isArray(results.matterLevelInsights) && results.matterLevelInsights.length > 0 && (
              <div>
                <Label>Matter-Level Insights</Label>
                <ul className="space-y-2 mt-2">
                  {results.matterLevelInsights.map((m, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="font-medium">{m.matterId}</div>
                      {m.insight && <div className="text-muted-foreground mt-1">{m.insight}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(results.recommendations) && results.recommendations.length > 0 && (
              <div>
                <Label>Recommendations</Label>
                <ul className="list-disc list-inside">{results.recommendations.map((t, i) => <li key={i}>{t}</li>)}</ul>
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
