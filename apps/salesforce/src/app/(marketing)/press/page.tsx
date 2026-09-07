import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Download, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Press & Media - GetFirmFlow News and Resources",
  description: "GetFirmFlow press releases, media coverage, and brand resources. Download logos, read our latest news, and contact our media relations team.",
  keywords: ["GetFirmFlow news", "legal tech press", "GetFirmFlow media", "legal software news"],
  openGraph: {
    title: "Press & Media - GetFirmFlow News and Resources",
    description: "Press releases, media coverage, and brand resources.",
    url: "https://getfirmflow.com/press",
  },
  alternates: {
    canonical: "https://getfirmflow.com/press",
  },
}

export default function PressPage() {
  const pressReleases = [
    {
      title: "GetFirmFlow Raises $15M Series A to Democratize Legal Technology",
      date: "November 15, 2024",
      excerpt: "Funding will accelerate AI development and expand go-to-market efforts to serve more small law firms nationwide."
    },
    {
      title: "GetFirmFlow Launches AI Contract Review for Small Practices",
      date: "October 1, 2024",
      excerpt: "New feature brings enterprise-grade contract analysis to solo practitioners and small firms at an affordable price."
    },
    {
      title: "GetFirmFlow Reaches 500 Law Firm Milestone",
      date: "August 20, 2024",
      excerpt: "AI-powered practice management platform sees rapid adoption among personal injury and family law practices."
    },
    {
      title: "GetFirmFlow Named to Legal Tech Top 50 Startups",
      date: "June 5, 2024",
      excerpt: "Recognition highlights the company's innovative approach to bringing AI tools to underserved small law market."
    }
  ]

  const mediaFeatures = [
    { publication: "Above the Law", title: "How AI is Leveling the Playing Field for Small Firms" },
    { publication: "Law Technology Today", title: "GetFirmFlow: A New Approach to Practice Management" },
    { publication: "Legal Tech News", title: "The Rise of AI-Native Legal Software" },
    { publication: "ABA Journal", title: "Tech Tools Helping Solo Practitioners Compete" }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Press & Media
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            News, announcements, and media resources from GetFirmFlow.
          </p>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Media Inquiries</h2>
              <p className="text-slate-600">For press inquiries, please contact our communications team.</p>
            </div>
            <a href="mailto:press@getfirmflow.com">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                press@getfirmflow.com
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-2">{release.date}</p>
                      <CardTitle className="text-xl">{release.title}</CardTitle>
                      <CardDescription className="mt-2">{release.excerpt}</CardDescription>
                    </div>
                    <Button variant="outline" className="shrink-0">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Media Coverage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mediaFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">{feature.publication}</p>
                    <p className="text-slate-900 font-medium mt-1">{feature.title}</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-slate-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Brand Assets</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-slate-400">Logo - Light</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-slate-400">Logo - Dark</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white">Brand Guidelines</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Company Facts</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">2022</p>
              <p className="text-slate-400">Founded</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">San Francisco</p>
              <p className="text-slate-400">Headquarters</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-slate-400">Law Firms</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">$15M</p>
              <p className="text-slate-400">Series A Raised</p>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
