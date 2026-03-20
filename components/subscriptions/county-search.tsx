'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Search, MapPin, CheckCircle2 } from 'lucide-react'

interface County {
  id: string
  name: string
  state: string
  state_abbr: string
}

interface CountySearchProps {
  counties: County[]
  activeSubscriptionIds: string[]
  priceMonthly: number
}

export function CountySearch({
  counties,
  activeSubscriptionIds,
  priceMonthly,
}: CountySearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredCounties = useMemo(() => {
    if (!query.trim()) return []
    const searchTerm = query.toLowerCase()
    return counties
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm) ||
          c.state.toLowerCase().includes(searchTerm) ||
          c.state_abbr.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
  }, [query, counties])

  const handleSubscribe = async (countyId: string) => {
    setLoading(countyId)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countyId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create subscription')
      }

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by county name or state..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCounties.length > 0 && (
        <div className="space-y-2">
          {filteredCounties.map((county) => {
            const isSubscribed = activeSubscriptionIds.includes(county.id)
            return (
              <div
                key={county.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {county.name} County
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {county.state}
                    </p>
                  </div>
                </div>
                {isSubscribed ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Subscribed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSubscribe(county.id)}
                    disabled={loading !== null}
                  >
                    {loading === county.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      `$${(priceMonthly / 100).toFixed(2)}/mo`
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {query.trim() && filteredCounties.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No counties found matching &quot;{query}&quot;
        </p>
      )}

      {!query.trim() && (
        <p className="text-center text-sm text-muted-foreground">
          Enter a county name or state to search
        </p>
      )}
    </div>
  )
}
