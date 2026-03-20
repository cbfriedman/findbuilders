'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function createCountySubscription(countyId: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Check if user is a contractor
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'contractor') {
    return { error: 'Only contractors can subscribe to counties' }
  }

  // Get the county
  const { data: county } = await supabase
    .from('counties')
    .select('*')
    .eq('id', countyId)
    .single()

  if (!county) {
    return { error: 'County not found' }
  }

  // Check for existing subscription
  const { data: existingSubscription } = await supabase
    .from('county_subscriptions')
    .select('id')
    .eq('county_id', countyId)
    .eq('contractor_id', user.id)
    .in('status', ['active', 'past_due'])
    .single()

  if (existingSubscription) {
    return { error: 'You already have an active subscription to this county' }
  }

  // Get or create Stripe customer
  let customerId = profile.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.company_name || profile.full_name || undefined,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Save customer ID to profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create a Stripe product for this county if not exists
  const productId = `county_${county.id}`
  let product
  try {
    product = await stripe.products.retrieve(productId)
  } catch {
    product = await stripe.products.create({
      id: productId,
      name: `County Subscription: ${county.name}, ${county.state_abbr}`,
      description: `Unlimited lead access in ${county.name} County, ${county.state}`,
    })
  }

  // Create or get price
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    recurring: { interval: 'month' },
  })

  let price = prices.data.find(
    (p) => p.unit_amount === county.subscription_price_cents
  )

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: county.subscription_price_cents,
      currency: 'usd',
      recurring: { interval: 'month' },
    })
  }

  // Create checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/subscriptions?success=true&county=${county.name}`,
      cancel_url: `${origin}/subscriptions?canceled=true`,
      metadata: {
        type: 'county_subscription',
        county_id: countyId,
        contractor_id: user.id,
      },
      subscription_data: {
        metadata: {
          county_id: countyId,
          contractor_id: user.id,
        },
      },
    })

    return { checkoutUrl: session.url }
  } catch (err) {
    console.error('Stripe error:', err)
    return { error: 'Failed to create checkout session' }
  }
}

export async function cancelCountySubscription(subscriptionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('county_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('contractor_id', user.id)
    .single()

  if (!subscription) {
    return { error: 'Subscription not found' }
  }

  if (!subscription.stripe_subscription_id) {
    return { error: 'No Stripe subscription found' }
  }

  try {
    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    return { success: true }
  } catch (err) {
    console.error('Stripe error:', err)
    return { error: 'Failed to cancel subscription' }
  }
}

export async function getSubscriptionPortalUrl() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: 'No billing account found' }
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/subscriptions`,
    })

    return { url: session.url }
  } catch (err) {
    console.error('Stripe error:', err)
    return { error: 'Failed to open billing portal' }
  }
}
