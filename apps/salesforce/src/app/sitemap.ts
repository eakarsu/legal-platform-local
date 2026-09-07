import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://getfirmflow.com'

  // Practice areas for dynamic routes
  const practiceAreas = [
    'personal-injury',
    'family-law',
    'criminal-defense',
    'immigration',
    'real-estate',
    'business-law',
    'estate-planning',
    'general-practice',
  ]

  // Static marketing pages
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/features', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/practice-areas', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
    { url: '/integrations', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/api', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/partners', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/careers', priority: 0.5, changeFrequency: 'weekly' as const },
    { url: '/press', priority: 0.4, changeFrequency: 'monthly' as const },
    { url: '/help-center', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/security', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/status', priority: 0.3, changeFrequency: 'daily' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const now = new Date()

  // Generate sitemap entries for static pages
  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Generate sitemap entries for practice area pages
  const practiceAreaEntries = practiceAreas.map((slug) => ({
    url: `${baseUrl}/practice-areas/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...practiceAreaEntries]
}
