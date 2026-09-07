import Link from "next/link"
import type { Metadata } from "next"
import { Car, Heart, Gavel, Globe, Building, Briefcase, Home, FileText, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Practice Areas - Legal Software for Every Specialty",
  description: "GetFirmFlow supports all practice areas: personal injury, family law, criminal defense, immigration, real estate, business law, estate planning, and more.",
  keywords: ["personal injury software", "family law software", "criminal defense software", "immigration software", "real estate attorney software", "estate planning software"],
  openGraph: {
    title: "Practice Areas - Legal Software for Every Specialty",
    description: "Specialized features for every area of law practice.",
    url: "https://getfirmflow.com/practice-areas",
  },
  alternates: {
    canonical: "https://getfirmflow.com/practice-areas",
  },
}

export default function PracticeAreasPage() {
  const practiceAreas = [
    {
      icon: Car,
      name: "Personal Injury",
      slug: "personal-injury",
      description: "Streamline your PI practice with AI-powered demand letters, medical chronology generation, and settlement tracking.",
      features: [
        "AI demand letter drafting",
        "Medical record summarization",
        "Settlement calculators",
        "Lien tracking",
        "Statute of limitations alerts",
        "Contingency fee tracking"
      ],
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Heart,
      name: "Family Law",
      slug: "family-law",
      description: "Manage custody cases, divorce proceedings, and support calculations with specialized tools and templates.",
      features: [
        "Custody agreement templates",
        "Asset division worksheets",
        "Child support calculators",
        "Parenting plan drafting",
        "Court deadline tracking",
        "Client portal for documents"
      ],
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: Gavel,
      name: "Criminal Defense",
      slug: "criminal-defense",
      description: "Track court dates, manage discovery, and generate motions efficiently for your criminal defense practice.",
      features: [
        "Motion template library",
        "Court date management",
        "Discovery tracking",
        "Client communication logs",
        "Case status tracking",
        "Conflict checking"
      ],
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: Globe,
      name: "Immigration",
      slug: "immigration",
      description: "Navigate complex immigration cases with form automation, deadline tracking, and case status management.",
      features: [
        "USCIS form integration",
        "Processing time tracking",
        "Deadline calculations",
        "Case status dashboards",
        "Multi-language support",
        "RFE response templates"
      ],
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Building,
      name: "Real Estate",
      slug: "real-estate",
      description: "Handle closings, title work, and transactions with AI contract review and document management.",
      features: [
        "AI contract review",
        "Closing checklist automation",
        "Title document management",
        "Transaction timelines",
        "Escrow tracking",
        "Multi-party coordination"
      ],
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Briefcase,
      name: "Business Law",
      slug: "business-law",
      description: "Draft contracts, manage entity formations, and handle corporate compliance with AI assistance.",
      features: [
        "Contract drafting AI",
        "Entity formation templates",
        "Corporate minute books",
        "Compliance calendars",
        "M&A due diligence",
        "Shareholder management"
      ],
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Home,
      name: "Estate Planning",
      slug: "estate-planning",
      description: "Create wills, trusts, and estate plans with document automation and client questionnaires.",
      features: [
        "Will & trust templates",
        "Asset inventory tracking",
        "Beneficiary management",
        "Power of attorney forms",
        "Estate tax calculations",
        "Client intake automation"
      ],
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600"
    },
    {
      icon: FileText,
      name: "General Practice",
      slug: "general-practice",
      description: "A flexible solution for general practitioners handling multiple practice areas.",
      features: [
        "Multi-practice area support",
        "Customizable workflows",
        "Document template library",
        "Flexible billing options",
        "Matter categorization",
        "Cross-matter search"
      ],
      bgColor: "bg-slate-100",
      iconColor: "text-slate-600"
    }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Built for Every Practice Area
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Whether you handle personal injury, family law, or business litigation, our AI adapts to your specific workflows and document needs.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Practice Areas Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {practiceAreas.map((area, index) => (
              <Link key={index} href={`/practice-areas/${area.slug}`} className="block">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className={`h-12 w-12 ${area.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <area.icon className={`h-6 w-6 ${area.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{area.name}</CardTitle>
                    <CardDescription className="text-sm">{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {area.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        + {area.features.length - 3} more features
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Practice-Specific */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why Practice-Specific Features Matter
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Generic software forces you to adapt your workflow. We built GetFirmFlow to adapt to how you actually practice law.
              </p>
              <ul className="space-y-4">
                {[
                  "Pre-built templates specific to your practice area",
                  "AI trained on documents from your field",
                  "Workflows that match how you work",
                  "Deadline rules for your jurisdiction and case types",
                  "Billing structures that fit your practice"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">One Platform, Any Practice</h3>
              <p className="text-slate-600 mb-6">
                Handle multiple practice areas? No problem. Switch seamlessly between matter types with context-aware AI and flexible workflows.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">50+</p>
                  <p className="text-sm text-slate-600">Document templates</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">100+</p>
                  <p className="text-sm text-slate-600">Court rules</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">8</p>
                  <p className="text-sm text-slate-600">Practice areas</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">50</p>
                  <p className="text-sm text-slate-600">State jurisdictions</p>
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
            See How It Works for Your Practice
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your free trial and explore features designed for your practice area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
