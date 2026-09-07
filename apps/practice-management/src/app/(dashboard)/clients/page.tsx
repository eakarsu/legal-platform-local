"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, Building2, User, Download, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Client {
  id: string
  clientNumber: string
  type: string
  status: string
  firstName: string | null
  lastName: string | null
  companyName: string | null
  email: string | null
  phone: string | null
  createdAt: string
  _count: { matters: number }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  ACTIVE: 'success', INACTIVE: 'secondary', PROSPECTIVE: 'warning', FORMER: 'destructive'
}

const clientTypes = [
  { value: '', label: 'All Types' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'NON_PROFIT', label: 'Non-Profit' }
]

const clientStatuses = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PROSPECTIVE', label: 'Prospective' },
  { value: 'FORMER', label: 'Former' }
]

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

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
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('ACTIVE')

  const fetchClients = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/clients?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, statusFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, statusFilter])

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
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchClients()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'clients', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchClients()
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
        body: JSON.stringify({ action: 'update', entity: 'clients', ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchClients()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)))
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
    window.open(`/api/export?entity=clients&format=${format}`, '_blank')
  }

  const getClientName = (client: Client) => {
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') {
      return client.companyName || 'N/A'
    }
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const handleRowClick = (client: Client) => {
    setSelectedClient(client)
    setDetailDialogOpen(true)
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Manage your client database</p>
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
            <Link href="/clients/new">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Link>
          </Button>
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
              <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                {clientTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value || "all"}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                {clientStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value || "all"}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No clients found</p>
              <Button asChild><Link href="/clients/new">Add Your First Client</Link></Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === clients.length && clients.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Client #" field="clientNumber" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Name" field="lastName" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Type" field="type" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Email" field="email" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Phone</TableHead>
                    <TableHead>Matters</TableHead>
                    <SortHeader label="Created" field="createdAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(client)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(client.id)} onCheckedChange={() => toggleSelect(client.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{client.clientNumber}</TableCell>
                      <TableCell className="font-medium">{getClientName(client)}</TableCell>
                      <TableCell>{client.type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[client.status] || 'default'}>{client.status}</Badge>
                      </TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{client._count.matters}</TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => {
                              setDeleteTarget({ id: client.id, name: getClientName(client) })
                              setDeleteDialogOpen(true)
                            }}>
                              <Trash2 className="mr-2 h-4 w-4" />Delete
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

      {/* Client Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedClient?.type === 'COMPANY' || selectedClient?.type === 'GOVERNMENT' || selectedClient?.type === 'NON_PROFIT' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
              {selectedClient && getClientName(selectedClient)}
            </DialogTitle>
            <DialogDescription>Client #{selectedClient?.clientNumber}</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-sm font-medium">{selectedClient.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={statusColors[selectedClient.status] || 'default'}>{selectedClient.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matters</p>
                    <p className="text-sm font-medium">{selectedClient._count.matters} active</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(selectedClient.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {selectedClient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedClient.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedClient.id, name: getClientName(selectedClient) })
                  setDeleteDialogOpen(true)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </Button>
                <Button asChild>
                  <Link href={`/clients/${selectedClient.id}/edit`}><Edit className="w-4 h-4 mr-2" />Edit Client</Link>
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
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete Client"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Clients"
        description={`Are you sure you want to delete ${selectedIds.size} selected client(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Clients`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Client(s)</DialogTitle>
            <DialogDescription>Change the status of selected clients</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PROSPECTIVE">Prospective</SelectItem>
                <SelectItem value="FORMER">Former</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Clients</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
