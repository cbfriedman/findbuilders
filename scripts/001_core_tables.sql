-- FindBuilders.net Core Tables
-- Step 1: Enable extensions and create basic tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Project Types (categories for leads)
CREATE TABLE IF NOT EXISTS public.project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  lead_price_cents INTEGER NOT NULL DEFAULT 3500,
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
  user_type TEXT NOT NULL DEFAULT 'consumer',
  company_name TEXT,
  company_description TEXT,
  license_number TEXT,
  years_in_business INTEGER,
  service_areas TEXT[],
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Everyone can read project types
CREATE POLICY "Anyone can view project types" ON public.project_types FOR SELECT USING (true);
