import type { Metadata } from "next"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "GetFirmFlow Privacy Policy. Learn how we collect, use, and protect your personal information and client data.",
  openGraph: {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your data.",
    url: "https://getfirmflow.com/privacy",
  },
  alternates: {
    canonical: "https://getfirmflow.com/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: December 1, 2024</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2>Introduction</h2>
          <p>
            GetFirmFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our legal practice management software and services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, law firm name, and billing information when you create an account.</li>
            <li><strong>Client Data:</strong> Information about your clients and matters that you enter into the system.</li>
            <li><strong>Documents:</strong> Files you upload to our document management system.</li>
            <li><strong>Communications:</strong> Messages you send through our platform or to our support team.</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Information about how you use our services, including features accessed and time spent.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
            <li><strong>Log Data:</strong> IP addresses, access times, and pages viewed.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Develop new features and services</li>
            <li>Monitor and analyze trends and usage</li>
            <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
          </ul>

          <h2>AI and Your Data</h2>
          <p>
            <strong>Your data is never used to train our AI models.</strong> When you use our AI features (document drafting, legal research, contract review), your data is processed in real-time to provide the service but is not retained for model training purposes.
          </p>

          <h2>Data Sharing</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third parties who perform services on our behalf (hosting, payment processing, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>Data Security</h2>
          <p>We implement robust security measures including:</p>
          <ul>
            <li>256-bit AES encryption for data at rest and in transit</li>
            <li>SOC 2 Type II compliance</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and authentication requirements</li>
            <li>Employee security training</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. Upon account termination, we retain data for 30 days before permanent deletion, unless longer retention is required by law.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>California Privacy Rights</h2>
          <p>
            California residents have additional rights under the CCPA, including the right to know what personal information we collect, the right to delete, and the right to opt out of sale (we do not sell personal information).
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for individuals under 18. We do not knowingly collect information from children.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by email or through our services.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            GetFirmFlow<br />
            Attn: Privacy Team<br />
            123 Legal Tech Drive, Suite 400<br />
            San Francisco, CA 94105<br />
            privacy@getfirmflow.com
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
