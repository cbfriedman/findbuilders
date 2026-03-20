import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LeadsList } from '@/components/leads/leads-list'
import { LeadsFilters } from '@/components/leads/leads-filters'
import { Spinner } from '@/components/ui/spinner'

export const metadata = {
  title: 'Browse Construction Leads',
  description: 'Find quality construction leads in your area. Filter by project type, location, and budget.',
}

interface LeadsPageProps {
  searchParams: Promise<{
    state?: string
    projectType?: string
    minBudget?: string
    maxBudget?: string
    leadType?: string
  }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch project types for filter
  const { data: projectTypes } = await supabase
    .from('project_types')
    .select('*')
    .order('name')

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Browse Construction Leads
            </h1>
            <p className="mt-2 text-muted-foreground">
              Find quality leads in your area and grow your business
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
                <LeadsFilters 
                  projectTypes={projectTypes || []} 
                  currentFilters={params}
                />
              </Suspense>
            </div>

            {/* Leads List */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <Spinner className="h-8 w-8" />
                  </div>
                }
              >
                <LeadsList 
                  filters={params} 
                  isContractor={profile?.user_type === 'contractor'}
                  userId={user?.id}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
