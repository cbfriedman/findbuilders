import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/types/database'
import { CampaignActions } from '@/components/advertise/campaign-actions'
import {
  ArrowLeft,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  FlaskConical,
  ExternalLink,
} from 'lucide-react'

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch campaign with variants
  const { data: campaign, error } = await supabase
    .from('ad_campaigns')
    .select(`
      *,
      variants:ad_variants(*)
    `)
    .eq('id', id)
    .eq('advertiser_id', user.id)
    .single()

  if (error || !campaign) {
    notFound()
  }

  // Calculate totals from variants or use placeholder
  const totalImpressions = campaign.variants?.reduce(
    (sum: number, v: { impressions: number }) => sum + (v.impressions || 0),
    0
  ) || 0
  const totalClicks = campaign.variants?.reduce(
    (sum: number, v: { clicks: number }) => sum + (v.clicks || 0),
    0
  ) || 0
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const totalSpent = totalClicks * (campaign.cpc_cents || 0)

  const statusColors = {
    draft: 'bg-secondary text-secondary-foreground',
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-secondary text-secondary-foreground',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/advertise"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Advertising
          </Link>

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {campaign.name}
                </h1>
                <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                {campaign.ad_type.replace('_', ' ')} • Created{' '}
                {new Date(campaign.created_at).toLocaleDateString()}
              </p>
            </div>
            <CampaignActions campaignId={id} status={campaign.status} />
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalImpressions.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <MousePointer className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalClicks.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {ctr.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">CTR</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCents(totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Campaign Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Click URL</p>
                    <a
                      href={campaign.click_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {campaign.click_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Per Click</p>
                    <p className="font-medium">{formatCents(campaign.cpc_cents || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <p className="font-medium">
                      {formatCents(campaign.monthly_budget_cents || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Remaining</p>
                    <p className="font-medium">
                      {formatCents(
                        (campaign.monthly_budget_cents || 0) - totalSpent
                      )}
                    </p>
                  </div>
                </div>

                {/* Targeting */}
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium text-foreground">Targeting</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.target_states?.length > 0 ? (
                      campaign.target_states.map((state: string) => (
                        <Badge key={state} variant="secondary">
                          {state}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        All states
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Ad Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-card p-4">
                  <p className="font-semibold text-foreground">
                    {campaign.headline || 'Your headline here'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {campaign.description || 'Your ad description'}
                  </p>
                  <Button size="sm" className="mt-4 w-full">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* A/B Test Results */}
          {campaign.variants && campaign.variants.length > 1 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  A/B Test Results
                </CardTitle>
                <CardDescription>
                  Compare performance across ad variations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                          Variant
                        </th>
                        <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                          Headline
                        </th>
                        <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground text-right">
                          Impressions
                        </th>
                        <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground text-right">
                          Clicks
                        </th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">
                          CTR
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaign.variants.map((variant: {
                        id: string
                        variant_name: string
                        headline: string
                        impressions: number
                        clicks: number
                        is_control: boolean
                      }) => {
                        const variantCtr =
                          variant.impressions > 0
                            ? (variant.clicks / variant.impressions) * 100
                            : 0
                        return (
                          <tr key={variant.id} className="border-b last:border-0">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {variant.variant_name}
                                </span>
                                {variant.is_control && (
                                  <Badge variant="outline" className="text-xs">
                                    Control
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                              {variant.headline}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {variant.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {variant.clicks.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-medium">
                              {variantCtr.toFixed(2)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
