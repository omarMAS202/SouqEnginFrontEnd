'use client'

import { Loader2 } from 'lucide-react'

import { useLanguage } from '@/features/localization'
import type { UserRole } from '@/types/models'

import { useRequireAuth } from '../hooks/useAuth'

export function AuthRouteGuard({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { language } = useLanguage()
  const { hydrated, isAuthenticated, user } = useRequireAuth(roles)

  if (!hydrated || !isAuthenticated || (roles?.length && (!user || !roles.includes(user.role)))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{language === 'ar' ? 'جارٍ تجهيز مساحة العمل...' : 'Loading your workspace...'}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
