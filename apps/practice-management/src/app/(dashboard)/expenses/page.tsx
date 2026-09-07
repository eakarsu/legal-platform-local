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
  Receipt,
  Trash2,
  Edit,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'

interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: string
  vendor: string | null
  billableStatus: string
  notes: string | null
  matter: {
    id: string
    name: string
    matterNumber: string
    client: {
      id: string
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

const categories = [
  { value: 'FILING_FEE', label: 'Filing Fee' },
  { value: 'COURT_COST', label: 'Court Cost' },
  { value: 'EXPERT_WITNESS', label: 'Expert Witness' },
  { value: 'DEPOSITION', label: 'Deposition' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'COPYING', label: 'Copying' },
  { value: 'POSTAGE', label: 'Postage' },
  { value: 'COURIER', label: 'Courier' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'OTHER', label: 'Other' }
]

const billableStatuses = [
  { value: 'BILLABLE', label: 'Billable' },
  { value: 'NON_BILLABLE', label: 'Non-Billable' },
  { value: 'BILLED', label: 'Billed' },
  { value: 'WRITTEN_OFF', label: 'Written Off' }
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [billableFilter, setBillableFilter] = useState('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 25, totalPages: 1 })

  // Sort state
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'OTHER',
    vendor: '',
    billableStatus: 'BILLABLE',
    notes: ''
  })

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      if (billableFilter && billableFilter !== 'all') params.set('billableStatus', billableFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/expenses?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, billableFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

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

  const handleCreateExpense = async () => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }

  const handleUpdateExpense = async () => {
    if (!editingExpense) return

    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setEditingExpense(null)
        resetForm()
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to update expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  const confirmDeleteExpense = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Expense',
      description: 'Are you sure you want to delete this expense? This action cannot be undone.',
      variant: 'danger',
      onConfirm: () => {
        handleDeleteExpense(id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    setConfirmDialog({
      open: true,
      title: 'Delete Selected Expenses',
      description: `Are you sure you want to delete ${selectedIds.size} selected expense(s)? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        const promises = Array.from(selectedIds).map(id =>
          fetch(`/api/expenses/${id}`, { method: 'DELETE' })
        )
        await Promise.all(promises)
        setSelectedIds(new Set())
        fetchExpenses()
      }
    })
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      matterId: expense.matter.id,
      date: expense.date.split('T')[0],
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      vendor: expense.vendor || '',
      billableStatus: expense.billableStatus,
      notes: expense.notes || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      matterId: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'OTHER',
      vendor: '',
      billableStatus: 'BILLABLE',
      notes: ''
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
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredExpenses.map(e => e.id)))
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
    window.open(`/api/export?entity=expenses&format=${format}`, '_blank')
  }

  const getClientName = (client: Expense['matter']['client']) => {
    if (client.companyName) return client.companyName
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(search.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(search.toLowerCase()) ||
    expense.matter.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const billableAmount = filteredExpenses
    .filter(e => e.billableStatus === 'BILLABLE')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500">Track and manage case expenses</p>
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
              setEditingExpense(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'New Expense'}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'Update expense details' : 'Record a new expense'}
                </DialogDescription>
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
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setEditingExpense(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={editingExpense ? handleUpdateExpense : handleCreateExpense}
                  disabled={!formData.matterId || !formData.description || !formData.amount}
                >
                  {editingExpense ? 'Update' : 'Create'} Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Billable</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(billableAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Non-Billable</p>
            <p className="text-2xl font-bold text-gray-600">{formatCurrency(totalAmount - billableAmount)}</p>
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
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={billableFilter} onValueChange={(v) => { setBillableFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {billableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No expenses found</p>
              <Button onClick={() => setDialogOpen(true)}>Record Your First Expense</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredExpenses.length && filteredExpenses.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Date" field="date" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Description</TableHead>
                    <TableHead>Matter</TableHead>
                    <SortHeader label="Category" field="category" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Vendor" field="vendor" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Amount" field="amount" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} className="text-right" />
                    <SortHeader label="Status" field="billableStatus" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedExpense(expense)
                        setDetailDialogOpen(true)
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(expense.id)}
                          onCheckedChange={() => toggleSelect(expense.id)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <Link href={`/matters/${expense.matter.id}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                          {expense.matter.matterNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {categories.find(c => c.value === expense.category)?.label || expense.category}
                      </TableCell>
                      <TableCell>{expense.vendor || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expense.billableStatus === 'BILLABLE' ? 'default' : 'secondary'}>
                          {expense.billableStatus}
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
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(expense)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                confirmDeleteExpense(expense.id)
                              }}
                            >
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
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedExpense.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedExpense.amount)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">
                    {categories.find(c => c.value === selectedExpense.category)?.label || selectedExpense.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={selectedExpense.billableStatus === 'BILLABLE' ? 'default' : 'secondary'}>
                    {selectedExpense.billableStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Matter</p>
                <Link href={`/matters/${selectedExpense.matter.id}`} className="text-blue-600 hover:underline">
                  {selectedExpense.matter.matterNumber} - {selectedExpense.matter.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{getClientName(selectedExpense.matter.client)}</p>
              </div>
              {selectedExpense.vendor && (
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">{selectedExpense.vendor}</p>
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
                if (selectedExpense) {
                  setDetailDialogOpen(false)
                  handleEdit(selectedExpense)
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedExpense) {
                  setDetailDialogOpen(false)
                  confirmDeleteExpense(selectedExpense.id)
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
