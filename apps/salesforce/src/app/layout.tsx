import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://getfirmflow.com"),
  title: {
    default: "GetFirmFlow - AI-Powered Legal Practice Management Software",
    template: "%s | GetFirmFlow",
  },
  description: "Transform your law firm with AI-powered practice management. Automate document drafting, legal research, billing, client intake, and case management. Built for solo practitioners and small law firms.",
  keywords: [
    "legal practice management software",
    "law firm management software",
    "AI legal assistant",
    "legal document automation",
    "law firm billing software",
    "legal case management",
    "attorney practice management",
    "small law firm software",
    "legal time tracking",
    "trust accounting software",
    "legal CRM",
    "client intake software",
    "legal research AI",
    "contract review AI",
  ],
  authors: [{ name: "GetFirmFlow", url: "https://getfirmflow.com" }],
  creator: "GetFirmFlow",
  publisher: "GetFirmFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Legal Technology",
  classification: "Business Software",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getfirmflow.com",
    siteName: "GetFirmFlow",
    title: "GetFirmFlow - AI-Powered Legal Practice Management Software",
    description: "Transform your law firm with AI-powered practice management. Automate document drafting, legal research, billing, and case management.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetFirmFlow - AI-Powered Legal Practice Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetFirmFlow - AI-Powered Legal Practice Management",
    description: "Transform your law firm with AI-powered practice management software.",
    images: ["/og-image.png"],
    creator: "@getfirmflow",
    site: "@getfirmflow",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://getfirmflow.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "msapplication-TileColor": "#2563eb",
  },
}

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://getfirmflow.com/#organization",
      name: "GetFirmFlow",
      url: "https://getfirmflow.com",
      logo: {
        "@type": "ImageObject",
        url: "https://getfirmflow.com/logo.svg",
        width: 200,
        height: 50,
      },
      sameAs: [
        "https://twitter.com/getfirmflow",
        "https://linkedin.com/company/getfirmflow",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-555-0123",
        contactType: "customer service",
        email: "hello@getfirmflow.com",
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://getfirmflow.com/#website",
      url: "https://getfirmflow.com",
      name: "GetFirmFlow",
      publisher: {
        "@id": "https://getfirmflow.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://getfirmflow.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://getfirmflow.com/#software",
      name: "GetFirmFlow",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "49",
        highPrice: "199",
        offerCount: "3",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
      description: "AI-powered legal practice management software for small law firms",
      featureList: [
        "AI Document Drafting",
        "Legal Research Assistant",
        "Contract Review",
        "Time & Billing",
        "Trust Accounting",
        "Client Management",
        "Calendar & Deadlines",
        "Document Management",
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
