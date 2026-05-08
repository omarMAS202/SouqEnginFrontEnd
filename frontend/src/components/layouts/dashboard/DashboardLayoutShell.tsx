'use client'

import { AuthRouteGuard } from '@/features/auth/components/AuthRouteGuard'
import { useLanguage } from '@/features/localization'
import { cn } from '@/utils/cn'

import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopbar } from './DashboardTopbar'

export default function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { direction } = useLanguage()

  return (
    <AuthRouteGuard roles={['store_owner']}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <DashboardTopbar />
        <main className={cn('min-h-screen pt-16', direction === 'rtl' ? 'mr-64' : 'ml-64')}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthRouteGuard>
  )
}
