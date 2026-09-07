"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Send,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { SortHeader } from "@/components/ui/sort-header"
import { PageSkeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  matter: { id: string; name: string; matterNumber: string }
  client: {
    id: string
    firstName?: string
    lastName?: string
    companyName?: string
    type: string
  }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
  clientId: string
  client: {
    id: string
    firstName?: string
    lastName?: string
    companyName?: string
    type: string
  }
}

interface Client {
  id: string
  firstName?: string
  lastName?: string
  companyName?: string
  type: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  const [formData, setFormData] = useState({
    clientId: "",
    matterId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    amount: "",
    status: "DRAFT",
    notes: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const status = statusFilter === "all" ? "" : statusFilter
        const [invoicesRes, mattersRes, clientsRes] = await Promise.all([
          fetch(`/api/invoices?search=${search}&status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`),
          fetch("/api/matters"),
          fetch("/api/clients"),
        ])
        const [invoicesData, mattersData, clientsData] = await Promise.all([
          invoicesRes.json(),
          mattersRes.json(),
          clientsRes.json(),
        ])
        setInvoices(invoicesData.data || invoicesData)
        setPagination(invoicesData.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 })
        setMatters(mattersData.data || mattersData)
        setClients(clientsData.data || clientsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, statusFilter, page, limit, sortBy, sortOrder])

  // Filter matters by selected client
  const filteredMatters = formData.clientId
    ? matters.filter((m) => m.clientId === formData.clientId)
    : matters

  const getClientDisplayName = (client: Client) => {
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const invoice = await res.json()
        setDialogOpen(false)
        setFormData({
          clientId: "",
          matterId: "",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: "",
          amount: "",
          status: "DRAFT",
          notes: "",
        })
        router.push(`/invoices/${invoice.id}`)
      }
    } catch (error) {
      console.error("Failed to create invoice:", error)
    }
  }

  const handleSendInvoice = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}/send`, { method: "POST" })
      // Refresh invoices
      const status = statusFilter === "all" ? "" : statusFilter
      const res = await fetch(`/api/invoices?search=${search}&status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      const invoicesData = await res.json()
      setInvoices(invoicesData.data || invoicesData)
      setPagination(invoicesData.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 })
    } catch (error) {
      console.error("Failed to send invoice:", error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      VIEWED: "bg-purple-100 text-purple-800",
      PARTIAL: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800",
      VOID: "bg-gray-100 text-gray-500",
    }
    return colors[status] || colors.DRAFT
  }

  const getClientName = (client?: Invoice["client"]) => {
    if (!client) return "No Client"
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  const totals = invoices.reduce(
    (acc, inv) => ({
      total: acc.total + inv.totalAmount,
      paid: acc.paid + inv.paidAmount,
      outstanding: acc.outstanding + (inv.totalAmount - inv.paidAmount),
    }),
    { total: 0, paid: 0, outstanding: 0 }
  )

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage client invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { window.location.href = "/api/invoices/export" }}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value, matterId: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {getClientDisplayName(client)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Matter *</Label>
                <Select
                  value={formData.matterId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, matterId: value }))}
                  disabled={!formData.clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.clientId ? "Select matter" : "Select client first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMatters.map((matter) => (
                      <SelectItem key={matter.id} value={matter.id}>
                        {matter.name} ({matter.matterNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date *</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.clientId || !formData.matterId || !formData.dueDate || !formData.amount}>
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
            <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "PAID").length} paid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.outstanding)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status !== "PAID" && i.status !== "VOID").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                invoices
                  .filter((i) => i.status === "OVERDUE")
                  .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "OVERDUE").length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground mb-4">Create your first invoice</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="Invoice #" field="invoiceNumber" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  <TableHead>Client</TableHead>
                  <TableHead>Matter</TableHead>
                  <SortHeader label="Issue Date" field="issueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="Due Date" field="dueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  <SortHeader label="Amount" field="totalAmount" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} className="text-right" />
                  <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{getClientName(invoice.client)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.matter.name}</p>
                        <p className="text-sm text-muted-foreground">{invoice.matter.matterNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                        {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                          <p className="text-sm text-muted-foreground">
                            Paid: {formatCurrency(invoice.paidAmount)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/invoices/${invoice.id}`)
                          }}>
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {invoice.status === "DRAFT" && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleSendInvoice(invoice.id)
                            }}>
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {pagination.totalPages > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1) }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
