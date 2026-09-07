"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Upload,
  Send,
  Gavel,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface CourtFiling {
  id: string
  documentName: string
  documentType: string
  filingType: string
  courtName: string
  caseNumber: string | null
  filingDate: string | null
  dueDate: string | null
  status: string
  filingFee: string | null
  feePaid: boolean
  serviceRequired: boolean
  serviceStatus: string | null
  matter: {
    id: string
    name: string
    matterNumber: string
  }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
  courtName: string | null
  caseNumber: string | null
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  READY: 'warning',
  SUBMITTED: 'info' as any,
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  FILED: 'success'
}

const filingTypes = [
  { value: 'INITIAL', label: 'Initial Filing' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'MOTION', label: 'Motion' },
  { value: 'BRIEF', label: 'Brief' },
  { value: 'EXHIBIT', label: 'Exhibit' },
  { value: 'ORDER', label: 'Order' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'OTHER', label: 'Other' }
]

export default function FilingsPage() {
  const [filings, setFilings] = useState<CourtFiling[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFiling, setSelectedFiling] = useState<CourtFiling | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formData, setFormData] = useState({
    matterId: '',
    documentName: '',
    documentType: 'PLEADING',
    filingType: 'MOTION',
    courtName: '',
    caseNumber: '',
    dueDate: '',
    filingFee: '',
    serviceRequired: false
  })

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadingFilingId, setUploadingFilingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })

  // Sort state
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateValue, setBulkUpdateValue] = useState('DRAFT')

  const fetchFilings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/filings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFilings(data.filings)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch filings:', error)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchFilings()
  }, [fetchFilings])

  useEffect(() => {
    fetchMatters()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleMatterSelect = (matterId: string) => {
    const matter = matters.find(m => m.id === matterId)
    setFormData({
      ...formData,
      matterId,
      courtName: matter?.courtName || '',
      caseNumber: matter?.caseNumber || ''
    })
  }

  const handleCreateFiling = async () => {
    try {
      const res = await fetch('/api/filings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          matterId: '',
          documentName: '',
          documentType: 'PLEADING',
          filingType: 'MOTION',
          courtName: '',
          caseNumber: '',
          dueDate: '',
          filingFee: '',
          serviceRequired: false
        })
        fetchFilings()
      }
    } catch (error) {
      console.error('Failed to create filing:', error)
    }
  }

  const handleRowClick = (filing: CourtFiling) => {
    setSelectedFiling(filing)
    setDetailDialogOpen(true)
  }

  const handleOpenUploadDialog = (filingId: string) => {
    setUploadingFilingId(filingId)
    setSelectedFile(null)
    setUploadDialogOpen(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadDocument = async () => {
    if (!selectedFile || !uploadingFilingId) return

    setUploading(true)
    try {
      const filing = filings.find(f => f.id === uploadingFilingId)

      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('name', selectedFile.name.replace(/\.[^/.]+$/, ''))
      uploadFormData.append('description', `Document for court filing: ${filing?.documentName || ''}`)
      uploadFormData.append('category', 'COURT_ORDER')
      if (filing?.matter?.id) {
        uploadFormData.append('matterId', filing.matter.id)
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: uploadFormData
      })

      if (res.ok) {
        setUploadDialogOpen(false)
        setSelectedFile(null)
        setUploadingFilingId(null)
        if (filing?.status === 'DRAFT') {
          await fetch(`/api/filings/${uploadingFilingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'READY' })
          })
        }
        fetchFilings()
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FILED':
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'SUBMITTED':
      case 'READY':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/filings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchFilings()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete filing:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'filings', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchFilings()
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
        body: JSON.stringify({ action: 'update', entity: 'filings', ids: Array.from(selectedIds), data: { status: bulkUpdateValue } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchFilings()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filings.map(f => f.id)))
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
    window.open(`/api/export?entity=filings&format=${format}`, '_blank')
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Court Filings</h1>
          <p className="text-gray-500">Manage court filings and e-filing</p>
        </div>
        <div className="flex gap-2">
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Filing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Court Filing</DialogTitle>
                <DialogDescription>Create a new court filing record</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Matter *</Label>
                  <Select value={formData.matterId} onValueChange={handleMatterSelect}>
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
                  <Label htmlFor="documentName">Document Name *</Label>
                  <Input
                    id="documentName"
                    value={formData.documentName}
                    onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Filing Type</Label>
                    <Select
                      value={formData.filingType}
                      onValueChange={(v) => setFormData({ ...formData, filingType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courtName">Court Name</Label>
                    <Input
                      id="courtName"
                      value={formData.courtName}
                      onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber">Case Number</Label>
                    <Input
                      id="caseNumber"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filingFee">Filing Fee ($)</Label>
                  <Input
                    id="filingFee"
                    type="number"
                    step="0.01"
                    value={formData.filingFee}
                    onChange={(e) => setFormData({ ...formData, filingFee: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFiling} disabled={!formData.matterId || !formData.documentName}>
                  Create Filing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search filings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filings.length === 0 ? (
            <div className="text-center py-12">
              <Gavel className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No court filings found</p>
              <Button onClick={() => setDialogOpen(true)}>Create Your First Filing</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filings.length && filings.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Document" field="documentName" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Matter</TableHead>
                    <SortHeader label="Court" field="courtName" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Type" field="filingType" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Due Date" field="dueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Filing Date" field="filingDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Fee</TableHead>
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filings.map((filing) => (
                    <TableRow
                      key={filing.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(filing)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(filing.id)} onCheckedChange={() => toggleSelect(filing.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(filing.status)}
                          <span className="font-medium">{filing.documentName}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link href={`/matters/${filing.matter.id}`} className="text-blue-600 hover:underline">
                          {filing.matter.matterNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{filing.courtName}</p>
                          {filing.caseNumber && (
                            <p className="text-xs text-gray-500">#{filing.caseNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{filing.filingType}</TableCell>
                      <TableCell>
                        {filing.dueDate ? formatDate(filing.dueDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {filing.filingDate ? formatDate(filing.filingDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {filing.filingFee ? (
                          <div>
                            <span>{formatCurrency(filing.filingFee)}</span>
                            {filing.feePaid ? (
                              <Badge variant="success" className="ml-2">Paid</Badge>
                            ) : (
                              <Badge variant="warning" className="ml-2">Due</Badge>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[filing.status] || 'default'}>
                          {filing.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRowClick(filing)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenUploadDialog(filing.id)}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              if (confirm(`Submit ${filing.documentName} to ${filing.courtName}?`)) {
                                try {
                                  const res = await fetch(`/api/filings/${filing.id}/submit`, {
                                    method: 'POST'
                                  })
                                  if (res.ok) {
                                    fetchFilings()
                                  }
                                } catch (error) {
                                  console.error('Submit error:', error)
                                }
                              }
                            }}>
                              <Send className="mr-2 h-4 w-4" />
                              Submit E-Filing
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => {
                              setDeleteTarget({ id: filing.id, name: filing.documentName })
                              setDeleteDialogOpen(true)
                            }}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Filing Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              {selectedFiling?.documentName}
            </DialogTitle>
            <DialogDescription>
              Court Filing Details
            </DialogDescription>
          </DialogHeader>
          {selectedFiling && (
            <div className="space-y-6">
              {/* Matter & Court Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Matter & Court</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Matter</p>
                    <p className="text-sm font-medium font-mono">{selectedFiling.matter.matterNumber}</p>
                    <p className="text-xs text-gray-600">{selectedFiling.matter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Court</p>
                    <p className="text-sm font-medium">{selectedFiling.courtName}</p>
                    {selectedFiling.caseNumber && (
                      <p className="text-xs text-gray-600">Case #{selectedFiling.caseNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Filing Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Filing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Document Type</p>
                    <p className="text-sm font-medium">{selectedFiling.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Filing Type</p>
                    <p className="text-sm font-medium">{selectedFiling.filingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={statusColors[selectedFiling.status] || 'default'}>
                      {selectedFiling.status}
                    </Badge>
                  </div>
                  {selectedFiling.dueDate && (
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedFiling.dueDate)}</p>
                    </div>
                  )}
                  {selectedFiling.filingDate && (
                    <div>
                      <p className="text-sm text-gray-500">Filed Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedFiling.filingDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee & Service Info */}
              {(selectedFiling.filingFee || selectedFiling.serviceRequired) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Fee & Service</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFiling.filingFee && (
                      <div>
                        <p className="text-sm text-gray-500">Filing Fee</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{formatCurrency(selectedFiling.filingFee)}</p>
                          {selectedFiling.feePaid ? (
                            <Badge variant="success">Paid</Badge>
                          ) : (
                            <Badge variant="warning">Due</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedFiling.serviceRequired && (
                      <div>
                        <p className="text-sm text-gray-500">Service Status</p>
                        <Badge>{selectedFiling.serviceStatus || 'Pending'}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedFiling.id, name: selectedFiling.documentName })
                  setDeleteDialogOpen(true)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => {
                  setDetailDialogOpen(false)
                  handleOpenUploadDialog(selectedFiling.id)
                }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
                <Button onClick={async () => {
                  if (confirm(`Submit this filing to ${selectedFiling.courtName}?`)) {
                    try {
                      const res = await fetch(`/api/filings/${selectedFiling.id}/submit`, {
                        method: 'POST'
                      })
                      if (res.ok) {
                        setDetailDialogOpen(false)
                        fetchFilings()
                      }
                    } catch (error) {
                      console.error('Submit error:', error)
                    }
                  }
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit E-Filing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for this court filing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.rtf"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false)
              setSelectedFile(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!selectedFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Filing"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Filing"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Filings"
        description={`Are you sure you want to delete ${selectedIds.size} selected filing(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Filings`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Filing(s)</DialogTitle>
            <DialogDescription>Change the status of selected filings</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Filings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
