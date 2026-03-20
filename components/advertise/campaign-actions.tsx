'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Play, Pause, Trash2 } from 'lucide-react'

interface CampaignActionsProps {
  campaignId: string
  status: string
}

export function CampaignActions({ campaignId, status }: CampaignActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(newStatus)

    const { error } = await supabase
      .from('ad_campaigns')
      .update({ status: newStatus })
      .eq('id', campaignId)

    if (!error) {
      router.refresh()
    }

    setLoading(null)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    setLoading('delete')

    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', campaignId)

    if (!error) {
      router.push('/advertise')
    }

    setLoading(null)
  }

  return (
    <div className="flex gap-2">
      {status === 'draft' && (
        <Button
          onClick={() => handleStatusChange('active')}
          disabled={loading !== null}
          className="gap-2"
        >
          {loading === 'active' ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Launch Campaign
        </Button>
      )}

      {status === 'active' && (
        <Button
          variant="outline"
          onClick={() => handleStatusChange('paused')}
          disabled={loading !== null}
          className="gap-2"
        >
          {loading === 'paused' ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          Pause
        </Button>
      )}

      {status === 'paused' && (
        <Button
          onClick={() => handleStatusChange('active')}
          disabled={loading !== null}
          className="gap-2"
        >
          {loading === 'active' ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Resume
        </Button>
      )}

      <Button
        variant="ghost"
        onClick={handleDelete}
        disabled={loading !== null}
        className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        {loading === 'delete' ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Delete
      </Button>
    </div>
  )
}
