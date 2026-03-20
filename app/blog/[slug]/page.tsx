import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react'

// Sample blog post content
const samplePosts: Record<string, {
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  published_at: string
  read_time: number
}> = {
  'how-to-find-reliable-contractor': {
    title: 'How to Find a Reliable Contractor: A Complete Guide',
    excerpt: 'Learn the essential steps to finding and vetting contractors for your home improvement project.',
    content: `
Finding a reliable contractor is one of the most important steps in any home improvement project. A good contractor can turn your vision into reality, while a bad one can leave you with unfinished work, cost overruns, and endless headaches.

## 1. Start with Research

Before reaching out to any contractors, spend time researching your specific project type. Understanding what's involved will help you ask better questions and evaluate contractor responses more effectively.

- Look up typical costs for your project type
- Understand the timeline expectations
- Learn about required permits and inspections

## 2. Get Multiple Quotes

Always get at least three quotes from different contractors. This helps you understand the market rate and gives you negotiating power.

**What to look for in quotes:**
- Detailed breakdown of labor and materials
- Timeline with milestones
- Payment schedule
- Warranty information

## 3. Verify Credentials

Before hiring any contractor, verify:

- **License**: Check with your state's licensing board
- **Insurance**: Request certificates of liability and workers' comp
- **Bonding**: Especially important for larger projects
- **BBB Rating**: Check their Better Business Bureau profile

## 4. Check References

Ask for at least three recent references and actually call them. Questions to ask:

- Was the project completed on time and on budget?
- How did they handle unexpected issues?
- Would you hire them again?
- Can I see the finished work?

## 5. Review the Contract Carefully

A good contract protects both parties. Make sure it includes:

- Detailed scope of work
- Materials specifications
- Start and completion dates
- Payment schedule (never more than 10% upfront)
- Change order procedures
- Warranty terms
- Lien waiver provisions

## Red Flags to Watch For

Be wary of contractors who:

- Ask for large upfront payments
- Don't have a physical address
- Won't provide references
- Pressure you to sign immediately
- Have no insurance or won't show proof
- Only accept cash payments

## Conclusion

Taking the time to properly vet contractors upfront can save you thousands of dollars and months of frustration. Don't rush this process – a reputable contractor will understand and respect your due diligence.
    `,
    author: 'FindBuilders Team',
    category: 'Guides',
    published_at: '2026-03-15',
    read_time: 8,
  },
  'kitchen-remodel-costs-2026': {
    title: 'Kitchen Remodel Costs in 2026: What to Expect',
    excerpt: 'Planning a kitchen renovation? Get realistic cost estimates for different budget levels.',
    content: `
Kitchen remodels consistently rank among the most popular home improvement projects, and for good reason. A well-designed kitchen can transform your daily life and significantly increase your home's value.

## Average Costs by Project Size

### Minor Remodel ($15,000 - $30,000)
- Cabinet refacing or painting
- New countertops
- Updated fixtures and hardware
- Basic appliance upgrades

### Mid-Range Remodel ($30,000 - $75,000)
- New semi-custom cabinets
- Stone countertops
- Quality appliance package
- New flooring
- Updated lighting

### Major Remodel ($75,000 - $150,000+)
- Custom cabinetry
- Premium countertops
- High-end appliances
- Layout changes
- Structural modifications

## Cost Breakdown

Here's how costs typically break down:

| Item | Percentage of Budget |
|------|---------------------|
| Cabinets | 30-35% |
| Labor | 20-25% |
| Appliances | 15-20% |
| Countertops | 10-15% |
| Flooring | 5-10% |
| Lighting | 3-5% |

## Tips for Staying on Budget

1. **Keep the same layout** - Moving plumbing and electrical is expensive
2. **Reface instead of replace** - Cabinets in good condition can be refinished
3. **Choose mid-range appliances** - Professional-grade isn't always necessary
4. **Consider alternatives** - Quartz vs. granite, LVP vs. hardwood

## ROI Expectations

Kitchen remodels typically return 60-80% of their cost at resale, making them one of the better investments in home improvement.

The key is matching your renovation level to your neighborhood's market value. Over-improving for your area can limit your return.
    `,
    author: 'FindBuilders Team',
    category: 'Cost Guides',
    published_at: '2026-03-10',
    read_time: 6,
  },
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = samplePosts[slug]
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
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

  // In production, fetch from database
  const post = samplePosts[slug]

  if (!post) {
    notFound()
  }

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
      <main className="flex-1 py-8">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-y py-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {post.read_time} min read
              </span>
              <Button variant="ghost" size="sm" className="ml-auto gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-gray max-w-none dark:prose-invert">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="mt-8 text-2xl font-bold text-foreground">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="mt-6 text-xl font-semibold text-foreground">
                    {paragraph.replace('### ', '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="ml-4 text-muted-foreground">
                    {paragraph.replace('- ', '')}
                  </li>
                )
              }
              if (paragraph.startsWith('**')) {
                return (
                  <p key={index} className="mt-4 font-medium text-foreground">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                )
              }
              if (paragraph.trim()) {
                return (
                  <p key={index} className="mt-4 text-muted-foreground">
                    {paragraph}
                  </p>
                )
              }
              return null
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-lg bg-primary/5 p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              Ready to start your project?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Post your project on FindBuilders and connect with qualified contractors.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/post-job">Post Your Project</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
