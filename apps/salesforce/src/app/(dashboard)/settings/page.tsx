"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Building,
  Users,
  DollarSign,
  Clock,
  Shield,
  Save,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  hourlyRate: number
  status: string
}

interface Firm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website: string
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [firm, setFirm] = useState<Firm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, firmRes] = await Promise.all([
          fetch("/api/settings/users"),
          fetch("/api/settings/firm"),
        ])
        const [usersData, firmData] = await Promise.all([
          usersRes.json(),
          firmRes.json(),
        ])
        setUsers(usersData)
        if (firmData) setFirm(firmData)
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveFirm = async () => {
    setSaving(true)
    try {
      await fetch("/api/settings/firm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firm),
      })
    } catch (error) {
      console.error("Failed to save firm settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUserRate = async (userId: string, hourlyRate: string) => {
    try {
      await fetch(`/api/settings/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hourlyRate: parseFloat(hourlyRate) }),
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, hourlyRate: parseFloat(hourlyRate) } : u))
      )
    } catch (error) {
      console.error("Failed to update user rate:", error)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      PARTNER: "bg-purple-100 text-purple-800",
      ASSOCIATE: "bg-blue-100 text-blue-800",
      PARALEGAL: "bg-green-100 text-green-800",
      SECRETARY: "bg-gray-100 text-gray-800",
      BILLING: "bg-amber-100 text-amber-800",
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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage firm settings and configuration</p>
      </div>

      <Tabs defaultValue="firm">
        <TabsList>
          <TabsTrigger value="firm">
            <Building className="h-4 w-4 mr-2" />
            Firm Information
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users & Rates
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="h-4 w-4 mr-2" />
            Billing Settings
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="firm" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
              <CardDescription>
                Basic information about your law firm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firm Name</Label>
                  <Input
                    value={firm.name}
                    onChange={(e) => setFirm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={firm.email}
                    onChange={(e) => setFirm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={firm.phone}
                    onChange={(e) => setFirm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={firm.website}
                    onChange={(e) => setFirm((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={firm.address}
                  onChange={(e) => setFirm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={firm.city}
                    onChange={(e) => setFirm((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={firm.state}
                    onChange={(e) => setFirm((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={firm.zipCode}
                    onChange={(e) => setFirm((prev) => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveFirm} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Users & Billing Rates</CardTitle>
              <CardDescription>
                Manage team members and their hourly rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={user.hourlyRate}
                            className="w-24"
                            onBlur={(e) => handleUpdateUserRate(user.id, e.target.value)}
                          />
                          <span className="text-muted-foreground">/hr</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Billing Settings</CardTitle>
                <CardDescription>
                  Configure default billing options for new matters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Billing Type</Label>
                    <Select defaultValue="HOURLY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="FLAT_FEE">Flat Fee</SelectItem>
                        <SelectItem value="CONTINGENCY">Contingency</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Terms (Days)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Net 15</SelectItem>
                        <SelectItem value="30">Net 30</SelectItem>
                        <SelectItem value="45">Net 45</SelectItem>
                        <SelectItem value="60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Time Increment</Label>
                    <Select defaultValue="0.1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">6 minutes (0.1 hrs)</SelectItem>
                        <SelectItem value="0.25">15 minutes (0.25 hrs)</SelectItem>
                        <SelectItem value="0.5">30 minutes (0.5 hrs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Late Fee Percentage</Label>
                    <Input type="number" defaultValue="1.5" step="0.1" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Customization</CardTitle>
                <CardDescription>
                  Customize invoice appearance and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice Header Text</Label>
                  <Input placeholder="e.g., Thank you for your business" />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Footer Text</Label>
                  <Input placeholder="e.g., Payment is due within 30 days" />
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changePwLoading, setChangePwLoading] = useState(false)
  const [changePwMessage, setChangePwMessage] = useState("")
  const [changePwError, setChangePwError] = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePwError("")
    setChangePwMessage("")

    if (newPassword !== confirmPassword) {
      setChangePwError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setChangePwError("Password must be at least 8 characters")
      return
    }

    setChangePwLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()

      if (res.ok) {
        setChangePwMessage("Password changed successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setChangePwError(data.error || "Failed to change password")
      }
    } catch {
      setChangePwError("Something went wrong")
    } finally {
      setChangePwLoading(false)
    }
  }

  const handleSendVerification = async () => {
    setVerifyLoading(true)
    setVerifyMessage("")
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" })
      const data = await res.json()
      setVerifyMessage(data.message || "Verification email sent")
    } catch {
      setVerifyMessage("Failed to send verification email")
    } finally {
      setVerifyLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return Math.min(4, score)
  }

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
  const strength = getPasswordStrength(newPassword)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {changePwError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{changePwError}</div>
            )}
            {changePwMessage && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{changePwMessage}</div>
            )}
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength >= 3 ? "text-green-600" : strength >= 2 ? "text-yellow-600" : "text-red-600"}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
            <Button type="submit" disabled={changePwLoading}>
              {changePwLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Verify your email address for account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifyMessage && (
            <div className="p-3 bg-blue-50 text-blue-600 text-sm rounded-lg">{verifyMessage}</div>
          )}
          <p className="text-sm text-muted-foreground">
            Click below to send a verification email to your registered email address.
          </p>
          <Button variant="outline" onClick={handleSendVerification} disabled={verifyLoading}>
            {verifyLoading ? "Sending..." : "Send Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
