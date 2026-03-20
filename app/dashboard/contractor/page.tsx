import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { formatCents } from '@/lib/types/database'
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  MapPin,
} from 'lucide-react'

export const metadata = {
  title: 'Contractor Dashboard',
  description: 'Manage your leads and grow your business',
}

export default async function ContractorDashboardPage() {
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

  // Verify user is a contractor
  if (profile?.user_type !== 'contractor') {
    redirect('/dashboard/consumer')
  }

  // Fetch purchased leads
  const { data: purchases } = await supabase
    .from('lead_purchases')
    .select(`
      *,
      lead:leads(*, project_type:project_types(*))
    `)
    .eq('contractor_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch pending estimate requests
  const { data: pendingRequests } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads(*, project_type:project_types(*))
    `)
    .eq('contractor_id', user.id)
    .in('status', ['pending', 'consumer_confirmed'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent leads in service area (simplified - just active leads)
  const { data: availableLeads } = await supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate stats
  const totalSpent =
    purchases?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const completedLeads = purchases?.length || 0
  const pendingCount = pendingRequests?.length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="mt-1 text-muted-foreground">
                {profile?.company_name || 'Manage your leads and grow your business'}
              </p>
            </div>
            <Button asChild>
              <Link href="/leads" className="gap-2">
                <Search className="h-4 w-4" />
                Browse Leads
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {completedLeads}
                  </p>
                  <p className="text-sm text-muted-foreground">Purchased Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCents(totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {availableLeads?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Available Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>New Leads</CardTitle>
                  <CardDescription>Recent opportunities in your area</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/leads">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!availableLeads || availableLeads.length === 0 ? (
                  <Empty
                    icon={Search}
                    title="No new leads"
                    description="Check back later for new opportunities"
                  />
                ) : (
                  <div className="space-y-4">
                    {availableLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">
                              {lead.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {lead.lead_type === 'free_estimate'
                                ? 'Free Estimate'
                                : 'Quick Connect'}
                            </Badge>
                          </div>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {lead.city}, {lead.state}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/leads/${lead.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Requests</CardTitle>
                  <CardDescription>Estimate requests awaiting response</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/contractor/requests">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!pendingRequests || pendingRequests.length === 0 ? (
                  <Empty
                    icon={CheckCircle2}
                    title="No pending requests"
                    description="Request estimates from leads to get started"
                  />
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {request.lead?.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {request.lead?.city}, {request.lead?.state}
                            </p>
                            <Badge
                              variant={
                                request.status === 'consumer_confirmed'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {request.status === 'consumer_confirmed'
                                ? 'Approved!'
                                : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            request.status === 'consumer_confirmed'
                              ? 'default'
                              : 'outline'
                          }
                          asChild
                        >
                          <Link href={`/dashboard/contractor/requests/${request.id}`}>
                            {request.status === 'consumer_confirmed'
                              ? 'Confirm'
                              : 'View'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchased Leads */}
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchased Leads</CardTitle>
                <CardDescription>Leads you&apos;ve acquired</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/contractor/leads">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!purchases || purchases.length === 0 ? (
                <Empty
                  icon={FileText}
                  title="No purchased leads yet"
                  description="Browse available leads and start growing your business"
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="rounded-lg border p-4"
                    >
                      <h4 className="font-medium text-foreground">
                        {purchase.lead?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {purchase.lead?.project_type?.name}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {purchase.lead?.city}, {purchase.lead?.state}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/contractor/leads/${purchase.lead?.id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
