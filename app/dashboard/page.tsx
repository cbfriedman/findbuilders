import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  // Redirect to the appropriate dashboard based on user type
  if (profile?.user_type === 'contractor') {
    redirect('/dashboard/contractor')
  } else if (profile?.user_type === 'advertiser') {
    redirect('/dashboard/advertiser')
  } else {
    redirect('/dashboard/consumer')
  }
}
