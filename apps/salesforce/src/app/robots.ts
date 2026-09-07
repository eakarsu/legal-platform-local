import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://getfirmflow.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/clients/',
          '/matters/',
          '/documents/',
          '/invoices/',
          '/time-billing/',
          '/trust/',
          '/calendar/',
          '/deadlines/',
          '/reports/',
          '/contacts/',
          '/settings/',
          '/ai/',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/clients/',
          '/matters/',
          '/documents/',
          '/invoices/',
          '/time-billing/',
          '/trust/',
          '/calendar/',
          '/deadlines/',
          '/reports/',
          '/contacts/',
          '/settings/',
          '/ai/',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
