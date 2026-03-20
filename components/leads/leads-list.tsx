import { createClient } from '@/lib/supabase/server'
import { LeadCard } from './lead-card'
import { Empty } from '@/components/ui/empty'
import { FileX } from 'lucide-react'

interface LeadsListProps {
  filters: {
    state?: string
    projectType?: string
    minBudget?: string
    maxBudget?: string
    leadType?: string
  }
  isContractor: boolean
  userId?: string
}

export async function LeadsList({ filters, isContractor, userId }: LeadsListProps) {
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select(`
      *,
      project_type:project_types(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.state) {
    query = query.eq('state', filters.state)
  }

  if (filters.projectType) {
    query = query.eq('project_type.slug', filters.projectType)
  }

  if (filters.minBudget) {
    query = query.gte('budget_max', parseInt(filters.minBudget))
  }

  if (filters.maxBudget) {
    query = query.lte('budget_min', parseInt(filters.maxBudget))
  }

  if (filters.leadType) {
    query = query.eq('lead_type', filters.leadType)
  }

  const { data: leads, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching leads:', error)
    return (
      <Empty
        icon={FileX}
        title="Error loading leads"
        description="There was an error loading leads. Please try again later."
      />
    )
  }

  if (!leads || leads.length === 0) {
    return (
      <Empty
        icon={FileX}
        title="No leads found"
        description="Try adjusting your filters or check back later for new leads."
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}
      </p>
      <div className="grid gap-4">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            isContractor={isContractor}
            userId={userId}
          />
        ))}
      </div>
    </div>
  )
}
