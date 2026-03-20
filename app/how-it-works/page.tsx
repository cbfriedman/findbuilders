import { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site-chrome'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Search, MessageSquare, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works | FindBuilders',
  description: 'Learn how FindBuilders connects homeowners with qualified contractors. Post your job for free and receive estimates from local professionals.',
}

const homeownerSteps = [
  {
    icon: FileText,
    title: 'Post Your Project',
    description: 'Describe your project in detail. Tell us what you need done, your timeline, and budget. It only takes a few minutes.',
  },
  {
    icon: Search,
    title: 'Get Matched',
    description: 'We match your project with qualified local contractors who specialize in your type of work.',
  },
  {
    icon: MessageSquare,
    title: 'Receive Estimates',
    description: 'Contractors will review your project and send you competitive estimates. Compare and ask questions.',
  },
  {
    icon: CheckCircle,
    title: 'Hire with Confidence',
    description: 'Choose the contractor that best fits your needs and budget. Start your project!',
  },
]

const benefits = [
  {
    title: 'Free for Homeowners',
    description: 'Posting your project and receiving estimates is completely free. No hidden fees or obligations.',
  },
  {
    title: 'Verified Contractors',
    description: 'All contractors on our platform are verified professionals with real experience.',
  },
  {
    title: 'Local Professionals',
    description: 'Get connected with contractors who work in your area and know local building codes.',
  },
  {
    title: 'No Obligation',
    description: 'Review estimates at your own pace. You\'re never obligated to hire anyone.',
  },
]

export default function HowItWorksPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              How FindBuilders Works
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Getting estimates for your home project has never been easier. 
              Post your job for free and connect with qualified local contractors.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Four Simple Steps
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {homeownerSteps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute left-1/2 top-8 -z-10 hidden h-0.5 w-full bg-primary/20 lg:block" 
                     style={{ display: index === homeownerSteps.length - 1 ? 'none' : undefined }} />
                <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Why Choose FindBuilders?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Post your job for free and start receiving estimates from qualified contractors today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/post-job">Post Your Job Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/faq">View FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    </SiteChrome>
  )
}
