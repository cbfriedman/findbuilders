export type UserType = 'consumer' | 'contractor' | 'advertiser' | 'admin'
export type LeadType = 'free_estimate' | 'quick_connect'
export type LeadStatus = 'active' | 'paused' | 'completed' | 'expired'
export type EstimateRequestStatus = 'pending' | 'consumer_confirmed' | 'both_confirmed' | 'declined' | 'expired'
export type PurchaseStatus = 'pending' | 'completed' | 'refunded' | 'failed'
export type AdType = 'contractor_statewide' | 'vendor_tile' | 'vendor_banner'
export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'paused'

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
  // Joined fields
  project_type?: ProjectType
  photos?: LeadPhoto[]
  consumer?: Profile
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
  // Joined fields
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
  status: PurchaseStatus
  created_at: string
  // Joined fields
  lead?: Lead
}

export interface County {
  id: string
  name: string
  state: string
  state_abbr: string
  fips_code: string
  population: number
  subscription_price_cents: number
  created_at: string
}

export interface CountySubscription {
  id: string
  contractor_id: string
  county_id: string
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  // Joined fields
  county?: County
}

export interface AdCampaign {
  id: string
  advertiser_id: string
  name: string
  ad_type: AdType
  target_states: string[] | null
  target_project_types: string[] | null
  headline: string | null
  description: string | null
  image_url: string | null
  click_url: string
  cpc_cents: number | null
  monthly_budget_cents: number | null
  status: AdStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  // Joined fields
  variants?: AdVariant[]
}

export interface AdVariant {
  id: string
  campaign_id: string
  variant_name: string
  headline: string | null
  description: string | null
  image_url: string | null
  is_control: boolean
  impressions: number
  clicks: number
  created_at: string
}

export interface AdClick {
  id: string
  campaign_id: string
  variant_id: string | null
  user_id: string | null
  ip_hash: string | null
  user_agent: string | null
  referer: string | null
  created_at: string
}

// Lead pricing tiers based on budget
export const LEAD_PRICING_TIERS = [
  { maxBudget: 25000, priceCents: 3500, label: 'Under $25K' },
  { maxBudget: 100000, priceCents: 5000, label: '$25K - $100K' },
  { maxBudget: 500000, priceCents: 7500, label: '$100K - $500K' },
  { maxBudget: Infinity, priceCents: 10000, label: 'Over $500K' },
] as const

export function getLeadPrice(budgetMax: number | null): number {
  if (!budgetMax) return 3500 // Default price
  const tier = LEAD_PRICING_TIERS.find((t) => budgetMax <= t.maxBudget)
  return tier?.priceCents ?? 10000
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
