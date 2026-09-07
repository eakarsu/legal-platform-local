import Link from "next/link"
import type { Metadata } from "next"
import { Scale, ArrowRight, Users, Target, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "About Us - Our Mission to Empower Small Law Firms",
  description: "GetFirmFlow is built by attorneys and engineers who believe small law firms deserve enterprise-grade tools. Learn about our team, mission, and commitment to legal innovation.",
  keywords: ["about GetFirmFlow", "legal tech company", "law firm software company", "legal innovation", "attorney software team"],
  openGraph: {
    title: "About Us - Our Mission to Empower Small Law Firms",
    description: "Built by attorneys and engineers who believe small law firms deserve enterprise-grade tools.",
    url: "https://getfirmflow.com/about",
  },
  alternates: {
    canonical: "https://getfirmflow.com/about",
  },
}

export default function AboutPage() {
  const team = [
    { name: "Sarah Chen", role: "CEO & Co-Founder", bio: "Former BigLaw partner turned legal tech entrepreneur. 15+ years in litigation." },
    { name: "Michael Torres", role: "CTO & Co-Founder", bio: "Ex-Google engineer. Built AI systems at scale for Fortune 500 companies." },
    { name: "Emily Watson", role: "VP of Product", bio: "Former Clio product lead. Passionate about making legal tech accessible." },
    { name: "David Kim", role: "VP of Engineering", bio: "Built enterprise SaaS platforms for 10+ years. Security and compliance expert." },
    { name: "Jessica Martinez", role: "Head of Customer Success", bio: "Paralegal turned customer advocate. Knows the pain points firsthand." },
    { name: "Robert Johnson", role: "Head of Sales", bio: "20 years selling to law firms. Trusted advisor to hundreds of attorneys." }
  ]

  const values = [
    { icon: Users, title: "Customer First", description: "Every feature we build starts with understanding what attorneys actually need." },
    { icon: Target, title: "Simplicity", description: "Powerful doesn't have to mean complicated. We obsess over ease of use." },
    { icon: Heart, title: "Integrity", description: "We handle sensitive data. Trust is earned through transparency and security." },
    { icon: Award, title: "Excellence", description: "We're not satisfied with good enough. We push for exceptional." }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Built by Lawyers, for Lawyers
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We started GetFirmFlow because we lived the pain of outdated legal software. Now we&apos;re on a mission to give every small firm access to AI-powered tools.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  In 2022, our co-founder Sarah Chen left her BigLaw partnership to start a small personal injury practice. She quickly discovered that the software options for small firms were either too expensive, too complicated, or woefully outdated.
                </p>
                <p>
                  Meanwhile, AI was transforming every industry—except legal. Big firms had teams of developers building custom tools. Small firms were stuck with the same software from the 2010s.
                </p>
                <p>
                  Sarah teamed up with Michael Torres, a Google engineer she knew from law school, to build the practice management platform they wished existed: affordable, intuitive, and powered by AI designed specifically for legal work.
                </p>
                <p>
                  Today, GetFirmFlow serves 500+ firms nationwide, helping attorneys spend less time on administrative work and more time serving their clients.
                </p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-10 w-10" />
                <div>
                  <p className="text-2xl font-bold">GetFirmFlow</p>
                  <p className="text-slate-400">Founded 2022</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-slate-400">Law firms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50</p>
                  <p className="text-slate-400">States served</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">25</p>
                  <p className="text-slate-400">Team members</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">98%</p>
                  <p className="text-slate-400">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-2xl text-blue-100">
            To democratize legal technology by giving every small law firm access to the same AI-powered tools that big firms use—at a price they can afford.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Leadership Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-blue-600 text-sm mb-2">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Whether you&apos;re a customer, partner, or future team member, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                View Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
