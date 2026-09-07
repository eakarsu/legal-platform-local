"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

interface FieldErrors {
  [key: string]: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[\d\s\-().+]+$/
const zipRegex = /^\d{5}(-\d{4})?$/

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [clientType, setClientType] = useState("INDIVIDUAL")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    referralSource: "",
    notes: "",
  })

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName":
        if (clientType === "INDIVIDUAL" && !value.trim()) return "First name is required"
        if (value.length > 100) return "First name is too long"
        return ""
      case "lastName":
        if (clientType === "INDIVIDUAL" && !value.trim()) return "Last name is required"
        if (value.length > 100) return "Last name is too long"
        return ""
      case "companyName":
        if (clientType !== "INDIVIDUAL" && !value.trim()) return "Company name is required"
        if (value.length > 200) return "Company name is too long"
        return ""
      case "email":
        if (value && !emailRegex.test(value)) return "Invalid email address"
        return ""
      case "phone":
      case "mobile":
        if (value && !phoneRegex.test(value)) return "Invalid phone number"
        return ""
      case "zip":
        if (value && !zipRegex.test(value)) return "Invalid ZIP code (e.g., 10001 or 10001-1234)"
        return ""
      case "state":
        if (value && value.length > 2) return "Use 2-letter state abbreviation"
        return ""
      default:
        return ""
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {}
    if (clientType === "INDIVIDUAL") {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required"
    }
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Invalid email address"
    if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone number"
    if (formData.mobile && !phoneRegex.test(formData.mobile)) newErrors.mobile = "Invalid phone number"
    if (formData.zip && !zipRegex.test(formData.zip)) newErrors.zip = "Invalid ZIP code"
    if (formData.state && formData.state.length > 2) newErrors.state = "Use 2-letter state abbreviation"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!validateAll()) return

    setLoading(true)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: clientType,
        }),
      })

      if (res.ok) {
        const client = await res.json()
        router.push(`/clients/${client.id}`)
      } else {
        const data = await res.json()
        setSubmitError(data.error || "Failed to create client")
      }
    } catch (error) {
      console.error("Failed to create client:", error)
      setSubmitError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Client</h1>
          <p className="text-muted-foreground">
            Add a new client to your practice
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {submitError && (
            <div className="lg:col-span-2 p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {/* Client Type */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Client Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="NONPROFIT">Nonprofit</SelectItem>
                  <SelectItem value="GOVERNMENT">Government</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientType === "INDIVIDUAL" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                        required
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                        required
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    className={errors.companyName ? "border-red-500" : ""}
                    required
                  />
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={errors.state ? "border-red-500" : ""}
                    maxLength={2}
                    placeholder="NY"
                  />
                  {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    className={errors.zip ? "border-red-500" : ""}
                    placeholder="10001"
                  />
                  {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referralSource">Referral Source</Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => handleChange("referralSource", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Google Search">Google Search</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Bar Association">Bar Association</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Link href="/clients">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  )
}
