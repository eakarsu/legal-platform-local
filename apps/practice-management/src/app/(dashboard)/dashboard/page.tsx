"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Briefcase, FileText, Clock, DollarSign, AlertTriangle, Calendar, Plus, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'

interface DashboardStats {
  totalClients: number
  activeMatters: number
  pendingTasks: number
  unbilledHours: number
  upcomingDeadlines: number
  totalRevenue: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
}

interface UpcomingDeadline {
  id: string
  title: string
  matterName: string
  dueDate: string
  type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeMatters: 0,
    pendingTasks: 0,
    unbilledHours: 0,
    upcomingDeadlines: 0,
    totalRevenue: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
        setDeadlines(data.upcomingDeadlines)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Active Clients', value: stats.totalClients, icon: Users, href: '/clients', color: 'bg-blue-500' },
    { name: 'Open Matters', value: stats.activeMatters, icon: Briefcase, href: '/matters', color: 'bg-green-500' },
    { name: 'Pending Tasks', value: stats.pendingTasks, icon: FileText, href: '/tasks', color: 'bg-yellow-500' },
    { name: 'Unbilled Hours', value: stats.unbilledHours.toFixed(1), icon: Clock, href: '/time', color: 'bg-purple-500' },
    { name: 'Upcoming Deadlines', value: stats.upcomingDeadlines, icon: AlertTriangle, href: '/deadlines', color: 'bg-red-500' },
    { name: 'Revenue (MTD)', value: formatCurrency(stats.totalRevenue), icon: DollarSign, href: '/billing', color: 'bg-emerald-500' },
  ]

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/matters/new">
              <Plus className="w-4 h-4 mr-2" />
              New Matter
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid - clickable cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card
            key={stat.name}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(stat.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Don&apos;t miss these important dates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/deadlines">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-4">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => router.push('/deadlines')}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-sm text-gray-500">{deadline.matterName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={new Date(deadline.dueDate) < new Date() ? 'destructive' : 'secondary'}>
                        {formatDate(deadline.dueDate)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your firm</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      const routeMap: Record<string, string> = {
                        matter: '/matters',
                        client: '/clients',
                        document: '/documents',
                        task: '/tasks',
                        billing: '/billing',
                        deadline: '/deadlines',
                      }
                      const route = routeMap[activity.type] || '/dashboard'
                      router.push(route)
                    }}
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
