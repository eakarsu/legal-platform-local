"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, FileText, User, Building2, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  paidDate: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  amountPaid: number
  notes: string | null
  matter: {
    id: string
    name: string
    matterNumber: string
  }
  client: {
    id: string
    firstName: string | null
    lastName: string | null
    companyName: string | null
    type: string
  }
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  SENT: 'warning',
  PAID: 'success',
  OVERDUE: 'destructive',
  CANCELLED: 'default'
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/billing/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setInvoice(data.invoice)
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

  const getClientName = () => {
    if (!invoice) return ''
    if (invoice.client.type === 'COMPANY' || invoice.client.type === 'GOVERNMENT' || invoice.client.type === 'NON_PROFIT') {
      return invoice.client.companyName || 'N/A'
    }
    return `${invoice.client.firstName || ''} ${invoice.client.lastName || ''}`.trim() || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  const balanceDue = Number(invoice.total) - Number(invoice.amountPaid)

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

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-gray-500">{getClientName()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/billing/${invoice.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={statusColors[invoice.status] || 'default'}>
                    {invoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <p className="text-sm text-gray-500">Paid Date</p>
                    <p className="text-sm font-medium">{formatDate(invoice.paidDate)}</p>
                  </div>
                )}
              </div>
              {invoice.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm font-medium">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-sm font-medium">${Number(invoice.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="text-sm font-medium text-green-600">-${Number(invoice.discount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              {Number(invoice.taxRate) > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Tax ({invoice.taxRate}%)</p>
                  <p className="text-sm font-medium">${Number(invoice.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              {Number(invoice.amountPaid) > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="text-sm font-medium text-green-600">${Number(invoice.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <p className="font-semibold text-lg">Balance Due</p>
                <p className={`font-semibold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Matter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <Link href={`/matters/${invoice.matter.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {invoice.matter.matterNumber} - {invoice.matter.name}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {invoice.client.type === 'COMPANY' || invoice.client.type === 'GOVERNMENT' || invoice.client.type === 'NON_PROFIT' ? (
                  <Building2 className="w-5 h-5 text-gray-400" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Link href={`/clients/${invoice.client.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {getClientName()}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button className="w-full" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
