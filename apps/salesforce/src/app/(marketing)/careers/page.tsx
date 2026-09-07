import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, MapPin, Clock, Heart, Zap, Users, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Careers - Join Our Team and Transform Legal Tech",
  description: "Join GetFirmFlow and help transform how small law firms operate. We're hiring engineers, designers, and customer success professionals. Remote-friendly.",
  keywords: ["legal tech jobs", "GetFirmFlow careers", "legal software jobs", "remote legal tech jobs", "startup jobs"],
  openGraph: {
    title: "Careers - Join Our Team and Transform Legal Tech",
    description: "Help transform how small law firms operate. We're hiring!",
    url: "https://getfirmflow.com/careers",
  },
  alternates: {
    canonical: "https://getfirmflow.com/careers",
  },
}

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "San Francisco / Remote",
      type: "Full-time",
      description: "Build the next generation of AI-powered legal tools. Work with React, Node.js, and cutting-edge AI APIs."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "San Francisco / Remote",
      type: "Full-time",
      description: "Design intuitive interfaces for complex legal workflows. Help make powerful tools feel simple."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help law firms succeed with our platform. Legal industry experience preferred."
    },
    {
      title: "Account Executive",
      department: "Sales",
      location: "Remote",
      type: "Full-time",
      description: "Sell to small law firms nationwide. Help attorneys transform their practices."
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "San Francisco / Remote",
      type: "Full-time",
      description: "Build and improve our legal AI models. Experience with NLP and document processing preferred."
    },
    {
      title: "Technical Writer",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      description: "Create clear documentation, help articles, and guides for legal professionals."
    }
  ]

  const benefits = [
    { icon: Heart, title: "Health & Wellness", description: "Comprehensive medical, dental, and vision coverage for you and your family" },
    { icon: Zap, title: "Equity", description: "Meaningful equity stake in a fast-growing company" },
    { icon: Coffee, title: "Flexible Work", description: "Work from anywhere. We're a remote-first company" },
    { icon: Users, title: "Parental Leave", description: "16 weeks paid parental leave for all new parents" },
    { icon: Clock, title: "Unlimited PTO", description: "Take the time you need to recharge" },
    { icon: Heart, title: "401(k)", description: "401(k) plan with 4% company match" }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Help us democratize legal technology. We&apos;re building AI-powered tools that make small law firms more efficient and competitive.
          </p>
          <a href="#openings">
            <Button size="lg" className="text-lg px-8">
              View Open Positions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why GetFirmFlow?
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  We&apos;re at the intersection of two massive trends: the AI revolution and the modernization of legal services. Our mission is to bring enterprise-grade tools to the 95% of attorneys who work at small firms.
                </p>
                <p>
                  We&apos;re a team of former attorneys, engineers from top tech companies, and customer success experts who genuinely care about helping lawyers succeed.
                </p>
                <p>
                  If you want to work on meaningful problems, move fast, and have real impact, we&apos;d love to hear from you.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-slate-600">Law firms served</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-green-600">3x</p>
                <p className="text-slate-600">Revenue growth YoY</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-purple-600">25</p>
                <p className="text-slate-600">Team members</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6">
                <p className="text-3xl font-bold text-orange-600">Series A</p>
                <p className="text-slate-600">Funded startup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Benefits & Perks
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <benefit.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Open Positions
          </h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {openings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="mt-1">{job.description}</CardDescription>
                    </div>
                    <Button className="shrink-0">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </span>
                  </div>
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
            Don&apos;t See the Right Role?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            We&apos;re always looking for talented people. Send us your resume and tell us how you&apos;d like to contribute.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  )
}
