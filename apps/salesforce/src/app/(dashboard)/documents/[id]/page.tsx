"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  Folder,
  ExternalLink,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Document {
  id: string
  name: string
  type: string
  category: string
  size: number
  url: string
  createdAt: string
  matter?: { id: string; name: string; matterNumber: string }
  client?: { id: string; firstName?: string; lastName?: string; companyName?: string; type: string }
  uploadedBy: { firstName: string; lastName: string }
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${params.id}`)
        if (res.ok) {
          setDocument(await res.json())
        } else {
          router.push("/documents")
        }
      } catch (error) {
        console.error("Failed to fetch document:", error)
        router.push("/documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const res = await fetch(`/api/documents/${params.id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/documents")
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getClientName = (client?: Document["client"]) => {
    if (!client) return null
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  const canPreview = (type: string) => {
    return type.includes("pdf") || type.includes("image")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{document.category}</Badge>
              <span className="text-muted-foreground">{formatFileSize(document.size)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={document.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={document.url} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Preview / Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {canPreview(document.type) ? (
                document.type.includes("pdf") ? (
                  <iframe
                    src={document.url}
                    className="w-full h-[600px] border rounded"
                    title={document.name}
                  />
                ) : (
                  <img
                    src={document.url}
                    alt={document.name}
                    className="max-w-full h-auto rounded"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href={document.url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download to view
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="font-medium">{document.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{document.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDate(document.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded By</p>
                  <p className="font-medium">
                    {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Matter/Client */}
          {(document.matter || document.client) && (
            <Card>
              <CardHeader>
                <CardTitle>Related To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.matter && (
                  <Link href={`/matters/${document.matter.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-muted-foreground">Matter</p>
                      <p className="font-medium">{document.matter.name}</p>
                      <p className="text-sm text-muted-foreground">{document.matter.matterNumber}</p>
                    </div>
                  </Link>
                )}

                {document.client && (
                  <Link href={`/clients/${document.client.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{getClientName(document.client)}</p>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
