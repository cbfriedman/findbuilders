import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { Profile } from '@/lib/types/database'

type SiteChromeProps = {
  children: React.ReactNode
  /** When the page already loaded the profile, pass it to avoid a duplicate query. */
  prefetchedProfile?: Profile | null
}

export async function SiteChrome({ children, prefetchedProfile }: SiteChromeProps) {
  let profile: Profile | null = null

  if (prefetchedProfile !== undefined) {
    profile = prefetchedProfile
  } else {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  )
}
