import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CountySubscriptionBrowser } from '@/components/subscriptions/county-browser'

export const metadata = {
  title: 'County Subscriptions',
  description: 'Subscribe to counties for unlimited lead access in your service area',
}

export default async function SubscriptionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/subscriptions')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'contractor') {
    redirect('/dashboard')
  }

  // Fetch counties with subscription counts
  const { data: counties } = await supabase
    .from('counties')
    .select('*')
    .order('state')
    .order('name')

  // Fetch user's current subscriptions
  const { data: subscriptions } = await supabase
    .from('county_subscriptions')
    .select('*, county:counties(*)')
    .eq('contractor_id', user.id)
    .in('status', ['active', 'past_due'])

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              County Subscriptions
            </h1>
            <p className="mt-2 text-muted-foreground">
              Subscribe to counties for unlimited lead access. Get notified instantly when new leads are posted in your service areas.
            </p>
          </div>

          <CountySubscriptionBrowser
            counties={counties || []}
            currentSubscriptions={subscriptions || []}
            userId={user.id}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
