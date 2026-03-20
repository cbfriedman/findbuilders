import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import { ArrowLeft, MapPin, DollarSign, Zap } from 'lucide-react'
import { PurchaseCheckout } from './purchase-checkout'

export const metadata = {
  title: 'Purchase Lead',
  description: 'Complete your lead purchase and get instant access to contact information.',
}

export default async function PurchaseLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/leads/${id}/purchase`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.user_type !== 'contractor') {
    redirect(`/auth/sign-up?type=contractor&redirect=/leads/${id}/purchase`)
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*)
    `)
    .eq('id', id)
    .eq('lead_type', 'quick_connect')
    .single()

  if (error || !lead) {
    notFound()
  }

  // Check if already purchased
  const { data: existingPurchase } = await supabase
    .from('lead_purchases')
    .select('*')
    .eq('lead_id', id)
    .eq('contractor_id', user.id)
    .eq('status', 'completed')
    .single()

  if (existingPurchase) {
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
                <Zap className="h-5 w-5 text-accent" />
                <CardTitle>Purchase Lead</CardTitle>
              </div>
              <CardDescription>
                Complete your purchase to get instant access to the homeowner's contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lead Summary */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h3 className="font-semibold text-foreground">{lead.title}</h3>
                <p className="text-sm text-muted-foreground">{lead.project_type?.name}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{lead.city}, {lead.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatBudget(lead.budget_min, lead.budget_max)}</span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Lead Fee</span>
                  <span className="font-bold text-primary">{formatCents(leadPrice)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  You will receive the homeowner's name, email, phone number, and full address
                  immediately after purchase.
                </p>
              </div>

              {/* Checkout Component */}
              <PurchaseCheckout 
                leadId={lead.id} 
                amountCents={leadPrice}
                leadTitle={lead.title}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
