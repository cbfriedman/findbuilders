import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Purchase Complete',
  description: 'Your lead purchase was successful.',
}

interface PurchaseSuccessPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function PurchaseSuccessPage({ params, searchParams }: PurchaseSuccessPageProps) {
  const { id } = await params
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

  // Verify the Stripe session
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      
      if (session.payment_status === 'paid' && session.metadata?.purchase_id) {
        // Update the purchase record
        await supabase
          .from('lead_purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', session.metadata.purchase_id)
      }
    } catch (error) {
      console.error('Error verifying Stripe session:', error)
    }
  }

  // Get the lead details
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) {
    redirect('/leads')
  }

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
              <CardTitle className="mt-4 text-2xl">Purchase Complete!</CardTitle>
              <CardDescription>
                You now have access to the homeowner's contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-4 text-left">
                <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {lead.contact_name}</p>
                  <p><strong>Email:</strong> <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline">{lead.contact_email}</a></p>
                  <p><strong>Phone:</strong> <a href={`tel:${lead.contact_phone}`} className="text-primary hover:underline">{lead.contact_phone}</a></p>
                  <p className="pt-2"><strong>Address:</strong><br />{lead.address}<br />{lead.city}, {lead.state} {lead.zip_code}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>A receipt has been sent to your email.</p>
                <p className="mt-1">This lead is now saved to your dashboard.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/leads/${id}`} className="gap-2">
                    View Full Lead Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/contractor/leads">
                    Go to My Leads
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
