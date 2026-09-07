"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"
import { PageSkeleton } from "@/components/ui/skeleton"

interface Deadline {
  id: string
  title: string
  description?: string
  type: string
  priority: string
  status: string
  dueDate: string
  matter: { id: string; name: string; matterNumber: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FILING",
    priority: "MEDIUM",
    dueDate: "",
    matterId: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const status = statusFilter === "all" ? "" : statusFilter
        const priority = priorityFilter === "all" ? "" : priorityFilter
        const [deadlinesRes, mattersRes] = await Promise.all([
          fetch(`/api/deadlines?status=${status}&priority=${priority}`),
          fetch("/api/matters"),
        ])
        const [deadlinesData, mattersData] = await Promise.all([
          deadlinesRes.json(),
          mattersRes.json(),
        ])
        setDeadlines(deadlinesData)
        const mattersList = mattersData.data || mattersData
        setMatters(Array.isArray(mattersList) ? mattersList : [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [statusFilter, priorityFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          type: "FILING",
          priority: "MEDIUM",
          dueDate: "",
          matterId: "",
        })
        await refreshDeadlines()
      }
    } catch (error) {
      console.error("Failed to create deadline:", error)
    }
  }

  const markComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/deadlines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      })

      if (res.ok) {
        setDeadlines((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: "COMPLETED" } : d))
        )
      }
    } catch (error) {
      console.error("Failed to update deadline:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    }
    return colors[priority] || colors.MEDIUM
  }

  const getStatusIcon = (status: string) => {
    if (status === "COMPLETED") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <Clock className="h-5 w-5 text-gray-400" />
  }

  const getDaysUntil = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyClass = (dueDate: string, status: string) => {
    if (status === "COMPLETED") return ""
    const days = getDaysUntil(dueDate)
    if (days < 0) return "bg-red-50 border-red-200"
    if (days <= 3) return "bg-orange-50 border-orange-200"
    if (days <= 7) return "bg-yellow-50 border-yellow-200"
    return ""
  }

  const refreshDeadlines = async () => {
    const status = statusFilter === "all" ? "" : statusFilter
    const priority = priorityFilter === "all" ? "" : priorityFilter
    const deadlinesRes = await fetch(`/api/deadlines?status=${status}&priority=${priority}`)
    setDeadlines(await deadlinesRes.json())
  }

  const handleDeadlineClick = (deadline: Deadline) => {
    setSelectedDeadline(deadline)
    setDetailDialogOpen(true)
  }

  const handleEditClick = (deadline: Deadline) => {
    setSelectedDeadline(deadline)
    setFormData({
      title: deadline.title,
      description: deadline.description || "",
      type: deadline.type,
      priority: deadline.priority,
      dueDate: deadline.dueDate.split("T")[0],
      matterId: deadline.matter.id,
    })
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeadline) return
    try {
      const res = await fetch(`/api/deadlines/${selectedDeadline.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setEditDialogOpen(false)
        setSelectedDeadline(null)
        setFormData({
          title: "",
          description: "",
          type: "FILING",
          priority: "MEDIUM",
          dueDate: "",
          matterId: "",
        })
        await refreshDeadlines()
      }
    } catch (error) {
      console.error("Failed to update deadline:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/deadlines/${deleteId}`, { method: "DELETE" })
      setDeleteId(null)
      setDetailDialogOpen(false)
      await refreshDeadlines()
    } catch (error) {
      console.error("Failed to delete deadline:", error)
    }
  }

  const deadlineTypes = [
    { value: "FILING", label: "Filing" },
    { value: "RESPONSE", label: "Response" },
    { value: "DISCOVERY", label: "Discovery" },
    { value: "HEARING", label: "Hearing" },
    { value: "STATUTE_LIMITATIONS", label: "Statute of Limitations" },
    { value: "OTHER", label: "Other" },
  ]

  const priorities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ]

  if (loading) return <PageSkeleton />

  const overdue = deadlines.filter((d) => d.status !== "COMPLETED" && getDaysUntil(d.dueDate) < 0)
  const dueThisWeek = deadlines.filter(
    (d) => d.status !== "COMPLETED" && getDaysUntil(d.dueDate) >= 0 && getDaysUntil(d.dueDate) <= 7
  )
  const upcoming = deadlines.filter((d) => d.status !== "COMPLETED" && getDaysUntil(d.dueDate) > 7)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-muted-foreground">Track court deadlines and due dates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Deadline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Deadline</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Deadline title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deadlineTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Deadline</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={overdue.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${overdue.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdue.length > 0 ? "text-red-600" : ""}`}>
              {overdue.length}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card className={dueThisWeek.length > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <AlertCircle className={`h-4 w-4 ${dueThisWeek.length > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dueThisWeek.length > 0 ? "text-orange-600" : ""}`}>
              {dueThisWeek.length}
            </div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <p className="text-xs text-muted-foreground">More than 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deadlines.filter((d) => d.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines Table */}
      <Card>
        <CardContent className="p-0">
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No deadlines found</h3>
              <p className="text-muted-foreground mb-4">Create your first deadline</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Deadline
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadlines.map((deadline) => (
                  <TableRow
                    key={deadline.id}
                    className={`cursor-pointer hover:bg-slate-50 ${getUrgencyClass(deadline.dueDate, deadline.status)}`}
                    onClick={() => handleDeadlineClick(deadline)}
                  >
                    <TableCell>{getStatusIcon(deadline.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        {deadline.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {deadline.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deadline.matter.name}</p>
                        <p className="text-sm text-muted-foreground">{deadline.matter.matterNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deadline.type.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(deadline.dueDate)}</p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.status === "COMPLETED" ? (
                            <span className="text-green-600">Completed</span>
                          ) : getDaysUntil(deadline.dueDate) < 0 ? (
                            <span className="text-red-600">
                              {Math.abs(getDaysUntil(deadline.dueDate))} days overdue
                            </span>
                          ) : getDaysUntil(deadline.dueDate) === 0 ? (
                            <span className="text-orange-600">Due today</span>
                          ) : (
                            <span>{getDaysUntil(deadline.dueDate)} days left</span>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {deadline.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markComplete(deadline.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
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

      {/* Deadline Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDeadline && getStatusIcon(selectedDeadline.status)}
              {selectedDeadline?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDeadline && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(selectedDeadline.priority)}>
                  {selectedDeadline.priority}
                </Badge>
                <Badge variant="outline">{selectedDeadline.type.replace("_", " ")}</Badge>
                <Badge variant={selectedDeadline.status === "COMPLETED" ? "default" : "secondary"}>
                  {selectedDeadline.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedDeadline.dueDate)}
                    </p>
                    <p className="text-sm">
                      {selectedDeadline.status === "COMPLETED" ? (
                        <span className="text-green-600">Completed</span>
                      ) : getDaysUntil(selectedDeadline.dueDate) < 0 ? (
                        <span className="text-red-600">
                          {Math.abs(getDaysUntil(selectedDeadline.dueDate))} days overdue
                        </span>
                      ) : getDaysUntil(selectedDeadline.dueDate) === 0 ? (
                        <span className="text-orange-600">Due today</span>
                      ) : (
                        <span className="text-blue-600">{getDaysUntil(selectedDeadline.dueDate)} days left</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Related Matter</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDeadline.matter.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDeadline.matter.matterNumber}
                    </p>
                  </div>
                </div>

                {selectedDeadline.description && (
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedDeadline.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(selectedDeadline.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  {selectedDeadline.status !== "COMPLETED" && (
                    <Button
                      variant="default"
                      onClick={() => {
                        markComplete(selectedDeadline.id)
                        setDetailDialogOpen(false)
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleEditClick(selectedDeadline)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Deadline Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deadline</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Deadline title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deadlineTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details"
              />
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deadline?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deadline. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
