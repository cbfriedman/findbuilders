'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createCountySubscription } from '@/app/actions/subscriptions'
import { Crown } from 'lucide-react'

interface SubscribeButtonProps {
  countyId: string
  countyName: string
}

export function SubscribeButton({ countyId, countyName }: SubscribeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    const result = await createCountySubscription(countyId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-xs text-destructive">{error}</p>
      )}
      <Button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full gap-2"
      >
        {loading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Crown className="h-4 w-4" />
        )}
        Subscribe
      </Button>
    </div>
  )
}
