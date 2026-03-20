'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Building2, LogOut, LayoutDashboard, FileText, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface MobileNavProps {
  user: SupabaseUser | null
  profile: {
    user_type: string
    full_name: string | null
    company_name: string | null
  } | null
}

export function MobileNav({ user, profile }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const isContractor = profile?.user_type === 'contractor'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 pt-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">FindBuilders</span>
          </Link>
          
          <nav className="flex flex-col gap-4">
            <Link 
              href="/leads" 
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              Browse Leads
            </Link>
            <Link 
              href="/post-job" 
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              Post a Job
            </Link>
            <Link 
              href="/pricing" 
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/for-contractors" 
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              For Contractors
            </Link>
          </nav>

          <div className="border-t pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {profile?.company_name || profile?.full_name || user.email}
                </div>
                <Link 
                  href={isContractor ? '/dashboard/contractor' : '/dashboard/consumer'}
                  className="flex items-center gap-2 text-foreground"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                {isContractor && (
                  <Link 
                    href="/dashboard/contractor/leads"
                    className="flex items-center gap-2 text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    My Leads
                  </Link>
                )}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login" onClick={() => setOpen(false)}>Log In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up" onClick={() => setOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
