import { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site-chrome'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Users, TrendingUp, Shield, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Contractors | FindBuilders',
  description: 'Grow your contracting business with qualified leads. Connect with homeowners actively looking for your services.',
}

const benefits = [
  {
    icon: Users,
    title: 'Qualified Leads',
    description: 'Every lead is verified and actively seeking contractor services. No tire-kickers.',
  },
  {
    icon: MapPin,
    title: 'Local Focus',
    description: 'Get leads specific to your service area. Build your reputation in your community.',
  },
  {
    icon: DollarSign,
    title: 'Flexible Pricing',
    description: 'Pay per lead or subscribe for unlimited access. Choose what works for your business.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Access a steady stream of projects to keep your team busy year-round.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Stop chasing leads. We bring qualified homeowners directly to you.',
  },
  {
    icon: Shield,
    title: 'Build Trust',
    description: 'Our platform helps establish credibility with potential customers.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your services, experience, and service area.',
  },
  {
    number: '2',
    title: 'Browse Available Leads',
    description: 'View detailed job requests from homeowners in your area.',
  },
  {
    number: '3',
    title: 'Connect & Close',
    description: 'Purchase leads that match your expertise and contact homeowners directly.',
  },
]

export default function ContractorsPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Grow Your Contracting Business
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Connect with homeowners actively seeking your services. Get qualified leads, 
              win more projects, and build your reputation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Why Contractors Choose Us</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to find and win more projects
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="pt-6">
                  <benefit.icon className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Start getting leads in three simple steps
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Grow Your Business?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of contractors who are winning more projects with FindBuilders.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/leads">Browse Leads</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    </SiteChrome>
  )
}
