"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Search, Briefcase, Trash2, Pencil, Download } from "lucide-react"
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
import { getStatusColor } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { SortHeader } from "@/components/ui/sort-header"
import { BulkActions } from "@/components/ui/bulk-actions"
import { PageSkeleton } from "@/components/ui/skeleton"

interface Matter {
  id: string
  matterNumber: string
  name: string
  status: string
  billingType: string
  client: {
    firstName?: string
    lastName?: string
    companyName?: string
    type: string
  }
  practiceArea: { name: string; color: string }
  assignments: Array<{ user: { firstName: string; lastName: string } }>
  _count: { timeEntries: number; documents: number; deadlines: number }
}

interface PracticeArea {
  id: string
  name: string
  color: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function MattersPage() {
  const router = useRouter()
  const [matters, setMatters] = useState<Matter[]>([])
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/matters/${deleteId}`, { method: "DELETE" })
      setMatters(matters.filter(m => m.id !== deleteId))
    } catch (error) {
      console.error("Failed to delete matter:", error)
    } finally {
      setDeleteId(null)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const status = statusFilter === "all" ? "" : statusFilter
        const practiceAreaId = practiceAreaFilter === "all" ? "" : practiceAreaFilter
        const params = new URLSearchParams({
          search,
          status,
          practiceAreaId,
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder,
        })
        const [mattersRes, paRes] = await Promise.all([
          fetch(`/api/matters?${params}`),
          fetch("/api/practice-areas"),
        ])
        const [mattersData, paData] = await Promise.all([
          mattersRes.json(),
          paRes.json(),
        ])
        setMatters(mattersData.data || mattersData)
        setPagination(mattersData.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 })
        setPracticeAreas(paData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, statusFilter, practiceAreaFilter, page, limit, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const handleBulkDelete = async () => {
    try {
      await fetch("/api/matters/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setSelectedIds(new Set())
      setLoading(true)
      // Trigger refetch
      setPage(page)
    } catch (error) {
      console.error("Failed to bulk delete:", error)
    } finally {
      setBulkDeleteOpen(false)
    }
  }

  const handleExport = () => {
    window.location.href = "/api/matters/export"
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === matters.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(matters.map(m => m.id)))
    }
  }

  const getClientName = (client?: Matter["client"]) => {
    if (!client) return "No Client"
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matters</h1>
          <p className="text-muted-foreground">Manage your legal matters and cases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/matters/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

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
                  placeholder="Search matters..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={practiceAreaFilter} onValueChange={(v) => { setPracticeAreaFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Practice Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practice Areas</SelectItem>
                {practiceAreas.map((pa) => (
                  <SelectItem key={pa.id} value={pa.id}>
                    {pa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matters Table */}
      <Card>
        <CardContent className="p-0">
          {matters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No matters found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first matter
              </p>
              <Link href="/matters/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Matter
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.size === matters.length && matters.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Matter" field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Client</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <SortHeader label="Billing" field="billingType" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Team</TableHead>
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matters.map((matter) => (
                    <TableRow
                      key={matter.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => router.push(`/matters/${matter.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(matter.id)}
                          onCheckedChange={() => toggleSelect(matter.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: matter.practiceArea.color + '20' }}>
                            <Briefcase className="h-5 w-5" style={{ color: matter.practiceArea.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{matter.name}</p>
                            <p className="text-sm text-muted-foreground">{matter.matterNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getClientName(matter.client)}</TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: matter.practiceArea.color }} className="text-white">
                          {matter.practiceArea.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{matter.billingType.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {matter.assignments.slice(0, 3).map((assignment, i) => (
                            <div
                              key={i}
                              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                              title={`${assignment.user.firstName} ${assignment.user.lastName}`}
                            >
                              {assignment.user.firstName[0]}{assignment.user.lastName[0]}
                            </div>
                          ))}
                          {matter.assignments.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                              +{matter.assignments.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(matter.status)}>{matter.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/matters/${matter.id}/edit`)
                            }}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteId(matter.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1) }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Matter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the matter. You can restore it later from the archived matters list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedIds.size} Matters?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected matters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Archive All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
