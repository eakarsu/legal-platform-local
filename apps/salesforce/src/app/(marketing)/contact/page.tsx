"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, MessageSquare, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Thank you for your message! We'll get back to you within 24 hours.")
  }

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions about GetFirmFlow? Our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Email</h3>
                <a href="mailto:hello@getfirmflow.com" className="text-blue-600 hover:underline">
                  hello@getfirmflow.com
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Phone</h3>
                <a href="tel:1-800-555-0123" className="text-blue-600 hover:underline">
                  1-800-555-0123
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Live Chat</h3>
                <p className="text-slate-600 text-sm">Available 9am-6pm PT</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Response Time</h3>
                <p className="text-slate-600 text-sm">Within 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-slate-600 mb-8">
                Fill out the form and we&apos;ll get back to you within 24 hours. For urgent matters, please call us directly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Law Firm Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <select
                      id="subject"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="press">Press/Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Office Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900">GetFirmFlow</p>
                      <p className="text-slate-600">
                        123 Legal Tech Drive<br />
                        Suite 400<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">Map</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Contacts</CardTitle>
                  <CardDescription>Reach the right team directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-900">Sales</p>
                    <a href="mailto:sales@getfirmflow.com" className="text-blue-600 hover:underline text-sm">
                      sales@getfirmflow.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Support</p>
                    <a href="mailto:support@getfirmflow.com" className="text-blue-600 hover:underline text-sm">
                      support@getfirmflow.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Partnerships</p>
                    <a href="mailto:partners@getfirmflow.com" className="text-blue-600 hover:underline text-sm">
                      partners@getfirmflow.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Press</p>
                    <a href="mailto:press@getfirmflow.com" className="text-blue-600 hover:underline text-sm">
                      press@getfirmflow.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
