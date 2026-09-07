"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertTriangle,
  Building,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface TrustAccount {
  id: string
  name: string
  accountNumber: string
  bankName: string
  balance: number
  status: string
}

interface TrustTransaction {
  id: string
  type: string
  amount: number
  description: string
  date: string
  reference: string
  balance: number
  account: { name: string }
  client?: { firstName?: string; lastName?: string; companyName?: string; type: string }
  matter?: { name: string; matterNumber: string }
  createdBy: { firstName: string; lastName: string }
}

interface Client {
  id: string
  firstName?: string
  lastName?: string
  companyName?: string
  type: string
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

export default function TrustAccountingPage() {
  const [accounts, setAccounts] = useState<TrustAccount[]>([])
  const [transactions, setTransactions] = useState<TrustTransaction[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [disbursementDialogOpen, setDisbursementDialogOpen] = useState(false)

  const [depositForm, setDepositForm] = useState({
    accountId: "",
    clientId: "",
    matterId: "",
    amount: "",
    description: "",
    reference: "",
  })

  const [disbursementForm, setDisbursementForm] = useState({
    accountId: "",
    clientId: "",
    matterId: "",
    amount: "",
    description: "",
    reference: "",
    payee: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountsRes, transactionsRes, clientsRes, mattersRes] = await Promise.all([
          fetch("/api/trust/accounts"),
          fetch("/api/trust/transactions"),
          fetch("/api/clients"),
          fetch("/api/matters"),
        ])
        const [accountsData, transactionsData, clientsData, mattersData] = await Promise.all([
          accountsRes.json(),
          transactionsRes.json(),
          clientsRes.json(),
          mattersRes.json(),
        ])
        setAccounts(accountsData)
        setTransactions(transactionsData)
        const clientsList = clientsData.data || clientsData
        setClients(Array.isArray(clientsList) ? clientsList : [])
        const mattersList = mattersData.data || mattersData
        setMatters(Array.isArray(mattersList) ? mattersList : [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/trust/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...depositForm, type: "DEPOSIT" }),
      })

      if (res.ok) {
        setDepositDialogOpen(false)
        setDepositForm({
          accountId: "",
          clientId: "",
          matterId: "",
          amount: "",
          description: "",
          reference: "",
        })
        // Refresh data
        const [accountsRes, transactionsRes] = await Promise.all([
          fetch("/api/trust/accounts"),
          fetch("/api/trust/transactions"),
        ])
        setAccounts(await accountsRes.json())
        setTransactions(await transactionsRes.json())
      }
    } catch (error) {
      console.error("Failed to create deposit:", error)
    }
  }

  const handleDisbursement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/trust/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...disbursementForm, type: "DISBURSEMENT" }),
      })

      if (res.ok) {
        setDisbursementDialogOpen(false)
        setDisbursementForm({
          accountId: "",
          clientId: "",
          matterId: "",
          amount: "",
          description: "",
          reference: "",
          payee: "",
        })
        // Refresh data
        const [accountsRes, transactionsRes] = await Promise.all([
          fetch("/api/trust/accounts"),
          fetch("/api/trust/transactions"),
        ])
        setAccounts(await accountsRes.json())
        setTransactions(await transactionsRes.json())
      }
    } catch (error) {
      console.error("Failed to create disbursement:", error)
    }
  }

  const getClientName = (client?: TrustTransaction["client"]) => {
    if (!client) return "-"
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trust Accounting</h1>
          <p className="text-muted-foreground">Manage client trust funds (IOLTA/IOLA)</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Deposit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Trust Account *</Label>
                  <Select
                    value={depositForm.accountId}
                    onValueChange={(value) => setDepositForm((prev) => ({ ...prev, accountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} - {formatCurrency(acc.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select
                      value={depositForm.clientId}
                      onValueChange={(value) => setDepositForm((prev) => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.type === "BUSINESS" || client.type === "NONPROFIT"
                              ? client.companyName
                              : `${client.firstName} ${client.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matter</Label>
                    <Select
                      value={depositForm.matterId}
                      onValueChange={(value) => setDepositForm((prev) => ({ ...prev, matterId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No matter</SelectItem>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>
                            {matter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      value={depositForm.reference}
                      onChange={(e) => setDepositForm((prev) => ({ ...prev, reference: e.target.value }))}
                      placeholder="Check #, Wire ID, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={depositForm.description}
                    onChange={(e) => setDepositForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the deposit..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDepositDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Deposit</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={disbursementDialogOpen} onOpenChange={setDisbursementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Disbursement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Disbursement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDisbursement} className="space-y-4">
                <div className="space-y-2">
                  <Label>Trust Account *</Label>
                  <Select
                    value={disbursementForm.accountId}
                    onValueChange={(value) => setDisbursementForm((prev) => ({ ...prev, accountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} - {formatCurrency(acc.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select
                      value={disbursementForm.clientId}
                      onValueChange={(value) => setDisbursementForm((prev) => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.type === "BUSINESS" || client.type === "NONPROFIT"
                              ? client.companyName
                              : `${client.firstName} ${client.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matter</Label>
                    <Select
                      value={disbursementForm.matterId}
                      onValueChange={(value) => setDisbursementForm((prev) => ({ ...prev, matterId: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No matter</SelectItem>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>
                            {matter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payee *</Label>
                  <Input
                    value={disbursementForm.payee}
                    onChange={(e) => setDisbursementForm((prev) => ({ ...prev, payee: e.target.value }))}
                    placeholder="Name of payee"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={disbursementForm.amount}
                      onChange={(e) => setDisbursementForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      value={disbursementForm.reference}
                      onChange={(e) => setDisbursementForm((prev) => ({ ...prev, reference: e.target.value }))}
                      placeholder="Check #, Wire ID, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={disbursementForm.description}
                    onChange={(e) => setDisbursementForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the disbursement..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDisbursementDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Disbursement</Button>
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
            <CardTitle className="text-sm font-medium">Total Trust Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deposits (MTD)</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                transactions
                  .filter((t) => t.type === "DEPOSIT")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "DEPOSIT").length} deposits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disbursements (MTD)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                transactions
                  .filter((t) => t.type === "DISBURSEMENT")
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter((t) => t.type === "DISBURSEMENT").length} disbursements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter((a) => a.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">of {accounts.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Trust Account Compliance Reminder</h4>
              <p className="text-sm text-amber-700 mt-1">
                Ensure all trust account transactions comply with your jurisdiction's IOLTA/IOLA rules.
                Client funds must be kept separate from operating funds. Regular reconciliation is required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Trust Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="spinner" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Wallet className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No trust accounts</h3>
                  <p className="text-muted-foreground">Set up a trust account to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>****{account.accountNumber.slice(-4)}</TableCell>
                        <TableCell>{account.bankName}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(account.balance)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              account.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {account.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="spinner" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No transactions</h3>
                  <p className="text-muted-foreground">Record a deposit or disbursement to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                        <TableCell>
                          {tx.type === "DEPOSIT" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <ArrowDownLeft className="h-3 w-3 mr-1" />
                              Deposit
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              Disbursement
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getClientName(tx.client)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                        <TableCell>{tx.reference || "-"}</TableCell>
                        <TableCell className={`text-right font-mono ${tx.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(tx.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
