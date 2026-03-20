'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MapPin, Calendar, XCircle } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  current_period_end?: string
  county: {
    id: string
    name: string
    state: string
    state_abbr: string
  }
}

interface ActiveSubscriptionsProps {
  subscriptions: Subscription[]
}

export function ActiveSubscriptions({ subscriptions }: ActiveSubscriptionsProps) {
  const router = useRouter()
  const [canceling, setCanceling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async (subscriptionId: string) => {
    setCanceling(subscriptionId)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCanceling(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                {subscription.county.name} County
              </h4>
              <p className="text-sm text-muted-foreground">
                {subscription.county.state}
              </p>
              {subscription.current_period_end && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Renews {formatDate(subscription.current_period_end)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={subscription.status === 'active' ? 'default' : 'secondary'}
              className={subscription.status === 'active' ? 'bg-green-600' : ''}
            >
              {subscription.status === 'active' ? 'Active' : 'Pending'}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={canceling !== null}
                >
                  {canceling === subscription.id ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription to{' '}
                    {subscription.county.name} County, {subscription.county.state}?
                    You&apos;ll lose access to leads in this area at the end of
                    your billing period.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancel(subscription.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}
