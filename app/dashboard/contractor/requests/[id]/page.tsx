import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import { ArrowLeft, MapPin, DollarSign, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { ConfirmEstimateCheckout } from './confirm-estimate-checkout'

export const metadata = {
  title: 'Confirm Estimate Request',
  description: 'Confirm your estimate appointment and get contact information.',
}

interface ConfirmRequestPageProps {
  params: Promise<{ id: string }>
}

export default async function ConfirmRequestPage({ params }: ConfirmRequestPageProps) {
  const { id } = await params
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

  if (profile?.user_type !== 'contractor') {
    redirect('/dashboard')
  }

  // Get the estimate request
  const { data: request, error } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads!inner(*, project_type:project_types(*))
    `)
    .eq('id', id)
    .eq('contractor_id', user.id)
    .single()

  if (error || !request) {
    notFound()
  }

  const leadPrice = getLeadPrice(request.lead.budget_max)

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Not specified'
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/contractor"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estimate Request</CardTitle>
                  <Badge
                    variant={
                      request.status === 'pending' ? 'secondary' :
                      request.status === 'consumer_confirmed' ? 'default' :
                      request.status === 'both_confirmed' ? 'default' :
                      'destructive'
                    }
                    className={request.status === 'consumer_confirmed' ? 'bg-warning text-warning-foreground' : ''}
                  >
                    {request.status === 'pending' && 'Awaiting Homeowner'}
                    {request.status === 'consumer_confirmed' && 'Approved - Confirm Now'}
                    {request.status === 'both_confirmed' && 'Confirmed'}
                    {request.status === 'declined' && 'Declined'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Lead Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{request.lead.title}</CardTitle>
                <CardDescription>{request.lead.project_type?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{request.lead.description}</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Location</p>
                      <p className="text-sm">{request.lead.city}, {request.lead.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Budget</p>
                      <p className="text-sm">{formatBudget(request.lead.budget_min, request.lead.budget_max)}</p>
                    </div>
                  </div>
                  {request.lead.timeline && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Timeline</p>
                        <p className="text-sm">{request.lead.timeline}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status-specific content */}
            {request.status === 'pending' && (
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="pt-6 text-center">
                  <Clock className="mx-auto h-12 w-12 text-accent" />
                  <h3 className="mt-4 font-semibold text-foreground">Waiting for Homeowner</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your request is pending. You'll be notified when the homeowner responds.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/leads">Browse More Leads</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {request.status === 'consumer_confirmed' && (
              <>
                <Card className="border-success/20 bg-success/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <div>
                        <h3 className="font-semibold text-foreground">Good News!</h3>
                        <p className="text-sm text-muted-foreground">
                          The homeowner has approved your request to provide an estimate.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Confirm & Get Contact Info</CardTitle>
                    <CardDescription>
                      Complete payment to receive the homeowner's contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-medium">Lead Fee</span>
                      <span className="font-bold text-primary">{formatCents(leadPrice)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      After payment, you'll receive the homeowner's name, email, phone number, 
                      and full address to schedule your estimate visit.
                    </p>
                    <ConfirmEstimateCheckout 
                      requestId={id}
                      leadId={request.lead.id}
                      amountCents={leadPrice}
                      leadTitle={request.lead.title}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {request.status === 'both_confirmed' && (
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{request.lead.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${request.lead.contact_email}`} className="font-medium text-primary hover:underline">
                      {request.lead.contact_email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${request.lead.contact_phone}`} className="font-medium text-primary hover:underline">
                      {request.lead.contact_phone}
                    </a>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {request.lead.address}<br />
                      {request.lead.city}, {request.lead.state} {request.lead.zip_code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {request.status === 'declined' && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold text-foreground">Request Declined</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The homeowner declined this estimate request.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/leads">Browse More Leads</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
