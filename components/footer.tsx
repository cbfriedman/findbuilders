import Link from 'next/link'
import { Building2 } from 'lucide-react'

const footerLinks = {
  forHomeowners: [
    { name: 'Post a Job', href: '/post-job' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Find Contractors', href: '/leads' },
    { name: 'FAQs', href: '/faq' },
  ],
  forContractors: [
    { name: 'Browse Leads', href: '/leads' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Subscriptions', href: '/subscriptions' },
    { name: 'Advertise', href: '/advertise' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Support', href: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Find<span className="text-primary">Builders</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Connecting homeowners with quality contractors. Get free estimates
              or purchase qualified construction leads.
            </p>
          </div>

          {/* For Homeowners */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              For Homeowners
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.forHomeowners.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Contractors */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              For Contractors
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.forContractors.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FindBuilders.net. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
