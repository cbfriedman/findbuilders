import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Calendar, User, ArrowRight, FileText } from 'lucide-react'

export const metadata = {
  title: 'Blog',
  description: 'Construction tips, contractor advice, and home improvement guides',
}

// Sample blog posts for demo (in production, these would come from the database)
const samplePosts = [
  {
    id: '1',
    slug: 'how-to-find-reliable-contractor',
    title: 'How to Find a Reliable Contractor: A Complete Guide',
    excerpt: 'Learn the essential steps to finding and vetting contractors for your home improvement project. From checking licenses to reading reviews, we cover everything you need to know.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Guides',
    published_at: '2026-03-15',
    read_time: 8,
  },
  {
    id: '2',
    slug: 'kitchen-remodel-costs-2026',
    title: 'Kitchen Remodel Costs in 2026: What to Expect',
    excerpt: 'Planning a kitchen renovation? Get realistic cost estimates for different budget levels, from minor updates to full gut renovations.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Cost Guides',
    published_at: '2026-03-10',
    read_time: 6,
  },
  {
    id: '3',
    slug: 'bathroom-renovation-timeline',
    title: 'Bathroom Renovation Timeline: How Long Does It Really Take?',
    excerpt: 'From demo to final touches, understand the realistic timeline for bathroom renovations of different scopes.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Planning',
    published_at: '2026-03-05',
    read_time: 5,
  },
  {
    id: '4',
    slug: 'do-i-need-permit',
    title: 'Do I Need a Permit? Understanding Building Permit Requirements',
    excerpt: 'Navigate the often confusing world of building permits. Learn which projects require permits and how to get them.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Regulations',
    published_at: '2026-03-01',
    read_time: 7,
  },
  {
    id: '5',
    slug: 'contractor-red-flags',
    title: '10 Red Flags When Hiring a Contractor',
    excerpt: 'Protect yourself from scams and bad contractors by learning these warning signs before you sign any contract.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Tips',
    published_at: '2026-02-25',
    read_time: 6,
  },
  {
    id: '6',
    slug: 'home-improvement-roi',
    title: 'Home Improvements with the Best ROI in 2026',
    excerpt: 'Maximize your investment with these home improvement projects that offer the best return when selling your home.',
    cover_image: null,
    author: 'FindBuilders Team',
    category: 'Investment',
    published_at: '2026-02-20',
    read_time: 8,
  },
]

export default async function BlogPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // In production, fetch from database:
  // const { data: posts } = await supabase
  //   .from('blog_posts')
  //   .select('*')
  //   .eq('status', 'published')
  //   .order('published_at', { ascending: false })

  const posts = samplePosts

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Construction & Home Improvement Blog
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tips, guides, and expert advice for your next project
            </p>
          </div>

          {posts.length === 0 ? (
            <Empty
              icon={FileText}
              title="No posts yet"
              description="Check back later for new content"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Cover Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10" />

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {post.read_time} min read
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-semibold text-foreground line-clamp-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
