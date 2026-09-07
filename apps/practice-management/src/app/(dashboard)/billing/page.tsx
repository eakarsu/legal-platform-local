"use client"

import { useEffect, useState, useCallback } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Send,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Download,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  subtotal: string
  total: string
  paidAmount: string
  status: string
  client: {
    id: string
    firstName: string | null
    lastName: string | null
    companyName: string | null
    type: string
  }
  matter: {
    id: string
    name: string
    matterNumber: string
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  SENT: 'warning',
  PAID: 'success',
  PARTIAL: 'info' as any,
  OVERDUE: 'destructive',
  CANCELLED: 'default',
  WRITTEN_OFF: 'default'
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalPaid: 0,
    overdueAmount: 0,
    invoiceCount: 0
  })

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })

  // Sort state
  const [sortBy, setSortBy] = useState('issueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateValue, setBulkUpdateValue] = useState('DRAFT')

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/billing?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices)
        setStats(data.stats)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const getClientName = (client: Invoice['client']) => {
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') {
      return client.companyName || 'N/A'
    }
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailDialogOpen(true)
  }

  const handleRecordPayment = async (invoiceId: string, amount: number) => {
    try {
      const res = await fetch(`/api/billing/${invoiceId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      if (res.ok) {
        setDetailDialogOpen(false)
        fetchInvoices()
      }
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/billing/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchInvoices()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'invoices', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchInvoices()
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
        body: JSON.stringify({ action: 'update', entity: 'invoices', ids: Array.from(selectedIds), data: { status: bulkUpdateValue } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchInvoices()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(invoices.map(i => i.id)))
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
    window.open(`/api/export?entity=invoices&format=${format}`, '_blank')
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500">Manage invoices and payments</p>
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
          <Button asChild>
            <Link href="/billing/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid (MTD)</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
              </div>
              <FileText className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Invoices</p>
                <p className="text-2xl font-bold">{stats.invoiceCount}</p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-500" />
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No invoices found</p>
              <Button asChild>
                <Link href="/billing/new">Create Your First Invoice</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === invoices.length && invoices.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Invoice #" field="invoiceNumber" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Client</TableHead>
                    <TableHead>Matter</TableHead>
                    <SortHeader label="Issue Date" field="issueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Due Date" field="dueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Amount" field="total" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Paid" field="paidAmount" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(invoice)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(invoice.id)} onCheckedChange={() => toggleSelect(invoice.id)} />
                      </TableCell>
                      <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{getClientName(invoice.client)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{invoice.matter.matterNumber}</span>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[invoice.status] || 'default'}>
                          {invoice.status}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/billing/${invoice.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              try {
                                const res = await fetch(`/api/billing/${invoice.id}/send`, {
                                  method: 'POST'
                                })
                                if (res.ok) {
                                  fetchInvoices()
                                }
                              } catch (error) {
                                console.error('Send error:', error)
                              }
                            }}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const amount = prompt(`Enter payment amount (Balance Due: $${(Number(invoice.total) - Number(invoice.paidAmount)).toFixed(2)}):`)
                              if (amount && !isNaN(Number(amount))) {
                                handleRecordPayment(invoice.id, Number(amount))
                              }
                            }}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => {
                              setDeleteTarget({ id: invoice.id, name: invoice.invoiceNumber })
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

      {/* Invoice Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>
              Invoice Details
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Client & Matter Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Client & Matter</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="text-sm font-medium">{getClientName(selectedInvoice.client)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matter</p>
                    <p className="text-sm font-medium font-mono">{selectedInvoice.matter.matterNumber}</p>
                    <p className="text-xs text-gray-600">{selectedInvoice.matter.name}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="text-sm font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-sm font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={statusColors[selectedInvoice.status] || 'default'}>
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Paid</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 pt-2 border-t">
                    <span className="font-medium">Balance Due</span>
                    <span className="font-bold">{formatCurrency(Number(selectedInvoice.total) - Number(selectedInvoice.paidAmount))}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedInvoice.id, name: selectedInvoice.invoiceNumber })
                  setDeleteDialogOpen(true)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    const res = await fetch(`/api/billing/${selectedInvoice.id}/send`, {
                      method: 'POST'
                    })
                    if (res.ok) {
                      setDetailDialogOpen(false)
                      fetchInvoices()
                    }
                  } catch (error) {
                    console.error('Send error:', error)
                  }
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Client
                </Button>
                <Button onClick={() => {
                  const amount = prompt(`Enter payment amount (Balance Due: $${(Number(selectedInvoice.total) - Number(selectedInvoice.paidAmount)).toFixed(2)}):`)
                  if (amount && !isNaN(Number(amount))) {
                    handleRecordPayment(selectedInvoice.id, Number(amount))
                  }
                }}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
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
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Invoices"
        description={`Are you sure you want to delete ${selectedIds.size} selected invoice(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Invoices`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Invoice(s)</DialogTitle>
            <DialogDescription>Change the status of selected invoices</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Invoices</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
