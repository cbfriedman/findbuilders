-- FindBuilders.net Database Schema
-- This script creates all core tables for the lead marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Project Types (categories for leads)
CREATE TABLE IF NOT EXISTS public.project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  lead_price_cents INTEGER NOT NULL DEFAULT 3500, -- Base price in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default project types
INSERT INTO public.project_types (name, slug, lead_price_cents) VALUES
  ('Roofing', 'roofing', 5000),
  ('Plumbing', 'plumbing', 3500),
  ('Electrical', 'electrical', 4000),
  ('HVAC', 'hvac', 5000),
  ('Kitchen Remodel', 'kitchen-remodel', 7500),
  ('Bathroom Remodel', 'bathroom-remodel', 5000),
  ('Flooring', 'flooring', 3500),
  ('Painting', 'painting', 2500),
  ('Windows & Doors', 'windows-doors', 4000),
  ('Siding', 'siding', 5000),
  ('Deck/Patio', 'deck-patio', 4500),
  ('Landscaping', 'landscaping', 3000),
  ('Fencing', 'fencing', 3000),
  ('Foundation', 'foundation', 7500),
  ('New Construction', 'new-construction', 10000),
  ('General Contractor', 'general-contractor', 5000),
  ('Home Addition', 'home-addition', 10000),
  ('Garage', 'garage', 6000),
  ('Basement Finishing', 'basement-finishing', 7500),
  ('Other', 'other', 3500)
ON CONFLICT (slug) DO NOTHING;

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL DEFAULT 'consumer' CHECK (user_type IN ('consumer', 'contractor', 'advertiser', 'admin', 'moderator')),
  company_name TEXT,
  company_description TEXT,
  license_number TEXT,
  years_in_business INTEGER,
  service_areas TEXT[], -- Array of county FIPS codes
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (job postings from consumers)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_type_id UUID NOT NULL REFERENCES public.project_types(id),
  lead_type TEXT NOT NULL DEFAULT 'quick_connect' CHECK (lead_type IN ('free_estimate', 'quick_connect')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Location
  location_address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  county_fips TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  -- Contact info (revealed after purchase)
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  -- Project details
  budget_min INTEGER, -- in cents
  budget_max INTEGER, -- in cents
  timeline TEXT CHECK (timeline IN ('asap', 'within_week', 'within_month', 'within_3_months', 'flexible')),
  property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'industrial')),
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'closed', 'expired')),
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  -- Pricing (calculated based on budget)
  lead_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Lead Photos
CREATE TABLE IF NOT EXISTS public.lead_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  pathname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimate Requests (for Free Estimate flow)
CREATE TABLE IF NOT EXISTS public.estimate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'consumer_confirmed', 'contractor_confirmed', 'paid', 'cancelled', 'expired')),
  message TEXT, -- Optional message from contractor
  proposed_date TIMESTAMPTZ, -- When contractor proposes to visit
  consumer_confirmed_at TIMESTAMPTZ,
  contractor_confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, contractor_id) -- One request per contractor per lead
);

-- Lead Purchases (record of all lead purchases)
CREATE TABLE IF NOT EXISTS public.lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estimate_request_id UUID REFERENCES public.estimate_requests(id), -- NULL for Quick Connect
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counties (for subscription pricing)
CREATE TABLE IF NOT EXISTS public.counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  state_abbr TEXT NOT NULL,
  fips_code TEXT NOT NULL UNIQUE,
  population INTEGER NOT NULL DEFAULT 0,
  subscription_price_cents INTEGER NOT NULL DEFAULT 1500, -- Calculated on insert/update: $0.50 per 1K pop, min $15, max $199
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor County Subscriptions
CREATE TABLE IF NOT EXISTS public.contractor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  county_id UUID NOT NULL REFERENCES public.counties(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contractor_id, county_id)
);

-- Ad Campaigns
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('contractor_statewide', 'vendor_tile', 'vendor_banner')),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'ended', 'rejected')),
  -- Targeting
  target_states TEXT[], -- Array of state abbreviations
  target_counties TEXT[], -- Array of county FIPS codes
  target_project_types UUID[], -- Array of project_type IDs
  -- Budget
  budget_type TEXT CHECK (budget_type IN ('daily', 'weekly', 'monthly', 'unlimited')),
  budget_amount_cents INTEGER,
  cpc_cents INTEGER, -- Cost per click for CPC campaigns
  total_spent_cents INTEGER DEFAULT 0,
  -- Schedule
  schedule_days INTEGER[], -- 0-6 for Sun-Sat
  schedule_hours INTEGER[], -- 0-23 for hours
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  -- Stats
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Creatives
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL DEFAULT 'A', -- For A/B testing
  image_url TEXT,
  image_pathname TEXT,
  headline TEXT NOT NULL,
  description TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Impressions (for analytics)
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES public.ad_creatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  ip_hash TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Clicks
CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES public.ad_creatives(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  ip_address TEXT,
  feature TEXT NOT NULL, -- 'ai_chat', 'lead_submission', etc.
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature)
);

-- Security Events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL, -- 'login_failed', 'suspicious_activity', etc.
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_state ON public.leads(state);
CREATE INDEX IF NOT EXISTS idx_leads_county ON public.leads(county_fips);
CREATE INDEX IF NOT EXISTS idx_leads_project_type ON public.leads(project_type_id);
CREATE INDEX IF NOT EXISTS idx_leads_consumer ON public.leads(consumer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_requests_lead ON public.estimate_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_estimate_requests_contractor ON public.estimate_requests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_contractor ON public.lead_purchases(contractor_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON public.ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
