import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Code, Key, Webhook, Book, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "API Documentation - Build Custom Integrations",
  description: "GetFirmFlow REST API documentation. Build custom integrations, automate workflows, and connect your existing tools with our comprehensive API.",
  keywords: ["legal software API", "law firm API integration", "legal tech API", "practice management API"],
  openGraph: {
    title: "API Documentation - Build Custom Integrations",
    description: "Build custom integrations with our comprehensive REST API.",
    url: "https://getfirmflow.com/api",
  },
  alternates: {
    canonical: "https://getfirmflow.com/api",
  },
}

export default function APIPage() {
  const endpoints = [
    { method: "GET", path: "/v1/matters", description: "List all matters" },
    { method: "POST", path: "/v1/matters", description: "Create a new matter" },
    { method: "GET", path: "/v1/matters/:id", description: "Get a specific matter" },
    { method: "GET", path: "/v1/clients", description: "List all clients" },
    { method: "POST", path: "/v1/clients", description: "Create a new client" },
    { method: "GET", path: "/v1/time-entries", description: "List time entries" },
    { method: "POST", path: "/v1/time-entries", description: "Create a time entry" },
    { method: "GET", path: "/v1/documents", description: "List documents" },
    { method: "POST", path: "/v1/invoices", description: "Create an invoice" },
    { method: "GET", path: "/v1/calendar/events", description: "List calendar events" }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
            <Code className="h-4 w-4 mr-2" />
            Developer API
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Build With Our API
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Full REST API access to integrate GetFirmFlow with your existing systems. Available on Firm and Enterprise plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              View Documentation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Key className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>OAuth 2.0</CardTitle>
                <CardDescription>
                  Secure authentication with industry-standard OAuth 2.0 and API keys.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Webhook className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Real-time notifications when events occur in your account.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Book className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive docs with examples in multiple languages.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>
                  Generous rate limits with clear headers and retry guidance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Available Endpoints
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto">
            <div className="divide-y">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center px-6 py-4 hover:bg-slate-50">
                  <span className={`text-xs font-mono px-2 py-1 rounded mr-4 ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-slate-700 flex-1 font-mono">{endpoint.path}</code>
                  <span className="text-sm text-slate-500">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-6 text-slate-600">
            Plus many more endpoints for complete API coverage.
          </p>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Simple to Integrate
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Our API follows REST conventions with predictable URLs, JSON responses, and standard HTTP methods. Get started in minutes.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "RESTful design patterns",
                  "JSON request/response format",
                  "Pagination on list endpoints",
                  "Filtering and search parameters",
                  "Consistent error handling"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-sm overflow-x-auto">
              <div className="text-slate-400 mb-2"># Create a new matter</div>
              <pre className="text-green-400">{`curl -X POST https://api.getfirmflow.com/v1/matters \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "cli_123",
    "name": "Smith v. Jones",
    "practice_area": "personal_injury",
    "billing_type": "contingency",
    "status": "active"
  }'`}</pre>
              <div className="text-slate-400 mt-6 mb-2"># Response</div>
              <pre className="text-blue-300">{`{
  "id": "mat_456",
  "client_id": "cli_123",
  "name": "Smith v. Jones",
  "practice_area": "personal_injury",
  "billing_type": "contingency",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Webhook className="h-12 w-12 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Real-Time Webhooks
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Subscribe to events and receive real-time notifications when matters are created, invoices are paid, deadlines approach, and more.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { event: "matter.created", desc: "New matter created" },
              { event: "invoice.paid", desc: "Invoice payment received" },
              { event: "deadline.approaching", desc: "Deadline within 7 days" },
              { event: "document.uploaded", desc: "New document added" },
              { event: "time_entry.created", desc: "Time entry logged" },
              { event: "client.created", desc: "New client added" }
            ].map((webhook, i) => (
              <div key={i} className="bg-white rounded-lg p-4 text-left">
                <code className="text-sm text-blue-600">{webhook.event}</code>
                <p className="text-sm text-slate-600 mt-1">{webhook.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            API access is available on Firm and Enterprise plans. Start your free trial to explore the documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
