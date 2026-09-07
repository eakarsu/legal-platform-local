"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  eventType: string
  location: string | null
  startTime: string
  endTime: string
  allDay: boolean
  matter: { id: string; name: string; matterNumber: string } | null
  user: { id: string; name: string }
}

interface Deadline {
  id: string
  title: string
  dueDate: string
  deadlineType: string
  matter: { id: string; name: string; matterNumber: string }
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

const eventTypes = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'COURT_DATE', label: 'Court Date' },
  { value: 'DEPOSITION', label: 'Deposition' },
  { value: 'HEARING', label: 'Hearing' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'DEADLINE', label: 'Deadline' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'CONFERENCE_CALL', label: 'Conference Call' },
  { value: 'CLIENT_MEETING', label: 'Client Meeting' },
  { value: 'OTHER', label: 'Other' }
]

const eventTypeColors: Record<string, string> = {
  MEETING: 'bg-blue-100 text-blue-800',
  COURT_DATE: 'bg-red-100 text-red-800',
  DEPOSITION: 'bg-purple-100 text-purple-800',
  HEARING: 'bg-orange-100 text-orange-800',
  TRIAL: 'bg-red-200 text-red-900',
  DEADLINE: 'bg-yellow-100 text-yellow-800',
  REMINDER: 'bg-gray-100 text-gray-800',
  CONFERENCE_CALL: 'bg-green-100 text-green-800',
  CLIENT_MEETING: 'bg-indigo-100 text-indigo-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'MEETING',
    location: '',
    startTime: '',
    endTime: '',
    allDay: false,
    matterId: ''
  })

  useEffect(() => {
    fetchEvents()
    fetchMatters()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const params = new URLSearchParams({
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      })

      const res = await fetch(`/api/calendar?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
        setDeadlines(data.deadlines)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateEvent = async () => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          eventType: 'MEETING',
          location: '',
          startTime: '',
          endTime: '',
          allDay: false,
          matterId: ''
        })
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Group events and deadlines by date
  const itemsByDate: Record<string, { events: CalendarEvent[]; deadlines: Deadline[] }> = {}

  events.forEach(event => {
    const date = new Date(event.startTime).toDateString()
    if (!itemsByDate[date]) itemsByDate[date] = { events: [], deadlines: [] }
    itemsByDate[date].events.push(event)
  })

  deadlines.forEach(deadline => {
    const date = new Date(deadline.dueDate).toDateString()
    if (!itemsByDate[date]) itemsByDate[date] = { events: [], deadlines: [] }
    itemsByDate[date].deadlines.push(deadline)
  })

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">Manage your schedule and deadlines</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>Add a new event to your calendar</DialogDescription>
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
                <Label>Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(v) => setFormData({ ...formData, eventType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={formData.allDay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allDay: checked as boolean })
                  }
                />
                <Label htmlFor="allDay">All day event</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start *</Label>
                  <div className="relative">
                    <CalendarIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10"
                      onClick={() => (document.getElementById('startTime') as HTMLInputElement)?.showPicker?.()}
                    />
                    <Input
                      id="startTime"
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End *</Label>
                  <div className="relative">
                    <CalendarIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10"
                      onClick={() => (document.getElementById('endTime') as HTMLInputElement)?.showPicker?.()}
                    />
                    <Input
                      id="endTime"
                      type={formData.allDay ? 'date' : 'datetime-local'}
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Related Matter</Label>
                <Select
                  value={formData.matterId}
                  onValueChange={(v) => setFormData({ ...formData, matterId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a matter (optional)" />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} disabled={!formData.title || !formData.startTime || !formData.endTime}>
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(itemsByDate).length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No events this month</p>
              <Button onClick={() => setDialogOpen(true)}>Create an Event</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsByDate)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateStr, items]) => (
                  <div key={dateStr} className="border-l-2 border-gray-200 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {formatDate(new Date(dateStr))}
                    </h3>
                    <div className="space-y-3">
                      {items.events.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${eventTypeColors[event.eventType] || eventTypeColors.OTHER}`}>
                            {event.eventType.replace('_', ' ')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              {!event.allDay && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDateTime(event.startTime)}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {event.matter && (
                              <p className="text-sm text-blue-600 mt-1">
                                {event.matter.matterNumber} - {event.matter.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {items.deadlines.map((deadline) => (
                        <div key={deadline.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-red-900">{deadline.title}</p>
                            <p className="text-sm text-red-600">
                              {deadline.matter.matterNumber} - {deadline.matter.name}
                            </p>
                            <Badge variant="destructive" className="mt-2">
                              {deadline.deadlineType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
