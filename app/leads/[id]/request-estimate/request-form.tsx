'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { MessageSquare } from 'lucide-react'

interface RequestEstimateFormProps {
  leadId: string
}

export function RequestEstimateForm({ leadId }: RequestEstimateFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Please enter a message to the homeowner')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/leads/request-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      router.push(`/leads/${leadId}/request-estimate/success`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Message to Homeowner</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain why you're a great fit for this project. Include your experience with similar projects and your availability..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This message will be sent to the homeowner along with your contractor profile.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Spinner className="mr-2" />
            Submitting Request...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            Submit Estimate Request
          </>
        )}
      </Button>
    </form>
  )
}
