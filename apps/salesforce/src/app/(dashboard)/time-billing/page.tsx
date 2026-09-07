"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Clock, Play, Square, DollarSign, Calendar, User, FileText, Edit, Trash2, Download } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PageSkeleton } from "@/components/ui/skeleton"

interface TimeEntry {
  id: string
  date: string
  hours: number
  amount: number
  description: string
  billable: boolean
  billed: boolean
  matter: { id: string; name: string; matterNumber: string }
  user: { firstName: string; lastName: string }
  activityCode?: { code: string; name: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface ActivityCode {
  id: string
  code: string
  name: string
}

export default function TimeBillingPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [matterFilter, setMatterFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [editFormData, setEditFormData] = useState({
    matterId: "",
    date: "",
    hours: "",
    description: "",
    activityCodeId: "",
    billable: true,
  })

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerMatterId, setTimerMatterId] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    matterId: "",
    date: new Date().toISOString().split("T")[0],
    hours: "",
    description: "",
    activityCodeId: "",
    billable: true,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, mattersRes, codesRes] = await Promise.all([
          fetch(`/api/time-entries?search=${search}&matterId=${matterFilter}&date=${dateFilter}`),
          fetch("/api/matters"),
          fetch("/api/activity-codes"),
        ])
        const [entriesData, mattersData, codesData] = await Promise.all([
          entriesRes.json(),
          mattersRes.json(),
          codesRes.json(),
        ])
        setEntries(Array.isArray(entriesData) ? entriesData : [])
        const mattersList = mattersData.data || mattersData
        setMatters(Array.isArray(mattersList) ? mattersList : [])
        setActivityCodes(Array.isArray(codesData) ? codesData : [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, matterFilter, dateFilter])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startTimer = (matterId: string) => {
    setTimerMatterId(matterId)
    setTimerSeconds(0)
    setTimerRunning(true)
  }

  const stopTimer = () => {
    setTimerRunning(false)
    const hours = (timerSeconds / 3600).toFixed(2)
    setFormData((prev) => ({
      ...prev,
      matterId: timerMatterId,
      hours: hours,
    }))
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          matterId: "",
          date: new Date().toISOString().split("T")[0],
          hours: "",
          description: "",
          activityCodeId: "",
          billable: true,
        })
        setTimerSeconds(0)
        setTimerMatterId("")
        // Refresh entries
        const entriesRes = await fetch(`/api/time-entries?search=${search}&matterId=${matterFilter}&date=${dateFilter}`)
        setEntries(await entriesRes.json())
      }
    } catch (error) {
      console.error("Failed to create time entry:", error)
    }
  }

  if (loading) return <PageSkeleton />

  const totals = entries.reduce(
    (acc, entry) => {
      const hours = Number(entry.hours) || 0
      const amount = Number(entry.amount) || 0
      return {
        hours: acc.hours + hours,
        amount: acc.amount + amount,
        billableHours: acc.billableHours + (entry.billable ? hours : 0),
        billableAmount: acc.billableAmount + (entry.billable ? amount : 0),
      }
    },
    { hours: 0, amount: 0, billableHours: 0, billableAmount: 0 }
  )

  const handleEntryClick = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setDetailDialogOpen(true)
  }

  const handleEditClick = () => {
    if (!selectedEntry) return
    setEditFormData({
      matterId: selectedEntry.matter.id,
      date: selectedEntry.date.split("T")[0],
      hours: String(selectedEntry.hours),
      description: selectedEntry.description,
      activityCodeId: selectedEntry.activityCode?.code || "",
      billable: selectedEntry.billable,
    })
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEntry) return
    try {
      const res = await fetch(`/api/time-entries/${selectedEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        setEditDialogOpen(false)
        // Refresh entries
        const entriesRes = await fetch(`/api/time-entries?search=${search}&matterId=${matterFilter}&date=${dateFilter}`)
        setEntries(await entriesRes.json())
      }
    } catch (error) {
      console.error("Failed to update time entry:", error)
    }
  }

  const handleDeleteClick = async () => {
    if (!selectedEntry) return
    if (!confirm("Are you sure you want to delete this time entry?")) return
    try {
      const res = await fetch(`/api/time-entries/${selectedEntry.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDetailDialogOpen(false)
        // Refresh entries
        const entriesRes = await fetch(`/api/time-entries?search=${search}&matterId=${matterFilter}&date=${dateFilter}`)
        setEntries(await entriesRes.json())
      }
    } catch (error) {
      console.error("Failed to delete time entry:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time & Billing</h1>
          <p className="text-muted-foreground">Track time and manage billing entries</p>
        </div>
        <div className="flex items-center gap-2">
          {timerRunning && (
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="font-mono text-lg">{formatTime(timerSeconds)}</span>
              <Button size="sm" variant="ghost" onClick={stopTimer}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={() => window.location.href = "/api/time-entries/export"}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Matter *</Label>
                  <Select
                    value={formData.matterId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, matterId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select matter" />
                    </SelectTrigger>
                    <SelectContent>
                      {matters.map((matter) => (
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.name} ({matter.matterNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.hours}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hours: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activity Code</Label>
                  <Select
                    value={formData.activityCodeId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, activityCodeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityCodes.map((code) => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.code} - {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the work performed..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billable"
                    checked={formData.billable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, billable: checked as boolean }))}
                  />
                  <Label htmlFor="billable">Billable</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Entry</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.hours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Billable: {totals.billableHours.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.amount)}</div>
            <p className="text-xs text-muted-foreground">Billable: {formatCurrency(totals.billableAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.hours > 0 ? formatCurrency(totals.amount / totals.hours) : "$0"}/hr
            </div>
            <p className="text-xs text-muted-foreground">Effective rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search descriptions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={matterFilter} onValueChange={setMatterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Matters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matters</SelectItem>
                {matters.map((matter) => (
                  <SelectItem key={matter.id} value={matter.id}>
                    {matter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Clock className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No time entries found</h3>
              <p className="text-muted-foreground mb-4">Start tracking time on your matters</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.matter.name}</p>
                        <p className="text-sm text-muted-foreground">{entry.matter.matterNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                    <TableCell>
                      {entry.activityCode && (
                        <Badge variant="outline">{entry.activityCode.code}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">{(Number(entry.hours) || 0).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {entry.billable ? (
                          <Badge className="bg-green-100 text-green-800">Billable</Badge>
                        ) : (
                          <Badge variant="secondary">Non-billable</Badge>
                        )}
                        {entry.billed && <Badge className="bg-blue-100 text-blue-800">Billed</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!timerRunning && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            startTimer(entry.matter.id)
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Time Entry Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Time Entry Details
            </DialogTitle>
            <DialogDescription>
              {selectedEntry && new Date(selectedEntry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              {/* Matter Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Matter</span>
                </div>
                <p className="text-lg font-semibold">{selectedEntry.matter.name}</p>
                <p className="text-sm text-blue-700">{selectedEntry.matter.matterNumber}</p>
              </div>

              {/* Time & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {(Number(selectedEntry.hours) || 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(selectedEntry.amount)}
                  </p>
                </div>
              </div>

              {/* Recorded By */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recorded By</p>
                  <p className="font-medium">
                    {selectedEntry.user.firstName} {selectedEntry.user.lastName}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedEntry.description}
                </p>
              </div>

              {/* Activity Code & Status */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedEntry.activityCode && (
                  <Badge variant="outline" className="text-sm">
                    {selectedEntry.activityCode.code} - {selectedEntry.activityCode.name}
                  </Badge>
                )}
                {selectedEntry.billable ? (
                  <Badge className="bg-green-100 text-green-800">Billable</Badge>
                ) : (
                  <Badge variant="secondary">Non-billable</Badge>
                )}
                {selectedEntry.billed && (
                  <Badge className="bg-blue-100 text-blue-800">Billed</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDeleteClick}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Time Entry Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Update the time entry details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Matter *</Label>
              <Select
                value={editFormData.matterId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, matterId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select matter" />
                </SelectTrigger>
                <SelectContent>
                  {matters.map((matter) => (
                    <SelectItem key={matter.id} value={matter.id}>
                      {matter.name} ({matter.matterNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Hours *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={editFormData.hours}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, hours: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Code</Label>
              <Select
                value={editFormData.activityCodeId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, activityCodeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityCodes.map((code) => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.code} - {code.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the work performed..."
                value={editFormData.description}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-billable"
                checked={editFormData.billable}
                onCheckedChange={(checked) => setEditFormData((prev) => ({ ...prev, billable: checked as boolean }))}
              />
              <Label htmlFor="edit-billable">Billable</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
