"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  Sparkles,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
  Plus,
  Database,
  CheckCircle,
  Video,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"

interface SuggestedEntry {
  id: string
  source: string
  sourceIcon: "calendar" | "email" | "phone" | "video" | "chat"
  date: string
  hours: number
  description: string
  matterId?: string
  matterName?: string
  confidence: number
  selected: boolean
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

const sampleSuggestions: SuggestedEntry[] = [
  {
    id: "1",
    source: "calendar",
    sourceIcon: "calendar",
    date: new Date().toISOString(),
    hours: 1.5,
    description: "Client meeting with Robert Anderson to discuss divorce proceedings and custody arrangements. Reviewed property division documents.",
    matterName: "Anderson Divorce",
    confidence: 95,
    selected: true,
  },
  {
    id: "2",
    source: "email",
    sourceIcon: "email",
    date: new Date(Date.now() - 86400000).toISOString(),
    hours: 0.5,
    description: "Email correspondence with opposing counsel Thomas Reynolds regarding settlement proposal and discovery timeline.",
    matterName: "Anderson Divorce",
    confidence: 85,
    selected: true,
  },
  {
    id: "3",
    source: "video",
    sourceIcon: "video",
    date: new Date(Date.now() - 86400000).toISOString(),
    hours: 2.0,
    description: "Video conference with Tech Innovations team to review Series A financing documents and discuss term sheet revisions.",
    matterName: "Tech Innovations - Series A Financing",
    confidence: 92,
    selected: true,
  },
  {
    id: "4",
    source: "phone",
    sourceIcon: "phone",
    date: new Date(Date.now() - 172800000).toISOString(),
    hours: 0.75,
    description: "Phone call with James Wilson regarding personal injury case status and medical records review.",
    matterName: "Wilson v. Metro Transit",
    confidence: 78,
    selected: true,
  },
  {
    id: "5",
    source: "email",
    sourceIcon: "email",
    date: new Date(Date.now() - 172800000).toISOString(),
    hours: 1.0,
    description: "Drafted and sent demand letter to XYZ Distribution regarding breach of contract claims.",
    matterName: "Manhattan Properties - Commercial Lease Dispute",
    confidence: 88,
    selected: true,
  },
  {
    id: "6",
    source: "calendar",
    sourceIcon: "calendar",
    date: new Date(Date.now() - 259200000).toISOString(),
    hours: 3.0,
    description: "Court appearance for motion hearing. Presented arguments on motion to dismiss and responded to opposing counsel's objections.",
    matterName: "Wilson v. Metro Transit",
    confidence: 98,
    selected: true,
  },
  {
    id: "7",
    source: "chat",
    sourceIcon: "chat",
    date: new Date(Date.now() - 259200000).toISOString(),
    hours: 0.25,
    description: "Internal team message discussion regarding case strategy and upcoming deadlines.",
    matterName: "Garcia Custody Modification",
    confidence: 65,
    selected: false,
  },
]

export default function TimeCaptureAIPage() {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    async function fetchMatters() {
      try {
        const res = await fetch("/api/matters")
        const data = await res.json()
        setMatters(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch matters:", error)
        setMatters([])
      }
    }
    fetchMatters()
  }, [])

  const loadSampleData = () => {
    // Map sample suggestions to include matter IDs from available matters
    const mappedSuggestions = sampleSuggestions.map((s, index) => ({
      ...s,
      matterId: matters.length > 0 ? matters[index % matters.length]?.id : undefined,
    }))
    setSuggestions(mappedSuggestions)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/capture-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateRange),
      })

      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions.map((s: SuggestedEntry) => ({ ...s, selected: true })))
      }
    } catch (error) {
      console.error("Failed to analyze:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    )
  }

  const updateSuggestion = (id: string, field: string, value: unknown) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleSaveSelected = async () => {
    const selected = suggestions.filter((s) => s.selected && s.matterId)
    if (selected.length === 0) return

    setLoading(true)
    try {
      for (const entry of selected) {
        await fetch("/api/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matterId: entry.matterId,
            date: entry.date,
            hours: entry.hours.toString(),
            description: entry.description,
            billable: true,
          }),
        })
      }
      // Clear saved entries
      setSuggestions((prev) => prev.filter((s) => !s.selected))
    } catch (error) {
      console.error("Failed to save entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "calendar":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "email":
        return <Mail className="h-4 w-4 text-green-500" />
      case "phone":
        return <Phone className="h-4 w-4 text-purple-500" />
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "chat":
        return <MessageSquare className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 border-green-300"
    if (confidence >= 75) return "bg-blue-100 text-blue-800 border-blue-300"
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-orange-100 text-orange-800 border-orange-300"
  }

  const selectedCount = suggestions.filter((s) => s.selected).length
  const totalHours = suggestions
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + s.hours, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Time Capture</h1>
          <p className="text-muted-foreground">
            Automatically capture time from your calendar, emails, and calls
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Sample Data Button */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-cyan-700">
              <Database className="h-5 w-5" />
              <span className="font-medium">Demo Mode:</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="bg-white hover:bg-cyan-50"
            >
              <Clock className="h-4 w-4 mr-1" />
              Load Sample Time Entries
            </Button>
            <span className="text-sm text-cyan-600">
              (Simulates captured activities from calendar, email, and calls)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Analyze Activity
          </CardTitle>
          <CardDescription>
            Select a date range to analyze your activity and generate time entry suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Activity
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <>
          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Selected Entries</p>
                    <p className="text-3xl font-bold text-green-700">{selectedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Total Hours</p>
                    <p className="text-3xl font-bold text-green-700">{totalHours.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Sources</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        Calendar
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        <Phone className="h-3 w-3 mr-1" />
                        Calls
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSaveSelected}
                  disabled={loading || selectedCount === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Save {selectedCount} Entries
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Entry List */}
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className={`transition-all ${
                  suggestion.selected
                    ? "border-primary shadow-sm"
                    : "opacity-60 border-gray-200"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={suggestion.selected}
                      onCheckedChange={() => toggleSelection(suggestion.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                            {getSourceIcon(suggestion.source)}
                            <span className="text-sm font-medium capitalize">
                              {suggestion.source}
                            </span>
                          </div>
                          <Badge className={getConfidenceColor(suggestion.confidence)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {suggestion.confidence}% match
                          </Badge>
                          {suggestion.matterName && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {suggestion.matterName}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          {new Date(suggestion.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Matter</Label>
                          <Select
                            value={suggestion.matterId}
                            onValueChange={(value) =>
                              updateSuggestion(suggestion.id, "matterId", value)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select matter" />
                            </SelectTrigger>
                            <SelectContent>
                              {matters.map((matter) => (
                                <SelectItem key={matter.id} value={matter.id}>
                                  {matter.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Hours</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={suggestion.hours}
                            onChange={(e) =>
                              updateSuggestion(
                                suggestion.id,
                                "hours",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Date</Label>
                          <Input
                            type="date"
                            value={suggestion.date.split("T")[0]}
                            onChange={(e) =>
                              updateSuggestion(suggestion.id, "date", e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          value={suggestion.description}
                          onChange={(e) =>
                            updateSuggestion(suggestion.id, "description", e.target.value)
                          }
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {suggestions.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 p-6 mb-4">
              <Clock className="h-12 w-12 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Select a date range and click "Analyze Activity" to find potential time entries, or load sample data to see how it works
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                Calendar
              </Badge>
              <Badge variant="secondary">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Badge>
              <Badge variant="secondary">
                <Phone className="h-3 w-3 mr-1" />
                Calls
              </Badge>
              <Badge variant="secondary">
                <Video className="h-3 w-3 mr-1" />
                Video Calls
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Important Note</p>
              <p className="text-sm text-amber-700 mt-1">
                AI-suggested time entries are based on your calendar events, email activity, and call logs.
                Always review and adjust the matter assignment, hours, and descriptions before saving.
                Time capture requires integration with your calendar and email services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
