import Link from "next/link"
import type { Metadata } from "next"
import { Search, Book, Video, MessageSquare, FileText, Users, Settings, CreditCard, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Help Center - Support & Documentation",
  description: "Get help with GetFirmFlow. Browse tutorials, guides, FAQs, and documentation. Contact our support team for personalized assistance.",
  keywords: ["GetFirmFlow help", "legal software support", "GetFirmFlow documentation", "law firm software tutorials"],
  openGraph: {
    title: "Help Center - Support & Documentation",
    description: "Browse tutorials, guides, and FAQs. Get help with GetFirmFlow.",
    url: "https://getfirmflow.com/help-center",
  },
  alternates: {
    canonical: "https://getfirmflow.com/help-center",
  },
}

export default function HelpCenterPage() {
  const categories = [
    { icon: Zap, title: "Getting Started", description: "New to GetFirmFlow? Start here.", articles: 12 },
    { icon: Users, title: "Client Management", description: "Managing clients, contacts, and intake.", articles: 18 },
    { icon: FileText, title: "Matter Management", description: "Creating and managing matters.", articles: 15 },
    { icon: CreditCard, title: "Billing & Invoicing", description: "Time tracking, invoicing, and payments.", articles: 22 },
    { icon: Shield, title: "Trust Accounting", description: "IOLTA accounts and trust management.", articles: 14 },
    { icon: Settings, title: "Settings & Admin", description: "User management and configuration.", articles: 20 }
  ]

  const popularArticles = [
    "How to create your first matter",
    "Setting up trust accounting",
    "Using AI document drafting",
    "Configuring billing rates",
    "Inviting team members",
    "Generating invoices",
    "Setting up email integration",
    "Managing deadlines and calendars"
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Can We Help?
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Search our knowledge base or browse categories below.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="search"
              placeholder="Search for articles..."
              className="pl-12 py-6 text-lg bg-white"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Video className="mr-2 h-4 w-4" />
              Video Tutorials
            </Button>
            <Button variant="outline" size="sm">
              <Book className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
            <Link href="/status">
              <Button variant="outline" size="sm">
                <Zap className="mr-2 h-4 w-4" />
                System Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.articles} articles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-slate-700">{article}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Video Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Getting Started Guide",
              "Time Tracking Basics",
              "Trust Accounting Setup"
            ].map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-video bg-slate-200 rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">{video}</p>
                    <p className="text-sm text-slate-500">5 min watch</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline">View All Tutorials</Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-slate-300 mb-8">
            Our support team is available Monday through Friday, 9am to 6pm Pacific Time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
