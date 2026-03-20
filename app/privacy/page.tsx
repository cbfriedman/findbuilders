import { Metadata } from 'next'
import { SiteChrome } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Privacy Policy | FindBuilders',
  description: 'FindBuilders privacy policy. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: March 20, 2026
        </p>

        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p className="mt-4 text-muted-foreground">
              FindBuilders (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our website and services.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
            <p className="mt-4 text-muted-foreground">
              We collect information you provide directly to us, including:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Name, email address, and phone number</li>
              <li>Account credentials</li>
              <li>Project details and job postings</li>
              <li>Payment information</li>
              <li>Communications with us and other users</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
            <p className="mt-4 text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide and improve our services</li>
              <li>Connect homeowners with contractors</li>
              <li>Process transactions and send related information</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage trends</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">4. Information Sharing</h2>
            <p className="mt-4 text-muted-foreground">
              We may share your information with:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Contractors when you post a job (project details only)</li>
              <li>Homeowners when you purchase a lead (contact information)</li>
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">5. Data Security</h2>
            <p className="mt-4 text-muted-foreground">
              We implement appropriate technical and organizational measures to protect 
              your personal information against unauthorized access, alteration, disclosure, 
              or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">6. Your Rights</h2>
            <p className="mt-4 text-muted-foreground">
              Depending on your location, you may have the right to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
            <p className="mt-4 text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-4 text-muted-foreground">
              Email: privacy@findbuilders.net<br />
              Address: 123 Builder Street, Suite 100, New York, NY 10001
            </p>
          </section>
        </div>
      </div>
    </main>
    </SiteChrome>
  )
}
