import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Users,
  DollarSign,
  MapPin,
  Clock,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Find the Right Contractor.{' '}
                <span className="text-primary">Get the Right Job.</span>
              </h1>
              <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
                Homeowners: Post your project and get quotes from trusted local contractors.
                Contractors: Access qualified leads in your area and grow your business.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/post-job">
                    I Need a Contractor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/leads">I Am a Contractor</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How FindBuilders Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple, transparent, and effective lead generation
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {/* For Homeowners */}
              <Card className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground">
                    For Homeowners
                  </h3>
                  <ul className="mt-6 space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        Post your project details for free
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        Choose between Free Estimate or Quick Connect
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        Review and approve contractors before they contact you
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        Get quotes from qualified local professionals
                      </span>
                    </li>
                  </ul>
                  <Button className="mt-8" asChild>
                    <Link href="/post-job">Post Your Project</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* For Contractors */}
              <Card className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-accent/20" />
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground">
                    For Contractors
                  </h3>
                  <ul className="mt-6 space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent" />
                      <span className="text-muted-foreground">
                        Browse leads in your service area
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent" />
                      <span className="text-muted-foreground">
                        Pay only for leads you want - starting at $35
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent" />
                      <span className="text-muted-foreground">
                        Subscribe to counties for unlimited leads
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent" />
                      <span className="text-muted-foreground">
                        Advertise statewide to boost your visibility
                      </span>
                    </li>
                  </ul>
                  <Button className="mt-8" variant="outline" asChild>
                    <Link href="/contractors">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Lead Types */}
        <section className="bg-secondary/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Two Ways to Connect
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the option that works best for your project
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {/* Free Estimate */}
              <Card className="border-2 border-primary/20 bg-card">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Free Estimate
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Get estimates from multiple contractors with full control
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                      Contractors request to provide estimates
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                      You approve who can contact you
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                      Contractor confirms the appointment
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                      Only then is the lead fee charged
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Quick Connect */}
              <Card className="border-2 border-accent/20 bg-card">
                <CardContent className="p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Quick Connect
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Fast connections for urgent projects
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                      Contractors purchase your lead directly
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                      Instant access to your contact info
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                      Faster response times
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                      Ideal for time-sensitive projects
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-bold text-foreground">
                  5,000+
                </div>
                <div className="mt-2 text-muted-foreground">
                  Verified Contractors
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-bold text-foreground">
                  50
                </div>
                <div className="mt-2 text-muted-foreground">
                  States Covered
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-bold text-foreground">
                  $35
                </div>
                <div className="mt-2 text-muted-foreground">
                  Starting Lead Price
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <Clock className="h-10 w-10 text-primary" />
                </div>
                <div className="mt-4 text-4xl font-bold text-foreground">
                  24hr
                </div>
                <div className="mt-2 text-muted-foreground">
                  Average Response Time
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of homeowners and contractors who trust FindBuilders
                to make the right connections.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="gap-2"
                >
                  <Link href="/post-job">
                    Post Your Project Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/auth/sign-up?type=contractor">
                    Sign Up as Contractor
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
