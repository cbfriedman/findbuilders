'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { startLeadPurchaseSession } from '@/app/actions/leads'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface LeadCheckoutProps {
  leadId: string
  leadTitle: string
  leadPrice: number
}

export function LeadCheckout({ leadId, leadTitle, leadPrice }: LeadCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const result = await startLeadPurchaseSession(leadId)
      if (result.error) {
        setError(result.error)
        throw new Error(result.error)
      }
      return result.clientSecret!
    } catch (err) {
      setError('Failed to initialize checkout. Please try again.')
      throw err
    }
  }, [leadId])

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
      <Button onClick={() => setShowCheckout(true)} className="w-full">
        Continue to Payment
      </Button>
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
