'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { ProjectType } from '@/lib/types/database'
import { Filter, X } from 'lucide-react'

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
]

interface LeadsFiltersProps {
  projectTypes: ProjectType[]
  currentFilters: {
    state?: string
    projectType?: string
    minBudget?: string
    maxBudget?: string
    leadType?: string
  }
}

export function LeadsFilters({ projectTypes, currentFilters }: LeadsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/leads?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/leads')
  }

  const hasFilters = Object.values(currentFilters).some(Boolean)

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* State Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">State</label>
          <Select
            value={currentFilters.state || ''}
            onValueChange={(value) => updateFilter('state', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All states</SelectItem>
              {US_STATES.map((state) => (
                <SelectItem key={state.abbr} value={state.abbr}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Project Type
          </label>
          <Select
            value={currentFilters.projectType || ''}
            onValueChange={(value) => updateFilter('projectType', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {projectTypes.map((type) => (
                <SelectItem key={type.id} value={type.slug}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lead Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Lead Type</label>
          <Select
            value={currentFilters.leadType || ''}
            onValueChange={(value) => updateFilter('leadType', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="free_estimate">Free Estimate</SelectItem>
              <SelectItem value="quick_connect">Quick Connect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Budget Range
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilters.minBudget || ''}
              onChange={(e) => updateFilter('minBudget', e.target.value || null)}
              className="h-9"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={currentFilters.maxBudget || ''}
              onChange={(e) => updateFilter('maxBudget', e.target.value || null)}
              className="h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
