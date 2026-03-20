import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import { RequestEstimateForm } from '@/components/leads/request-estimate-form'
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  MapPin,
  DollarSign,
} from 'lucide-react'

interface RequestEstimatePageProps {
  params: Promise<{ id: string }>
}

export default async function RequestEstimatePage({ params }: RequestEstimatePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/leads/${id}/request-estimate`)
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

  // Fetch lead
  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*)
    `)
    .eq('id', id)
    .single()

  if (error || !lead) {
    notFound()
  }

  // Must be a free estimate lead
  if (lead.lead_type !== 'free_estimate') {
    redirect(`/leads/${id}/purchase`)
  }

  // Check if already requested
  const { data: existingRequest } = await supabase
    .from('estimate_requests')
    .select('*')
    .eq('lead_id', id)
    .eq('contractor_id', user.id)
    .single()

  if (existingRequest) {
    redirect(`/leads/${id}`)
  }

  const leadPrice = getLeadPrice(lead.budget_max)

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
                <Shield className="h-6 w-6 text-primary" />
                <Badge variant="secondary">Free Estimate</Badge>
              </div>
              <CardTitle className="mt-2">Request to Provide an Estimate</CardTitle>
              <CardDescription>
                Submit your request to the homeowner. You&apos;ll only be charged if both parties confirm the appointment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lead Summary */}
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-foreground">{lead.title}</h3>
                <p className="text-sm text-muted-foreground">{lead.project_type?.name}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead.city}, {lead.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatBudget(lead.budget_min, lead.budget_max)}
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">How Free Estimate Works</h4>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 1:</strong> Submit your request to provide an estimate
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 2:</strong> Homeowner reviews your profile and approves
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 3:</strong> You confirm the appointment
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 4:</strong> Lead fee ({formatCents(leadPrice)}) is charged and contact info is revealed
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lead Fee (charged after confirmation)</span>
                  <span className="text-xl font-bold text-primary">{formatCents(leadPrice)}</span>
                </div>
              </div>

              <RequestEstimateForm leadId={id} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
