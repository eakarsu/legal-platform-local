import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingLayout } from "@/components/marketing/MarketingLayout"

export const metadata: Metadata = {
  title: "Blog - Legal Tech Insights & Practice Management Tips",
  description: "Expert insights on legal technology, practice management, AI in law, billing best practices, and tips for running a successful small law firm.",
  keywords: ["legal blog", "law firm management tips", "legal technology news", "attorney practice tips", "legal AI insights"],
  openGraph: {
    title: "Blog - Legal Tech Insights & Practice Management Tips",
    description: "Expert insights on legal technology and practice management.",
    url: "https://getfirmflow.com/blog",
  },
  alternates: {
    canonical: "https://getfirmflow.com/blog",
  },
}

export default function BlogPage() {
  const posts = [
    {
      title: "How AI is Transforming Small Law Firm Operations in 2024",
      excerpt: "Artificial intelligence is no longer just for BigLaw. Learn how small firms are using AI to compete with larger practices.",
      author: "Sarah Chen",
      date: "Dec 5, 2024",
      readTime: "8 min read",
      category: "AI & Technology",
      featured: true
    },
    {
      title: "The Complete Guide to IOLTA Trust Accounting",
      excerpt: "Everything you need to know about managing client trust accounts and staying compliant with bar requirements.",
      author: "Jessica Martinez",
      date: "Dec 1, 2024",
      readTime: "12 min read",
      category: "Compliance"
    },
    {
      title: "5 Ways to Reduce Administrative Burden in Your Practice",
      excerpt: "Practical tips for automating routine tasks and freeing up more time for billable work.",
      author: "Emily Watson",
      date: "Nov 28, 2024",
      readTime: "6 min read",
      category: "Productivity"
    },
    {
      title: "Personal Injury Case Management: Best Practices for 2024",
      excerpt: "A comprehensive guide to managing PI cases from intake to settlement, with tips from experienced practitioners.",
      author: "Sarah Chen",
      date: "Nov 20, 2024",
      readTime: "10 min read",
      category: "Practice Management"
    },
    {
      title: "Understanding Legal AI: What It Can and Can't Do",
      excerpt: "A realistic look at AI capabilities in legal practice, including ethical considerations and best practices.",
      author: "Michael Torres",
      date: "Nov 15, 2024",
      readTime: "9 min read",
      category: "AI & Technology"
    },
    {
      title: "Client Communication: Building Trust in the Digital Age",
      excerpt: "How to maintain strong client relationships while leveraging digital tools and client portals.",
      author: "Jessica Martinez",
      date: "Nov 10, 2024",
      readTime: "7 min read",
      category: "Client Relations"
    }
  ]

  const categories = [
    "All Posts",
    "AI & Technology",
    "Practice Management",
    "Compliance",
    "Productivity",
    "Client Relations"
  ]

  const featuredPost = posts.find(p => p.featured)
  const regularPosts = posts.filter(p => !p.featured)

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            The Small Law Firm Blog
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Insights, guides, and best practices for running a modern small law practice.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-slate-600 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Button>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl p-8 shadow-lg">
                    <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400">Article Image</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="aspect-video bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Article Image</span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{post.category}</span>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-slate-600 mb-8">
            Get the latest articles, product updates, and legal tech insights delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
