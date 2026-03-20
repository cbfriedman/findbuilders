import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { ArrowLeft, User, Building2, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = {
  title: 'Estimate Requests',
  description: 'Review and manage contractor estimate requests',
}

export default async function ConsumerRequestsPage() {
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

  // Fetch all estimate requests for user's leads
  const { data: requests } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads!inner(*, project_type:project_types(*)),
      contractor:profiles(*)
    `)
    .eq('lead.consumer_id', user.id)
    .order('created_at', { ascending: false })

  const pendingRequests = requests?.filter((r) => r.status === 'pending') || []
  const approvedRequests = requests?.filter((r) => r.status === 'consumer_confirmed') || []
  const completedRequests = requests?.filter((r) => r.status === 'both_confirmed') || []
  const declinedRequests = requests?.filter((r) => r.status === 'declined') || []

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/consumer"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Estimate Requests</h1>
            <p className="mt-2 text-muted-foreground">
              Review contractors who want to provide estimates for your projects
            </p>
          </div>

          {/* Pending Requests */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <CardTitle>Pending Approval</CardTitle>
              </div>
              <CardDescription>
                These contractors are waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <Empty
                  icon={Clock}
                  title="No pending requests"
                  description="When contractors request to give you an estimate, they'll appear here"
                />
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          {request.contractor?.company_name ? (
                            <Building2 className="h-6 w-6 text-primary" />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {request.contractor?.company_name || request.contractor?.full_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For: {request.lead?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested {getTimeAgo(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button asChild>
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

          {/* Approved - Waiting for Contractor */}
          {approvedRequests.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <CardTitle>Approved - Awaiting Contractor</CardTitle>
                </div>
                <CardDescription>
                  You&apos;ve approved these contractors - waiting for them to confirm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {request.contractor?.company_name || request.contractor?.full_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For: {request.lead?.title}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            Waiting for contractor to confirm
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed */}
          {completedRequests.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Confirmed</CardTitle>
                </div>
                <CardDescription>
                  Both parties have confirmed - contractors can now contact you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {request.contractor?.company_name || request.contractor?.full_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For: {request.lead?.title}
                          </p>
                          {request.contractor?.phone && (
                            <p className="text-sm text-green-700">
                              Phone: {request.contractor.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Confirmed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Declined */}
          {declinedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Declined</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {declinedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border p-4 opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {request.contractor?.company_name || request.contractor?.full_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For: {request.lead?.title}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Declined</Badge>
                    </div>
                  ))}
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
