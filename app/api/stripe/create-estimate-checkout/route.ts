import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { getLeadPrice } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, leadId, leadTitle } = await request.json()

    if (!requestId || !leadId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the estimate request belongs to this contractor and is approved
    const { data: estimateRequest, error: requestError } = await supabase
      .from('estimate_requests')
      .select('*, lead:leads(*)')
      .eq('id', requestId)
      .eq('contractor_id', user.id)
      .eq('status', 'consumer_confirmed')
      .single()

    if (requestError || !estimateRequest) {
      return NextResponse.json(
        { error: 'Request not found or not approved' },
        { status: 404 }
      )
    }

    // Get contractor profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name, company_name')
      .eq('id', user.id)
      .single()

    // Server-side price calculation for security
    const leadPrice = getLeadPrice(estimateRequest.lead?.budget_max)

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile?.email || user.email,
        name: profile?.company_name || profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Stripe checkout session
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Estimate Confirmation: ${leadTitle}`,
              description: `Lead in ${estimateRequest.lead?.city}, ${estimateRequest.lead?.state}`,
            },
            unit_amount: leadPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: `${origin}/dashboard/contractor/requests/${requestId}/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        type: 'estimate_confirmation',
        estimate_request_id: requestId,
        lead_id: leadId,
        contractor_id: user.id,
        amount_cents: leadPrice.toString(),
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
