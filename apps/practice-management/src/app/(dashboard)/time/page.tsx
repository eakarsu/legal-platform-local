"use client"

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Clock, DollarSign, Timer, Download, FileText, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface TimeEntry {
  id: string
  date: string
  hours: string
  description: string
  billableStatus: string
  rate: string
  amount: string
  matter: { id: string; name: string; matterNumber: string }
  user: { id: string; name: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface Totals {
  hours: number
  amount: number
  billableHours: number
  billableAmount: number
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const billableStatuses = [
  { value: 'BILLABLE', label: 'Billable' },
  { value: 'NON_BILLABLE', label: 'Non-Billable' },
  { value: 'NO_CHARGE', label: 'No Charge' }
]

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [totals, setTotals] = useState<Totals>({ hours: 0, amount: 0, billableHours: 0, billableAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })

  // Sort state
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('BILLABLE')

  const [formData, setFormData] = useState({
    matterId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    billableStatus: 'BILLABLE',
    rate: ''
  })

  const fetchTimeEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/time?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTimeEntries(data.timeEntries)
        setTotals(data.totals)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchTimeEntries()
  }, [fetchTimeEntries])

  useEffect(() => {
    fetchMatters()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  const fetchMatters = async () => {
    try {
      const res = await fetch('/api/matters?status=OPEN')
      if (res.ok) {
        const data = await res.json()
        setMatters(data.matters)
      }
    } catch (error) {
      console.error('Failed to fetch matters:', error)
    }
  }

  const handleCreateEntry = async () => {
    try {
      const res = await fetch('/api/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          matterId: '',
          date: new Date().toISOString().split('T')[0],
          hours: '',
          description: '',
          billableStatus: 'BILLABLE',
          rate: ''
        })
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Failed to create time entry:', error)
    }
  }

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const stopTimer = () => {
    setTimerRunning(false)
    const hours = (timerSeconds / 3600).toFixed(2)
    setFormData({ ...formData, hours })
    setTimerSeconds(0)
    setDialogOpen(true)
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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/time/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTimeEntries()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete time entry:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'timeEntries', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const handleBulkUpdate = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', entity: 'timeEntries', ids: Array.from(selectedIds), data: { billableStatus: bulkUpdateStatus } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === timeEntries.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(timeEntries.map(e => e.id)))
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
    window.open(`/api/export?entity=timeEntries&format=${format}`, '_blank')
  }

  const handleRowClick = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setDetailDialogOpen(true)
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-500">Track and manage billable hours</p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {timerRunning ? (
            <Button variant="destructive" onClick={stopTimer}>
              <Timer className="w-4 h-4 mr-2" />
              {formatTimer(timerSeconds)} - Stop
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setTimerRunning(true)}>
              <Timer className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Time Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>Record your billable time</DialogDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours *</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.1"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the work performed..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billable Status</Label>
                    <Select
                      value={formData.billableStatus}
                      onValueChange={(v) => setFormData({ ...formData, billableStatus: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {billableStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate ($/hr)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="Use default if empty"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleCreateEntry}
                  disabled={!formData.matterId || !formData.hours || !formData.description}
                >
                  Save Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{totals.hours.toFixed(1)}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Billable Hours</p>
                <p className="text-2xl font-bold">{totals.billableHours.toFixed(1)}</p>
              </div>
              <Timer className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.amount)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Billable Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.billableAmount)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setBulkUpdateDialogOpen(true)}>
            Update Status
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No time entries yet</p>
              <Button onClick={() => setDialogOpen(true)}>Add Your First Entry</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === timeEntries.length && timeEntries.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Date" field="date" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Matter</TableHead>
                    <TableHead>Description</TableHead>
                    <SortHeader label="Hours" field="hours" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Rate" field="rate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Amount" field="amount" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Status" field="billableStatus" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(entry)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(entry.id)} onCheckedChange={() => toggleSelect(entry.id)} />
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{entry.matter.matterNumber}</span>
                        <br />
                        <span className="text-sm text-gray-500">{entry.matter.name}</span>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{entry.description}</TableCell>
                      <TableCell>{Number(entry.hours).toFixed(1)}</TableCell>
                      <TableCell>{formatCurrency(entry.rate)}</TableCell>
                      <TableCell>{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.billableStatus === 'BILLABLE' ? 'success' : 'secondary'}>
                          {entry.billableStatus.replace('_', ' ')}
                        </Badge>
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
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Time Entry Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Entry Details
            </DialogTitle>
            <DialogDescription>
              {selectedEntry && formatDate(selectedEntry.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              {/* Entry Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Entry Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Matter</p>
                    <p className="text-sm font-medium font-mono">{selectedEntry.matter.matterNumber}</p>
                    <p className="text-sm text-gray-600">{selectedEntry.matter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attorney</p>
                    <p className="text-sm font-medium">{selectedEntry.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hours</p>
                    <p className="text-sm font-medium">{Number(selectedEntry.hours).toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Billable Status</p>
                    <Badge variant={selectedEntry.billableStatus === 'BILLABLE' ? 'success' : 'secondary'}>
                      {selectedEntry.billableStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Rate</p>
                    <p className="text-sm font-medium">{formatCurrency(selectedEntry.rate)}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedEntry.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedEntry.description}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedEntry.id, name: `${formatDate(selectedEntry.date)} - ${selectedEntry.matter.matterNumber}` })
                  setDeleteDialogOpen(true)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Time Entry"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Entry"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Time Entries"
        description={`Are you sure you want to delete ${selectedIds.size} selected time entry(ies)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Entries`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Time Entry(ies)</DialogTitle>
            <DialogDescription>Change the billable status of selected entries</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BILLABLE">Billable</SelectItem>
                <SelectItem value="NON_BILLABLE">Non-Billable</SelectItem>
                <SelectItem value="NO_CHARGE">No Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Entries</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
