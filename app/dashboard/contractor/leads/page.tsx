import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { FileText, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Leads | FindBuilders',
  description: 'View your purchased leads.',
}

export default async function ContractorLeadsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: purchasedLeads } = await supabase
    .from('lead_purchases')
    .select(`
      *,
      jobs (*)
    `)
    .eq('contractor_id', user.id)
    .order('purchased_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      contacted: 'default',
      pending: 'secondary',
      won: 'default',
      lost: 'destructive',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Leads
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your purchased leads.
            </p>
          </div>
          <Button asChild>
            <Link href="/leads">
              <Search className="mr-2 h-4 w-4" />
              Browse Leads
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {purchasedLeads && purchasedLeads.length > 0 ? (
            <div className="grid gap-4">
              {purchasedLeads.map((lead) => (
                <Card key={lead.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {lead.jobs?.title || 'Job Lead'}
                        </CardTitle>
                        <CardDescription>
                          Purchased {formatDistanceToNow(new Date(lead.purchased_at))} ago
                        </CardDescription>
                      </div>
                      {getStatusBadge(lead.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {lead.jobs?.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {lead.jobs?.city}, {lead.jobs?.state}
                        </span>
                        <span>
                          Paid: ${lead.price_paid?.toFixed(2)}
                        </span>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/leads/${lead.job_id}`}>
                          View Lead Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No leads purchased yet
                </h3>
                <p className="mt-2 text-center text-muted-foreground">
                  Browse available leads and purchase ones that match your expertise.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/leads">Browse Available Leads</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
