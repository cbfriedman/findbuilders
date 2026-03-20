import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, amountCents, leadTitle } = await request.json()

    if (!leadId || !amountCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the lead exists and is purchasable
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('status', 'active')
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or not available' }, { status: 404 })
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('lead_purchases')
      .select('id')
      .eq('lead_id', leadId)
      .eq('contractor_id', user.id)
      .eq('status', 'completed')
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: 'Lead already purchased' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name, company_name')
      .eq('id', user.id)
      .single()

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

    // Create a pending purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('lead_purchases')
      .insert({
        lead_id: leadId,
        contractor_id: user.id,
        amount_cents: amountCents,
        status: 'pending',
      })
      .select()
      .single()

    if (purchaseError) {
      return NextResponse.json({ error: 'Failed to create purchase record' }, { status: 500 })
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
              name: `Lead: ${leadTitle}`,
              description: `Construction lead in ${lead.city}, ${lead.state}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: `${origin}/leads/${leadId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        lead_id: leadId,
        purchase_id: purchase.id,
        contractor_id: user.id,
        type: 'lead_purchase',
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
