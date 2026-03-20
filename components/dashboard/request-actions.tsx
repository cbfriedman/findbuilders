'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { confirmEstimateAsConsumer, declineEstimateRequest } from '@/app/actions/leads'
import { CheckCircle2, XCircle } from 'lucide-react'

interface RequestActionsProps {
  requestId: string
}

export function RequestActions({ requestId }: RequestActionsProps) {
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
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleApprove}
          disabled={loading !== null}
          className="w-full gap-2"
        >
          {loading === 'approve' ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Approve Request
        </Button>
        <Button
          onClick={handleDecline}
          variant="outline"
          disabled={loading !== null}
          className="w-full gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          {loading === 'decline' ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Decline
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        If you approve, the contractor will be notified and asked to confirm.
        Your contact info will only be shared after they confirm and pay the lead fee.
      </p>
    </div>
  )
}
