'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatCents } from '@/lib/types/database'

interface PurchaseLeadButtonProps {
  leadId: string
  amount: number
}

export function PurchaseLeadButton({ leadId, amount }: PurchaseLeadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/leads/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Spinner className="mr-2" />
            Processing...
          </>
        ) : (
          `Purchase Lead - ${formatCents(amount)}`
        )}
      </Button>
    </div>
  )
}
