"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Plus,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckSquare,
} from "lucide-react"
import { formatDate, formatCurrency, formatHours, getStatusColor } from "@/lib/utils"

interface Matter {
  id: string
  matterNumber: string
  name: string
  description?: string
  status: string
  billingType: string
  flatFee?: number
  contingencyPct?: number
  budgetAmount?: number
  courtName?: string
  caseNumber?: string
  judgeName?: string
  jurisdiction?: string
  openDate: string
  client: { id: string; firstName?: string; lastName?: string; companyName?: string; type: string }
  practiceArea: { name: string; color: string }
  assignments: Array<{
    id: string
    role: string
    user: { id: string; firstName: string; lastName: string; role: string }
  }>
  timeEntries: Array<{
    id: string
    date: string
    hours: number
    amount: number
    description: string
    user: { firstName: string; lastName: string }
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    createdAt: string
    uploadedBy: { firstName: string; lastName: string }
  }>
  deadlines: Array<{
    id: string
    title: string
    dueDate: string
    priority: string
    status: string
  }>
  tasks: Array<{
    id: string
    title: string
    dueDate?: string
    priority: string
    status: string
    assignedTo?: { firstName: string; lastName: string }
  }>
  totals: {
    unbilledHours: number
    unbilledAmount: number
    billedAmount: number
    paidAmount: number
  }
  _count: { timeEntries: number; documents: number; invoices: number; deadlines: number }
}

export default function MatterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [matter, setMatter] = useState<Matter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatter() {
      try {
        const res = await fetch(`/api/matters/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setMatter(data)
        } else {
          router.push("/matters")
        }
      } catch (error) {
        console.error("Failed to fetch matter:", error)
        router.push("/matters")
      } finally {
        setLoading(false)
      }
    }

    fetchMatter()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (!matter) return null

  const clientName = matter.client
    ? (matter.client.type === "BUSINESS" || matter.client.type === "NONPROFIT"
      ? matter.client.companyName
      : `${matter.client.firstName} ${matter.client.lastName}`)
    : "No Client"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/matters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: matter.practiceArea.color + '20' }}>
              <Briefcase className="h-8 w-8" style={{ color: matter.practiceArea.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{matter.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">{matter.matterNumber}</span>
                <Badge className={getStatusColor(matter.status)}>{matter.status}</Badge>
                <Badge style={{ backgroundColor: matter.practiceArea.color }} className="text-white">
                  {matter.practiceArea.name}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href="/time-billing">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Time
            </Button>
          </Link>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer" onClick={() => router.push(`/clients/${matter.client.id}`)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{clientName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbilled Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(matter.totals.unbilledHours)}</div>
            <p className="text-sm text-muted-foreground">{formatCurrency(matter.totals.unbilledAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(matter.totals.billedAmount)}</div>
            <p className="text-sm text-muted-foreground">{formatCurrency(matter.totals.paidAmount)} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matter._count.documents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadlines</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{matter.deadlines.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time Entries ({matter._count.timeEntries})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({matter._count.documents})</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Matter Details */}
            <Card>
              <CardHeader>
                <CardTitle>Matter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matter.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p>{matter.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Billing Type</p>
                    <p>{matter.billingType.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Date</p>
                    <p>{formatDate(matter.openDate)}</p>
                  </div>
                </div>
                {matter.budgetAmount && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p>{formatCurrency(matter.budgetAmount)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Court Information */}
            {(matter.courtName || matter.caseNumber) && (
              <Card>
                <CardHeader>
                  <CardTitle>Court Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matter.courtName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Court</p>
                      <p>{matter.courtName}</p>
                    </div>
                  )}
                  {matter.caseNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Case Number</p>
                      <p>{matter.caseNumber}</p>
                    </div>
                  )}
                  {matter.judgeName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Judge</p>
                      <p>{matter.judgeName}</p>
                    </div>
                  )}
                  {matter.jurisdiction && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jurisdiction</p>
                      <p>{matter.jurisdiction}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Team */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matter.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                          {assignment.user.firstName[0]}{assignment.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{assignment.user.firstName} {assignment.user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{assignment.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Time Entries</CardTitle>
              <Link href="/time-billing">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matter.timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.user.firstName} {entry.user.lastName}</TableCell>
                      <TableCell className="text-right">{formatHours(entry.hours)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <Link href="/documents">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {matter.documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.documents.map((doc) => (
                      <TableRow key={doc.id} className="cursor-pointer" onClick={() => router.push(`/documents/${doc.id}`)}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                        <TableCell>{doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Deadlines</CardTitle>
              <Link href="/calendar/deadlines">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deadline
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {matter.deadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No pending deadlines</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.deadlines.map((deadline) => (
                      <TableRow key={deadline.id}>
                        <TableCell className="font-medium">{deadline.title}</TableCell>
                        <TableCell>{formatDate(deadline.dueDate)}</TableCell>
                        <TableCell><Badge className={getStatusColor(deadline.priority)}>{deadline.priority}</Badge></TableCell>
                        <TableCell><Badge className={getStatusColor(deadline.status)}>{deadline.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {matter.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No pending tasks</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matter.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : '-'}</TableCell>
                        <TableCell>{task.dueDate ? formatDate(task.dueDate) : '-'}</TableCell>
                        <TableCell><Badge className={getStatusColor(task.priority)}>{task.priority}</Badge></TableCell>
                        <TableCell><Badge className={getStatusColor(task.status)}>{task.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
