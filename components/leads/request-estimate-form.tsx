'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { requestEstimate } from '@/app/actions/leads'

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
    setLoading(true)
    setError(null)

    try {
      const result = await requestEstimate(leadId, message)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.push(`/leads/${leadId}?requested=true`)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="message">
            Message to Homeowner (Optional)
          </FieldLabel>
          <Textarea
            id="message"
            placeholder="Introduce yourself and explain why you're a good fit for this project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            A personalized message can help you stand out from other contractors
          </p>
        </Field>
      </FieldGroup>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Submitting Request...
          </>
        ) : (
          'Submit Estimate Request'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you agree to our terms of service and understand that
        you&apos;ll be charged the lead fee only if both parties confirm.
      </p>
    </form>
  )
}
