import type { Metadata } from "next"
import { Shield, Lock, Server, Eye, FileCheck, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Security - Enterprise-Grade Protection for Your Data",
  description: "GetFirmFlow is SOC 2 Type II certified with 256-bit AES encryption, HIPAA compliance, and 99.99% uptime. Your client data is protected by bank-grade security.",
  keywords: ["legal software security", "SOC 2 certified legal software", "HIPAA compliant law firm software", "secure legal practice management"],
  openGraph: {
    title: "Security - Enterprise-Grade Protection for Your Data",
    description: "SOC 2 certified with 256-bit encryption and 99.99% uptime.",
    url: "https://getfirmflow.com/security",
  },
  alternates: {
    canonical: "https://getfirmflow.com/security",
  },
}

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "256-bit AES Encryption",
      description: "All data is encrypted at rest and in transit using bank-grade 256-bit AES encryption."
    },
    {
      icon: Server,
      title: "SOC 2 Type II Certified",
      description: "Our systems and processes are independently audited and certified for security, availability, and confidentiality."
    },
    {
      icon: Eye,
      title: "24/7 Monitoring",
      description: "Continuous security monitoring and real-time threat detection across all systems."
    },
    {
      icon: FileCheck,
      title: "Regular Audits",
      description: "Annual penetration testing and quarterly security assessments by third-party experts."
    },
    {
      icon: Users,
      title: "Access Controls",
      description: "Role-based access control (RBAC) with multi-factor authentication for all accounts."
    },
    {
      icon: AlertTriangle,
      title: "Incident Response",
      description: "Dedicated security team with established incident response procedures and 24-hour breach notification."
    }
  ]

  const compliance = [
    { name: "SOC 2 Type II", status: "Certified", date: "2024" },
    { name: "HIPAA", status: "Compliant", date: "2024" },
    { name: "GDPR", status: "Compliant", date: "2024" },
    { name: "CCPA", status: "Compliant", date: "2024" },
    { name: "ISO 27001", status: "In Progress", date: "2025" }
  ]

  const practices = [
    {
      title: "Data Center Security",
      items: [
        "AWS data centers with physical security controls",
        "Geographically distributed infrastructure",
        "Redundant power and cooling systems",
        "24/7 security personnel and video surveillance"
      ]
    },
    {
      title: "Network Security",
      items: [
        "Web Application Firewall (WAF)",
        "DDoS protection and mitigation",
        "Intrusion detection and prevention",
        "Regular vulnerability scanning"
      ]
    },
    {
      title: "Application Security",
      items: [
        "Secure development lifecycle (SDLC)",
        "Code review and static analysis",
        "Dependency vulnerability scanning",
        "Regular penetration testing"
      ]
    },
    {
      title: "Data Protection",
      items: [
        "End-to-end encryption",
        "Automated backups with encryption",
        "Data isolation between tenants",
        "Secure data deletion procedures"
      ]
    }
  ]

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4 mr-2" />
            SOC 2 Type II Certified
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Security You Can Trust
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Protecting your client data is our top priority. We implement industry-leading security measures to ensure your practice stays safe.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Built from the ground up with security in mind, meeting the stringent requirements of legal professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We maintain compliance with industry standards and regulations relevant to legal practice management.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {compliance.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 ${item.status === 'In Progress' ? 'text-yellow-500' : 'text-green-600'}`} />
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          item.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-sm text-slate-500">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Our Security Practices
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A comprehensive approach to security across all layers of our infrastructure and application.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {practices.map((practice, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{practice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {practice.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Privacy */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Your Data, Your Control
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Ownership</h3>
                  <p className="text-slate-600">
                    You retain full ownership of all your data. We never sell, share, or use your data for any purpose other than providing our services.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Training</h3>
                  <p className="text-slate-600">
                    <strong>Your data is never used to train AI models.</strong> When you use AI features, data is processed in real-time but not retained for training purposes.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Export</h3>
                  <p className="text-slate-600">
                    Export all your data at any time in standard formats. You&apos;re never locked in.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Deletion</h3>
                  <p className="text-slate-600">
                    Request complete deletion of your data at any time. We follow secure data destruction procedures.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Attorney-Client Privilege</h3>
              <p className="text-slate-300 mb-6">
                We understand the critical importance of attorney-client privilege. Our systems are designed to protect privileged communications and work product.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Strict access controls prevent unauthorized access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Encryption protects data from interception</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Audit logs track all data access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Our staff is trained on legal confidentiality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Report */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Request Security Documentation
          </h2>
          <p className="text-slate-600 mb-8">
            Need more details for your firm&apos;s compliance requirements? Request our security documentation package including SOC 2 report, penetration test summary, and security questionnaire responses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:security@getfirmflow.com?subject=Security Documentation Request"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Request Security Package
            </a>
            <a
              href="/privacy"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              View Privacy Policy
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Report a Security Concern
          </h2>
          <p className="text-slate-300 mb-8">
            If you discover a security vulnerability, please report it to our security team. We take all reports seriously and will respond promptly.
          </p>
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="font-medium text-slate-900 mb-2">Security Team</p>
              <a href="mailto:security@getfirmflow.com" className="text-blue-600 hover:underline">
                security@getfirmflow.com
              </a>
              <p className="text-sm text-slate-500 mt-4">
                For sensitive reports, please use our PGP key available upon request.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  )
}
