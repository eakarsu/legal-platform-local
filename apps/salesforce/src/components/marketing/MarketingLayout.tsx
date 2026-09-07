"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogoInline } from "@/components/ui/logo"

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <LogoInline />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/practice-areas" className="text-slate-600 hover:text-slate-900 transition-colors">Practice Areas</Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
            <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
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
            <Link href="/features" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="/pricing" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/practice-areas" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Practice Areas</Link>
            <Link href="/about" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
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
  )
}

export function MarketingFooter() {
  return (
    <>
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
              <Link href="/" className="flex items-center mb-4">
                <LogoInline variant="dark" />
              </Link>
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
              <Link href="/security" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
