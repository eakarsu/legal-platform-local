import Link from "next/link"
import type { Metadata } from "next"
import { Check, ArrowRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Pricing - Affordable Plans for Law Firms of All Sizes",
  description: "Simple, transparent pricing for GetFirmFlow. Starting at $49/month for solo practitioners. No hidden fees, no per-user pricing. Try free for 14 days.",
  keywords: ["legal software pricing", "law firm software cost", "affordable legal practice management", "legal software plans", "attorney software pricing"],
  openGraph: {
    title: "Pricing - Affordable Plans for Law Firms of All Sizes",
    description: "Simple, transparent pricing starting at $49/month. No hidden fees.",
    url: "https://getfirmflow.com/pricing",
  },
  alternates: {
    canonical: "https://getfirmflow.com/pricing",
  },
}

export default function PricingPage() {
  const plans = [
    {
      name: "Solo",
      description: "For solo practitioners",
      price: "$49",
      period: "/month",
      note: "Flat rate, not per user",
      features: [
        "1 user included",
        "Unlimited clients & matters",
        "AI document drafting",
        "AI legal research",
        "Time tracking & billing",
        "Trust accounting",
        "5GB document storage",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Team",
      description: "For small firms (2-5 attorneys)",
      price: "$39",
      period: "/user/month",
      note: "Billed annually",
      features: [
        "2-5 users",
        "Everything in Solo, plus:",
        "AI contract review",
        "Role-based permissions",
        "Deadline management",
        "25GB document storage",
        "Priority email & chat support",
        "Free data migration"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Firm",
      description: "For growing firms (6-10 attorneys)",
      price: "$29",
      period: "/user/month",
      note: "Billed annually",
      features: [
        "6-10 users",
        "Everything in Team, plus:",
        "Advanced reporting & analytics",
        "Custom workflows",
        "API access",
        "100GB document storage",
        "Phone support",
        "Dedicated onboarding"
      ],
      cta: "Start Free Trial",
      popular: false
    }
  ]

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes! All plans include a 14-day free trial. No credit card required to start."
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers for annual plans."
    },
    {
      question: "Is there a contract or commitment?",
      answer: "No long-term contracts. Monthly plans can be cancelled anytime. Annual plans are paid upfront but include a 30-day money-back guarantee."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data remains accessible for 30 days after cancellation. You can export all your data at any time, including during the cancellation period."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we offer 25% off for registered 501(c)(3) organizations. Contact us for details."
    }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            No hidden fees. No per-feature charges. AI included in every plan.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-600 shadow-xl scale-105' : 'hover:shadow-xl transition-shadow'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-500">{plan.note}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className={feature.includes("Everything") ? "font-semibold" : ""}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register" className="w-full">
                    <Button className={`w-full ${plan.popular ? '' : 'variant-outline'}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Comparison note */}
          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">
              Compare to Clio ($79-159/user) or PracticePanther ($49-99/user) — <strong>with AI included</strong>
            </p>
            <p className="text-sm text-slate-500">
              All plans include: Unlimited clients & matters • Free updates • 99.9% uptime SLA • Data export anytime
            </p>
          </div>

          {/* Enterprise */}
          <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              For firms with 10+ attorneys. Custom pricing, dedicated support, SLA guarantees, custom integrations, and on-premise deployment options.
            </p>
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Solo</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900 bg-blue-50">Team</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Firm</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Users", solo: "1", team: "2-5", firm: "6-10" },
                  { feature: "Clients & Matters", solo: "Unlimited", team: "Unlimited", firm: "Unlimited" },
                  { feature: "AI Document Drafting", solo: true, team: true, firm: true },
                  { feature: "AI Legal Research", solo: true, team: true, firm: true },
                  { feature: "AI Contract Review", solo: false, team: true, firm: true },
                  { feature: "Time Tracking", solo: true, team: true, firm: true },
                  { feature: "Trust Accounting", solo: true, team: true, firm: true },
                  { feature: "Deadline Management", solo: "Basic", team: "Advanced", firm: "Advanced" },
                  { feature: "Document Storage", solo: "5GB", team: "25GB", firm: "100GB" },
                  { feature: "Role-based Permissions", solo: false, team: true, firm: true },
                  { feature: "Custom Workflows", solo: false, team: false, firm: true },
                  { feature: "API Access", solo: false, team: false, firm: true },
                  { feature: "Support", solo: "Email", team: "Email & Chat", firm: "Phone" },
                  { feature: "Dedicated Onboarding", solo: false, team: false, firm: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-4 px-6 text-slate-700">{row.feature}</td>
                    <td className="text-center py-4 px-6">
                      {typeof row.solo === 'boolean' ? (
                        row.solo ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <span className="text-slate-300">—</span>
                      ) : row.solo}
                    </td>
                    <td className="text-center py-4 px-6 bg-blue-50">
                      {typeof row.team === 'boolean' ? (
                        row.team ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <span className="text-slate-300">—</span>
                      ) : row.team}
                    </td>
                    <td className="text-center py-4 px-6">
                      {typeof row.firm === 'boolean' ? (
                        row.firm ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <span className="text-slate-300">—</span>
                      ) : row.firm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Pricing FAQs
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  {faq.question}
                </h3>
                <p className="text-slate-600 ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your Free Trial Today
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            14 days free. No credit card required. Cancel anytime.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
