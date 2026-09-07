"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  MoreHorizontal,
  Upload,
  Eye,
  Folder,
  FileIcon,
  FileImage,
  FileSpreadsheet,
  Edit,
  User,
  Calendar,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { PageSkeleton } from "@/components/ui/skeleton"

interface Document {
  id: string
  name: string
  type: string
  category: string
  fileSize: number
  filePath: string
  createdAt: string
  matter?: { id: string; name: string; matterNumber: string }
  client?: { id: string; firstName?: string; lastName?: string; companyName?: string; type: string }
  uploadedBy: { firstName: string; lastName: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface Client {
  id: string
  firstName?: string
  lastName?: string
  companyName?: string
  type: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [matterFilter, setMatterFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editFormData, setEditFormData] = useState({
    name: "",
    matterId: "",
    clientId: "",
    category: "OTHER",
  })

  const [formData, setFormData] = useState({
    matterId: "",
    clientId: "",
    category: "OTHER",
    files: [] as File[],
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const category = categoryFilter === "all" ? "" : categoryFilter
        const matterId = matterFilter === "all" ? "" : matterFilter
        const [docsRes, mattersRes, clientsRes] = await Promise.all([
          fetch(`/api/documents?search=${search}&category=${category}&matterId=${matterId}`),
          fetch("/api/matters"),
          fetch("/api/clients"),
        ])
        const [docsData, mattersData, clientsData] = await Promise.all([
          docsRes.json(),
          mattersRes.json(),
          clientsRes.json(),
        ])
        setDocuments(docsData)
        const mattersList = mattersData.data || mattersData
        setMatters(Array.isArray(mattersList) ? mattersList : [])
        const clientsList = clientsData.data || clientsData
        setClients(Array.isArray(clientsList) ? clientsList : [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, categoryFilter, matterFilter])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, files: Array.from(e.target.files || []) }))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.files.length === 0) return

    setUploading(true)
    try {
      const uploadData = new FormData()
      formData.files.forEach((file) => uploadData.append("files", file))
      uploadData.append("matterId", formData.matterId)
      uploadData.append("clientId", formData.clientId)
      uploadData.append("category", formData.category)

      const res = await fetch("/api/documents", {
        method: "POST",
        body: uploadData,
      })

      if (res.ok) {
        const newDocs = await res.json()
        // Add new documents to the list
        setDocuments((prev) => [...newDocs, ...prev])
        setDialogOpen(false)
        setFormData({ matterId: "", clientId: "", category: "OTHER", files: [] })
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Failed to upload documents:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc)
    setDetailDialogOpen(true)
  }

  const handleEditClick = (doc: Document) => {
    setSelectedDocument(doc)
    setEditFormData({
      name: doc.name,
      matterId: doc.matter?.id || "",
      clientId: doc.client?.id || "",
      category: doc.category,
    })
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocument) return

    try {
      const res = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        setEditDialogOpen(false)
        // Refresh documents
        const category = categoryFilter === "all" ? "" : categoryFilter
        const matterId = matterFilter === "all" ? "" : matterFilter
        const docsRes = await fetch(`/api/documents?search=${search}&category=${category}&matterId=${matterId}`)
        setDocuments(await docsRes.json())
      }
    } catch (error) {
      console.error("Failed to update document:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <FileImage className="h-5 w-5 text-purple-500" />
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    return <FileIcon className="h-5 w-5 text-blue-500" />
  }

  const getClientName = (client?: Document["client"]) => {
    if (!client) return "-"
    if (client.type === "BUSINESS" || client.type === "NONPROFIT") {
      return client.companyName || "Unnamed"
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unnamed"
  }

  if (loading) return <PageSkeleton />

  const categories = [
    { value: "PLEADING", label: "Pleading" },
    { value: "MOTION", label: "Motion" },
    { value: "BRIEF", label: "Brief" },
    { value: "CONTRACT", label: "Contract" },
    { value: "CORRESPONDENCE", label: "Correspondence" },
    { value: "DISCOVERY", label: "Discovery" },
    { value: "EVIDENCE", label: "Evidence" },
    { value: "COURT_ORDER", label: "Court Order" },
    { value: "INTAKE_FORM", label: "Intake Form" },
    { value: "ENGAGEMENT_LETTER", label: "Engagement Letter" },
    { value: "INVOICE", label: "Invoice" },
    { value: "OTHER", label: "Other" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage case files and documents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Files *</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                />
                {formData.files.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formData.files.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Matter</Label>
                <Select
                  value={formData.matterId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, matterId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No matter</SelectItem>
                    {matters.map((matter) => (
                      <SelectItem key={matter.id} value={matter.id}>
                        {matter.name} ({matter.matterNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.type === "BUSINESS" || client.type === "NONPROFIT"
                          ? client.companyName
                          : `${client.firstName} ${client.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || formData.files.length === 0}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pleadings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.category === "PLEADING").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.category === "CONTRACT").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Discovery</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.category === "DISCOVERY").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={matterFilter} onValueChange={setMatterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Matters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matters</SelectItem>
                {matters.map((matter) => (
                  <SelectItem key={matter.id} value={matter.id}>
                    {matter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground mb-4">Upload your first document</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Matter / Client</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {doc.matter ? (
                        <div>
                          <p className="font-medium">{doc.matter.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.matter.matterNumber}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{getClientName(doc.client)}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{`${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(doc.filePath, '_blank')}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `/api/documents/${doc.id}?download=true`
                            }}
                            className="cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(doc)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Document Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.type)}
              Document Details
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getFileIcon(selectedDocument.type)}
                  <div>
                    <p className="font-semibold text-lg">{selectedDocument.name}</p>
                    <p className="text-sm text-blue-700">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white">{selectedDocument.category}</Badge>
              </div>

              {/* Matter/Client Info */}
              {selectedDocument.matter && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Matter</p>
                  <p className="font-medium">{selectedDocument.matter.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDocument.matter.matterNumber}</p>
                </div>
              )}

              {selectedDocument.client && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{getClientName(selectedDocument.client)}</p>
                </div>
              )}

              {/* Upload Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded By</p>
                  <p className="font-medium">
                    {selectedDocument.uploadedBy.firstName} {selectedDocument.uploadedBy.lastName}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedDocument.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedDocument.filePath, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `/api/documents/${selectedDocument.id}?download=true`
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(selectedDocument)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      handleDelete(selectedDocument.id)
                      setDetailDialogOpen(false)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update document details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Matter</Label>
              <Select
                value={editFormData.matterId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, matterId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select matter (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No matter</SelectItem>
                  {matters.map((matter) => (
                    <SelectItem key={matter.id} value={matter.id}>
                      {matter.name} ({matter.matterNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={editFormData.clientId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.type === "BUSINESS" || client.type === "NONPROFIT"
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
