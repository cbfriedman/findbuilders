'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ConfirmEstimateCheckoutProps {
  requestId: string
  leadId: string
  leadTitle: string
  leadPrice: number
}

export function ConfirmEstimateCheckout({ 
  requestId, 
  leadId, 
  leadTitle,
  leadPrice 
}: ConfirmEstimateCheckoutProps) {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/create-estimate-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          leadId,
          leadTitle,
          amountCents: leadPrice,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { clientSecret } = await response.json()
      return clientSecret
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }, [requestId, leadId, leadTitle, leadPrice])

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
        <Button 
          onClick={() => { setError(null); setShowCheckout(false); }} 
          variant="outline" 
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!showCheckout) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowCheckout(true)} className="w-full">
          Confirm & Pay
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Secure payment powered by Stripe. You&apos;ll receive the contact info immediately after payment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div id="checkout" className="min-h-[400px]">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
