import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | FindBuilders',
  description: 'Flexible pricing plans for contractors. Pay per lead or subscribe for unlimited access to leads in your area.',
}

const plans = [
  {
    name: 'Pay Per Lead',
    description: 'Perfect for getting started',
    price: 'From $15',
    priceDetail: 'per lead',
    features: [
      'Browse all available leads',
      'Pay only for leads you purchase',
      'Direct contact with homeowners',
      'Lead details before purchase',
      'No monthly commitment',
    ],
    cta: 'Browse Leads',
    href: '/leads',
    highlighted: false,
  },
  {
    name: 'County Subscription',
    description: 'Best value for active contractors',
    price: '$99',
    priceDetail: 'per county/month',
    features: [
      'Unlimited leads in your county',
      'Exclusive early access to new leads',
      'Priority placement in results',
      'Detailed analytics dashboard',
      'Cancel anytime',
    ],
    cta: 'View Subscriptions',
    href: '/subscriptions',
    highlighted: true,
  },
  {
    name: 'Advertiser',
    description: 'Maximize your visibility',
    price: 'Custom',
    priceDetail: 'contact us',
    features: [
      'Premium ad placements',
      'Targeted geographic reach',
      'Campaign analytics',
      'Dedicated support',
      'Brand awareness',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that works best for your business. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground"> {plan.priceDetail}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Have questions about our pricing?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Our team is here to help you find the right plan for your business.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
