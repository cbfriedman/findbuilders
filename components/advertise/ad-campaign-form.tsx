'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdType, ProjectType } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { Loader2, Plus, Trash2, FlaskConical, Building2, Package, Megaphone } from 'lucide-react'

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

interface AdVariant {
  id: string
  headline: string
  description: string
  isControl: boolean
}

interface AdCampaignFormProps {
  adType: AdType
  projectTypes: ProjectType[]
  userId: string
}

export function AdCampaignForm({ adType, projectTypes, userId }: AdCampaignFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  // Form state
  const [name, setName] = useState('')
  const [clickUrl, setClickUrl] = useState('')
  const [targetStates, setTargetStates] = useState<string[]>([])
  const [targetProjectTypes, setTargetProjectTypes] = useState<string[]>([])
  const [cpcCents, setCpcCents] = useState('50')
  const [monthlyBudgetCents, setMonthlyBudgetCents] = useState('20000')
  
  // A/B Test Variants
  const [variants, setVariants] = useState<AdVariant[]>([
    { id: '1', headline: '', description: '', isControl: true },
  ])

  const adTypeInfo = {
    contractor_statewide: {
      icon: Building2,
      title: 'Contractor Statewide Ad',
      description: 'Feature your contracting business across selected states',
    },
    vendor_tile: {
      icon: Package,
      title: 'Vendor Tile Ad',
      description: 'Tile-style display ad for product promotion',
    },
    vendor_banner: {
      icon: Megaphone,
      title: 'Vendor Banner Ad',
      description: 'High-visibility banner placement',
    },
  }

  const info = adTypeInfo[adType] || adTypeInfo.contractor_statewide

  const addVariant = () => {
    if (variants.length >= 4) return
    setVariants([
      ...variants,
      {
        id: String(Date.now()),
        headline: '',
        description: '',
        isControl: false,
      },
    ])
  }

  const removeVariant = (id: string) => {
    if (variants.length <= 1) return
    const newVariants = variants.filter((v) => v.id !== id)
    // Ensure at least one control
    if (!newVariants.some((v) => v.isControl)) {
      newVariants[0].isControl = true
    }
    setVariants(newVariants)
  }

  const updateVariant = (id: string, field: keyof AdVariant, value: string | boolean) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    )
  }

  const setControlVariant = (id: string) => {
    setVariants(
      variants.map((v) => ({
        ...v,
        isControl: v.id === id,
      }))
    )
  }

  const toggleState = (state: string) => {
    setTargetStates((prev) =>
      prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state]
    )
  }

  const toggleProjectType = (typeId: string) => {
    setTargetProjectTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    // Validate
    if (!name || !clickUrl) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (variants.some((v) => !v.headline || !v.description)) {
      setError('All ad variants must have a headline and description')
      setLoading(false)
      return
    }

    try {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('ad_campaigns')
        .insert({
          advertiser_id: userId,
          name,
          ad_type: adType,
          click_url: clickUrl,
          target_states: targetStates.length > 0 ? targetStates : null,
          target_project_types: targetProjectTypes.length > 0 ? targetProjectTypes : null,
          cpc_cents: parseInt(cpcCents),
          monthly_budget_cents: parseInt(monthlyBudgetCents),
          headline: variants[0].headline,
          description: variants[0].description,
          status: 'draft',
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Create variants if A/B testing
      if (variants.length > 1) {
        const variantData = variants.map((v) => ({
          campaign_id: campaign.id,
          variant_name: v.isControl ? 'Control' : `Variant ${variants.indexOf(v)}`,
          headline: v.headline,
          description: v.description,
          is_control: v.isControl,
        }))

        const { error: variantsError } = await supabase
          .from('ad_variants')
          .insert(variantData)

        if (variantsError) throw variantsError
      }

      router.push(`/advertise/campaigns/${campaign.id}`)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError('Failed to create campaign')
      setLoading(false)
    }
  }

  const canProceedStep1 = name && clickUrl
  const canProceedStep2 = variants.every((v) => v.headline && v.description)
  const canSubmit = canProceedStep1 && canProceedStep2

  return (
    <div className="space-y-6">
      {/* Ad Type Header */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <info.icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{info.title}</h2>
            <p className="text-muted-foreground">{info.description}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Campaign Name *
              </label>
              <Input
                placeholder="e.g., Summer Kitchen Remodel Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Click-through URL *
              </label>
              <Input
                type="url"
                placeholder="https://yourwebsite.com/landing-page"
                value={clickUrl}
                onChange={(e) => setClickUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Where users will go when they click your ad
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cost Per Click (cents)
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={cpcCents}
                  onChange={(e) => setCpcCents(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ${(parseInt(cpcCents) / 100).toFixed(2)} per click
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Monthly Budget (cents)
                </label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={monthlyBudgetCents}
                  onChange={(e) => setMonthlyBudgetCents(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ${(parseInt(monthlyBudgetCents) / 100).toFixed(2)} per month
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Ad Creative & A/B Testing */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Ad Creative & A/B Testing
                </CardTitle>
                <CardDescription>
                  Create multiple variations to test which performs best
                </CardDescription>
              </div>
              {variants.length < 4 && (
                <Button variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className={cn(
                  'rounded-lg border p-4',
                  variant.isControl ? 'border-primary bg-primary/5' : ''
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {variant.isControl ? 'Control' : `Variant ${index}`}
                    </h4>
                    {variant.isControl && (
                      <Badge variant="default">Control</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!variant.isControl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setControlVariant(variant.id)}
                      >
                        Set as Control
                      </Button>
                    )}
                    {variants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Headline *
                    </label>
                    <Input
                      placeholder="Your attention-grabbing headline"
                      value={variant.headline}
                      onChange={(e) =>
                        updateVariant(variant.id, 'headline', e.target.value)
                      }
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {variant.headline.length}/60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description *
                    </label>
                    <Textarea
                      placeholder="Brief description of your offering"
                      value={variant.description}
                      onChange={(e) =>
                        updateVariant(variant.id, 'description', e.target.value)
                      }
                      rows={3}
                      maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground">
                      {variant.description.length}/150 characters
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Targeting */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
            <CardDescription>
              Choose where and when your ad appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* State Targeting */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Target States (optional)
              </label>
              <p className="text-sm text-muted-foreground">
                Leave empty to target all states
              </p>
              <div className="flex flex-wrap gap-2">
                {US_STATES.map((state) => (
                  <button
                    key={state.abbr}
                    type="button"
                    onClick={() => toggleState(state.abbr)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm transition-colors',
                      targetStates.includes(state.abbr)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {state.abbr}
                  </button>
                ))}
              </div>
              {targetStates.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {targetStates.join(', ')}
                </p>
              )}
            </div>

            {/* Project Type Targeting */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Target Project Types (optional)
              </label>
              <p className="text-sm text-muted-foreground">
                Leave empty to show on all project types
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {projectTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50"
                  >
                    <Checkbox
                      checked={targetProjectTypes.includes(type.id)}
                      onCheckedChange={() => toggleProjectType(type.id)}
                    />
                    <span className="text-sm text-foreground">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
