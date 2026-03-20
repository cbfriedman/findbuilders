-- Leads and related tables

-- Leads (job postings from consumers)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_type_id UUID NOT NULL REFERENCES public.project_types(id),
  lead_type TEXT NOT NULL DEFAULT 'quick_connect',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  county_fips TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  timeline TEXT,
  property_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
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
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  proposed_date TIMESTAMPTZ,
  consumer_confirmed_at TIMESTAMPTZ,
  contractor_confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, contractor_id)
);

-- Lead Purchases
CREATE TABLE IF NOT EXISTS public.lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estimate_request_id UUID REFERENCES public.estimate_requests(id),
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_purchases ENABLE ROW LEVEL SECURITY;

-- Leads: Anyone can view active leads, consumers can manage their own
CREATE POLICY "Anyone can view active leads" ON public.leads FOR SELECT USING (status = 'active');
CREATE POLICY "Consumers can insert leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = consumer_id);
CREATE POLICY "Consumers can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = consumer_id);
CREATE POLICY "Consumers can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = consumer_id);

-- Lead Photos: Follow lead ownership
CREATE POLICY "Anyone can view lead photos" ON public.lead_photos FOR SELECT USING (true);
CREATE POLICY "Lead owners can manage photos" ON public.lead_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_photos.lead_id AND leads.consumer_id = auth.uid())
);

-- Estimate Requests: Contractors can request, involved parties can view
CREATE POLICY "View own estimate requests" ON public.estimate_requests FOR SELECT USING (
  auth.uid() = contractor_id OR 
  EXISTS (SELECT 1 FROM public.leads WHERE leads.id = estimate_requests.lead_id AND leads.consumer_id = auth.uid())
);
CREATE POLICY "Contractors can insert requests" ON public.estimate_requests FOR INSERT WITH CHECK (auth.uid() = contractor_id);
CREATE POLICY "Involved parties can update" ON public.estimate_requests FOR UPDATE USING (
  auth.uid() = contractor_id OR 
  EXISTS (SELECT 1 FROM public.leads WHERE leads.id = estimate_requests.lead_id AND leads.consumer_id = auth.uid())
);

-- Lead Purchases: Contractors can view their purchases
CREATE POLICY "Contractors view own purchases" ON public.lead_purchases FOR SELECT USING (auth.uid() = contractor_id);
CREATE POLICY "System can insert purchases" ON public.lead_purchases FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_state ON public.leads(state);
CREATE INDEX IF NOT EXISTS idx_leads_consumer ON public.leads(consumer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_requests_lead ON public.estimate_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_estimate_requests_contractor ON public.estimate_requests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_lead_purchases_contractor ON public.lead_purchases(contractor_id);
