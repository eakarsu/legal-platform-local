import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Check, Zap, Mail, CreditCard, Cloud, Calendar, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Integrations - Connect Your Favorite Legal Tools",
  description: "GetFirmFlow integrates with Microsoft 365, Google Workspace, QuickBooks, Stripe, Dropbox, and more. Streamline your workflow with seamless connections.",
  keywords: ["legal software integrations", "law firm integrations", "legal tech API", "QuickBooks legal", "Microsoft 365 legal"],
  openGraph: {
    title: "Integrations - Connect Your Favorite Legal Tools",
    description: "Seamless integrations with the tools you already use.",
    url: "https://getfirmflow.com/integrations",
  },
  alternates: {
    canonical: "https://getfirmflow.com/integrations",
  },
}

export default function IntegrationsPage() {
  const integrations = [
    {
      category: "Email & Communication",
      items: [
        { name: "Microsoft Outlook", description: "Sync emails, calendar, and contacts", status: "Available" },
        { name: "Gmail / Google Workspace", description: "Two-way email and calendar sync", status: "Available" },
        { name: "Microsoft Teams", description: "Chat and video integration", status: "Coming Soon" },
        { name: "Zoom", description: "Schedule and join video meetings", status: "Coming Soon" }
      ]
    },
    {
      category: "Payments & Accounting",
      items: [
        { name: "Stripe", description: "Accept credit card payments online", status: "Available" },
        { name: "QuickBooks Online", description: "Sync invoices and payments", status: "Available" },
        { name: "LawPay", description: "Legal-specific payment processing", status: "Coming Soon" },
        { name: "Xero", description: "Accounting software integration", status: "Coming Soon" }
      ]
    },
    {
      category: "Document & Storage",
      items: [
        { name: "Dropbox", description: "Cloud document storage", status: "Available" },
        { name: "Google Drive", description: "Cloud storage and sharing", status: "Available" },
        { name: "Microsoft OneDrive", description: "Cloud storage integration", status: "Available" },
        { name: "Box", description: "Enterprise document management", status: "Coming Soon" }
      ]
    },
    {
      category: "Legal Research",
      items: [
        { name: "Westlaw", description: "Legal research integration", status: "Coming Soon" },
        { name: "LexisNexis", description: "Legal research and analytics", status: "Coming Soon" },
        { name: "Fastcase", description: "Legal research database", status: "Coming Soon" },
        { name: "Casetext", description: "AI-powered legal research", status: "Coming Soon" }
      ]
    }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Connect Your Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Integrations That Work
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Connect GetFirmFlow with the tools you already use. No more switching between apps or double data entry.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Key Integrations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Email Sync</h3>
              <p className="text-sm text-slate-600">Outlook & Gmail</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Payments</h3>
              <p className="text-sm text-slate-600">Stripe & QuickBooks</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Cloud Storage</h3>
              <p className="text-sm text-slate-600">Dropbox & Drive</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Calendar</h3>
              <p className="text-sm text-slate-600">Two-way sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Integrations */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            All Integrations
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {integrations.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'Available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Build Custom Integrations
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Need something custom? Our REST API lets you build integrations with any system. Available on Firm and Enterprise plans.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Full REST API access",
                  "Webhooks for real-time updates",
                  "OAuth 2.0 authentication",
                  "Comprehensive documentation",
                  "Developer support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/api">
                <Button variant="outline">
                  View API Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-sm overflow-x-auto">
              <pre>{`// Example API Request
const response = await fetch(
  'https://api.getfirmflow.com/v1/matters',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const matters = await response.json();`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Need a Custom Integration?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Contact us to discuss your integration needs. We&apos;re always adding new integrations based on customer feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Contact Us
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
