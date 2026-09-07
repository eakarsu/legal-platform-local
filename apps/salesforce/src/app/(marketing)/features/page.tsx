import Link from "next/link"
import type { Metadata } from "next"
import { Brain, Users, Clock, DollarSign, Calendar, FileText, BarChart3, Shield, Check, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Features - AI-Powered Legal Practice Management Tools",
  description: "Explore GetFirmFlow's powerful features: AI document drafting, legal research, contract review, time tracking, billing, trust accounting, and more. Built for modern law firms.",
  keywords: ["legal software features", "AI document drafting", "legal research tool", "contract review AI", "law firm billing", "trust accounting", "legal case management"],
  openGraph: {
    title: "Features - AI-Powered Legal Practice Management Tools",
    description: "Explore GetFirmFlow's powerful features for modern law firms.",
    url: "https://getfirmflow.com/features",
  },
  alternates: {
    canonical: "https://getfirmflow.com/features",
  },
}

export default function FeaturesPage() {
  const aiFeatures = [
    {
      icon: Brain,
      title: "AI Document Drafting",
      description: "Generate demand letters, pleadings, motions, and correspondence in seconds. Our AI understands legal context, cites relevant case law, and matches your firm's writing style.",
      benefits: ["50+ document templates", "Auto-populate from matter data", "One-click editing & export", "Learn your firm's style"]
    },
    {
      icon: Brain,
      title: "AI Legal Research",
      description: "Research case law, statutes, and regulations with natural language queries. Get relevant citations, summaries, and analysis instantly.",
      benefits: ["All 50 states + federal", "Citation verification", "Research memo generation", "No Westlaw needed"]
    },
    {
      icon: Brain,
      title: "AI Contract Review",
      description: "Upload contracts for automated risk analysis. Identify problematic clauses, missing terms, and get improvement suggestions with risk scoring.",
      benefits: ["Clause-by-clause analysis", "Risk scoring & highlights", "Redline suggestions", "Export reports"]
    }
  ]

  const coreFeatures = [
    {
      icon: Users,
      title: "Client & Matter Management",
      description: "Track clients, matters, and contacts in one place. Built-in conflict checking, intake forms, and client portal keeps you organized and compliant.",
      benefits: ["Unlimited clients & matters", "Conflict checking", "Client intake forms", "Client portal access"]
    },
    {
      icon: Clock,
      title: "Time Tracking & Billing",
      description: "Track billable hours with one click or let AI capture time automatically. Support for hourly, flat-fee, contingency, and hybrid arrangements.",
      benefits: ["One-click time entry", "AI time capture", "Multiple billing types", "LEDES billing export"]
    },
    {
      icon: DollarSign,
      title: "Trust Accounting",
      description: "IOLTA-compliant trust accounting with client ledgers, three-way reconciliation, and full audit trails. Never worry about bar compliance again.",
      benefits: ["IOLTA compliant", "Client ledgers", "Three-way reconciliation", "Full audit trails"]
    },
    {
      icon: Calendar,
      title: "Deadline Management",
      description: "Court rule-based deadline calculations with automatic reminders. Never miss a statute of limitations or filing deadline again.",
      benefits: ["Court rule calculations", "Automatic reminders", "Statute of limitations tracking", "Team notifications"]
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize all case documents with version control. Drag-and-drop uploads, automatic categorization, and full-text search.",
      benefits: ["Version control", "Full-text search", "Auto-categorization", "Secure sharing"]
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Real-time dashboards showing firm performance, revenue trends, productivity metrics, and work-in-progress reports.",
      benefits: ["Real-time dashboards", "Revenue tracking", "Productivity metrics", "Custom reports"]
    }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            AI-Powered Features
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything Your Firm Needs in One Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Replace 5+ separate tools with one integrated system. AI-powered features included at no extra cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              AI Features That Save Hours Every Week
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI is built specifically for legal work—not a generic chatbot with a legal skin.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-600">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Core Practice Management Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              All the essentials to run your practice efficiently, plus AI superpowers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-slate-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Enterprise-Grade Security
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Your client data is sacred. We protect it with bank-level security and full compliance with legal industry standards.
              </p>
              <ul className="space-y-4">
                {[
                  "SOC 2 Type II certified",
                  "256-bit AES encryption at rest and in transit",
                  "Data never used to train AI models",
                  "US-based data centers only",
                  "Full audit trails for compliance",
                  "Role-based access controls"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Compliance Built-In</h3>
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="font-medium">IOLTA Compliant</p>
                  <p className="text-slate-400 text-sm">Full trust accounting that meets bar requirements in all 50 states</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="font-medium">Attorney-Client Privilege</p>
                  <p className="text-slate-400 text-sm">Your data is never shared or used for AI training</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="font-medium">Ethical Walls</p>
                  <p className="text-slate-400 text-sm">Role-based permissions to maintain information barriers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to See It in Action?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your 14-day free trial and experience the power of AI-native practice management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
