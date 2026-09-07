import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Car, Heart, Gavel, Globe, Building, Briefcase, Home, FileText, ArrowRight, Check, Brain, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

const practiceAreaData: Record<string, {
  icon: React.ElementType
  name: string
  tagline: string
  description: string
  heroDescription: string
  features: { title: string; description: string }[]
  aiFeatures: string[]
  testimonial: { quote: string; author: string; title: string }
  stats: { value: string; label: string }[]
}> = {
  "personal-injury": {
    icon: Car,
    name: "Personal Injury",
    tagline: "Win more cases. Get paid faster.",
    description: "Streamline your PI practice with AI-powered demand letters, medical chronology generation, and settlement tracking.",
    heroDescription: "GetFirmFlow helps personal injury attorneys maximize case value, reduce administrative burden, and get clients the compensation they deserve—faster.",
    features: [
      { title: "AI Demand Letter Drafting", description: "Generate comprehensive demand letters in minutes, not hours. Our AI analyzes medical records, calculates damages, and drafts persuasive narratives." },
      { title: "Medical Record Summarization", description: "Upload medical records and get instant chronologies, treatment summaries, and cost breakdowns organized by provider and date." },
      { title: "Settlement Calculator", description: "Built-in calculators for pain and suffering multipliers, lost wages, and future medical expenses to support your valuations." },
      { title: "Lien Tracking & Management", description: "Track Medicare, Medicaid, and private liens. Calculate reductions and manage lien holder communications in one place." },
      { title: "Statute of Limitations Alerts", description: "Never miss a deadline. Automatic alerts based on case type, jurisdiction, and discovery rules." },
      { title: "Contingency Fee Tracking", description: "Track fee percentages, case costs, and projected attorney fees. Automatic calculations at settlement." }
    ],
    aiFeatures: [
      "Auto-generate demand letters from case facts",
      "Summarize medical records instantly",
      "Research similar verdicts and settlements",
      "Draft discovery responses",
      "Create medical chronologies"
    ],
    testimonial: {
      quote: "The AI demand letter feature alone has saved me 5+ hours per case. It pulls in all the medical specials, organizes the narrative, and produces a professional letter I can send with minor edits.",
      author: "Jennifer Martinez",
      title: "Solo PI Attorney, Miami FL"
    },
    stats: [
      { value: "5+", label: "Hours saved per demand letter" },
      { value: "40%", label: "Faster case resolution" },
      { value: "98%", label: "Customer satisfaction" }
    ]
  },
  "family-law": {
    icon: Heart,
    name: "Family Law",
    tagline: "Navigate sensitive cases with confidence.",
    description: "Manage custody cases, divorce proceedings, and support calculations with specialized tools and templates.",
    heroDescription: "GetFirmFlow helps family law attorneys manage emotionally complex cases with efficiency and precision, from initial consultation to final decree.",
    features: [
      { title: "Custody Agreement Templates", description: "Pre-built templates for parenting plans, visitation schedules, and custody modifications that comply with your state's requirements." },
      { title: "Asset Division Worksheets", description: "Comprehensive property division tools that track marital vs. separate property, valuations, and equitable distribution calculations." },
      { title: "Child Support Calculators", description: "State-specific child support calculations with income worksheets, deviation factors, and modification tracking." },
      { title: "Parenting Plan Drafting", description: "AI-assisted parenting plan creation with customizable holiday schedules, decision-making provisions, and communication protocols." },
      { title: "Court Deadline Tracking", description: "Family court-specific deadlines including discovery cutoffs, mediation requirements, and hearing schedules." },
      { title: "Secure Client Portal", description: "Give clients secure access to documents, calendars, and communication—essential for high-conflict cases." }
    ],
    aiFeatures: [
      "Draft parenting plans from intake forms",
      "Generate financial declarations",
      "Create property division summaries",
      "Draft motions and responses",
      "Summarize discovery documents"
    ],
    testimonial: {
      quote: "Family law cases require so much documentation. GetFirmFlow helps me stay organized and produce professional documents quickly, which lets me focus on being there for my clients.",
      author: "Lisa Patterson",
      title: "Family Law Attorney, Denver CO"
    },
    stats: [
      { value: "60%", label: "Less time on paperwork" },
      { value: "100+", label: "Document templates" },
      { value: "50", label: "State-specific calculators" }
    ]
  },
  "criminal-defense": {
    icon: Gavel,
    name: "Criminal Defense",
    tagline: "Defend your clients with powerful tools.",
    description: "Track court dates, manage discovery, and generate motions efficiently for your criminal defense practice.",
    heroDescription: "GetFirmFlow helps criminal defense attorneys manage heavy caseloads, meet critical deadlines, and mount the strongest possible defense.",
    features: [
      { title: "Motion Template Library", description: "Extensive library of criminal defense motions including suppression, discovery, dismissal, and sentencing motions customized for your jurisdiction." },
      { title: "Court Date Management", description: "Track arraignments, hearings, trials, and sentencing dates across multiple courts with automatic conflict detection." },
      { title: "Discovery Management", description: "Organize police reports, witness statements, video evidence, and lab results with full-text search and tagging." },
      { title: "Client Communication Logs", description: "Document jail visits, phone calls, and client instructions with timestamp verification for your records." },
      { title: "Case Status Dashboard", description: "See all active cases at a glance with status indicators, upcoming deadlines, and next action items." },
      { title: "Conflict Checking", description: "Automatic conflict checks against current and former clients, co-defendants, and witnesses." }
    ],
    aiFeatures: [
      "Draft motions to suppress evidence",
      "Summarize police reports",
      "Research case law for defenses",
      "Generate discovery requests",
      "Create sentencing memoranda"
    ],
    testimonial: {
      quote: "Managing 50+ active cases is a nightmare without the right tools. GetFirmFlow keeps me on top of every court date and deadline. I haven't missed a hearing since I started using it.",
      author: "Marcus Johnson",
      title: "Criminal Defense Attorney, Atlanta GA"
    },
    stats: [
      { value: "0", label: "Missed court dates" },
      { value: "70%", label: "Faster motion drafting" },
      { value: "500+", label: "Motion templates" }
    ]
  },
  "immigration": {
    icon: Globe,
    name: "Immigration",
    tagline: "Navigate complex immigration cases with ease.",
    description: "Navigate complex immigration cases with form automation, deadline tracking, and case status management.",
    heroDescription: "GetFirmFlow helps immigration attorneys manage complex cases, track ever-changing deadlines, and serve clients seeking a better life.",
    features: [
      { title: "USCIS Form Integration", description: "Auto-populate immigration forms from client data. Support for family-based, employment-based, and humanitarian applications." },
      { title: "Processing Time Tracking", description: "Monitor USCIS processing times and set alerts for cases outside normal processing windows." },
      { title: "Deadline Calculations", description: "Automatic calculation of filing deadlines, RFE response dates, appeal windows, and status expiration dates." },
      { title: "Case Status Dashboard", description: "Track case status across USCIS, DOL, NVC, and consulates with real-time updates and milestone tracking." },
      { title: "Multi-Language Support", description: "Client portal and intake forms available in Spanish, Chinese, and other languages to better serve your clients." },
      { title: "RFE Response Templates", description: "Pre-built templates for common RFE scenarios with AI assistance for drafting comprehensive responses." }
    ],
    aiFeatures: [
      "Draft RFE responses",
      "Generate cover letters",
      "Summarize supporting documents",
      "Research visa bulletin trends",
      "Create case summaries"
    ],
    testimonial: {
      quote: "Immigration law changes constantly. GetFirmFlow helps me stay compliant and organized. The form auto-fill alone saves hours per application.",
      author: "Maria Rodriguez",
      title: "Immigration Attorney, Los Angeles CA"
    },
    stats: [
      { value: "80%", label: "Faster form completion" },
      { value: "200+", label: "Form templates" },
      { value: "99%", label: "Deadline compliance" }
    ]
  },
  "real-estate": {
    icon: Building,
    name: "Real Estate",
    tagline: "Close deals faster with AI assistance.",
    description: "Handle closings, title work, and transactions with AI contract review and document management.",
    heroDescription: "GetFirmFlow helps real estate attorneys manage transactions efficiently, review contracts thoroughly, and close deals on time.",
    features: [
      { title: "AI Contract Review", description: "Upload purchase agreements, leases, and title documents for instant AI analysis of risks, missing clauses, and suggested revisions." },
      { title: "Closing Checklist Automation", description: "Automated checklists that track every step from contract to closing, with task assignments and deadline reminders." },
      { title: "Title Document Management", description: "Organize title commitments, surveys, exceptions, and clearance documents with full version history." },
      { title: "Transaction Timelines", description: "Visual timelines showing key dates—inspection, financing contingency, closing—with automatic alerts." },
      { title: "Escrow Tracking", description: "Track earnest money, escrow deposits, and disbursements with integration to your trust accounting." },
      { title: "Multi-Party Coordination", description: "Share documents and status updates with buyers, sellers, lenders, and agents through secure portals." }
    ],
    aiFeatures: [
      "Review contracts for risks",
      "Draft contract amendments",
      "Generate closing statements",
      "Summarize title exceptions",
      "Create due diligence checklists"
    ],
    testimonial: {
      quote: "The AI contract review caught a title exception that could have cost my client thousands. It pays for itself with every transaction.",
      author: "Robert Chen",
      title: "Real Estate Attorney, Phoenix AZ"
    },
    stats: [
      { value: "50%", label: "Faster closings" },
      { value: "100%", label: "Contract review coverage" },
      { value: "24/7", label: "Document access" }
    ]
  },
  "business-law": {
    icon: Briefcase,
    name: "Business Law",
    tagline: "Power your corporate practice with AI.",
    description: "Draft contracts, manage entity formations, and handle corporate compliance with AI assistance.",
    heroDescription: "GetFirmFlow helps business attorneys draft contracts faster, manage corporate compliance, and provide strategic counsel to business clients.",
    features: [
      { title: "AI Contract Drafting", description: "Generate NDAs, operating agreements, employment contracts, and commercial agreements with AI assistance and clause libraries." },
      { title: "Entity Formation Templates", description: "Complete packages for LLCs, corporations, and partnerships including articles, bylaws, and organizational resolutions." },
      { title: "Corporate Minute Books", description: "Digital minute books with annual meeting minutes, resolutions, and stock ledger management." },
      { title: "Compliance Calendars", description: "Track annual report filings, registered agent renewals, and other compliance deadlines by entity." },
      { title: "M&A Due Diligence", description: "Organize due diligence materials, track document requests, and manage virtual data rooms." },
      { title: "Shareholder Management", description: "Track ownership percentages, stock certificates, vesting schedules, and cap table changes." }
    ],
    aiFeatures: [
      "Draft custom contracts",
      "Review contracts for risks",
      "Generate corporate resolutions",
      "Create due diligence reports",
      "Summarize complex agreements"
    ],
    testimonial: {
      quote: "I used to spend half my day drafting contracts. Now the AI handles the first draft and I focus on the strategy and negotiation. My clients get better service and faster turnaround.",
      author: "Thomas Chen",
      title: "Business Attorney, Seattle WA"
    },
    stats: [
      { value: "3x", label: "Faster contract drafting" },
      { value: "500+", label: "Clause library" },
      { value: "100%", label: "Compliance tracking" }
    ]
  },
  "estate-planning": {
    icon: Home,
    name: "Estate Planning",
    tagline: "Protect your clients' legacies.",
    description: "Create wills, trusts, and estate plans with document automation and client questionnaires.",
    heroDescription: "GetFirmFlow helps estate planning attorneys create comprehensive plans efficiently, ensuring your clients' wishes are protected.",
    features: [
      { title: "Will & Trust Templates", description: "Comprehensive templates for simple wills, revocable trusts, irrevocable trusts, and special needs trusts with state-specific provisions." },
      { title: "Asset Inventory Tracking", description: "Track real property, financial accounts, business interests, and personal property with current valuations." },
      { title: "Beneficiary Management", description: "Manage primary, contingent, and charitable beneficiaries across all plan documents with automatic updates." },
      { title: "Power of Attorney Forms", description: "State-compliant financial and healthcare powers of attorney with customizable agent powers." },
      { title: "Estate Tax Calculations", description: "Estimate federal and state estate taxes with portability analysis and gifting strategies." },
      { title: "Client Intake Automation", description: "Online questionnaires that gather family, asset, and planning goal information before the first meeting." }
    ],
    aiFeatures: [
      "Draft estate planning documents",
      "Generate asset summaries",
      "Create trust funding checklists",
      "Draft letters of instruction",
      "Summarize existing documents"
    ],
    testimonial: {
      quote: "Estate planning involves so many moving pieces. GetFirmFlow keeps everything organized and lets me produce complete estate plans in half the time.",
      author: "Patricia Williams",
      title: "Estate Planning Attorney, Boston MA"
    },
    stats: [
      { value: "50%", label: "Faster document preparation" },
      { value: "100+", label: "Document templates" },
      { value: "99%", label: "Client satisfaction" }
    ]
  },
  "general-practice": {
    icon: FileText,
    name: "General Practice",
    tagline: "One platform for every case type.",
    description: "A flexible solution for general practitioners handling multiple practice areas.",
    heroDescription: "GetFirmFlow adapts to your diverse practice, providing the tools you need regardless of what cases walk through your door.",
    features: [
      { title: "Multi-Practice Area Support", description: "Switch seamlessly between case types with context-aware features and templates for each practice area." },
      { title: "Customizable Workflows", description: "Create custom workflows, checklists, and automation rules that match how you practice." },
      { title: "Document Template Library", description: "Access templates across all practice areas or create your own custom templates with merge fields." },
      { title: "Flexible Billing Options", description: "Support for hourly, flat fee, contingency, hybrid, and pro bono arrangements—often on the same matter." },
      { title: "Matter Categorization", description: "Organize matters by practice area, status, client, or custom tags with powerful filtering." },
      { title: "Cross-Matter Search", description: "Search across all matters for documents, contacts, and notes to find what you need instantly." }
    ],
    aiFeatures: [
      "Draft documents for any practice area",
      "Research across all legal topics",
      "Generate custom templates",
      "Summarize any document type",
      "Create matter summaries"
    ],
    testimonial: {
      quote: "As a general practitioner in a small town, I handle everything from wills to DUIs. GetFirmFlow gives me the tools I need for every type of case.",
      author: "James Wilson",
      title: "General Practice Attorney, Rural Montana"
    },
    stats: [
      { value: "8", label: "Practice areas supported" },
      { value: "1000+", label: "Document templates" },
      { value: "Unlimited", label: "Custom workflows" }
    ]
  }
}

export function generateStaticParams() {
  return Object.keys(practiceAreaData).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const data = practiceAreaData[params.slug]
  if (!data) {
    return { title: "Practice Area Not Found" }
  }

  return {
    title: `${data.name} Software - Legal Practice Management for ${data.name} Attorneys`,
    description: data.description + " " + data.heroDescription,
    keywords: [
      `${data.name.toLowerCase()} software`,
      `${data.name.toLowerCase()} attorney software`,
      `${data.name.toLowerCase()} law firm software`,
      `${data.name.toLowerCase()} case management`,
      `${data.name.toLowerCase()} practice management`,
    ],
    openGraph: {
      title: `${data.name} Software - Legal Practice Management`,
      description: data.description,
      url: `https://getfirmflow.com/practice-areas/${params.slug}`,
    },
    alternates: {
      canonical: `https://getfirmflow.com/practice-areas/${params.slug}`,
    },
  }
}

export default function PracticeAreaPage({ params }: { params: { slug: string } }) {
  const data = practiceAreaData[params.slug]

  if (!data) {
    notFound()
  }

  const Icon = data.icon

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-blue-600 font-medium">{data.name}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                {data.tagline}
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                {data.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="grid grid-cols-3 gap-4">
              {data.stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Features Built for {data.name}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {data.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-blue-600 font-medium">AI-Powered</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                AI That Understands {data.name}
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Our AI isn&apos;t a generic tool—it&apos;s trained specifically for legal work in your practice area.
              </p>
              <ul className="space-y-4">
                {data.aiFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">AI Assistant</p>
                  <p className="text-sm text-slate-500">Specialized for {data.name}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-600 italic">&quot;Draft a {data.name.toLowerCase()} document based on the case facts...&quot;</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>Generates in seconds, not hours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
            <p className="text-xl md:text-2xl text-white mb-8 italic">
              &quot;{data.testimonial.quote}&quot;
            </p>
            <div>
              <p className="font-semibold text-white">{data.testimonial.author}</p>
              <p className="text-slate-400">{data.testimonial.title}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Your Client Data is Protected
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            SOC 2 Type II certified, 256-bit encryption, and your data is never used to train AI models.
          </p>
          <Link href="/security">
            <Button variant="outline">Learn About Our Security</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your {data.name} Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your 14-day free trial and see the difference AI-powered tools can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/practice-areas">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                View All Practice Areas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
