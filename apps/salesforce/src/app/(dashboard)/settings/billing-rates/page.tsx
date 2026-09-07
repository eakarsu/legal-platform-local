"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, DollarSign, Clock, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface User {
  id: string
  firstName: string
  lastName: string
  role: string
  hourlyRate: number
}

interface ActivityCode {
  id: string
  code: string
  name: string
  description?: string
  category?: string
}

interface ExpenseCode {
  id: string
  code: string
  name: string
  description?: string
}

export default function BillingRatesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([])
  const [expenseCodes, setExpenseCodes] = useState<ExpenseCode[]>([])
  const [loading, setLoading] = useState(true)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)

  const [activityForm, setActivityForm] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
  })

  const [expenseForm, setExpenseForm] = useState({
    code: "",
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, activityRes, expenseRes] = await Promise.all([
        fetch("/api/settings/users"),
        fetch("/api/activity-codes"),
        fetch("/api/expense-codes"),
      ])
      const [usersData, activityData, expenseData] = await Promise.all([
        usersRes.json(),
        activityRes.json(),
        expenseRes.json(),
      ])
      setUsers(usersData)
      setActivityCodes(activityData)
      setExpenseCodes(expenseData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRate = async (userId: string, rate: string) => {
    try {
      await fetch(`/api/settings/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hourlyRate: parseFloat(rate) || 0 }),
      })
    } catch (error) {
      console.error("Failed to update rate:", error)
    }
  }

  const handleAddActivityCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/activity-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityForm),
      })
      if (res.ok) {
        setActivityDialogOpen(false)
        setActivityForm({ code: "", name: "", description: "", category: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add activity code:", error)
    }
  }

  const handleAddExpenseCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/expense-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      })
      if (res.ok) {
        setExpenseDialogOpen(false)
        setExpenseForm({ code: "", name: "", description: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add expense code:", error)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      PARTNER: "bg-purple-100 text-purple-800",
      ASSOCIATE: "bg-blue-100 text-blue-800",
      PARALEGAL: "bg-green-100 text-green-800",
      SECRETARY: "bg-gray-100 text-gray-800",
    }
    return colors[role] || colors.SECRETARY
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Rates & Codes</h1>
        <p className="text-muted-foreground">Manage hourly rates and billing codes</p>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">
            <DollarSign className="h-4 w-4 mr-2" />
            Hourly Rates
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity Codes
          </TabsTrigger>
          <TabsTrigger value="expense">
            <FileText className="h-4 w-4 mr-2" />
            Expense Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Rates by User</CardTitle>
              <CardDescription>
                Set default billing rates for each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-40">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={user.hourlyRate}
                            onBlur={(e) => handleUpdateRate(user.id, e.target.value)}
                          />
                          <span className="text-muted-foreground">/hr</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Codes (UTBMS)</CardTitle>
                  <CardDescription>
                    Standard activity codes for time entries
                  </CardDescription>
                </div>
                <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Activity Code</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddActivityCode} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input
                            value={activityForm.code}
                            onChange={(e) =>
                              setActivityForm((prev) => ({ ...prev, code: e.target.value }))
                            }
                            placeholder="e.g., A101"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            value={activityForm.category}
                            onChange={(e) =>
                              setActivityForm((prev) => ({ ...prev, category: e.target.value }))
                            }
                            placeholder="e.g., Litigation"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={activityForm.name}
                          onChange={(e) =>
                            setActivityForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g., Plan and prepare for trial"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={activityForm.description}
                          onChange={(e) =>
                            setActivityForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Detailed description..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActivityDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Code</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>{code.name}</TableCell>
                      <TableCell>
                        {code.category && <Badge variant="outline">{code.category}</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Codes</CardTitle>
                  <CardDescription>
                    Standard expense codes for billing
                  </CardDescription>
                </div>
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expense Code</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddExpenseCode} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Code *</Label>
                        <Input
                          value={expenseForm.code}
                          onChange={(e) =>
                            setExpenseForm((prev) => ({ ...prev, code: e.target.value }))
                          }
                          placeholder="e.g., E101"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={expenseForm.name}
                          onChange={(e) =>
                            setExpenseForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g., Filing fees"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={expenseForm.description}
                          onChange={(e) =>
                            setExpenseForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Detailed description..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExpenseDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Code</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>{code.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
