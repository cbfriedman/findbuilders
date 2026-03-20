import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import { ConfirmEstimateCheckout } from '@/components/leads/confirm-estimate-checkout'
import {
  ArrowLeft,
  Shield,
  MapPin,
  DollarSign,
  CheckCircle2,
  User,
} from 'lucide-react'

interface ConfirmEstimatePageProps {
  params: Promise<{ id: string }>
}

export default async function ConfirmEstimatePage({ params }: ConfirmEstimatePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/leads/${id}/confirm-estimate`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Must be a contractor
  if (profile?.user_type !== 'contractor') {
    redirect(`/leads/${id}`)
  }

  // Get the estimate request
  const { data: request, error: requestError } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads(*, project_type:project_types(*))
    `)
    .eq('lead_id', id)
    .eq('contractor_id', user.id)
    .single()

  if (requestError || !request) {
    redirect(`/leads/${id}`)
  }

  // Must be consumer_confirmed status
  if (request.status !== 'consumer_confirmed') {
    redirect(`/leads/${id}`)
  }

  const lead = request.lead
  const leadPrice = getLeadPrice(lead?.budget_max)

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
            href={`/leads/${id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to lead
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-500" />
                <Badge variant="default" className="bg-green-600">
                  Approved!
                </Badge>
              </div>
              <CardTitle className="mt-2">Confirm Your Appointment</CardTitle>
              <CardDescription>
                The homeowner has approved your request! Confirm and pay to get their contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Message */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">
                      You&apos;ve been approved!
                    </h4>
                    <p className="mt-1 text-sm text-green-700">
                      The homeowner reviewed your profile and selected you to provide an estimate.
                      Complete the payment to get their contact details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lead Summary */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-foreground">{lead?.title}</h3>
                <p className="text-sm text-muted-foreground">{lead?.project_type?.name}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead?.city}, {lead?.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatBudget(lead?.budget_min, lead?.budget_max)}
                  </div>
                </div>
              </div>

              {/* What you'll get */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">What You&apos;ll Receive</h4>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Homeowner&apos;s full name and contact phone number
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Direct email address for follow-up
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Complete project address for the estimate visit
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lead Fee</span>
                  <span className="text-2xl font-bold text-primary">{formatCents(leadPrice)}</span>
                </div>
              </div>

              <ConfirmEstimateCheckout 
                requestId={request.id}
                leadId={id}
                leadTitle={lead?.title || ''}
                leadPrice={leadPrice}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
