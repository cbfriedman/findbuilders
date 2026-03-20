import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdCampaignForm } from '@/components/advertise/ad-campaign-form'
import type { AdType } from '@/lib/types/database'

export const metadata = {
  title: 'Create Ad Campaign',
  description: 'Create a new advertising campaign on FindBuilders',
}

interface CreateAdPageProps {
  searchParams: Promise<{ type?: AdType }>
}

export default async function CreateAdPage({ searchParams }: CreateAdPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/advertise/create')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch project types for targeting
  const { data: projectTypes } = await supabase
    .from('project_types')
    .select('*')
    .order('name')

  const adType = params.type || 'contractor_statewide'

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Create Ad Campaign
            </h1>
            <p className="mt-2 text-muted-foreground">
              Set up your advertising campaign and start reaching your audience
            </p>
          </div>

          <AdCampaignForm
            adType={adType}
            projectTypes={projectTypes || []}
            userId={user.id}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
