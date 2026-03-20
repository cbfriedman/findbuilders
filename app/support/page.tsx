import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, FileText, Mail, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Support | FindBuilders',
  description: 'Get help with FindBuilders. Browse our help resources or contact our support team.',
}

const supportOptions = [
  {
    icon: FileText,
    title: 'Help Center',
    description: 'Browse our FAQs and guides to find quick answers to common questions.',
    action: 'View FAQs',
    href: '/faq',
  },
  {
    icon: MessageSquare,
    title: 'Contact Support',
    description: 'Send us a message and our team will get back to you within 24 hours.',
    action: 'Contact Us',
    href: '/contact',
  },
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send an email directly to our support team for assistance.',
    action: 'support@findbuilders.net',
    href: 'mailto:support@findbuilders.net',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak with a support representative during business hours.',
    action: '(555) 123-4567',
    href: 'tel:+15551234567',
  },
]

const quickLinks = [
  { name: 'How to post a job', href: '/how-it-works' },
  { name: 'Pricing information', href: '/pricing' },
  { name: 'For contractors', href: '/contractors' },
  { name: 'Account settings', href: '/settings' },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How Can We Help?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We&apos;re here to help you get the most out of FindBuilders. 
            Choose an option below to get started.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {supportOptions.map((option) => (
            <Card key={option.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{option.description}</CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link href={option.href}>{option.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>
                Jump to commonly accessed pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 rounded-lg bg-secondary/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Business Hours
          </h2>
          <p className="mt-4 text-muted-foreground">
            Monday - Friday: 9:00 AM - 5:00 PM EST<br />
            Saturday - Sunday: Closed
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            For urgent matters outside business hours, please email us and 
            we&apos;ll respond as soon as possible.
          </p>
        </div>
      </div>
    </main>
  )
}
