import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your projects and contractor connections',
}

export default async function ConsumerDashboardPage() {
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

  // Fetch user's leads
  const { data: leads } = await supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*)
    `)
    .eq('consumer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch pending estimate requests for user's leads
  const { data: estimateRequests } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads!inner(*),
      contractor:profiles(*)
    `)
    .eq('lead.consumer_id', user.id)
    .eq('status', 'pending')
    .limit(5)

  const activeLeads = leads?.filter((l) => l.status === 'active').length || 0
  const pendingRequests = estimateRequests?.length || 0

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
                Manage your projects and contractor requests
              </p>
            </div>
            <Button asChild>
              <Link href="/post-job" className="gap-2">
                <Plus className="h-4 w-4" />
                Post New Project
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {activeLeads}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
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
                    {pendingRequests}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {leads?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Recent job postings</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/consumer/jobs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!leads || leads.length === 0 ? (
                  <Empty
                    icon={FileText}
                    title="No projects yet"
                    description="Post your first project to get started"
                  />
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">
                              {lead.title}
                            </h4>
                            <Badge
                              variant={
                                lead.status === 'active'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {lead.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lead.project_type?.name} • {lead.city}, {lead.state}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/consumer/jobs/${lead.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Estimate Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Estimate Requests</CardTitle>
                  <CardDescription>Contractors waiting for approval</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/consumer/requests">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!estimateRequests || estimateRequests.length === 0 ? (
                  <Empty
                    icon={CheckCircle2}
                    title="No pending requests"
                    description="Requests from contractors will appear here"
                  />
                ) : (
                  <div className="space-y-4">
                    {estimateRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {request.contractor?.company_name || request.contractor?.full_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For: {request.lead?.title}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/consumer/requests/${request.id}`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
