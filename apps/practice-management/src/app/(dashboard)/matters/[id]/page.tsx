"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, User2, Building2, Calendar, FileText, Clock, CheckSquare, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Matter {
  id: string
  matterNumber: string
  name: string
  description: string | null
  caseType: string
  status: string
  priority: string
  openDate: string
  closeDate: string | null
  courtName: string | null
  caseNumber: string | null
  judge: string | null
  courtroom: string | null
  statuteOfLimitations: string | null
  billingMethod: string
  flatFeeAmount: number | null
  contingencyPercent: number | null
  estimatedValue: number | null
  client: {
    id: string
    firstName: string | null
    lastName: string | null
    companyName: string | null
    type: string
  }
  leadAttorney: {
    id: string
    name: string
  } | null
  documents: any[]
  timeEntries: any[]
  tasks: any[]
  deadlines: any[]
}

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  OPEN: 'success',
  PENDING: 'warning',
  ON_HOLD: 'secondary',
  CLOSED: 'default',
  ARCHIVED: 'destructive'
}

const priorityColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'destructive'
}

export default function MatterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [matter, setMatter] = useState<Matter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatter()
  }, [params.id])

  const fetchMatter = async () => {
    try {
      const res = await fetch(`/api/matters/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMatter(data.matter)
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

  const getClientName = () => {
    if (!matter) return ''
    if (matter.client.type === 'COMPANY' || matter.client.type === 'GOVERNMENT' || matter.client.type === 'NON_PROFIT') {
      return matter.client.companyName || 'N/A'
    }
    return `${matter.client.firstName || ''} ${matter.client.lastName || ''}`.trim() || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!matter) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/matters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matters
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{matter.name}</h1>
            <p className="text-gray-500">Matter #{matter.matterNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/matters/${matter.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Matter
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Case Type</p>
                  <p className="text-sm font-medium">{matter.caseType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={statusColors[matter.status] || 'default'}>
                    {matter.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <Badge variant={priorityColors[matter.priority] || 'default'}>
                    {matter.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Method</p>
                  <p className="text-sm font-medium">{matter.billingMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Open Date</p>
                  <p className="text-sm font-medium">{formatDate(matter.openDate)}</p>
                </div>
                {matter.closeDate && (
                  <div>
                    <p className="text-sm text-gray-500">Close Date</p>
                    <p className="text-sm font-medium">{formatDate(matter.closeDate)}</p>
                  </div>
                )}
                {matter.estimatedValue && (
                  <div>
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="text-sm font-medium">${Number(matter.estimatedValue).toLocaleString()}</p>
                  </div>
                )}
                {matter.flatFeeAmount && (
                  <div>
                    <p className="text-sm text-gray-500">Flat Fee Amount</p>
                    <p className="text-sm font-medium">${Number(matter.flatFeeAmount).toLocaleString()}</p>
                  </div>
                )}
                {matter.contingencyPercent && (
                  <div>
                    <p className="text-sm text-gray-500">Contingency Percent</p>
                    <p className="text-sm font-medium">{matter.contingencyPercent}%</p>
                  </div>
                )}
              </div>
              {matter.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium">{matter.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(matter.courtName || matter.caseNumber || matter.judge) && (
            <Card>
              <CardHeader>
                <CardTitle>Court Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {matter.courtName && (
                    <div>
                      <p className="text-sm text-gray-500">Court Name</p>
                      <p className="text-sm font-medium">{matter.courtName}</p>
                    </div>
                  )}
                  {matter.caseNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Case Number</p>
                      <p className="text-sm font-medium">{matter.caseNumber}</p>
                    </div>
                  )}
                  {matter.judge && (
                    <div>
                      <p className="text-sm text-gray-500">Judge</p>
                      <p className="text-sm font-medium">{matter.judge}</p>
                    </div>
                  )}
                  {matter.courtroom && (
                    <div>
                      <p className="text-sm text-gray-500">Courtroom</p>
                      <p className="text-sm font-medium">{matter.courtroom}</p>
                    </div>
                  )}
                  {matter.statuteOfLimitations && (
                    <div>
                      <p className="text-sm text-gray-500">Statute of Limitations</p>
                      <p className="text-sm font-medium">{formatDate(matter.statuteOfLimitations)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {matter.client.type === 'COMPANY' || matter.client.type === 'GOVERNMENT' || matter.client.type === 'NON_PROFIT' ? (
                  <Building2 className="w-5 h-5 text-gray-400" />
                ) : (
                  <User2 className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <Link href={`/clients/${matter.client.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {getClientName()}
                  </Link>
                </div>
              </div>
              {matter.leadAttorney && (
                <div className="flex items-center gap-3">
                  <User2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Lead Attorney</p>
                    <p className="text-sm font-medium">{matter.leadAttorney.name}</p>
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
                  <p className="text-sm text-gray-500">Documents</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <p className="text-2xl font-bold">{matter.documents?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Entries</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-5 h-5 text-green-500" />
                    <p className="text-2xl font-bold">{matter.timeEntries?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tasks</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckSquare className="w-5 h-5 text-purple-500" />
                    <p className="text-2xl font-bold">{matter.tasks?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deadlines</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <p className="text-2xl font-bold">{matter.deadlines?.length || 0}</p>
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
