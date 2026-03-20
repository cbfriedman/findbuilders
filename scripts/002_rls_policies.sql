-- FindBuilders.net Row Level Security Policies

-- =====================
-- PROFILES
-- =====================
-- Anyone can view public profile info
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger too)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================
-- PROJECT TYPES
-- =====================
-- Anyone can view project types
CREATE POLICY "project_types_select_all" ON public.project_types
  FOR SELECT USING (true);

-- =====================
-- LEADS
-- =====================
-- Active leads are publicly viewable (without contact info - handled in queries)
CREATE POLICY "leads_select_active" ON public.leads
  FOR SELECT USING (status = 'active' OR consumer_id = auth.uid());

-- Consumers can insert their own leads
CREATE POLICY "leads_insert_own" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = consumer_id);

-- Consumers can update their own leads
CREATE POLICY "leads_update_own" ON public.leads
  FOR UPDATE USING (auth.uid() = consumer_id);

-- Consumers can delete their own leads
CREATE POLICY "leads_delete_own" ON public.leads
  FOR DELETE USING (auth.uid() = consumer_id);

-- =====================
-- LEAD PHOTOS
-- =====================
-- Photos visible if lead is visible
CREATE POLICY "lead_photos_select" ON public.lead_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_photos.lead_id 
      AND (leads.status = 'active' OR leads.consumer_id = auth.uid())
    )
  );

-- Only lead owner can insert photos
CREATE POLICY "lead_photos_insert" ON public.lead_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_photos.lead_id 
      AND leads.consumer_id = auth.uid()
    )
  );

-- Only lead owner can delete photos
CREATE POLICY "lead_photos_delete" ON public.lead_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_photos.lead_id 
      AND leads.consumer_id = auth.uid()
    )
  );

-- =====================
-- ESTIMATE REQUESTS
-- =====================
-- Contractors can view their own requests, consumers can view requests on their leads
CREATE POLICY "estimate_requests_select" ON public.estimate_requests
  FOR SELECT USING (
    contractor_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = estimate_requests.lead_id 
      AND leads.consumer_id = auth.uid()
    )
  );

-- Contractors can create requests on active leads
CREATE POLICY "estimate_requests_insert" ON public.estimate_requests
  FOR INSERT WITH CHECK (
    contractor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = estimate_requests.lead_id 
      AND leads.status = 'active'
      AND leads.lead_type = 'free_estimate'
    )
  );

-- Both parties can update (for confirmations)
CREATE POLICY "estimate_requests_update" ON public.estimate_requests
  FOR UPDATE USING (
    contractor_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = estimate_requests.lead_id 
      AND leads.consumer_id = auth.uid()
    )
  );

-- =====================
-- LEAD PURCHASES
-- =====================
-- Contractors can view their own purchases
CREATE POLICY "lead_purchases_select_contractor" ON public.lead_purchases
  FOR SELECT USING (contractor_id = auth.uid());

-- Consumers can view purchases on their leads
CREATE POLICY "lead_purchases_select_consumer" ON public.lead_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_purchases.lead_id 
      AND leads.consumer_id = auth.uid()
    )
  );

-- System handles inserts (via API with service role)
CREATE POLICY "lead_purchases_insert" ON public.lead_purchases
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

-- =====================
-- COUNTIES
-- =====================
-- Anyone can view counties
CREATE POLICY "counties_select_all" ON public.counties
  FOR SELECT USING (true);

-- =====================
-- CONTRACTOR SUBSCRIPTIONS
-- =====================
-- Contractors can view their own subscriptions
CREATE POLICY "contractor_subscriptions_select_own" ON public.contractor_subscriptions
  FOR SELECT USING (contractor_id = auth.uid());

-- Contractors can manage their own subscriptions
CREATE POLICY "contractor_subscriptions_insert_own" ON public.contractor_subscriptions
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "contractor_subscriptions_update_own" ON public.contractor_subscriptions
  FOR UPDATE USING (contractor_id = auth.uid());

-- =====================
-- AD CAMPAIGNS
-- =====================
-- Advertisers can view their own campaigns
CREATE POLICY "ad_campaigns_select_own" ON public.ad_campaigns
  FOR SELECT USING (advertiser_id = auth.uid());

-- Active campaigns visible for ad serving (read-only fields)
CREATE POLICY "ad_campaigns_select_active" ON public.ad_campaigns
  FOR SELECT USING (status = 'active');

-- Advertisers can manage their own campaigns
CREATE POLICY "ad_campaigns_insert_own" ON public.ad_campaigns
  FOR INSERT WITH CHECK (advertiser_id = auth.uid());

CREATE POLICY "ad_campaigns_update_own" ON public.ad_campaigns
  FOR UPDATE USING (advertiser_id = auth.uid());

CREATE POLICY "ad_campaigns_delete_own" ON public.ad_campaigns
  FOR DELETE USING (advertiser_id = auth.uid());

-- =====================
-- AD CREATIVES
-- =====================
-- Creatives visible if campaign is visible
CREATE POLICY "ad_creatives_select" ON public.ad_creatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_creatives.campaign_id 
      AND (ad_campaigns.advertiser_id = auth.uid() OR ad_campaigns.status = 'active')
    )
  );

-- Only campaign owner can manage creatives
CREATE POLICY "ad_creatives_insert" ON public.ad_creatives
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_creatives.campaign_id 
      AND ad_campaigns.advertiser_id = auth.uid()
    )
  );

CREATE POLICY "ad_creatives_update" ON public.ad_creatives
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_creatives.campaign_id 
      AND ad_campaigns.advertiser_id = auth.uid()
    )
  );

CREATE POLICY "ad_creatives_delete" ON public.ad_creatives
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_creatives.campaign_id 
      AND ad_campaigns.advertiser_id = auth.uid()
    )
  );

-- =====================
-- AD IMPRESSIONS & CLICKS
-- =====================
-- Anyone can insert (for tracking)
CREATE POLICY "ad_impressions_insert" ON public.ad_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_clicks_insert" ON public.ad_clicks
  FOR INSERT WITH CHECK (true);

-- Campaign owner can view their stats
CREATE POLICY "ad_impressions_select" ON public.ad_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_creatives c
      JOIN public.ad_campaigns ac ON ac.id = c.campaign_id
      WHERE c.id = ad_impressions.creative_id 
      AND ac.advertiser_id = auth.uid()
    )
  );

CREATE POLICY "ad_clicks_select" ON public.ad_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_creatives c
      JOIN public.ad_campaigns ac ON ac.id = c.campaign_id
      WHERE c.id = ad_clicks.creative_id 
      AND ac.advertiser_id = auth.uid()
    )
  );

-- =====================
-- BLOG POSTS
-- =====================
-- Published posts are public
CREATE POLICY "blog_posts_select_published" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());

-- Authors can manage their own posts
CREATE POLICY "blog_posts_insert" ON public.blog_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "blog_posts_update" ON public.blog_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "blog_posts_delete" ON public.blog_posts
  FOR DELETE USING (author_id = auth.uid());

-- =====================
-- AI CHAT SESSIONS
-- =====================
-- Users can only access their own chat sessions
CREATE POLICY "ai_chat_select_own" ON public.ai_chat_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ai_chat_insert_own" ON public.ai_chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "ai_chat_update_own" ON public.ai_chat_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- =====================
-- RATE LIMITS
-- =====================
-- Users can view their own rate limits
CREATE POLICY "rate_limits_select_own" ON public.rate_limits
  FOR SELECT USING (user_id = auth.uid());

-- System handles rate limit updates
CREATE POLICY "rate_limits_upsert" ON public.rate_limits
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "rate_limits_update" ON public.rate_limits
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================
-- SECURITY EVENTS
-- =====================
-- Users can only view their own security events
CREATE POLICY "security_events_select_own" ON public.security_events
  FOR SELECT USING (user_id = auth.uid());

-- System inserts security events
CREATE POLICY "security_events_insert" ON public.security_events
  FOR INSERT WITH CHECK (true);
