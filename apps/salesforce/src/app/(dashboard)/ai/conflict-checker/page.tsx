"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Sparkles, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react"

interface ConflictResult {
  hasConflict?: boolean
  conflictLevel?: "none" | "low" | "medium" | "high" | string
  conflicts?: Array<{
    party?: string
    matter?: string
    type?: string
    description?: string
    severity?: string
  }>
  recommendations?: string[]
  notes?: string
}

export default function ConflictCheckerPage() {
  const [proposedClient, setProposedClient] = useState("")
  const [proposedMatter, setProposedMatter] = useState("")
  const [adverseParties, setAdverseParties] = useState("")
  const [existingClients, setExistingClients] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ConflictResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const adverseList = adverseParties.split("\n").map((s) => s.trim()).filter(Boolean)
      const existingList = existingClients.split("\n").map((s) => s.trim()).filter(Boolean)
      const res = await fetch("/api/ai/conflict-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedClient,
          proposedMatter,
          adverseParties: adverseList,
          existingClients: existingList,
        }),
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

  const conflictBadge = (level?: string) => {
    if (!level) return null
    const variant: Record<string, string> = {
      none: "bg-green-100 text-green-800",
      low: "bg-yellow-100 text-yellow-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    }
    return <Badge className={variant[level.toLowerCase()] || ""}>{level}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          Conflict Checker
        </h1>
        <p className="text-muted-foreground mt-1">
          Detect adverse-party conflicts before accepting a new matter.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Matter</CardTitle>
          <CardDescription>Describe the prospective client and any known adverse parties.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proposedClient">Prospective Client</Label>
              <Input
                id="proposedClient"
                value={proposedClient}
                onChange={(e) => setProposedClient(e.target.value)}
                placeholder="e.g., Acme Corp, Jane Doe"
              />
            </div>
            <div>
              <Label htmlFor="proposedMatter">Matter Description</Label>
              <Input
                id="proposedMatter"
                value={proposedMatter}
                onChange={(e) => setProposedMatter(e.target.value)}
                placeholder="e.g., contract dispute with XYZ Inc."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="adverseParties">Adverse Parties (one per line)</Label>
            <Textarea
              id="adverseParties"
              value={adverseParties}
              onChange={(e) => setAdverseParties(e.target.value)}
              placeholder="XYZ Inc.\nJohn Smith"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="existingClients">Existing Clients to Check Against (one per line, optional)</Label>
            <Textarea
              id="existingClients"
              value={existingClients}
              onChange={(e) => setExistingClients(e.target.value)}
              placeholder="XYZ Inc.\nABC Industries\nFirst National Bank"
              rows={5}
            />
          </div>
          <Button onClick={handleCheck} disabled={loading || !proposedClient}>
            {loading ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Check Conflicts</>
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
              {results.hasConflict ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Conflict Check Result
              {results.conflictLevel && conflictBadge(results.conflictLevel)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {Array.isArray(results.conflicts) && results.conflicts.length > 0 && (
              <div>
                <Label>Detected Conflicts</Label>
                <ul className="space-y-2 mt-2">
                  {results.conflicts.map((c, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="font-medium">{c.party || c.matter || `Conflict ${i + 1}`}</div>
                      {c.type && <Badge variant="outline" className="mt-1 mr-1">{c.type}</Badge>}
                      {c.severity && conflictBadge(c.severity)}
                      {c.description && <div className="text-muted-foreground mt-1">{c.description}</div>}
                    </li>
                  ))}
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
