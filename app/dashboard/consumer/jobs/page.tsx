import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteChrome } from '@/components/site-chrome'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Plus, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Jobs | FindBuilders',
  description: 'View and manage your posted jobs.',
}

export default async function ConsumerJobsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('consumer_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Jobs
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your posted jobs.
            </p>
          </div>
          <Button asChild>
            <Link href="/post-job">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {jobs && jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>
                          Posted {formatDistanceToNow(new Date(job.created_at))} ago
                        </CardDescription>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{job.city}, {job.state}</span>
                        {job.budget_min && job.budget_max && (
                          <span>
                            ${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/consumer/requests/${job.id}`}>
                          View Details
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
                  No jobs posted yet
                </h3>
                <p className="mt-2 text-center text-muted-foreground">
                  Post your first job to start receiving estimates from contractors.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/post-job">Post Your First Job</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
    </SiteChrome>
  )
}
