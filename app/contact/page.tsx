import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site-chrome'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact FindBuilders for questions about our platform.',
}

export default function ContactPage() {
  return (
    <SiteChrome>
      <ContactForm />
    </SiteChrome>
  )
}
