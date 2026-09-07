"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'

interface Deadline {
  id: string
  title: string
  description: string | null
  deadlineType: string
  dueDate: string
  status: string
  reminderDays: number
  completedAt: string | null
  matter: {
    id: string
    name: string
    matterNumber: string
    client: {
      firstName: string | null
      lastName: string | null
      companyName: string | null
    }
  }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

const deadlineTypes = [
  { value: 'FILING', label: 'Filing' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'DISCOVERY', label: 'Discovery' },
  { value: 'MOTION', label: 'Motion' },
  { value: 'STATUTE_OF_LIMITATIONS', label: 'Statute of Limitations' },
  { value: 'APPEAL', label: 'Appeal' },
  { value: 'COURT_DATE', label: 'Court Date' },
  { value: 'OTHER', label: 'Other' }
]

const statuses = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'EXTENDED', label: 'Extended' },
  { value: 'MISSED', label: 'Missed' }
]

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 25, totalPages: 1 })

  // Sort state
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'danger',
    onConfirm: () => {}
  })

  const [formData, setFormData] = useState({
    matterId: '',
    title: '',
    description: '',
    deadlineType: 'FILING',
    dueDate: '',
    reminderDays: '7'
  })

  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null)

  const fetchDeadlines = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/deadlines?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDeadlines(data.deadlines)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch deadlines:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchDeadlines()
  }, [fetchDeadlines])

  useEffect(() => {
    fetchMatters()
  }, [])

  const fetchMatters = async () => {
    try {
      const res = await fetch('/api/matters')
      if (res.ok) {
        const data = await res.json()
        setMatters(data.matters)
      }
    } catch (error) {
      console.error('Failed to fetch matters:', error)
    }
  }

  const handleCreateDeadline = async () => {
    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reminderDays: parseInt(formData.reminderDays)
        })
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          matterId: '',
          title: '',
          description: '',
          deadlineType: 'FILING',
          dueDate: '',
          reminderDays: '7'
        })
        fetchDeadlines()
      }
    } catch (error) {
      console.error('Failed to create deadline:', error)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/deadlines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchDeadlines()
      }
    } catch (error) {
      console.error('Failed to update deadline:', error)
    }
  }

  const handleUpdateDeadline = async () => {
    if (!editingDeadline) return

    try {
      const res = await fetch(`/api/deadlines/${editingDeadline.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reminderDays: parseInt(formData.reminderDays)
        })
      })

      if (res.ok) {
        setDialogOpen(false)
        setEditingDeadline(null)
        resetForm()
        fetchDeadlines()
      }
    } catch (error) {
      console.error('Failed to update deadline:', error)
    }
  }

  const handleDeleteDeadline = async (id: string) => {
    try {
      const res = await fetch(`/api/deadlines/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchDeadlines()
      }
    } catch (error) {
      console.error('Failed to delete deadline:', error)
    }
  }

  const confirmDeleteDeadline = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Deadline',
      description: 'Are you sure you want to delete this deadline? This action cannot be undone.',
      variant: 'danger',
      onConfirm: () => {
        handleDeleteDeadline(id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    setConfirmDialog({
      open: true,
      title: 'Delete Selected Deadlines',
      description: `Are you sure you want to delete ${selectedIds.size} selected deadline(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        const promises = Array.from(selectedIds).map(id =>
          fetch(`/api/deadlines/${id}`, { method: 'DELETE' })
        )
        await Promise.all(promises)
        setSelectedIds(new Set())
        fetchDeadlines()
      }
    })
  }

  const handleBulkStatusUpdate = (newStatus: string) => {
    if (selectedIds.size === 0) return
    setConfirmDialog({
      open: true,
      title: 'Update Status',
      description: `Are you sure you want to update the status of ${selectedIds.size} deadline(s) to "${newStatus}"?`,
      variant: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        const promises = Array.from(selectedIds).map(id =>
          fetch(`/api/deadlines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
        )
        await Promise.all(promises)
        setSelectedIds(new Set())
        fetchDeadlines()
      }
    })
  }

  const handleEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline)
    setFormData({
      matterId: deadline.matter.id,
      title: deadline.title,
      description: deadline.description || '',
      deadlineType: deadline.deadlineType,
      dueDate: deadline.dueDate.split('T')[0],
      reminderDays: deadline.reminderDays.toString()
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      matterId: '',
      title: '',
      description: '',
      deadlineType: 'FILING',
      dueDate: '',
      reminderDays: '7'
    })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setSelectedIds(new Set())
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    setSelectedIds(new Set())
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDeadlines.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDeadlines.map(d => d.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    window.open(`/api/export?entity=deadlines&format=${format}`, '_blank')
  }

  const getClientName = (client: Deadline['matter']['client']) => {
    if (client.companyName) return client.companyName
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const getDaysUntil = (dateStr: string) => {
    const now = new Date()
    const due = new Date(dateStr)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getUrgencyBadge = (deadline: Deadline) => {
    if (deadline.status === 'COMPLETED') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (deadline.status === 'MISSED') {
      return <Badge className="bg-red-100 text-red-800">Missed</Badge>
    }

    const days = getDaysUntil(deadline.dueDate)
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-800">Overdue by {Math.abs(days)} days</Badge>
    }
    if (days === 0) {
      return <Badge className="bg-red-100 text-red-800">Due Today</Badge>
    }
    if (days <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Due in {days} days</Badge>
    }
    if (days <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due in {days} days</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-800">Due in {days} days</Badge>
  }

  const filteredDeadlines = deadlines.filter(deadline =>
    deadline.title.toLowerCase().includes(search.toLowerCase()) ||
    deadline.matter.name.toLowerCase().includes(search.toLowerCase())
  ).filter(deadline =>
    !typeFilter || typeFilter === 'all' || deadline.deadlineType === typeFilter
  )

  const overdueCount = deadlines.filter(d => d.status === 'PENDING' && getDaysUntil(d.dueDate) < 0).length
  const urgentCount = deadlines.filter(d => d.status === 'PENDING' && getDaysUntil(d.dueDate) >= 0 && getDaysUntil(d.dueDate) <= 7).length

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deadlines</h1>
          <p className="text-gray-500">Track and manage case deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingDeadline(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Deadline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingDeadline ? 'Edit Deadline' : 'New Deadline'}</DialogTitle>
                <DialogDescription>{editingDeadline ? 'Update deadline details' : 'Create a new deadline'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Matter *</Label>
                  <Select
                    value={formData.matterId}
                    onValueChange={(v) => setFormData({ ...formData, matterId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a matter" />
                    </SelectTrigger>
                    <SelectContent>
                      {matters.map((matter) => (
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.matterNumber} - {matter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.deadlineType}
                      onValueChange={(v) => setFormData({ ...formData, deadlineType: v })}
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
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days Before</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setEditingDeadline(null)
                  resetForm()
                }}>Cancel</Button>
                <Button
                  onClick={editingDeadline ? handleUpdateDeadline : handleCreateDeadline}
                  disabled={!formData.matterId || !formData.title || !formData.dueDate}
                >
                  {editingDeadline ? 'Update' : 'Create'} Deadline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{urgentCount}</p>
              <p className="text-sm text-gray-500">Due This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deadlines.filter(d => d.status === 'PENDING').length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{deadlines.filter(d => d.status === 'COMPLETED').length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => handleBulkStatusUpdate(status.value)}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deadlines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deadlineTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDeadlines.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No deadlines found</p>
              <Button onClick={() => setDialogOpen(true)}>Create Your First Deadline</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredDeadlines.length && filteredDeadlines.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Deadline" field="title" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Matter</TableHead>
                    <SortHeader label="Type" field="deadlineType" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Due Date" field="dueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Urgency</TableHead>
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeadlines.map((deadline) => (
                    <TableRow
                      key={deadline.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedDeadline(deadline)
                        setDetailDialogOpen(true)
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(deadline.id)}
                          onCheckedChange={() => toggleSelect(deadline.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          {deadline.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{deadline.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/matters/${deadline.matter.id}`}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {deadline.matter.matterNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {deadlineTypes.find(t => t.value === deadline.deadlineType)?.label || deadline.deadlineType}
                      </TableCell>
                      <TableCell>{formatDate(deadline.dueDate)}</TableCell>
                      <TableCell>{getUrgencyBadge(deadline)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={deadline.status}
                          onValueChange={(v) => handleUpdateStatus(deadline.id, v)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deadline Details</DialogTitle>
          </DialogHeader>
          {selectedDeadline && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-lg font-bold">{selectedDeadline.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(selectedDeadline.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  {getUrgencyBadge(selectedDeadline)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">
                    {deadlineTypes.find(t => t.value === selectedDeadline.deadlineType)?.label || selectedDeadline.deadlineType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={selectedDeadline.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {selectedDeadline.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Matter</p>
                <Link href={`/matters/${selectedDeadline.matter.id}`} className="text-blue-600 hover:underline">
                  {selectedDeadline.matter.matterNumber} - {selectedDeadline.matter.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{getClientName(selectedDeadline.matter.client)}</p>
              </div>
              {selectedDeadline.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{selectedDeadline.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Reminder</p>
                <p className="font-medium">{selectedDeadline.reminderDays} days before due date</p>
              </div>
              {selectedDeadline.completedAt && (
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p className="font-medium">{formatDate(selectedDeadline.completedAt)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedDeadline) {
                  setDetailDialogOpen(false)
                  handleEdit(selectedDeadline)
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedDeadline) {
                  setDetailDialogOpen(false)
                  confirmDeleteDeadline(selectedDeadline.id)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.variant === 'danger' ? 'Delete' : 'Confirm'}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  )
}
