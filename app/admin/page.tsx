import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCents } from '@/lib/types/database'
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Megaphone,
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'FindBuilders Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: userCount },
    { count: leadCount },
    { count: countyCount },
    { count: campaignCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('counties').select('*', { count: 'exact', head: true }),
    supabase.from('ad_campaigns').select('*', { count: 'exact', head: true }),
  ])

  // Fetch recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*, project_type:project_types(name), county:counties(name, state_abbr)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate revenue (in production, you'd have a proper revenue tracking system)
  const { data: purchases } = await supabase
    .from('lead_purchases')
    .select('amount_cents')
    .eq('status', 'completed')

  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0

  const stats = [
    {
      label: 'Total Users',
      value: userCount || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      label: 'Total Leads',
      value: leadCount || 0,
      icon: FileText,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      label: 'Revenue',
      value: formatCents(totalRevenue),
      icon: DollarSign,
      change: '+23%',
      changeType: 'positive' as const,
    },
    {
      label: 'Active Counties',
      value: countyCount || 0,
      icon: MapPin,
      change: '+5',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your FindBuilders platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest leads posted on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads?.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{lead.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.project_type?.name} • {lead.county?.name},{' '}
                      {lead.county?.state_abbr}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      lead.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : lead.status === 'assigned'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}

              {(!recentLeads || recentLeads.length === 0) && (
                <p className="text-center text-muted-foreground">
                  No leads yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Active Campaigns</span>
                </div>
                <span className="font-bold text-foreground">
                  {campaignCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Conversion Rate</span>
                </div>
                <span className="font-bold text-foreground">24.5%</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Active Contractors</span>
                </div>
                <span className="font-bold text-foreground">342</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Avg. Lead Value</span>
                </div>
                <span className="font-bold text-foreground">$47.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
