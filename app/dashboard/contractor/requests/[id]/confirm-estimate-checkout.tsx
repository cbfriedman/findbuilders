'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface ConfirmEstimateCheckoutProps {
  requestId: string
  leadId: string
  amountCents: number
  leadTitle: string
}

export function ConfirmEstimateCheckout({ 
  requestId, 
  leadId, 
  amountCents, 
  leadTitle 
}: ConfirmEstimateCheckoutProps) {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = async () => {
    const response = await fetch('/api/stripe/create-estimate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        leadId,
        amountCents,
        leadTitle,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create checkout session')
    }

    const { clientSecret } = await response.json()
    return clientSecret
  }

  const handleStartCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      setShowCheckout(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showCheckout) {
    return (
      <div className="mt-4">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button
        className="w-full"
        size="lg"
        onClick={handleStartCheckout}
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Loading...
          </>
        ) : (
          'Confirm & Pay'
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Secure payment powered by Stripe
      </p>
    </div>
  )
}
