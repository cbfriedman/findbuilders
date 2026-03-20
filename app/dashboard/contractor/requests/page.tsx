import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  DollarSign,
} from 'lucide-react'

export const metadata = {
  title: 'My Estimate Requests',
  description: 'View and manage your estimate requests',
}

export default async function ContractorRequestsPage() {
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

  if (profile?.user_type !== 'contractor') {
    redirect('/dashboard/consumer')
  }

  // Fetch all estimate requests
  const { data: requests } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads(*, project_type:project_types(*))
    `)
    .eq('contractor_id', user.id)
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
            href="/dashboard/contractor"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Estimate Requests</h1>
            <p className="mt-2 text-muted-foreground">
              Track your free estimate requests and confirmations
            </p>
          </div>

          {/* Approved - Action Required */}
          {approvedRequests.length > 0 && (
            <Card className="mb-8 border-2 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Approved - Action Required</CardTitle>
                </div>
                <CardDescription>
                  These homeowners have approved your request! Confirm to get their contact info.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedRequests.map((request) => {
                    const leadPrice = getLeadPrice(request.lead?.budget_max)
                    return (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 p-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {request.lead?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {request.lead?.project_type?.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.lead?.city}, {request.lead?.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCents(leadPrice)} lead fee
                            </span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/dashboard/contractor/requests/${request.id}`}>
                            Confirm & Pay
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Approval */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <CardTitle>Pending Approval</CardTitle>
              </div>
              <CardDescription>
                Waiting for homeowners to review your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <Empty
                  icon={Clock}
                  title="No pending requests"
                  description="Your estimate requests will appear here"
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
                        <p className="text-sm text-muted-foreground">
                          {request.lead?.city}, {request.lead?.state}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested {getTimeAgo(request.created_at)}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed */}
          {completedRequests.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Confirmed</CardTitle>
                </div>
                <CardDescription>
                  Connections confirmed - you can contact these homeowners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 p-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {request.lead?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.lead?.city}, {request.lead?.state}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/leads/${request.lead_id}`}>
                          View Details
                        </Link>
                      </Button>
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
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {request.lead?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.lead?.city}, {request.lead?.state}
                        </p>
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
