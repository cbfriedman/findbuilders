export type UserType = 'consumer' | 'contractor' | 'admin'

export type LeadType = 'free_estimate' | 'quick_connect'

export type LeadStatus = 'active' | 'paused' | 'completed' | 'expired'

export type EstimateRequestStatus = 'pending' | 'consumer_confirmed' | 'both_confirmed' | 'declined' | 'expired'

export type LeadPurchaseStatus = 'pending' | 'completed' | 'refunded' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: UserType
  company_name: string | null
  company_description: string | null
  license_number: string | null
  years_in_business: number | null
  service_areas: string[] | null
  avatar_url: string | null
  is_verified: boolean
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface ProjectType {
  id: string
  name: string
  slug: string
  lead_price_cents: number
  created_at: string
}

export interface Lead {
  id: string
  consumer_id: string
  project_type_id: string
  lead_type: LeadType
  title: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  county: string | null
  latitude: number | null
  longitude: number | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  contact_name: string
  contact_email: string
  contact_phone: string
  status: LeadStatus
  created_at: string
  updated_at: string
  expires_at: string
  // Relations
  project_type?: ProjectType
  photos?: LeadPhoto[]
  estimate_requests?: EstimateRequest[]
}

export interface LeadPhoto {
  id: string
  lead_id: string
  url: string
  pathname: string
  created_at: string
}

export interface EstimateRequest {
  id: string
  lead_id: string
  contractor_id: string
  consumer_confirmed: boolean
  contractor_confirmed: boolean
  consumer_confirmed_at: string | null
  contractor_confirmed_at: string | null
  status: EstimateRequestStatus
  created_at: string
  // Relations
  lead?: Lead
  contractor?: Profile
}

export interface LeadPurchase {
  id: string
  lead_id: string
  contractor_id: string
  estimate_request_id: string | null
  amount_cents: number
  stripe_payment_intent_id: string | null
  status: LeadPurchaseStatus
  created_at: string
  // Relations
  lead?: Lead
}

// Lead pricing based on budget
export const LEAD_PRICING = {
  UNDER_25K: 3500, // $35
  BETWEEN_25K_100K: 5000, // $50
  BETWEEN_100K_500K: 7500, // $75
  OVER_500K: 10000, // $100
} as const

export function getLeadPrice(budgetMax: number | null): number {
  if (!budgetMax || budgetMax < 25000) return LEAD_PRICING.UNDER_25K
  if (budgetMax < 100000) return LEAD_PRICING.BETWEEN_25K_100K
  if (budgetMax < 500000) return LEAD_PRICING.BETWEEN_100K_500K
  return LEAD_PRICING.OVER_500K
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not specified'
  if (min && max) return `${formatCents(min * 100)} - ${formatCents(max * 100)}`
  if (min) return `From ${formatCents(min * 100)}`
  if (max) return `Up to ${formatCents(max * 100)}`
  return 'Not specified'
}
