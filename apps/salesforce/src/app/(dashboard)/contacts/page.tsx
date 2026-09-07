"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Users, Phone, Mail, Building, Pencil, Trash2, Download } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/ui/pagination"
import { SortHeader } from "@/components/ui/sort-header"
import { BulkActions } from "@/components/ui/bulk-actions"
import { PageSkeleton } from "@/components/ui/skeleton"

interface Contact {
  id: string
  type: string
  firstName: string
  lastName: string
  company?: string
  title?: string
  email?: string
  phone?: string
  notes?: string
  matter?: { id: string; name: string; matterNumber: string }
  client?: { id: string; firstName?: string; lastName?: string; companyName?: string; type: string }
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

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const [formData, setFormData] = useState({
    type: "OPPOSING_COUNSEL",
    firstName: "",
    lastName: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
    matterId: "",
    clientId: "",
  })

  const fetchData = async () => {
    try {
      const type = typeFilter === "all" ? "" : typeFilter
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (type) params.set("type", type)
      params.set("page", String(page))
      params.set("limit", String(limit))
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)

      const [contactsRes, mattersRes, clientsRes] = await Promise.all([
        fetch(`/api/contacts?${params}`),
        fetch("/api/matters"),
        fetch("/api/clients"),
      ])
      const [contactsData, mattersData, clientsData] = await Promise.all([
        contactsRes.json(),
        mattersRes.json(),
        clientsRes.json(),
      ])
      setContacts(contactsData.data || contactsData)
      setPagination(contactsData.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 })
      setMatters(mattersData.data || mattersData)
      setClients(clientsData.data || clientsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search, typeFilter, page, limit, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          type: "OPPOSING_COUNSEL",
          firstName: "",
          lastName: "",
          company: "",
          title: "",
          email: "",
          phone: "",
          notes: "",
          matterId: "",
          clientId: "",
        })
        await fetchData()
      }
    } catch (error) {
      console.error("Failed to create contact:", error)
    }
  }

  const contactTypes = [
    { value: "CLIENT_CONTACT", label: "Client Contact" },
    { value: "OPPOSING_COUNSEL", label: "Opposing Counsel" },
    { value: "COURT_CONTACT", label: "Court Contact" },
    { value: "EXPERT_WITNESS", label: "Expert Witness" },
    { value: "VENDOR", label: "Vendor" },
    { value: "OTHER", label: "Other" },
  ]

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CLIENT_CONTACT: "bg-blue-100 text-blue-800",
      OPPOSING_COUNSEL: "bg-red-100 text-red-800",
      COURT_CONTACT: "bg-amber-100 text-amber-800",
      EXPERT_WITNESS: "bg-purple-100 text-purple-800",
      VENDOR: "bg-green-100 text-green-800",
      OTHER: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.OTHER
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setDetailDialogOpen(true)
  }

  const handleEditClick = (contact: Contact) => {
    setSelectedContact(contact)
    setFormData({
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company || "",
      title: contact.title || "",
      email: contact.email || "",
      phone: contact.phone || "",
      notes: contact.notes || "",
      matterId: "",
      clientId: contact.client?.id || "",
    })
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact) return
    try {
      const res = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setEditDialogOpen(false)
        setSelectedContact(null)
        setFormData({
          type: "OPPOSING_COUNSEL",
          firstName: "",
          lastName: "",
          company: "",
          title: "",
          email: "",
          phone: "",
          notes: "",
          matterId: "",
          clientId: "",
        })
        await fetchData()
      }
    } catch (error) {
      console.error("Failed to update contact:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/contacts/${deleteId}`, { method: "DELETE" })
      setDeleteId(null)
      setDetailDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error("Failed to delete contact:", error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      await fetch("/api/contacts/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setSelectedIds(new Set())
      fetchData()
    } catch (error) {
      console.error("Failed to bulk delete:", error)
    } finally {
      setBulkDeleteOpen(false)
    }
  }

  const handleExport = () => {
    window.location.href = "/api/contacts/export"
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)))
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage case-related contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company/Firm</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Related Matter</Label>
                    <Select
                      value={formData.matterId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, matterId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No matter</SelectItem>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>
                            {matter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Related Client</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
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
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Contact</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={() => setBulkDeleteOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

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
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contactTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No contacts found</h3>
              <p className="text-muted-foreground mb-4">Add your first contact</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.size === contacts.length && contacts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Name" field="lastName" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Type" field="type" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Company" field="company" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Related To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleContactClick(contact)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(contact.id)}
                          onCheckedChange={() => toggleSelect(contact.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          {contact.title && (
                            <p className="text-sm text-muted-foreground">{contact.title}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(contact.type)}>
                          {contact.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {contact.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a href={`tel:${contact.phone}`} className="hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.matter && (
                          <p className="text-sm">{contact.matter.name}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1) }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Contact Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedContact?.firstName} {selectedContact?.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedContact.type)}>
                  {selectedContact.type.replace("_", " ")}
                </Badge>
              </div>

              <div className="space-y-3">
                {selectedContact.title && (
                  <div>
                    <p className="font-medium">Title</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.title}</p>
                  </div>
                )}

                {selectedContact.company && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Company/Firm</p>
                      <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                    </div>
                  </div>
                )}

                {selectedContact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${selectedContact.email}`} className="text-sm text-primary hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                )}

                {selectedContact.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${selectedContact.phone}`} className="text-sm hover:underline">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedContact.matter && (
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Related Matter</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.matter.name} ({selectedContact.matter.matterNumber})
                    </p>
                  </div>
                )}

                {selectedContact.notes && (
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(selectedContact.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleEditClick(selectedContact)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company/Firm</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Related Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
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
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Contacts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected contacts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
