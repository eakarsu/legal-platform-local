"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface Matter {
  id: string
  name: string
  matterNumber: string
  client: {
    id: string
    firstName: string | null
    lastName: string | null
    companyName: string | null
    type: string
  }
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matters, setMatters] = useState<Matter[]>([])
  const [formData, setFormData] = useState({
    matterId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    taxRate: '0',
    discount: '0'
  })

  useEffect(() => {
    fetchMatters()
  }, [])

  const fetchMatters = async () => {
    try {
      const res = await fetch('/api/matters?status=OPEN')
      if (res.ok) {
        const data = await res.json()
        setMatters(data.matters)
      }
    } catch (error) {
      console.error('Failed to fetch matters:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const selectedMatter = matters.find(m => m.id === formData.matterId)
      if (!selectedMatter) {
        setError('Please select a matter')
        setLoading(false)
        return
      }

      // Calculate invoice amounts
      const subtotal = 0 // This would normally come from time entries
      const taxRate = parseFloat(formData.taxRate) || 0
      const discount = parseFloat(formData.discount) || 0
      const taxAmount = (subtotal - discount) * (taxRate / 100)
      const total = subtotal - discount + taxAmount

      const invoiceData = {
        matterId: formData.matterId,
        clientId: selectedMatter.client.id,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        subtotal: subtotal.toString(),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        notes: formData.notes
      }

      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })

      if (res.ok) {
        router.push('/billing')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create invoice')
      }
    } catch (error) {
      setError('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (matter: Matter) => {
    const { client } = matter
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') {
      return client.companyName || 'N/A'
    }
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/billing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Invoice</CardTitle>
          <CardDescription>Generate an invoice for a matter</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="matter">Matter *</Label>
              <Select
                value={formData.matterId}
                onValueChange={(v) => setFormData({ ...formData, matterId: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a matter" />
                </SelectTrigger>
                <SelectContent>
                  {matters.map((matter) => (
                    <SelectItem key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.name} ({getClientName(matter)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount ($)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Additional notes for the invoice..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/billing')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.matterId}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
