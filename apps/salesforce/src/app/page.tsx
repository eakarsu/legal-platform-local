"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check, ArrowRight, FileText, Clock, DollarSign, Calendar, Shield, Brain, Users, Zap,
  Menu, X, ChevronRight, Star, Play, BarChart3, Lock, Headphones, Award, Globe,
  Mail, Phone, MapPin, Linkedin, Twitter, Facebook, ChevronDown, MessageSquare,
  Briefcase, Gavel, Building, Heart, Car, Home as HomeIcon
} from "lucide-react"
import { LogoInline } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How is GetFirmFlow different from Clio or PracticePanther?",
      answer: "Unlike legacy systems that bolt AI on as an afterthought, we built AI into our core from day one. You get document drafting, legal research, and contract review included in every plan—features that cost extra (or don't exist) with competitors. Plus, our pricing is 30-50% lower."
    },
    {
      question: "Is my data secure and confidential?",
      answer: "Absolutely. We use 256-bit AES encryption, SOC 2 Type II compliance, and your data is never used to train AI models. We understand attorney-client privilege is non-negotiable. All data is stored in US-based data centers with full audit trails."
    },
    {
      question: "Can I migrate from my current software?",
      answer: "Yes! We offer free data migration for Team and Firm plans. Our team will help transfer your clients, matters, documents, and billing history. Most migrations complete within 1-2 weeks with zero downtime."
    },
    {
      question: "Does it work for my practice area?",
      answer: "GetFirmFlow works for any practice area—personal injury, family law, criminal defense, immigration, estate planning, real estate, and more. Our AI adapts to your specific document types and workflows."
    },
    {
      question: "What if I need help getting started?",
      answer: "Every plan includes onboarding support. Team and Firm plans get dedicated onboarding specialists who will configure the system for your firm, train your team, and ensure you're productive from day one."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, no long-term contracts required. You can cancel anytime and export all your data. We believe in earning your business every month, not locking you in."
    }
  ]

  const practiceAreas = [
    { icon: Car, name: "Personal Injury", slug: "personal-injury", description: "Demand letters, medical chronologies, settlement tracking" },
    { icon: Heart, name: "Family Law", slug: "family-law", description: "Custody agreements, divorce filings, support calculations" },
    { icon: Gavel, name: "Criminal Defense", slug: "criminal-defense", description: "Motion templates, court deadlines, case management" },
    { icon: Globe, name: "Immigration", slug: "immigration", description: "Form automation, deadline tracking, case status" },
    { icon: Building, name: "Real Estate", slug: "real-estate", description: "Contract review, closing documents, title searches" },
    { icon: Briefcase, name: "Business Law", slug: "business-law", description: "Contract drafting, entity formation, compliance" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <LogoInline />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#practice-areas" className="text-slate-600 hover:text-slate-900 transition-colors">Practice Areas</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
              <a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Start Free Trial</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#practice-areas" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Practice Areas</a>
              <a href="#pricing" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <a href="#faq" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Practice Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                The First <span className="text-blue-600">AI-Native</span> Platform for Small Law Firms
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8">
                Stop juggling spreadsheets and outdated software. Get enterprise-level AI tools at small-firm prices — document drafting, legal research, and contract review built right in.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                    <Play className="mr-2 h-5 w-5" />
                    View Live Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-500 mt-4">No credit card required • Cancel anytime</p>

              {/* Social Proof */}
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                <div className="flex -space-x-2">
                  {['JM', 'RS', 'AK', 'TC', 'LP'].map((initials, i) => (
                    <div key={i} className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">Trusted by 500+ law firms</p>
                </div>
              </div>
            </div>

            {/* Hero Image/Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl transform rotate-3 scale-105 opacity-10"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-slate-500">GetFirmFlow Dashboard</div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Mini Dashboard */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-blue-600">47</p>
                      <p className="text-xs text-slate-600">Active Matters</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">$127K</p>
                      <p className="text-xs text-slate-600">Unbilled Time</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-orange-600">12</p>
                      <p className="text-xs text-slate-600">Due This Week</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-slate-900">AI Document Drafting</span>
                    </div>
                    <div className="bg-white rounded border p-3 text-sm text-slate-600">
                      <span className="text-blue-600">Generating demand letter</span> for Martinez v. ABC Corp...
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                      <FileText className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                      <p className="text-xs text-slate-600">Documents</p>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                      <p className="text-xs text-slate-600">Calendar</p>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                      <p className="text-xs text-slate-600">Billing</p>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                      <Users className="h-5 w-5 mx-auto text-slate-600 mb-1" />
                      <p className="text-xs text-slate-600">Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar / Logos */}
      <section className="py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm md:text-base">SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm md:text-base">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="text-sm md:text-base">Bar-Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm md:text-base">IOLTA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm md:text-base">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600">5+</p>
              <p className="text-slate-600 mt-2">Hours saved per week with AI</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600">40%</p>
              <p className="text-slate-600 mt-2">Lower cost than competitors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600">500+</p>
              <p className="text-slate-600 mt-2">Law firms trust us</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600">98%</p>
              <p className="text-slate-600 mt-2">Customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No complex setup. No IT department required. Start managing your practice smarter today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border h-full">
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Sign Up & Import</h3>
                <p className="text-slate-600">
                  Create your account in 60 seconds. Import existing clients and matters from CSV, or let us migrate your data from Clio, MyCase, or PracticePanther.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border h-full">
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Configure Your Firm</h3>
                <p className="text-slate-600">
                  Set up your billing rates, practice areas, and team members. Our setup wizard guides you through everything in under 15 minutes.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border h-full">
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Start Using AI</h3>
                <p className="text-slate-600">
                  Draft your first document with AI, track time, manage deadlines, and bill clients—all from one intuitive dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything Your Firm Needs in One Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Replace 5+ separate tools with one integrated system. AI-powered features included at no extra cost.
            </p>
          </div>

          {/* AI Features - Highlighted */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered Features
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>AI Document Drafting</CardTitle>
                  <CardDescription className="text-slate-600">
                    Generate demand letters, pleadings, motions, and correspondence in seconds. Our AI understands legal context, cites relevant case law, and matches your firm&apos;s writing style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>50+ document templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Auto-populate from matter data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>One-click editing & export</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>AI Legal Research</CardTitle>
                  <CardDescription className="text-slate-600">
                    Research case law, statutes, and regulations with natural language queries. Get relevant citations, summaries, and analysis instantly—no Westlaw subscription needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>All 50 states + federal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Citation verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Research memo generation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>AI Contract Review</CardTitle>
                  <CardDescription className="text-slate-600">
                    Upload contracts for automated risk analysis. Identify problematic clauses, missing terms, and get improvement suggestions with risk scoring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Clause-by-clause analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Risk scoring & highlights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Redline suggestions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Core Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Client & Matter Management</CardTitle>
                <CardDescription>
                  Track clients, matters, and contacts in one place. Built-in conflict checking, intake forms, and client portal keeps you organized and compliant.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Time Tracking & Billing</CardTitle>
                <CardDescription>
                  Track billable hours with one click or let AI capture time automatically. Support for hourly, flat-fee, contingency, and hybrid arrangements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Trust Accounting</CardTitle>
                <CardDescription>
                  IOLTA-compliant trust accounting with client ledgers, three-way reconciliation, and full audit trails. Never worry about bar compliance again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Deadline Management</CardTitle>
                <CardDescription>
                  Court rule-based deadline calculations with automatic reminders. Never miss a statute of limitations or filing deadline again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Organize all case documents with version control. Drag-and-drop uploads, automatic categorization, and full-text search.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-slate-600 mb-2" />
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  Real-time dashboards showing firm performance, revenue trends, productivity metrics, and work-in-progress reports.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Practice Areas Section */}
      <section id="practice-areas" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Every Practice Area
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Whether you handle personal injury, family law, or business litigation, our AI adapts to your specific workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceAreas.map((area, index) => (
              <Link key={index} href={`/practice-areas/${area.slug}`} className="block group">
                <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-1 cursor-pointer">
                  <area.icon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{area.name}</h3>
                  <p className="text-slate-600 text-sm">{area.description}</p>
                  <span className="inline-flex items-center text-blue-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No hidden fees. No per-feature charges. AI included in every plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Solo Plan */}
            <Card className="relative hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Solo</CardTitle>
                <CardDescription>For solo practitioners</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-sm text-slate-500">Flat rate, not per user</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>1 user included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Unlimited clients & matters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AI document drafting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AI legal research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Time tracking & billing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Trust accounting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>5GB document storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button variant="outline" className="w-full">Start Free Trial</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Team Plan - Most Popular */}
            <Card className="relative border-2 border-blue-600 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Team</CardTitle>
                <CardDescription>For small firms (2-5 attorneys)</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-slate-600">/user/month</span>
                </div>
                <p className="text-sm text-slate-500">Billed annually</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>2-5 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Everything in Solo, plus:</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AI contract review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Role-based permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Deadline management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>25GB document storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Priority email & chat support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Free data migration</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full">Start Free Trial</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Firm Plan */}
            <Card className="relative hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Firm</CardTitle>
                <CardDescription>For growing firms (6-10 attorneys)</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-slate-600">/user/month</span>
                </div>
                <p className="text-sm text-slate-500">Billed annually</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>6-10 users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Everything in Team, plus:</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Advanced reporting & analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Custom workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>100GB document storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Phone support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Dedicated onboarding</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button variant="outline" className="w-full">Start Free Trial</Button>
                </Link>
              </CardFooter>
            </Card>
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
          <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              For firms with 10+ attorneys. Custom pricing, dedicated support, SLA guarantees, custom integrations, and on-premise deployment options.
            </p>
            <Button size="lg" variant="secondary">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Loved by Law Firms Nationwide
            </h2>
            <p className="text-xl text-slate-600">
              See what attorneys are saying about GetFirmFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;The AI document drafting alone saves me 5+ hours per week on demand letters. It&apos;s like having a junior associate who never sleeps and never makes typos.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">JM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Jennifer Martinez</p>
                    <p className="text-sm text-slate-500">Solo PI Attorney, Miami FL</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;Finally, trust accounting that makes sense. No more end-of-month panic trying to reconcile our IOLTA account. The three-way reconciliation is bulletproof.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">RS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Robert Sullivan</p>
                    <p className="text-sm text-slate-500">Partner, Sullivan & Associates, Chicago IL</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;We switched from Clio and cut our software costs by 40% while getting AI features they don&apos;t even offer. The migration team made it painless.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">AK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Amanda Kim</p>
                    <p className="text-sm text-slate-500">Managing Partner, Kim Law Group, Austin TX</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;As an immigration attorney, deadlines are everything. The court rule calculations and automatic reminders have been a game-changer for our practice.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Maria Rodriguez</p>
                    <p className="text-sm text-slate-500">Immigration Attorney, Los Angeles CA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;The AI contract review caught liability issues in a vendor agreement that I might have missed. Paid for itself in the first week.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">TC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Thomas Chen</p>
                    <p className="text-sm text-slate-500">Business Attorney, Seattle WA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6">
                  &quot;My paralegal loves it. Everything is in one place—no more switching between five different programs. Onboarding took less than a day.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">LP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Lisa Patterson</p>
                    <p className="text-sm text-slate-500">Family Law Attorney, Denver CO</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about GetFirmFlow
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-slate-50 border-t">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Still have questions?</p>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join 500+ small law firms using AI to work smarter, not harder. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white/10">
                View Live Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-4">No credit card required • Free migration assistance • Cancel anytime</p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-slate-400">Get the latest legal tech tips, product updates, and industry insights.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <LogoInline variant="dark" />
              </div>
              <p className="text-sm mb-6 max-w-sm">
                AI-powered practice management software designed specifically for small law firms. Trusted by 500+ firms nationwide.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/practice-areas" className="hover:text-white transition-colors">Practice Areas</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">Partners</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-800 pt-8 mb-8">
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <a href="mailto:hello@getfirmflow.com" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                hello@getfirmflow.com
              </a>
              <a href="tel:1-800-555-0123" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                1-800-555-0123
              </a>
              <span className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} GetFirmFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
