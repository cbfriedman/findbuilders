'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Loader2, User, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserType = 'consumer' | 'contractor'

function SignUpForm() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') as UserType | null

  const [userType, setUserType] = useState<UserType>(initialType || 'consumer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          user_type: userType,
          company_name: userType === 'contractor' ? companyName : null,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Find<span className="text-primary">Builders</span>
          </span>
        </Link>
        <CardTitle className="mt-6 text-2xl">Create an account</CardTitle>
        <CardDescription>
          Get started with FindBuilders today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* User Type Selection */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType('consumer')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              userType === 'consumer'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <User
              className={cn(
                'h-6 w-6',
                userType === 'consumer' ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                userType === 'consumer' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Homeowner
            </span>
            <span className="text-xs text-muted-foreground">Post projects</span>
          </button>
          <button
            type="button"
            onClick={() => setUserType('contractor')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              userType === 'contractor'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <Briefcase
              className={cn(
                'h-6 w-6',
                userType === 'contractor' ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                userType === 'contractor' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Contractor
            </span>
            <span className="text-xs text-muted-foreground">Find leads</span>
          </button>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {userType === 'contractor' && (
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="ABC Construction"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function SignUpFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Find<span className="text-primary">Builders</span>
          </span>
        </div>
        <CardTitle className="mt-6 text-2xl">Create an account</CardTitle>
        <CardDescription>
          Get started with FindBuilders today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <Suspense fallback={<SignUpFormFallback />}>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
