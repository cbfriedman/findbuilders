import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ChatInterface } from '@/components/chat/chat-interface'

export const metadata = {
  title: 'AI Assistant',
  description: 'Get instant answers to your construction and home improvement questions',
}

export default async function ChatPage() {
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
      <main className="flex-1 bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Construction AI Assistant
            </h1>
            <p className="mt-2 text-muted-foreground">
              Get instant answers to your construction and home improvement questions
            </p>
          </div>

          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  )
}
