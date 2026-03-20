import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function PostJobSuccessPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  let profile = null
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  profile = profileData

  // Get the lead details
  let lead = null
  if (id) {
    const { data } = await supabase
      .from('leads')
      .select(`*, project_type:project_types(*)`)
      .eq('id', id)
      .single()
    lead = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex flex-1 items-center justify-center bg-secondary/30 py-12">
        <Card className="mx-4 w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Project Posted Successfully!</CardTitle>
            <CardDescription>
              Your project is now live and visible to contractors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lead && (
              <div className="rounded-lg bg-secondary/50 p-4 text-left">
                <h3 className="font-semibold text-foreground">{lead.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lead.project_type?.name} in {lead.city}, {lead.state}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {lead.lead_type === 'free_estimate' 
                    ? 'Contractors will request to provide estimates. You\'ll be notified when you have requests to review.'
                    : 'Contractors can purchase this lead directly and will receive your contact information immediately.'}
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>What happens next:</p>
              <ul className="mt-2 space-y-2 text-left">
                {lead?.lead_type === 'free_estimate' ? (
                  <>
                    <li className="flex gap-2">
                      <span className="text-primary">1.</span>
                      Contractors will review your project
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">2.</span>
                      You&apos;ll receive estimate requests to approve
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">3.</span>
                      Confirm appointments with chosen contractors
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">4.</span>
                      Get your free estimates!
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-2">
                      <span className="text-primary">1.</span>
                      Contractors will see your project
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">2.</span>
                      Interested contractors will purchase the lead
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">3.</span>
                      They&apos;ll contact you directly with quotes
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/dashboard/consumer" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/post-job">Post Another Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
