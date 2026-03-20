import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.type === 'lead_purchase' && session.metadata?.purchase_id) {
          // Update the purchase record
          await supabaseAdmin
            .from('lead_purchases')
            .update({
              status: 'completed',
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', session.metadata.purchase_id)
        }

        if (session.metadata?.type === 'estimate_confirmation' && session.metadata?.estimate_request_id) {
          // Update the estimate request
          await supabaseAdmin
            .from('estimate_requests')
            .update({
              contractor_confirmed: true,
              contractor_confirmed_at: new Date().toISOString(),
              status: 'both_confirmed',
            })
            .eq('id', session.metadata.estimate_request_id)

          // Create a purchase record
          await supabaseAdmin
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

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // Could update purchase status to failed here
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        // Find and update the purchase
        const { data: purchase } = await supabaseAdmin
          .from('lead_purchases')
          .select('id')
          .eq('stripe_payment_intent_id', charge.payment_intent)
          .single()

        if (purchase) {
          await supabaseAdmin
            .from('lead_purchases')
            .update({ status: 'refunded' })
            .eq('id', purchase.id)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const countyId = subscription.metadata.county_id
        const contractorId = subscription.metadata.contractor_id

        if (countyId && contractorId) {
          // Check if subscription record exists
          const { data: existing } = await supabaseAdmin
            .from('county_subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          const subscriptionData = {
            county_id: countyId,
            contractor_id: contractorId,
            stripe_subscription_id: subscription.id,
            status: subscription.status === 'active' ? 'active' : 
                   subscription.status === 'past_due' ? 'past_due' : 
                   subscription.status === 'canceled' ? 'canceled' : 'paused',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }

          if (existing) {
            await supabaseAdmin
              .from('county_subscriptions')
              .update(subscriptionData)
              .eq('id', existing.id)
          } else {
            await supabaseAdmin
              .from('county_subscriptions')
              .insert(subscriptionData)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('county_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
