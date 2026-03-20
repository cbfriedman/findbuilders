'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCents } from '@/lib/types/database'
import { requestEstimate } from '@/app/actions/leads'
import {
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Loader2,
} from 'lucide-react'

interface LeadActionsProps {
  lead: {
    id: string
    lead_type: 'free_estimate' | 'quick_connect'
    title: string
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    budget_max?: number
  }
  leadPrice: number
  estimateRequest: {
    id: string
    status: string
    contractor_confirmed: boolean
    consumer_confirmed: boolean
  } | null
  existingPurchase: { id: string } | null
  isContractor: boolean
  isLoggedIn: boolean
}

export function LeadActions({
  lead,
  leadPrice,
  estimateRequest,
  existingPurchase,
  isContractor,
  isLoggedIn,
}: LeadActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestEstimate = async () => {
    setLoading(true)
    setError(null)

    const result = await requestEstimate(lead.id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Interested in this lead?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a contractor account to purchase leads or request estimates.
          </p>
          <Button asChild className="w-full">
            <Link href={`/auth/register?redirect=/leads/${lead.id}`}>
              Sign Up to Connect
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href={`/auth/login?redirect=/leads/${lead.id}`} className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  // Not a contractor
  if (!isContractor) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Only contractors can purchase leads.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/dashboard/consumer">Go to your dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Already purchased (Quick Connect)
  if (existingPurchase) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Lead Purchased</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-700">
            You&apos;ve purchased this lead. Contact the homeowner directly:
          </p>
          <div className="space-y-2 rounded-lg bg-white/80 p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lead.contact_name}</span>
            </div>
            {lead.contact_phone && (
              <a
                href={`tel:${lead.contact_phone}`}
                className="flex items-center gap-2 text-sm text-green-700 hover:underline"
              >
                <Phone className="h-4 w-4" />
                {lead.contact_phone}
              </a>
            )}
            {lead.contact_email && (
              <a
                href={`mailto:${lead.contact_email}`}
                className="flex items-center gap-2 text-sm text-green-700 hover:underline"
              >
                <Mail className="h-4 w-4" />
                {lead.contact_email}
              </a>
            )}
            {lead.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {lead.address}, {lead.city}, {lead.state} {lead.zip_code}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Free Estimate Flow
  if (lead.lead_type === 'free_estimate') {
    // Already requested - show status
    if (estimateRequest) {
      if (estimateRequest.status === 'pending') {
        return (
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Request Pending</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your estimate request has been sent. The homeowner will review your
                profile and decide whether to approve you.
              </p>
              <Badge variant="secondary" className="mt-4">
                Waiting for homeowner approval
              </Badge>
            </CardContent>
          </Card>
        )
      }

      if (estimateRequest.status === 'consumer_confirmed') {
        return (
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">You&apos;ve Been Approved!</CardTitle>
              </div>
              <CardDescription>
                The homeowner wants you to give them an estimate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm this appointment and pay the lead fee to get their contact information.
              </p>
              <div className="flex items-center justify-between rounded-lg bg-white/80 p-3">
                <span className="text-muted-foreground">Lead Fee</span>
                <span className="text-lg font-bold text-primary">{formatCents(leadPrice)}</span>
              </div>
              <Button asChild className="w-full">
                <Link href={`/leads/${lead.id}/confirm-estimate`}>
                  Confirm & Pay
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      }

      if (estimateRequest.status === 'both_confirmed') {
        return (
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Appointment Confirmed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-green-700">
                Contact the homeowner to schedule your estimate visit:
              </p>
              <div className="space-y-2 rounded-lg bg-white/80 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{lead.contact_name}</span>
                </div>
                {lead.contact_phone && (
                  <a
                    href={`tel:${lead.contact_phone}`}
                    className="flex items-center gap-2 text-sm text-green-700 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {lead.contact_phone}
                  </a>
                )}
                {lead.contact_email && (
                  <a
                    href={`mailto:${lead.contact_email}`}
                    className="flex items-center gap-2 text-sm text-green-700 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {lead.contact_email}
                  </a>
                )}
                {lead.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {lead.address}, {lead.city}, {lead.state} {lead.zip_code}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      }

      if (estimateRequest.status === 'declined') {
        return (
          <Card className="bg-secondary/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Unfortunately, the homeowner declined your request.
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/leads">Browse other leads</Link>
              </Button>
            </CardContent>
          </Card>
        )
      }
    }

    // Can request estimate
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <Badge variant="secondary">Free Estimate</Badge>
          </div>
          <CardTitle className="text-lg">Request an Estimate</CardTitle>
          <CardDescription>
            Ask the homeowner if you can provide a free estimate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2 rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How it works:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Send your request (free)</li>
              <li>Homeowner reviews your profile</li>
              <li>If approved, confirm & pay {formatCents(leadPrice)}</li>
              <li>Get contact info & schedule visit</li>
            </ol>
          </div>
          <Button
            onClick={handleRequestEstimate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Request Free Estimate'
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You only pay if the homeowner approves your request
          </p>
        </CardContent>
      </Card>
    )
  }

  // Quick Connect Flow
  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            Quick Connect
          </Badge>
        </div>
        <CardTitle className="text-lg">Purchase This Lead</CardTitle>
        <CardDescription>
          Get instant access to the homeowner&apos;s contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
          <span className="text-muted-foreground">Lead Price</span>
          <span className="text-2xl font-bold text-primary">{formatCents(leadPrice)}</span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/leads/${lead.id}/purchase`}>
            <DollarSign className="mr-2 h-4 w-4" />
            Buy Now
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Contact info revealed immediately after purchase
        </p>
      </CardContent>
    </Card>
  )
}
