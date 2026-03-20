import { Metadata } from 'next'
import { SiteChrome } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Cookie Policy | FindBuilders',
  description: 'FindBuilders cookie policy. Learn how we use cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Cookie Policy
        </h1>
        <p className="mt-4 text-muted-foreground">
          Last updated: March 20, 2026
        </p>

        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">What Are Cookies?</h2>
            <p className="mt-4 text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information 
              to website owners.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">How We Use Cookies</h2>
            <p className="mt-4 text-muted-foreground">
              FindBuilders uses cookies for the following purposes:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including user authentication and security.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website so we can improve it.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">Types of Cookies We Use</h2>
            
            <h3 className="mt-6 text-lg font-semibold text-foreground">Essential Cookies</h3>
            <p className="mt-2 text-muted-foreground">
              These cookies are necessary for the website to function and cannot be switched off. 
              They include cookies for authentication, security, and accessibility features.
            </p>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Performance Cookies</h3>
            <p className="mt-2 text-muted-foreground">
              These cookies allow us to count visits and traffic sources so we can measure and 
              improve our site&apos;s performance. All information these cookies collect is aggregated 
              and anonymous.
            </p>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Functional Cookies</h3>
            <p className="mt-2 text-muted-foreground">
              These cookies enable enhanced functionality and personalization, such as remembering 
              your login information and preferred language settings.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">Third-Party Cookies</h2>
            <p className="mt-4 text-muted-foreground">
              We may use third-party services that set their own cookies, including:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Google Analytics for website analytics</li>
              <li>Payment processors for secure transactions</li>
              <li>Social media platforms for sharing features</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">Managing Cookies</h2>
            <p className="mt-4 text-muted-foreground">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>View what cookies are stored on your device</li>
              <li>Delete all or specific cookies</li>
              <li>Block cookies from being set</li>
              <li>Set preferences for certain websites</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Please note that blocking or deleting cookies may impact your experience on our 
              website and limit functionality.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">Updates to This Policy</h2>
            <p className="mt-4 text-muted-foreground">
              We may update this Cookie Policy from time to time. Any changes will be posted on 
              this page with an updated revision date.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="mt-4 text-muted-foreground">
              If you have questions about our use of cookies, please contact us at 
              privacy@findbuilders.net
            </p>
          </section>
        </div>
      </div>
    </main>
    </SiteChrome>
  )
}
