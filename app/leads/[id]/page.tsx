import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Phone,
  Mail,
  User,
  ArrowLeft,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('leads')
    .select('title, city, state')
    .eq('id', id)
    .single()

  if (!lead) return { title: 'Lead Not Found' }

  return {
    title: `${lead.title} - ${lead.city}, ${lead.state}`,
    description: `Construction lead in ${lead.city}, ${lead.state}. View details and contact information.`,
  }
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*),
      photos:lead_photos(*)
    `)
    .eq('id', id)
    .single()

  if (error || !lead) {
    notFound()
  }

  const isContractor = profile?.user_type === 'contractor'
  const isOwnLead = lead.consumer_id === user?.id
  const leadPrice = getLeadPrice(lead.budget_max)

  // Check if contractor has purchased or requested this lead
  let hasPurchased = false
  let hasRequested = false
  let estimateRequest = null

  if (user && isContractor) {
    const { data: purchase } = await supabase
      .from('lead_purchases')
      .select('*')
      .eq('lead_id', id)
      .eq('contractor_id', user.id)
      .eq('status', 'completed')
      .single()
    hasPurchased = !!purchase

    const { data: request } = await supabase
      .from('estimate_requests')
      .select('*')
      .eq('lead_id', id)
      .eq('contractor_id', user.id)
      .single()
    estimateRequest = request
    hasRequested = !!request
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Budget not specified'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/leads"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to leads
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{lead.title}</CardTitle>
                        {lead.lead_type === 'free_estimate' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Free Estimate
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-accent text-accent">
                            <Zap className="h-3 w-3" />
                            Quick Connect
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {lead.project_type?.name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Project Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {lead.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="text-sm">{lead.city}, {lead.state} {lead.zip_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Budget</p>
                        <p className="text-sm">{formatBudget(lead.budget_min, lead.budget_max)}</p>
                      </div>
                    </div>
                    {lead.timeline && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Timeline</p>
                          <p className="text-sm">{lead.timeline}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Posted</p>
                        <p className="text-sm">{getTimeAgo(lead.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  {lead.photos && lead.photos.length > 0 && (
                    <div>
                      <h3 className="font-medium text-foreground mb-3">Project Photos</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {lead.photos.map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.url}
                            alt="Project photo"
                            className="aspect-square rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info - Only shown after purchase or for own lead */}
              {(hasPurchased || isOwnLead || (estimateRequest?.status === 'both_confirmed')) && (
                <Card className="border-success/50 bg-success/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-success" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline">
                        {lead.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${lead.contact_phone}`} className="text-primary hover:underline">
                        {lead.contact_phone}
                      </a>
                    </div>
                    <div className="mt-4 p-3 rounded-md bg-muted text-sm text-muted-foreground">
                      <strong>Address:</strong> {lead.address}, {lead.city}, {lead.state} {lead.zip_code}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              {isContractor && !isOwnLead && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Get This Lead</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{formatCents(leadPrice)}</p>
                      <p className="text-sm text-muted-foreground">Lead fee</p>
                    </div>

                    {hasPurchased ? (
                      <div className="rounded-md bg-success/10 p-4 text-center text-success">
                        You have purchased this lead
                      </div>
                    ) : hasRequested ? (
                      <div className="space-y-3">
                        <div className="rounded-md bg-primary/10 p-4 text-center">
                          <p className="font-medium text-primary">Estimate Requested</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Status: {estimateRequest?.status?.replace('_', ' ')}
                          </p>
                        </div>
                        {estimateRequest?.status === 'consumer_confirmed' && (
                          <Button className="w-full" asChild>
                            <Link href={`/leads/${id}/confirm-estimate`}>
                              Confirm Appointment
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : lead.lead_type === 'free_estimate' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Request to provide a free estimate. You will only be charged after
                          both you and the homeowner confirm the appointment.
                        </p>
                        <Button className="w-full" asChild>
                          <Link href={`/leads/${id}/request-estimate`}>
                            Request to Estimate
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Purchase this lead to get instant access to the homeowner's
                          contact information.
                        </p>
                        <Button className="w-full" asChild>
                          <Link href={`/leads/${id}/purchase`}>
                            Purchase Lead
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Not logged in */}
              {!user && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Sign in as a contractor to purchase this lead
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/auth/sign-up?type=contractor&redirect=/leads/${id}`}>
                        Sign Up as Contractor
                      </Link>
                    </Button>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link href={`/auth/login?redirect=/leads/${id}`} className="text-primary hover:underline">
                        Log in
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Own lead */}
              {isOwnLead && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Job</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/consumer/jobs/${id}`}>
                        View in Dashboard
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
