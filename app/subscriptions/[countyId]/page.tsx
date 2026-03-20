import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/types/database'
import {
  ArrowLeft,
  MapPin,
  Users,
  Bell,
  Clock,
  CheckCircle2,
  Shield,
  Zap,
} from 'lucide-react'
import { SubscribeButton } from './subscribe-button'

export async function generateMetadata({ params }: { params: Promise<{ countyId: string }> }) {
  const { countyId } = await params
  const supabase = await createClient()
  
  const { data: county } = await supabase
    .from('counties')
    .select('name, state')
    .eq('id', countyId)
    .single()

  return {
    title: county ? `Subscribe to ${county.name}, ${county.state}` : 'Subscribe to County',
    description: county ? `Get instant lead notifications for ${county.name}, ${county.state}` : 'Subscribe to receive lead notifications',
  }
}

interface CountySubscriptionPageProps {
  params: Promise<{ countyId: string }>
}

export default async function CountySubscriptionPage({ params }: CountySubscriptionPageProps) {
  const { countyId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/subscriptions/${countyId}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'contractor') {
    redirect('/dashboard')
  }

  // Get county details
  const { data: county, error } = await supabase
    .from('counties')
    .select('*')
    .eq('id', countyId)
    .single()

  if (error || !county) {
    notFound()
  }

  // Check for existing subscription
  const { data: existingSubscription } = await supabase
    .from('contractor_subscriptions')
    .select('*')
    .eq('contractor_id', user.id)
    .eq('county_id', countyId)
    .eq('status', 'active')
    .single()

  // Get count of active leads in this county
  const { count: activeLeadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('state', county.state_abbr)
    .eq('status', 'active')

  // Get count of subscribers in this county
  const { count: subscriberCount } = await supabase
    .from('contractor_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('county_id', countyId)
    .eq('status', 'active')

  const benefits = [
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Get email and SMS alerts the moment a new lead is posted',
    },
    {
      icon: Zap,
      title: 'Priority Access',
      description: 'See new leads before non-subscribers',
    },
    {
      icon: Shield,
      title: 'Limited Competition',
      description: 'Only subscribed contractors can request estimates',
    },
    {
      icon: Clock,
      title: 'Cancel Anytime',
      description: 'No long-term contracts, cancel whenever you want',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/subscriptions"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>

          <div className="space-y-6">
            {/* County Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{county.name}</CardTitle>
                    <CardDescription>{county.state}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {county.population?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Population</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <Bell className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {activeLeadsCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Leads</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <Shield className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {subscriberCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Already Subscribed */}
            {existingSubscription && (
              <Card className="border-success/20 bg-success/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <div>
                    <h3 className="font-semibold text-foreground">You're Subscribed!</h3>
                    <p className="text-sm text-muted-foreground">
                      You're already receiving notifications for {county.name}.
                    </p>
                  </div>
                  <Badge className="ml-auto bg-success">Active</Badge>
                </CardContent>
              </Card>
            )}

            {/* Subscription Card */}
            {!existingSubscription && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Subscribe to {county.name}</CardTitle>
                  <CardDescription>
                    Get instant access to leads in this county
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {formatCents(county.subscription_price_cents)}
                    </span>
                    <span className="text-lg text-muted-foreground mb-1">/month</span>
                  </div>

                  <div className="space-y-3">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{benefit.title}</p>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <SubscribeButton
                    countyId={countyId}
                    countyName={county.name}
                    priceCents={county.subscription_price_cents}
                  />

                  <p className="text-center text-xs text-muted-foreground">
                    By subscribing, you agree to our terms of service.
                    Your subscription will renew monthly until cancelled.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits Detail */}
            <Card>
              <CardHeader>
                <CardTitle>What You Get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
