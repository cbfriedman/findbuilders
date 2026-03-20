import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/lib/types/database'
import { formatCents, getLeadPrice } from '@/lib/types/database'
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  Zap,
} from 'lucide-react'

interface LeadCardProps {
  lead: Lead
  isContractor: boolean
  userId?: string
}

export function LeadCard({ lead, isContractor, userId }: LeadCardProps) {
  const leadPrice = getLeadPrice(lead.budget_max)
  const isOwnLead = lead.consumer_id === userId

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified'
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
    if (min) return `$${min.toLocaleString()}+`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Budget not specified'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{lead.title}</h3>
              {lead.lead_type === 'free_estimate' ? (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Free Estimate
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-accent text-accent">
                  <Zap className="h-3 w-3" />
                  Quick Connect
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.project_type?.name}
            </p>
          </div>
          {isContractor && !isOwnLead && (
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatCents(leadPrice)}
              </p>
              <p className="text-xs text-muted-foreground">lead fee</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {lead.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>
              {lead.city}, {lead.state}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{formatBudget(lead.budget_min, lead.budget_max)}</span>
          </div>
          {lead.timeline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{lead.timeline}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{getTimeAgo(lead.created_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/leads/${lead.id}`}>View Details</Link>
          </Button>
          {isContractor && !isOwnLead && (
            <>
              {lead.lead_type === 'free_estimate' ? (
                <Button size="sm" asChild>
                  <Link href={`/leads/${lead.id}/request-estimate`}>
                    Request to Estimate
                  </Link>
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href={`/leads/${lead.id}/purchase`}>Purchase Lead</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
