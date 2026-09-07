"use client"

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  Send,
  Inbox,
  Send as SendIcon,
  Download,
  FileText,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Message {
  id: string
  type: string
  subject: string | null
  content: string
  isRead: boolean
  createdAt: string
  sender: { id: string; name: string } | null
  client: { id: string; firstName: string | null; lastName: string | null; companyName: string | null } | null
}

interface Client {
  id: string
  firstName: string | null
  lastName: string | null
  companyName: string | null
  type: string
  email: string | null
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [formData, setFormData] = useState({
    clientId: '',
    type: 'EMAIL',
    subject: '',
    content: ''
  })

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 25, totalPages: 0 })

  // Sort state
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [bulkUpdateValue, setBulkUpdateValue] = useState('true')

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/messages?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter])

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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleSendMessage = async () => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({ clientId: '', type: 'EMAIL', subject: '', content: '' })
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      const res = await fetch(`/api/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedMessage(data.message)
        setReplyText('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchMessages()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        if (selectedMessage?.id === id) {
          setDetailDialogOpen(false)
          setSelectedMessage(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'messages', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchMessages()
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const handleBulkUpdate = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', entity: 'messages', ids: Array.from(selectedIds), data: { isRead: bulkUpdateValue === 'true' } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchMessages()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    window.open(`/api/export?entity=messages&format=${format}`, '_blank')
  }

  const getClientName = (client: Message['client']) => {
    if (!client) return 'System'
    if (client.companyName) return client.companyName
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return Mail
      case 'SMS': return MessageSquare
      case 'PORTAL_MESSAGE': return MessageSquare
      default: return Mail
    }
  }

  const handleRowClick = (message: Message) => {
    setSelectedMessage(message)
    setDetailDialogOpen(true)
    setReplyText('')
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500">Client communication center</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Send a message to a client</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
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
                          {client.companyName || `${client.firstName} ${client.lastName}`}
                          {client.email && ` (${client.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PORTAL_MESSAGE">Client Portal</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={!formData.clientId || !formData.content}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setBulkUpdateDialogOpen(true)}>
            Mark Read/Unread
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="PORTAL_MESSAGE">Portal Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No messages found</p>
              <Button onClick={() => setDialogOpen(true)}>Send Your First Message</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === messages.length && messages.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[30px]"></TableHead>
                    <SortHeader label="Subject" field="subject" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>From / To</TableHead>
                    <SortHeader label="Type" field="type" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Read" field="isRead" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Date" field="createdAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => {
                    const Icon = getMessageIcon(message.type)
                    return (
                      <TableRow
                        key={message.id}
                        className={`cursor-pointer hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => handleRowClick(message)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(message.id)} onCheckedChange={() => toggleSelect(message.id)} />
                        </TableCell>
                        <TableCell>
                          <Icon className="w-4 h-4 text-gray-400" />
                        </TableCell>
                        <TableCell className={`font-medium ${!message.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {message.subject || '(No Subject)'}
                        </TableCell>
                        <TableCell>{getClientName(message.client)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{message.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {message.isRead ? (
                            <Badge variant="default">Read</Badge>
                          ) : (
                            <Badge variant="warning">Unread</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTime(message.createdAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {selectedMessage?.subject || 'No Subject'}
            </DialogTitle>
            <DialogDescription>
              From: {selectedMessage && getClientName(selectedMessage.client)} | {selectedMessage && formatDateTime(selectedMessage.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedMessage.type}</Badge>
                {selectedMessage.isRead ? (
                  <Badge variant="default">Read</Badge>
                ) : (
                  <Badge variant="warning">Unread</Badge>
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {selectedMessage.content.split('\n\n---\n').map((part, index) => {
                  const isReply = part.startsWith('**Reply from')
                  if (isReply) {
                    const lines = part.split('\n')
                    const header = lines[0].replace(/\*\*/g, '')
                    const replyContent = lines.slice(1).join('\n')
                    return (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-xs text-blue-600 font-medium mb-2">{header}</p>
                        <p className="text-sm whitespace-pre-wrap">{replyContent}</p>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        Original message from {getClientName(selectedMessage.client)}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{part}</p>
                    </div>
                  )
                })}
              </div>

              {/* Reply */}
              <div className="pt-4 border-t">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between">
                    <Button variant="destructive" onClick={() => {
                      setDetailDialogOpen(false)
                      setDeleteTarget({ id: selectedMessage.id, name: selectedMessage.subject || 'this message' })
                      setDeleteDialogOpen(true)
                    }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      disabled={!replyText.trim()}
                      onClick={handleSendReply}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Message"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Message"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Messages"
        description={`Are you sure you want to delete ${selectedIds.size} selected message(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Messages`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Message(s)</DialogTitle>
            <DialogDescription>Change the read status of selected messages</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Mark as Read</SelectItem>
                <SelectItem value="false">Mark as Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Messages</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
