import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/types/database'
import {
  Building2,
  Package,
  Megaphone,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MousePointer,
  Eye,
} from 'lucide-react'

export const metadata = {
  title: 'Advertise on FindBuilders',
  description: 'Reach homeowners and contractors with targeted advertising',
}

const adTypes = [
  {
    id: 'contractor_statewide',
    icon: Building2,
    title: 'Contractor Statewide Ads',
    description: 'Feature your contracting business across an entire state',
    price: 'From $199/month',
    features: [
      'Premium placement on lead pages',
      'Show in specific states',
      'Target by project type',
      'A/B test multiple variations',
      'Detailed click analytics',
    ],
    cta: 'Create Campaign',
    href: '/advertise/create?type=contractor_statewide',
    popular: true,
  },
  {
    id: 'vendor_tile',
    icon: Package,
    title: 'Vendor Tile Ads',
    description: 'Promote your products to contractors browsing leads',
    price: 'From $99/month',
    features: [
      'Tile-style display ads',
      'Link to your product pages',
      'Target by state or project type',
      'Track impressions and clicks',
      'Self-service management',
    ],
    cta: 'Create Tile Ad',
    href: '/advertise/create?type=vendor_tile',
  },
  {
    id: 'vendor_banner',
    icon: Megaphone,
    title: 'Vendor Banner Ads',
    description: 'High-visibility banners for maximum brand exposure',
    price: 'From $299/month',
    features: [
      'Large banner placements',
      'Homepage and search visibility',
      'Custom creative uploads',
      'Priority positioning',
      'Dedicated account support',
    ],
    cta: 'Create Banner Ad',
    href: '/advertise/create?type=vendor_banner',
  },
]

export default async function AdvertisePage() {
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

  // Fetch user's campaigns if logged in
  let campaigns = null
  if (user) {
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('advertiser_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    campaigns = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Reach Your Target Audience with{' '}
                <span className="text-primary">FindBuilders Ads</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground">
                Connect with homeowners seeking contractors or contractors looking
                for supplies. Our targeted advertising puts your business in front
                of the right people.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Eye className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-4 text-3xl font-bold text-foreground">2M+</p>
                  <p className="text-muted-foreground">Monthly Impressions</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <MousePointer className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-4 text-3xl font-bold text-foreground">3.2%</p>
                  <p className="text-muted-foreground">Average CTR</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-4 text-3xl font-bold text-foreground">5x</p>
                  <p className="text-muted-foreground">Avg. ROI</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Ad Types */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Choose Your Ad Format
              </h2>
              <p className="mt-4 text-muted-foreground">
                Select the advertising option that best fits your goals
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {adTypes.map((adType) => (
                <Card
                  key={adType.id}
                  className={`relative ${
                    adType.popular
                      ? 'border-2 border-primary shadow-lg'
                      : ''
                  }`}
                >
                  {adType.popular && (
                    <Badge
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      variant="default"
                    >
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <adType.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4">{adType.title}</CardTitle>
                    <CardDescription>{adType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {adType.price}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {adType.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-8 w-full gap-2" asChild>
                      <Link href={adType.href}>
                        {adType.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Existing Campaigns */}
        {campaigns && campaigns.length > 0 && (
          <section className="bg-secondary/30 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Campaigns
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    Manage your active advertising campaigns
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/advertise/campaigns">View All</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.ad_type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            campaign.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/advertise/campaigns/${campaign.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
