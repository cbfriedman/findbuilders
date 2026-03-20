import { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site-chrome'
import { Button } from '@/components/ui/button'
import { Building2, Target, Heart, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | FindBuilders',
  description: 'Learn about FindBuilders and our mission to connect homeowners with quality contractors.',
}

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We connect homeowners only with verified, professional contractors who deliver quality work.',
  },
  {
    icon: Heart,
    title: 'Customer Focused',
    description: 'Every decision we make is centered around providing the best experience for our users.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'We support local contractors and help them grow their businesses in their communities.',
  },
]

export default function AboutPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              About FindBuilders
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              We&apos;re on a mission to make finding quality contractors simple, 
              transparent, and stress-free for homeowners everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              FindBuilders was founded with a simple idea: homeowners deserve an easier 
              way to find trustworthy contractors, and contractors deserve better access 
              to qualified leads.
            </p>
            <p>
              We&apos;ve all been there &ndash; searching endlessly for a reliable contractor, 
              reading reviews, making calls, and hoping for the best. Meanwhile, great 
              contractors struggle to find new customers in a crowded marketplace.
            </p>
            <p>
              FindBuilders bridges this gap. We&apos;ve built a platform that makes it easy 
              for homeowners to post their projects and receive competitive estimates 
              from verified local contractors. For contractors, we provide a steady 
              stream of qualified leads to help grow their businesses.
            </p>
            <p>
              Today, we&apos;re proud to serve thousands of homeowners and contractors 
              across the country, helping turn home improvement dreams into reality.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">Our Values</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">
            Join the FindBuilders Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you&apos;re a homeowner with a project or a contractor looking for leads, 
            we&apos;re here to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/post-job">Post a Job</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contractors">For Contractors</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    </SiteChrome>
  )
}
