import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PostJobForm } from '@/components/post-job/post-job-form'

export const metadata = {
  title: 'Post a Job',
  description: 'Post your construction project and get free estimates from qualified contractors.',
}

export default async function PostJobPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // User needs to be logged in to post a job
  if (!user) {
    redirect('/auth/sign-up?redirect=/post-job')
  }

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch project types
  const { data: projectTypes } = await supabase
    .from('project_types')
    .select('*')
    .order('name')

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Post Your Project
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tell us about your project and we&apos;ll connect you with qualified contractors
            </p>
          </div>
          <PostJobForm projectTypes={projectTypes || []} profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
