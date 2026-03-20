'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { getLeadPrice } from '@/lib/types/database'
import { headers } from 'next/headers'

export async function requestEstimate(leadId: string, message?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to request an estimate' }
  }

  // Check if user is a contractor
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'contractor') {
    return { error: 'Only contractors can request estimates' }
  }

  // Check if lead exists and is a free_estimate type
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('status', 'active')
    .single()

  if (!lead) {
    return { error: 'Lead not found or no longer active' }
  }

  if (lead.lead_type !== 'free_estimate') {
    return { error: 'This lead type does not support estimate requests' }
  }

  // Check for existing request
  const { data: existingRequest } = await supabase
    .from('estimate_requests')
    .select('id')
    .eq('lead_id', leadId)
    .eq('contractor_id', user.id)
    .single()

  if (existingRequest) {
    return { error: 'You have already requested an estimate for this lead' }
  }

  // Create estimate request
  const { data: request, error } = await supabase
    .from('estimate_requests')
    .insert({
      lead_id: leadId,
      contractor_id: user.id,
      status: 'pending',
      consumer_confirmed: false,
      contractor_confirmed: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating estimate request:', error)
    return { error: 'Failed to create estimate request' }
  }

  return { success: true, requestId: request.id }
}

export async function confirmEstimateAsContractor(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get the request
  const { data: request } = await supabase
    .from('estimate_requests')
    .select('*, lead:leads(*)')
    .eq('id', requestId)
    .eq('contractor_id', user.id)
    .single()

  if (!request) {
    return { error: 'Request not found' }
  }

  if (request.status !== 'consumer_confirmed') {
    return { error: 'Consumer has not yet approved this request' }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('estimate_requests')
    .update({
      contractor_confirmed: true,
      contractor_confirmed_at: new Date().toISOString(),
      status: 'both_confirmed',
    })
    .eq('id', requestId)

  if (updateError) {
    return { error: 'Failed to confirm request' }
  }

  return { success: true, leadId: request.lead_id }
}

export async function confirmEstimateAsConsumer(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get the request with lead
  const { data: request } = await supabase
    .from('estimate_requests')
    .select('*, lead:leads(*)')
    .eq('id', requestId)
    .single()

  if (!request) {
    return { error: 'Request not found' }
  }

  // Verify user owns the lead
  if (request.lead?.consumer_id !== user.id) {
    return { error: 'You do not have permission to confirm this request' }
  }

  if (request.status !== 'pending') {
    return { error: 'This request has already been processed' }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('estimate_requests')
    .update({
      consumer_confirmed: true,
      consumer_confirmed_at: new Date().toISOString(),
      status: 'consumer_confirmed',
    })
    .eq('id', requestId)

  if (updateError) {
    return { error: 'Failed to confirm request' }
  }

  return { success: true }
}

export async function declineEstimateRequest(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Get the request with lead
  const { data: request } = await supabase
    .from('estimate_requests')
    .select('*, lead:leads(*)')
    .eq('id', requestId)
    .single()

  if (!request) {
    return { error: 'Request not found' }
  }

  // Verify user owns the lead
  if (request.lead?.consumer_id !== user.id) {
    return { error: 'You do not have permission to decline this request' }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('estimate_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)

  if (updateError) {
    return { error: 'Failed to decline request' }
  }

  return { success: true }
}

export async function startLeadPurchaseSession(leadId: string) {
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
    return { error: 'Only contractors can purchase leads' }
  }

  // Get the lead
  const { data: lead } = await supabase
    .from('leads')
    .select('*, project_type:project_types(*)')
    .eq('id', leadId)
    .eq('status', 'active')
    .single()

  if (!lead) {
    return { error: 'Lead not found or no longer active' }
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
    return { error: 'You have already purchased this lead' }
  }

  const leadPrice = getLeadPrice(lead.budget_max)

  // Create pending purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('lead_purchases')
    .insert({
      lead_id: leadId,
      contractor_id: user.id,
      amount_cents: leadPrice,
      status: 'pending',
    })
    .select()
    .single()

  if (purchaseError) {
    console.error('Error creating purchase record:', purchaseError)
    return { error: 'Failed to initiate purchase' }
  }

  // Create Stripe checkout session
  try {
    const session = await getStripe().checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Lead: ${lead.title}`,
              description: `${lead.project_type?.name} in ${lead.city}, ${lead.state}`,
            },
            unit_amount: leadPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        type: 'lead_purchase',
        lead_id: leadId,
        purchase_id: purchase.id,
        contractor_id: user.id,
      },
      customer_email: profile.email,
    })

    // Update purchase with payment intent
    if (session.payment_intent) {
      await supabase
        .from('lead_purchases')
        .update({ stripe_payment_intent_id: session.payment_intent as string })
        .eq('id', purchase.id)
    }

    return { clientSecret: session.client_secret }
  } catch (err) {
    console.error('Stripe error:', err)
    // Clean up failed purchase
    await supabase.from('lead_purchases').delete().eq('id', purchase.id)
    return { error: 'Failed to create payment session' }
  }
}

export async function createLead(formData: {
  projectTypeId: string
  leadType: 'free_estimate' | 'quick_connect'
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  budgetMin?: number
  budgetMax?: number
  timeline?: string
  contactName: string
  contactEmail: string
  contactPhone: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to post a job' }
  }

  // Calculate expiration (30 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      consumer_id: user.id,
      project_type_id: formData.projectTypeId,
      lead_type: formData.leadType,
      title: formData.title,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      budget_min: formData.budgetMin || null,
      budget_max: formData.budgetMax || null,
      timeline: formData.timeline || null,
      contact_name: formData.contactName,
      contact_email: formData.contactEmail,
      contact_phone: formData.contactPhone,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating lead:', error)
    return { error: 'Failed to create job posting' }
  }

  return { success: true, leadId: lead.id }
}
