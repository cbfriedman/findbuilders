import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import { RequestActions } from '@/components/dashboard/request-actions'
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Clock,
  Star,
  Shield,
  Phone,
  Mail,
  Briefcase,
} from 'lucide-react'

interface RequestDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch the request with lead and contractor details
  const { data: request, error } = await supabase
    .from('estimate_requests')
    .select(`
      *,
      lead:leads(*, project_type:project_types(*)),
      contractor:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  // Verify user owns the lead
  if (request.lead?.consumer_id !== user.id) {
    redirect('/dashboard/consumer/requests')
  }

  const contractor = request.contractor
  const lead = request.lead
  const leadPrice = getLeadPrice(lead?.budget_max)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/consumer/requests"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Link>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Estimate Request
              </h1>
              <p className="mt-1 text-muted-foreground">
                Review this contractor&apos;s request for your project
              </p>
            </div>
            <Badge
              variant={
                request.status === 'pending'
                  ? 'secondary'
                  : request.status === 'consumer_confirmed'
                    ? 'default'
                    : request.status === 'both_confirmed'
                      ? 'default'
                      : 'destructive'
              }
              className={
                request.status === 'both_confirmed' ? 'bg-green-600' : ''
              }
            >
              {request.status === 'pending' && 'Pending Your Approval'}
              {request.status === 'consumer_confirmed' && 'Waiting for Contractor'}
              {request.status === 'both_confirmed' && 'Confirmed'}
              {request.status === 'declined' && 'Declined'}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contractor Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {contractor?.company_name ? (
                        <Building2 className="h-8 w-8 text-primary" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle>
                        {contractor?.company_name || contractor?.full_name}
                      </CardTitle>
                      {contractor?.company_name && contractor?.full_name && (
                        <CardDescription>{contractor.full_name}</CardDescription>
                      )}
                      {contractor?.is_verified && (
                        <Badge variant="secondary" className="mt-1 gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Description */}
                  {contractor?.company_description && (
                    <div>
                      <h3 className="mb-2 font-medium text-foreground">About</h3>
                      <p className="text-muted-foreground">
                        {contractor.company_description}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contractor?.years_in_business && (
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Experience</p>
                          <p className="font-medium">
                            {contractor.years_in_business} years in business
                          </p>
                        </div>
                      </div>
                    )}
                    {contractor?.license_number && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">License</p>
                          <p className="font-medium">{contractor.license_number}</p>
                        </div>
                      </div>
                    )}
                    {contractor?.service_areas && contractor.service_areas.length > 0 && (
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Service Areas</p>
                          <p className="font-medium">
                            {contractor.service_areas.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info - Only show if both confirmed */}
                  {request.status === 'both_confirmed' && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="mb-3 font-medium text-green-800">
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        {contractor?.phone && (
                          <div className="flex items-center gap-2 text-green-700">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${contractor.phone}`}
                              className="hover:underline"
                            >
                              {contractor.phone}
                            </a>
                          </div>
                        )}
                        {contractor?.email && (
                          <div className="flex items-center gap-2 text-green-700">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${contractor.email}`}
                              className="hover:underline"
                            >
                              {contractor.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Requested on {formatDate(request.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project & Actions */}
            <div className="space-y-6">
              {/* Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium text-foreground">{lead?.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lead?.project_type?.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lead?.city}, {lead?.state}
                  </p>
                  <Link
                    href={`/dashboard/consumer/jobs/${lead?.id}`}
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    View Project Details
                  </Link>
                </CardContent>
              </Card>

              {/* Actions */}
              {request.status === 'pending' && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Decision</CardTitle>
                    <CardDescription>
                      Approve this contractor to provide you an estimate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RequestActions requestId={id} />
                  </CardContent>
                </Card>
              )}

              {request.status === 'consumer_confirmed' && (
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6 text-center">
                    <Clock className="mx-auto h-10 w-10 text-blue-500" />
                    <h3 className="mt-3 font-medium text-foreground">
                      Waiting for Contractor
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You&apos;ve approved this request. The contractor needs to
                      confirm and pay the lead fee before they can contact you.
                    </p>
                  </CardContent>
                </Card>
              )}

              {request.status === 'both_confirmed' && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-6 text-center">
                    <Shield className="mx-auto h-10 w-10 text-green-500" />
                    <h3 className="mt-3 font-medium text-foreground">
                      Connection Confirmed
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Both parties have confirmed. The contractor now has your
                      contact information and will reach out to schedule an estimate.
                    </p>
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
