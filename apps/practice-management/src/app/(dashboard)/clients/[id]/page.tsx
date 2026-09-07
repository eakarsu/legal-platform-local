"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building2, User, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Client {
  id: string
  clientNumber: string
  type: string
  status: string
  firstName: string | null
  lastName: string | null
  middleName: string | null
  companyName: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  fax: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  billingRate: number | null
  billingMethod: string
  portalEnabled: boolean
  createdAt: string
  matters: any[]
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  PROSPECTIVE: 'warning',
  FORMER: 'destructive'
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [params.id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data.client)
      } else {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

  const getClientName = () => {
    if (!client) return ''
    if (client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT') {
      return client.companyName || 'N/A'
    }
    return `${client.firstName || ''} ${client.middleName ? client.middleName + ' ' : ''}${client.lastName || ''}`.trim() || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            {client.type === 'COMPANY' || client.type === 'GOVERNMENT' || client.type === 'NON_PROFIT' ? (
              <Building2 className="w-8 h-8 text-gray-600" />
            ) : (
              <User className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getClientName()}</h1>
            <p className="text-gray-500">Client #{client.clientNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-sm font-medium">{client.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={statusColors[client.status] || 'default'}>
                    {client.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Method</p>
                  <p className="text-sm font-medium">{client.billingMethod.replace('_', ' ')}</p>
                </div>
                {client.billingRate && (
                  <div>
                    <p className="text-sm text-gray-500">Billing Rate</p>
                    <p className="text-sm font-medium">${client.billingRate}/hr</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Client Portal</p>
                  <p className="text-sm font-medium">{client.portalEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${client.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${client.phone}`} className="text-sm font-medium">
                      {client.phone}
                    </a>
                  </div>
                </div>
              )}
              {client.mobile && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <a href={`tel:${client.mobile}`} className="text-sm font-medium">
                      {client.mobile}
                    </a>
                  </div>
                </div>
              )}
              {client.fax && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fax</p>
                    <p className="text-sm font-medium">{client.fax}</p>
                  </div>
                </div>
              )}
              {(client.address || client.city || client.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <div className="text-sm font-medium">
                      {client.address && <p>{client.address}</p>}
                      {(client.city || client.state || client.zipCode) && (
                        <p>
                          {client.city}{client.city && client.state && ', '}{client.state} {client.zipCode}
                        </p>
                      )}
                      {client.country && <p>{client.country}</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Active Matters</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <p className="text-2xl font-bold">{client.matters?.length || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
