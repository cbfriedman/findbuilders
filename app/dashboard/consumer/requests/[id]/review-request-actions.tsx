'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { confirmEstimateAsConsumer, declineEstimateRequest } from '@/app/actions/leads'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ReviewRequestActionsProps {
  requestId: string
}

export function ReviewRequestActions({ requestId }: ReviewRequestActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setLoading('approve')
    setError(null)

    const result = await confirmEstimateAsConsumer(requestId)

    if (result.error) {
      setError(result.error)
      setLoading(null)
      return
    }

    router.refresh()
  }

  const handleDecline = async () => {
    setLoading('decline')
    setError(null)

    const result = await declineEstimateRequest(requestId)

    if (result.error) {
      setError(result.error)
      setLoading(null)
      return
    }

    router.push('/dashboard/consumer/requests')
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1 gap-2"
            size="lg"
            onClick={handleApprove}
            disabled={loading !== null}
          >
            {loading === 'approve' ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve Request
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
            onClick={handleDecline}
            disabled={loading !== null}
          >
            {loading === 'decline' ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Decline
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Approving allows this contractor to confirm and receive your contact information
        </p>
      </CardContent>
    </Card>
  )
}
