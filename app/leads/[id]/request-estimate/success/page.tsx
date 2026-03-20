import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site-chrome'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Request Sent',
  description: 'Your estimate request has been sent to the homeowner.',
}

interface SuccessPageProps {
  params: Promise<{ id: string }>
}

export default async function RequestEstimateSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params

  return (
    <SiteChrome>
      <div className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-8">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <CardTitle className="mt-4 text-2xl">Request Sent!</CardTitle>
          <CardDescription>
            Your estimate request has been sent to the homeowner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4 text-left">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              What happens next?
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• The homeowner will review your profile and request</li>
              <li>• You'll be notified when they approve or decline</li>
              <li>• If approved, you'll confirm the appointment</li>
              <li>• Only then will you be charged and get contact info</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href={`/leads/${id}`} className="gap-2">
                View Lead Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/leads">Browse More Leads</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/contractor">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </SiteChrome>
  )
}
