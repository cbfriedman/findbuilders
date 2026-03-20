import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/types/database'
import { CountyManager } from '@/components/admin/county-manager'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'County Management',
  description: 'Manage counties and subscription pricing',
}

export default async function AdminCountiesPage() {
  const supabase = await createClient()

  const { data: counties } = await supabase
    .from('counties')
    .select('*')
    .order('state')
    .order('name')

  // Get subscription counts per county
  const { data: subscriptionCounts } = await supabase
    .from('county_subscriptions')
    .select('county_id')
    .in('status', ['active', 'past_due'])

  const countByCounty: Record<string, number> = {}
  subscriptionCounts?.forEach((sub) => {
    countByCounty[sub.county_id] = (countByCounty[sub.county_id] || 0) + 1
  })

  // Group by state
  const countiesByState: Record<string, typeof counties> = {}
  counties?.forEach((county) => {
    if (!countiesByState[county.state]) {
      countiesByState[county.state] = []
    }
    countiesByState[county.state].push({
      ...county,
      subscription_count: countByCounty[county.id] || 0,
    })
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">County Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage counties and their subscription pricing
          </p>
        </div>
        <CountyManager />
      </div>

      <div className="space-y-8">
        {Object.entries(countiesByState).map(([state, stateCounties]) => (
          <Card key={state}>
            <CardHeader>
              <CardTitle>{state}</CardTitle>
              <CardDescription>{stateCounties?.length} counties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                        County
                      </th>
                      <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                        Population
                      </th>
                      <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                        Price/Month
                      </th>
                      <th className="pb-3 pr-4 text-sm font-medium text-muted-foreground">
                        Subscribers
                      </th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateCounties?.map((county) => (
                      <tr key={county.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <span className="font-medium text-foreground">
                            {county.name}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {county.population.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {formatCents(county.subscription_price_cents)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary">
                            {county.subscription_count} active
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!counties || counties.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No counties configured yet</p>
              <CountyManager />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
