import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings-form'

export const metadata: Metadata = {
  title: 'Settings | FindBuilders',
  description: 'Manage your FindBuilders account settings.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account information and preferences.
        </p>

        <div className="mt-8">
          <SettingsForm profile={profile} userEmail={user.email || ''} />
        </div>
      </div>
    </main>
  )
}
