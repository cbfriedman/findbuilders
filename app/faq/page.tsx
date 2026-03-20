import { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site-chrome'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'FAQs | FindBuilders',
  description: 'Frequently asked questions about FindBuilders. Learn how our platform works for homeowners and contractors.',
}

const homeownerFaqs = [
  {
    question: 'Is it free to post a job?',
    answer: 'Yes, posting a job is completely free for homeowners. You can post your project, receive estimates, and compare contractors without any cost or obligation.',
  },
  {
    question: 'How do I receive estimates?',
    answer: 'After posting your job, contractors in your area will review your project details and send you estimates directly through our platform. You\'ll receive email notifications when new estimates arrive.',
  },
  {
    question: 'Am I obligated to hire a contractor?',
    answer: 'No, there\'s no obligation to hire anyone. You can review all estimates, ask questions, and make a decision when you\'re ready. Take your time to find the right fit.',
  },
  {
    question: 'How are contractors verified?',
    answer: 'All contractors on our platform go through a verification process. We check their business information, licensing where applicable, and monitor reviews from previous customers.',
  },
  {
    question: 'What types of projects can I post?',
    answer: 'You can post any home improvement or construction project, including remodeling, repairs, additions, landscaping, electrical work, plumbing, roofing, and more.',
  },
]

const contractorFaqs = [
  {
    question: 'How much does it cost to get leads?',
    answer: 'Lead pricing varies based on job type and location. You can either pay per lead starting from $15, or subscribe to a county for $99/month for unlimited leads in that area.',
  },
  {
    question: 'How do I sign up as a contractor?',
    answer: 'Click "Get Started" and select "Contractor" as your account type. Complete your profile with your services, experience, and service area to start receiving lead notifications.',
  },
  {
    question: 'What information do I get with a lead?',
    answer: 'Each lead includes the homeowner\'s project description, location, timeline, budget range, and contact information so you can reach out directly.',
  },
  {
    question: 'Can I choose which leads to purchase?',
    answer: 'Yes, you can browse all available leads and choose only the ones that match your expertise and availability. Preview lead details before purchasing.',
  },
  {
    question: 'What is a county subscription?',
    answer: 'A county subscription gives you unlimited access to all leads in a specific county for a flat monthly fee. It\'s ideal for contractors who work primarily in one area.',
  },
]

export default function FAQPage() {
  return (
    <SiteChrome>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about FindBuilders
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">For Homeowners</h2>
          <Accordion type="single" collapsible className="mt-6">
            {homeownerFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`homeowner-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">For Contractors</h2>
          <Accordion type="single" collapsible className="mt-6">
            {contractorFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`contractor-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 rounded-lg bg-secondary/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Still have questions?
          </h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re here to help. Reach out to our support team for assistance.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/support">Get Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
    </SiteChrome>
  )
}
