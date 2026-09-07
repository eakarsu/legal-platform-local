"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bell,
  Check,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Search,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const typeIcons: Record<string, any> = {
  DEADLINE: AlertTriangle,
  TASK: FileText,
  MESSAGE: MessageSquare,
  CALENDAR: Calendar,
  DOCUMENT: FileText,
  BILLING: DollarSign,
  SYSTEM: Bell
}

const typeColors: Record<string, string> = {
  DEADLINE: 'text-red-500 bg-red-100',
  TASK: 'text-blue-500 bg-blue-100',
  MESSAGE: 'text-green-500 bg-green-100',
  CALENDAR: 'text-purple-500 bg-purple-100',
  DOCUMENT: 'text-orange-500 bg-orange-100',
  BILLING: 'text-emerald-500 bg-emerald-100',
  SYSTEM: 'text-gray-500 bg-gray-100'
}

const typeLabels: Record<string, string> = {
  DEADLINE: 'Deadline',
  TASK: 'Task',
  MESSAGE: 'Message',
  CALENDAR: 'Calendar',
  DOCUMENT: 'Document',
  BILLING: 'Billing',
  SYSTEM: 'System'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=100')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || typeFilter === 'all' || notification.type === typeFilter
    const matchesRead = !readFilter || readFilter === 'all' ||
      (readFilter === 'unread' && !notification.isRead) ||
      (readFilter === 'read' && notification.isRead)
    return matchesSearch && matchesType && matchesRead
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell
                const colorClass = typeColors[notification.type] || 'text-gray-500 bg-gray-100'
                const [textColor, bgColor] = colorClass.split(' ')

                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedNotification(notification)
                      setDetailDialogOpen(true)
                    }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
                      <Icon className={`h-5 w-5 ${textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[notification.type] || notification.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (() => {
            const Icon = typeIcons[selectedNotification.type] || Bell
            const colorClass = typeColors[selectedNotification.type] || 'text-gray-500 bg-gray-100'
            const [textColor, bgColor] = colorClass.split(' ')

            return (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${textColor}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{selectedNotification.title}</p>
                    <Badge variant="outline" className="mt-1">
                      {typeLabels[selectedNotification.type] || selectedNotification.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="font-medium">{selectedNotification.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(selectedNotification.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={selectedNotification.isRead ? 'secondary' : 'default'}>
                      {selectedNotification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
                {selectedNotification.link && (
                  <div>
                    <p className="text-sm text-gray-500">Related Link</p>
                    <p className="font-medium text-blue-600">{selectedNotification.link}</p>
                  </div>
                )}
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedNotification && !selectedNotification.isRead && (
              <Button
                variant="outline"
                onClick={() => {
                  markAsRead(selectedNotification.id)
                  setSelectedNotification({ ...selectedNotification, isRead: true })
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </Button>
            )}
            {selectedNotification?.link && (
              <Button
                onClick={() => {
                  if (selectedNotification && !selectedNotification.isRead) {
                    markAsRead(selectedNotification.id)
                  }
                  if (selectedNotification?.link) {
                    window.location.href = selectedNotification.link
                  }
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Link
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedNotification) {
                  deleteNotification(selectedNotification.id)
                  setDetailDialogOpen(false)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
