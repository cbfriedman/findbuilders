import { Metadata } from 'next'
import { SiteChrome } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Terms of Service | FindBuilders',
  description: 'FindBuilders terms of service. Read our terms and conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: March 20, 2026
        </p>

        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-4 text-muted-foreground">
              By accessing or using FindBuilders (&quot;Service&quot;), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p className="mt-4 text-muted-foreground">
              FindBuilders is a platform that connects homeowners with contractors. Homeowners 
              can post projects and receive estimates. Contractors can purchase leads or subscribe 
              to access leads in specific areas.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
            <p className="mt-4 text-muted-foreground">
              To use certain features of the Service, you must create an account. You are 
              responsible for:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">4. For Homeowners</h2>
            <p className="mt-4 text-muted-foreground">
              As a homeowner using our Service, you agree to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide accurate project information</li>
              <li>Respond professionally to contractor inquiries</li>
              <li>Not misuse the platform for non-genuine project requests</li>
              <li>Understand that we do not guarantee contractor quality or work</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">5. For Contractors</h2>
            <p className="mt-4 text-muted-foreground">
              As a contractor using our Service, you agree to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide accurate business and licensing information</li>
              <li>Respond professionally to homeowner inquiries</li>
              <li>Honor estimates provided through the platform</li>
              <li>Maintain appropriate insurance and licenses</li>
              <li>Understand that lead purchases are non-refundable</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">6. Payment Terms</h2>
            <p className="mt-4 text-muted-foreground">
              Lead purchases and subscriptions are processed through our secure payment system. 
              All fees are non-refundable unless otherwise stated. Subscription fees are billed 
              monthly and can be cancelled at any time.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p className="mt-4 text-muted-foreground">
              FindBuilders is a platform that facilitates connections between homeowners and 
              contractors. We do not guarantee the quality of work performed, accuracy of estimates, 
              or outcome of any project. Users are responsible for conducting their own due diligence.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">8. Termination</h2>
            <p className="mt-4 text-muted-foreground">
              We reserve the right to terminate or suspend your account at any time for violation 
              of these terms or for any other reason at our discretion.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">9. Changes to Terms</h2>
            <p className="mt-4 text-muted-foreground">
              We may modify these terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">10. Contact</h2>
            <p className="mt-4 text-muted-foreground">
              For questions about these Terms, please contact us at legal@findbuilders.net
            </p>
          </section>
        </div>
      </div>
    </main>
    </SiteChrome>
  )
}
