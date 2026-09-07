"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Briefcase, User2, Download, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Matter {
  id: string
  matterNumber: string
  name: string
  caseType: string
  status: string
  priority: string
  openDate: string
  client: { id: string; firstName: string | null; lastName: string | null; companyName: string | null; type: string }
  leadAttorney: { id: string; name: string }
  _count: { documents: number; timeEntries: number; tasks: number }
}

interface PaginationData { total: number; page: number; limit: number; totalPages: number }

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  OPEN: 'success', PENDING: 'warning', ON_HOLD: 'secondary', CLOSED: 'default', ARCHIVED: 'destructive'
}
const priorityColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'secondary', MEDIUM: 'default', HIGH: 'warning', URGENT: 'destructive'
}

const caseTypes = [
  { value: '', label: 'All Case Types' },
  { value: 'CIVIL_LITIGATION', label: 'Civil Litigation' },
  { value: 'CRIMINAL_DEFENSE', label: 'Criminal Defense' },
  { value: 'FAMILY_LAW', label: 'Family Law' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
  { value: 'BANKRUPTCY', label: 'Bankruptcy' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'IMMIGRATION', label: 'Immigration' },
  { value: 'PERSONAL_INJURY', label: 'Personal Injury' },
  { value: 'ESTATE_PLANNING', label: 'Estate Planning' },
  { value: 'TAX', label: 'Tax' },
  { value: 'ENVIRONMENTAL', label: 'Environmental' },
  { value: 'OTHER', label: 'Other' }
]
const matterStatuses = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' }
]

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [caseTypeFilter, setCaseTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('OPEN')

  const fetchMatters = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (caseTypeFilter) params.set('caseType', caseTypeFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/matters?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMatters(data.matters)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch matters:', error)
    } finally {
      setLoading(false)
    }
  }, [search, caseTypeFilter, statusFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => { fetchMatters() }, [fetchMatters])
  useEffect(() => { setPage(1) }, [search, caseTypeFilter, statusFilter])

  const handleSort = (field: string) => {
    if (sortBy === field) { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }
    else { setSortBy(field); setSortOrder('asc') }
    setPage(1)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/matters/${id}`, { method: 'DELETE' })
      if (res.ok) { fetchMatters(); setDeleteDialogOpen(false); setDeleteTarget(null) }
    } catch (error) { console.error('Failed to delete matter:', error) }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'matters', ids: Array.from(selectedIds) })
      })
      if (res.ok) { setSelectedIds(new Set()); setBulkDeleteDialogOpen(false); fetchMatters() }
    } catch (error) { console.error('Bulk delete failed:', error) }
  }

  const handleBulkUpdate = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', entity: 'matters', ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } })
      })
      if (res.ok) { setSelectedIds(new Set()); setBulkUpdateDialogOpen(false); fetchMatters() }
    } catch (error) { console.error('Bulk update failed:', error) }
  }

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === matters.length ? new Set() : new Set(matters.map(m => m.id)))
  }
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s)
  }

  const handleExport = (format: 'csv' | 'pdf') => { window.open(`/api/export?entity=matters&format=${format}`, '_blank') }

  const getClientName = (client: Matter['client']) => {
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') return client.companyName || 'N/A'
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const handleRowClick = (matter: Matter) => { setSelectedMatter(matter); setDetailDialogOpen(true) }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matters</h1>
          <p className="text-gray-500">Manage your legal matters and cases</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}><FileText className="mr-2 h-4 w-4" />Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="mr-2 h-4 w-4" />Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild><Link href="/matters/new"><Plus className="w-4 h-4 mr-2" />New Matter</Link></Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setBulkUpdateDialogOpen(true)}>Update Status</Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
            <Trash2 className="w-3 h-3 mr-1" />Delete Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search matters..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Case Types" /></SelectTrigger>
              <SelectContent>
                {caseTypes.map((t) => (<SelectItem key={t.value} value={t.value || "all"}>{t.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                {matterStatuses.map((s) => (<SelectItem key={s.value} value={s.value || "all"}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {matters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No matters found</p>
              <Button asChild><Link href="/matters/new">Create Your First Matter</Link></Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox checked={selectedIds.size === matters.length && matters.length > 0} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <SortHeader label="Matter #" field="matterNumber" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Name" field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Client</TableHead>
                    <SortHeader label="Case Type" field="caseType" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Priority" field="priority" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Attorney</TableHead>
                    <SortHeader label="Opened" field="openDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matters.map((matter) => (
                    <TableRow key={matter.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(matter)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(matter.id)} onCheckedChange={() => toggleSelect(matter.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{matter.matterNumber}</TableCell>
                      <TableCell className="font-medium">{matter.name}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link href={`/clients/${matter.client.id}`} className="text-blue-600 hover:underline">{getClientName(matter.client)}</Link>
                      </TableCell>
                      <TableCell>{matter.caseType.replace(/_/g, ' ')}</TableCell>
                      <TableCell><Badge variant={statusColors[matter.status] || 'default'}>{matter.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell><Badge variant={priorityColors[matter.priority] || 'default'}>{matter.priority}</Badge></TableCell>
                      <TableCell>{matter.leadAttorney.name}</TableCell>
                      <TableCell>{formatDate(matter.openDate)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/matters/${matter.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/matters/${matter.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => { setDeleteTarget({ id: matter.id, name: matter.name }); setDeleteDialogOpen(true) }}>
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Matter Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" />{selectedMatter?.name}</DialogTitle>
            <DialogDescription>Matter #{selectedMatter?.matterNumber}</DialogDescription>
          </DialogHeader>
          {selectedMatter && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Matter Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Case Type</p><p className="text-sm font-medium">{selectedMatter.caseType.replace(/_/g, ' ')}</p></div>
                  <div><p className="text-sm text-gray-500">Status</p><Badge variant={statusColors[selectedMatter.status] || 'default'}>{selectedMatter.status.replace('_', ' ')}</Badge></div>
                  <div><p className="text-sm text-gray-500">Priority</p><Badge variant={priorityColors[selectedMatter.priority] || 'default'}>{selectedMatter.priority}</Badge></div>
                  <div><p className="text-sm text-gray-500">Opened</p><p className="text-sm font-medium">{formatDate(selectedMatter.openDate)}</p></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><User2 className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Client</p><p className="text-sm font-medium">{getClientName(selectedMatter.client)}</p></div></div>
                  <div className="flex items-center gap-2"><User2 className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Lead Attorney</p><p className="text-sm font-medium">{selectedMatter.leadAttorney.name}</p></div></div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div><p className="text-xs text-gray-500">Documents</p><p className="text-sm font-medium">{selectedMatter._count.documents}</p></div>
                    <div><p className="text-xs text-gray-500">Time Entries</p><p className="text-sm font-medium">{selectedMatter._count.timeEntries}</p></div>
                    <div><p className="text-xs text-gray-500">Tasks</p><p className="text-sm font-medium">{selectedMatter._count.tasks}</p></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => { setDetailDialogOpen(false); setDeleteTarget({ id: selectedMatter.id, name: selectedMatter.name }); setDeleteDialogOpen(true) }}>
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </Button>
                <Button asChild><Link href={`/matters/${selectedMatter.id}/edit`}><Edit className="w-4 h-4 mr-2" />Edit Matter</Link></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Matter" description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete Matter" variant="danger" onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)} />
      <ConfirmationDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen} title="Delete Selected Matters" description={`Delete ${selectedIds.size} selected matter(s)? This cannot be undone.`} confirmLabel={`Delete ${selectedIds.size} Matters`} variant="danger" onConfirm={handleBulkDelete} />

      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update {selectedIds.size} Matter(s)</DialogTitle><DialogDescription>Change the status of selected matters</DialogDescription></DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem><SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem><SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Matters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
