"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  FileText,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ReportData {
  totalRevenue: number
  totalHours: number
  totalMatters: number
  totalClients: number
  revenueByPracticeArea: Array<{ name: string; value: number; color: string }>
  hoursByAttorney: Array<{ name: string; hours: number; billable: number }>
  monthlyRevenue: Array<{ month: string; revenue: number; collected: number }>
  mattersByStatus: Array<{ status: string; count: number }>
  arAgingReport: Array<{ period: string; amount: number }>
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [selectedReport, setSelectedReport] = useState("overview")

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports?start=${dateRange.start}&end=${dateRange.end}`)
        if (res.ok) {
          setReportData(await res.json())
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [dateRange])

  const reports = [
    { id: "overview", name: "Firm Overview", icon: BarChart3 },
    { id: "productivity", name: "Attorney Productivity", icon: Users },
    { id: "revenue", name: "Revenue Analysis", icon: DollarSign },
    { id: "matters", name: "Matter Analysis", icon: Briefcase },
    { id: "ar", name: "Accounts Receivable", icon: TrendingUp },
  ]

  const handleExport = (format: string) => {
    // In production, this would generate and download the report
    alert(`Exporting ${selectedReport} report as ${format}...`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Firm analytics and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4" />
                        {report.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push("/invoices")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Year to date - Click to view invoices</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push("/time-billing")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalHours.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Billed hours - Click to view time entries</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push("/matters")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Matters</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalMatters}</div>
              <p className="text-xs text-muted-foreground">Open matters - Click to view all</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push("/clients")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalClients}</div>
              <p className="text-xs text-muted-foreground">With open matters - Click to view all</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Practice Area */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/matters")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Practice Area
            </CardTitle>
            <CardDescription>Click to view matters by practice area</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.revenueByPracticeArea.length ? (
              <div className="space-y-4">
                {reportData.revenueByPracticeArea.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Hours by Attorney */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/time-billing")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hours by Attorney
            </CardTitle>
            <CardDescription>Click to view time entries</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.hoursByAttorney.length ? (
              <div className="space-y-4">
                {reportData.hoursByAttorney.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(item.billable / item.hours) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.billable.toFixed(1)} billable ({((item.billable / item.hours) * 100).toFixed(0)}%)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Matters by Status */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/matters")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Matters by Status
            </CardTitle>
            <CardDescription>Click to view all matters</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.mattersByStatus.length ? (
              <div className="space-y-4">
                {reportData.mattersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <Badge variant="outline">{item.status}</Badge>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* AR Aging */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push("/invoices")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Accounts Receivable Aging
            </CardTitle>
            <CardDescription>Click to view invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.arAgingReport.length ? (
              <div className="space-y-4">
                {reportData.arAgingReport.map((item) => (
                  <div key={item.period} className="flex items-center justify-between">
                    <span>{item.period}</span>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
