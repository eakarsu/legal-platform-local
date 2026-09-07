import type { Metadata } from "next"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "GetFirmFlow Terms of Service. Read our terms and conditions for using the GetFirmFlow legal practice management platform.",
  openGraph: {
    title: "Terms of Service",
    description: "Terms and conditions for using GetFirmFlow.",
    url: "https://getfirmflow.com/terms",
  },
  alternates: {
    canonical: "https://getfirmflow.com/terms",
  },
}

export default function TermsPage() {
  return (
    <MarketingLayout>
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600">Last updated: December 1, 2024</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using GetFirmFlow (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            GetFirmFlow provides cloud-based legal practice management software, including client and matter management, time tracking, billing, trust accounting, document management, and AI-powered legal tools.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use the Service, you must register for an account. You agree to provide accurate, current, and complete information and to update this information as necessary. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2>4. Subscription and Payment</h2>
          <h3>4.1 Fees</h3>
          <p>
            You agree to pay all fees associated with your subscription plan. Fees are billed in advance on a monthly or annual basis depending on your plan selection.
          </p>

          <h3>4.2 Free Trial</h3>
          <p>
            We may offer a free trial period. At the end of the trial, your account will be charged unless you cancel before the trial ends.
          </p>

          <h3>4.3 Refunds</h3>
          <p>
            Annual subscriptions include a 30-day money-back guarantee. Monthly subscriptions are non-refundable.
          </p>

          <h2>5. Your Data</h2>
          <h3>5.1 Ownership</h3>
          <p>
            You retain all rights to the data you upload to the Service. We do not claim ownership of your client data, documents, or other content.
          </p>

          <h3>5.2 License</h3>
          <p>
            You grant us a limited license to use your data solely for the purpose of providing the Service to you.
          </p>

          <h3>5.3 Data Export</h3>
          <p>
            You may export your data at any time through the Service&apos;s export features.
          </p>

          <h2>6. AI Features</h2>
          <p>
            Our AI features are designed to assist legal professionals but are not a substitute for professional legal judgment. You are responsible for reviewing and verifying all AI-generated content before use. We do not guarantee the accuracy, completeness, or legal sufficiency of AI-generated content.
          </p>

          <h2>7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Upload malicious code or content</li>
            <li>Resell or redistribute the Service without authorization</li>
            <li>Use the Service to store or transmit content that infringes intellectual property rights</li>
          </ul>

          <h2>8. Confidentiality</h2>
          <p>
            We understand the sensitive nature of legal data. We maintain strict confidentiality standards and will not disclose your data except as required to provide the Service or as required by law.
          </p>

          <h2>9. Service Level Agreement</h2>
          <p>
            We commit to 99.9% uptime for the Service. If we fail to meet this commitment, you may be eligible for service credits as described in our SLA documentation.
          </p>

          <h2>10. Intellectual Property</h2>
          <p>
            The Service, including all software, designs, and content (excluding your data), is owned by GetFirmFlow and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service.
          </p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY YOU IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>

          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless GetFirmFlow from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2>14. Termination</h2>
          <p>
            Either party may terminate this agreement at any time. Upon termination, your access to the Service will cease. Your data will remain available for export for 30 days following termination.
          </p>

          <h2>15. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>

          <h2>16. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes shall be resolved in the courts of San Francisco County, California.
          </p>

          <h2>17. Contact</h2>
          <p>
            Questions about these Terms should be directed to:
          </p>
          <p>
            GetFirmFlow<br />
            Attn: Legal Department<br />
            123 Legal Tech Drive, Suite 400<br />
            San Francisco, CA 94105<br />
            legal@getfirmflow.com
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
