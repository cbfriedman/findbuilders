import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Plus, BarChart3, Eye, MousePointer, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Advertiser Dashboard | FindBuilders',
  description: 'Manage your advertising campaigns.',
}

export default async function AdvertiserDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'advertiser') {
    redirect('/dashboard')
  }

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('advertiser_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate totals
  const totalImpressions = campaigns?.reduce((acc, c) => acc + (c.impressions || 0), 0) || 0
  const totalClicks = campaigns?.reduce((acc, c) => acc + (c.clicks || 0), 0) || 0
  const totalSpent = campaigns?.reduce((acc, c) => acc + (c.spent || 0), 0) || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      paused: 'secondary',
      completed: 'outline',
      draft: 'outline',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Advertiser Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your advertising campaigns and track performance.
            </p>
          </div>
          <Button asChild>
            <Link href="/advertise/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground">Your Campaigns</h2>
          <div className="mt-4">
            {campaigns && campaigns.length > 0 ? (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>
                            Created {formatDistanceToNow(new Date(campaign.created_at))} ago
                          </CardDescription>
                        </div>
                        {getStatusBadge(campaign.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{campaign.impressions || 0} impressions</span>
                          <span>{campaign.clicks || 0} clicks</span>
                          <span>${(campaign.spent || 0).toFixed(2)} spent</span>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/advertise/campaigns/${campaign.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No campaigns yet
                  </h3>
                  <p className="mt-2 text-center text-muted-foreground">
                    Create your first campaign to start advertising on FindBuilders.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/advertise/create">Create Your First Campaign</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
