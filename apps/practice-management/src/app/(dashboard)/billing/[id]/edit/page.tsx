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

const invoiceStatuses = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIAL', label: 'Partial Payment' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'WRITTEN_OFF', label: 'Written Off' }
]

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [clientName, setClientName] = useState('')
  const [matterInfo, setMatterInfo] = useState('')
  const [formData, setFormData] = useState({
    issueDate: '',
    dueDate: '',
    status: 'DRAFT',
    subtotal: '',
    taxRate: '',
    taxAmount: '',
    discount: '',
    total: '',
    notes: ''
  })

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/billing/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        const invoice = data.invoice
        setInvoiceNumber(invoice.invoiceNumber)

        // Get client name
        if (invoice.client) {
          if (invoice.client.type === 'COMPANY' || invoice.client.type === 'GOVERNMENT' || invoice.client.type === 'NON_PROFIT') {
            setClientName(invoice.client.companyName || 'N/A')
          } else {
            setClientName(`${invoice.client.firstName || ''} ${invoice.client.lastName || ''}`.trim() || 'N/A')
          }
        }

        // Get matter info
        if (invoice.matter) {
          setMatterInfo(`${invoice.matter.matterNumber} - ${invoice.matter.name}`)
        }

        setFormData({
          issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
          dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
          status: invoice.status || 'DRAFT',
          subtotal: invoice.subtotal?.toString() || '',
          taxRate: invoice.taxRate?.toString() || '',
          taxAmount: invoice.taxAmount?.toString() || '',
          discount: invoice.discount?.toString() || '',
          total: invoice.total?.toString() || '',
          notes: invoice.notes || ''
        })
      } else {
        router.push('/billing')
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      router.push('/billing')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Recalculate total when relevant fields change
      if (['subtotal', 'taxRate', 'discount'].includes(name)) {
        const subtotal = parseFloat(updated.subtotal) || 0
        const taxRate = parseFloat(updated.taxRate) || 0
        const discount = parseFloat(updated.discount) || 0
        const taxAmount = (subtotal - discount) * (taxRate / 100)
        const total = subtotal - discount + taxAmount

        updated.taxAmount = taxAmount.toFixed(2)
        updated.total = total.toFixed(2)
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/billing/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update invoice')
      }

      router.push(`/billing/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice')
    } finally {
      setSaving(false)
    }
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
          <Link href={`/billing/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoice
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
        <p className="text-gray-500">Invoice #{invoiceNumber}</p>
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
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Basic invoice information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Client</Label>
                  <p className="text-sm font-medium">{clientName}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Matter</Label>
                  <p className="text-sm font-medium">{matterInfo}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {invoiceStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Invoice amounts and calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal ($)</Label>
                  <Input
                    id="subtotal"
                    name="subtotal"
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount ($)</Label>
                  <Input
                    id="taxAmount"
                    name="taxAmount"
                    type="number"
                    step="0.01"
                    value={formData.taxAmount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Total</Label>
                  <span className="text-2xl font-bold">
                    ${parseFloat(formData.total || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional notes for the invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Additional notes..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/billing/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
