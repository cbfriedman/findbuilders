import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('user_type, full_name, company_name')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'contractor') {
      return NextResponse.json(
        { error: 'Only contractors can request estimates' },
        { status: 403 }
      )
    }

    const { leadId, message } = await request.json()

    if (!leadId || !message) {
      return NextResponse.json(
        { error: 'Lead ID and message are required' },
        { status: 400 }
      )
    }

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('lead_type', 'free_estimate')
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found or is not a free estimate lead' },
        { status: 404 }
      )
    }

    if (lead.status !== 'active') {
      return NextResponse.json(
        { error: 'This lead is no longer available' },
        { status: 400 }
      )
    }

    // Check if already requested
    const { data: existingRequest } = await supabase
      .from('estimate_requests')
      .select('id')
      .eq('lead_id', leadId)
      .eq('contractor_id', user.id)
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested this estimate' },
        { status: 400 }
      )
    }

    // Create estimate request
    const { data: estimateRequest, error: requestError } = await supabase
      .from('estimate_requests')
      .insert({
        lead_id: leadId,
        contractor_id: user.id,
        consumer_id: lead.consumer_id,
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating estimate request:', requestError)
      return NextResponse.json(
        { error: 'Failed to create estimate request' },
        { status: 500 }
      )
    }

    // TODO: Send notification email to consumer about new estimate request

    return NextResponse.json({ 
      success: true, 
      requestId: estimateRequest.id 
    })
  } catch (error) {
    console.error('Error submitting estimate request:', error)
    return NextResponse.json(
      { error: 'Failed to submit estimate request' },
      { status: 500 }
    )
  }
}
