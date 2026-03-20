'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProjectType, Profile, LeadType } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { Loader2, Shield, Zap, CheckCircle2 } from 'lucide-react'

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

const TIMELINE_OPTIONS = [
  'ASAP / Emergency',
  'Within 1-2 weeks',
  'Within 1 month',
  'Within 2-3 months',
  'Flexible / Planning ahead',
]

interface PostJobFormProps {
  projectTypes: ProjectType[]
  profile: Profile | null
}

export function PostJobForm({ projectTypes, profile }: PostJobFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [leadType, setLeadType] = useState<LeadType>('free_estimate')
  const [projectTypeId, setProjectTypeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [timeline, setTimeline] = useState('')
  const [contactName, setContactName] = useState(profile?.full_name || '')
  const [contactEmail, setContactEmail] = useState(profile?.email || '')
  const [contactPhone, setContactPhone] = useState(profile?.phone || '')

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setError('You must be logged in to post a job')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('leads')
      .insert({
        consumer_id: userData.user.id,
        project_type_id: projectTypeId,
        lead_type: leadType,
        title,
        description,
        address,
        city,
        state,
        zip_code: zipCode,
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        timeline,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/post-job/success?id=${data.id}`)
  }

  const canProceedStep1 = leadType
  const canProceedStep2 = projectTypeId && title && description
  const canProceedStep3 = address && city && state && zipCode
  const canSubmit = contactName && contactEmail && contactPhone

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  'mx-2 h-1 w-12 rounded sm:w-20',
                  step > s ? 'bg-primary' : 'bg-secondary'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Lead Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>How do you want contractors to respond?</CardTitle>
            <CardDescription>
              Choose how contractors will connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLeadType('free_estimate')}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border-2 p-6 text-left transition-colors',
                  leadType === 'free_estimate'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Shield
                  className={cn(
                    'h-8 w-8',
                    leadType === 'free_estimate' ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div>
                  <h3 className="font-semibold text-foreground">Free Estimate</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contractors request to give you an estimate. You approve who can contact you.
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• You control who contacts you</li>
                  <li>• Both parties confirm before connection</li>
                  <li>• Best for most projects</li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => setLeadType('quick_connect')}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border-2 p-6 text-left transition-colors',
                  leadType === 'quick_connect'
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                )}
              >
                <Zap
                  className={cn(
                    'h-8 w-8',
                    leadType === 'quick_connect' ? 'text-accent' : 'text-muted-foreground'
                  )}
                />
                <div>
                  <h3 className="font-semibold text-foreground">Quick Connect</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contractors purchase your lead directly for instant contact.
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Faster responses</li>
                  <li>• Immediate contact info sharing</li>
                  <li>• Best for urgent projects</li>
                </ul>
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your project</CardTitle>
            <CardDescription>
              Provide details to help contractors understand your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Project Type *
              </label>
              <Select value={projectTypeId} onValueChange={setProjectTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Project Title *
              </label>
              <Input
                placeholder="e.g., Kitchen Remodel, New Roof Installation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Project Description *
              </label>
              <Textarea
                placeholder="Describe the work you need done, including any specific requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Budget Min ($)
                </label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Budget Max ($)
                </label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Timeline</label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you need this done?" />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

      {/* Step 3: Location */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Location</CardTitle>
            <CardDescription>
              Where is the work to be done?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Street Address *
              </label>
              <Input
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  City *
                </label>
                <Input
                  placeholder="Austin"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  State *
                </label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.abbr} value={s.abbr}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                ZIP Code *
              </label>
              <Input
                placeholder="78701"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={10}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!canProceedStep3}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Contact Info */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Contact Information</CardTitle>
            <CardDescription>
              How should contractors reach you?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name *
              </label>
              <Input
                placeholder="John Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email *
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
              {leadType === 'free_estimate' ? (
                <p>
                  Your contact information will only be shared with contractors
                  after you approve their estimate request and they confirm the
                  appointment.
                </p>
              ) : (
                <p>
                  Your contact information will be shared immediately with
                  contractors who purchase this lead.
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Project'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
