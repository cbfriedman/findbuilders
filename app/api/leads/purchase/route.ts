import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { getLeadPrice } from '@/lib/types/database'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a contractor
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'contractor') {
      return NextResponse.json(
        { error: 'Only contractors can purchase leads' },
        { status: 403 }
      )
    }

    const { leadId } = await request.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status !== 'active') {
      return NextResponse.json(
        { error: 'This lead is no longer available' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'You have already purchased this lead' },
        { status: 400 }
      )
    }

    const leadPrice = getLeadPrice(lead.budget_max)

    // Create a pending lead purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('lead_purchases')
      .insert({
        lead_id: leadId,
        contractor_id: user.id,
        amount: leadPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError)
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      )
    }

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Lead: ${lead.title}`,
              description: `${lead.city}, ${lead.state} - Quick Connect Lead`,
            },
            unit_amount: leadPrice,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'lead_purchase',
        lead_id: leadId,
        purchase_id: purchase.id,
        contractor_id: user.id,
      },
      success_url: `${baseUrl}/leads/${leadId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/leads/${leadId}/purchase`,
    })

    // Update purchase with stripe session id
    await supabase
      .from('lead_purchases')
      .update({ stripe_session_id: session.id })
      .eq('id', purchase.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
