import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with Our Team",
  description: "Contact GetFirmFlow for sales inquiries, support, or partnership opportunities. We're here to help your law firm succeed with AI-powered practice management.",
  keywords: ["contact GetFirmFlow", "legal software support", "law firm software demo", "GetFirmFlow sales"],
  openGraph: {
    title: "Contact Us - Get in Touch with Our Team",
    description: "Contact us for sales, support, or partnership opportunities.",
    url: "https://getfirmflow.com/contact",
  },
  alternates: {
    canonical: "https://getfirmflow.com/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
