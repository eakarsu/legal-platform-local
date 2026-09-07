import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Check, Users, DollarSign, Headphones, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Partner Program - Earn Revenue Referring Law Firms",
  description: "Join GetFirmFlow's partner program. Earn 20% commissions as a referral partner or build integrations with our API. Perfect for legal consultants and tech vendors.",
  keywords: ["legal software partner program", "law firm referral program", "legal tech affiliate", "GetFirmFlow partners"],
  openGraph: {
    title: "Partner Program - Earn Revenue Referring Law Firms",
    description: "Earn 20% commissions as a referral partner or build integrations.",
    url: "https://getfirmflow.com/partners",
  },
  alternates: {
    canonical: "https://getfirmflow.com/partners",
  },
}

export default function PartnersPage() {
  const partnerTypes = [
    {
      icon: Link2,
      title: "Referral Partners",
      description: "Earn commissions by referring law firms to GetFirmFlow. Perfect for legal consultants, practice management advisors, and technology vendors.",
      benefits: [
        "20% commission on first-year revenue",
        "Dedicated partner portal",
        "Co-marketing opportunities",
        "Partner certification program"
      ]
    },
    {
      icon: Users,
      title: "Integration Partners",
      description: "Build integrations with GetFirmFlow. Connect your software to our platform and reach thousands of law firms.",
      benefits: [
        "API access and documentation",
        "Technical support and sandbox",
        "Co-marketing and listing",
        "Revenue sharing opportunities"
      ]
    },
    {
      icon: DollarSign,
      title: "Reseller Partners",
      description: "White-label or resell GetFirmFlow to your customers. Ideal for legal technology providers and bar associations.",
      benefits: [
        "Volume discounts",
        "White-label options",
        "Sales enablement materials",
        "Dedicated account management"
      ]
    }
  ]

  const partnerBenefits = [
    "Access to partner-only pricing",
    "Sales and marketing collateral",
    "Training and certification",
    "Dedicated partner success manager",
    "Early access to new features",
    "Partner advisory board participation"
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Partner With Us
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Join our partner ecosystem and help law firms transform their practices with AI-powered tools.
          </p>
          <Link href="/contact">
            <Button size="lg" className="text-lg px-8">
              Become a Partner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Partnership Opportunities
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {partnerTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <type.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, i) => (
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

      {/* Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why Partner With Us?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Our partners are an extension of our team. We invest in your success with dedicated support, competitive economics, and shared growth opportunities.
              </p>
              <ul className="space-y-3">
                {partnerBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">50+</p>
                  <p className="text-slate-600">Active Partners</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">$2M+</p>
                  <p className="text-slate-600">Partner Earnings</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">100+</p>
                  <p className="text-slate-600">Referrals/Month</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">24hr</p>
                  <p className="text-slate-600">Partner Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">
            Our Partners Include
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Legal Consultants', 'Bar Associations', 'Tech Providers', 'Accounting Firms', 'Marketing Agencies', 'Insurance Providers', 'CLE Providers', 'Legal Publishers'].map((partner, i) => (
              <div key={i} className="bg-slate-100 rounded-lg py-8 px-4">
                <p className="text-slate-600 font-medium">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Partner?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Let&apos;s discuss how we can work together to help more law firms succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Apply to Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
              Download Partner Guide
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
