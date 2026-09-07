"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Pencil,
  Trash2,
} from "lucide-react"
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
import { formatDate } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: string
  startTime: string
  endTime: string
  location?: string
  matter?: { id: string; name: string; matterNumber: string }
  attendees: Array<{ user: { firstName: string; lastName: string } }>
}

interface Matter {
  id: string
  name: string
  matterNumber: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<"month" | "week" | "day">("month")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "MEETING",
    startTime: "",
    endTime: "",
    location: "",
    matterId: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const [eventsRes, mattersRes] = await Promise.all([
          fetch(`/api/calendar?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`),
          fetch("/api/matters"),
        ])
        const [eventsData, mattersData] = await Promise.all([
          eventsRes.json(),
          mattersRes.json(),
        ])
        setEvents(eventsData)
        const mattersList = mattersData.data || mattersData
        setMatters(Array.isArray(mattersList) ? mattersList : [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          type: "MEETING",
          startTime: "",
          endTime: "",
          location: "",
          matterId: "",
        })
        await refreshEvents()
      }
    } catch (error) {
      console.error("Failed to create event:", error)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MEETING: "bg-blue-500",
      COURT_DATE: "bg-red-500",
      DEPOSITION: "bg-purple-500",
      DEADLINE: "bg-orange-500",
      TASK: "bg-green-500",
      REMINDER: "bg-yellow-500",
      OUT_OF_OFFICE: "bg-gray-500",
    }
    return colors[type] || "bg-gray-500"
  }

  const eventTypes = [
    { value: "MEETING", label: "Meeting" },
    { value: "COURT_DATE", label: "Court Date" },
    { value: "DEPOSITION", label: "Deposition" },
    { value: "DEADLINE", label: "Deadline" },
    { value: "TASK", label: "Task" },
    { value: "REMINDER", label: "Reminder" },
    { value: "OUT_OF_OFFICE", label: "Out of Office" },
  ]

  const refreshEvents = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const eventsRes = await fetch(`/api/calendar?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`)
    setEvents(await eventsRes.json())
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDetailDialogOpen(true)
  }

  const formatDateTimeLocal = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().slice(0, 16)
  }

  const handleEditClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      startTime: formatDateTimeLocal(event.startTime),
      endTime: formatDateTimeLocal(event.endTime),
      location: event.location || "",
      matterId: event.matter?.id || "",
    })
    setDetailDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return
    try {
      const res = await fetch(`/api/calendar/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setEditDialogOpen(false)
        setSelectedEvent(null)
        setFormData({
          title: "",
          description: "",
          type: "MEETING",
          startTime: "",
          endTime: "",
          location: "",
          matterId: "",
        })
        await refreshEvents()
      }
    } catch (error) {
      console.error("Failed to update event:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/calendar/${deleteId}`, { method: "DELETE" })
      setDeleteId(null)
      setDetailDialogOpen(false)
      await refreshEvents()
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  const days = getDaysInMonth()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage appointments and events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>

              <div className="space-y-2">
                <Label>Related Matter</Label>
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
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{monthName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Select value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()
                const dayEvents = day ? getEventsForDay(day) : []

                return (
                  <div
                    key={index}
                    className={`bg-white min-h-[100px] p-2 ${day ? "" : "bg-gray-50"}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday
                              ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center"
                              : ""
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate text-white cursor-pointer hover:opacity-80 ${getEventTypeColor(
                                event.type
                              )}`}
                              title={event.title}
                              onClick={() => handleEventClick(event)}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                              onClick={() => {
                                // Show all events for this day
                                if (dayEvents.length > 0) {
                                  handleEventClick(dayEvents[0])
                                }
                              }}
                            >
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming events
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .filter((e) => new Date(e.startTime) >= new Date())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
                    onClick={() => handleEventClick(event)}
                  >
                    <div
                      className={`w-1 h-full min-h-[60px] rounded ${getEventTypeColor(
                        event.type
                      )}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.startTime).toLocaleString()}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees.length} attendee(s)
                          </div>
                        )}
                      </div>
                      {event.matter && (
                        <div className="mt-2">
                          <Badge variant="secondary">
                            {event.matter.name} ({event.matter.matterNumber})
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedEvent ? getEventTypeColor(selectedEvent.type) : ''}`} />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedEvent.type}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEvent.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEvent.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(selectedEvent.endTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.matter && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Related Matter</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.matter.name} ({selectedEvent.matter.matterNumber})
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Attendees</p>
                      <div className="text-sm text-muted-foreground">
                        {selectedEvent.attendees.map((a, i) => (
                          <span key={i}>
                            {a.user.firstName} {a.user.lastName}
                            {i < selectedEvent.attendees.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(selectedEvent.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleEditClick(selectedEvent)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>

            <div className="space-y-2">
              <Label>Related Matter</Label>
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
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
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
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
