"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
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
import {
  Upload,
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  FileText,
  File,
  FileImage
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Document {
  id: string
  name: string
  description: string | null
  fileName: string
  fileType: string
  fileSize: number
  category: string
  status: string
  createdAt: string
  matter: { id: string; name: string; matterNumber: string } | null
  client: { id: string; firstName: string | null; lastName: string | null; companyName: string | null } | null
  uploadedBy: { id: string; name: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'PLEADING', label: 'Pleading' },
  { value: 'MOTION', label: 'Motion' },
  { value: 'BRIEF', label: 'Brief' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'CORRESPONDENCE', label: 'Correspondence' },
  { value: 'DISCOVERY', label: 'Discovery' },
  { value: 'EVIDENCE', label: 'Evidence' },
  { value: 'COURT_ORDER', label: 'Court Order' },
  { value: 'TRANSCRIPT', label: 'Transcript' },
  { value: 'TEMPLATE', label: 'Template' },
  { value: 'CLIENT_FILE', label: 'Client File' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'OTHER', label: 'Other' }
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('DRAFT')

  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'OTHER',
    matterId: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter) params.set('category', categoryFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/documents?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    fetchMatters()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!uploadForm.name) {
        setUploadForm({ ...uploadForm, name: file.name.replace(/\.[^/.]+$/, '') })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', uploadForm.name || selectedFile.name)
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)
      if (uploadForm.matterId) formData.append('matterId', uploadForm.matterId)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        setUploadDialogOpen(false)
        setSelectedFile(null)
        setUploadForm({ name: '', description: '', category: 'OTHER', matterId: '' })
        fetchDocuments()
      }
    } catch (error) {
      console.error('Failed to upload document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDocuments()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
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

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'documents', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchDocuments()
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
        body: JSON.stringify({ action: 'update', entity: 'documents', ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchDocuments()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(documents.map(d => d.id)))
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
    window.open(`/api/export?entity=documents&format=${format}`, '_blank')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage
    if (fileType.includes('pdf')) return FileText
    return File
  }

  const handleRowClick = (doc: Document) => {
    setSelectedDocument(doc)
    setDetailDialogOpen(true)
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Manage your legal documents</p>
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
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Upload a new document to your library</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docName">Document Name</Label>
                  <Input
                    id="docName"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docDescription">Description</Label>
                  <Textarea
                    id="docDescription"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(v) => setUploadForm({ ...uploadForm, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Associated Matter</Label>
                  <Select
                    value={uploadForm.matterId}
                    onValueChange={(v) => setUploadForm({ ...uploadForm, matterId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a matter (optional)" />
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
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
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value || "all"}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No documents found</p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === documents.length && documents.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Name" field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Category" field="category" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Matter</TableHead>
                    <SortHeader label="Size" field="fileSize" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Uploaded By</TableHead>
                    <SortHeader label="Date" field="createdAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.fileType)
                    return (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(doc)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(doc.id)} onCheckedChange={() => toggleSelect(doc.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">{doc.fileName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.category.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {doc.matter ? (
                            <Link href={`/matters/${doc.matter.id}`} className="text-blue-600 hover:underline">
                              {doc.matter.matterNumber}
                            </Link>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{doc.uploadedBy.name}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${doc.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                try {
                                  const res = await fetch(`/api/documents/${doc.id}/download`)
                                  if (res.ok) {
                                    const contentDisposition = res.headers.get('Content-Disposition')
                                    let filename = doc.fileName
                                    if (contentDisposition) {
                                      const match = contentDisposition.match(/filename="(.+)"/)
                                      if (match) {
                                        filename = match[1]
                                      }
                                    }
                                    const blob = await res.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = filename
                                    document.body.appendChild(a)
                                    a.click()
                                    window.URL.revokeObjectURL(url)
                                    document.body.removeChild(a)
                                  }
                                } catch (error) {
                                  console.error('Download error:', error)
                                }
                              }}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setDeleteTarget({ id: doc.id, name: doc.name })
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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

      {/* Document Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && <FileText className="w-5 h-5" />}
              {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.fileName}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Document Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <Badge variant="secondary">{selectedDocument.category.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge>{selectedDocument.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="text-sm font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="text-sm font-medium">{formatDate(selectedDocument.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                <div className="space-y-3">
                  {selectedDocument.description && (
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{selectedDocument.description}</p>
                    </div>
                  )}
                  {selectedDocument.matter && (
                    <div>
                      <p className="text-xs text-gray-500">Associated Matter</p>
                      <Link
                        href={`/matters/${selectedDocument.matter.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {selectedDocument.matter.matterNumber} - {selectedDocument.matter.name}
                      </Link>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Uploaded By</p>
                    <p className="text-sm font-medium">{selectedDocument.uploadedBy.name}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={async () => {
                  try {
                    const res = await fetch(`/api/documents/${selectedDocument.id}/download`)
                    if (res.ok) {
                      const contentDisposition = res.headers.get('Content-Disposition')
                      let filename = selectedDocument.fileName
                      if (contentDisposition) {
                        const match = contentDisposition.match(/filename="(.+)"/)
                        if (match) {
                          filename = match[1]
                        }
                      }
                      const blob = await res.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = filename
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                      setDetailDialogOpen(false)
                    }
                  } catch (error) {
                    console.error('Download error:', error)
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedDocument.id, name: selectedDocument.name })
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
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Document"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Documents"
        description={`Are you sure you want to delete ${selectedIds.size} selected document(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Documents`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Document(s)</DialogTitle>
            <DialogDescription>Change the status of selected documents</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
                <SelectItem value="EXECUTED">Executed</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Documents</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
