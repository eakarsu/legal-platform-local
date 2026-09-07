"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

interface Client {
  id: string
  firstName: string | null
  lastName: string | null
  companyName: string | null
  type: string
}

interface User {
  id: string
  name: string
  role: string
}

const caseTypes = [
  { value: 'CIVIL_LITIGATION', label: 'Civil Litigation' },
  { value: 'CRIMINAL_DEFENSE', label: 'Criminal Defense' },
  { value: 'FAMILY_LAW', label: 'Family Law' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
  { value: 'BANKRUPTCY', label: 'Bankruptcy' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'IMMIGRATION', label: 'Immigration' },
  { value: 'PERSONAL_INJURY', label: 'Personal Injury' },
  { value: 'ESTATE_PLANNING', label: 'Estate Planning' },
  { value: 'TAX', label: 'Tax' },
  { value: 'ENVIRONMENTAL', label: 'Environmental' },
  { value: 'OTHER', label: 'Other' }
]

const statuses = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' }
]

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
]

const billingMethods = [
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'FLAT_FEE', label: 'Flat Fee' },
  { value: 'CONTINGENCY', label: 'Contingency' },
  { value: 'RETAINER', label: 'Retainer' },
  { value: 'PRO_BONO', label: 'Pro Bono' }
]

export default function EditMatterPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [attorneys, setAttorneys] = useState<User[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    leadAttorneyId: '',
    caseType: 'CIVIL_LITIGATION',
    status: 'OPEN',
    priority: 'MEDIUM',
    courtName: '',
    caseNumber: '',
    judge: '',
    courtroom: '',
    statuteOfLimitations: '',
    closeDate: '',
    billingMethod: 'HOURLY',
    flatFeeAmount: '',
    contingencyPercent: '',
    estimatedValue: ''
  })

  useEffect(() => {
    fetchMatter()
    fetchClients()
    fetchAttorneys()
  }, [params.id])

  const fetchMatter = async () => {
    try {
      const res = await fetch(`/api/matters/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        const matter = data.matter
        setFormData({
          name: matter.name || '',
          description: matter.description || '',
          clientId: matter.client?.id || '',
          leadAttorneyId: matter.leadAttorney?.id || '',
          caseType: matter.caseType || 'CIVIL_LITIGATION',
          status: matter.status || 'OPEN',
          priority: matter.priority || 'MEDIUM',
          courtName: matter.courtName || '',
          caseNumber: matter.caseNumber || '',
          judge: matter.judge || '',
          courtroom: matter.courtroom || '',
          statuteOfLimitations: matter.statuteOfLimitations ? matter.statuteOfLimitations.split('T')[0] : '',
          closeDate: matter.closeDate ? matter.closeDate.split('T')[0] : '',
          billingMethod: matter.billingMethod || 'HOURLY',
          flatFeeAmount: matter.flatFeeAmount?.toString() || '',
          contingencyPercent: matter.contingencyPercent?.toString() || '',
          estimatedValue: matter.estimatedValue?.toString() || ''
        })
      } else {
        router.push('/matters')
      }
    } catch (error) {
      console.error('Failed to fetch matter:', error)
      router.push('/matters')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchAttorneys = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setAttorneys(data.users.filter((u: User) => ['PARTNER', 'ATTORNEY'].includes(u.role)))
      }
    } catch (error) {
      console.error('Failed to fetch attorneys:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/matters/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update matter')
      }

      router.push(`/matters/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update matter')
    } finally {
      setSaving(false)
    }
  }

  const getClientName = (client: Client) => {
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') {
      return client.companyName || 'N/A'
    }
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/matters/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matter
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Matter</h1>
        <p className="text-gray-500">Update matter information</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matter Information</CardTitle>
              <CardDescription>Basic matter details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Matter Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {getClientName(client)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadAttorneyId">Lead Attorney</Label>
                  <Select
                    value={formData.leadAttorneyId}
                    onValueChange={(v) => setFormData({ ...formData, leadAttorneyId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an attorney" />
                    </SelectTrigger>
                    <SelectContent>
                      {attorneys.map((attorney) => (
                        <SelectItem key={attorney.id} value={attorney.id}>
                          {attorney.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseType">Case Type *</Label>
                  <Select
                    value={formData.caseType}
                    onValueChange={(v) => setFormData({ ...formData, caseType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Close Date</Label>
                  <Input
                    id="closeDate"
                    name="closeDate"
                    type="date"
                    value={formData.closeDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Court Information</CardTitle>
              <CardDescription>Court and case details (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courtName">Court Name</Label>
                  <Input
                    id="courtName"
                    name="courtName"
                    value={formData.courtName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseNumber">Case Number</Label>
                  <Input
                    id="caseNumber"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judge">Judge</Label>
                  <Input
                    id="judge"
                    name="judge"
                    value={formData.judge}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courtroom">Courtroom</Label>
                  <Input
                    id="courtroom"
                    name="courtroom"
                    value={formData.courtroom}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statuteOfLimitations">Statute of Limitations</Label>
                  <Input
                    id="statuteOfLimitations"
                    name="statuteOfLimitations"
                    type="date"
                    value={formData.statuteOfLimitations}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Billing settings for this matter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingMethod">Billing Method</Label>
                  <Select
                    value={formData.billingMethod}
                    onValueChange={(v) => setFormData({ ...formData, billingMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billingMethods.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                  <Input
                    id="estimatedValue"
                    name="estimatedValue"
                    type="number"
                    step="0.01"
                    value={formData.estimatedValue}
                    onChange={handleChange}
                  />
                </div>
                {formData.billingMethod === 'FLAT_FEE' && (
                  <div className="space-y-2">
                    <Label htmlFor="flatFeeAmount">Flat Fee Amount ($)</Label>
                    <Input
                      id="flatFeeAmount"
                      name="flatFeeAmount"
                      type="number"
                      step="0.01"
                      value={formData.flatFeeAmount}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {formData.billingMethod === 'CONTINGENCY' && (
                  <div className="space-y-2">
                    <Label htmlFor="contingencyPercent">Contingency Percent (%)</Label>
                    <Input
                      id="contingencyPercent"
                      name="contingencyPercent"
                      type="number"
                      step="0.01"
                      max="100"
                      value={formData.contingencyPercent}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/matters/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving || !formData.clientId}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
