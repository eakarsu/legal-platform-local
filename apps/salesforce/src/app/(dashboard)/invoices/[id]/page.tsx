"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Send,
  Download,
  DollarSign,
  Clock,
  FileText,
  CreditCard,
  CheckCircle,
  Printer,
  Pencil,
  XCircle,
} from "lucide-react"
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
import { formatCurrency, formatDate } from "@/lib/utils"

interface TimeEntry {
  id: string
  date: string
  hours: number
  rate: number
  amount: number
  description: string
  user: { firstName: string; lastName: string }
  activityCode?: { code: string; name: string }
}

interface Expense {
  id: string
  date: string
  amount: number
  description: string
  expenseCode?: { code: string; name: string }
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  reference?: string
  paymentDate: string
  notes?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  notes?: string
  matter: { id: string; name: string; matterNumber: string }
  client: {
    id: string
    firstName?: string
    lastName?: string
    companyName?: string
    type: string
    email?: string
    address?: string
    city?: string
    state?: string
    zip?: string
  }
  timeEntries: TimeEntry[]
  expenses: Expense[]
  payments: Payment[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const [editForm, setEditForm] = useState({
    status: "",
    dueDate: "",
    notes: "",
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CHECK",
    reference: "",
    notes: "",
  })

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      if (res.ok) {
        setInvoice(await res.json())
      } else {
        router.push("/invoices")
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
      router.push("/invoices")
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvoice = async () => {
    setSending(true)
    try {
      const res = await fetch(`/api/invoices/${params.id}/send`, { method: "POST" })
      if (res.ok) {
        fetchInvoice()
      }
    } catch (error) {
      console.error("Failed to send invoice:", error)
    } finally {
      setSending(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/invoices/${params.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      })
      if (res.ok) {
        setPaymentDialogOpen(false)
        setPaymentForm({ amount: "", method: "CHECK", reference: "", notes: "" })
        fetchInvoice()
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
    }
  }

  const handleDownloadPdf = () => {
    // Open invoice PDF in new tab for printing
    window.open(`/api/invoices/${params.id}/pdf`, '_blank')
  }

  const handleEditOpen = () => {
    if (invoice) {
      setEditForm({
        status: invoice.status,
        dueDate: invoice.dueDate.split("T")[0],
        notes: invoice.notes || "",
      })
      setEditDialogOpen(true)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setEditDialogOpen(false)
        fetchInvoice()
      }
    } catch (error) {
      console.error("Failed to update invoice:", error)
    }
  }

  const handleVoidInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VOID" }),
      })
      if (res.ok) {
        setVoidDialogOpen(false)
        fetchInvoice()
      }
    } catch (error) {
      console.error("Failed to void invoice:", error)
    }
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

  const paymentMethods = [
    { value: "CHECK", label: "Check" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "ACH", label: "ACH Transfer" },
    { value: "WIRE", label: "Wire Transfer" },
    { value: "CASH", label: "Cash" },
    { value: "TRUST_TRANSFER", label: "Trust Transfer" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (!invoice) return null

  const balanceDue = invoice.totalAmount - invoice.paidAmount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {invoice.matter?.name || 'Unknown Matter'} ({invoice.matter?.matterNumber || 'N/A'})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === "DRAFT" && (
            <Button onClick={handleSendInvoice} disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending..." : "Send Invoice"}
            </Button>
          )}
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={invoice.status === "PAID"}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder={balanceDue.toFixed(2)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Balance due: {formatCurrency(balanceDue)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(value) => setPaymentForm((prev) => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference (Check #, Transaction ID)</Label>
                  <Input
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEditOpen} disabled={invoice.status === "VOID"}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setVoidDialogOpen(true)}
            disabled={invoice.status === "VOID" || invoice.status === "PAID"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Void
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Invoice Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Bill To</h3>
                  <p className="font-medium">{getClientName(invoice.client)}</p>
                  {invoice.client?.address && <p>{invoice.client.address}</p>}
                  {invoice.client?.city && (
                    <p>
                      {invoice.client.city}, {invoice.client.state} {invoice.client.zip}
                    </p>
                  )}
                  {invoice.client?.email && (
                    <p className="text-primary">{invoice.client.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <p>
                      <span className="text-muted-foreground">Invoice Date:</span>{" "}
                      {formatDate(invoice.issueDate)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Due Date:</span>{" "}
                      {formatDate(invoice.dueDate)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Matter:</span>{" "}
                      {invoice.matter?.matterNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Entries */}
          {invoice.timeEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Attorney</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate">{entry.description}</p>
                          {entry.activityCode && (
                            <Badge variant="outline" className="mt-1">
                              {entry.activityCode.code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.user.firstName} {entry.user.lastName}
                        </TableCell>
                        <TableCell className="text-right">{Number(entry.hours).toFixed(1)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Expenses */}
          {invoice.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {expense.expenseCode && (
                            <Badge variant="outline">{expense.expenseCode.code}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(payment.paymentMethod || "CHECK").replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{payment.reference || "-"}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Charges</span>
                <span>
                  {formatCurrency(
                    invoice.timeEntries.reduce((sum, e) => sum + e.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span>
                  {formatCurrency(
                    invoice.expenses.reduce((sum, e) => sum + e.amount, 0)
                  )}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Paid</span>
                  <span>-{formatCurrency(invoice.paidAmount)}</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Balance Due</span>
                <span className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {invoice.status === "PAID" && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Paid in Full</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="VIEWED">Viewed</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Void Invoice AlertDialog */}
      <AlertDialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void this invoice? This action cannot be undone.
              The invoice will be marked as void and will no longer be payable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVoidInvoice} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Void Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
