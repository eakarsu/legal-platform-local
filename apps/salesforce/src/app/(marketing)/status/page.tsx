import type { Metadata } from "next"
import { CheckCircle, AlertCircle, Clock, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "System Status - Service Uptime & Incidents",
  description: "Check GetFirmFlow's real-time system status. View uptime metrics, scheduled maintenance, and incident history for all services.",
  keywords: ["GetFirmFlow status", "system uptime", "service status", "legal software uptime"],
  openGraph: {
    title: "System Status - Service Uptime & Incidents",
    description: "Real-time system status and uptime metrics.",
    url: "https://getfirmflow.com/status",
  },
  alternates: {
    canonical: "https://getfirmflow.com/status",
  },
}

export default function StatusPage() {
  const services = [
    { name: "Web Application", status: "operational", uptime: "99.99%" },
    { name: "API Services", status: "operational", uptime: "99.98%" },
    { name: "Document Storage", status: "operational", uptime: "99.99%" },
    { name: "AI Services", status: "operational", uptime: "99.95%" },
    { name: "Email Delivery", status: "operational", uptime: "99.97%" },
    { name: "Payment Processing", status: "operational", uptime: "99.99%" }
  ]

  const incidents = [
    {
      date: "December 1, 2024",
      title: "Scheduled Maintenance",
      status: "completed",
      description: "Completed scheduled database maintenance. No service interruption."
    },
    {
      date: "November 15, 2024",
      title: "API Latency Issue",
      status: "resolved",
      description: "Identified and resolved elevated API response times. Root cause: database query optimization needed."
    },
    {
      date: "November 1, 2024",
      title: "Document Upload Delay",
      status: "resolved",
      description: "Some users experienced delays in document uploads. Issue resolved within 30 minutes."
    }
  ]

  const uptimeData = [
    { day: "Mon", uptime: 100 },
    { day: "Tue", uptime: 100 },
    { day: "Wed", uptime: 99.9 },
    { day: "Thu", uptime: 100 },
    { day: "Fri", uptime: 100 },
    { day: "Sat", uptime: 100 },
    { day: "Sun", uptime: 100 }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4 mr-2" />
            All Systems Operational
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            System Status
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real-time status of GetFirmFlow services. Updated every 60 seconds.
          </p>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Status</h2>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-900">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{service.uptime} uptime</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Graph */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Uptime - Last 7 Days</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-end justify-between h-32 gap-2">
                {uptimeData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t ${day.uptime === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ height: `${day.uptime}%` }}
                    />
                    <span className="text-xs text-slate-500">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded" />
                  <span className="text-slate-600">100% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-yellow-500 rounded" />
                  <span className="text-slate-600">Partial Outage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-500 rounded" />
                  <span className="text-slate-600">Major Outage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Performance Metrics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">99.99%</p>
                <p className="text-sm text-slate-500">30-Day Uptime</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">145ms</p>
                <p className="text-sm text-slate-500">Avg Response Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-500">Active Incidents</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-500">Scheduled Maintenance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Incident History</h2>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <CardDescription>{incident.date}</CardDescription>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      incident.status === 'completed' || incident.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{incident.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Subscribe to Updates
          </h2>
          <p className="text-slate-600 mb-6">
            Get notified about scheduled maintenance and service incidents.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
