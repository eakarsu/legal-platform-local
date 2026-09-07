"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, User, Calendar, Briefcase, FileType } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: string
  size: number
  description: string | null
  version: number
  tags: string[]
  filePath: string
  createdAt: string
  matter: {
    id: string
    name: string
    matterNumber: string
  } | null
  uploadedBy: {
    id: string
    name: string
  }
}

const typeColors: Record<string, string> = {
  CONTRACT: 'bg-blue-100 text-blue-800',
  PLEADING: 'bg-purple-100 text-purple-800',
  CORRESPONDENCE: 'bg-green-100 text-green-800',
  COURT_FILING: 'bg-red-100 text-red-800',
  DISCOVERY: 'bg-yellow-100 text-yellow-800',
  EVIDENCE: 'bg-orange-100 text-orange-800',
  INTERNAL: 'bg-gray-100 text-gray-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setDocument(data.document)
      } else {
        router.push('/documents')
      }
    } catch (error) {
      console.error('Failed to fetch document:', error)
      router.push('/documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return
    try {
      const res = await fetch(`/api/documents/${document.id}/download`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = document.name
        window.document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        window.document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/documents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
            <p className="text-gray-500">Version {document.version}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeColors[document.type] || typeColors.OTHER}`}>
                    {document.type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="text-sm font-medium">{formatFileSize(document.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="text-sm font-medium">{document.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="text-sm font-medium">{formatDateTime(document.createdAt)}</p>
                </div>
              </div>
              {document.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium">{document.description}</p>
                </div>
              )}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {document.matter && (
            <Card>
              <CardHeader>
                <CardTitle>Related Matter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <Link href={`/matters/${document.matter.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {document.matter.matterNumber} - {document.matter.name}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{document.uploadedBy.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(document.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
