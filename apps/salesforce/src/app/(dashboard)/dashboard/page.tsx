"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Briefcase,
  Clock,
  DollarSign,
  AlertCircle,
  Calendar,
  Plus,
  ArrowRight,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { DashboardSkeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  openMatters: number
  activeClients: number
  unbilledHours: number
  unbilledAmount: number
  outstandingInvoices: number
  upcomingDeadlines: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  createdAt: string
}

interface UpcomingEvent {
  id: string
  title: string
  type: string
  startTime: string
  matter?: { name: string }
}

interface UpcomingDeadline {
  id: string
  title: string
  dueDate: string
  priority: string
  matter: { name: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard")
        const data = await res.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
        setUpcomingEvents(data.upcomingEvents || [])
        setUpcomingDeadlines(data.upcomingDeadlines || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your practice.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </Link>
          <Link href="/matters/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="card-hover cursor-pointer" onClick={() => router.push('/matters')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Matters</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openMatters || 0}</div>
            <p className="text-xs text-muted-foreground">Active cases</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => router.push('/clients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground">Current clients</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => router.push('/time-billing')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbilled Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unbilledHours?.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">Hours to bill</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => router.push('/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbilled Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.unbilledAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">To be invoiced</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => router.push('/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.outstandingInvoices || 0)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer" onClick={() => router.push('/deadlines')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadlines</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.upcomingDeadlines || 0}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your schedule for the next few days</CardDescription>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                    onClick={() => router.push('/calendar')}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.matter?.name || "General"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(event.startTime)}
                      </p>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Critical dates to remember</CardDescription>
            </div>
            <Link href="/deadlines">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming deadlines
                </p>
              ) : (
                upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                    onClick={() => router.push('/deadlines')}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className={`h-5 w-5 ${deadline.priority === 'CRITICAL' ? 'text-red-500' : deadline.priority === 'HIGH' ? 'text-orange-500' : 'text-blue-500'}`} />
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.matter.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(deadline.dueDate)}
                      </p>
                      <Badge className={getStatusColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
