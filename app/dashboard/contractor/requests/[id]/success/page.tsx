import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Confirmation Complete',
  description: 'Your estimate confirmation is complete.',
}

interface SuccessPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function EstimateConfirmSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { id: requestId } = await params
  const { session_id } = await searchParams
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

  // Verify the Stripe session and update records
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      
      if (session.payment_status === 'paid' && session.metadata?.estimate_request_id) {
        // Update the estimate request
        await supabase
          .from('estimate_requests')
          .update({
            contractor_confirmed: true,
            contractor_confirmed_at: new Date().toISOString(),
            status: 'both_confirmed',
          })
          .eq('id', session.metadata.estimate_request_id)

        // Create a purchase record
        const { data: existingPurchase } = await supabase
          .from('lead_purchases')
          .select('id')
          .eq('estimate_request_id', session.metadata.estimate_request_id)
          .single()

        if (!existingPurchase) {
          await supabase
            .from('lead_purchases')
            .insert({
              lead_id: session.metadata.lead_id,
              contractor_id: session.metadata.contractor_id,
              estimate_request_id: session.metadata.estimate_request_id,
              amount_cents: session.amount_total || 0,
              stripe_payment_intent_id: session.payment_intent as string,
              status: 'completed',
            })
        }
      }
    } catch (error) {
      console.error('Error verifying Stripe session:', error)
    }
  }

  // Get the lead details
  const { data: request } = await supabase
    .from('estimate_requests')
    .select('*, lead:leads(*)')
    .eq('id', requestId)
    .single()

  if (!request?.lead) {
    redirect('/dashboard/contractor')
  }

  const lead = request.lead

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="mt-4 text-2xl">Confirmation Complete!</CardTitle>
              <CardDescription>
                You now have access to the homeowner's contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="border-success/20 bg-success/5 text-left">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{lead.contact_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${lead.contact_email}`} className="font-medium text-primary hover:underline">
                        {lead.contact_email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${lead.contact_phone}`} className="font-medium text-primary hover:underline">
                        {lead.contact_phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background mt-0.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project Address</p>
                      <p className="font-medium">
                        {lead.address}<br />
                        {lead.city}, {lead.state} {lead.zip_code}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p>A receipt has been sent to your email.</p>
                <p className="mt-1">This lead is now saved to your dashboard.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/leads/${lead.id}`} className="gap-2">
                    View Full Lead Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/contractor">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
