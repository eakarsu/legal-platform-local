"use client"

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ListTodo,
  Download,
  FileText,
  Trash2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'
import { SortHeader } from '@/components/ui/sort-header'
import { PageSkeleton } from '@/components/ui/loading-skeleton'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  createdAt: string
  matter: { id: string; name: string; matterNumber: string } | null
  createdBy: { id: string; name: string }
  assignee: { id: string; name: string } | null
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

interface User {
  id: string
  name: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600'
}

const statusIcons: Record<string, any> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  REVIEW: AlertCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: Circle
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Detail dialog state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

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
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('TODO')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    matterId: '',
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: ''
  })

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const res = await fetch(`/api/tasks?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, page, pageSize, sortBy, sortOrder])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    fetchMatters()
    fetchUsers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, priorityFilter])

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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateTask = async () => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          matterId: '',
          assigneeId: '',
          priority: 'MEDIUM',
          dueDate: ''
        })
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTasks()
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', entity: 'tasks', ids: Array.from(selectedIds) })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkDeleteDialogOpen(false)
        fetchTasks()
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
        body: JSON.stringify({ action: 'update', entity: 'tasks', ids: Array.from(selectedIds), data: { status: bulkUpdateStatus } })
      })
      if (res.ok) {
        setSelectedIds(new Set())
        setBulkUpdateDialogOpen(false)
        fetchTasks()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredTasks.map(t => t.id)))
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
    window.open(`/api/export?entity=tasks&format=${format}`, '_blank')
  }

  const handleRowClick = (task: Task) => {
    setSelectedTask(task)
    setDetailDialogOpen(true)
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage your tasks and to-dos</p>
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
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
                <DialogDescription>Create a new task</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Matter</Label>
                    <Select
                      value={formData.matterId}
                      onValueChange={(v) => setFormData({ ...formData, matterId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        {matters.map((matter) => (
                          <SelectItem key={matter.id} value={matter.id}>
                            {matter.matterNumber} - {matter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select
                      value={formData.assigneeId}
                      onValueChange={(v) => setFormData({ ...formData, assigneeId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => setFormData({ ...formData, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTask} disabled={!formData.title}>
                  Create Task
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
            Update Status
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
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No tasks found</p>
              <Button onClick={() => setDialogOpen(true)}>Create Your First Task</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <SortHeader label="Task" field="title" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <TableHead>Matter</TableHead>
                    <TableHead>Assignee</TableHead>
                    <SortHeader label="Priority" field="priority" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Due Date" field="dueDate" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Status" field="status" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Created" field="createdAt" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const StatusIcon = statusIcons[task.status] || Circle
                    return (
                      <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(task)}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(task.id)} onCheckedChange={() => toggleSelect(task.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-5 h-5 ${task.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-400'}`} />
                            <div>
                              <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {task.matter ? (
                            <Link href={`/matters/${task.matter.id}`} className="text-blue-600 hover:underline">
                              {task.matter.matterNumber}
                            </Link>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{task.assignee?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}>
                              {formatDate(task.dueDate)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={task.status}
                            onValueChange={(v) => handleUpdateStatus(task.id, v)}
                          >
                            <SelectTrigger className={`w-[130px] ${statusColors[task.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TODO">To Do</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="REVIEW">Review</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(task.createdAt)}</TableCell>
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

      {/* Task Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Task Details
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={statusColors[selectedTask.status]}>{selectedTask.status.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <Badge className={priorityColors[selectedTask.priority]}>{selectedTask.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matter</p>
                    {selectedTask.matter ? (
                      <Link
                        href={`/matters/${selectedTask.matter.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {selectedTask.matter.matterNumber} - {selectedTask.matter.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assignee</p>
                    <p className="text-sm font-medium">{selectedTask.assignee?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-sm font-medium">{selectedTask.dueDate ? formatDate(selectedTask.dueDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(selectedTask.createdAt)}</p>
                  </div>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedTask.description}</p>
                </div>
              )}

              {/* Edit Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Update Status</h3>
                <Select
                  value={selectedTask.status}
                  onValueChange={(v) => {
                    handleUpdateStatus(selectedTask.id, v)
                    setSelectedTask({ ...selectedTask, status: v })
                  }}
                >
                  <SelectTrigger className={`w-[180px] ${statusColors[selectedTask.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="destructive" onClick={() => {
                  setDetailDialogOpen(false)
                  setDeleteTarget({ id: selectedTask.id, name: selectedTask.title })
                  setDeleteDialogOpen(true)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Tasks"
        description={`Are you sure you want to delete ${selectedIds.size} selected task(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} Tasks`}
        variant="danger"
        onConfirm={handleBulkDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update {selectedIds.size} Task(s)</DialogTitle>
            <DialogDescription>Change the status of selected tasks</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkUpdateStatus} onValueChange={setBulkUpdateStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkUpdate}>Update {selectedIds.size} Tasks</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
